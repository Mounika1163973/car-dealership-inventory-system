import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

const STORAGE_KEY = 'ironclad_auth';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [auth]);

  async function login({ email, password }) {
    setLoading(true);
    setError(null);
    try {
      const data = await api.login({ email, password });
      setAuth(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function register({ name, email, password, role }) {
    setLoading(true);
    setError(null);
    try {
      const data = await api.register({ name, email, password, role });
      setAuth(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setAuth(null);
  }

  const value = useMemo(
    () => ({
      user: auth?.user ?? null,
      token: auth?.token ?? null,
      isAuthenticated: Boolean(auth?.token),
      isAdmin: auth?.user?.role === 'admin',
      login,
      register,
      logout,
      loading,
      error,
      clearError: () => setError(null),
    }),
    [auth, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
