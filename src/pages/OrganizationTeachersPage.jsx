import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import api from "../services/api";
import "../css/OrganizationTeachersPage.css";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "https://api.pps.makalabox.com";

const OrganizationTeachersPage = () => {
  const params = useParams();
  const id = params.orgId ?? params.id;

  const [org, setOrg] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortStageId, setSortStageId] = useState(null);
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    if (!id) {
      setError("Не найден id организации в URL");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    // Параллельно грузим данные организации и рейтинг
    Promise.all([
      api.get(`/api/organizations/${id}`).then(r => r.data).catch(() => null),
      fetch(`https://api.pps.makalabox.com/api/rating/organization/${id}/pps`, {
        signal: controller.signal,
      })
        .then(res => {
          if (!res.ok) throw new Error("Ошибка загрузки рейтинга");
          return res.json();
        })
        .then(data => Array.isArray(data) ? data : Object.values(data ?? {})),
    ])
      .then(([orgData, ratingsData]) => {
        setOrg(orgData);
        setRatings(ratingsData);
        setLoading(false);
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        setError(err.message || "Ошибка");
        setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  const stageData = useMemo(() => {
    const first = ratings?.[0];
    const awards = Array.isArray(first?.awards) ? first.awards : [];
    return awards.map((a) => ({
      stageId: a.stageId,
      stageTitle: a.stageTitle,
    }));
  }, [ratings]);

  const photoUrl = useMemo(() => {
    if (!org) return null;
    if (org.photoUrl)
      return org.photoUrl.startsWith("http") ? org.photoUrl : `${API_ORIGIN}${org.photoUrl}`;
    if (org.photoFilename)
      return `${API_ORIGIN}/uploads/organizations/${org.photoFilename}`;
    return null;
  }, [org]);

  const teachers = useMemo(() => {
    const list = Array.isArray(ratings) ? [...ratings] : [];

    if (sortStageId !== null) {
      list.sort((a, b) => {
        const aPoints = a?.awards?.find((item) => item.stageId === sortStageId)?.teacherPoint ?? 0;
        const bPoints = b?.awards?.find((item) => item.stageId === sortStageId)?.teacherPoint ?? 0;
        return sortDirection === "asc" ? aPoints - bPoints : bPoints - aPoints;
      });
      return list;
    }

    list.sort((a, b) => {
      const at = Number(a?.total ?? 0);
      const bt = Number(b?.total ?? 0);
      return sortDirection === "asc" ? at - bt : bt - at;
    });

    return list;
  }, [ratings, sortStageId, sortDirection]);

  const handleSort = (stageId) => {
    if (stageId === sortStageId) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortStageId(stageId);
      setSortDirection("desc");
    }
  };

  const handleSortTotal = () => {
    if (sortStageId === null) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortStageId(null);
      setSortDirection("desc");
    }
  };

  const rankMedal = (idx) => {
    if (idx === 0) return <span className="otp-medal otp-medal--gold">🥇</span>;
    if (idx === 1) return <span className="otp-medal otp-medal--silver">🥈</span>;
    if (idx === 2) return <span className="otp-medal otp-medal--bronze">🥉</span>;
    return <span className="otp-rank">{idx + 1}</span>;
  };

  const SortArrow = ({ active, direction }) =>
    active ? (
      <span className="otp-sort-arrow">{direction === "asc" ? "▲" : "▼"}</span>
    ) : (
      <span className="otp-sort-arrow otp-sort-arrow--idle">⇅</span>
    );

  return (
    <div className="otp-root">
      <div className="header">
        <NavBar />
      </div>

      <div className="otp-wrap">
        <div className="otp-hero">
          {photoUrl ? (
            <img className="otp-hero__logo" src={photoUrl} alt={org?.name ?? "Организация"} />
          ) : (
            <div className="otp-hero__icon">🏆</div>
          )}
          <div>
            <p className="otp-hero__org">{org?.name ?? `Организация #${id}`}</p>
            <h1 className="otp-hero__title">Рейтинг преподавателей</h1>
          </div>
        </div>

        {loading && (
          <div className="otp-state">
            <div className="otp-spinner" />
            <span>Загрузка данных...</span>
          </div>
        )}

        {error && !loading && (
          <div className="otp-state otp-state--error">
            <span className="otp-state__icon">⚠️</span>
            {error}
          </div>
        )}

        {!loading && !error && teachers.length === 0 && (
          <div className="otp-state otp-state--empty">
            <span className="otp-state__icon">📋</span>
            Нет данных по преподавателям для этой организации
          </div>
        )}

        {!loading && !error && teachers.length > 0 && (
          <>
            <div className="otp-stats">
              <div className="otp-stat-card">
                <div className="otp-stat-card__val">{teachers.length}</div>
                <div className="otp-stat-card__label">Преподавателей</div>
              </div>
              <div className="otp-stat-card">
                <div className="otp-stat-card__val">{stageData.length}</div>
                <div className="otp-stat-card__label">Этапов</div>
              </div>
              <div className="otp-stat-card">
                <div className="otp-stat-card__val">
                  {teachers[0]?.total ?? 0}
                </div>
                <div className="otp-stat-card__label">Макс. балл</div>
              </div>
            </div>

            <div className="otp-table-wrap">
              <table className="otp-table">
                <thead>
                  <tr>
                    <th className="otp-th otp-th--rank">#</th>
                    <th className="otp-th otp-th--name">Преподаватель</th>

                    {stageData.map((stage) => (
                      <th
                        key={String(stage.stageId)}
                        className={`otp-th otp-th--stage${sortStageId === stage.stageId ? " otp-th--active" : ""}`}
                        onClick={() => handleSort(stage.stageId)}
                        title="Сортировать по этапу"
                      >
                        {stage.stageTitle}
                        <SortArrow
                          active={sortStageId === stage.stageId}
                          direction={sortDirection}
                        />
                      </th>
                    ))}

                    <th
                      className={`otp-th otp-th--total${sortStageId === null ? " otp-th--active" : ""}`}
                      onClick={handleSortTotal}
                      title="Сортировать по общему рейтингу"
                    >
                      Итого
                      <SortArrow
                        active={sortStageId === null}
                        direction={sortDirection}
                      />
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {teachers.map((teacher, idx) => (
                    <tr
                      key={teacher?.id ?? teacher?.teacherId ?? `${teacher?.name}-${idx}`}
                      className={`otp-tr${idx < 3 ? ` otp-tr--top${idx + 1}` : idx % 2 === 0 ? " otp-tr--even" : ""}`}
                    >
                      <td className="otp-td otp-td--rank">{rankMedal(idx)}</td>
                      <td className="otp-td otp-td--name" title={teacher?.name ?? ""}>
                        {teacher?.name ?? <span className="otp-noname">Без имени</span>}
                      </td>

                      {stageData.map((stage) => {
                        const award = teacher?.awards?.find((a) => a.stageId === stage.stageId);
                        const pts = award?.teacherPoint;
                        return (
                          <td key={String(stage.stageId)} className="otp-td otp-td--points">
                            {pts != null && pts !== 0 ? (
                              <span className="otp-points">{pts}</span>
                            ) : (
                              <span className="otp-points otp-points--zero">—</span>
                            )}
                          </td>
                        );
                      })}

                      <td className="otp-td otp-td--total">
                        <span className="otp-total">{teacher?.total ?? 0}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrganizationTeachersPage;
