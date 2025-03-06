import NavBar from "../components/NavBar"
import { Link } from "react-router-dom"

function Home() {
  return (
    <div className="сontents">
      <div className="header">
        <NavBar/>
      </div>
      <div className="main">
        <div className="home__cards">
          <div className="home__card">
            <Link to="/COMTEH"><div className="card__img"></div></Link>
            <p className="card__text">Бишкекский колледж компьютерных систем и технологий</p>
          </div>
          <div className="home__card">
            <Link to="/MUIT"><div className="card__img"></div></Link>
            <p className="card__text">Международный университет инновационных технологий</p>
          </div>
          <div className="home__card">
            <Link to="/KITE"><div className="card__img"></div></Link>
            <p className="card__text">Колледж инновационных технологий и экономики</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home