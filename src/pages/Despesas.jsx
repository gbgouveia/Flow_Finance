import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  TrendingDown,
  Plus,
  Trash2,
  Download,
  Calendar,
  DollarSign,
  Tag,
  CreditCard,
  UploadCloud,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { downloadBlob } from '../utils/download';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import api from '../services/api';

const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.preprocess(
    (val) => parseFloat(val),
    z.number().positive('O valor deve ser maior que zero')
  ),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  accountId: z.string().min(1, 'Conta é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória'),
});

export default function Despesas() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchData = async () => {
    try {
      const [expRes, catRes, accRes] = await Promise.all([
        api.get('transactions/'),
        api.get('categories/'),
        api.get('accounts/')
      ]);

      const mappedCats = catRes.data.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type === 'EXPENSE' ? 'expense' : 'revenue',
        limit: c.limit ? Number(c.limit) : null,
        color: c.color,
        icon: c.icon || 'folder'
      }));
      setCategories(mappedCats);

      const mappedAccs = accRes.data.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        balance: Number(a.balance),
        color: a.color
      }));
      setAccounts(mappedAccs);

      const mappedExpenses = expRes.data.filter(exp => exp.type === 'EXPENSE').map(exp => ({
        id: exp.id,
        date: exp.date,
        description: exp.description,
        amount: Number(exp.amount),
        type: 'expense',
        categoryId: exp.category_id,
        accountId: exp.account_id,
        status: exp.status,
        observacao: '',
        anexo: ''
      }));
      setTransactions(mappedExpenses);
    } catch (error) {
      console.error('Error fetching expenses data:', error);
      toast.error('Erro ao carregar dados de despesas.');
      
      // Empty arrays
      setTransactions([]);
      setCategories([]);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: '',
      amount: '',
      categoryId: '',
      accountId: '',
      date: dayjs().format('YYYY-MM-DD'),
    },
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        description: data.description,
        amount: Number(data.amount),
        category_id: Number(data.categoryId),
        account_id: Number(data.accountId),
        date: data.date,
        type: 'EXPENSE',
        status: 'paid'
      };

      await api.post('transactions/', payload);
      await fetchData();
      setModalOpen(false);
      reset();
      setSelectedFile(null);
      toast.success('Despesa lançada com sucesso!');
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Erro ao lançar despesa.');
    }
  };

  const handleDelete = async (row) => {
    if (confirm(`Excluir despesa "${row.description}"?`)) {
      try {
        await api.delete(`transactions/${row.id}/`);
        await fetchData();
        toast.success('Despesa excluída.');
      } catch (error) {
        console.error('Error deleting expense:', error);
        toast.error('Erro ao excluir despesa.');
      }
    }
  };

  const handleBulkDelete = async (ids) => {
    if (confirm(`Excluir os ${ids.length} itens selecionados?`)) {
      try {
        await Promise.all(ids.map(id => api.delete(`transactions/${id}/`)));
        await fetchData();
        toast.success('Itens excluídos com sucesso.');
      } catch (error) {
        console.error('Error bulk deleting expenses:', error);
        toast.error('Erro ao excluir itens selecionados.');
      }
    }
  };

  const handleExport = () => {
    toast.loading('Gerando planilha CSV...', { id: 'csv' });
    
    const data = transactions.map(t => ({
      Data: dayjs(t.date).format('DD/MM/YYYY'),
      Descrição: t.description,
      Valor: t.amount,
      Status: t.status === 'paid' ? 'Liquidado' : 'Pendente',
      Categoria: categories.find(c => c.id === t.categoryId)?.name || '-',
      Conta: accounts.find(a => a.id === t.accountId)?.name || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    
    const fileName = `Despesas_${dayjs().format('YYYY-MM-DD')}.csv`;
    downloadBlob(blob, fileName);
    
    toast.dismiss('csv');
    toast.success('Despesas exportadas em CSV!', { id: 'csv' });
  };

  const formatBRL = (val) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  // KPIs Calculations
  const totalExpenses = transactions
    .filter((t) => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingExpenses = transactions
    .filter((t) => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const maxExpense = transactions.reduce(
    (max, t) => (t.amount > max ? t.amount : max),
    0
  );

  // DataTable columns
  const columns = [
    {
      key: 'date',
      label: 'Vencimento',
      cell: (row) => dayjs(row.date).format('DD/MM/YYYY'),
    },
    {
      key: 'description',
      label: 'Descrição',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-text-primary font-medium">{row.description}</span>
          <span className="text-[10px] text-text-secondary/60">ID: {row.id}</span>
        </div>
      ),
    },
    {
      key: 'categoryId',
      label: 'Categoria',
      cell: (row) => {
        const cat = categories.find((c) => String(c.id) === String(row.categoryId));
        return cat ? (
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium"
            style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
          >
            {cat.name}
          </span>
        ) : (
          '-'
        );
      },
    },
    {
      key: 'accountId',
      label: 'Conta Origem',
      cell: (row) => {
        const acc = accounts.find((a) => String(a.id) === String(row.accountId));
        return acc ? (
          <span className="text-xs text-text-secondary font-manrope">
            {acc.name}
          </span>
        ) : (
          '-'
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase font-manrope ${
            row.status === 'paid'
              ? 'text-brand-green bg-brand-green/10'
              : 'text-brand-yellow bg-brand-yellow/10'
          }`}
        >
          {row.status === 'paid' ? 'Pago' : 'Pendente'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Valor',
      align: 'right',
      cell: (row) => (
        <span className="font-bold text-brand-red">{formatBRL(row.amount)}</span>
      ),
    },
  ];

  const actionsList = [
    {
      label: 'Marcar como Pago',
      icon: TrendingDown,
      onClick: async (row) => {
        try {
          await api.patch(`transactions/${row.id}/`, { status: 'paid' });
          await fetchData();
          toast.success('Despesa liquidada!');
        } catch (error) {
          console.error(error);
          toast.error('Erro ao liquidar despesa.');
        }
      },
    },
    {
      label: 'Excluir',
      icon: Trash2,
      danger: true,
      onClick: handleDelete,
    },
  ];

  const filterOptions = categories
    .filter((c) => c.type === 'expense')
    .map((c) => ({ label: c.name, value: c.id }));

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      toast.success('Boleto / Nota fiscal anexado!');
    }
  };

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-custom pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold font-sora tracking-tight text-brand-red">
            Despesas & Saídas
          </h1>
          <p className="text-sm text-text-secondary">
            Monitore a queima de caixa operacional e contas a pagar do negócio.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" icon={Download} onClick={handleExport}>
            Exportar CSV
          </Button>
          <Button icon={Plus} variant="danger" onClick={() => setModalOpen(true)}>
            Nova Despesa
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Pago"
          value={totalExpenses}
          icon={TrendingDown}
          iconColor="red"
          formatter={formatBRL}
          subtext="Total de saídas liquidadas"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Agendado"
          value={pendingExpenses}
          icon={Calendar}
          iconColor="yellow"
          formatter={formatBRL}
          subtext="Boletos pendentes"
          isLoading={isLoading}
        />
        <StatsCard
          title="Maior Desembolso"
          value={maxExpense}
          icon={DollarSign}
          iconColor="purple"
          formatter={formatBRL}
          subtext="Gasto corporativo recorde"
          isLoading={isLoading}
        />
      </div>

      {/* Data Table */}
      <div className="glass-panel p-6 rounded-xl border border-border-custom">
        <DataTable
          columns={columns}
          data={transactions}
          isLoading={isLoading}
          searchPlaceholder="Buscar por descrição..."
          searchKey="description"
          filterKey="categoryId"
          filterOptions={filterOptions}
          actions={actionsList}
          onDeleteSelected={handleBulkDelete}
        />
      </div>

      {/* New Expense Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          reset();
          setSelectedFile(null);
        }}
        title="Novo Lançamento de Despesa"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Descrição do Gasto"
            placeholder="Ex: Infraestrutura de Nuvem AWS"
            error={errors.description}
            {...register('description')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.amount}
              {...register('amount')}
            />

            <Input
              label="Data de Vencimento"
              type="date"
              error={errors.date}
              {...register('date')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category Select */}
            <div className="flex flex-col gap-1 w-full">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider font-manrope">
                Categoria
              </label>
              <select
                className={`w-full px-3 py-2.5 rounded-lg border bg-bg-card text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-brand-purple/60 focus:border-brand-purple/60 cursor-pointer ${
                  errors.categoryId ? 'border-brand-red' : 'border-border-custom'
                }`}
                {...register('categoryId')}
              >
                <option value="">Selecione...</option>
                {categories
                  .filter((c) => c.type === 'expense')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
              {errors.categoryId && (
                <span className="text-xs text-brand-red mt-0.5">{errors.categoryId.message}</span>
              )}
            </div>

            {/* Account Select */}
            <div className="flex flex-col gap-1 w-full">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider font-manrope">
                Conta de Pagamento
              </label>
              <select
                className={`w-full px-3 py-2.5 rounded-lg border bg-bg-card text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-brand-purple/60 focus:border-brand-purple/60 cursor-pointer ${
                  errors.accountId ? 'border-brand-red' : 'border-border-custom'
                }`}
                {...register('accountId')}
              >
                <option value="">Selecione...</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              {errors.accountId && (
                <span className="text-xs text-brand-red mt-0.5">{errors.accountId.message}</span>
              )}
            </div>
          </div>

          {/* Styled Document upload box */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider font-manrope">
              Comprovante / Invoice (PDF ou JPG)
            </label>
            <div className="border border-dashed border-border-custom hover:border-brand-purple/40 rounded-lg p-6 bg-bg-card/30 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all relative">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg"
              />
              <UploadCloud size={28} className="text-text-secondary/60" />
              <span className="text-xs text-text-primary font-medium">
                {selectedFile ? selectedFile.name : 'Clique ou arraste um arquivo'}
              </span>
              <span className="text-[10px] text-text-secondary/40">
                PDF, PNG ou JPG de até 5MB
              </span>
            </div>
            {selectedFile && (
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-brand-green font-medium">
                <FileText size={12} />
                Comprovante anexado com sucesso.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-border-custom pt-4 mt-2">
            <Button
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                reset();
                setSelectedFile(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="danger">Salvar Despesa</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
