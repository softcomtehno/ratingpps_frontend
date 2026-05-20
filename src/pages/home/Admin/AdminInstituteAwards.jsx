import { useEffect, useState } from "react";
import api from '../../../services/api';
import NavBar from "../../../components/NavBar";
import useAuthToken from "../../../hooks/useAuthToken";
import "../../../css/AdminAwards.css";

function AdminInstituteAwards() {
    const token = useAuthToken();

    const [institutes, setInstitutes] = useState([]);
    const [selectedInstitute, setSelectedInstitute] = useState(null);

    const [answers, setAnswers] = useState([]);
    const [loadingAnswers, setLoadingAnswers] = useState(false);

    // Selection for bulk freeze/unfreeze
    const [selectedItems, setSelectedItems] = useState([]);
    const [actionStatus, setActionStatus] = useState(null);
    const [actionMsg, setActionMsg] = useState("");

    const [searchQuery, setSearchQuery] = useState("");

    // Load all institutes (we can reuse the rating endpoint for simplicity)
    useEffect(() => {
        api
            .get("/api/rating/institutes")
            .then((res) => {
                setInstitutes(res.data.institutes || []);
            })
            .catch((err) => console.error(err));
    }, []);

    // Load answers when institute selected
    useEffect(() => {
        if (!selectedInstitute) return;
        setLoadingAnswers(true);
        setAnswers([]);
        setSelectedItems([]);

        api
            .get(`/api/admin/institute/awards/${selectedInstitute.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then((res) => setAnswers(res.data))
            .catch((err) => console.error(err))
            .finally(() => setLoadingAnswers(false));
    }, [selectedInstitute, token]);

    const toggleItem = (itemId) => {
        setSelectedItems((prev) =>
            prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
        );
    };

    const handleAction = async (action) => {
        if (selectedItems.length === 0) return;
        setActionStatus("loading");
        setActionMsg("");

        try {
            const body = { idBag: selectedItems.map(id => ({ id })) };

            await api.put(`/api/admin/institute/awards/${action}`, body, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setActionStatus("success");
            setActionMsg(action === "freeze" ? "Успешно заморожено" : "Успешно разморожено");

            // Refresh answers
            const res = await api.get(`/api/admin/institute/awards/${selectedInstitute.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnswers(res.data);
            setSelectedItems([]);
        } catch (err) {
            setActionStatus("error");
            setActionMsg(err.response?.data?.message ?? "Ошибка при выполнении действия");
        }
    };

    const filteredInstitutes = institutes.filter((inst) =>
        (inst.name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const hasAnyAwards = answers.length > 0;

    return (
        <div className="aa-root">
            <div className="header"><NavBar /></div>

            <div className="aa-layout">
                {/* ── Left panel ── */}
                <aside className="aa-sidebar">
                    <h2 className="aa-sidebar__heading">Институты</h2>
                    <input
                        className="aa-search"
                        type="text"
                        placeholder="Поиск по названию..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="aa-org-list">
                        {filteredInstitutes.length === 0 ? (
                            <p className="aa-hint">Институты не найдены</p>
                        ) : (
                            filteredInstitutes.map((inst) => (
                                <button
                                    key={inst.id}
                                    className={`aa-org-btn${selectedInstitute?.id === inst.id ? " aa-org-btn--active" : ""}`}
                                    onClick={() => setSelectedInstitute(inst)}
                                >
                                    {inst.name} ({inst.organization})
                                </button>
                            ))
                        )}
                    </div>
                </aside>

                {/* ── Right panel ── */}
                <main className="aa-main">
                    {!selectedInstitute && (
                        <div className="aa-empty">
                            <span className="aa-empty__icon">🏢</span>
                            <p>Выберите институт слева</p>
                        </div>
                    )}

                    {selectedInstitute && loadingAnswers && (
                        <div className="aa-empty">
                            <span className="aa-empty__icon">⏳</span>
                            <p>Загрузка данных...</p>
                        </div>
                    )}

                    {selectedInstitute && !loadingAnswers && (
                        <>
                            <div className="aa-teacher-header">
                                <div>
                                    <h2 className="aa-teacher-header__name">
                                        {selectedInstitute.name}
                                    </h2>
                                    <p className="aa-teacher-header__meta">
                                        {selectedInstitute.organization} · Баллы: {selectedInstitute.points}
                                    </p>
                                </div>
                            </div>

                            {!hasAnyAwards ? (
                                <div className="aa-empty aa-empty--inline">
                                    <span className="aa-empty__icon">📭</span>
                                    <p>У этого института нет ответов</p>
                                </div>
                            ) : (
                                <div className="aa-awards">
                                    <div className="aa-section">
                                        <h3 className="aa-section__title">Ответы на вопросы</h3>
                                        {answers.map((item, i) => (
                                            <div
                                                key={item.id}
                                                className={`aa-award-row${item.status === "freeze" ? " aa-award-row--frozen" : ""}`}
                                                style={{ "--row-bg": i % 2 === 0 ? "var(--row-even)" : "var(--row-odd)" }}
                                            >
                                                <div className="aa-award-row__left" style={{ flex: 1 }}>
                                                    <span className={`aa-award-name${item.status === "freeze" ? " aa-award-name--frozen" : ""}`}>
                                                        {item.titleName} — {item.subtitleName}
                                                    </span>
                                                    {item.status === "freeze" && (
                                                        <span className="aa-badge aa-badge--frozen">Заморожено</span>
                                                    )}
                                                </div>
                                                <div className="aa-award-row__right">
                                                    {item.link ? (
                                                        <a href={item.link} target="_blank" rel="noreferrer" className="aa-link">
                                                            Ссылка ↗
                                                        </a>
                                                    ) : (
                                                        <span className="aa-hint">Нет ссылки</span>
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
                                </div>
                            )}

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

export default AdminInstituteAwards;
