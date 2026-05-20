import { useEffect, useState, useCallback } from "react";
import api from '../../../services/api';
import NavBar from "../../../components/NavBar";
import useAuthToken from "../../../hooks/useAuthToken";
import "../../../css/AdminDirectors.css"; // Reusing the same styling for consistency

export default function AdminExperts() {
    const token = useAuthToken();

    const [experts, setExperts] = useState([]);
    const [loadingExperts, setLoadingExperts] = useState(true);
    const [teachers, setTeachers] = useState([]);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedTeacherId, setSelectedTeacherId] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState("");

    const [showAdjustmentsPanel, setShowAdjustmentsPanel] = useState(false);
    const [allAdjustments, setAllAdjustments] = useState([]);
    const [loadingAdjustments, setLoadingAdjustments] = useState(false);

    const fetchExperts = useCallback(() => {
        setLoadingExperts(true);
        api.get("/api/admin/experts", { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => setExperts(Array.isArray(res.data) ? res.data : []))
            .catch((err) => console.error(err))
            .finally(() => setLoadingExperts(false));
    }, [token]);

    const fetchAdjustments = useCallback(() => {
        setLoadingAdjustments(true);
        api.get("/api/admin/experts/adjustments/all", { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => setAllAdjustments(Array.isArray(res.data) ? res.data : []))
            .catch((err) => console.error(err))
            .finally(() => setLoadingAdjustments(false));
    }, [token]);

    useEffect(() => {
        fetchExperts();
        // Load teachers for the selection
        api.get("/api/teacher")
            .then((res) => setTeachers(Array.isArray(res.data) ? res.data : []))
            .catch((err) => console.error(err));
    }, [fetchExperts]);

    const handleAddExpert = async () => {
        if (!selectedTeacherId || !jobTitle) {
            setAddError("Заполните все поля");
            return;
        }
        setAddLoading(true);
        setAddError("");
        try {
            await api.post("/api/admin/experts", {
                teacherId: Number(selectedTeacherId),
                jobTitle: jobTitle
            }, { headers: { Authorization: `Bearer ${token}` } });
            fetchExperts();
            setShowAddModal(false);
            setSelectedTeacherId("");
            setJobTitle("");
        } catch (err) {
            setAddError(err.response?.data?.error || "Ошибка при добавлении");
        } finally {
            setAddLoading(false);
        }
    };

    const handleDeleteExpert = async (id) => {
        if (!window.confirm("Удалить этого эксперта?")) return;
        try {
            await api.delete(`/api/admin/experts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setExperts(experts.filter(e => e.id !== id));
        } catch (err) {
            alert("Ошибка при удалении");
        }
    };

    const toggleAdjustmentStatus = async (id) => {
        try {
            const res = await api.post(`/api/admin/experts/adjustments/${id}/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setAllAdjustments(prev => prev.map(a => a.id === id ? { ...a, isActive: res.data.isActive } : a));
        } catch (err) {
            alert("Ошибка при изменении статуса");
        }
    };

    return (
        <div className="ad-root">
            <div className="header"><NavBar /></div>
            <div className="ad-container">
                <div className="ad-header">
                    <div className="ad-header__left">
                        <h1 className="ad-title">
                            <span className="ad-title__icon">👮‍♂️</span>
                            Управление экспертами
                        </h1>
                        <p className="ad-subtitle">Назначение ролей и модерация бонусных баллов</p>
                    </div>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <button
                            className="ad-btn ad-btn--main"
                            onClick={() => {
                                const nextOpenState = !showAdjustmentsPanel;
                                setShowAdjustmentsPanel(nextOpenState);
                                if (nextOpenState) fetchAdjustments();
                            }}
                        >
                            {showAdjustmentsPanel ? "📉 Скрыть начисления" : "📊 Все начисления"}
                        </button>
                        <button className="ad-btn ad-btn--main" onClick={() => setShowAddModal(true)} style={{background: '#22c55e'}}>
                            + Добавить эксперта
                        </button>
                    </div>
                </div>

                {loadingExperts ? (
                    <div className="ad-empty"><p>Загрузка...</p></div>
                ) : experts.length === 0 ? (
                    <div className="ad-empty"><p>Эксперты пока не назначены</p></div>
                ) : (
                    <div className="ad-institutes">
                        <div className="ad-card" style={{padding: '20px'}}>
                            <div className="ad-directors-list">
                                {experts.map(e => (
                                    <div key={e.id} className="ad-director-row">
                                        <div className="ad-director-row__info">
                                            <span className="ad-director-row__avatar">{e.fullName[0]}</span>
                                            <div>
                                                <p className="ad-director-row__name">{e.fullName}</p>
                                                <p className="ad-director-row__email" style={{color: '#16a34a', fontWeight: 'bold'}}>{e.jobTitle}</p>
                                            </div>
                                        </div>
                                        <button className="ad-btn ad-btn--delete" onClick={() => handleDeleteExpert(e.id)}>Удалить</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {showAdjustmentsPanel && (
                    <section className="ad-adjustments">
                        <div className="ad-adjustments__header">
                            <h2 className="ad-adjustments__title">История всех начислений</h2>
                        </div>
                        {loadingAdjustments ? (
                            <div className="ad-empty"><p>Загрузка...</p></div>
                        ) : allAdjustments.length === 0 ? (
                            <div className="ad-empty"><p>Истории начислений пока нет</p></div>
                        ) : (
                            <div className="ad-adjustments__table-wrap">
                                <table className="ad-adjustments__table">
                                    <thead>
                                        <tr>
                                            <th>Эксперт</th>
                                            <th>Кому/Куда</th>
                                            <th>Баллы</th>
                                            <th>Причина</th>
                                            <th>Статус</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allAdjustments.map(a => (
                                            <tr key={a.id} className={a.isActive ? "" : "ad-adjustments__row--inactive"}>
                                                <td>{a.expertName}</td>
                                                <td>{a.targetName}</td>
                                                <td className={a.points > 0 ? "ad-adjustments__points--plus" : "ad-adjustments__points--minus"}>
                                                    {a.points > 0 ? `+${a.points}` : a.points}
                                                </td>
                                                <td>{a.reason}</td>
                                                <td>
                                                    <button
                                                        onClick={() => toggleAdjustmentStatus(a.id)}
                                                        className={`ad-adjustments__status-btn ${a.isActive ? "ad-adjustments__status-btn--freeze" : "ad-adjustments__status-btn--unfreeze"}`}
                                                    >
                                                        {a.isActive ? 'Заморозить' : 'Разморозить'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}
            </div>

            {/* Add Expert Modal */}
            {showAddModal && (
                <div className="ad-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="ad-modal" onClick={e => e.stopPropagation()}>
                        <div className="ad-modal__header">
                            <h3 className="ad-modal__title">Новый эксперт</h3>
                            <button className="ad-modal__close" onClick={() => setShowAddModal(false)}>✕</button>
                        </div>
                        <div className="ad-modal__body">
                            <label className="ad-label" htmlFor="expert-teacher-select">Выберите преподавателя</label>
                            <select id="expert-teacher-select" name="teacherId" className="ad-select" value={selectedTeacherId} onChange={e => setSelectedTeacherId(e.target.value)}>
                                <option value="">— Выбрать —</option>
                                {teachers.map(t => <option key={t.teacherId} value={t.teacherId}>{t.name}</option>)}
                            </select>
                            <label className="ad-label" style={{marginTop: '15px'}} htmlFor="expert-job-title">Название роли (например: Библиотекарь)</label>
                            <input id="expert-job-title" name="jobTitle" className="ad-select" type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Библиотекарь" />
                            {addError && <div className="ad-alert ad-alert--error">{addError}</div>}
                        </div>
                        <div className="ad-modal__footer">
                            <button className="ad-btn ad-btn--cancel" onClick={() => setShowAddModal(false)}>Отмена</button>
                            <button className="ad-btn ad-btn--confirm" onClick={handleAddExpert} disabled={addLoading}>
                                {addLoading ? "..." : "Добавить"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
