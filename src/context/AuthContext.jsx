import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchRole(userId) {
    if (!userId) {
      setRole(null);
      return;
    }
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
    setRole(data?.role ?? null);
  }

  useEffect(() => {
    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        await fetchRole(session.user.id);
      }
      setLoading(false);
    }

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true);
      setSession(session);
      if (session) {
        await fetchRole(session.user.id);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, role, loading, refreshRole: () => fetchRole(session?.user?.id) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}