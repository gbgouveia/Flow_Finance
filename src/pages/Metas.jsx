import React, { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle2, Calendar, TrendingUp, Sparkles, HelpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';

import api from '../services/api';

export default function Metas() {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', target: '', current: '', deadline: '', category: 'Crescimento' });

  const fetchData = async () => {
    try {
      const response = await api.get('goals/');
      const mapped = response.data.map(g => ({
        id: g.id,
        name: g.name,
        target: Number(g.target_amount),
        current: Number(g.current_amount),
        deadline: g.deadline,
        category: g.category,
        status: g.status
      }));
      setGoals(mapped);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Erro ao carregar metas.');
      setGoals([]);
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
    if (!newGoal.name || !newGoal.target || !newGoal.current) {
      toast.error('Preencha os campos obrigatórios!');
      return;
    }
    try {
      const payload = {
        name: newGoal.name,
        target_amount: Number(newGoal.target),
        current_amount: Number(newGoal.current),
        deadline: newGoal.deadline || dayjs().add(6, 'month').format('YYYY-MM-DD'),
        category: newGoal.category,
        status: 'active'
      };
      await api.post('goals/', payload);
      await fetchData();
      setModalOpen(false);
      setNewGoal({ name: '', target: '', current: '', deadline: '', category: 'Crescimento' });
      toast.success('Meta financeira cadastrada com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao cadastrar meta.');
    }
  };

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-custom pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold font-sora tracking-tight text-brand-purple">
            Metas de Acumulação
          </h1>
          <p className="text-sm text-text-secondary">
            Defina e monitore objetivos financeiros para investimentos e expansão da equipe.
          </p>
        </div>

        <Button icon={Plus} onClick={() => setModalOpen(true)}>
          Nova Meta
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-44 w-full rounded-xl skeleton-pulse border border-border-custom bg-bg-card/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Goals List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="text-sm font-bold font-sora text-text-primary uppercase tracking-wider font-manrope">
              Objetivos Ativos ({goals.filter(g => g.status === 'active').length})
            </h2>

            <div className="flex flex-col gap-4">
              {goals.map((goal) => {
                const ratio = Math.min((goal.current / goal.target) * 100, 100);
                const isCompleted = goal.status === 'completed';

                return (
                  <Card
                    key={goal.id}
                    className="hover:bg-bg-card/60 flex flex-col justify-between p-6 cursor-pointer relative"
                  >
                    {/* Visual border glow for completed goals */}
                    {isCompleted && (
                      <div className="absolute top-0 right-0 w-32 h-full bg-brand-green/5 blur-[20px] pointer-events-none" />
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-text-primary">{goal.name}</h3>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-text-secondary font-manrope">
                            {goal.category}
                          </span>
                        </div>
                        <span className="text-xs text-text-secondary flex items-center gap-1">
                          <Calendar size={12} className="opacity-60" />
                          Prazo: {dayjs(goal.deadline).format('DD/MM/YYYY')}
                        </span>
                      </div>

                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-xs text-brand-green font-semibold bg-brand-green/10 px-2 py-0.5 rounded-full font-manrope">
                          <CheckCircle2 size={12} />
                          Concluída
                        </span>
                      ) : (
                        <span className="text-xs text-brand-purple font-semibold bg-brand-purple/10 px-2 py-0.5 rounded-full font-manrope">
                          {ratio.toFixed(0)}% Atingido
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 mt-6">
                      <div className="flex justify-between items-end text-xs">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-text-secondary uppercase font-semibold font-manrope">Acumulado</span>
                          <span className="text-sm font-extrabold text-text-primary">{formatBRL(goal.current)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-text-secondary uppercase font-semibold font-manrope font-manrope">Meta Alvo</span>
                          <span className="text-xs text-text-secondary">{formatBRL(goal.target)}</span>
                        </div>
                      </div>

                      {/* Custom progress track */}
                      <div className="w-full h-2 bg-bg-primary rounded-full overflow-hidden border border-border-custom/50">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${ratio}%`,
                            backgroundColor: isCompleted ? '#22C55E' : '#8B5CF6',
                            boxShadow: `0 0 10px ${isCompleted ? '#22C55E50' : '#8B5CF650'}`
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* AI Projections Card */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <h2 className="text-sm font-bold font-sora text-text-primary uppercase tracking-wider font-manrope">
              Análise Preditiva
            </h2>
            <Card className="flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-full bg-brand-purple/5 blur-[25px] pointer-events-none" />
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-brand-purple animate-pulse" />
                <h3 className="text-sm font-bold text-text-primary">Previsões Inteligentes</h3>
              </div>
              
              <p className="text-xs text-text-secondary leading-relaxed">
                Com base no seu lucro mensal médio de **R$ 117.000,00**, você atingirá a meta do **Fundo de Reserva Operacional** em aproximadamente **12 dias**, antes do prazo estipulado!
              </p>

              <div className="border-t border-border-custom pt-4 mt-2 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary font-manrope">Taxa de Poupança</span>
                  <span className="text-brand-green font-bold">41.0%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary font-manrope">Capacidade de Aporte</span>
                  <span className="text-text-primary font-bold">R$ 48.000,00 / mês</span>
                </div>
              </div>
            </Card>
          </div>

        </div>
      )}

      {/* Goal Creation Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Criar Nova Meta Financeira">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Objetivo da Meta"
            placeholder="Ex: Aquisição de Imóvel Sede"
            value={newGoal.name}
            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor Alvo (R$)"
              type="number"
              placeholder="0.00"
              value={newGoal.target}
              onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
            />

            <Input
              label="Aporte Inicial (R$)"
              type="number"
              placeholder="0.00"
              value={newGoal.current}
              onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data Limite"
              type="date"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
            />

            <div className="flex flex-col gap-1 w-full">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider font-manrope">
                Categoria da Meta
              </label>
              <select
                className="w-full px-3 py-2.5 rounded-lg border border-border-custom bg-bg-card text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-brand-purple/60 focus:border-brand-purple/60 cursor-pointer"
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
              >
                <option value="Segurança">Fundo de Reserva (Segurança)</option>
                <option value="Crescimento">Crescimento / Marketing</option>
                <option value="Equipamentos">Equipamentos / Infra</option>
                <option value="RH">Bônus / Recursos Humanos</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border-custom pt-4 mt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Gravar Meta</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
