import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken]   = useState(localStorage.getItem('token'));
  const [user, setUser]     = useState(null); // для обычных user
  const [teacher, setTeacher]=useState(null); // для teacher

  useEffect(() => { // при старте-app загружаем профиль
    if (!token) return;
    api.get('/api/me') // универсальный энд-поинт (можно сделать /api/me/profile)
      .then((r) => setTeacher(r.data))
      .catch(() => logout());
  }, [token]);

  const login = (jwt, prof) => {
    localStorage.setItem('token', jwt);
    setToken(jwt);
    setTeacher(prof);
  };
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setTeacher(null);
  };

  return (
    <AuthContext.Provider value={{ token, teacher, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};