import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import client from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Restore session on load: /auth/me 401 → interceptor silently refreshes → retries once.
  const loadUser = useCallback(async () => {
    setAuthLoading(true);
    try {
      const res = await client.get('/auth/me');
      setUser(res.data.data);
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const res = await client.post('/auth/login', { email, password });
    setUser(res.data.data);
    return res.data.data;
  };

  const register = async (payload) => {
    const res = await client.post('/auth/register', payload);
    setUser(res.data.data);
    return res.data.data;
  };

  const logout = async () => {
    try {
      await client.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, login, register, logout, reloadUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
