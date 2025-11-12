import { Link } from 'react-router-dom';

const RegNav = () => {
  return (
    <>
      <div className="header__menu-s">
        <Link to="/private_office" className="head__item_1 Montherat">Личные данные</Link>
        <Link to="/Progress" className="head__item Montherat">Личные достижения</Link>
        <Link to="/Ural" className="head__item Montherat">Научно-исследовательская деятельность</Link>
        <Link to="/Education" className="head__item Montherat">Инновационно-образовательная деятельность</Link>
        <Link to="/Social" className="head__item Montherat">Воспитательная, общественная деятельность</Link>
      </div>
    </>
  );
}

export default RegNav;