import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('employeesphere_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('employeesphere_token');
  });
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get<User>('/auth/me');
      setUser(res.data);
      localStorage.setItem('employeesphere_user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Failed to load authenticated user profile:', err);
      setUser(null);
      localStorage.removeItem('employeesphere_token');
      localStorage.removeItem('employeesphere_user');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (newToken: string) => {
    localStorage.setItem('employeesphere_token', newToken);
    setToken(newToken);
    try {
      const res = await api.get<User>('/auth/me', {
        headers: { Authorization: `Bearer ${newToken}` }
      });
      setUser(res.data);
      localStorage.setItem('employeesphere_user', JSON.stringify(res.data));
    } catch (e) {
      console.error('Error fetching user after login:', e);
    }
  };

  const logout = () => {
    localStorage.removeItem('employeesphere_token');
    localStorage.removeItem('employeesphere_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

