import { useEffect, useState, useCallback } from "react";
import api from '../../services/api';
import NavBar from "../../components/NavBar";
import DirectorStageNav from "../../components/DirectorStageNav";
import AccountConf from "../../components/AccountConf";
import useAuthToken from "../../hooks/useAuthToken";
import "../../css/DirectorOffice.css";
import "../../css/PrivateOfficeNew.css";
import "../../css/Awards.css";

export default function DirectorAnswersPage() {
    const token = useAuthToken();
    const headers = { Authorization: `Bearer ${token}` };

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // { [subtitleId]: string } — local input values (one per subtitle, cleared after save)
    const [links, setLinks] = useState({});
    // { [subtitleId]: 'saving' | 'success' | 'error' | null }
    const [status, setStatus] = useState({});

    // accordion open state by titleName
    const [openTitles, setOpenTitles] = useState({});

    useEffect(() => {
        let mounted = true;
        api.get("/api/director/institute/answers", { headers })
            .then((res) => {
                if (!mounted) return;
                const data = Array.isArray(res.data) ? res.data : [];
                // De-duplicate: we only need one row per subtitle for the questions list
                const seen = new Set();
                const unique = [];
                data.forEach(q => {
                    const sid = q.subtitleId ?? q.id; // may not have subtitleId
                    if (!seen.has(q.subtitleName)) {
                        seen.add(q.subtitleName);
                        unique.push(q);
                    }
                });
                setQuestions(unique);
                // open all titles
                const ot = {};
                [...new Set(unique.map(q => q.titleName))].forEach(t => { ot[t] = true; });
                setOpenTitles(ot);
            })
            .catch((e) => { if (mounted) setError(e.response?.data?.message || "Ошибка загрузки"); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, []);

    const toggleTitle = useCallback((name) => {
        setOpenTitles(prev => ({ ...prev, [name]: !prev[name] }));
    }, []);

    const handleSave = async (q) => {
        const sid = q.answerId ?? q.id;
        const link = (links[sid] || "").trim();
        if (!link) return;

        setStatus(prev => ({ ...prev, [sid]: 'saving' }));
        try {
            // POST creates a new InstituteAnswer record with subtitleId and link
            await api.post("/api/director/institute/answers", {
                subtitleId: q.subtitleId,
                answerLink: link
            }, { headers });

            setStatus(prev => ({ ...prev, [sid]: 'success' }));
            setLinks(prev => ({ ...prev, [sid]: "" })); // clear input for next entry
            setTimeout(() => setStatus(prev => ({ ...prev, [sid]: null })), 2500);
        } catch (e) {
            setStatus(prev => ({ ...prev, [sid]: 'error' }));
            setTimeout(() => setStatus(prev => ({ ...prev, [sid]: null })), 3000);
        }
    };

    // Group by titleName
    const titleGroups = questions.reduce((acc, q) => {
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
                        <h2 className="po-page-title">📝 Вопросы института</h2>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                            Вставьте ссылку на документ рядом с каждым вопросом и нажмите «Сохранить».
                            Для одного вопроса можно добавить несколько ссылок.
                        </p>

                        {loading && (
                            <div className="po-loading"><div className="po-spinner" /><span>Загрузка...</span></div>
                        )}
                        {error && !loading && (
                            <div className="po-alert po-alert--error">{error}</div>
                        )}

                        {!loading && !error && (
                            <div className="awards-content">
                                {Object.entries(titleGroups).map(([titleName, items]) => (
                                    <div className="awards-title-block" key={titleName}>
                                        <button
                                            className="awards-title-header"
                                            onClick={() => toggleTitle(titleName)}
                                            type="button"
                                        >
                                            <span>{titleName}</span>
                                            <span className={`awards-title-arrow${openTitles[titleName] ? " open" : ""}`}>▼</span>
                                        </button>

                                        {openTitles[titleName] && (
                                            <div className="awards-subtitles">
                                                {items.map((q) => {
                                                    const sid = q.answerId ?? q.id;
                                                    const st = status[sid];
                                                    return (
                                                        <div className="awards-subtitle-row" key={sid}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                                                <span className="awards-subtitle-name">{q.subtitleName}</span>
                                                                {q.point != null && (
                                                                    <span style={{ fontSize: '12px', color: '#94a3b8', background: '#f1f5f9', borderRadius: '4px', padding: '2px 6px' }}>
                                                                        {q.point} б.
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                                <input
                                                                    className="awards-subtitle-input"
                                                                    type="text"
                                                                    value={links[sid] || ""}
                                                                    onChange={e => setLinks(prev => ({ ...prev, [sid]: e.target.value }))}
                                                                    placeholder="Вставьте ссылку на документ..."
                                                                    style={{ flex: 1, minWidth: '200px' }}
                                                                    disabled={st === 'saving'}
                                                                />
                                                                <button
                                                                    className="awards-submit-btn"
                                                                    onClick={() => handleSave(q)}
                                                                    disabled={st === 'saving' || !links[sid]}
                                                                    style={{ padding: '6px 16px', fontSize: '13px' }}
                                                                >
                                                                    {st === 'saving' ? "…" : "Сохранить"}
                                                                </button>
                                                            </div>
                                                            {/* Save feedback */}
                                                            {st === 'success' && (
                                                                <div style={{ color: '#16a34a', fontSize: '13px', marginTop: '6px', fontWeight: 600 }}>
                                                                    ✓ Ответ сохранён
                                                                </div>
                                                            )}
                                                            {st === 'error' && (
                                                                <div style={{ color: '#dc2626', fontSize: '13px', marginTop: '6px', fontWeight: 600 }}>
                                                                    ✗ Ошибка сохранения
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
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
