import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { GoogleCredentialResponse } from '@react-oauth/google';
import api from '../api/axios';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  googleLogin: (response: GoogleCredentialResponse) => Promise<void>;
  logout: () => void;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  full_name: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // =========================
  // Verificar sesión
  // =========================
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get<User>('/auth/me');
        setUser(data);
        setIsAuthenticated(true);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // =========================
  // Login tradicional
  // =========================
  const login = async (formData: LoginData): Promise<void> => {
    const { data } = await api.post<{ token: string; user: User }>(
      '/auth/login',
      formData
    );

    localStorage.setItem('token', data.token);
    setUser(data.user);
    setIsAuthenticated(true);
  };

  // =========================
  // Registro tradicional
  // =========================
  const register = async (formData: RegisterData): Promise<void> => {
    const { data } = await api.post<{ token: string; user: User }>(
      '/auth/register',
      formData
    );

    localStorage.setItem('token', data.token);
    setUser(data.user);
    setIsAuthenticated(true);
  };

  // =========================
  // Login / Registro con Google
  // =========================
  const googleLogin = async (
    credentialResponse: GoogleCredentialResponse
  ): Promise<void> => {
    if (!credentialResponse.credential) return;

    const { data } = await api.post<{ token: string; user: User }>(
      '/auth/google',
      { token: credentialResponse.credential }
    );

    localStorage.setItem('token', data.token);
    setUser(data.user);
    setIsAuthenticated(true);
  };

  // =========================
  // Logout
  // =========================
  const logout = (): void => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
