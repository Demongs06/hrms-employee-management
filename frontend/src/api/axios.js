import axios from "axios";

const apiOrigin = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const api = axios.create({
  baseURL: `${apiOrigin}/api`,
  timeout: 20000
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestHadSession = Boolean(error.config?.headers?.Authorization);
    const isLoginRequest = error.config?.url?.endsWith("/login");
    if (error.response?.status === 401 && requestHadSession && !isLoginRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") window.location.replace("/login");
    }
    return Promise.reject(error);
  }
);

export default api;
