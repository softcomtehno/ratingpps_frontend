// import { useState, useCallback, useEffect } from "react";
// import axios from "axios";
// import NavBar from "../../components/NavBar";
// import { useNavigate } from "react-router-dom";

// function Authorization() {
//   const [name, setName] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
//   const [error, setError] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate()

//   const handleLogin = useCallback((e) => {
//     e.preventDefault();
//     axios.post('https://api.pps.makalabox.com/api/login', {
//       "username": name,
//       "password": password,
//     })
//       .then(function (response) {
//         if (response.status >= 200 && response.status <= 204) {
//           localStorage.setItem('token', response.data.token);
//           navigate("/private_office")
//           setIsLoggedIn(true);
//           location.reload()
//         }
//       })
//       .catch(function (error) {
//         setError(true);
//         console.log(error);
//       });
//   }, [name, navigate, password]);

//   const handleLogout = useCallback(() => {
//     localStorage.removeItem('token');
//     setIsLoggedIn(false);
//     location.reload()
//   }, []);

//   useEffect(() => {
//     setIsLoggedIn(!!localStorage.getItem('token'));
//   }, []);

//   return (
//     <div className="сontents">
//       <div className="header">
//         <NavBar />
//       </div>
//       <div className="main">
//         <div className="title__contain"><h2 className="Edu__text-L center">Авторизация</h2></div>
//         <div className="auth__contain">
//           <label htmlFor="" className="auth__label">
//             <form onSubmit={handleLogin}>
//               <p className="input__text Montherat">Логин</p>
//               <input type="text" className={'auth__input Montherat'} value={name} onChange={e => setName(e.target.value)} placeholder="Логин" />
//               <p className="input__text Montherat">Пароль</p>
//               <div className="password-input-container">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   autoComplete=""
//                   className="auth__input Montherat"
//                   value={password}
//                   onChange={e => setPassword(e.target.value)}
//                   placeholder="Пароль"
//                 />
//                 <div className="show-password-checkbox">
//                   <input
//                     type="checkbox"
//                     checked={showPassword}
//                     onChange={() => setShowPassword(!showPassword)}
//                   />
//                   <label className="Edu__text-S">Посмотреть пароль</label>
//                 </div>
//               </div>
//               {error && <p className="input__text Montherat">Неправильный логин или пароль</p>}
//             </form>
//             {isLoggedIn ? (
//               <>
//                 <div className="auth__btn-center">
//                   <button onClick={handleLogout} className="bnt__log Edu__text-S">Выйти</button>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div className="auth__btn">
//                   <button onClick={handleLogin} className="bnt__log Edu__text-S">Войти</button>
//                 </div>
//                 <div className="auth__btn">
//                   {/* <Link to='/Registration' className="bnt__log Edu__text-S">Регистрация</Link> */}
//                 </div>
//               </>
//             )}
//           </label>
//           <p className="input__text-p Montherat">Связь по 050ss2628953</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Authorization;

import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavBar from "../../components/NavBar";

function Authorization() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /* --------- 1. Принимаем JWT после Google-редиректа --------- */
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      setIsLoggedIn(true);
      // проверяем, заполнен ли профиль
      axios.get('/api/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          const t = res.data;
           
          if (!t.firstName || !t.position) navigate('/teacher/step2');  
          else navigate('/private_office');
        })
        .catch(() => navigate('/')); // если 401 – на главную
    }
  }, [searchParams, navigate]);

  /* --------- 2. Старый вход по логину/паролю --------- */
  const handleLogin = useCallback((e) => {
    e.preventDefault();
    setError(false);
    axios.post('/api/login', { username: name, password })
      .then(res => {
        localStorage.setItem('token', res.data.token);
        setIsLoggedIn(true);
        navigate('/private_office');
      })
      .catch(() => setError(true));
  }, [name, password, navigate]);

  /* --------- 3. Выход --------- */
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  }, [navigate]);

  /* --------- 4. Кнопка «Войти через Google» --------- */
  const googleLogin = () => {
    window.location.href = 'http://localhost:8092/api/auth/google'; // редирект на OAuth
  };

  return (
    <div className="сontents">
      <div className="header"><NavBar /></div>
      <div className="main">
        <h2 className="Edu__text-L center">Авторизация</h2>

        <div className="auth__contain">
          {/* ----------- Google-вход ----------- */}
          {!isLoggedIn && (
            <div className="auth__btn" style={{ marginBottom: '1rem' }}>
              <button onClick={googleLogin} className="bnt__log Edu__text-S">
                Войти через Google
              </button>
            </div>
          )}

          {/* ----------- старая форма ----------- */}
          <form onSubmit={handleLogin}>
            <p className="input__text Montherat">Логин</p>
            <input type="text" className="auth__input Montherat" value={name} onChange={e => setName(e.target.value)} placeholder="Логин" required />

            <p className="input__text Montherat">Пароль</p>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="off"
                className="auth__input Montherat"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Пароль"
                required
              />
              <div className="show-password-checkbox">
                <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} />
                <label className="Edu__text-S">Посмотреть пароль</label>
              </div>
            </div>
            {error && <p className="input__text Montherat">Неправильный логин или пароль</p>}

            <div className="auth__btn">
              <button type="submit" className="bnt__log Edu__text-S">Войти</button>
            </div>
          </form>

          {/* ----------- выход / состояние ----------- */}
          {isLoggedIn ? (
            <div className="auth__btn-center">
              <button onClick={handleLogout} className="bnt__log Edu__text-S">Выйти</button>
            </div>
          ) : null}

          <p className="input__text-p Montherat">Связь по 0502628953</p>
        </div>
      </div>
    </div>
  );
}

export default Authorization;