import { createContext, useEffect, useMemo, useState } from "react";
import { adminLoginApi, adminMeApi } from "../api/adminApi";

export const AuthContext = createContext(null);

const setStorage = (token, admin) => {
  localStorage.setItem("adminToken", token);
  localStorage.setItem("adminProfile", JSON.stringify(admin));
};

const clearStorage = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminProfile");
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [admin, setAdmin] = useState(() => {
    const raw = localStorage.getItem("adminProfile");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await adminMeApi();
        setAdmin(response.admin);
        localStorage.setItem("adminProfile", JSON.stringify(response.admin));
      } catch (error) {
        setToken(null);
        setAdmin(null);
        clearStorage();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [token]);

  const adminLogin = async (payload) => {
    const response = await adminLoginApi(payload);
    setToken(response.token);
    setAdmin(response.admin);
    setStorage(response.token, response.admin);
    return response;
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    clearStorage();
  };

  const value = useMemo(
    () => ({
      token,
      admin,
      loading,
      isAuthenticated: Boolean(token),
      adminLogin,
      logout,
    }),
    [token, admin, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
