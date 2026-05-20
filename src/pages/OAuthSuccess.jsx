import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { setToken } from "../services/auth";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [msg, setMsg] = useState("Обрабатываем вход...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      //setMsg("❌ Нет токена в адресе");
      setTimeout(() => navigate("/"), 300);
      return;
    }

    setToken(token);
    //setMsg("✅ Токен получен, загружаем профиль...");

    api.get("/api/me")
      .then(res => {

        const t = res.data;
        //alert(JSON.stringify(t, null, 2));
        //setMsg(`Профиль: ${t.firstName || "?"} ${t.lastName || "?"} | position: ${t.position?.name || "нет"}`);
        if (!t.firstName || !t.position) {
          //setMsg("→ Переход к заполнению профиля...");
          setTimeout(() => navigate("/teacher/step2"), 150);
        }
        else {
          //setMsg("→ Переход в кабинет...");
          setTimeout(() => navigate("/private_office"), 150);
        }
      })
      .catch(err => {
        setMsg(`❌ Ошибка /api/me: ${err.response?.status} ${err.response?.data?.message}`);
        // setTimeout(() => navigate("/"), 3000);
      });
  }, [searchParams, navigate]);

  return (
    <div className="auth__contain">
      <h2 className="Edu__text-L center">Вход выполнен</h2>
      <p className="Edu__text-S center">{msg}</p>
    </div>
  );
}
