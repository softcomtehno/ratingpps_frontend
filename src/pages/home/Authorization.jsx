import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavBar from "../../components/NavBar";
import { clearToken, getToken, setToken } from "../../services/auth";
import "../../css/Authorization.css";

function Authorization() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;

    setToken(token);
    setIsLoggedIn(true);

    axios
      .get("/api/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const t = res.data;
        if (!t.firstName || !t.position) navigate("/teacher/step2");
        else navigate("/private_office");
      })
      .catch(() => navigate("/"));
  }, [searchParams, navigate]);

  const handleLogout = () => {
    clearToken();
    setIsLoggedIn(false);
    navigate("/");
  };

  const googleLogin = () => {
    const base = import.meta.env.VITE_API_URL || "https://api.pps.makalabox.com";
    window.location.href = `${base}/api/auth/google`;
  };

  return (
    <div className="auth-page">
      <div className="header">
        <NavBar />
      </div>

      <main className="auth-main">
        <section className="auth-card">
          <h1 className="auth-title">Авторизация</h1>
          {!isLoggedIn ? (
            <>
              <p className="auth-text">Вход в систему осуществляется через Google-аккаунт.</p>
              <button onClick={googleLogin} className="auth-google-btn" type="button">
                Войти через Google
              </button>
            </>
          ) : (
            <>
              <p className="auth-text">Вы уже авторизованы в системе.</p>
              <button onClick={handleLogout} className="auth-logout-btn" type="button">
                Выйти
              </button>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default Authorization;
