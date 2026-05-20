import { useEffect, useState } from "react";
import api from '../services/api';
import { Link } from "react-router-dom";
import useAuthToken from "../hooks/useAuthToken";

const NavBar = () => {
  const [role, setRole] = useState("visitor");
  const [menuOpen, setMenuOpen] = useState(false);
  const token = useAuthToken();

  useEffect(() => {
    const load = async () => {
      // 1) Роль
      try {
        const res = await api.get("/api/get/role", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setRole(res?.data?.role ?? "visitor");
      } catch {
        setRole("visitor");
      }
    };

    load();
  }, [token]);

  // Меню для ролей (чтобы не дублировать 4 раза одно и то же)
  const menuByRole = {
    visitor: [
      { to: "/LPPS", label: "Список ППС" },
      { to: "/Authorization", label: "Авторизация" },
    ],
    teacher: [
      { to: "/LPPS", label: "Список ППС" },
      { to: "/Authorization", label: "Авторизация" },
      { to: "/private_office", label: "Личный кабинет" },
    ],
    director: [
      { to: "/LPPS", label: "Список ППС" },
      { to: "/Authorization", label: "Авторизация" },
      { to: "/private_office", label: "Личный кабинет" },
      { to: "/director", label: "Панель директора" },
    ],
    admin: [
      { to: "/LPPS", label: "Список ППС" },
      { to: "/Authorization", label: "Авторизация" },
      { to: "/private_office", label: "Личный кабинет" },
      { to: "/admin", label: "Админ Панель" },
    ],
    expert: [
      { to: "/LPPS", label: "Список ППС" },
      { to: "/Authorization", label: "Авторизация" },
      { to: "/private_office", label: "Личный кабинет" },
      { to: "/expert", label: "Панель эксперта" },
    ],
  };

  const burgerItems = menuByRole[role] ?? menuByRole.visitor;

  return (
    <nav className="nav">
      <div className="nav__in">
        <Link to="/" className="nav__title">
          <h2>Рейтинг ППС!</h2>
        </Link>

        <ul className="nav__list" style={{ justifyContent: 'flex-end' }}>
          <li>
            <Link to="/">Главная</Link>
          </li>

          {/* Бургер */}
          <li>
            <div className="hamburger-menu">
              <button
                type="button"
                className="menu__toggle"
                aria-label="Открыть меню"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
              >
                ☰
              </button>
              <ul className={`menu__box ${menuOpen ? "menu__box--open" : ""}`}>
                {burgerItems.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="menu__item" onClick={() => setMenuOpen(false)}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
