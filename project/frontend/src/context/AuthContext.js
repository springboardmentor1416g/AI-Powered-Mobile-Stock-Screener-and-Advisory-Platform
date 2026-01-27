import React, { createContext, useContext, useMemo, useState } from "react";

/**
 * Your App.js uses <AuthContext.Provider ...>
 * So we must export AuthContext.
 */
export const AuthContext = createContext({
  user: null,
  token: null,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const value = useMemo(
    () => ({
      user,
      token,
      login: async ({ user: u, token: t }) => {
        setUser(u ?? null);
        setToken(t ?? null);
      },
      logout: async () => {
        setUser(null);
        setToken(null);
      },
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Optional hook (some files may use it)
 */
export function useAuth() {
  return useContext(AuthContext);
}
