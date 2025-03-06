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
          <Link to='https://api.pps.makalabox.com/admin/stage/personal_awards/' className="admin__link">Redact Stage</Link>
          <Link to='/Registration' className="admin__link">Регистрация</Link>
          <Link to='/' className="admin__link">Результаты года</Link>
        </div>
      </div>
    </div>
  );
}

export default Admin;