import { Link } from "react-router-dom";
import NavBar from "../../../components/NavBar";

function Admin() {

  return (
    <div className="сontents">
      <div className="private-office-contents">
        <div className="header">
          <NavBar />
        </div>
        <div className="admin__links">
          <Link to='/admin_list' className="admin__link">Список препподователей</Link>
          <a
            href={`${import.meta.env.VITE_API_URL || 'https://api.pps.makalabox.com'}/admin/stage/personal_awards/`}
            className="admin__link"
            target="_blank"
            rel="noreferrer"
          >
            Redact Stage
          </a>
          <Link to='/Registration' className="admin__link">Регистрация</Link>
          <Link to='/' className="admin__link">Результаты года</Link>
          <Link to='/admin/organization' className="admin__link">Организации</Link>
        </div>
      </div>
    </div>
  );
}

export default Admin;