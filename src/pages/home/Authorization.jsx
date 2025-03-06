import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import NavBar from "../../components/NavBar";
import { Link, useNavigate } from "react-router-dom";

function Authorization() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate()

  const handleLogin = useCallback((e) => {
    e.preventDefault();
    axios.post('https://api.pps.makalabox.com/api/login', {
      "username": name,
      "password": password,
    })
      .then(function (response) {
        if (response.status >= 200 && response.status <= 204) {
          localStorage.setItem('token', response.data.token);
          navigate("/private_office")
          setIsLoggedIn(true);
          location.reload()
        }
      })
      .catch(function (error) {
        setError(true);
        console.log(error);
      });
  }, [name, navigate, password]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    location.reload()
  }, []);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  return (
    <div className="сontents">
      <div className="header">
        <NavBar />
      </div>
      <div className="main">
        <div className="title__contain"><h2 className="Edu__text-L center">Авторизация</h2></div>
        <div className="auth__contain">
          <label htmlFor="" className="auth__label">
            <form onSubmit={handleLogin}>
              <p className="input__text Montherat">Логин</p>
              <input type="text" className={'auth__input Montherat'} value={name} onChange={e => setName(e.target.value)} placeholder="Логин" />
              <p className="input__text Montherat">Пароль</p>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete=""
                  className="auth__input Montherat"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Пароль"
                />
                <div className="show-password-checkbox">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                  />
                  <label className="Edu__text-S">Посмотреть пароль</label>
                </div>
              </div>
              {error && <p className="input__text Montherat">Неправильный логин или пароль</p>}
            </form>
            {isLoggedIn ? (
              <>
                <div className="auth__btn-center">
                  <button onClick={handleLogout} className="bnt__log Edu__text-S">Выйти</button>
                </div>
              </>
            ) : (
              <>
                <div className="auth__btn">
                  <button onClick={handleLogin} className="bnt__log Edu__text-S">Войти</button>
                </div>
                <div className="auth__btn">
                  <Link to='/Registration' className="bnt__log Edu__text-S">Регистрация</Link>
                </div>
              </>
            )}
          </label>
        </div>
      </div>
    </div>
  );
}

export default Authorization;