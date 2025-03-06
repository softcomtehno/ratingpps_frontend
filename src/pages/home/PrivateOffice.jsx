import { useCallback, useState, useEffect } from "react";
import NavBar from "../../components/NavBar";
import RegNav from "../../components/RegNav";
import AccountConf from "../../components/AccountConf";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function PrivateOffice() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [userData, setUserData] = useState(null);
  const [institutes, setInstitutes] = useState([]);
  const [positions, setPositions] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [filteredInstitutes, setFilteredInstitutes] = useState([]);
  const [selectedValues, setSelectedValues] = useState({
    name: '',
    institute: '',
    post: '',
    otherPost: '',
    stat: '',
    email: ''
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await axios.get('https://api.pps.makalabox.com/api/user/name', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const user = response.data.user;
        setUserData(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
      }
    };

    const fetchData = async () => {
      try {
        const infoResponse = await axios.get('https://api.pps.makalabox.com/api/user/info', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setInstitutes(infoResponse.data.institutes);
        setUniversities(infoResponse.data.university);
        setPositions(infoResponse.data.position);
      } catch (error) {
        console.error(error);
        setIsAuthenticated(false);
      }
    };


    getUserData();
    fetchData();
  }, [token]);

  useEffect(() => {
    if (selectedValues.university) {
      const filtered = institutes.filter(inst => inst.university === universities[selectedValues.university]);
      setFilteredInstitutes(filtered);
    } else {
      setFilteredInstitutes([]);
    }
  }, [selectedValues.university, institutes, universities]);

  const handleSelect = useCallback((field, value) => {
    setSelectedValues(prevValues => ({
      ...prevValues,
      [field]: value
    }));
  }, []);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const { name, institute, post, otherPost, stat, email } = selectedValues;
    const position = post === 'Другое' ? otherPost : post;
    const dataToSend = {
      name,
      institut: filteredInstitutes.find(i => i.id === parseInt(institute))?.name || "",
      position,
      regular: stat,
      email,
    };

    axios.post('https://api.pps.makalabox.com/api/user/info/add', dataToSend, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(function (response) {
        console.log(response);
        setIsAuthenticated(true);
        window.location.reload();
      })
      .catch(function (error) {
        console.error(error);
      });
  }, [selectedValues, filteredInstitutes, token]);

  const handleEdit = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  return (
    <div className="private-office-contents">
      <div className="header">
        <NavBar />
      </div>
      <div className="private-office__main">
        <AccountConf />
        <div className="office">
          <RegNav />
          <h3 className="Edu__text-M Edu__text-M-office">Личные данные</h3>
          <div className="office__in">
            {isAuthenticated && userData ? (
              <div className="form">
                <p className="input__text-s bold">ФИО</p>
                <div className="input__office Montherat">
                  <p className="input__text-s">{userData.name}</p>
                </div>
                <p className="input__text-s bold">Институт</p>
                <div className="input__office Montherat">
                  <p className="input__text-s">{userData.institut}</p>
                </div>
                <p className="input__text-s bold">Должность</p>
                <div className="input__office Montherat">
                  <p className="input__text-s">{userData.position}</p>
                </div>
                <p className="input__text-s bold">Штат/Совм.</p>
                <div className="input__office Montherat">
                  <p className="input__text-s">{userData.regular}</p>
                </div>
                <p className="input__text-s bold">Email</p>
                <div className="input__office Montherat">
                  <p className="input__text-s">{userData.email}</p>
                </div>
                <button onClick={handleBack} className="btn__link btn__blue montherat">Назад</button>
                <button onClick={handleEdit} className="btn__link btn__green montherat">Редактировать</button>
              </div>
            ) : (
              <>
                <div className="form">
                  <p className="input__text-s bold">ФИО</p>
                  <input type="text" value={selectedValues.name} onChange={(e) => handleSelect('name', e.target.value)} className="input__office Montherat" />
                  <p className="input__text-s bold">Учреждение</p>
                  <select value={selectedValues.university} onChange={(e) => handleSelect('university', e.target.value)} className="input__office Montherat">
                    <option value=""></option>
                    {universities.map((uniItem, index) => (
                      <option key={index} value={index}>
                        {uniItem}
                      </option>
                    ))}
                  </select>
                  {filteredInstitutes.length > 0 && (
                    <>
                      <p className="input__text-s bold">Отделение</p>
                      <select value={selectedValues.institute} onChange={(e) => handleSelect('institute', e.target.value)} className="input__office Montherat">
                        <option value=""></option>
                        {filteredInstitutes.map((inst, index) => (
                          <option key={index} value={inst.id}>
                            {inst.name}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                  <p className="input__text-s bold">Должность</p>
                  <select value={selectedValues.post} onChange={(e) => handleSelect('post', e.target.value)} className="input__office Montherat">
                    <option value=""></option>
                    {positions.map((postItem, index) => (
                      <option key={index} value={postItem}>
                        {postItem}
                      </option>
                    ))}
                    <option value="Другое">Другое</option>
                  </select>
                  {selectedValues.post === 'Другое' && (
                    <div>
                      <p className="input__text-s bold">Укажите должность</p>
                      <input type="text" value={selectedValues.otherPost} onChange={(e) => handleSelect('otherPost', e.target.value)} className="input__office Montherat" />
                    </div>
                  )}
                </div>
                <div className="form">
                  <p className="input__text-s bold">Штатный/Совместитель</p>
                  <select value={selectedValues.stat} onChange={(e) => handleSelect('stat', e.target.value)} className="input__office Montherat">
                    <option value=""></option>
                    <option value="Штатный">Штатный</option>
                    <option value="Совместитель">Совместитель</option>
                  </select>
                  <p className="input__text-s bold">Email</p>
                  <input type="text" value={selectedValues.email} onChange={(e) => handleSelect('email', e.target.value)} className="input__office Montherat" />
                  <button onClick={handleSubmit} className="btn__link btn__blue montherat">Сохранить</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivateOffice;