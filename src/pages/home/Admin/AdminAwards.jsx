import { useEffect, useState, useCallback } from "react";
import api from '../../../services/api';
import { Link } from "react-router-dom";
import NavBar from "../../../components/NavBar";
import useAuthToken from "../../../hooks/useAuthToken";
import "../../../css/AdminAwards.css";

const AWARD_SECTIONS = [
    { key: "userAwards", label: "Личные достижения" },
    { key: "userResearch", label: "Научно-исследовательская деятельность" },
    { key: "userInnovative", label: "Инновационно-образовательная деятельность" },
    { key: "userSocial", label: "Воспитательная, общественная деятельность" },
];

function AdminAwards() {
    const token = useAuthToken();

    // Step 1 — organizations list
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrg, setSelectedOrg] = useState(null);

    // Step 2 — teachers in org
    const [teachers, setTeachers] = useState([]);
    const [loadingTeachers, setLoadingTeachers] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    // Step 3 — teacher awards
    const [userData, setUserData] = useState(null);
    const [loadingAwards, setLoadingAwards] = useState(false);

    // Selection for bulk freeze/unfreeze
    const [selectedItems, setSelectedItems] = useState([]);
    const [actionStatus, setActionStatus] = useState(null); // null | 'loading' | 'success' | 'error'
    const [actionMsg, setActionMsg] = useState("");

    // Search inside teachers list
    const [searchQuery, setSearchQuery] = useState("");

    // ── Load organizations ──────────────────────────────────────────────────
    useEffect(() => {
        api
            .get("/api/organizations")
            .then((res) => setOrganizations(res.data))
            .catch((err) => console.error(err));
    }, []);

    // ── Load teachers when org selected ────────────────────────────────────
    useEffect(() => {
        if (!selectedOrg) return;
        setLoadingTeachers(true);
        setTeachers([]);
        setSelectedTeacher(null);
        setUserData(null);
        setSelectedItems([]);

        api
            .get(`/api/rating/users?orgId=${selectedOrg.id}`)
            .then((res) => {
                const data = res.data;
                setTeachers(Array.isArray(data) ? data : data.users ?? []);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoadingTeachers(false));
    }, [selectedOrg]);

    // ── Load awards when teacher selected ──────────────────────────────────
    useEffect(() => {
        if (!selectedTeacher) return;
        setLoadingAwards(true);
        setUserData(null);
        setSelectedItems([]);

        api
            .get(`/api/user/account/${selectedTeacher.id}`)
            .then((res) => setUserData(res.data))
            .catch((err) => console.error(err))
            .finally(() => setLoadingAwards(false));
    }, [selectedTeacher]);

    // ── Selection helpers ───────────────────────────────────────────────────
    const toggleItem = useCallback((itemId, stage) => {
        const key = `${itemId}-${stage}`;
        setSelectedItems((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    }, []);

    // ── Freeze / unfreeze ───────────────────────────────────────────────────
    const handleAction = async (action) => {
        if (selectedItems.length === 0) return;
        setActionStatus("loading");
        setActionMsg("");

        try {
            // Group selected items by stage
            const grouped = selectedItems.reduce((acc, item) => {
                const [itemId, stage] = item.split("-");
                if (!acc[stage]) acc[stage] = [];
                acc[stage].push({ id: itemId });
                return acc;
            }, {});

            // Send one request per stage
            for (const stage in grouped) {
                const url = `/api/admin/${stage}/${action}`;
                await api.put(url, { idBag: grouped[stage] }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            setActionStatus("success");
            setActionMsg(
                action === "freeze" ? "Успешно заморожено" : "Успешно разморожено"
            );

            // Refresh awards for this teacher
            const res = await api.get(`/api/user/account/${selectedTeacher.id}`);
            setUserData(res.data);
            setSelectedItems([]);
        } catch (err) {
            setActionStatus("error");
            setActionMsg(err.response?.data?.message ?? "Ошибка при выполнении действия");
        }
    };

    const filteredTeachers = teachers.filter((t) =>
        (t.name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ── Render award section ────────────────────────────────────────────────
    const renderSection = (items, label) => {
        if (!items?.length) return null;
        return (
            <div className="aa-section" key={label}>
                <h3 className="aa-section__title">{label}</h3>
                {items.map((item, i) => (
                    <div
                        key={item.id}
                        className={`aa-award-row${item.status === "freeze" ? " aa-award-row--frozen" : ""}`}
                        style={{ "--row-bg": i % 2 === 0 ? "var(--row-even)" : "var(--row-odd)" }}
                    >
                        <div className="aa-award-row__left">
                            <span className={`aa-award-name${item.status === "freeze" ? " aa-award-name--frozen" : ""}`}>
                                {item.name}
                            </span>
                            {item.status === "freeze" && (
                                <span className="aa-badge aa-badge--frozen">Заморожено</span>
                            )}
                        </div>
                        <div className="aa-award-row__right">
                            {item.link && (
                                <Link
                                    to={item.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="aa-link"
                                >
                                    Ссылка ↗
                                </Link>
                            )}
                            <input
                                type="checkbox"
                                className="aa-checkbox"
                                checked={selectedItems.includes(`${item.id}-${item.stage}`)}
                                onChange={() => toggleItem(item.id, item.stage)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const hasAnyAwards =
        userData &&
        AWARD_SECTIONS.some((s) => (userData[s.key]?.length ?? 0) > 0);

    return (
        <div className="aa-root">
            <div className="header">
                <NavBar />
            </div>

            <div className="aa-layout">
                {/* ── Left panel: orgs + teachers ── */}
                <aside className="aa-sidebar">
                    <h2 className="aa-sidebar__heading">Организации</h2>
                    <div className="aa-org-list">
                        {organizations.map((org) => (
                            <button
                                key={org.id}
                                className={`aa-org-btn${selectedOrg?.id === org.id ? " aa-org-btn--active" : ""}`}
                                onClick={() => setSelectedOrg(org)}
                            >
                                {org.name}
                            </button>
                        ))}
                    </div>

                    {selectedOrg && (
                        <>
                            <h2 className="aa-sidebar__heading aa-sidebar__heading--sub">
                                Преподаватели
                            </h2>
                            <input
                                className="aa-search"
                                type="text"
                                placeholder="Поиск по ФИО..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="aa-teacher-list">
                                {loadingTeachers ? (
                                    <p className="aa-hint">Загрузка...</p>
                                ) : filteredTeachers.length === 0 ? (
                                    <p className="aa-hint">Преподаватели не найдены</p>
                                ) : (
                                    filteredTeachers.map((t) => (
                                        <button
                                            key={t.id}
                                            className={`aa-teacher-btn${selectedTeacher?.id === t.id ? " aa-teacher-btn--active" : ""}`}
                                            onClick={() => setSelectedTeacher(t)}
                                        >
                                            {t.name}
                                        </button>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </aside>

                {/* ── Right panel: awards ── */}
                <main className="aa-main">
                    {!selectedOrg && (
                        <div className="aa-empty">
                            <span className="aa-empty__icon">🏢</span>
                            <p>Выберите организацию слева</p>
                        </div>
                    )}

                    {selectedOrg && !selectedTeacher && (
                        <div className="aa-empty">
                            <span className="aa-empty__icon">👤</span>
                            <p>Выберите преподавателя из списка</p>
                        </div>
                    )}

                    {selectedTeacher && loadingAwards && (
                        <div className="aa-empty">
                            <span className="aa-empty__icon">⏳</span>
                            <p>Загрузка наград...</p>
                        </div>
                    )}

                    {selectedTeacher && !loadingAwards && userData && (
                        <>
                            {/* Teacher header */}
                            <div className="aa-teacher-header">
                                <div>
                                    <h2 className="aa-teacher-header__name">
                                        {userData.userInfo?.name}
                                    </h2>
                                    <p className="aa-teacher-header__meta">
                                        {userData.userInfo?.institut} · {userData.userInfo?.position}
                                    </p>
                                    <p className="aa-teacher-header__meta">
                                        {userData.userInfo?.email}
                                    </p>
                                </div>
                                <Link
                                    to={`/user/admin/${selectedTeacher.id}`}
                                    className="aa-teacher-header__link"
                                >
                                    Полная карточка ↗
                                </Link>
                            </div>

                            {/* Awards */}
                            {!hasAnyAwards ? (
                                <div className="aa-empty aa-empty--inline">
                                    <span className="aa-empty__icon">📭</span>
                                    <p>У этого преподавателя нет наград</p>
                                </div>
                            ) : (
                                <div className="aa-awards">
                                    {AWARD_SECTIONS.map((s) =>
                                        renderSection(userData[s.key], s.label)
                                    )}
                                </div>
                            )}

                            {/* Action bar */}
                            {hasAnyAwards && (
                                <div className="aa-action-bar">
                                    <span className="aa-action-bar__hint">
                                        Выбрано: {selectedItems.length}
                                    </span>
                                    <button
                                        className="aa-action-bar__btn aa-action-bar__btn--freeze"
                                        disabled={selectedItems.length === 0 || actionStatus === "loading"}
                                        onClick={() => handleAction("freeze")}
                                    >
                                        ❄ Заморозить
                                    </button>
                                    <button
                                        className="aa-action-bar__btn aa-action-bar__btn--unfreeze"
                                        disabled={selectedItems.length === 0 || actionStatus === "loading"}
                                        onClick={() => handleAction("active")}
                                    >
                                        🔥 Разморозить
                                    </button>
                                    {actionStatus === "success" && (
                                        <span className="aa-action-bar__msg aa-action-bar__msg--ok">
                                            ✓ {actionMsg}
                                        </span>
                                    )}
                                    {actionStatus === "error" && (
                                        <span className="aa-action-bar__msg aa-action-bar__msg--err">
                                            ✗ {actionMsg}
                                        </span>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

export default AdminAwards;
