import { useEffect, useState } from "react";
import api from '../../services/api';
import { Link } from "react-router-dom";
import NavBar from "../../components/NavBar";
import DirectorStageNav from "../../components/DirectorStageNav";
import AccountConf from "../../components/AccountConf";
import useAuthToken from "../../hooks/useAuthToken";
import "../../css/DirectorOffice.css";
import "../../css/PrivateOfficeNew.css";

export default function DirectorInstitutePanel() {
    const token = useAuthToken();
    const headers = { Authorization: `Bearer ${token}` };

    const [institute, setInstitute] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editTotal, setEditTotal] = useState("");

    const [dismissingId, setDismissingId] = useState(null);
    const [dismissError, setDismissError] = useState(null);
    const [confirmId, setConfirmId] = useState(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get("/api/director/institute", { headers });
                if (!mounted) return;
                const data = res.data;
                setInstitute({
                    id: data.instituteId ?? data.id,
                    name: data.instituteName ?? data.name ?? "—",
                    organizationName: data.organizationName ?? "",
                    teacherTotal: data.teacherTotal ?? 0
                });
                setEditTotal(data.teacherTotal ?? 0);
                setTeachers(Array.isArray(data.teachers) ? data.teachers : []);
            } catch (e) {
                if (mounted) setError(e.response?.data?.message || "Ошибка загрузки данных института");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    const handleSaveInstitute = async () => {
        setSaving(true);
        try {
            await api.put("/api/director/institute", { teacherTotal: parseInt(editTotal) }, { headers });
            setInstitute(prev => ({ ...prev, teacherTotal: parseInt(editTotal) }));
            setEditing(false);
        } catch (e) {
            setError(e.response?.data?.message || "Не удалось сохранить настройки");
        } finally {
            setSaving(false);
        }
    };

    const handleDismiss = async (teacherId) => {
        if (confirmId !== teacherId) {
            setConfirmId(teacherId);
            return;
        }
        setDismissingId(teacherId);
        setDismissError(null);
        setConfirmId(null);
        try {
            await api.delete(`/api/director/institute/teacher/${teacherId}`, { headers });
            setTeachers((prev) => prev.filter((t) => (t.teacherId ?? t.id) !== teacherId));
        } catch (e) {
            setDismissError(e.response?.data?.message || "Не удалось уволить преподавателя");
        } finally {
            setDismissingId(null);
        }
    };

    return (
        <div className="private-office-contents">
            <div className="header"><NavBar /></div>

            <div className="private-office__main">
                <AccountConf />
                <div className="office">
                    <DirectorStageNav />

                    <div className="po-page">
                        <h2 className="po-page-title">🏛️ Мой институт</h2>

                        {loading && (
                            <div className="po-loading">
                                <div className="po-spinner" />
                                <span>Загрузка данных института...</span>
                            </div>
                        )}

                        {error && !loading && (
                            <div className="po-alert po-alert--error">{error}</div>
                        )}

                        {!loading && !error && institute && (
                            <>
                                {/* Institute info card */}
                                <div className="dir-info-card">
                                    <div className="dir-info-card__org">{institute.organizationName}</div>
                                    <div className="dir-info-card__name">{institute.name}</div>
                                    <div className="dir-info-card__badge">Директор института</div>
                                    
                                    <div className="dir-info-card__settings">
                                        {editing ? (
                                            <div className="dir-edit-row">
                                                <label>Всего ППС:</label>
                                                <input 
                                                    type="number" 
                                                    value={editTotal} 
                                                    onChange={(e) => setEditTotal(e.target.value)}
                                                    className="po-input"
                                                />
                                                <button className="dir-btn dir-btn--save" onClick={handleSaveInstitute} disabled={saving}>
                                                    {saving ? "..." : "Сохранить"}
                                                </button>
                                                <button className="dir-btn dir-btn--cancel" onClick={() => setEditing(false)}>Отмена</button>
                                            </div>
                                        ) : (
                                            <div className="dir-view-row">
                                                <span>Всего ППС: <strong>{institute.teacherTotal}</strong></span>
                                                <button className="dir-btn dir-btn--edit-icon" onClick={() => setEditing(true)}>✎</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Teachers list */}
                                <div className="dir-section-header">
                                    <h3 className="dir-section-title">Преподаватели</h3>
                                    <span className="dir-section-count">{teachers.length} чел.</span>
                                </div>

                                {dismissError && (
                                    <div className="po-alert po-alert--error" style={{ marginBottom: 16 }}>
                                        {dismissError}
                                    </div>
                                )}

                                {teachers.length === 0 ? (
                                    <div className="dir-empty">
                                        <span className="dir-empty__icon">👤</span>
                                        <p>Преподаватели не найдены</p>
                                    </div>
                                ) : (
                                    <div className="dir-teachers-list">
                                        {teachers.map((t) => {
                                            const tid = t.teacherId ?? t.id;
                                            const isConfirm = confirmId === tid;
                                            const isDismissing = dismissingId === tid;
                                            return (
                                                <div key={tid} className="dir-teacher-row">
                                                    <div className="dir-teacher-row__info">
                                                        <div className="dir-teacher-row__avatar">
                                                            {(t.name ?? t.lastName ?? "?")[0].toUpperCase()}
                                                        </div>
                                                        <div className="dir-teacher-row__details">
                                                            <p className="dir-teacher-row__name">
                                                                <Link to={`/user/${tid}`}>
                                                                    {t.lastName ?? ""} {t.firstName ?? ""} {t.middleName ?? ""}
                                                                    {(!t.lastName && !t.firstName) && (t.name ?? "—")}
                                                                </Link>
                                                            </p>
                                                            {t.email && (
                                                                <p className="dir-teacher-row__email">{t.email}</p>
                                                            )}
                                                            {t.position && (
                                                                <p className="dir-teacher-row__position">{t.position}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        className={`dir-btn ${isConfirm ? "dir-btn--confirm" : "dir-btn--dismiss"}`}
                                                        disabled={isDismissing}
                                                        onClick={() => handleDismiss(tid)}
                                                        onBlur={() => { if (confirmId === tid) setConfirmId(null); }}
                                                        title={isConfirm ? "Нажмите ещё раз для подтверждения" : "Уволить преподавателя"}
                                                    >
                                                        {isDismissing ? "..." : isConfirm ? "⚠️ Подтвердить" : "Уволить"}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
