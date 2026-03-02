import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import "../css/Awards.css";

const StageNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [stages, setStages] = useState([]);

    useEffect(() => {
        let mounted = true;
        const fetchStages = async () => {
            try {
                const res = await api.get("/api/award/all");
                if (mounted) setStages(res.data.stages || []);
            } catch (e) {
                // stages не загрузились
            }
        };
        fetchStages();
        return () => { mounted = false; };
    }, []);

    const isActive = (path) => location.pathname === path;
    const isStageActive = (stageId) =>
        location.pathname === `/awards/${stageId}` ||
        (location.pathname === "/awards" && stages[0]?.stageId === stageId);

    return (
        <div className="stage-nav">
            {/* Группа 1 — Профиль */}
            <div className="stage-nav__group stage-nav__group--profile">
                <button
                    className={`stage-nav__tab stage-nav__tab--profile${isActive("/private_office") ? " active" : ""}`}
                    onClick={() => navigate("/private_office")}
                    type="button"
                >
                    👤 Личные данные
                </button>
                <button
                    className={`stage-nav__tab stage-nav__tab--profile${isActive("/my_answers") ? " active" : ""}`}
                    onClick={() => navigate("/my_answers")}
                    type="button"
                >
                    🏅 Мои награды
                </button>
            </div>

            {/* Разделитель */}
            {stages.length > 0 && <div className="stage-nav__divider" />}

            {/* Группа 2 — Этапы */}
            {stages.length > 0 && (
                <div className="stage-nav__group stage-nav__group--stages">
                    {stages.map((stage) => (
                        <button
                            key={stage.stageId}
                            className={`stage-nav__tab${isStageActive(stage.stageId) ? " active" : ""}`}
                            onClick={() => navigate(`/awards/${stage.stageId}`)}
                            type="button"
                        >
                            {stage.stageName}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StageNav;
