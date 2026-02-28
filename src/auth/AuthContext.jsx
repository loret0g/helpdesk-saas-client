import { createContext, useContext, useEffect, useMemo, useState } from "react";
import http from "../api/http";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Obtiene el usuario autenticado actual
  async function fetchMe({ silent = false } = {}) {
    if (!silent) setLoading(true);

    try {
      const res = await http.get("/api/auth/me");
      setUser(res.data.user || null);
      return res.data.user || null;
    } catch {
      setUser(null);
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;

    // Restaurar sesión al montar la app
    (async () => {
      try {
        const res = await http.get("/api/auth/me");
        if (!alive) return;
        setUser(res.data.user || null);
      } catch {
        if (!alive) return;
        setUser(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      // Evita setState si el componente se desmonta
      alive = false;
    };
  }, []);

  async function login(email, password) {
    try {
      const res = await http.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);

      // Refresca la sesión tras guardar el token
      await fetchMe({ silent: true });
      setLoading(false);
    } catch (err) {
      // Se propaga el error para que la UI lo gestione
      throw err;
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  // Memoriza el contexto para evitar renders innecesarios
  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}