import axios from "axios";
import NavBar from "../../components/NavBar";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Department() {
  const [users, setUsers] = useState([]);
  const [sortedField, setSortedField] = useState('sum');
  const [searchInput, setSearchInput] = useState("");
  const { id } = useParams();

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await axios.get(`https://api.pps.makalabox.com/api/rating/institute/${id}`);
        const data = response.data;
        const usersObject = data[0];
        const usersArray = Object.values(usersObject).sort((a, b) => b.sum - a.sum);
        setUsers(usersArray);
        console.log(usersArray);
      } catch (error) {
        console.log(error);
      }
    };

    getUsers();
  }, [id]);

  const sortData = (field) => {
    const sortedData = [...users].sort((a, b) => b[field] - a[field]);
    setUsers(sortedData);
    setSortedField(field);
  };

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
  };

  const filteredData = users.filter((user) =>
    user.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div className="сontents">
      <div className="header">
        <NavBar />
      </div>
      <div className="main">
        <div className="title__table-un">
          <h2 className="Edu__text-L">Рейтинг ППС</h2>
          <label htmlFor="" className="search__label">
            <input 
              type="text" 
              className="search__input-rating" 
              value={searchInput} 
              onChange={handleSearch} 
              placeholder="Поиск по ФИО"
            />
            <div className="search__btn-rating">
              <div className="search__btn-in"></div>
            </div>
          </label>
        </div>
        <div className="sort-buttons">
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>№</th>
              <th>ФИО</th>
              <th>Институты</th>
              <th className="sorter" onClick={() => sortData('awardPoints')}>I. Личные достижения</th>
              <th className="sorter" onClick={() => sortData('researchPoints')}>II. Научно-исследовательская деятельность</th>
              <th className="sorter" onClick={() => sortData('innovativePoints')}>III. Инновационно-образовательная деятельность</th>
              <th className="sorter" onClick={() => sortData('socialPoints')}>IV. Воспитательная, общественная деятельность</th>
              <th className="sorter" onClick={() => sortData('sum')}>Итого</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((user, i) => (
              <tr key={user.id}>
                <td>{i + 1}</td>
                <td>{user.name}</td>
                <td>{user.institute}</td>
                <td>{user.awardPoints}</td>
                <td>{user.researchPoints}</td>
                <td>{user.innovativePoints}</td>
                <td>{user.socialPoints}</td>
                <td>{user.sum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Department;