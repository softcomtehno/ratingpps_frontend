import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import api from "../services/api";
import "./Home.css";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "https://api.pps.makalabox.com";

function Home() {
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    api
      .get("/api/organizations")
      .then((res) => {
        const items = Array.isArray(res.data)
          ? res.data
          : (res.data?.["hydra:member"] ?? res.data?.member ?? []);

        setOrganizations(items);
      })
      .catch((err) => {
        console.error("Ошибка загрузки организаций:", err);
      });
  }, []);

  const getOrgPath = (org) => {
    // рекомендую так, чтобы не было “левых названий”
    return `/organization/${org.id}`;
  };

  const getOrgPhotoUrl = (org) => {
    if (org.photoUrl) {
      // если уже полный/относительный url
      return org.photoUrl.startsWith("http") ? org.photoUrl : `${API_ORIGIN}${org.photoUrl}`;
    }

    if (org.photoFilename) {
      return `${API_ORIGIN}/uploads/organizations/${org.photoFilename}`;
    }

    return null;
  };

  return (
    <div className="contents">
      <div className="header">
        <NavBar />
      </div>

      <div className="main">
        <div className="home__cards">
          {organizations.map((org) => {
            const img = getOrgPhotoUrl(org);

            return (
              <div key={org.id} className="home__card">
                <Link to={getOrgPath(org)}>
                  {img ? (
                    <img
                      className="card__img"
                      src={img}
                      alt={org.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="card__img card__img--placeholder" />
                  )}
                </Link>

                <p className="card__text">{org.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Home;
