import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
  roleName: string;
  email?: string;
  phone?: string;
  address?: string;
  customerId?: number | null;
  customerCode?: string | null;
  loyaltyPoints?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (partialUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('flower_shop_token');
      const storedUser = localStorage.getItem('flower_shop_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to parse stored auth user', e);
      localStorage.removeItem('flower_shop_token');
      localStorage.removeItem('flower_shop_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('flower_shop_token', newToken);
    localStorage.setItem('flower_shop_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const updateUser = (partialUser: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...partialUser };
      localStorage.setItem('flower_shop_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('flower_shop_token');
      localStorage.removeItem('flower_shop_user');
      setToken(null);
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
