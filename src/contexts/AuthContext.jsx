import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('auth/me/');
      setUser(response.data);
      return response.data;
    } catch (err) {
      logout();
      throw err;
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('flow-user') || sessionStorage.getItem('flow-user');
    const token = localStorage.getItem('flow-access-token') || sessionStorage.getItem('flow-access-token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      // Sync profile in background
      fetchUserProfile().catch(() => {});
    }
    setLoading(false);
  }, []);

  const login = async (email, password, remember = false) => {
    setLoading(true);

    if (!email || !password) {
      setLoading(false);
      throw new Error('Preencha todos os campos');
    }

    try {
      const response = await api.post('auth/login/', { email, password });
      const { access, refresh } = response.data;

      if (remember) {
        localStorage.setItem('flow-access-token', access);
        localStorage.setItem('flow-refresh-token', refresh);
      } else {
        sessionStorage.setItem('flow-access-token', access);
        sessionStorage.setItem('flow-refresh-token', refresh);
      }

      // Fetch user details from /auth/me/
      const userProfileResponse = await api.get('auth/me/');
      const loggedUser = userProfileResponse.data;

      setUser(loggedUser);
      const userStr = JSON.stringify(loggedUser);

      if (remember) {
        localStorage.setItem('flow-user', userStr);
      } else {
        sessionStorage.setItem('flow-user', userStr);
      }

      toast.success(`Bem-vindo de volta, ${loggedUser.username || loggedUser.email}!`);
      return loggedUser;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'E-mail ou senha inválidos';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (username, email, password, telefone = '', remember = false) => {
    setLoading(true);
    try {
      await api.post('auth/register/', {
        username,
        email,
        password,
        telefone
      });
      // Automatically login after registration
      return await login(email, password, remember);
    } catch (err) {
      const errorMsg = Object.values(err.response?.data || {}).flat().join(' ') || 'Erro ao criar conta';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('flow-user');
    localStorage.removeItem('flow-access-token');
    localStorage.removeItem('flow-refresh-token');
    sessionStorage.removeItem('flow-user');
    sessionStorage.removeItem('flow-access-token');
    sessionStorage.removeItem('flow-refresh-token');
    toast.success('Sessão encerrada com sucesso.');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, registerUser, logout, isAuthenticated: !!user, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
