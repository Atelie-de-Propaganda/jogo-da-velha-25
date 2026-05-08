import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ArsenalUser, UserRole } from '../types/arsenal';
import { addHistory } from '../data/dataService';

const DEMO_CREDENTIALS: Record<string, { password: string; role: UserRole; name: string; id: string }> = {
  'admin@arsenal.com': { password: 'Arsenal@2025', role: 'admin', name: 'Carlos Mendes', id: 'u1' },
  'ti@arsenal.com': { password: 'Arsenal@2025', role: 'ti_externo', name: 'Ricardo TI', id: 'u2' },
  'equipe@arsenal.com': { password: 'Arsenal@2025', role: 'equipe_interna', name: 'Ana Lima', id: 'u3' },
};

interface AuthContextType {
  user: ArsenalUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  canRevealPasswords: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'arsenal_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ArsenalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string): Promise<{ error?: string }> {
    const cred = DEMO_CREDENTIALS[email.toLowerCase()];
    if (!cred || cred.password !== password) {
      return { error: 'E-mail ou senha inválidos.' };
    }

    const arsenalUser: ArsenalUser = {
      id: cred.id,
      name: cred.name,
      email: email.toLowerCase(),
      role: cred.role,
      active: true,
      created_at: new Date().toISOString(),
    };

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(arsenalUser));
    setUser(arsenalUser);
    addHistory(arsenalUser.id, arsenalUser.name, 'auth', arsenalUser.id, arsenalUser.name, 'Login', 'Login realizado com sucesso no sistema.');
    return {};
  }

  function logout() {
    if (user) {
      addHistory(user.id, user.name, 'auth', user.id, user.name, 'Logout', 'Logout realizado.');
    }
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  const canRevealPasswords = user?.role === 'admin' || user?.role === 'ti_externo';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, canRevealPasswords, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
