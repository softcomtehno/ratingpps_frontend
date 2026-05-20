import { Link } from "react-router-dom";
import NavBar from "../../../components/NavBar";

function Admin() {

  return (
    <div className="сontents">
      <div className="private-office-contents">
        <div className="header">
          <NavBar />
        </div>
        <div className="admin__panel">
          <h1 className="admin__title">Панель администратора</h1>
          <div className="admin__links">
            <Link to='/admin/years' className="admin__link">🗓️ Управление годами</Link>
            <Link to='/admin/organization' className="admin__link">🏛️ Организации и институты</Link>
            <Link to='/admin/directors' className="admin__link">👨‍💼 Директора институтов</Link>
            <Link to='/admin/positions' className="admin__link">👔 Должности</Link>
            <Link to='/admin/teacher-questions' className="admin__link">📚 Вопросы преподавателей</Link>
            <Link to='/admin/institute-questions' className="admin__link">🏫 Вопросы институтов</Link>
            <Link to='/admin/awards' className="admin__link">🏅 Награды преподавателей</Link>
            <Link to='/admin/institute-awards' className="admin__link">🎯 Награды институтов</Link>
            <Link to='/admin/experts' className="admin__link">⭐ Эксперты</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
