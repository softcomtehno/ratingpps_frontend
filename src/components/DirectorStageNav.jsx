import { useNavigate, useLocation } from "react-router-dom";
import "../css/DirectorOffice.css";

const DirectorStageNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="stage-nav">
            {/* Группа — Директор */}
            <div className="stage-nav__group stage-nav__group--profile">
                <button
                    className={`stage-nav__tab stage-nav__tab--director${isActive("/director/institute") ? " active" : ""}`}
                    onClick={() => navigate("/director/institute")}
                    type="button"
                >
                    🏛️ Мой институт
                </button>
                <button
                    className={`stage-nav__tab stage-nav__tab--director${isActive("/director/teachers") ? " active" : ""}`}
                    onClick={() => navigate("/director/teachers")}
                    type="button"
                >
                    👥 Сотрудники
                </button>
                <button
                    className={`stage-nav__tab stage-nav__tab--director${isActive("/director/answers") ? " active" : ""}`}
                    onClick={() => navigate("/director/answers")}
                    type="button"
                >
                    📝 Вопросы института
                </button>
                <button
                    className={`stage-nav__tab stage-nav__tab--director${isActive("/director/institute-awards") ? " active" : ""}`}
                    onClick={() => navigate("/director/institute-awards")}
                    type="button"
                >
                    🏆 Награды института
                </button>
            </div>
        </div>
    );
};

export default DirectorStageNav;
