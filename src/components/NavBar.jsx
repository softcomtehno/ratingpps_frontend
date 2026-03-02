import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const NavBar = () => {
  const [role, setRole] = useState("visitor");
  const [organizations, setOrganizations] = useState([]);

  const token = localStorage.getItem("token");

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

      // 2) Организации
      try {
        const res = await api.get("/api/organizations");
        const items = Array.isArray(res.data)
          ? res.data
          : (res.data?.["hydra:member"] ?? res.data?.member ?? []);
        setOrganizations(items);
      } catch (e) {
        console.error("Ошибка загрузки организаций:", e);
        setOrganizations([]);
      }
    };

    load();
  }, [token]);

  const orgPath = (org) => `/organization/${org.id}`; // ✅ стабильный роут

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
    admin: [
      { to: "/LPPS", label: "Список ППС" },
      { to: "/Authorization", label: "Авторизация" },
      { to: "/private_office", label: "Личный кабинет" },
      { to: "/admin", label: "Админ Панель" },
    ],
  };

  const burgerItems = menuByRole[role] ?? menuByRole.visitor;

  return (
    <nav className="nav">
      <div className="nav__in">
        <Link to="/" className="nav__title">
          <h2>Рейтинг ППС!</h2>
        </Link>

        <ul className="nav__list">
          <li>
            <Link to="/">Главная</Link>
          </li>

          {/* ✅ Организации из API */}
          {organizations.map((org) => (
            <li key={org.id}>
              <Link to={orgPath(org)}>{org.name}</Link>
            </li>
          ))}

          {/* Бургер */}
          <li>
            <div className="hamburger-menu">
              <input id="menu__toggle" type="checkbox" />
              <ul className="menu__box">
                {burgerItems.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="menu__item">
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
