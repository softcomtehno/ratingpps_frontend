import NavBar from "../components/NavBar"
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"

function PageNotFound() {
  const navigate = useNavigate();

  const Back = () => {
    navigate(-1);
  };

  return (
    <div className="сontents">
      <div className="header">
        <NavBar/>
      </div>
      <div className="main">
        <h2 className="PNF__text"><Link onClick={Back} className="PNF__link">Страница не найдена!</Link></h2>
      </div>
    </div>
  )
}

export default PageNotFound