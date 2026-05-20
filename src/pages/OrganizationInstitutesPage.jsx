import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import YearSelector from "../components/YearSelector";
import { useYears } from "../hooks/useYears";
import api from "../services/api";
import "../css/Rating.css";
import "../css/OrganizationPage.css";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "https://api.pps.makalabox.com";

export default function OrganizationInstitutesPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const orgId = useMemo(() => Number(id), [id]);

    const [org, setOrg] = useState(null);
    const [institutes, setInstitutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { years, selectedYear, setSelectedYear, loading: yearsLoading } = useYears();
    const selectedYearId = selectedYear?.id ?? selectedYear?.yearId ?? null;
    const selectedYearName = selectedYear?.name ?? selectedYear?.yearName ?? "Не выбран";

    useEffect(() => {
        if (!Number.isFinite(orgId) || orgId <= 0) {
            setLoading(false);
            return;
        }
        if (yearsLoading) return;

        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = selectedYearId ? { yearId: selectedYearId } : {};
                const [orgRes, instRes] = await Promise.all([
                    api.get(`/api/organizations/${orgId}`),
                    api.get(`/api/rating/organization/${orgId}/institutes`, { params }),
                ]);
                if (cancelled) return;
                setOrg(orgRes.data);
                setInstitutes(instRes.data?.institutes ?? []);
            } catch (e) {
                if (!cancelled) setError("Ошибка загрузки данных");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, [orgId, selectedYearId, yearsLoading]);

    const photoUrl = useMemo(() => {
        if (!org) return null;
        if (org.photoUrl) {
            return org.photoUrl.startsWith("http") ? org.photoUrl : `${API_ORIGIN}${org.photoUrl}`;
        }
        if (org.photoFilename) {
            return `${API_ORIGIN}/uploads/organizations/${org.photoFilename}`;
        }
        return null;
    }, [org]);

    return (
        <div className="home-content">
            <header className="header">
                <NavBar />
            </header>

            <main className="main max-main">
                <div style={{ marginBottom: "16px" }}>
                    <Link to={`/organization/${orgId}`} className="orgPage__back">
                        ← Назад к организации
                    </Link>
                </div>

                {/* Заголовок с логотипом организации */}
                {org && (
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                        {photoUrl && (
                            <img
                                src={photoUrl}
                                alt={org.name}
                                style={{ width: "48px", height: "48px", objectFit: "contain", borderRadius: "8px" }}
                            />
                        )}
                        <h2 className="title" style={{ margin: 0 }}>
                            Рейтинг Институтов — {org.name}
                        </h2>
                    </div>
                )}

                {!org && !loading && (
                    <h2 className="title">Рейтинг Институтов</h2>
                )}

                <YearSelector years={years} selectedYear={selectedYear} onChange={setSelectedYear} loading={yearsLoading} />

                {!loading && !error && (
                    <div style={{ marginBottom: "12px", color: "#334155", fontSize: "14px", fontWeight: 600 }}>
                        Показаны данные за учебный год: {selectedYearName}
                    </div>
                )}

                {loading && (
                    <div className="loading" style={{ textAlign: "center", padding: "40px" }}>
                        Загрузка...
                    </div>
                )}

                {error && !loading && (
                    <div style={{ color: "red", textAlign: "center", padding: "20px" }}>{error}</div>
                )}

                {!loading && !error && (
                    <div className="table-responsive">
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th className="table-header">Позиция</th>
                                    <th className="table-header">Название Института</th>
                                    <th className="table-header">Сокращение</th>
                                    <th className="table-header">Кол-во ППС</th>
                                    <th className="table-header">Баллы экспертов</th>
                                    <th className="table-header">Сумма баллов</th>
                                    <th className="table-header">Средний балл</th>
                                </tr>
                            </thead>
                            <tbody>
                                {institutes.map((inst, index) => (
                                    <tr
                                        key={inst.id}
                                        className="table-row"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => navigate(`/organization/${orgId}/institutes/${inst.id}/teachers`)}
                                        title="Открыть преподавателей института"
                                    >
                                        <td className="table-data font-semibold text-center">{index + 1}</td>
                                        <td className="table-data">{inst.name}</td>
                                        <td className="table-data">{inst.reduction || "—"}</td>
                                        <td className="table-data text-center">{inst.teacherTotal ?? 0}</td>
                                        <td className="table-data text-center">{inst.expertPoints ?? 0}</td>
                                        <td className="table-data font-bold text-center text-blue-600">{Number(inst.points ?? 0).toFixed(2)}</td>
                                        <td className="table-data font-bold text-center text-blue-600">
                                            {inst.teacherTotal > 0 ? (Number(inst.points ?? 0) / inst.teacherTotal).toFixed(2) : "0.00"}
                                        </td>
                                    </tr>
                                ))}
                                {institutes.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="table-data text-center">
                                            Нет данных — институтов в этой организации пока нет
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
