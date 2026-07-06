import React, { useState, useEffect } from 'react';
import { FolderKanban, Plus, Flame, Sparkles, TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import api from '../services/api';

export default function Categorias() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [catType, setCatType] = useState('expense');
  const [newCat, setNewCat] = useState({ name: '', limit: '', color: '#8B5CF6' });

  const fetchData = async () => {
    try {
      const response = await api.get('categories/');
      const mappedCats = response.data.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type === 'EXPENSE' ? 'expense' : 'revenue',
        limit: c.limit ? Number(c.limit) : null,
        color: c.color,
        icon: c.icon || 'folder'
      }));
      setCategories(mappedCats);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Erro ao carregar categorias.');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCat.name) {
      toast.error('Preencha o nome da categoria!');
      return;
    }
    try {
      const payload = {
        name: newCat.name,
        type: catType === 'expense' ? 'EXPENSE' : 'INCOME',
        limit: catType === 'expense' ? Number(newCat.limit || 1000) : null,
        color: newCat.color,
        icon: 'folder'
      };
      await api.post('categories/', payload);
      await fetchData();
      setModalOpen(false);
      setNewCat({ name: '', limit: '', color: '#8B5CF6' });
      toast.success('Categoria criada com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar categoria.');
    }
  };

  const formatBRL = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getSpentForCategory = (cat) => {
    const nameMap = {
      'Marketing & Ads': 18500,
      'Cloud & Infrastructure': 47250,
      'Salários & Contratações': 98400,
      'Escritório & Coworking': 6200,
      'Viagens & Eventos': 4800,
      'Seguros & Taxas': 250,
    };
    return nameMap[cat.name] || 0;
  };

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-custom pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold font-sora tracking-tight text-brand-purple">
            Categorias & Orçamento
          </h1>
          <p className="text-sm text-text-secondary">
            Defina centros de custo, limites de orçamento e classifique seus lançamentos.
          </p>
        </div>

        <Button icon={Plus} onClick={() => setModalOpen(true)}>
          Nova Categoria
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-44 w-full rounded-xl skeleton-pulse border border-border-custom bg-bg-card/50" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          
          {/* Section: Centros de Custo (Expenses with Limits) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="text-brand-red w-4.5 h-4.5" />
              <h2 className="text-base font-bold font-sora text-text-primary">Centros de Custo (Despesas)</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories
                .filter((c) => c.type === 'expense')
                .map((cat) => {
                  const spent = getSpentForCategory(cat);
                  const limit = cat.limit || 1000;
                  const ratio = Math.min((spent / limit) * 100, 100);
                  const isNearLimit = ratio >= 90;

                  return (
                    <Card
                      key={cat.id}
                      className="hover:bg-bg-card/60 flex flex-col justify-between h-44 cursor-pointer relative"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-3.5 h-3.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.15)]"
                            style={{ backgroundColor: cat.color }}
                          />
                          <h3 className="font-bold text-sm text-text-primary">{cat.name}</h3>
                        </div>
                        {isNearLimit && (
                          <span className="p-1 rounded bg-brand-red/10 text-brand-red flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider font-manrope animate-pulse">
                            <Flame size={10} />
                            Limite atingido
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 mt-4">
                        <div className="flex justify-between items-end text-xs">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-text-secondary uppercase font-semibold font-manrope">Consumido</span>
                            <span className="text-sm font-extrabold text-text-primary">{formatBRL(spent)}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-text-secondary uppercase font-semibold font-manrope">Orçamento</span>
                            <span className="text-xs text-text-secondary">{formatBRL(limit)}</span>
                          </div>
                        </div>

                        {/* Custom animated progress bar */}
                        <div className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden border border-border-custom/50">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${ratio}%`,
                              backgroundColor: isNearLimit ? '#EF4444' : cat.color,
                              boxShadow: `0 0 10px ${isNearLimit ? '#EF444450' : cat.color + '50'}`
                            }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-text-secondary">
                          <span>{ratio.toFixed(1)}% utilizado</span>
                          <span>restam {formatBRL(Math.max(limit - spent, 0))}</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>

          {/* Section: Canais de Entrada (Revenues) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-brand-green w-4.5 h-4.5" />
              <h2 className="text-base font-bold font-sora text-text-primary">Fontes de Faturamento (Receitas)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories
                .filter((c) => c.type === 'revenue')
                .map((cat) => (
                  <Card
                    key={cat.id}
                    className="hover:bg-bg-card/60 flex flex-col justify-between h-32 cursor-pointer border-t-2"
                    style={{ borderTopColor: cat.color }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-text-primary">{cat.name}</h3>
                      <span
                        className="p-1 bg-white/5 rounded text-[9px] font-bold uppercase tracking-wider font-manrope text-text-secondary"
                      >
                        Entrada
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-text-secondary pt-2">
                      <span className="font-manrope">Lançamentos</span>
                      <span className="font-bold text-text-primary font-mono text-sm">Ativo</span>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* New Category Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nova Categoria">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Nome da Categoria"
            placeholder="Ex: Consultorias de Marketing"
            value={newCat.name}
            onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
          />

          <div className="flex gap-4">
            {/* Category Type */}
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider font-manrope">
                Tipo
              </label>
              <div className="grid grid-cols-2 gap-2 border border-border-custom p-1 rounded-lg bg-bg-card/50">
                <button
                  type="button"
                  onClick={() => setCatType('expense')}
                  className={`py-1.5 text-xs font-medium rounded transition-all cursor-pointer ${
                    catType === 'expense' ? 'bg-brand-purple text-white' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => setCatType('revenue')}
                  className={`py-1.5 text-xs font-medium rounded transition-all cursor-pointer ${
                    catType === 'revenue' ? 'bg-brand-purple text-white' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Receita
                </button>
              </div>
            </div>

            {/* Custom Hex Color Selection */}
            <div className="flex flex-col gap-1 w-24">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider font-manrope">
                Cor Visual
              </label>
              <div className="flex items-center border border-border-custom rounded-lg bg-bg-card/50 p-1.5">
                <input
                  type="color"
                  value={newCat.color}
                  onChange={(e) => setNewCat({ ...newCat, color: e.target.value })}
                  className="w-8 h-8 rounded border border-border-custom bg-transparent cursor-pointer"
                />
                <span className="text-[10px] uppercase font-mono ml-2 text-text-secondary">{newCat.color}</span>
              </div>
            </div>
          </div>

          {catType === 'expense' && (
            <Input
              label="Limite de Orçamento Mensal (R$)"
              type="number"
              placeholder="Ex: 5000"
              value={newCat.limit}
              onChange={(e) => setNewCat({ ...newCat, limit: e.target.value })}
            />
          )}

          <div className="flex justify-end gap-2 border-t border-border-custom pt-4 mt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Categoria</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
