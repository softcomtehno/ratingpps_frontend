import { useEffect, useState } from "react";
import api from '../../services/api';
import NavBar from "../../components/NavBar";
import useAuthToken from "../../hooks/useAuthToken";
import "../../css/AdminDirectors.css"; // Consistent look

export default function ExpertDashboard() {
    const token = useAuthToken();
    const [expertInfo, setExpertInfo] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const [targets, setTargets] = useState({ teachers: [], institutes: [] });
    const [search, setSearch] = useState("");
    const [targetType, setTargetType] = useState("teacher");
    const [targetId, setTargetId] = useState("");
    const [points, setPoints] = useState(0);
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchDashboard = () => {
        setLoading(true);
        api.get("/api/expert/dashboard", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                setExpertInfo(res.data.expertInfo);
                setHistory(res.data.history);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchDashboard();
        api.get("/api/expert/targets", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setTargets(res.data))
            .catch(err => console.error(err));
    }, [token]);

    const handleAddAdjustment = async (e) => {
        e.preventDefault();
        if (!targetId || !points || !reason) {
            alert("Заполните все поля");
            return;
        }
        setSubmitting(true);
        try {
            await api.post("/api/expert/adjustment", {
                targetType,
                targetId: Number(targetId),
                points: Number(points),
                reason
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            setTargetId("");
            setPoints(0);
            setReason("");
            fetchDashboard();
        } catch (err) {
            alert(err.response?.data?.error || "Ошибка при сохранении");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredTargets = (targetType === "teacher" ? targets.teachers : targets.institutes)
        .filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 10);

    return (
        <div className="ad-root">
            <style>{`
                .expert-search-result {
                    padding: 12px 16px;
                    cursor: pointer;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 14px;
                    color: #1e293b;
                    transition: all 0.2s;
                    background: #fff;
                }
                .expert-search-result:hover {
                    background: #f1f5f9;
                    color: #2563eb;
                    padding-left: 20px;
                }
                .expert-target-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 12px;
                    background: #eff6ff;
                    color: #2563eb;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 12px;
                }
                .expert-form-group {
                    margin-bottom: 20px;
                }
                .expert-type-btn {
                    flex: 1;
                    padding: 10px;
                    border-radius: 10px;
                    border: 2px solid #e2e8f0;
                    background: #fff;
                    color: #64748b;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .expert-type-btn.active {
                    border-color: #3b82f6;
                    background: #eff6ff;
                    color: #2563eb;
                }
            `}</style>
            <div className="header"><NavBar /></div>
            <div className="ad-container" style={{ maxWidth: '1200px' }}>
                <div className="ad-header">
                    <div className="ad-header__left">
                        <h1 className="ad-title" style={{ fontSize: '32px' }}>
                            <span className="ad-title__icon">🛡️</span>
                            Панель эксперта
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                            <span style={{ padding: '4px 12px', background: '#e0e7ff', color: '#4338ca', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                                ROLE: {expertInfo?.jobTitle || "EXPERT"}
                            </span>
                            <p className="ad-subtitle">Управление бонусными баллами и коэффициентами</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', marginTop: '24px' }}>
                    {/* Left Column: Actions */}
                    <div className="ad-card" style={{ padding: '28px', height: 'fit-content', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>✍️</span> Внести запись
                        </h3>
                        
                        <form onSubmit={handleAddAdjustment}>
                            <div className="expert-form-group">
                                <label className="ad-label">Объект начисления</label>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                    <button 
                                        type="button" 
                                        onClick={() => {setTargetType("teacher"); setTargetId(""); setSearch("");}}
                                        className={`expert-type-btn ${targetType === 'teacher' ? 'active' : ''}`}
                                    >👨‍🏫 Учитель</button>
                                    <button 
                                        type="button" 
                                        onClick={() => {setTargetType("institute"); setTargetId(""); setSearch("");}}
                                        className={`expert-type-btn ${targetType === 'institute' ? 'active' : ''}`}
                                    >🏛️ Институт</button>
                                </div>
                            </div>

                            <div className="expert-form-group">
                                <label className="ad-label">Поиск по базе</label>
                                {targetId ? (
                                    <div className="expert-target-chip">
                                        <span>📍 {search}</span>
                                        <button type="button" onClick={() => {setTargetId(""); setSearch("");}} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                                    </div>
                                ) : (
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            className="ad-select" 
                                            type="text" 
                                            placeholder={`Имя ${targetType === 'teacher' ? 'преподавателя' : 'института'}...`} 
                                            value={search} 
                                            onChange={e => setSearch(e.target.value)} 
                                            style={{ paddingLeft: '40px' }}
                                        />
                                        <span style={{ position: 'absolute', left: '14px', top: '11px', opacity: 0.4 }}>🔍</span>
                                        {search && (
                                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, border: '1px solid #e2e8f0', borderRadius: '12px', marginTop: '8px', maxHeight: '250px', overflowY: 'auto', background: '#fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 10 }}>
                                                {filteredTargets.length > 0 ? filteredTargets.map(t => (
                                                    <div key={t.id} className="expert-search-result" onClick={() => {setTargetId(t.id); setSearch(t.name);}}>
                                                        {t.name}
                                                    </div>
                                                )) : <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>Ничего не найдено</div>}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="expert-form-group">
                                <label className="ad-label">Весовой коэффициент (баллы)</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        className="ad-select" 
                                        type="number" 
                                        value={points} 
                                        onChange={e => setPoints(e.target.value)} 
                                        style={{ fontWeight: 'bold', fontSize: '16px', color: points > 0 ? '#16a34a' : points < 0 ? '#dc2626' : '#1f2937' }}
                                    />
                                    <span style={{ position: 'absolute', right: '14px', top: '10px', fontSize: '12px', color: '#94a3b8', fontWeight: 'bold' }}>PTS</span>
                                </div>
                            </div>

                            <div className="expert-form-group">
                                <label className="ad-label">Обоснование решения</label>
                                <textarea 
                                    className="ad-select" 
                                    style={{ padding: '12px', minHeight: '100px', fontFamily: 'inherit', resize: 'none' }} 
                                    value={reason} 
                                    onChange={e => setReason(e.target.value)}
                                    placeholder="Укажите причину или ссылку на приказ..."
                                ></textarea>
                            </div>

                            <button className="ad-btn ad-btn--confirm" style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '15px' }} disabled={submitting}>
                                {submitting ? "🔥 Обработка..." : "⚡ Применить изменения"}
                            </button>
                        </form>
                    </div>

                    {/* Right Column: History */}
                    <div className="ad-card" style={{ padding: '28px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '20px' }}>📋</span> История начислений
                            </h3>
                            <span style={{ padding: '4px 10px', background: '#f1f5f9', color: '#475569', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                                {history.length} записей
                            </span>
                        </div>

                        {history.length === 0 ? (
                            <div style={{ padding: '60px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1.5px dashed #e2e8f0' }}>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '15px' }}>Вы еще не вносили правок</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left' }}>
                                            <th style={{ padding: '0 12px 12px', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Объект</th>
                                            <th style={{ padding: '0 12px 12px', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Баллы</th>
                                            <th style={{ padding: '0 12px 12px', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', width: '40%' }}>Причина</th>
                                            <th style={{ padding: '0 12px 12px', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Дата</th>
                                            <th style={{ padding: '0 12px 12px', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Статус</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map(row => (
                                            <tr key={row.id} style={{ background: row.isActive ? '#fff' : '#f8fafc', opacity: row.isActive ? 1 : 0.6 }}>
                                                <td style={{ padding: '14px 12px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', borderLeft: '1px solid #f1f5f9', borderRadius: '10px 0 0 10px', fontWeight: '600', color: '#1e293b' }}>
                                                    {row.targetName}
                                                </td>
                                                <td style={{ padding: '14px 12px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                                                    <span style={{ 
                                                        padding: '4px 8px', 
                                                        background: row.points > 0 ? '#dcfce7' : '#fee2e2', 
                                                        color: row.points > 0 ? '#16a34a' : '#dc2626',
                                                        borderRadius: '6px',
                                                        fontWeight: '800',
                                                        fontSize: '14px'
                                                    }}>
                                                        {row.points > 0 ? `+${row.points}` : row.points}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 12px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#475569' }}>
                                                    {row.reason}
                                                </td>
                                                <td style={{ padding: '14px 12px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                                                    {row.createdAt.split(' ')[0]}
                                                </td>
                                                <td style={{ padding: '14px 12px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9', borderRadius: '0 10px 10px 0' }}>
                                                    <span style={{ 
                                                        padding: '3px 8px', 
                                                        background: row.isActive ? '#f0fdf4' : '#f1f5f9', 
                                                        color: row.isActive ? '#16a34a' : '#64748b', 
                                                        fontSize: '11px', 
                                                        fontWeight: '700', 
                                                        borderRadius: '4px',
                                                        border: `1px solid ${row.isActive ? '#bbf7d0' : '#e2e8f0'}`
                                                    }}>
                                                        {row.isActive ? "АКТИВЕН" : "ЗАМОРОЖЕН"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
