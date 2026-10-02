import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  register: (data: { name: string; email: string; password: string; phone?: string; company?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('kroma_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('kroma_auth_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to verify session token:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login gagal.' };
      }

      localStorage.setItem('kroma_auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true, role: data.user.role };
    } catch (err: any) {
      return { success: false, error: err.message || 'Koneksi ke server gagal.' };
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string; company?: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Registrasi gagal.' };
      }

      localStorage.setItem('kroma_auth_token', resData.token);
      setToken(resData.token);
      setUser(resData.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Koneksi ke server gagal.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('kroma_auth_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User> & { password?: string }) => {
    if (!token) return { success: false, error: 'Tidak terautentikasi' };
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Gagal update profile.' };
      }
      setUser(resData.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
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
