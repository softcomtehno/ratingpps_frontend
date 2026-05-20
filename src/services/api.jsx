import axios from 'axios';
import { clearToken, getToken, isAuthPage } from './auth';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.pps.makalabox.com';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// цепляем токен
api.interceptors.request.use(cfg => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// глобальный 401 → logout + редирект на логин
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      clearToken();

      if (typeof window !== 'undefined' && !isAuthPage()) {
        window.location.assign('/Authorization');
      }
    }

    return Promise.reject(err);
  }
);

export default api;
