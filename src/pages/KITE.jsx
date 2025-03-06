import BackButton from "../components/Back"
import NavBar from "../components/NavBar"
import { Link } from "react-router-dom"

function Kite() {
  return (
    <div className="сontents">
      <div className="header">
        <NavBar />
      </div>
      <div className="main">
        <div className="Edu__logo-name">
          <div className="Kite__logo"></div>
          <div className="Edu__text-M Kite__name">Колледж инновационных технологий и экономики</div>
        </div>
        <div className="table__links Edu__text-S">
          <ul>
            <li><Link className="Link" to="/KITE/rating_pps">РЕЙТИНГ ППС</Link></li>
            <li><Link className="Link" to="/KITE/rating_inst">РЕЙТИНГ ОТДЕЛЕНИЙ</Link></li>
            <li><Link className="Link" to="/rating/awards">РЕЙТИНГ ПО НАГРАДАМ</Link></li>
          </ul>
        </div>
        <BackButton />
      </div>
    </div>
  )
}

export default Kite