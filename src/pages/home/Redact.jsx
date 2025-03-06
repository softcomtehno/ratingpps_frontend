import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import NavBar from "../../components/NavBar";
import BackButton from "../../components/Back";

const Redact = () => {
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [editedLinks, setEditedLinks] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const resp = await axios.get(`https://api.pps.makalabox.com/api/user/account/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
        const data = resp.data;
        setUserData(data);
        const initialEditedLinks = {};
        data.userAwards.forEach(item => {
          initialEditedLinks[item.id] = item.link || "";
        });
        data.userResearch.forEach(item => {
          initialEditedLinks[item.id] = item.link || "";
        });
        data.userInnovative.forEach(item => {
          initialEditedLinks[item.id] = item.link || "";
        });
        data.userSocial.forEach(item => {
          initialEditedLinks[item.id] = item.link || "";
        });
        setEditedLinks(initialEditedLinks);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserData();
  }, [id]);

  const handleSaveLink = async () => {
    try {
      const bag = {};
      [...userData.userAwards, ...userData.userResearch, ...userData.userInnovative, ...userData.userSocial].forEach(item => {
        const editedLink = editedLinks[item.id] !== undefined ? editedLinks[item.id] : item.link;
        bag[item.id] = {
          id: item.id,
          link: editedLink,
          stage: item.stage
        };
      });
      await axios.put(`https://api.pps.makalabox.com/api/user/account/award/edit`, { bag }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      location.reload();

    } catch (error) {
      console.log(error);
    }
  };

  const Back = () => {
    navigate(-1);
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
              <p className="userInfo__name">ФИО: {userData.userInfo && userData.userInfo.name}</p>
              <p className="userInfo__text">{userData.userInfo && userData.userInfo.institut}</p>
              <p className="userInfo__text">{userData.userInfo && userData.userInfo.regular}</p>
            </div>
            <div className="userInfo__left">
              <p className="userInfo__text">{userData.userInfo && userData.userInfo.position}</p>
              <p className="userInfo__text">{userData.userInfo && userData.userInfo.email}</p>
            </div>
          </div>
          <div className="userAwards bline">
            <h2 className="userInfo__title">Личные достижения:</h2>
            {userData.userAwards &&
              userData.userAwards.map((item, i) => (
                <div className="userInfo-in userInfo__text-S" key={item.id} style={{ backgroundColor: i % 2 === 0 ? '#0047FF4D' : '#33FF001A' }}>
                  <p className={`userInfo-in-text ${item.status === 'freeze' ? 'crossed-out' : ''}`}>{item.name}</p>
                  <div>
                    <input
                      type="text"
                      value={editedLinks[item.id] !== undefined ? editedLinks[item.id] : item.link}
                      onChange={(e) => setEditedLinks({ ...editedLinks, [item.id]: e.target.value })}
                    />
                  </div>
                </div>
              ))}
          </div>
          <div className="userResearch bline">
            <h2 className="userInfo__title">Научно-исследовательская деятельность:</h2>
            {userData.userResearch &&
              userData.userResearch.map((item, i) => (
                <div className="userInfo-in userInfo__text-S" key={item.id} style={{ backgroundColor: i % 2 === 0 ? '#0047FF4D' : '#33FF001A' }}>
                  <p className={`userInfo-in-text ${item.status === 'freeze' ? 'crossed-out' : ''}`}>{item.name}</p>
                  <div>
                    <input
                      type="text"
                      value={editedLinks[item.id] !== undefined ? editedLinks[item.id] : item.link}
                      onChange={(e) => setEditedLinks({ ...editedLinks, [item.id]: e.target.value })}
                    />
                  </div>
                </div>
              ))}
          </div>
          <div className="userInnovative bline">
            <h2 className="userInfo__title">Инновационно-образовательная деятельность:</h2>
            {userData.userInnovative &&
              userData.userInnovative.map((item, i) => (
                <div className="userInfo-in userInfo__text-S" key={item.id} style={{ backgroundColor: i % 2 === 0 ? '#0047FF4D' : '#33FF001A' }}>
                  <p className={`userInfo-in-text ${item.status === 'freeze' ? 'crossed-out' : ''}`}>{item.name}</p>
                  <div>
                    <input
                      type="text"
                      value={editedLinks[item.id] !== undefined ? editedLinks[item.id] : item.link}
                      onChange={(e) => setEditedLinks({ ...editedLinks, [item.id]: e.target.value })}
                    />
                  </div>
                </div>
              ))}
          </div>
          <div className="userSocial bline">
            <h2 className="userInfo__title">Воспитательная, общественная деятельность:</h2>
            {userData.userSocial &&
              userData.userSocial.map((item, i) => (
                <div className="userInfo-in userInfo__text-S" key={item.id} style={{ backgroundColor: i % 2 === 0 ? '#0047FF4D' : '#33FF001A' }}>
                  <p className={`userInfo-in-text ${item.status === 'freeze' ? 'crossed-out' : ''}`}>{item.name}</p>
                  <div>
                    <input
                      type="text"
                      value={editedLinks[item.id] !== undefined ? editedLinks[item.id] : item.link}
                      onChange={(e) => setEditedLinks({ ...editedLinks, [item.id]: e.target.value })}
                    />
                  </div>
                </div>
              ))}
          </div>
          <div className="auth__btn-center jc-sb">
            <button className="bnt__log" onClick={handleSaveLink}>Сохранить</button>
            <BackButton />
          </div>
        </div>
      </div>
    </div>
  );
}
export default Redact;