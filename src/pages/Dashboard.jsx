import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCommandPalette } from '../contexts/CommandPaletteContext';
import StatsCard from '../components/StatsCard';
import EchartsContainer from '../components/EchartsContainer';
import Button from '../components/Button';
import Card from '../components/Card';
import api from '../services/api';

export default function Dashboard() {
  const { openPalette } = useCommandPalette();
  const [isLoading, setIsLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [categories, setCategories] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, catRes] = await Promise.all([
        api.get('dashboard/'),
        api.get('categories/')
      ]);
      setKpis(dashRes.data.kpis);
      setPerformance(dashRes.data.performance);
      
      const mappedCats = catRes.data.map(c => ({
        id: c.id,
        name: c.nome || c.name,
        type: c.tipo === 'DESPESA' ? 'expense' : c.tipo === 'RECEITA' ? 'revenue' : (c.type || 'expense'),
        limit: c.limite !== undefined && c.limite !== null ? Number(c.limite) : (c.limit || 0),
        color: c.cor || c.color,
        icon: c.icone || c.icon || 'folder'
      }));
      setCategories(mappedCats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erro ao carregar dados do painel.');
      // Empty data on error
      setKpis(null);
      setPerformance([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatBRL = (val) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchDashboardData();
    toast.success('Painel financeiro atualizado com sucesso.');
  };

  // ECharts 1: Area Chart (Receitas x Despesas)
  const areaChartOption = {
    color: ['#22C55E', '#EF4444'],
    legend: {
      data: ['Receitas', 'Despesas'],
      right: '10%',
      top: '0%',
      textStyle: { color: '#A1A1AA', fontSize: 11 }
    },
    xAxis: {
      type: 'category',
      data: performance.map(p => p.month),
      axisLine: { lineStyle: { color: '#27272A' } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#27272A', type: 'dashed' } },
      axisLabel: {
        formatter: (val) => `R$ ${(val / 1000).toFixed(0)}k`
      }
    },
    series: [
      {
        name: 'Receitas',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(34, 197, 94, 0.25)' },
              { offset: 1, color: 'rgba(34, 197, 94, 0.0)' }
            ]
          }
        },
        data: performance.map(p => p.receitas)
      },
      {
        name: 'Despesas',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(239, 68, 68, 0.25)' },
              { offset: 1, color: 'rgba(239, 68, 68, 0.0)' }
            ]
          }
        },
        data: performance.map(p => p.despesas)
      }
    ]
  };

  // ECharts 2: Donut Chart (Categorias)
  const donutChartOption = {
    color: ['#3B82F6', '#8B5CF6', '#FACC15', '#EF4444', '#22C55E', '#A1A1AA'],
    legend: {
      orient: 'vertical',
      right: '2%',
      top: 'center',
      textStyle: { color: '#A1A1AA', fontSize: 10 },
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      {
        name: 'Despesas',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#09090B',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold',
            formatter: '{b}\n{d}%',
            color: '#FAFAFA'
          }
        },
        labelLine: {
          show: false
        },
        data: categories
          .filter(c => c.type === 'expense')
          .slice(0, 5)
          .map(c => ({
            name: c.name,
            value: c.limit
          }))
      }
    ]
  };

  // ECharts 3: Gauge (Meta)
  const gaugeChartOption = {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        center: ['50%', '75%'],
        radius: '90%',
        min: 0,
        max: 100,
        itemStyle: {
          color: '#8B5CF6',
        },
        progress: {
          show: true,
          width: 8,
          roundCap: true
        },
        pointer: {
          show: false
        },
        axisLine: {
          lineStyle: {
            width: 8,
            color: [[1, '#27272A']]
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          show: false
        },
        anchor: {
          show: false
        },
        title: {
          show: false
        },
        detail: {
          valueAnimation: true,
          width: '60%',
          lineHeight: 40,
          borderRadius: 8,
          offsetCenter: [0, '-15%'],
          fontSize: 22,
          fontWeight: 'bolder',
          formatter: '{value}%',
          color: '#FAFAFA'
        },
        data: [
          {
            value: kpis?.metasProgresso || 0,
            name: 'Progresso'
          }
        ]
      }
    ]
  };

  // ECharts 4: Bar Chart (Comparativo de Saldo)
  const barChartOption = {
    color: ['#8B5CF6'],
    xAxis: {
      type: 'category',
      data: performance.map(p => p.month),
      axisLine: { lineStyle: { color: '#27272A' } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#27272A', type: 'dashed' } },
      axisLabel: {
        formatter: (val) => `R$ ${(val / 1000).toFixed(0)}k`
      }
    },
    series: [
      {
        name: 'Saldo Mensal',
        type: 'bar',
        barWidth: '35%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#8B5CF6' },
              { offset: 1, color: '#3B82F6' }
            ]
          }
        },
        data: performance.map(p => p.saldo)
      }
    ]
  };

  return (
    <div className="flex flex-col gap-6 relative">
      
      {/* Onboarding Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-custom pb-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-brand-purple/10 rounded-md text-brand-purple">
              <Sparkles size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple font-manrope">
              Console Financeiro Ativo
            </span>
          </div>
          <h1 className="text-2xl font-extrabold font-sora tracking-tight">
            Olá, Gabriel Gouveia
          </h1>
          <p className="text-sm text-text-secondary">
            Visão geral da liquidez, fluxo operacional e performance do portfólio corporativo.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={handleRefresh}
            isLoading={isLoading}
          >
            Sincronizar API
          </Button>
          <Button
            icon={Zap}
            onClick={openPalette}
          >
            Ações Rápidas
          </Button>
        </div>
      </div>

      {/* Onboarding Tip Box */}
      <div className="glass-panel border-l-2 border-l-brand-purple p-4 rounded-r-xl flex items-start gap-3 relative overflow-hidden">
        <div className="p-1.5 bg-brand-purple/10 rounded-lg text-brand-purple flex-shrink-0 mt-0.5">
          <Shield size={14} />
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-manrope">Dica de Produtividade</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Pressione <kbd className="px-1.5 py-0.5 rounded border border-border-custom bg-bg-primary text-[10px] font-mono mx-1 text-text-primary">Ctrl + K</kbd> (ou Command + K) para abrir o painel de pesquisa global e executar comandos rápidos sem tirar a mão do teclado.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-24 h-full bg-brand-purple/5 blur-[20px] pointer-events-none" />
      </div>

      {/* Core KPIs - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Saldo Consolidado"
          value={kpis?.saldoTotal}
          change={kpis?.saldoTotalChange}
          icon={Wallet}
          iconColor="purple"
          formatter={formatBRL}
          isLoading={isLoading}
        />
        <StatsCard
          title="Faturamento Mensal"
          value={kpis?.receitaMensal}
          change={kpis?.receitaMensalChange}
          icon={TrendingUp}
          iconColor="green"
          formatter={formatBRL}
          isLoading={isLoading}
        />
        <StatsCard
          title="Saídas Operacionais"
          value={kpis?.despesaMensal}
          change={kpis?.despesaMensalChange}
          icon={TrendingDown}
          iconColor="red"
          formatter={formatBRL}
          isLoading={isLoading}
        />
        <StatsCard
          title="Resultado Líquido"
          value={kpis?.lucroMensal}
          change={kpis?.lucroMensalChange}
          icon={DollarSign}
          iconColor="blue"
          formatter={formatBRL}
          isLoading={isLoading}
        />
      </div>

      {/* Auxiliary KPIs - Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Receitas Pendentes"
          value={kpis?.receitasPendentes}
          icon={ArrowUpRight}
          iconColor="yellow"
          formatter={formatBRL}
          subtext="Previsão para próximos 15 dias"
          isLoading={isLoading}
        />
        <StatsCard
          title="Despesas Pendentes"
          value={kpis?.despesasPendentes}
          icon={ArrowDownRight}
          iconColor="red"
          formatter={formatBRL}
          subtext="Vencimentos agendados"
          isLoading={isLoading}
        />
        <StatsCard
          title="Maior Receita Única"
          value={kpis?.maiorReceita}
          icon={TrendingUp}
          iconColor="green"
          formatter={formatBRL}
          subtext="Faturamento Stripe SaaS"
          isLoading={isLoading}
        />
        <StatsCard
          title="Maior Despesa Única"
          value={kpis?.maiorDespesa}
          icon={TrendingDown}
          iconColor="yellow"
          formatter={formatBRL}
          subtext="Folha CLT XP Investimentos"
          isLoading={isLoading}
        />
      </div>

      {/* Grid of Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cash Flow Area Chart (Takes 2 columns on desktop) */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold font-sora text-text-primary">
                  Fluxo Financeiro Operacional
                </h3>
                <span className="text-xs text-text-secondary">Receitas vs Despesas (últimos 6 meses)</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 border border-border-custom bg-bg-secondary rounded uppercase text-text-secondary">
                Simulado
              </span>
            </div>
            <EchartsContainer option={areaChartOption} isLoading={isLoading} className="h-72" />
          </Card>
        </div>

        {/* Categories Pie Chart (1 column) */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-bold font-sora text-text-primary">
                Despesas por Categoria
              </h3>
              <span className="text-xs text-text-secondary">Distribuição do orçamento operacional</span>
            </div>
            <EchartsContainer option={donutChartOption} isLoading={isLoading} className="h-72" />
          </Card>
        </div>

      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Goals Progress Gauge */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-bold font-sora text-text-primary">
                Metas Ativas
              </h3>
              <span className="text-xs text-text-secondary">Progresso médio consolidado das metas</span>
            </div>
            <EchartsContainer option={gaugeChartOption} isLoading={isLoading} className="h-48" />
            <div className="flex justify-between items-center text-xs border-t border-border-custom pt-4">
              <span className="text-text-secondary">Meta: R$ 200.000,00</span>
              <span className="text-brand-green font-semibold">180k acumulados</span>
            </div>
          </Card>
        </div>

        {/* Accumulation Bar Chart */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold font-sora text-text-primary">
                  Resultado Acumulado Mensal
                </h3>
                <span className="text-xs text-text-secondary">Evolução do saldo operacional do período</span>
              </div>
            </div>
            <EchartsContainer option={barChartOption} isLoading={isLoading} className="h-48" />
          </Card>
        </div>

      </div>

    </div>
  );
}
