import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import NavBar from "../../../components/NavBar";

function UserInfoA() {
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const [userData, setUserData] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`https://api.pps.makalabox.com/api/user/account/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        setUserData(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserData();
  }, [id, token]);

  const toggleItemSelection = (itemId, stage) => {
    const itemKey = `${itemId}-${stage}`;
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(itemKey)
        ? prevSelectedItems.filter((item) => item !== itemKey)
        : [...prevSelectedItems, itemKey]
    );
  };

  const handleActionSelected = async (action) => {
    try {
      for (let i = 0; i < selectedItems.length; i++) {
        const [itemId, stage] = selectedItems[i].split('-');
        const requestData = { idBag: [{ id: itemId }] };
        const url = `https://api.pps.makalabox.com/api/admin/${stage}/${action}`;
        const method = action === 'delete' ? 'delete' : 'put';
        await axios({
          method,
          url,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: requestData,
        });
      }
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="сontents">
      <div className="private-office-contents">
        <div className="header">
          <NavBar />
        </div>
        <div className="userData">
          <div className="userInfo">
            <div className="userInfo__right">
              <p className="userInfo__name">ФИО: {userData.userInfo?.name}</p>
              <p className="userInfo__text">{userData.userInfo?.institut}</p>
              <p className="userInfo__text">{userData.userInfo?.regular}</p>
            </div>
            <div className="userInfo__left">
              <p className="userInfo__text">{userData.userInfo?.position}</p>
              <p className="userInfo__text">{userData.userInfo?.email}</p>
            </div>
          </div>
          {userData.userAwards?.length > 0 && (
            <div className="userAwards bline">
              <h2 className="userInfo__title">Личные достижения:</h2>
              {userData.userAwards.map((award, i) => (
                <div
                  className="userInfo-in userInfo__text-S"
                  key={award.id}
                  style={{ backgroundColor: i % 2 === 0 ? '#0047FF4D' : '#33FF001A' }}
                >
                  <p className={`userInfo-in-text ${award.status === 'freeze' ? 'crossed-out' : ''}`}>{award.name}</p>
                  <div>
                    <Link target="_blank" to={award.link}>Link</Link>
                    <input
                      className="check"
                      type="checkbox"
                      checked={selectedItems.includes(`${award.id}-${award.stage}`)}
                      onChange={() => toggleItemSelection(award.id, award.stage)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {userData.userResearch?.length > 0 && (
            <div className="userResearch bline">
              <h2 className="userInfo__title">Научно-исследовательская деятельность:</h2>
              {userData.userResearch.map((research, i) => (
                <div
                  className="userInfo-in userInfo__text-S"
                  key={research.id}
                  style={{ backgroundColor: i % 2 === 0 ? '#0047FF4D' : '#33FF001A' }}
                >
                  <p className={`userInfo-in-text ${research.status === 'freeze' ? 'crossed-out' : ''}`}>{research.name}</p>
                  <div>
                    <Link target="_blank" to={research.link}>Link</Link>
                    <input
                      className="check"
                      type="checkbox"
                      checked={selectedItems.includes(`${research.id}-${research.stage}`)}
                      onChange={() => toggleItemSelection(research.id, research.stage)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {userData.userInnovative?.length > 0 && (
            <div className="userInnovative bline">
              <h2 className="userInfo__title">Инновационно-образовательная деятельность:</h2>
              {userData.userInnovative.map((innovative, i) => (
                <div
                  className="userInfo-in userInfo__text-S"
                  key={innovative.id}
                  style={{ backgroundColor: i % 2 === 0 ? '#0047FF4D' : '#33FF001A' }}
                >
                  <p className={`userInfo-in-text ${innovative.status === 'freeze' ? 'crossed-out' : ''}`}>{innovative.name}</p>
                  <div>
                    <Link target="_blank" to={innovative.link}>Link</Link>
                    <input
                      className="check"
                      type="checkbox"
                      checked={selectedItems.includes(`${innovative.id}-${innovative.stage}`)}
                      onChange={() => toggleItemSelection(innovative.id, innovative.stage)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {userData.userSocial?.length > 0 && (
            <div className="userSocial bline">
              <h2 className="userInfo__title">Воспитательная, общественная деятельность:</h2>
              {userData.userSocial.map((social, i) => (
                <div
                  className="userInfo-in userInfo__text-S"
                  key={social.id}
                  style={{ backgroundColor: i % 2 === 0 ? '#0047FF4D' : '#33FF001A' }}
                >
                  <p className={`userInfo-in-text ${social.status === 'freeze' ? 'crossed-out' : ''}`}>{social.name}</p>
                  <div>
                    <Link target="_blank" to={social.link}>Link</Link>
                    <input
                      className="check"
                      type="checkbox"
                      checked={selectedItems.includes(`${social.id}-${social.stage}`)}
                      onChange={() => toggleItemSelection(social.id, social.stage)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="auth__btn-center jc-sb">
            <button className="bnt__log" onClick={() => handleActionSelected('freeze')}>Заморозить</button>
            <button className="bnt__log" onClick={() => handleActionSelected('active')}>Разморозить</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserInfoA;