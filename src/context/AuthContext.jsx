
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchMe, loginUser, registerUser } from "../api/auth.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "astral_bloom_token";

function readToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function writeToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const token = readToken();
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const me = await fetchMe(token);
        if (!cancelled) setUser(me);
      } catch {
        clearToken();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsAuthLoading(false);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email, password) => {
    const { token, user: backendUser } = await loginUser({ email, password });
    writeToken(token);
    setUser(backendUser);
    return backendUser;
  };

  const register = async ({
    email,
    password,
    name,
    phone,
    defaultAddress,
  }) => {
    await registerUser({ email, password, name });

    const { token, user: backendUser } = await loginUser({ email, password });
    writeToken(token);

    setUser({
      ...backendUser,
      phone: phone ?? backendUser.phone ?? null,
      defaultAddress: defaultAddress ?? backendUser.defaultAddress ?? null,
      name: name ?? backendUser.name ?? null,
    });

    return backendUser;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const updateProfile = (partial) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  const value = useMemo(
    () => ({
      user,
      isAuthLoading,
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
