import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { offlineDb } from "../services/offline-db";

const AuthContext = createContext(null);

function getStoredUser() {
  const rawUser = window.localStorage.getItem("rhms-user");

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!window.localStorage.getItem("rhms-access-token")) {
      return;
    }

    async function loadProfile() {
      try {
        const response = await api.get("/auth/profile");
        setUser(response.data.data.user);
        window.localStorage.setItem("rhms-user", JSON.stringify(response.data.data.user));
        if (response.data.data.user?.tenant?.facilityId) {
          window.localStorage.setItem("rhms-active-facility-id", response.data.data.user.tenant.facilityId);
        }
      } catch {
        window.localStorage.removeItem("rhms-access-token");
        window.localStorage.removeItem("rhms-refresh-token");
        window.localStorage.removeItem("rhms-user");
        setUser(null);
      }
    }

    loadProfile();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user && window.localStorage.getItem("rhms-access-token")),
      async login(payload) {
        setLoading(true);

        try {
          const response = await api.post("/auth/login", payload);
          const { accessToken, refreshToken, user: nextUser } = response.data.data;
          window.localStorage.setItem("rhms-access-token", accessToken);
          window.localStorage.setItem("rhms-refresh-token", refreshToken);
          window.localStorage.setItem("rhms-user", JSON.stringify(nextUser));
          if (nextUser?.tenant?.facilityId) {
            window.localStorage.setItem("rhms-active-facility-id", nextUser.tenant.facilityId);
          }
          if (window.localStorage.getItem("rhms-welcome-enabled") !== "false") {
            window.sessionStorage.setItem("rhms-show-welcome", "true");
          }
          setUser(nextUser);
          return nextUser;
        } finally {
          setLoading(false);
        }
      },
      async logout() {
        const refreshToken = window.localStorage.getItem("rhms-refresh-token");

        if (refreshToken) {
          try {
            await api.post("/auth/logout", { refreshToken });
          } catch {
            // Ignore logout transport errors and clear local session anyway.
          }
        }

        window.localStorage.removeItem("rhms-access-token");
        window.localStorage.removeItem("rhms-refresh-token");
        window.localStorage.removeItem("rhms-user");
        window.localStorage.removeItem("rhms-active-facility-id");
        window.sessionStorage.removeItem("rhms-show-welcome");
        await offlineDb.clearAll();
        setUser(null);
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
