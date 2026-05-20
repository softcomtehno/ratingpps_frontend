import { useEffect, useState, useCallback } from "react";
import api from '../../../services/api';
import NavBar from "../../../components/NavBar";
import "../../../css/AdminInstituteQuestions.css";

const EMPTY_TITLE = { titleName: "", stageId: "" };
const EMPTY_SUB = { subtitleName: "", point: "" };

export default function AdminTeacherQuestions() {
    /* ── state ─────────────────────────────────────────────────── */
    const [stages, setStages] = useState([]);
    const [titles, setTitles] = useState([]);
    const [subtitles, setSubtitles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStageId, setSelectedStageId] = useState(null);
    const [selectedTitle, setSelectedTitle] = useState(null);

    /* title modal */
    const [titleModal, setTitleModal] = useState(null);
    const [editingTitle, setEditingTitle] = useState(null);
    const [titleForm, setTitleForm] = useState(EMPTY_TITLE);
    const [titleSaving, setTitleSaving] = useState(false);
    const [titleError, setTitleError] = useState("");

    /* subtitle modal */
    const [subModal, setSubModal] = useState(null);
    const [editingSub, setEditingSub] = useState(null);
    const [subForm, setSubForm] = useState(EMPTY_SUB);
    const [subSaving, setSubSaving] = useState(false);
    const [subError, setSubError] = useState("");

    const [deletingTitleId, setDeletingTitleId] = useState(null);
    const [deletingSubId, setDeletingSubId] = useState(null);
    const [deletingStageId, setDeletingStageId] = useState(null);
    const [globalError, setGlobalError] = useState("");

    /* stage modal */
    const EMPTY_STAGE = { name: "", isPermanent: false, active: true };
    const [stageModal, setStageModal] = useState(null); // null | "add" | "edit"
    const [editingStage, setEditingStage] = useState(null);
    const [stageForm, setStageForm] = useState(EMPTY_STAGE);
    const [stageSaving, setStageSaving] = useState(false);
    const [stageError, setStageError] = useState("");

    /* ── fetch ─────────────────────────────────────────────────── */
    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [stRes, tRes, sRes] = await Promise.all([
                api.get("/api/admin/teacher/questions/stages"),
                api.get("/api/admin/teacher/questions/titles"),
                api.get("/api/admin/teacher/questions/subtitles"),
            ]);
            setStages(Array.isArray(stRes.data) ? stRes.data : []);
            const ts = Array.isArray(tRes.data) ? tRes.data : [];
            const ss = Array.isArray(sRes.data) ? sRes.data : [];
            setTitles(ts);
            setSubtitles(ss);
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

    /* ── Filtered titles by stage ───────────────────────────────── */
    const filteredTitles = selectedStageId
        ? titles.filter(t => t.stageId === selectedStageId)
        : titles;

    const activeSubs = selectedTitle
        ? subtitles.filter(s => s.titleId === selectedTitle.titleId)
        : [];

    /* ── Stage CRUD ─────────────────────────────────────────────── */
    const openAddStage = () => {
        setStageForm({ name: "", isPermanent: false, active: true });
        setStageError("");
        setEditingStage(null);
        setStageModal("add");
    };

    const openEditStage = (s) => {
        setStageForm({ name: s.name, isPermanent: s.isPermanent ?? false, active: s.active ?? true });
        setStageError("");
        setEditingStage(s);
        setStageModal("edit");
    };

    const closeStageModal = () => { setStageModal(null); setEditingStage(null); setStageError(""); };

    const handleSaveStage = async () => {
        if (!stageForm.name.trim()) { setStageError("Введите название этапа"); return; }
        setStageSaving(true); setStageError("");
        try {
            const body = {
                name: stageForm.name.trim(),
                isPermanent: stageForm.isPermanent,
                active: stageForm.active,
            };
            if (stageModal === "add") {
                await api.post("/api/admin/teacher/questions/stages", body);
            } else {
                await api.put(`/api/admin/teacher/questions/stages/${editingStage.id}`, body);
            }
            await fetchAll();
            closeStageModal();
        } catch (e) {
            setStageError(e.response?.data?.error ?? "Ошибка при сохранении");
        } finally { setStageSaving(false); }
    };

    const handleDeleteStage = async (stageId) => {
        if (!window.confirm("Удалить этап? Все заголовки и подзаголовки будут удалены.")) return;
        setDeletingStageId(stageId); setGlobalError("");
        try {
            await api.delete(`/api/admin/teacher/questions/stages/${stageId}`);
            if (selectedStageId === stageId) setSelectedStageId(null);
            await fetchAll();
        } catch (e) {
            setGlobalError(e.response?.data?.error ?? "Ошибка при удалении этапа");
        } finally { setDeletingStageId(null); }
    };

    /* ── Title CRUD ────────────────────────────────────────────── */
    const openAddTitle = () => {
        setTitleForm({ ...EMPTY_TITLE, stageId: selectedStageId ?? "" });
        setTitleError("");
        setEditingTitle(null);
        setTitleModal("add");
    };

    const openEditTitle = (t) => {
        setTitleForm({ titleName: t.titleName, stageId: t.stageId });
        setTitleError("");
        setEditingTitle(t);
        setTitleModal("edit");
    };

    const closeTitleModal = () => { setTitleModal(null); setEditingTitle(null); setTitleError(""); };

    const handleSaveTitle = async () => {
        if (!titleForm.titleName.trim()) { setTitleError("Введите название"); return; }
        if (!titleForm.stageId) { setTitleError("Выберите этап"); return; }
        setTitleSaving(true); setTitleError("");
        try {
            const body = { titleName: titleForm.titleName.trim(), stageId: Number(titleForm.stageId) };
            if (titleModal === "add") {
                await api.post("/api/admin/teacher/questions/titles", body);
            } else {
                await api.put(`/api/admin/teacher/questions/titles/${editingTitle.titleId}`, body);
            }
            await fetchAll();
            closeTitleModal();
        } catch (e) {
            setTitleError(e.response?.data?.error ?? "Ошибка при сохранении");
        } finally { setTitleSaving(false); }
    };

    const handleDeleteTitle = async (titleId) => {
        if (!window.confirm("Удалить заголовок? Все подзаголовки будут удалены.")) return;
        setDeletingTitleId(titleId); setGlobalError("");
        try {
            await api.delete(`/api/admin/teacher/questions/titles/${titleId}`);
            if (selectedTitle?.titleId === titleId) setSelectedTitle(null);
            await fetchAll();
        } catch (e) {
            setGlobalError(e.response?.data?.error ?? "Ошибка при удалении");
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
                await api.post("/api/admin/teacher/questions/subtitles", body);
            } else {
                await api.put(`/api/admin/teacher/questions/subtitles/${editingSub.subtitleId}`, body);
            }
            await fetchAll();
            closeSubModal();
        } catch (e) {
            setSubError(e.response?.data?.error ?? "Ошибка при сохранении");
        } finally { setSubSaving(false); }
    };

    const handleDeleteSub = async (subtitleId) => {
        if (!window.confirm("Удалить этот подзаголовок?")) return;
        setDeletingSubId(subtitleId); setGlobalError("");
        try {
            await api.delete(`/api/admin/teacher/questions/subtitles/${subtitleId}`);
            await fetchAll();
        } catch (e) {
            setGlobalError(e.response?.data?.error ?? "Ошибка при удалении");
        } finally { setDeletingSubId(null); }
    };

    /* ── Render ────────────────────────────────────────────────── */
    return (
        <div className="aiq-root">
            <div className="header"><NavBar /></div>

            <div className="aiq-container">
                {/* Page header */}
                <div className="aiq-page-header">
                    <div>
                        <h1 className="aiq-page-title">
                            <span>📚</span> Вопросы преподавателей
                        </h1>
                        <p className="aiq-page-subtitle">
                            Управление этапами, заголовками и подзаголовками для оценки преподавателей
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                            className={`aiq-btn ${!selectedTitle && !selectedStageId ? 'aiq-btn--confirm' : 'aiq-btn--cancel'}`}
                            onClick={() => { setSelectedTitle(null); setSelectedStageId(null); }}
                        >
                            📋 Этапы
                        </button>
                        {selectedStageId && (
                            <>
                                <span style={{ color: '#94a3b8' }}>›</span>
                                <button className={`aiq-btn ${!selectedTitle ? 'aiq-btn--confirm' : 'aiq-btn--cancel'}`}
                                    onClick={() => setSelectedTitle(null)}>
                                    📁 {stages.find(s => s.id === selectedStageId)?.name}
                                </button>
                            </>
                        )}
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
                    /* ═══ SUBTITLES ═══ */
                    <section className="aiq-panel" style={{ borderTop: '3px solid #3b82f6', background: 'linear-gradient(to bottom, #f0f7ff, #fff)' }}>
                        <div className="aiq-panel__header">
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <button className="aiq-btn aiq-btn--cancel" onClick={() => setSelectedTitle(null)} style={{ padding: "6px 12px" }}>← Назад</button>
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
                                            {s.isPermanent && <span className="aiq-badge aiq-badge--active" style={{ background: '#f59e0b' }}>♾️ Постоянный</span>}
                                        </div>
                                        <div className="aiq-row__actions">
                                            <button className="aiq-btn aiq-btn--edit" onClick={() => openEditSub(s)}>✏️ Изменить</button>
                                            <button className="aiq-btn aiq-btn--delete" disabled={deletingSubId === s.subtitleId}
                                                onClick={() => handleDeleteSub(s.subtitleId)}>
                                                {deletingSubId === s.subtitleId ? "..." : "Удалить"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                ) : selectedStageId ? (
                    /* ═══ TITLES for stage ═══ */
                    <section className="aiq-panel">
                        <div className="aiq-panel__header">
                            <div>
                                <h2 className="aiq-panel__title">
                                    {stages.find(s => s.id === selectedStageId)?.name}
                                </h2>
                                <span className="aiq-panel__count">{filteredTitles.length} заголовков</span>
                            </div>
                            <button className="aiq-btn aiq-btn--main" onClick={openAddTitle}>+ Добавить</button>
                        </div>

                        {filteredTitles.length === 0 ? (
                            <div className="aiq-empty-inline">Заголовки не найдены</div>
                        ) : (
                            <div className="aiq-list">
                                {filteredTitles.map(t => {
                                    const subCount = subtitles.filter(s => s.titleId === t.titleId).length;
                                    return (
                                        <div key={t.titleId} className="aiq-row aiq-row--clickable" onClick={() => setSelectedTitle(t)}>
                                            <div className="aiq-row__info">
                                                <span className="aiq-row__name">{t.titleName}</span>
                                                <span className="aiq-row__meta">{subCount} подзаголовков →</span>
                                            </div>
                                            <div className="aiq-row__actions" onClick={e => e.stopPropagation()}>
                                                <button className="aiq-btn aiq-btn--edit" onClick={() => openEditTitle(t)}>✏️ Изменить</button>
                                                <button className="aiq-btn aiq-btn--delete" disabled={deletingTitleId === t.titleId}
                                                    onClick={() => handleDeleteTitle(t.titleId)}>
                                                    {deletingTitleId === t.titleId ? "..." : "Удалить"}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                ) : (
                    /* ═══ STAGES LIST ═══ */
                    <section className="aiq-panel">
                        <div className="aiq-panel__header">
                            <div>
                                <h2 className="aiq-panel__title">Этапы оценки</h2>
                                <span className="aiq-panel__count">{stages.length} этапов</span>
                            </div>
                            <button className="aiq-btn aiq-btn--main" onClick={openAddStage}>+ Добавить этап</button>
                        </div>
                        <div className="aiq-list">
                            {stages.map(stage => {
                                const stageTitles = titles.filter(t => t.stageId === stage.id);
                                return (
                                    <div key={stage.id} className="aiq-row aiq-row--clickable"
                                        onClick={() => setSelectedStageId(stage.id)}>
                                        <div className="aiq-row__info">
                                            <span className={`aiq-badge ${stage.isPermanent ? 'aiq-badge--inactive' : 'aiq-badge--active'}`}>
                                                {stage.isPermanent ? '♾️ Постоянный' : '📅 Ежегодный'}
                                            </span>
                                            <span className="aiq-row__name">{stage.name}</span>
                                            <span className="aiq-row__meta">{stageTitles.length} заголовков →</span>
                                        </div>
                                        <div className="aiq-row__actions" onClick={e => e.stopPropagation()}>
                                            <button className="aiq-btn aiq-btn--edit" onClick={() => openEditStage(stage)}>✏️ Изменить</button>
                                            <button
                                                className="aiq-btn aiq-btn--delete"
                                                disabled={deletingStageId === stage.id}
                                                onClick={() => handleDeleteStage(stage.id)}
                                            >
                                                {deletingStageId === stage.id ? "..." : "Удалить"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
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
                            <label className="aiq-label" htmlFor="title-name-t">Название</label>
                            <input id="title-name-t" className="aiq-input" type="text" placeholder="Введите название..."
                                value={titleForm.titleName}
                                onChange={e => setTitleForm(f => ({ ...f, titleName: e.target.value }))} />

                            <label className="aiq-label" style={{ marginTop: "14px" }}>Этап</label>
                            <select className="aiq-input" value={titleForm.stageId}
                                onChange={e => setTitleForm(f => ({ ...f, stageId: e.target.value }))}>
                                <option value="">— выберите этап —</option>
                                {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>

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
                            <label className="aiq-label" htmlFor="sub-name-t">Название</label>
                            <input id="sub-name-t" className="aiq-input" type="text" placeholder="Введите название..."
                                value={subForm.subtitleName}
                                onChange={e => setSubForm(f => ({ ...f, subtitleName: e.target.value }))} />

                            <label className="aiq-label" style={{ marginTop: "14px" }} htmlFor="sub-point-t">Баллы (Point)</label>
                            <input id="sub-point-t" className="aiq-input" type="number" min="0" placeholder="0"
                                value={subForm.point}
                                onChange={e => setSubForm(f => ({ ...f, point: e.target.value }))} />

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
            {/* ══════════ STAGE MODAL ══════════ */}
            {stageModal && (
                <div className="aiq-overlay" onClick={closeStageModal}>
                    <div className="aiq-modal" onClick={e => e.stopPropagation()}>
                        <div className="aiq-modal__header">
                            <h3 className="aiq-modal__title">
                                {stageModal === "add" ? "Новый этап" : "Редактировать этап"}
                            </h3>
                            <button className="aiq-modal__close" onClick={closeStageModal}>✕</button>
                        </div>
                        <div className="aiq-modal__body">
                            <label className="aiq-label" htmlFor="stage-name">Название</label>
                            <input
                                id="stage-name"
                                className="aiq-input"
                                type="text"
                                placeholder="Например: Личные достижения"
                                value={stageForm.name}
                                onChange={e => setStageForm(f => ({ ...f, name: e.target.value }))}
                            />

                            <label className="aiq-label aiq-label--toggle" style={{ marginTop: "16px" }}>
                                <span>Тип этапа</span>
                            </label>
                            <div
                                className={`aiq-toggle ${stageForm.isPermanent ? "aiq-toggle--on" : ""}`}
                                onClick={() => setStageForm(f => ({ ...f, isPermanent: !f.isPermanent }))}
                            >
                                <div className="aiq-toggle__thumb" />
                                <span className="aiq-toggle__label">
                                    {stageForm.isPermanent ? "♾️ Постоянный (не зависит от года)" : "📅 Ежегодный"}
                                </span>
                            </div>

                            <label className="aiq-label aiq-label--toggle" style={{ marginTop: "12px" }}>
                                <span>Статус</span>
                            </label>
                            <div
                                className={`aiq-toggle ${stageForm.active ? "aiq-toggle--on" : ""}`}
                                onClick={() => setStageForm(f => ({ ...f, active: !f.active }))}
                            >
                                <div className="aiq-toggle__thumb" />
                                <span className="aiq-toggle__label">{stageForm.active ? "Активен" : "Неактивен"}</span>
                            </div>

                            {stageError && <div className="aiq-alert aiq-alert--error">{stageError}</div>}
                        </div>
                        <div className="aiq-modal__footer">
                            <button className="aiq-btn aiq-btn--cancel" onClick={closeStageModal} disabled={stageSaving}>Отмена</button>
                            <button className="aiq-btn aiq-btn--confirm" onClick={handleSaveStage} disabled={stageSaving}>
                                {stageSaving ? "Сохранение..." : "Сохранить"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
