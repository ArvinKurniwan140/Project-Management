// resources/js/Contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  email_verified_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!token && !!user;

  // Set token to API headers
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Load user on mount if token exists
  useEffect(() => {
    if (token && !user) {
      fetchUser();
    }
  }, [token, user]);

  // Auto refresh token
  useEffect(() => {
    if (token) {
      const interval = setInterval(() => {
        refreshToken();
      }, 14 * 60 * 1000); // Refresh every 14 minutes

      return () => clearInterval(interval);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user');
      setUser(response.data.user);
    } catch (error: any) {
      console.error('Failed to fetch user:', error);
      if (error.response?.status === 401) {
        await logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      
      // Show success notification
      console.log('Login successful');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string, 
    email: string, 
    password: string, 
    password_confirmation: string
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        password_confirmation,
      });

      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      
      console.log('Registration successful');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      setLoading(false);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const response = await api.post('/auth/refresh');
      const { access_token } = response.data;
      setToken(access_token);
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      if (error.response?.status === 401) {
        await logout();
      }
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    error,
    isAuthenticated,
    refreshToken,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};