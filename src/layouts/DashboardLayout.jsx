import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import {
  Menu,
  X,
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  FolderKanban,
  CreditCard,
  Target,
  BarChart3,
  User,
  Settings,
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp as LogoIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useCommandPalette } from '../contexts/CommandPaletteContext';
import Dropdown from '../components/Dropdown';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { openPalette } = useCommandPalette();

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Receitas', path: '/receitas', icon: TrendingUp },
    { label: 'Despesas', path: '/despesas', icon: TrendingDown },
    { label: 'Categorias', path: '/categorias', icon: FolderKanban },
    { label: 'Contas', path: '/contas', icon: CreditCard },
    { label: 'Metas', path: '/metas', icon: Target },
    { label: 'Relatórios', path: '/relatorios', icon: BarChart3 },
  ];

  const bottomItems = [
    { label: 'Perfil', path: '/perfil', icon: User },
    { label: 'Configurações', path: '/configuracoes', icon: Settings },
  ];

  // Helper to extract breadcrumbs
  const getBreadcrumb = () => {
    const path = location.pathname.substring(1);
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex relative">
      {/* Ambient background particles/glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-brand-purple/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-brand-blue/5 blur-[120px] pointer-events-none z-0" />

      {/* Sidebar - Desktop */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 70 }}
        className="hidden md:flex flex-col border-r border-border-custom bg-bg-secondary/40 backdrop-blur-md relative z-20 flex-shrink-0"
      >
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-6 bg-bg-card border border-border-custom text-text-secondary hover:text-text-primary p-1 rounded-full cursor-pointer z-30 focus:outline-none"
        >
          {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>

        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-border-custom">
          <div className="p-1.5 bg-brand-purple/10 rounded-lg text-brand-purple flex items-center justify-center flex-shrink-0">
            <LogoIcon size={18} />
          </div>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold font-sora text-sm uppercase tracking-wider text-gradient-purple-blue"
            >
              Flow Finance
            </motion.span>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group relative ${
                  isActive
                    ? 'text-white font-medium bg-brand-purple/10 border border-brand-purple/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-brand-purple' : 'text-text-secondary group-hover:text-text-primary'} />
                {sidebarOpen && <span>{item.label}</span>}
                
                {/* Tooltip on collapsed state */}
                {!sidebarOpen && (
                  <div className="absolute left-16 scale-0 group-hover:scale-100 bg-bg-card border border-border-custom px-2.5 py-1.5 rounded-md text-xs z-50 transition-all pointer-events-none whitespace-nowrap shadow-xl">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom items & Profile summary */}
        <div className="p-3 border-t border-border-custom flex flex-col gap-1.5">
          {bottomItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group relative ${
                  isActive
                    ? 'text-white font-medium bg-brand-purple/10 border border-brand-purple/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-brand-purple' : 'text-text-secondary group-hover:text-text-primary'} />
                {sidebarOpen && <span>{item.label}</span>}
                
                {!sidebarOpen && (
                  <div className="absolute left-16 scale-0 group-hover:scale-100 bg-bg-card border border-border-custom px-2.5 py-1.5 rounded-md text-xs z-50 transition-all pointer-events-none whitespace-nowrap shadow-xl">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-text-secondary hover:text-brand-red hover:bg-brand-red/10 border border-transparent cursor-pointer text-left focus:outline-none relative group"
          >
            <LogOut size={16} />
            {sidebarOpen && <span>Sair</span>}
            {!sidebarOpen && (
              <div className="absolute left-16 scale-0 group-hover:scale-100 bg-bg-card border border-border-custom px-2.5 py-1.5 rounded-md text-xs z-50 transition-all pointer-events-none whitespace-nowrap shadow-xl">
                Sair
              </div>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        {/* Header */}
        <header className="h-16 border-b border-border-custom bg-bg-primary/20 backdrop-blur-md flex items-center justify-between px-6 z-20 sticky top-0">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button className="md:hidden text-text-secondary hover:text-text-primary focus:outline-none">
              <Menu size={20} />
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center text-xs text-text-secondary font-medium font-manrope">
              <span>Flow Finance</span>
              <span className="mx-2 text-text-secondary/40">/</span>
              <span className="text-text-primary font-semibold">{getBreadcrumb()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Trigger Button */}
            <button
              onClick={openPalette}
              className="flex items-center gap-2 border border-border-custom bg-bg-card/30 hover:border-brand-purple/40 hover:bg-bg-card/50 transition-all px-3 py-1.5 rounded-lg text-xs text-text-secondary w-36 lg:w-48 cursor-pointer focus:outline-none"
            >
              <Search size={14} className="opacity-60" />
              <span className="flex-1 text-left opacity-60">Buscar...</span>
              <span className="hidden sm:inline-block px-1 border border-border-custom bg-bg-primary rounded text-[9px] font-mono opacity-50">
                ⌘K
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 border border-border-custom bg-bg-card/30 hover:bg-white/5 rounded-lg text-text-secondary hover:text-text-primary transition-colors cursor-pointer focus:outline-none"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Notifications Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
                className="p-2 border border-border-custom bg-bg-card/30 hover:bg-white/5 rounded-lg text-text-secondary hover:text-text-primary transition-colors cursor-pointer relative focus:outline-none"
              >
                <Bell size={15} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-brand-purple rounded-full animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {showNotificationsMenu && (
                  <>
                    {/* Backdrop to close */}
                    <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowNotificationsMenu(false)} />
                    
                    {/* Drawer Dropdown */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 bg-bg-card border border-border-custom rounded-xl p-1 shadow-2xl glass-panel z-50 max-h-[400px] overflow-hidden flex flex-col"
                    >
                      <div className="p-3 border-b border-border-custom flex items-center justify-between">
                        <span className="text-xs font-bold font-manrope text-text-primary uppercase tracking-wider">
                          Notificações ({unreadCount})
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-[10px] text-brand-purple hover:underline cursor-pointer focus:outline-none"
                          >
                            Marcar lidas
                          </button>
                        )}
                      </div>

                      <div className="overflow-y-auto max-h-[300px] divide-y divide-border-custom">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-xs text-text-secondary">
                            Nenhuma notificação
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => markAsRead(n.id)}
                              className={`p-3 text-xs transition-colors hover:bg-white/5 cursor-pointer ${
                                !n.read ? 'bg-brand-purple/5' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className={`font-semibold ${!n.read ? 'text-text-primary' : 'text-text-secondary'}`}>
                                  {n.title}
                                </span>
                                <span className="text-[9px] text-text-secondary/50">{n.time}</span>
                              </div>
                              <p className="text-text-secondary leading-relaxed">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar Dropdown */}
            <Dropdown
              align="right"
              trigger={
                <button className="flex items-center gap-2 p-1 rounded-full border border-border-custom bg-bg-card/30 hover:border-brand-purple/30 transition-all cursor-pointer focus:outline-none">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80&h=80'}
                    alt="User Profile"
                    className="w-7 h-7 rounded-full object-cover"
                  />
                </button>
              }
              items={[
                { label: 'Meu Perfil', icon: User, onClick: () => navigate('/perfil') },
                { label: 'Configurações', icon: Settings, onClick: () => navigate('/configuracoes') },
                { separator: true },
                { label: 'Encerrar Sessão', icon: LogOut, danger: true, onClick: handleLogout },
              ]}
            />
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>


        {/* Footer */}
        <footer className="h-12 border-t border-border-custom flex items-center justify-between px-6 text-xs text-text-secondary/40 z-10 bg-bg-primary/20 backdrop-blur-sm">
          <span>&copy; {new Date().getFullYear()} Flow Finance S.A.</span>
          <div className="flex gap-4">
            <span className="hover:text-text-secondary transition-colors cursor-pointer">Termos</span>
            <span className="hover:text-text-secondary transition-colors cursor-pointer">Privacidade</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
