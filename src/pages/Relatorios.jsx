import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, FileIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card from '../components/Card';
import Button from '../components/Button';
import EchartsContainer from '../components/EchartsContainer';
import * as XLSX from 'xlsx';
import { downloadBlob } from '../utils/download';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import dayjs from 'dayjs';

import api from '../services/api';

export default function Relatorios() {
  const [activeTab, setActiveTab] = useState('summary');
  const [isLoading, setIsLoading] = useState(true);
  const [scatterData, setScatterData] = useState([]);
  const [candlestickData, setCandlestickData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await api.get('reports/');
      setScatterData(response.data.scatterData || []);
      setCandlestickData(response.data.candlestickData || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Erro ao carregar dados do relatório.');
      setScatterData([]);
      setCandlestickData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportExcel = async () => {
    try {
      toast.loading('Gerando planilha Excel...', { id: 'export_excel' });
      const [transRes, catRes, accRes] = await Promise.all([
        api.get('transactions/'),
        api.get('categories/'),
        api.get('accounts/')
      ]);

      const transactions = transRes.data;
      const categories = catRes.data;
      const accounts = accRes.data;

      const wb = XLSX.utils.book_new();

      // Receitas
      const receitas = transactions.filter(t => t.type === 'INCOME').map(t => ({
        Data: dayjs(t.date).format('DD/MM/YYYY'),
        Descrição: t.description,
        Valor: Number(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        Status: t.status === 'paid' ? 'Liquidado' : 'Pendente',
        Categoria: categories.find(c => c.id === t.category_id)?.name || '-',
        Conta: accounts.find(a => a.id === t.account_id)?.name || '-'
      }));
      const wsReceitas = XLSX.utils.json_to_sheet(receitas);
      XLSX.utils.book_append_sheet(wb, wsReceitas, 'Receitas');

      // Despesas
      const despesas = transactions.filter(t => t.type === 'EXPENSE').map(t => ({
        Data: dayjs(t.date).format('DD/MM/YYYY'),
        Descrição: t.description,
        Valor: Number(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        Status: t.status === 'paid' ? 'Liquidado' : 'Pendente',
        Categoria: categories.find(c => c.id === t.category_id)?.name || '-',
        Conta: accounts.find(a => a.id === t.account_id)?.name || '-'
      }));
      const wsDespesas = XLSX.utils.json_to_sheet(despesas);
      XLSX.utils.book_append_sheet(wb, wsDespesas, 'Despesas');

      // Categorias
      const wsCategories = XLSX.utils.json_to_sheet(categories.map(c => ({
        ID: c.id,
        Nome: c.name,
        Tipo: c.type === 'INCOME' ? 'Receita' : 'Despesa',
        Limite: c.limit ? Number(c.limit).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'
      })));
      XLSX.utils.book_append_sheet(wb, wsCategories, 'Categorias');

      // Contas
      const wsContas = XLSX.utils.json_to_sheet(accounts.map(a => ({
        ID: a.id,
        Nome: a.name,
        Tipo: a.type,
        Saldo: Number(a.balance).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      })));
      XLSX.utils.book_append_sheet(wb, wsContas, 'Contas');

      // Resumo
      const totalReceitas = transactions.filter(t => t.type === 'INCOME' && t.status === 'paid').reduce((acc, t) => acc + Number(t.amount), 0);
      const totalDespesas = transactions.filter(t => t.type === 'EXPENSE' && t.status === 'paid').reduce((acc, t) => acc + Number(t.amount), 0);
      const wsResumo = XLSX.utils.json_to_sheet([
        { Item: 'Total Receitas (Liquidadas)', Valor: totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
        { Item: 'Total Despesas (Liquidadas)', Valor: totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
        { Item: 'Saldo Período', Valor: (totalReceitas - totalDespesas).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
        { Item: 'Data da Geração', Valor: dayjs().format('DD/MM/YYYY HH:mm:ss') }
      ]);
      XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo Geral');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      
      const fileName = `Relatorio_Financeiro_${dayjs().format('YYYY-MM-DD')}.xlsx`;
      downloadBlob(data, fileName);
      
      toast.dismiss('export_excel');
      toast.success('Relatório exportado em Excel!', { id: 'export_excel' });
    } catch (error) {
      console.error('Erro na exportação Excel:', error);
      toast.dismiss('export_excel');
      toast.error('Erro ao gerar Excel.', { id: 'export_excel' });
    }
  };

  const handleExportPDF = async () => {
    try {
      toast.loading('Gerando relatório PDF...', { id: 'export_pdf' });
      const [transRes, catRes, accRes] = await Promise.all([
        api.get('transactions/'),
        api.get('categories/'),
        api.get('accounts/')
      ]);

      const transactions = transRes.data;
      const categories = catRes.data;

      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('Flow Finance - Relatorio Financeiro', 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Data de Geracao: ${dayjs().format('DD/MM/YYYY HH:mm')}`, 14, 30);

      const totalReceitas = transactions.filter(t => t.type === 'INCOME' && t.status === 'paid').reduce((acc, t) => acc + Number(t.amount), 0);
      const totalDespesas = transactions.filter(t => t.type === 'EXPENSE' && t.status === 'paid').reduce((acc, t) => acc + Number(t.amount), 0);
      const saldo = totalReceitas - totalDespesas;

      // Resumo Financeiro
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Resumo Financeiro', 14, 45);
      
      autoTable(doc, {
        startY: 50,
        head: [['Metrica', 'Valor']],
        body: [
          ['Total de Receitas Liquidadas', totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
          ['Total de Despesas Liquidadas', totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
          ['Saldo do Periodo', saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })]
        ],
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] }
      });

      // Tabela de Receitas
      doc.text('Receitas', 14, doc.lastAutoTable.finalY + 15);
      const receitas = transactions.filter(t => t.type === 'INCOME').map(t => [
        dayjs(t.date).format('DD/MM/YYYY'),
        t.description,
        categories.find(c => c.id === t.category_id)?.name || '-',
        t.status === 'paid' ? 'Liquidado' : 'Pendente',
        Number(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Data', 'Descricao', 'Categoria', 'Status', 'Valor']],
        body: receitas,
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94] }
      });

      // Tabela de Despesas
      doc.text('Despesas', 14, doc.lastAutoTable.finalY + 15);
      const despesas = transactions.filter(t => t.type === 'EXPENSE').map(t => [
        dayjs(t.date).format('DD/MM/YYYY'),
        t.description,
        categories.find(c => c.id === t.category_id)?.name || '-',
        t.status === 'paid' ? 'Liquidado' : 'Pendente',
        Number(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Data', 'Descricao', 'Categoria', 'Status', 'Valor']],
        body: despesas,
        theme: 'striped',
        headStyles: { fillColor: [239, 68, 68] }
      });

      // Capturar Gráficos
      const chartsContainer = document.getElementById('relatorios-charts-content');
      if (chartsContainer) {
        const canvas = await html2canvas(chartsContainer, { scale: 1.5, useCORS: true });
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        doc.addPage();
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text('Análise Gráfica', 14, 20);
        
        // Ajustar largura e altura proporcional ao A4 (largura 210)
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth() - 28;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        doc.addImage(imgData, 'JPEG', 14, 30, pdfWidth, pdfHeight);
      }

      // Rodapé
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Pagina ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }

      const fileName = `Relatorio_Financeiro_${dayjs().format('YYYY-MM-DD')}.pdf`;
      const blob = new Blob([doc.output('blob')], { type: 'application/pdf' });
      downloadBlob(blob, fileName);
      
      toast.dismiss('export_pdf');
      toast.success('Relatório exportado em PDF!', { id: 'export_pdf' });
    } catch (error) {
      console.error('Erro na exportação PDF:', error);
      toast.dismiss('export_pdf');
      toast.error('Erro ao gerar PDF.', { id: 'export_pdf' });
    }
  };

  // 1. Radar Option (Budget Compliance)
  const radarOption = {
    legend: {
      data: ['Orçado', 'Realizado'],
      bottom: 0,
      textStyle: { color: '#A1A1AA' }
    },
    radar: {
      indicator: [
        { name: 'Marketing', max: 50000 },
        { name: 'Nuvem/Infra', max: 50000 },
        { name: 'Salários', max: 150000 },
        { name: 'Escritório', max: 20000 },
        { name: 'Viagens', max: 20000 },
        { name: 'Seguros', max: 10000 }
      ],
      axisName: {
        color: '#A1A1AA',
        fontSize: 10
      },
      splitArea: { show: false }
    },
    series: [
      {
        name: 'Comparação de Gastos',
        type: 'radar',
        data: [
          {
            value: [30000, 50000, 120000, 10000, 15000, 8000],
            name: 'Orçado',
            itemStyle: { color: '#8B5CF6' }
          },
          {
            value: [18500, 47250, 98400, 6200, 4800, 250],
            name: 'Realizado',
            itemStyle: { color: '#22C55E' }
          }
        ]
      }
    ]
  };

  // 2. Scatter Option (Transaction spread)
  const scatterOption = {
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#27272A' } },
      splitLine: { lineStyle: { color: '#27272A' } }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#27272A' } },
      splitLine: { lineStyle: { color: '#27272A' } }
    },
    series: [
      {
        symbolSize: 12,
        data: scatterData,
        type: 'scatter',
        itemStyle: {
          color: '#3B82F6',
          shadowBlur: 10,
          shadowColor: '#3B82F650'
        }
      }
    ]
  };

  // 3. Treemap Option (Budget Tree)
  const treemapOption = {
    series: [
      {
        type: 'treemap',
        levels: [
          {
            itemStyle: {
              borderColor: '#202024',
              borderWidth: 2,
              gapWidth: 2
            }
          }
        ],
        data: [
          {
            name: 'Operacional',
            value: 200000,
            children: [
              { name: 'Nuvem AWS', value: 50000, itemStyle: { color: '#8B5CF6' } },
              { name: 'Coworking Wework', value: 10000, itemStyle: { color: '#8B5CF6' } },
              { name: 'Marketing Ads', value: 30000, itemStyle: { color: '#8B5CF6' } }
            ]
          },
          {
            name: 'Folha Pagamento',
            value: 120000,
            children: [
              { name: 'Contratações CLT', value: 98400, itemStyle: { color: '#3B82F6' } },
              { name: 'Terceirizados', value: 21600, itemStyle: { color: '#3B82F6' } }
            ]
          },
          {
            name: 'Viagens & Eventos',
            value: 23000,
            itemStyle: { color: '#FACC15' }
          }
        ]
      }
    ]
  };

  // 4. Sunburst Option
  const sunburstOption = {
    series: {
      type: 'sunburst',
      data: [
        {
          name: 'Receitas',
          itemStyle: { color: '#22C55E' },
          children: [
            { name: 'Assinaturas', value: 48900 },
            { name: 'Consultoria', value: 15000 },
            { name: 'Dividendos', value: 3450 }
          ]
        },
        {
          name: 'Despesas',
          itemStyle: { color: '#EF4444' },
          children: [
            { name: 'Marketing', value: 18500 },
            { name: 'Cloud/Infra', value: 47500 },
            { name: 'Viagens', value: 4800 }
          ]
        }
      ],
      radius: [0, '90%'],
      label: { rotate: 'radial', fontSize: 10, color: '#09090B', fontWeight: 'bold' }
    }
  };

  // 5. Heatmap Option (Activities by Hour vs Day)
  const hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'];
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  
  // Simulated heatmap data: [day, hour, value]
  const heatmapData = [
    [0, 8, 12], [0, 10, 18], [0, 14, 25], [1, 9, 32], [1, 15, 14], [2, 11, 45],
    [3, 14, 52], [4, 10, 15], [4, 16, 28], [5, 18, 5], [6, 12, 2]
  ];

  const heatmapOption = {
    tooltip: { position: 'top' },
    grid: { height: '70%', top: '10%' },
    xAxis: {
      type: 'category',
      data: days,
      splitArea: { show: true },
      axisLine: { lineStyle: { color: '#27272A' } }
    },
    yAxis: {
      type: 'category',
      data: hours,
      splitArea: { show: true },
      axisLine: { lineStyle: { color: '#27272A' } }
    },
    visualMap: {
      min: 0,
      max: 60,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: {
        color: ['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.8)']
      }
    },
    series: [
      {
        name: 'Transações',
        type: 'heatmap',
        data: heatmapData,
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  // 6. Candlestick Option
  const candlestickOption = {
    xAxis: {
      type: 'category',
      data: candlestickData.map(item => item[0]),
      axisLine: { lineStyle: { color: '#27272A' } }
    },
    yAxis: {
      scale: true,
      axisLine: { lineStyle: { color: '#27272A' } },
      splitLine: { lineStyle: { color: '#27272A', type: 'dashed' } }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        show: true,
        type: 'slider',
        top: '90%',
        start: 0,
        end: 100,
        borderColor: '#27272A',
        textStyle: { color: '#A1A1AA' }
      }
    ],
    series: [
      {
        type: 'candlestick',
        data: candlestickData.map(item => [item[1], item[2], item[3], item[4]]),
        itemStyle: {
          color: '#22C55E',
          color0: '#EF4444',
          borderColor: '#22C55E',
          borderColor0: '#EF4444'
        }
      }
    ]
  };

  const tabs = [
    { id: 'summary', label: 'Resumo Executivo' },
    { id: 'structures', label: 'Estruturas' },
    { id: 'activity', label: 'Atividade' },
    { id: 'market', label: 'Mercado' }
  ];

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-custom pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold font-sora tracking-tight text-gradient-purple-blue">
            Central de Relatórios
          </h1>
          <p className="text-sm text-text-secondary">
            Relatórios e auditoria com distribuições gráficas complexas e índices simulados.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" icon={FileSpreadsheet} onClick={handleExportExcel}>
            Exportar Excel
          </Button>
          <Button icon={FileIcon} onClick={handleExportPDF}>
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border-custom pb-px w-full overflow-x-auto font-manrope">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer focus:outline-none ${
              activeTab === t.id
                ? 'border-brand-purple text-text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Reports content based on active tab */}
      <div id="relatorios-charts-content" className="mt-2">
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="flex flex-col gap-4">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold font-sora text-text-primary">Orcamento vs Consumido (Radar)</h3>
                <span className="text-xs text-text-secondary">Alinhamento de centros de custo</span>
              </div>
              <EchartsContainer option={radarOption} isLoading={isLoading} className="h-80" />
            </Card>

            <Card className="flex flex-col gap-4">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold font-sora text-text-primary">Distribuição de Lançamentos (Scatter)</h3>
                <span className="text-xs text-text-secondary">Frequência por magnitude e data</span>
              </div>
              <EchartsContainer option={scatterOption} isLoading={isLoading} className="h-80" />
            </Card>
          </div>
        )}

        {activeTab === 'structures' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="flex flex-col gap-4">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold font-sora text-text-primary">Distribuição Hierárquica (Treemap)</h3>
                <span className="text-xs text-text-secondary">Visualização em blocos proporcionais</span>
              </div>
              <EchartsContainer option={treemapOption} isLoading={isLoading} className="h-80" />
            </Card>

            <Card className="flex flex-col gap-4">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold font-sora text-text-primary">Distribuição Aninhada (Sunburst)</h3>
                <span className="text-xs text-text-secondary">Composição circular de receitas e despesas</span>
              </div>
              <EchartsContainer option={sunburstOption} isLoading={isLoading} className="h-80" />
            </Card>
          </div>
        )}

        {activeTab === 'activity' && (
          <Card className="flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-bold font-sora text-text-primary">Densidade de Saídas Semanais (Heatmap)</h3>
              <span className="text-xs text-text-secondary">Volume operacional por dia e hora de atividade</span>
            </div>
            <EchartsContainer option={heatmapOption} isLoading={isLoading} className="h-96" />
          </Card>
        )}

        {activeTab === 'market' && (
          <Card className="flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-bold font-sora text-text-primary">Índice Cambial Corporativo (Candlestick)</h3>
              <span className="text-xs text-text-secondary">Preço médio de ativos hedge vinculados</span>
            </div>
            <EchartsContainer option={candlestickOption} isLoading={isLoading} className="h-96" />
          </Card>
        )}
      </div>

    </div>
  );
}
