import { useEffect, useState } from "react";
import api from '../services/api';
import { Link } from "react-router-dom";
import useAuthToken from "../hooks/useAuthToken";
import { getOrganizationId, reconcileOrganization, setOrganizationId } from "../services/organization";

const NavBar = () => {
  const [role, setRole] = useState("visitor");
  const [organizations, setOrganizations] = useState([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [organizationId, setOrganizationIdState] = useState(getOrganizationId());
  const [menuOpen, setMenuOpen] = useState(false);
  const token = useAuthToken();

  useEffect(() => {
    const load = async () => {
      // 1) Роль
      try {
        // Без заголовка организации: сохранённый выбор мог устареть, и тогда
        // бэкенд отказал бы в самом запросе, который нужен, чтобы его поправить.
        const res = await api.get("/api/get/role", { skipOrganization: true });
        const available = res?.data?.organizations ?? [];
        const superAdmin = Boolean(res?.data?.isSuperAdmin);
        setRole(res?.data?.role ?? "visitor");
        setOrganizations(available);
        setIsSuperAdmin(superAdmin);

        const before = getOrganizationId();
        const chosen = reconcileOrganization(available, superAdmin);
        setOrganizationIdState(chosen);
        // Страница уже могла загрузить данные без выбранной организации.
        if (chosen !== before && getOrganizationId() === chosen) {
          window.location.reload();
        }
      } catch {
        setRole("visitor");
        setOrganizations([]);
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
  const canSwitch = organizations.length > 1;

  const switchOrganization = (value) => {
    setOrganizationId(value || null);
    window.location.reload();
  };

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

          {canSwitch && (
            <li>
              <select
                className="nav__org-select"
                aria-label="Организация"
                value={organizationId ?? ""}
                onChange={(e) => switchOrganization(e.target.value)}
              >
                {isSuperAdmin && <option value="">Все организации</option>}
                {organizations.map((o) => (
                  <option key={o.id} value={String(o.id)}>{o.name}</option>
                ))}
              </select>
            </li>
          )}

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
