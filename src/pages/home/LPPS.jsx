import { useCallback, useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "../../css/LPPS.css";

function Lpps() {
  const [organizations, setOrganizations] = useState([]);
  const [orgId, setOrgId] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/organizations")
      .then((res) => {
        const list = res.data ?? [];
        setOrganizations(list);
        setOrgId(list[0]?.id ?? null);
        if (list.length === 0) setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  // Организации независимы: учитель виден и оценивается внутри каждой своей.
  const fetchData = useCallback(async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const response = await api.get("/api/rating/users", { params: { orgId } });
      setUsers(response.data.users);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="lpps-page">
      <div className="header">
        <NavBar />
      </div>

      <main className="lpps-main">
        <section className="lpps-hero">
          <h1 className="lpps-title">Каталог преподавателей</h1>
          <p className="lpps-subtitle">Поиск и быстрый переход к профилю с наградами</p>
        </section>

        <section className="lpps-panel">
          {organizations.length > 1 && (
            <div className="lpps-orgs" role="tablist">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  role="tab"
                  aria-selected={org.id === orgId}
                  className={`lpps-org${org.id === orgId ? " lpps-org--active" : ""}`}
                  onClick={() => setOrgId(org.id)}
                >
                  {org.name}
                </button>
              ))}
            </div>
          )}
          <label htmlFor="teacher-search" className="lpps-search-label">
            <span className="lpps-search-icon">🔎</span>
            <input
              id="teacher-search"
              type="text"
              placeholder="Введите ФИО преподавателя"
              className="lpps-search-input"
              value={searchQuery}
              onChange={handleSearchInputChange}
            />
          </label>

          {loading ? (
            <div className="lpps-state">Загрузка...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="lpps-state">Ничего не найдено</div>
          ) : (
            <div className="lpps-users">
              {filteredUsers.map((user) => (
                <Link key={user.id} to={`/user/${user.id}?orgId=${orgId}`} className="lpps-user-card">
                  <span className="lpps-user-avatar">
                    {(user.name || "?").trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="lpps-user-name">{user.name}</span>
                  <span className="lpps-user-arrow">→</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Lpps;
