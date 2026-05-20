import { useEffect, useState } from "react";
import api from '../../services/api';
import NavBar from "../../components/NavBar";
import DirectorStageNav from "../../components/DirectorStageNav";
import AccountConf from "../../components/AccountConf";
import YearSelector from "../../components/YearSelector";
import useAuthToken from "../../hooks/useAuthToken";
import { useYears } from "../../hooks/useYears";
import "../../css/DirectorOffice.css";
import "../../css/PrivateOfficeNew.css";
import "../../css/Awards.css";

export default function DirectorInstituteAwardsPage() {
    const token = useAuthToken();
    const headers = { Authorization: `Bearer ${token}` };
    const { years, selectedYear, setSelectedYear, loading: yearsLoading } = useYears();

    const [awards, setAwards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // per-award state: { [id]: { editing, editValue, busy, msg, msgType } }
    const [rowState, setRowState] = useState({});

    const fetchAwards = () => {
        setLoading(true);
        const params = selectedYear ? { yearId: selectedYear.id } : {};
        api.get("/api/director/institute/awards", { headers, params })
            .then((res) => setAwards(Array.isArray(res.data) ? res.data : []))
            .catch((e) => setError(e.response?.data?.message || "Ошибка загрузки"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (yearsLoading) return;
        setError(null);
        fetchAwards();
    }, [selectedYear, yearsLoading]); // eslint-disable-line

    const isCurrentYearSelected = Boolean(selectedYear?.isCurrent);

    const setRow = (id, patch) =>
        setRowState(prev => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }));

    /* ── edit link ── */
    const startEdit = (award) => {
        setRow(award.answerId ?? award.id, { editing: true, editValue: award.answerLink || "", msg: null });
    };
    const cancelEdit = (id) => setRow(id, { editing: false, msg: null });

    const saveEdit = async (id) => {
        const val = (rowState[id]?.editValue || "").trim();
        if (!val) return;
        setRow(id, { busy: true, msg: null });
        try {
            await api.patch(`/api/director/institute/awards/${id}`, { answerLink: val }, { headers });
            setAwards(prev => prev.map(a => (a.answerId ?? a.id) === id ? { ...a, answerLink: val } : a));
            setRow(id, { busy: false, editing: false, msg: "✓ Ссылка обновлена", msgType: "ok" });
            setTimeout(() => setRow(id, { msg: null }), 2500);
        } catch (e) {
            setRow(id, { busy: false, msg: "✗ " + (e.response?.data?.error || "Ошибка"), msgType: "err" });
        }
    };

    /* ── delete ── */
    const handleDelete = async (id) => {
        if (!window.confirm("Удалить эту награду?")) return;
        setRow(id, { busy: true });
        try {
            await api.delete(`/api/director/institute/awards/${id}`, { headers });
            setAwards(prev => prev.filter(a => (a.answerId ?? a.id) !== id));
        } catch (e) {
            setRow(id, { busy: false, msg: "✗ " + (e.response?.data?.error || "Ошибка удаления"), msgType: "err" });
        }
    };

    /* ── freeze / unfreeze ── */
    const handleFreeze = async (id, makeActive) => {
        setRow(id, { busy: true, msg: null });
        try {
            await api.patch(`/api/director/institute/awards/${id}/freeze`, { active: makeActive }, { headers });
            setAwards(prev => prev.map(a => (a.answerId ?? a.id) === id ? { ...a, isActive: makeActive } : a));
            setRow(id, { busy: false, msg: makeActive ? "✓ Разморожено" : "❄ Заморожено", msgType: "ok" });
            setTimeout(() => setRow(id, { msg: null }), 2500);
        } catch (e) {
            setRow(id, { busy: false, msg: "✗ Ошибка", msgType: "err" });
        }
    };

    // Group by titleName
    const titleGroups = awards.reduce((acc, q) => {
        const t = q.titleName || "Без заголовка";
        if (!acc[t]) acc[t] = [];
        acc[t].push(q);
        return acc;
    }, {});

    return (
        <div className="private-office-contents">
            <div className="header"><NavBar /></div>
            <div className="private-office__main">
                <AccountConf />
                <div className="office">
                    <DirectorStageNav />

                    <div className="po-page">
                        <h2 className="po-page-title">🏆 Награды института</h2>
                        <YearSelector
                            years={years}
                            selectedYear={selectedYear}
                            onChange={setSelectedYear}
                            loading={yearsLoading}
                        />
                        {!isCurrentYearSelected && (
                            <div className="po-alert" style={{ marginBottom: '12px' }}>
                                Просмотр архивного года: редактирование и удаление отключены.
                            </div>
                        )}
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                            Здесь отображаются ваши загруженные документы. Вы можете редактировать, удалять и замораживать награды.
                        </p>

                        {loading && <div className="po-loading"><div className="po-spinner" /><span>Загрузка...</span></div>}
                        {error && !loading && <div className="po-alert po-alert--error">{error}</div>}

                        {!loading && !error && awards.length === 0 && (
                            <div style={{ background: '#f8fafc', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                                <p>Пока нет подтверждённых наград.<br />Загрузите ссылки в разделе «Вопросы института».</p>
                            </div>
                        )}

                        {!loading && !error && awards.length > 0 && (
                            <div className="awards-content">
                                {Object.entries(titleGroups).map(([titleName, items]) => (
                                    <div className="awards-title-block" key={titleName}>
                                        <div className="awards-title-header" style={{ background: 'linear-gradient(to right, #f0fdf4, #dcfce7)', cursor: 'default' }}>
                                            <span>🏅 {titleName}</span>
                                            <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: 600 }}>{items.length} шт.</span>
                                        </div>
                                        <div className="awards-subtitles">
                                            {items.map((q) => {
                                                const id = q.answerId ?? q.id;
                                                const rs = rowState[id] || {};
                                                const frozen = q.isActive === false;
                                                return (
                                                    <div
                                                        className="awards-subtitle-row"
                                                        key={id}
                                                        style={{
                                                            borderLeft: frozen ? '3px solid #94a3b8' : '3px solid #22c55e',
                                                            opacity: frozen ? 0.7 : 1
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                                            <div>
                                                                <span className="awards-subtitle-name">{q.subtitleName}</span>
                                                                {q.point != null && (
                                                                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#94a3b8', background: '#f1f5f9', borderRadius: '4px', padding: '2px 6px' }}>
                                                                        {q.point} б.
                                                                    </span>
                                                                )}
                                                                {frozen && (
                                                                    <span style={{ marginLeft: '8px', fontSize: '11px', color: '#64748b', background: '#e2e8f0', borderRadius: '4px', padding: '2px 6px' }}>
                                                                        ❄ Заморожена
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {/* Action buttons */}
                                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                                <a href={q.answerLink} target="_blank" rel="noopener noreferrer"
                                                                    style={{ color: '#3b82f6', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
                                                                    ↗ Документ
                                                                </a>
                                                                <button
                                                                    onClick={() => startEdit(q)}
                                                                    disabled={rs.busy || !isCurrentYearSelected}
                                                                    style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>
                                                                    ✏️ Изменить
                                                                </button>
                                                                <button
                                                                    onClick={() => handleFreeze(id, frozen)}
                                                                    disabled={rs.busy || !isCurrentYearSelected}
                                                                    style={{ background: frozen ? '#dcfce7' : '#fef9c3', color: frozen ? '#15803d' : '#854d0e', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>
                                                                    {frozen ? '🔥 Разморозить' : '❄ Заморозить'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(id)}
                                                                    disabled={rs.busy || !isCurrentYearSelected}
                                                                    style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>
                                                                    🗑 Удалить
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Edit mode */}
                                                        {rs.editing && (
                                                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                                                                <input
                                                                    className="awards-subtitle-input"
                                                                    type="text"
                                                                    value={rs.editValue || ""}
                                                                    onChange={e => setRow(id, { editValue: e.target.value })}
                                                                    placeholder="Новая ссылка..."
                                                                    style={{ flex: 1, minWidth: '180px' }}
                                                                    disabled={rs.busy}
                                                                />
                                                                <button className="awards-submit-btn" onClick={() => saveEdit(id)} disabled={rs.busy} style={{ padding: '6px 14px', fontSize: '13px' }}>
                                                                    {rs.busy ? "…" : "✓ Сохранить"}
                                                                </button>
                                                                <button className="awards-back-btn" onClick={() => cancelEdit(id)} disabled={rs.busy} style={{ padding: '6px 14px', fontSize: '13px' }}>
                                                                    Отмена
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* Feedback */}
                                                        {rs.msg && (
                                                            <div style={{ marginTop: '6px', fontSize: '13px', color: rs.msgType === 'ok' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                                                                {rs.msg}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
