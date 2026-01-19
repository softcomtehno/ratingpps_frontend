import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.pps.makalabox.com/',
});

// цепляем токен
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});



// глобальный 401 → на логин
// api.interceptors.response.use(
//   res => res,
//   err => {
//     if (err.response?.status === 401) {
//       localStorage.removeItem('token');
//       window.location = '/Authorization';
//     }
//     return Promise.reject(err);
//   }
// );

export default api;