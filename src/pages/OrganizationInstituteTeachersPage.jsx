import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import YearSelector from "../components/YearSelector";
import { useYears } from "../hooks/useYears";
import api from "../services/api";
import "../css/Rating.css";

export default function OrganizationInstituteTeachersPage() {
  const { id, instituteId } = useParams();
  const orgId = Number(id);
  const instId = Number(instituteId);

  const { years, selectedYear, setSelectedYear, loading: yearsLoading } = useYears();
  const selectedYearId = selectedYear?.id ?? selectedYear?.yearId ?? null;
  const selectedYearName = selectedYear?.name ?? selectedYear?.yearName ?? "Не выбран";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!Number.isFinite(orgId) || !Number.isFinite(instId) || yearsLoading) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = selectedYearId ? { yearId: selectedYearId } : {};
        const res = await api.get(`/api/rating/organization/${orgId}/institutes/${instId}/teachers`, { params });
        if (!cancelled) setData(res.data);
      } catch (e) {
        if (!cancelled) setError("Ошибка загрузки преподавателей института");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [orgId, instId, selectedYearId, yearsLoading]);

  const teachers = data?.teachers ?? [];
  const withPoints = useMemo(() => teachers.filter((t) => Number(t.points) > 0).length, [teachers]);
  const withoutPoints = teachers.length - withPoints;
  const completionPct = teachers.length > 0 ? Math.round((withPoints / teachers.length) * 100) : 0;
  const pieStyle = {
    background: `conic-gradient(#16a34a 0 ${completionPct}%, #e5e7eb ${completionPct}% 100%)`,
  };

  return (
    <div className="home-content">
      <header className="header">
        <NavBar />
      </header>

      <main className="main max-main">
        <div style={{ marginBottom: 14 }}>
          <Link to={`/organization/${orgId}/institutes`} className="orgPage__back">
            ← Назад к рейтингу институтов
          </Link>
        </div>

        <h2 className="title" style={{ marginBottom: 8 }}>
          {data?.institute?.name ?? `Институт #${instId}`}
          {data?.institute?.reduction ? ` (${data.institute.reduction})` : ""}
        </h2>
        <div style={{ color: "#475569", fontWeight: 600, marginBottom: 14 }}>
          Данные за учебный год: {selectedYearName}
        </div>

        <YearSelector years={years} selectedYear={selectedYear} onChange={setSelectedYear} loading={yearsLoading} />

        {loading && <div className="loading" style={{ textAlign: "center", padding: 36 }}>Загрузка...</div>}
        {error && !loading && <div style={{ color: "#b91c1c", padding: 20, textAlign: "center" }}>{error}</div>}

        {!loading && !error && (
          <>
            <section style={{
              display: "flex",
              gap: 24,
              alignItems: "center",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              padding: 20,
              marginBottom: 18,
              flexWrap: "wrap",
            }}>
              <div style={{ width: 140, height: 140, borderRadius: "50%", ...pieStyle, display: "grid", placeItems: "center" }}>
                <div style={{ width: 94, height: 94, borderRadius: "50%", background: "#fff", display: "grid", placeItems: "center", fontWeight: 800, color: "#0f172a" }}>
                  {completionPct}%
                </div>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <h3 style={{ margin: 0, color: "#0f172a" }}>Заполнение по преподавателям</h3>
                <div style={{ color: "#166534", fontWeight: 700 }}>С баллами: {withPoints}</div>
                <div style={{ color: "#64748b", fontWeight: 700 }}>Без баллов: {withoutPoints}</div>
                <div style={{ color: "#334155" }}>Всего преподавателей: {teachers.length}</div>
              </div>
            </section>

            <div className="table-responsive">
              <table className="user-table">
                <thead>
                  <tr>
                    <th className="table-header">#</th>
                    <th className="table-header">Преподаватель</th>
                    <th className="table-header">Баллы</th>
                    <th className="table-header">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((teacher, idx) => {
                    const points = Number(teacher.points ?? 0);
                    const hasPoints = points > 0;
                    return (
                      <tr key={teacher.teacherId ?? idx} className="table-row">
                        <td className="table-data text-center">{idx + 1}</td>
                        <td className="table-data">
                          {teacher.teacherId ? (
                            <Link to={`/user/${teacher.teacherId}`} style={{ color: "#0f172a", textDecoration: "none", fontWeight: 600 }}>
                              {teacher.fullName}
                            </Link>
                          ) : (
                            teacher.fullName
                          )}
                        </td>
                        <td className="table-data text-center" style={{ fontWeight: 700, color: hasPoints ? "#166534" : "#475569" }}>
                          {points.toFixed(2)}
                        </td>
                        <td className="table-data text-center">
                          <span style={{
                            padding: "4px 10px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 700,
                            color: hasPoints ? "#166534" : "#334155",
                            background: hasPoints ? "#dcfce7" : "#e2e8f0",
                          }}>
                            {hasPoints ? "Есть заполнение" : "Нет заполнения"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {teachers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="table-data text-center">Для этого института пока нет преподавателей</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
