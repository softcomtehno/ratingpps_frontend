import NavBar from "../../components/NavBar";
import BackButton from "../../components/Back";
import YearSelector from "../../components/YearSelector";
import { useYears } from "../../hooks/useYears";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function Rating_ppsc() {
  const [userData, setUserData] = useState([]);
  const [sortedField, setSortedField] = useState('sum');
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  const { years, selectedYear, setSelectedYear, loading: yearsLoading } = useYears();

  useEffect(() => {
    if (yearsLoading) return;
    setLoading(true);
    const params = selectedYear ? { yearId: selectedYear.id } : {};
    api.get('/api/rating/comtehno/pps', { params })
      .then(resp => {
        const sortedData = Object.values(resp.data.pps).sort((a, b) => b.sum - a.sum);
        setUserData(sortedData);
      })
      .catch(error => console.log(error))
      .finally(() => setLoading(false));
  }, [selectedYear, yearsLoading]);

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

        <YearSelector
          years={years}
          selectedYear={selectedYear}
          onChange={setSelectedYear}
          loading={yearsLoading}
        />

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Загрузка...</div>
        ) : (
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
                <th className="sorter" onClick={() => sortData('expertPoints')}>Баллы экспертов</th>
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
                  <td>{data.expertPoints ?? 0}</td>
                  <td>{data.sum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <BackButton />
      </div>
    </div>
  )
}

export default Rating_ppsc
