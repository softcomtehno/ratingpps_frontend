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

const SECTIONS = [
  { key: "userAwards", title: "🏅 Личные достижения", stage: "awards" },
  { key: "userResearch", title: "🔬 Научно-исследовательская деятельность", stage: "research" },
  { key: "userInnovative", title: "💡 Инновационно-образовательная деятельность", stage: "innovative" },
  { key: "userSocial", title: "🤝 Воспитательная и общественная деятельность", stage: "social" },
];

function UserInfo() {
  const { id } = useParams();
  const location = useLocation();
  const token = useAuthToken();
  const { years, selectedYear, setSelectedYear, loading: yearsLoading } = useYears();
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState({});

  useEffect(() => {
    if (yearsLoading) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = selectedYearId ? { yearId: selectedYearId } : {};
        const [profileRes, roleRes] = await Promise.all([
          api.get(`/api/user/account/${id}`, { params }),
          token
            ? api.get("/api/get/role", { headers: { Authorization: `Bearer ${token}` } })
            : Promise.resolve({ data: { role: "visitor" } }),
        ]);
        if (!mounted) return;
        setUserData(profileRes.data);
        setRole(roleRes.data.role ?? "visitor");

        const map = {};
        SECTIONS.forEach(({ key, stage }) => {
          (profileRes.data[key] || []).forEach((item) => {
            map[`${stage}-${item.id}`] = { ...item, stage };
          });
        });
        setItems(map);
      } catch {
        if (mounted) setError("Ошибка загрузки профиля");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id, token, selectedYearId, yearsLoading]);

  const handleFreeze = async (itemKey, itemId, stage) => {
    try {
      await api({
        method: "put",
        url: `/api/user/account/${stage}/freeze`,
        headers: { Authorization: `Bearer ${token}` },
        data: { idBag: [{ id: itemId }] },
      });
      setItems((prev) => ({ ...prev, [itemKey]: { ...prev[itemKey], status: "freeze" } }));
    } catch { /* ignore */ }
  };

  const handleUnfreeze = async (itemKey, itemId, stage) => {
    try {
      await api({
        method: "put",
        url: `/api/user/account/${stage}/active`,
        headers: { Authorization: `Bearer ${token}` },
        data: { idBag: [{ id: itemId }] },
      });
      setItems((prev) => ({ ...prev, [itemKey]: { ...prev[itemKey], status: "active" } }));
    } catch { /* ignore */ }
  };

  const isAdmin = role === "admin";
  const info = userData?.userInfo;

  const totalAwards = SECTIONS.reduce(
    (sum, { key }) => sum + (userData?.[key]?.length ?? 0), 0
  );
  const frozenAwards = Object.values(items).filter((i) => i.status === "freeze").length;
  const stageTitleMap = {
    "1": "🔬 Научно-исследовательская деятельность",
    "2": "🏅 Личные достижения",
    "3": "💡 Инновационно-образовательная деятельность",
    "4": "🤝 Воспитательная и общественная деятельность",
  };
  const awardsByStage = (userData?.userAwards || []).reduce((acc, item) => {
    const sid = String(item.stage ?? "2");
    if (!acc[sid]) acc[sid] = [];
    acc[sid].push(items[`${sid === "2" ? "awards" : sid === "1" ? "research" : sid === "3" ? "innovative" : "social"}-${item.id}`] || item);
    return acc;
  }, {});
  const orderedStageIds = ["1", "2", "3", "4"];

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
                    {info?.institut && (
                      <span className="up-meta-chip">🏛️ {info.institut}</span>
                    )}
                    {info?.regular && (
                      <span className="up-meta-chip up-meta-chip--regular">{info.regular}</span>
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
                orderedStageIds.map((stageId) => {
                  const sectionItems = awardsByStage[stageId] || [];
                  if (sectionItems.length === 0) return null;
                  return (
                    <section key={stageId} className="ma-stage">
                      <div className="ma-stage__header">
                        <h3 className="ma-stage__title">{stageTitleMap[stageId]}</h3>
                        <span className="ma-stage__badge">{sectionItems.length}</span>
                      </div>
                      <div className="ma-list">
                        {sectionItems.map((item, idx) => {
                          const isFrozen = item.status === "freeze";
                          const stageKey = stageId === "2" ? "awards" : stageId === "1" ? "research" : stageId === "3" ? "innovative" : "social";
                          const itemKey = `${stageKey}-${item.id}`;
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
                                        onClick={() => handleUnfreeze(itemKey, item.id, stageKey)}
                                      >
                                        ☀️ Разморозить
                                      </button>
                                    ) : (
                                      <button
                                        className="ma-btn up-btn--freeze"
                                        onClick={() => handleFreeze(itemKey, item.id, stageKey)}
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
