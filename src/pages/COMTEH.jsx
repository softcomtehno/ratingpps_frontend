import BackButton from "../components/Back"
import NavBar from "../components/NavBar"
import { Link } from "react-router-dom"

function Comteh() {
  return (
    <div className="сontents">
      <div className="header">
        <NavBar />
      </div>
      <div className="main">
        <div className="Edu__logo-name">
          <div className="Komteh__logo"></div>
          <div className="Edu__text-M Komteh__name">Бишкекский колледж компьютерных систем и технологий</div>
        </div>
        <div className="table__links Edu__text-S">
          <ul>
            <li><Link className="Link" to="/COMTEH/rating_pps">РЕЙТИНГ ППС</Link></li>
            <li><Link className="Link" to="/COMTEH/rating_inst">РЕЙТИНГ ОТДЕЛЕНИЙ</Link></li>
            <li><Link className="Link" to="/rating/awards">РЕЙТИНГ ПО НАГРАДАМ</Link></li>
          </ul>
        </div>
        <BackButton />
      </div>
    </div>
  )
}

export default Comteh