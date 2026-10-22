import { useEffect, useState, useCallback } from "react";
import api from '../../../services/api';
import { Link } from "react-router-dom";
import NavBar from "../../../components/NavBar";
import "../../../css/AdminAwards.css";

function AdminAwards() {
    // Step 1 — организация, за которую действует админ (выбирается в шапке)
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [orgResolved, setOrgResolved] = useState(false);

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

    // ── Current organization ────────────────────────────────────────────
    useEffect(() => {
        api
            .get("/api/get/role")
            .then((res) => setSelectedOrg(res.data?.organization ?? null))
            .catch((err) => console.error(err))
            .finally(() => setOrgResolved(true));
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
            .get(`/api/organizations/${selectedOrg.id}/user/account/${selectedTeacher.id}`)
            .then((res) => setUserData(res.data))
            .catch((err) => console.error(err))
            .finally(() => setLoadingAwards(false));
    }, [selectedOrg, selectedTeacher]);

    // ── Selection helpers ───────────────────────────────────────────────────
    const toggleItem = useCallback((itemId) => {
        setSelectedItems((prev) =>
            prev.includes(itemId) ? prev.filter((k) => k !== itemId) : [...prev, itemId]
        );
    }, []);

    // ── Freeze / unfreeze ───────────────────────────────────────────────────
    const handleAction = async (active) => {
        if (selectedItems.length === 0) return;
        setActionStatus("loading");
        setActionMsg("");

        try {
            for (const id of selectedItems) {
                await api.patch(`/api/admin/teacher/answers/${id}`, { active });
            }

            setActionStatus("success");
            setActionMsg(active ? "Успешно разморожено" : "Успешно заморожено");

            const res = await api.get(`/api/organizations/${selectedOrg.id}/user/account/${selectedTeacher.id}`);
            setUserData(res.data);
            setSelectedItems([]);
        } catch (err) {
            setActionStatus("error");
            setActionMsg(err.response?.data?.error ?? "Ошибка при выполнении действия");
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
                                <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="aa-link"
                                >
                                    Ссылка ↗
                                </a>
                            )}
                            <input
                                type="checkbox"
                                className="aa-checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => toggleItem(item.id)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Этапы у каждой организации свои, поэтому группируем по тому, что пришло.
    const stageGroups = [...(userData?.userAwards ?? []).reduce((acc, item) => {
        const key = String(item.stage);
        if (!acc.has(key)) acc.set(key, { name: item.stageName || "Этап", items: [] });
        acc.get(key).items.push(item);
        return acc;
    }, new Map()).values()];
    const hasAnyAwards = stageGroups.length > 0;

    return (
        <div className="aa-root">
            <div className="header">
                <NavBar />
            </div>

            <div className="aa-layout">
                {/* ── Left panel: orgs + teachers ── */}
                <aside className="aa-sidebar">
                    <h2 className="aa-sidebar__heading">Организация</h2>
                    <div className="aa-org-list">
                        {selectedOrg ? (
                            <span className="aa-org-btn aa-org-btn--active">{selectedOrg.name}</span>
                        ) : orgResolved && (
                            <p className="aa-hint">Выберите организацию в шапке сайта</p>
                        )}
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
                            <p>Выберите организацию в шапке сайта</p>
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
                                        {userData.userInfo?.institute} · {userData.userInfo?.position}
                                    </p>
                                    <p className="aa-teacher-header__meta">
                                        {userData.userInfo?.email}
                                    </p>
                                </div>
                                <Link
                                    to={`/user/${selectedTeacher.id}?orgId=${selectedOrg.id}`}
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
                                    {stageGroups.map((group) =>
                                        renderSection(group.items, group.name)
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
                                        onClick={() => handleAction(false)}
                                    >
                                        ❄ Заморозить
                                    </button>
                                    <button
                                        className="aa-action-bar__btn aa-action-bar__btn--unfreeze"
                                        disabled={selectedItems.length === 0 || actionStatus === "loading"}
                                        onClick={() => handleAction(true)}
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
