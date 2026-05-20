import { useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { clearToken } from "../services/auth";

const AccountConf = () => {
  const [id, setId] = useState('');

  useEffect(() => {
    const getUserId = async () => {
      try {
        const response = await api.get('/api/teacher/id');
        const respId = response.data.id;
        setId(respId);
      } catch {
        setId('');
      }
    };

    getUserId();
  }, []);

  const handleLogout = useCallback(() => {
    clearToken();
  }, []);

  return (
    <div className="account__config">
      <div className="avatar__container"><div className="avatar"></div></div>
      <ul className="config__list">
        <li className="config__items-li">
          <Link to={`/user/${id}`} className="config__items">Моя учётная запись</Link>
        </li>
        <li className="config__items-li">
          <Link to="/Authorization" onClick={handleLogout} className="config__items">Выйти</Link>
        </li>
      </ul>
    </div>
  );
}

export default AccountConf;
