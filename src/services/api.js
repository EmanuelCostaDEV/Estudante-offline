import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

// Injeta automaticamente o header Authorization em toda requisição privada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("eo_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Se o backend responder 401 (token expirado/ inválido), limpa a sessão
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("eo_token");
      localStorage.removeItem("eo_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
