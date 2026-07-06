import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, HelpCircle, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import EchartsContainer from '../components/EchartsContainer';

import api from '../services/api';

export default function Contas() {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newAcc, setNewAcc] = useState({ name: '', balance: '', type: 'Checking', color: '#3B82F6' });

  const mapFrontTypeToBack = (t) => t;

  const mapBackTypeToFront = (t) => t;

  const fetchData = async () => {
    try {
      const response = await api.get('accounts/');
      const mapped = response.data.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        balance: Number(a.balance),
        color: a.color,
        icon: a.type === 'Investment' ? 'trending-up' : a.type === 'Cash' ? 'banknote' : 'credit-card',
        change24h: 0.0
      }));
      setAccounts(mapped);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      toast.error('Erro ao carregar contas bancárias.');
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatBRL = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newAcc.name || !newAcc.balance) {
      toast.error('Preencha os campos obrigatórios!');
      return;
    }
    try {
      const payload = {
        name: newAcc.name,
        balance: Number(newAcc.balance),
        type: newAcc.type,
        color: newAcc.color
      };
      await api.post('accounts/', payload);
      await fetchData();
      setModalOpen(false);
      setNewAcc({ name: '', balance: '', type: 'Checking', color: '#3B82F6' });
      toast.success('Instituição vinculada com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao vincular instituição.');
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // ECharts Option: Asset Allocation Donut
  const allocationOption = {
    color: accounts.map(a => a.color),
    tooltip: {
      trigger: 'item',
      formatter: (params) => `${params.name}: <b>${formatBRL(params.value)}</b> (${params.percent}%)`
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      textStyle: { color: '#A1A1AA', fontSize: 11 }
    },
    series: [
      {
        name: 'Alocação',
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#09090B',
          borderWidth: 2
        },
        label: { show: false },
        data: accounts.map(a => ({
          name: a.name,
          value: a.balance
        }))
      }
    ]
  };

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-custom pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold font-sora tracking-tight text-brand-blue">
            Instituições & Saldos
          </h1>
          <p className="text-sm text-text-secondary">
            Conecte contas correntes, carteiras físicas e contas de investimento global.
          </p>
        </div>

        <Button icon={Plus} onClick={() => setModalOpen(true)}>
          Vincular Instituição
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-32 w-full rounded-xl skeleton-pulse border border-border-custom bg-bg-card/50" />
            ))}
          </div>
          <div className="h-64 rounded-xl skeleton-pulse border border-border-custom bg-bg-card/50" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Accounts Grid */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="text-sm font-bold font-sora text-text-primary uppercase tracking-wider font-manrope">
              Suas Contas Ativas ({accounts.length})
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {accounts.map((acc) => (
                <Card
                  key={acc.id}
                  className="hover:bg-bg-card/60 flex flex-col justify-between h-36 cursor-pointer relative"
                  style={{ borderLeft: `3px solid ${acc.color}` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-text-secondary font-manrope bg-white/5 px-2 py-0.5 rounded">
                      {acc.type === 'Investment' ? 'Investimento' : acc.type === 'Checking' ? 'Conta Corrente' : 'Espécie'}
                    </span>
                    
                    {acc.change24h !== 0 && (
                      <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${
                        acc.change24h > 0 ? 'text-brand-green' : 'text-brand-red'
                      }`}>
                        {acc.change24h > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {Math.abs(acc.change24h).toFixed(1)}% (24h)
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col mt-4">
                    <span className="text-xs text-text-secondary font-manrope">{acc.name}</span>
                    <span className="text-xl font-bold font-sora text-text-primary mt-1">
                      {formatBRL(acc.balance)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Allocation Breakdown Chart Card */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <h2 className="text-sm font-bold font-sora text-text-primary uppercase tracking-wider font-manrope">
              Distribuição Patrimonial
            </h2>
            <Card className="flex flex-col gap-4">
              <EchartsContainer option={allocationOption} className="h-56" />
              <div className="flex justify-between items-center text-xs border-t border-border-custom pt-4 font-manrope">
                <span className="text-text-secondary">Patrimônio Consolidado</span>
                <span className="text-brand-blue font-bold text-sm">{formatBRL(totalBalance)}</span>
              </div>
            </Card>
          </div>

        </div>
      )}

      {/* Connection Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Conectar Instituição Financeira">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Nome do Banco / Conta"
            placeholder="Ex: Santander Select"
            value={newAcc.name}
            onChange={(e) => setNewAcc({ ...newAcc, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Saldo Inicial (R$)"
              type="number"
              placeholder="0.00"
              value={newAcc.balance}
              onChange={(e) => setNewAcc({ ...newAcc, balance: e.target.value })}
            />

            <div className="flex flex-col gap-1 w-full">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider font-manrope">
                Tipo
              </label>
              <select
                className="w-full px-3 py-2.5 rounded-lg border border-border-custom bg-bg-card text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-brand-purple/60 focus:border-brand-purple/60 cursor-pointer"
                value={newAcc.type}
                onChange={(e) => setNewAcc({ ...newAcc, type: e.target.value })}
              >
                <option value="Checking">Conta Corrente</option>
                <option value="Investment">Conta de Investimento</option>
                <option value="Cash">Dinheiro / Espécie</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider font-manrope">
              Identificação de Cor
            </label>
            <div className="flex items-center gap-3">
              {['#3B82F6', '#8B5CF6', '#22C55E', '#FACC15', '#EF4444', '#EC4899'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewAcc({ ...newAcc, color: c })}
                  className={`w-6 h-6 rounded-full border cursor-pointer transition-all ${
                    newAcc.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border-custom pt-4 mt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Conectar Contas</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
