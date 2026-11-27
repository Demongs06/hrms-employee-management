import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";

export const AuthContext = createContext();

const readUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  if (!sessionStorage.getItem("token")) {
    sessionStorage.removeItem("user");
    return null;
  }
  try {
    return JSON.parse(sessionStorage.getItem("user") || "null");
  } catch {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(readUser);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token || !auth) return;

    try {
      const decoded = jwtDecode(token);
      const timeLeft = decoded.exp * 1000 - Date.now();
      if (!decoded.exp || timeLeft <= 0) {
        logout();
        return;
      }
      const timer = setTimeout(() => {
        logout();
      }, timeLeft);
      return () => clearTimeout(timer);
    } catch {
      logout();
    }
  }, [auth]);

  const login = async (email, password) => {
    try {
      const res = await api.post("/login", { email, password });
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      setAuth(res.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Unable to sign in. Please try again."
      };
    }
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setAuth(null);
    if (window.location.pathname !== "/login") window.location.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
