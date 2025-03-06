import NavBar from "../../components/NavBar";
import BackButton from "../../components/Back";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Rating_ppsm() {
  const [userData, setUserData] = useState([]);
  const [sortedField, setSortedField] = useState('sum');
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const userInfo = async () => {
      try {
        const resp = await axios.get('https://api.pps.makalabox.com/api/rating/pps');
        const sortedData = Object.values(resp.data.pps).sort((a, b) => b.sum - a.sum);
        setUserData(sortedData);
        console.log("Fetched and sorted data:", sortedData);
      } catch (error) {
        console.log(error);
      }
    };

    userInfo();
  }, []);

  const sortData = (field) => {
    const sortedData = [...userData].sort((a, b) => b[field] - a[field]);
    setUserData(sortedData);
    setSortedField(field);
  };

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
  };

  const filteredData = userData.filter((data) =>
    data.name.toLowerCase().includes(searchInput.toLowerCase())
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
            {filteredData.map((data, i) => (
              <tr key={data.id}>
                <td>{i + 1}</td>
                <td><Link to={`/user/${data.id}`}>{data.name}</Link></td>
                <td>{data.institute}</td>
                <td>{data.awardPoints}</td>
                <td>{data.researchPoints}</td>
                <td>{data.innovativePoints}</td>
                <td>{data.socialPoints}</td>
                <td>{data.sum}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <BackButton />
      </div>
    </div>
  )
}

export default Rating_ppsm;