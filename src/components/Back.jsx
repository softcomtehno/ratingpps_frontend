import { useNavigate } from 'react-router-dom';
import "../css/Educational.css"
function BackButton() {
  const navigate = useNavigate();

  const Back = () => {
    navigate(-1);
  };

  return (
    <div className="btn__Back"><button onClick={Back} className="Back__link" >Назад</button></div>
  )
}

export default BackButton;