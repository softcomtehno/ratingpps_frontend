import { useEffect, useState } from "react";
import api from '../../services/api';
import { Link } from "react-router-dom";
import NavBar from "../../components/NavBar";
import DirectorStageNav from "../../components/DirectorStageNav";
import AccountConf from "../../components/AccountConf";
import useAuthToken from "../../hooks/useAuthToken";
import "../../css/DirectorOffice.css";
import "../../css/PrivateOfficeNew.css";

export default function DirectorTeachersPage() {
    const token = useAuthToken();
    const headers = { Authorization: `Bearer ${token}` };

    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [confirmId, setConfirmId] = useState(null);
    const [dismissingId, setDismissingId] = useState(null);
    const [dismissError, setDismissError] = useState(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get("/api/director/institute", { headers });
                if (!mounted) return;
                const data = res.data;
                setTeachers(Array.isArray(data.teachers) ? data.teachers : []);
            } catch (e) {
                if (mounted) setError(e.response?.data?.message || "Ошибка загрузки сотрудников");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

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

    const totalScore = teachers.reduce((sum, t) => sum + (t.totalScore ?? t.score ?? 0), 0);

    return (
        <div className="private-office-contents">
            <div className="header"><NavBar /></div>

            <div className="private-office__main">
                <AccountConf />
                <div className="office">
                    <DirectorStageNav />

                    <div className="po-page">
                        <h2 className="po-page-title">👥 Сотрудники</h2>

                        {loading && (
                            <div className="po-loading">
                                <div className="po-spinner" />
                                <span>Загрузка сотрудников...</span>
                            </div>
                        )}

                        {error && !loading && (
                            <div className="po-alert po-alert--error">{error}</div>
                        )}

                        {!loading && !error && (
                            <>
                                {/* Summary */}
                                <div className="dt-summary">
                                    <div className="dt-summary__item">
                                        <span className="dt-summary__val">{teachers.length}</span>
                                        <span className="dt-summary__label">Сотрудников</span>
                                    </div>
                                    <div className="dt-summary__item">
                                        <span className="dt-summary__val dt-summary__val--score">{totalScore}</span>
                                        <span className="dt-summary__label">Сумма баллов</span>
                                    </div>
                                </div>

                                {dismissError && (
                                    <div className="po-alert po-alert--error" style={{ marginBottom: 16 }}>
                                        {dismissError}
                                    </div>
                                )}

                                {teachers.length === 0 ? (
                                    <div className="dir-empty">
                                        <span className="dir-empty__icon">👤</span>
                                        <p>Сотрудники не найдены</p>
                                    </div>
                                ) : (
                                    <div className="dt-table-wrap">
                                        <table className="dt-table">
                                            <thead>
                                                <tr>
                                                    <th className="dt-th">#</th>
                                                    <th className="dt-th dt-th--name">Сотрудник</th>
                                                    <th className="dt-th dt-th--score">Баллы</th>
                                                    <th className="dt-th dt-th--action"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {teachers
                                                    .slice()
                                                    .sort((a, b) =>
                                                        (b.totalScore ?? b.score ?? 0) - (a.totalScore ?? a.score ?? 0)
                                                    )
                                                    .map((t, idx) => {
                                                        const tid = t.teacherId ?? t.id;
                                                        const isConfirm = confirmId === tid;
                                                        const isDismissing = dismissingId === tid;
                                                        const score = t.totalScore ?? t.score ?? 0;
                                                        const fullName = [t.lastName, t.firstName, t.middleName]
                                                            .filter(Boolean).join(" ") || t.name || "—";

                                                        return (
                                                            <tr key={tid} className="dt-row">
                                                                <td className="dt-td dt-td--num">{idx + 1}</td>
                                                                <td className="dt-td dt-td--name">
                                                                    <div className="dt-teacher">
                                                                        <div className="dt-teacher__avatar">
                                                                            {(t.lastName ?? t.name ?? "?")[0].toUpperCase()}
                                                                        </div>
                                                                        <div className="dt-teacher__info">
                                                                            <p className="dt-teacher__name">
                                                                                <Link to={`/user/${tid}`}>{fullName}</Link>
                                                                            </p>
                                                                            {t.email && (
                                                                                <p className="dt-teacher__email">{t.email}</p>
                                                                            )}
                                                                            {t.position && (
                                                                                <p className="dt-teacher__pos">{t.position}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="dt-td dt-td--score">
                                                                    <span className={`dt-score ${score > 0 ? "dt-score--positive" : "dt-score--zero"}`}>
                                                                        {score}
                                                                    </span>
                                                                </td>
                                                                <td className="dt-td dt-td--action">
                                                                    <button
                                                                        className={`dir-btn ${isConfirm ? "dir-btn--confirm" : "dir-btn--dismiss"}`}
                                                                        disabled={isDismissing}
                                                                        onClick={() => handleDismiss(tid)}
                                                                        onBlur={() => { if (confirmId === tid) setConfirmId(null); }}
                                                                        title={isConfirm ? "Нажмите ещё раз для подтверждения" : "Уволить сотрудника"}
                                                                    >
                                                                        {isDismissing ? "…" : isConfirm ? "⚠️ Подтвердить" : "Уволить"}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                            </tbody>
                                        </table>
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
