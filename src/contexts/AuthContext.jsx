import { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';
import { clearToken, getToken, setToken as persistToken } from '../services/auth';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getToken());
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    if (!token) return;
    api.get('/api/me')
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

AuthProvider.propTypes = {
  children: PropTypes.node,
};
