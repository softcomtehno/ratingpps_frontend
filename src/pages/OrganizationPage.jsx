import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import api from "../services/api";
import "../css/OrganizationPage.css";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "https://api.pps.makalabox.com";

function OrganizationPage() {
  const { id } = useParams();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  const orgId = useMemo(() => Number(id), [id]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/organizations/${orgId}`);
        if (!cancelled) setOrg(res.data);
      } catch (e) {
        console.error("Ошибка загрузки организации:", e);
        if (!cancelled) setOrg(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (Number.isFinite(orgId) && orgId > 0) load();
    else {
      setLoading(false);
      setOrg(null);
    }

    return () => {
      cancelled = true;
    };
  }, [orgId]);

  const photoUrl = useMemo(() => {
    if (!org) return null;

    // если бэк отдаёт готовый url
    if (org.photoUrl) {
      const u = org.photoUrl.startsWith("http") ? org.photoUrl : `${API_ORIGIN}${org.photoUrl}`;
      return u;
    }

    // если бэк отдаёт только имя файла
    if (org.photoFilename) {
      return `${API_ORIGIN}/uploads/organizations/${org.photoFilename}`;
    }

    return null;
  }, [org]);

  return (
    <div className="contents">
      <div className="header">
        <NavBar />
      </div>

      <div className="orgPage">
        <div className="orgPage__container">
          <Link className="orgPage__back" to="/">
            ← Назад
          </Link>

          {loading && <div className="orgPage__loading">Загрузка...</div>}

          {!loading && !org && (
            <div className="orgPage__error">
              Организация не найдена или нет доступа.
            </div>
          )}

          {!loading && org && (
            <>
              <div className="orgHero">
                <div className="orgHero__logoWrap">
                  {photoUrl ? (
                    <img className="orgHero__logo" src={photoUrl} alt={org.name} />
                  ) : (
                    <div className="orgHero__logoPlaceholder">Нет фото</div>
                  )}
                </div>

                <div className="orgHero__info">
                  <h1 className="orgHero__title">{org.name}</h1>
                  <p className="orgHero__subtitle">
                    Выберите направление рейтинга для просмотра.
                  </p>
                </div>
              </div>

              <div className="orgActions">
                <Link
                  to={`/organization/${org.id}/teachers`}
                  className="orgCardLink"
                >
                  <div className="orgCard">
                    <div className="orgCard__title">Рейтинг преподавателей</div>
                    <div className="orgCard__desc">
                      Список преподавателей организации и их баллы.
                    </div>
                  </div>
                </Link>

                <Link
                  to={`/organization/${org.id}/institutes`}
                  className="orgCardLink"
                >
                  <div className="orgCard">
                    <div className="orgCard__title">Рейтинг институтов</div>
                    <div className="orgCard__desc">
                      Рейтинг институтов внутри организации по баллам.
                    </div>
                  </div>
                </Link>

                <Link
                  to={`/organization/${org.id}/awards-rating`}
                  className="orgCardLink"
                >
                  <div className="orgCard">
                    <div className="orgCard__title">Рейтинг по наградам</div>
                    <div className="orgCard__desc">
                      Рейтинг преподавателей организации по выбранной награде.
                    </div>
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrganizationPage;
