import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CommandPaletteProvider } from './contexts/CommandPaletteContext';

// Layouts & Components
import DashboardLayout from './layouts/DashboardLayout';
import CommandPalette from './components/CommandPalette';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Receitas from './pages/Receitas';
import Despesas from './pages/Despesas';
import Categorias from './pages/Categorias';
import Contas from './pages/Contas';
import Metas from './pages/Metas';
import Relatorios from './pages/Relatorios';
import Perfil from './pages/Perfil';
import Configuracoes from './pages/Configuracoes';
import NotFound from './pages/NotFound';

// Protected Route Guard
function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-bg-primary flex flex-col items-center justify-center font-manrope">
        <svg className="animate-spin h-8 w-8 text-brand-purple" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs text-text-secondary mt-3 font-semibold uppercase tracking-wider">
          Autenticando Sessão...
        </span>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <CommandPaletteProvider>
            <BrowserRouter>
              
              {/* App Routes */}
              <Routes>
                
                {/* Public Route */}
                <Route path="/login" element={<Login />} />

                {/* Protected Routes Wrapper */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/receitas" element={<Receitas />} />
                    <Route path="/despesas" element={<Despesas />} />
                    <Route path="/categorias" element={<Categorias />} />
                    <Route path="/contas" element={<Contas />} />
                    <Route path="/metas" element={<Metas />} />
                    <Route path="/relatorios" element={<Relatorios />} />
                    <Route path="/perfil" element={<Perfil />} />
                    <Route path="/configuracoes" element={<Configuracoes />} />
                  </Route>
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />

              </Routes>

              {/* Global Overlays */}
              <CommandPalette />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#202024',
                    color: '#FAFAFA',
                    border: '1px solid #27272A',
                    fontSize: '13px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    borderRadius: '8px',
                  },
                  success: {
                    iconTheme: {
                      primary: '#22C55E',
                      secondary: '#FAFAFA',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#FAFAFA',
                    },
                  },
                }}
              />

            </BrowserRouter>
          </CommandPaletteProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
