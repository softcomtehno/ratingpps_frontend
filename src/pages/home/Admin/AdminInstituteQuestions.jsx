import { useEffect, useState, useCallback } from "react";
import api from '../../../services/api';
import NavBar from "../../../components/NavBar";
import useAuthToken from "../../../hooks/useAuthToken";
import "../../../css/AdminInstituteQuestions.css";

const EMPTY_TITLE = { titleName: "", isActive: true };
const EMPTY_SUB = { subtitleName: "", point: "" };

export default function AdminInstituteQuestions() {
    const token = useAuthToken();
    const authHeader = { Authorization: `Bearer ${token}` };

    /* ── state ─────────────────────────────────────────────────── */
    const [titles, setTitles] = useState([]);
    const [subtitles, setSubtitles] = useState([]);
    const [loading, setLoading] = useState(true);

    /* selected title for drill-down */
    const [selectedTitle, setSelectedTitle] = useState(null);

    /* title modal */
    const [titleModal, setTitleModal] = useState(null); // null | "add" | "edit"
    const [editingTitle, setEditingTitle] = useState(null);
    const [titleForm, setTitleForm] = useState(EMPTY_TITLE);
    const [titleSaving, setTitleSaving] = useState(false);
    const [titleError, setTitleError] = useState("");

    /* subtitle modal */
    const [subModal, setSubModal] = useState(null); // null | "add" | "edit"
    const [editingSub, setEditingSub] = useState(null);
    const [subForm, setSubForm] = useState(EMPTY_SUB);
    const [subSaving, setSubSaving] = useState(false);
    const [subError, setSubError] = useState("");

    const [deletingTitleId, setDeletingTitleId] = useState(null);
    const [deletingSubId, setDeletingSubId] = useState(null);
    const [globalError, setGlobalError] = useState("");

    /* ── fetch ─────────────────────────────────────────────────── */
    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [tRes, sRes] = await Promise.all([
                api.get("/api/institute/question/title"),
                api.get("/api/institute/question/subtitle"),
            ]);
            const ts = Array.isArray(tRes.data) ? tRes.data : [];
            const ss = Array.isArray(sRes.data) ? sRes.data : [];
            setTitles(ts);
            setSubtitles(ss);
            // keep selectedTitle in sync
            if (selectedTitle) {
                const fresh = ts.find(t => t.titleId === selectedTitle.titleId);
                setSelectedTitle(fresh ?? null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []); // eslint-disable-line

    useEffect(() => { fetchAll(); }, [fetchAll]);

    /* ── Title CRUD ────────────────────────────────────────────── */
    const openAddTitle = () => {
        setTitleForm(EMPTY_TITLE);
        setTitleError("");
        setEditingTitle(null);
        setTitleModal("add");
    };

    const openEditTitle = (t) => {
        setTitleForm({ titleName: t.titleName, isActive: t.isActive });
        setTitleError("");
        setEditingTitle(t);
        setTitleModal("edit");
    };

    const closeTitleModal = () => { setTitleModal(null); setEditingTitle(null); setTitleError(""); };

    const handleSaveTitle = async () => {
        if (!titleForm.titleName.trim()) { setTitleError("Введите название"); return; }
        setTitleSaving(true); setTitleError("");
        try {
            if (titleModal === "add") {
                await api.post("/api/admin/institute/question/title",
                    { titleName: titleForm.titleName.trim(), isActive: titleForm.isActive },
                    { headers: authHeader });
            } else {
                await api.put(`/api/admin/institute/question/title/${editingTitle.titleId}`,
                    { titleName: titleForm.titleName.trim(), isActive: titleForm.isActive },
                    { headers: authHeader });
            }
            await fetchAll();
            closeTitleModal();
        } catch (e) {
            setTitleError(e.response?.data?.message ?? "Ошибка при сохранении");
        } finally { setTitleSaving(false); }
    };

    const handleDeleteTitle = async (titleId) => {
        if (!window.confirm("Удалить заголовок? Все связанные подзаголовки тоже будут удалены.")) return;
        setDeletingTitleId(titleId); setGlobalError("");
        try {
            await api.delete(`/api/admin/institute/question/title/${titleId}`, { headers: authHeader });
            if (selectedTitle?.titleId === titleId) setSelectedTitle(null);
            await fetchAll();
        } catch (e) {
            setGlobalError(e.response?.data?.message ?? "Ошибка при удалении заголовка");
        } finally { setDeletingTitleId(null); }
    };

    /* ── Subtitle CRUD ─────────────────────────────────────────── */
    const openAddSub = () => {
        setSubForm(EMPTY_SUB);
        setSubError("");
        setEditingSub(null);
        setSubModal("add");
    };

    const openEditSub = (s) => {
        setSubForm({ subtitleName: s.subtitleName, point: String(s.point) });
        setSubError("");
        setEditingSub(s);
        setSubModal("edit");
    };

    const closeSubModal = () => { setSubModal(null); setEditingSub(null); setSubError(""); };

    const handleSaveSub = async () => {
        if (!subForm.subtitleName.trim()) { setSubError("Введите название"); return; }
        if (subForm.point === "" || isNaN(Number(subForm.point))) { setSubError("Укажите корректный балл"); return; }
        setSubSaving(true); setSubError("");
        try {
            const body = {
                subtitleName: subForm.subtitleName.trim(),
                titleId: selectedTitle.titleId,
                point: Number(subForm.point),
            };
            if (subModal === "add") {
                await api.post("/api/admin/institute/question/subtitle", body, { headers: authHeader });
            } else {
                await api.put(`/api/admin/institute/question/subtitle/${editingSub.subtitleId}`, body, { headers: authHeader });
            }
            await fetchAll();
            closeSubModal();
        } catch (e) {
            setSubError(e.response?.data?.message ?? "Ошибка при сохранении");
        } finally { setSubSaving(false); }
    };

    const handleDeleteSub = async (subtitleId) => {
        if (!window.confirm("Удалить этот подзаголовок?")) return;
        setDeletingSubId(subtitleId); setGlobalError("");
        try {
            await api.delete(`/api/admin/institute/question/subtitle/${subtitleId}`, { headers: authHeader });
            await fetchAll();
        } catch (e) {
            setGlobalError(e.response?.data?.message ?? "Ошибка при удалении подзаголовка");
        } finally { setDeletingSubId(null); }
    };

    /* ── Computed ──────────────────────────────────────────────── */
    const activeSubs = selectedTitle
        ? subtitles.filter(s => s.titleId === selectedTitle.titleId)
        : [];

    /* ── Render ────────────────────────────────────────────────── */
    return (
        <div className="aiq-root">
            <div className="header"><NavBar /></div>

            <div className="aiq-container">
                {/* Page header */}
                <div className="aiq-page-header">
                    <div>
                        <h1 className="aiq-page-title">
                            <span>📝</span> Вопросы институтов
                        </h1>
                        <p className="aiq-page-subtitle">
                            Управление заголовками и подзаголовками для оценки институтов
                        </p>
                    </div>
                    {/* breadcrumb nav */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                            className={`aiq-btn ${!selectedTitle ? 'aiq-btn--confirm' : 'aiq-btn--cancel'}`}
                            onClick={() => setSelectedTitle(null)}
                        >
                            📋 Заголовки
                        </button>
                        {selectedTitle && (
                            <>
                                <span style={{ color: '#94a3b8' }}>›</span>
                                <button className="aiq-btn aiq-btn--confirm" style={{ pointerEvents: 'none' }}>
                                    📄 {selectedTitle.titleName}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {globalError && <div className="aiq-alert aiq-alert--error">✗ {globalError}</div>}

                {loading ? (
                    <div className="aiq-empty">
                        <span className="aiq-empty__icon">⏳</span>
                        <p>Загрузка...</p>
                    </div>
                ) : selectedTitle ? (
                    /* ═══════════ SUBTITLES DRILL-DOWN ═══════════ */
                    <section className="aiq-panel" style={{
                        borderTop: '3px solid #3b82f6',
                        background: 'linear-gradient(to bottom, #f0f7ff, #fff)'
                    }}>
                        {/* breadcrumb header */}
                        <div className="aiq-panel__header">
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <button
                                    className="aiq-btn aiq-btn--cancel"
                                    onClick={() => setSelectedTitle(null)}
                                    style={{ padding: "6px 12px" }}
                                >
                                    ← Назад
                                </button>
                                <div>
                                    <h2 className="aiq-panel__title">{selectedTitle.titleName}</h2>
                                    <span className="aiq-panel__count">{activeSubs.length} подзаголовков</span>
                                </div>
                            </div>
                            <button className="aiq-btn aiq-btn--main" onClick={openAddSub}>+ Добавить</button>
                        </div>

                        {activeSubs.length === 0 ? (
                            <div className="aiq-empty-inline">Подзаголовки не найдены</div>
                        ) : (
                            <div className="aiq-list">
                                {activeSubs.map(s => (
                                    <div key={s.subtitleId} className="aiq-row">
                                        <div className="aiq-row__info">
                                            <span className="aiq-badge aiq-badge--point">{s.point} б.</span>
                                            <span className="aiq-row__name">{s.subtitleName}</span>
                                        </div>
                                        <div className="aiq-row__actions">
                                            <button className="aiq-btn aiq-btn--edit" onClick={() => openEditSub(s)}>✏️ Изменить</button>
                                            <button
                                                className="aiq-btn aiq-btn--delete"
                                                disabled={deletingSubId === s.subtitleId}
                                                onClick={() => handleDeleteSub(s.subtitleId)}
                                            >
                                                {deletingSubId === s.subtitleId ? "..." : "Удалить"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                ) : (
                    /* ═══════════ TITLES LIST ═══════════ */
                    <section className="aiq-panel">
                        <div className="aiq-panel__header">
                            <div>
                                <h2 className="aiq-panel__title">Заголовки</h2>
                                <span className="aiq-panel__count">{titles.length} шт.</span>
                            </div>
                            <button className="aiq-btn aiq-btn--main" onClick={openAddTitle}>+ Добавить</button>
                        </div>

                        {titles.length === 0 ? (
                            <div className="aiq-empty-inline">Заголовки не найдены</div>
                        ) : (
                            <div className="aiq-list">
                                {titles.map(t => {
                                    const subCount = subtitles.filter(s => s.titleId === t.titleId).length;
                                    return (
                                        <div
                                            key={t.titleId}
                                            className="aiq-row aiq-row--clickable"
                                            onClick={() => setSelectedTitle(t)}
                                        >
                                            <div className="aiq-row__info">
                                                <span className={`aiq-badge ${t.isActive ? "aiq-badge--active" : "aiq-badge--inactive"}`}>
                                                    {t.isActive ? "Активен" : "Неактивен"}
                                                </span>
                                                <span className="aiq-row__name">{t.titleName}</span>
                                                <span className="aiq-row__meta">{subCount} подзаголовков →</span>
                                            </div>
                                            <div className="aiq-row__actions" onClick={e => e.stopPropagation()}>
                                                <button className="aiq-btn aiq-btn--edit" onClick={() => openEditTitle(t)}>✏️ Изменить</button>
                                                <button
                                                    className="aiq-btn aiq-btn--delete"
                                                    disabled={deletingTitleId === t.titleId}
                                                    onClick={() => handleDeleteTitle(t.titleId)}
                                                >
                                                    {deletingTitleId === t.titleId ? "..." : "Удалить"}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}
            </div>

            {/* ══════════ TITLE MODAL ══════════ */}
            {titleModal && (
                <div className="aiq-overlay" onClick={closeTitleModal}>
                    <div className="aiq-modal" onClick={e => e.stopPropagation()}>
                        <div className="aiq-modal__header">
                            <h3 className="aiq-modal__title">
                                {titleModal === "add" ? "Новый заголовок" : "Редактировать заголовок"}
                            </h3>
                            <button className="aiq-modal__close" onClick={closeTitleModal}>✕</button>
                        </div>
                        <div className="aiq-modal__body">
                            <label className="aiq-label" htmlFor="title-name">Название</label>
                            <input
                                id="title-name"
                                name="titleName"
                                className="aiq-input"
                                type="text"
                                placeholder="Введите название..."
                                value={titleForm.titleName}
                                onChange={e => setTitleForm(f => ({ ...f, titleName: e.target.value }))}
                            />
                            <label className="aiq-label aiq-label--toggle">
                                <span>Статус</span>
                            </label>
                            <div
                                className={`aiq-toggle ${titleForm.isActive ? "aiq-toggle--on" : ""}`}
                                onClick={() => setTitleForm(f => ({ ...f, isActive: !f.isActive }))}
                            >
                                <div className="aiq-toggle__thumb" />
                                <span className="aiq-toggle__label">{titleForm.isActive ? "Активен" : "Неактивен"}</span>
                            </div>
                            {titleError && <div className="aiq-alert aiq-alert--error">{titleError}</div>}
                        </div>
                        <div className="aiq-modal__footer">
                            <button className="aiq-btn aiq-btn--cancel" onClick={closeTitleModal} disabled={titleSaving}>Отмена</button>
                            <button className="aiq-btn aiq-btn--confirm" onClick={handleSaveTitle} disabled={titleSaving}>
                                {titleSaving ? "Сохранение..." : "Сохранить"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════ SUBTITLE MODAL ══════════ */}
            {subModal && (
                <div className="aiq-overlay" onClick={closeSubModal}>
                    <div className="aiq-modal" onClick={e => e.stopPropagation()}>
                        <div className="aiq-modal__header">
                            <h3 className="aiq-modal__title">
                                {subModal === "add" ? "Новый подзаголовок" : "Редактировать подзаголовок"}
                            </h3>
                            <button className="aiq-modal__close" onClick={closeSubModal}>✕</button>
                        </div>
                        <div className="aiq-modal__body">
                            <label className="aiq-label" htmlFor="sub-name">Название</label>
                            <input
                                id="sub-name"
                                name="subtitleName"
                                className="aiq-input"
                                type="text"
                                placeholder="Введите название..."
                                value={subForm.subtitleName}
                                onChange={e => setSubForm(f => ({ ...f, subtitleName: e.target.value }))}
                            />
                            <label className="aiq-label" style={{ marginTop: "14px" }} htmlFor="sub-point">Баллы (Point)</label>
                            <input
                                id="sub-point"
                                name="point"
                                className="aiq-input"
                                type="number"
                                min="0"
                                placeholder="0"
                                value={subForm.point}
                                onChange={e => setSubForm(f => ({ ...f, point: e.target.value }))}
                            />
                            {subError && <div className="aiq-alert aiq-alert--error">{subError}</div>}
                        </div>
                        <div className="aiq-modal__footer">
                            <button className="aiq-btn aiq-btn--cancel" onClick={closeSubModal} disabled={subSaving}>Отмена</button>
                            <button className="aiq-btn aiq-btn--confirm" onClick={handleSaveSub} disabled={subSaving}>
                                {subSaving ? "Сохранение..." : "Сохранить"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
