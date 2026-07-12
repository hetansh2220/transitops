import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as authApi from "@/api/auth";
import {
  setAccessToken,
  setAuthFailureHandler,
  requestRefresh,
} from "@/api/client";
import { canWrite } from "@/lib/permissions";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Starts true: on boot we don't yet know whether the refresh cookie is valid,
  // and rendering routes before we know flashes the login page at signed-in users.
  const [bootstrapping, setBootstrapping] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  // Let the axios interceptor drop the session when a refresh fails mid-flight.
  useEffect(() => {
    setAuthFailureHandler(clearSession);
  }, [clearSession]);

  // On boot the access token is gone (it only ever lived in memory), but the
  // httpOnly refresh cookie may still be good — trade it for a new access token.
  useEffect(() => {
    const restore = async () => {
      try {
        const { data } = await requestRefresh();
        setAccessToken(data.accessToken);
        const { user: currentUser } = await authApi.me();
        setUser(currentUser);
      } catch {
        clearSession();
      } finally {
        setBootstrapping(false);
      }
    };

    restore();
  }, [clearSession]);

  const login = useCallback(async (credentials) => {
    const { user: loggedIn, accessToken } = await authApi.login(credentials);
    setAccessToken(accessToken);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const register = useCallback(async (payload) => {
    const { user: created, accessToken } = await authApi.register(payload);
    setAccessToken(accessToken);
    setUser(created);
    return created;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = {
    user,
    bootstrapping,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    can: (resource) => canWrite(user, resource),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
