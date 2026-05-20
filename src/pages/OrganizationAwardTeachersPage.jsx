import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import YearSelector from "../components/YearSelector";
import { useYears } from "../hooks/useYears";
import api from "../services/api";

export default function OrganizationAwardTeachersPage() {
  const { id } = useParams();
  const orgId = Number(id);

  const { years, selectedYear, setSelectedYear, loading: yearsLoading } = useYears();
  const selectedYearId = selectedYear?.id ?? selectedYear?.yearId ?? null;
  const selectedYearName = selectedYear?.name ?? selectedYear?.yearName ?? "Не выбран";

  const [org, setOrg] = useState(null);
  const [awards, setAwards] = useState([]);
  const [selectedTitleId, setSelectedTitleId] = useState(null);
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!Number.isFinite(orgId) || orgId <= 0) return;
    let cancelled = false;
    const load = async () => {
      try {
        const [orgRes, questionsRes] = await Promise.all([
          api.get(`/api/organizations/${orgId}`),
          api.get("/api/rating/question/get/awards"),
        ]);
        if (cancelled) return;
        const awardsData = questionsRes.data?.awards ?? [];
        setOrg(orgRes.data);
        setAwards(awardsData);
        if (awardsData.length > 0) {
          const firstTitle = awardsData[0];
          const firstSub = firstTitle.subtitle?.[0];
          setSelectedTitleId(firstTitle.id);
          setSelectedSubId(firstSub?.id ?? null);
        }
      } catch {
        if (!cancelled) setError("Ошибка загрузки данных");
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [orgId]);

  const selectedTitle = useMemo(
    () => awards.find((a) => Number(a.id) === Number(selectedTitleId)) ?? null,
    [awards, selectedTitleId]
  );
  const subtitleOptions = selectedTitle?.subtitle ?? [];

  useEffect(() => {
    if (!selectedTitle) return;
    if (!subtitleOptions.some((s) => Number(s.id) === Number(selectedSubId))) {
      setSelectedSubId(subtitleOptions[0]?.id ?? null);
    }
  }, [selectedTitle, selectedSubId, subtitleOptions]);

  useEffect(() => {
    if (yearsLoading || !selectedTitleId || !selectedSubId) return;
    let cancelled = false;
    const loadRows = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = selectedYearId ? { yearId: selectedYearId } : {};
        const res = await api.get(`/api/rating/organization/${orgId}/awards/${selectedTitleId}/${selectedSubId}/teachers`, { params });
        if (!cancelled) setRows(res.data?.teachers ?? []);
      } catch {
        if (!cancelled) setError("Ошибка загрузки рейтинга по награде");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadRows();
    return () => {
      cancelled = true;
    };
  }, [orgId, selectedTitleId, selectedSubId, selectedYearId, yearsLoading]);

  return (
    <div className="home-content">
      <header className="header"><NavBar /></header>
      <main className="main max-main">
        <div style={{ marginBottom: 14 }}>
          <Link to={`/organization/${orgId}`} className="orgPage__back">← Назад к организации</Link>
        </div>

        <h2 className="title" style={{ marginBottom: 8 }}>
          Рейтинг преподавателей по награде {org?.name ? `— ${org.name}` : ""}
        </h2>
        <div style={{ color: "#475569", fontWeight: 600, marginBottom: 12 }}>
          Данные за учебный год: {selectedYearName}
        </div>

        <YearSelector years={years} selectedYear={selectedYear} onChange={setSelectedYear} loading={yearsLoading} />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <select
            className="ad-select"
            value={selectedTitleId ?? ""}
            onChange={(e) => setSelectedTitleId(Number(e.target.value))}
            style={{ maxWidth: 420 }}
          >
            {awards.map((award) => (
              <option key={award.id} value={award.id}>{award.name}</option>
            ))}
          </select>

          <select
            className="ad-select"
            value={selectedSubId ?? ""}
            onChange={(e) => setSelectedSubId(Number(e.target.value))}
            style={{ maxWidth: 500 }}
          >
            {subtitleOptions.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>

        {loading && <div className="loading" style={{ textAlign: "center", padding: 32 }}>Загрузка...</div>}
        {error && !loading && <div style={{ color: "#b91c1c", textAlign: "center", padding: 20 }}>{error}</div>}

        {!loading && !error && (
          <div className="table-responsive">
            <table className="user-table">
              <thead>
                <tr>
                  <th className="table-header">#</th>
                  <th className="table-header">Преподаватель</th>
                  <th className="table-header">Институт</th>
                  <th className="table-header">Баллы по награде</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={`${row.teacherId}-${idx}`} className="table-row">
                    <td className="table-data text-center">{idx + 1}</td>
                    <td className="table-data">
                      <Link to={`/user/${row.teacherId}${selectedYearId ? `?yearId=${selectedYearId}` : ""}`} style={{ color: "#0f172a", textDecoration: "none", fontWeight: 600 }}>
                        {row.name}
                      </Link>
                    </td>
                    <td className="table-data">{row.institute}</td>
                    <td className="table-data text-center" style={{ fontWeight: 700, color: "#166534" }}>
                      {Number(row.point ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan="4" className="table-data text-center">Нет преподавателей с этой наградой в выбранном году</td>
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
