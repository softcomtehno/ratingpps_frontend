import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { clearToken, getToken, setToken as persistToken } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken]   = useState(getToken());
  const [user, setUser]     = useState(null); // для обычных user
  const [teacher, setTeacher]=useState(null); // для teacher

  useEffect(() => { // при старте-app загружаем профиль
    if (!token) return;
    api.get('/api/me') // универсальный энд-поинт (можно сделать /api/me/profile)
      .then((r) => setTeacher(r.data))
      .catch(() => logout());
  }, [token]);

  const login = (jwt, prof) => {
    persistToken(jwt);
    setToken(jwt);
    setTeacher(prof);
  };
  const logout = () => {
    clearToken();
    setToken(null);
    setTeacher(null);
  };

  return (
    <AuthContext.Provider value={{ token, teacher, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
