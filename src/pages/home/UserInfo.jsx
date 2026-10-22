import { useEffect, useState } from "react";
import api from '../../services/api';
import { useLocation, useParams } from "react-router-dom";
import NavBar from "../../components/NavBar";
import useAuthToken from "../../hooks/useAuthToken";
import YearSelector from "../../components/YearSelector";
import { useYears } from "../../hooks/useYears";
import "../../css/PrivateOfficeNew.css";
import "../../css/MyAnswers.css";
import "../../css/UserProfile.css";

function UserInfo() {
  const { id } = useParams();
  const location = useLocation();
  const token = useAuthToken();
  const orgId = new URLSearchParams(location.search).get("orgId");
  const { years, selectedYear, setSelectedYear, loading: yearsLoading } = useYears(orgId);
  const selectedYearId = selectedYear?.id ?? selectedYear?.yearId ?? null;

  useEffect(() => {
    if (yearsLoading || years.length === 0) return;
    const yearIdFromQuery = Number(new URLSearchParams(location.search).get("yearId"));
    if (!Number.isFinite(yearIdFromQuery) || yearIdFromQuery <= 0) return;
    const match = years.find((y) => (y.id ?? y.yearId) === yearIdFromQuery);
    if (match) setSelectedYear(match);
  }, [location.search, years, yearsLoading, setSelectedYear]);

  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState(null);
  const [adminOrgId, setAdminOrgId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Статус заморозки по id награды; меняется на месте после модерации.
  const [statuses, setStatuses] = useState({});

  useEffect(() => {
    if (yearsLoading) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = selectedYearId ? { yearId: selectedYearId } : {};
        const [profileRes, roleRes] = await Promise.all([
          api.get(orgId ? `/api/organizations/${orgId}/user/account/${id}` : `/api/user/account/${id}`, { params }),
          token
            ? api.get("/api/get/role")
            : Promise.resolve({ data: { role: "visitor", organization: null } }),
        ]);
        if (!mounted) return;
        setUserData(profileRes.data);
        setRole(roleRes.data.role ?? "visitor");
        setAdminOrgId(roleRes.data.organization?.id ?? null);

        setStatuses(Object.fromEntries(
          (profileRes.data.userAwards || []).map((item) => [item.id, item.status])
        ));
      } catch {
        if (mounted) setError("Ошибка загрузки профиля");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id, orgId, token, selectedYearId, yearsLoading]);

  const setActive = async (itemId, active) => {
    try {
      await api.patch(`/api/admin/teacher/answers/${itemId}`, { active });
      setStatuses((prev) => ({ ...prev, [itemId]: active ? "active" : "freeze" }));
    } catch { /* статус остаётся прежним */ }
  };

  // Модерировать можно только награды своей организации.
  const isAdmin = role === "admin" && (!orgId || String(adminOrgId) === String(orgId));
  const info = userData?.userInfo;

  const awards = (userData?.userAwards || []).map((item) => ({ ...item, status: statuses[item.id] ?? item.status }));
  const totalAwards = awards.length;
  const frozenAwards = awards.filter((i) => i.status === "freeze").length;
  // Этапы у каждой организации свои, поэтому группируем по тому, что пришло.
  const stageGroups = awards.reduce((acc, item) => {
    const key = String(item.stage);
    if (!acc.has(key)) acc.set(key, { name: item.stageName || "Этап", items: [] });
    acc.get(key).items.push(item);
    return acc;
  }, new Map());

  return (
    <div className="private-office-contents">
      <div className="header"><NavBar /></div>

      <div className="up-wrapper">
        <div className="up-page">

          {loading && (
            <div className="po-loading">
              <div className="po-spinner" />
              <span>Загрузка профиля...</span>
            </div>
          )}

          {error && !loading && (
            <div className="po-alert po-alert--error">{error}</div>
          )}

          {!loading && !error && userData && (
            <>
              {/* ── Карточка профиля ── */}
              <div className="up-profile-card">
                <div className="up-avatar">
                  {(info?.name ?? "?")[0]?.toUpperCase()}
                </div>
                <div className="up-profile-info">
                  <h1 className="up-name">{info?.name || "—"}</h1>
                  <p className="up-position">{info?.position || ""}</p>
                  <div className="up-meta">
                    {info?.institute && (
                      <span className="up-meta-chip">🏛️ {info.institute}</span>
                    )}
                    {info?.regular === "1" && (
                      <span className="up-meta-chip up-meta-chip--regular">Штатный</span>
                    )}
                    {info?.email && (
                      <span className="up-meta-chip">✉️ {info.email}</span>
                    )}
                  </div>
                </div>
                {totalAwards > 0 && (
                  <div className="up-stats">
                    <div className="up-stat">
                      <span className="up-stat__val">{totalAwards}</span>
                      <span className="up-stat__label">Наград</span>
                    </div>
                    <div className="up-stat">
                      <span className="up-stat__val up-stat__val--frozen">{frozenAwards}</span>
                      <span className="up-stat__label">Заморожено</span>
                    </div>
                  </div>
                )}
              </div>

              <YearSelector
                years={years}
                selectedYear={selectedYear}
                onChange={setSelectedYear}
                loading={yearsLoading}
              />

              {/* ── Секции наград ── */}
              {totalAwards === 0 ? (
                <div className="ma-empty">
                  <span className="ma-empty__icon">🏅</span>
                  <p>Наград пока нет</p>
                </div>
              ) : (
                [...stageGroups].map(([stageId, group]) => {
                  const sectionItems = group.items;
                  return (
                    <section key={stageId} className="ma-stage">
                      <div className="ma-stage__header">
                        <h3 className="ma-stage__title">{group.name}</h3>
                        <span className="ma-stage__badge">{sectionItems.length}</span>
                      </div>
                      <div className="ma-list">
                        {sectionItems.map((item, idx) => {
                          const isFrozen = item.status === "freeze";
                          return (
                            <div
                              key={item.id}
                              className={`ma-row${isFrozen ? " ma-row--frozen" : ""}`}
                            >
                              <div className="ma-row__top">
                                <div className="ma-row__num">{idx + 1}</div>
                                <div className="ma-row__name">{item.name}</div>
                                <div className="ma-row__topright">
                                  {isFrozen
                                    ? <span className="ma-row__freeze">❄️ Заморожена</span>
                                    : <span className="ma-row__active">✓ Активна</span>
                                  }
                                </div>
                              </div>
                              <div className="ma-row__bottom">
                                {item.link
                                  ? <a href={item.link} target="_blank" rel="noopener noreferrer" className="ma-row__link">↗ Документ</a>
                                  : <span className="ma-row__no-link">нет ссылки</span>
                                }
                                {isAdmin && (
                                  isFrozen
                                    ? (
                                      <button
                                        className="ma-btn ma-btn--unfreeze"
                                        onClick={() => setActive(item.id, true)}
                                      >
                                        ☀️ Разморозить
                                      </button>
                                    ) : (
                                      <button
                                        className="ma-btn up-btn--freeze"
                                        onClick={() => setActive(item.id, false)}
                                      >
                                        ❄️ Заморозить
                                      </button>
                                    )
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })
              )}

              {/* ── Экспертные начисления ── */}
              {userData?.expertAdjustments?.length > 0 && (
                <section className="ma-stage" style={{marginTop: '30px'}}>
                  <div className="ma-stage__header" style={{background: 'linear-gradient(90deg, #f0fdf4 0%, #ffffff 100%)', borderLeft: '4px solid #16a34a'}}>
                    <h3 className="ma-stage__title">⭐ Экспертные начисления</h3>
                    <span className="ma-stage__badge" style={{background: '#16a34a'}}>{userData.expertAdjustments.length}</span>
                  </div>
                  <div className="ma-list">
                    {userData.expertAdjustments.map((adj) => (
                      <div key={adj.id} className="ma-row" style={{borderLeft: adj.points > 0 ? '4px solid #16a34a' : '4px solid #dc2626'}}>
                        <div className="ma-row__top">
                          <div className="ma-row__num" style={{background: adj.points > 0 ? '#dcfce7' : '#fee2e2', color: adj.points > 0 ? '#16a34a' : '#dc2626'}}>
                            {adj.points > 0 ? `+${adj.points}` : adj.points}
                          </div>
                          <div className="ma-row__name">
                             <span style={{fontWeight: 'bold'}}>{adj.expertName}</span>: {adj.reason}
                          </div>
                          <div className="ma-row__topright">
                            <span className="ma-row__date" style={{fontSize: '12px', color: '#64748b'}}>{adj.createdAt}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default UserInfo;
