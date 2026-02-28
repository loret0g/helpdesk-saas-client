import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL?.trim() || "http://localhost:5000";

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Añade token (si existe) a todas las requests
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Normaliza errores comunes
http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;

    // Si el token es inválido/expirado, limpiamos sesión
    if (status === 401) {
      localStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);

export default http;