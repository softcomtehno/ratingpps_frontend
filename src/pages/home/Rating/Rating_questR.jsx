import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import NavBar from '../../../components/NavBar';

const Rating = () => {
  const token = localStorage.getItem('token');
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([])
  const [selectedAward, setSelectedAward] = useState(1);
  const [selectedSubtitle, setSelectedSubtitle] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://api.pps.makalabox.com/api/rating/question/get/research', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setData(response.data.research);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get(`https://api.pps.makalabox.com/api/rating/question/2/${selectedAward}/${selectedSubtitle}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    fetchUsers();
  }, [selectedAward, selectedSubtitle, token]);

  const handleAwardChange = (event) => {
    const selectedId = parseInt(event.target.value);
    setSelectedAward(selectedId);
    setSelectedSubtitle(1);
  };

  const handleSubtitleChange = (event) => {
    const selectedId = parseInt(event.target.value);
    setSelectedSubtitle(selectedId);
  };

  return (
    <div className="сontents">
      <div className="header">
        <div className="header">
          <NavBar />
        </div>
      </div>
      <div className="header__menu-s">
        <Link to="/rating/awards" className="head__item Montherat">Личные достижения</Link>
        <Link to="/rating/research" className="head__item Montherat">Научно-исследовательская деятельность</Link>
        <Link to="/rating/education" className="head__item Montherat">Инновационно-образовательная деятельность</Link>
        <Link to="/rating/social" className="head__item Montherat">Воспитательная, общественная деятельность</Link>
      </div>
      <div className="main">
        <select name="award" value={selectedAward} onChange={handleAwardChange}>
          {data.map((award) => (
            <option key={award.id} value={award.id}>
              {award.name}
            </option>
          ))}
        </select>

        <select name="subtitle" value={selectedSubtitle} onChange={handleSubtitleChange}>
          {selectedAward &&
            data.find((award) => award.id === selectedAward)?.subtitle.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
        </select>
        <div className="title__table-un">
          <table className="table">
            <thead>
              <tr>
                <th>№</th>
                <th>ФИО</th>
                <th>Институты</th>
                <th>Научно-исследовательская деятельность</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user.id}>
                  <td>{i + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.institute}</td>
                  <td>{user.point}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Rating;