import { useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const AccountConf = () => {
  const token = localStorage.getItem('token');
  const [id, setId] = useState('');
  const [userData, setUserData] = useState({
    name: '',
  });

  useEffect(() => {
    const getUserId = async () => {
      try {
        const response = await axios.get('https://api.pps.makalabox.com/api/user/id', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const respId = response.data.id;
        setId(respId);
      } catch (error) {
        console.log(error);
      }
    };

    getUserId();
  }, [id, token, userData.data]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
  }, []);

  return (
    <div className="account__config">
      <div className="avatar__container"><div className="avatar"></div></div>
      <ul className="config__list">
        <li className="config__items-li">
          <Link to={`/my_account/${id}`} className="config__items">Моя учётная запись</Link>
        </li>
        <li className="config__items-li">
          <Link to="/Authorization" onClick={handleLogout} className="config__items">Выйти</Link>
        </li>
      </ul>
    </div>
  );
}

export default AccountConf;