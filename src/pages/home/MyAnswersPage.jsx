import { useEffect, useState } from "react";
import api from '../../services/api';
import NavBar from "../../components/NavBar";
import StageNav from "../../components/StageNav";
import AccountConf from "../../components/AccountConf";
import YearSelector from "../../components/YearSelector";
import useAuthToken from "../../hooks/useAuthToken";
import { useYears } from "../../hooks/useYears";
import "../../css/MyAnswers.css";

// ─── Placeholder endpoints ─────────────────────────────────────────────────
// PUT   /api/teacher/answers/{answerId}       body: { answerLink }
// DELETE /api/teacher/answers/{answerId}
// PATCH  /api/teacher/answers/{answerId}/unfreeze
// ──────────────────────────────────────────────────────────────────────────

export default function MyAnswersPage() {
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = useAuthToken();
    const headers = { Authorization: `Bearer ${token}` };
    const { years, selectedYear, setSelectedYear, loading: yearsLoading } = useYears();

    useEffect(() => {
        if (yearsLoading) return;
        let mounted = true;
        setLoading(true);
        setError(null);
        const params = selectedYear ? { yearId: selectedYear.id } : {};
        api
            .get("/api/teacher/answers", { headers, params })
            .then((res) => { if (mounted) setStages(Array.isArray(res.data) ? res.data : []); })
            .catch((e) => { if (mounted) setError(e.response?.data?.message || "Ошибка загрузки наград"); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [selectedYear, yearsLoading]);

    const isCurrentYearSelected = Boolean(selectedYear?.isCurrent);

    const updateAnswer = (stageId, answerId, patch) =>
        setStages((prev) =>
            prev.map((s) => s.stageId !== stageId ? s : {
                ...s,
                answers: s.answers.map((a) => a.answerId !== answerId ? a : { ...a, ...patch }),
            })
        );

    const removeAnswer = (stageId, answerId) =>
        setStages((prev) =>
            prev.map((s) => s.stageId !== stageId ? s : {
                ...s, answers: s.answers.filter((a) => a.answerId !== answerId),
            })
        );

    const handleSaveLink = async (stageId, answerId, newLink) => {
        await api.put(`/api/teacher/answers/${answerId}`, { answerLink: newLink }, { headers });
        updateAnswer(stageId, answerId, { answerLink: newLink });
    };

    const handleDelete = async (stageId, answerId) => {
        await api.delete(`/api/teacher/answers/${answerId}`, { headers });
        removeAnswer(stageId, answerId);
    };

    const handleUnfreeze = async (stageId, answerId) => {
        await api.patch(`/api/teacher/answers/${answerId}/unfreeze`, {}, { headers });
        updateAnswer(stageId, answerId, { isActive: true });
    };

    const totalCount = stages.reduce((sum, s) => sum + (s.answers?.length ?? 0), 0);
    const frozenCount = stages.reduce((sum, s) => sum + (s.answers?.filter((a) => !a.isActive).length ?? 0), 0);

    return (
        <div className="private-office-contents">
            <div className="header"><NavBar /></div>

            <div className="private-office__main">
                <AccountConf />
                <div className="office">
                    <StageNav />

                    <div className="po-page">
                        <h2 className="po-page-title">Мои награды</h2>
                        <YearSelector
                            years={years}
                            selectedYear={selectedYear}
                            onChange={setSelectedYear}
                            loading={yearsLoading}
                        />
                        {!isCurrentYearSelected && (
                            <div className="po-alert" style={{ marginBottom: "12px" }}>
                                Просмотр архивного года: редактирование и удаление отключены.
                            </div>
                        )}

                        {!loading && !error && totalCount > 0 && (
                            <div className="ma-summary">
                                <div className="ma-summary__item">
                                    <span className="ma-summary__val">{totalCount}</span>
                                    <span className="ma-summary__label">Всего</span>
                                </div>
                                <div className="ma-summary__item">
                                    <span className="ma-summary__val ma-summary__val--active">{totalCount - frozenCount}</span>
                                    <span className="ma-summary__label">Активных</span>
                                </div>
                                <div className="ma-summary__item">
                                    <span className="ma-summary__val ma-summary__val--frozen">{frozenCount}</span>
                                    <span className="ma-summary__label">Заморожено</span>
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="po-loading">
                                <div className="po-spinner" />
                                <span>Загрузка наград...</span>
                            </div>
                        )}

                        {error && !loading && <div className="po-alert po-alert--error">{error}</div>}

                        {!loading && !error && stages.length === 0 && (
                            <div className="ma-empty">
                                <span className="ma-empty__icon">🏅</span>
                                <p>Наград пока нет</p>
                            </div>
                        )}

                        {!loading && !error && stages.map((stage) => (
                            <section key={stage.stageId} className="ma-stage">
                                <div className="ma-stage__header">
                                    <h3 className="ma-stage__title">{stage.stageName}</h3>
                                    <span className="ma-stage__badge">{stage.answers?.length ?? 0}</span>
                                </div>

                                {(!stage.answers || stage.answers.length === 0) ? (
                                    <p className="ma-stage__empty">Нет наград в этом этапе</p>
                                ) : (
                                    <div className="ma-list">
                                        {stage.answers.map((award, idx) => (
                                            <AwardRow
                                                key={award.answerId}
                                                award={award}
                                                index={idx + 1}
                                                frozen={!award.isActive}
                                                readOnly={!isCurrentYearSelected}
                                                onSaveLink={(l) => handleSaveLink(stage.stageId, award.answerId, l)}
                                                onDelete={() => handleDelete(stage.stageId, award.answerId)}
                                                onUnfreeze={() => handleUnfreeze(stage.stageId, award.answerId)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── AwardRow — двухуровневая структура ─────────────────────────────────────
function AwardRow({ award, index, frozen, readOnly, onSaveLink, onDelete, onUnfreeze }) {
    const [editing, setEditing] = useState(false);
    const [linkValue, setLinkValue] = useState(award.answerLink || "");
    const [busy, setBusy] = useState(false);
    const [rowError, setRowError] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleSave = async () => {
        setBusy(true); setRowError(null);
        try { await onSaveLink(linkValue); setEditing(false); }
        catch { setRowError("Не удалось сохранить ссылку"); }
        finally { setBusy(false); }
    };

    const handleDelete = async () => {
        if (!confirmDelete) { setConfirmDelete(true); return; }
        setBusy(true);
        try { await onDelete(); }
        catch { setRowError("Не удалось удалить"); setBusy(false); setConfirmDelete(false); }
    };

    const handleUnfreeze = async () => {
        setBusy(true); setRowError(null);
        try { await onUnfreeze(); }
        catch { setRowError("Не удалось разморозить"); setBusy(false); }
    };

    return (
        <div className={`ma-row${frozen ? " ma-row--frozen" : ""}`}>

            {/* ─── Верхняя строка: номер + название + статус + удалить ─── */}
            <div className="ma-row__top">
                <div className="ma-row__num">{index}</div>

                <div className="ma-row__name">{award.answerName}</div>

                <div className="ma-row__topright">
                    {frozen
                        ? <span className="ma-row__freeze">❄️ Заморожена</span>
                        : <span className="ma-row__active">✓ Активна</span>
                    }
                    <button
                        className={`ma-btn ${confirmDelete ? "ma-btn--confirm" : "ma-btn--delete"}`}
                        onClick={handleDelete}
                        disabled={busy || readOnly}
                        title={confirmDelete ? "Нажмите ещё раз" : "Удалить"}
                        onBlur={() => setConfirmDelete(false)}
                    >
                        {confirmDelete ? "⚠️ Подтвердить" : "✕"}
                    </button>
                </div>
            </div>

            {/* ─── Нижняя строка: ссылка + кнопки ─── */}
            <div className="ma-row__bottom">
                {editing ? (
                    <>
                        <input
                            className="ma-row__input"
                            value={linkValue}
                            onChange={(e) => setLinkValue(e.target.value)}
                            placeholder="https://..."
                            autoFocus
                        />
                        <button className="ma-btn ma-btn--save" onClick={handleSave} disabled={busy}>
                            {busy ? "…" : "✓ Сохранить"}
                        </button>
                        <button className="ma-btn ma-btn--cancel"
                            onClick={() => { setEditing(false); setLinkValue(award.answerLink || ""); }}
                            disabled={busy}
                        >
                            Отмена
                        </button>
                    </>
                ) : (
                    <>
                        {award.answerLink
                            ? <a href={award.answerLink} target="_blank" rel="noopener noreferrer" className="ma-row__link">↗ Документ</a>
                            : <span className="ma-row__no-link">нет ссылки</span>
                        }
                        <button className="ma-btn ma-btn--edit" onClick={() => { setEditing(true); setRowError(null); }} disabled={readOnly}>
                            ✎ Изменить ссылку
                        </button>
                        {frozen && (
                            <button className="ma-btn ma-btn--unfreeze" onClick={handleUnfreeze} disabled={busy || readOnly}>
                                {busy ? "…" : "☀️ Разморозить"}
                            </button>
                        )}
                    </>
                )}
                {rowError && <span className="ma-row__error">{rowError}</span>}
            </div>

        </div>
    );
}
