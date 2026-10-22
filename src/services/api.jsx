import axios from 'axios';
import { clearToken, getToken, isAuthPage } from './auth';
import { getOrganizationId, ORGANIZATION_HEADER } from './organization';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.pps.makalabox.com';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// цепляем токен и организацию, за которую действует пользователь
api.interceptors.request.use(cfg => {
  const t = getToken();
  if (t) {
    cfg.headers.Authorization = `Bearer ${t}`;
    const organizationId = getOrganizationId();
    if (organizationId && !cfg.skipOrganization) cfg.headers[ORGANIZATION_HEADER] = organizationId;
  }
  return cfg;
});

// глобальный 401 → logout + редирект на логин
api.interceptors.response.use(
  res => res,
  err => {
    // Бэкенд кладёт текст ошибки в error (контроллеры) или detail (исключения
    // Symfony), а страницы читают message.
    const data = err.response?.data;
    if (data && typeof data === 'object' && !data.message) {
      data.message = data.error ?? data.detail;
    }

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
