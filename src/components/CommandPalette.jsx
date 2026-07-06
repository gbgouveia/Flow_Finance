import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  FolderKanban,
  CreditCard,
  Target,
  BarChart3,
  User,
  Settings,
  Sun,
  Moon,
  LogOut,
  Plus,
  Terminal,
  CornerDownLeft
} from 'lucide-react';
import { useCommandPalette } from '../contexts/CommandPaletteContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function CommandPalette() {
  const { isOpen, closePalette } = useCommandPalette();
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
    }
  }, [isOpen]);

  const items = [
    // Navigation
    { id: 'nav-dash', title: 'Ir para Dashboard', category: 'Navegação', icon: LayoutDashboard, action: () => navigate('/dashboard') },
    { id: 'nav-rec', title: 'Ir para Receitas', category: 'Navegação', icon: TrendingUp, action: () => navigate('/receitas') },
    { id: 'nav-des', title: 'Ir para Despesas', category: 'Navegação', icon: TrendingDown, action: () => navigate('/despesas') },
    { id: 'nav-cat', title: 'Ir para Categorias', category: 'Navegação', icon: FolderKanban, action: () => navigate('/categorias') },
    { id: 'nav-cont', title: 'Ir para Contas', category: 'Navegação', icon: CreditCard, action: () => navigate('/contas') },
    { id: 'nav-met', title: 'Ir para Metas', category: 'Navegação', icon: Target, action: () => navigate('/metas') },
    { id: 'nav-rel', title: 'Ir para Relatórios', category: 'Navegação', icon: BarChart3, action: () => navigate('/relatorios') },
    { id: 'nav-perf', title: 'Ir para Perfil', category: 'Navegação', icon: User, action: () => navigate('/perfil') },
    { id: 'nav-conf', title: 'Ir para Configurações', category: 'Navegação', icon: Settings, action: () => navigate('/configuracoes') },
    
    // Quick Actions
    { id: 'act-theme', title: `Mudar para Tema ${isDark ? 'Claro' : 'Escuro'}`, category: 'Ações Rápidas', icon: isDark ? Sun : Moon, action: () => { toggleTheme(); toast.success('Tema alterado!'); } },
    { id: 'act-add-rec', title: 'Adicionar Receita', category: 'Ações Rápidas', icon: Plus, action: () => { navigate('/receitas'); } },
    { id: 'act-add-desp', title: 'Adicionar Despesa', category: 'Ações Rápidas', icon: Plus, action: () => { navigate('/despesas'); } },
    { id: 'act-logout', title: 'Sair da Conta (Logout)', category: 'Ações Rápidas', icon: LogOut, action: () => { logout(); navigate('/login'); } },
  ];

  // Filter items based on search query
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          closePalette();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, closePalette]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePalette}
            className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
          />

          {/* Palette Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.2 }}
            ref={containerRef}
            className="relative w-full max-w-xl bg-bg-card/90 border border-border-custom rounded-xl shadow-2xl overflow-hidden glass-panel z-10"
          >
            {/* Search Input Container */}
            <div className="flex items-center border-b border-border-custom px-4 py-3 gap-3">
              <Search className="text-text-secondary w-5 h-5 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Busque páginas ou ações rápidas... (ex: tema, contas)"
                className="w-full bg-transparent text-text-primary placeholder:text-text-secondary/40 text-sm focus:outline-none"
              />
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-border-custom bg-bg-primary text-text-secondary font-mono flex-shrink-0">
                ESC
              </span>
            </div>

            {/* Results List */}
            <div className="max-h-[300px] overflow-y-auto p-2">
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-text-secondary gap-2">
                  <Terminal size={24} className="opacity-40 animate-pulse" />
                  <span className="text-xs">Nenhum comando ou página encontrada</span>
                </div>
              ) : (
                // Group by Category
                Object.entries(
                  filteredItems.reduce((acc, item) => {
                    if (!acc[item.category]) acc[item.category] = [];
                    acc[item.category].push(item);
                    return acc;
                  }, {})
                ).map(([category, catItems]) => (
                  <div key={category} className="mb-2">
                    <h4 className="text-[10px] font-bold text-text-secondary/50 uppercase tracking-widest px-3 py-1 font-manrope">
                      {category}
                    </h4>
                    {catItems.map((item) => {
                      const globalIndex = filteredItems.findIndex(fi => fi.id === item.id);
                      const isSelected = globalIndex === selectedIndex;
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            item.action();
                            closePalette();
                          }}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'bg-brand-purple/10 border border-brand-purple/20' : 'border border-transparent hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-md ${isSelected ? 'text-brand-purple bg-brand-purple/10' : 'text-text-secondary'}`}>
                              <Icon size={16} />
                            </div>
                            <span className={`text-sm ${isSelected ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                              {item.title}
                            </span>
                          </div>
                          {isSelected && (
                            <span className="flex items-center gap-0.5 text-[10px] text-brand-purple font-mono bg-brand-purple/10 px-1.5 py-0.5 rounded border border-brand-purple/20">
                              Executar
                              <CornerDownLeft size={10} />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 bg-bg-primary/50 border-t border-border-custom text-[10px] text-text-secondary/60">
              <div className="flex gap-3">
                <span>↑↓ para navegar</span>
                <span>↵ para selecionar</span>
              </div>
              <span>Flow Console v1.0</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
