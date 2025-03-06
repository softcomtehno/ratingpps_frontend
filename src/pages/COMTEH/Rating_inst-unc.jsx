import NavBar from "../../components/NavBar"
import BackButton from "../../components/Back"
import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Rating_inst_unc() {
  const [inst, setInst] = useState([]);
  const [sortedField, setSortedField] = useState('sum');
  const [filteredInst, setFilteredInst] = useState([]);

  useEffect(() => {
    const getInst = async () => {
      try {
        const response = await axios.get('https://api.pps.makalabox.com/api/rating/comtehno/departments');
        const data = response.data.institutions;
        setInst(data);
        setFilteredInst(data);
      } catch (error) {
        console.log(error);
      }
    };

    getInst();
  }, []);

  useEffect(() => {
    sortData(sortedField);
  }, [sortedField]);

  const sortData = (field) => {
    const sortedData = [...filteredInst].sort((a, b) => b[field] - a[field]);
    setFilteredInst(sortedData);
    setSortedField(field);
  };

  return (
    <div className="сontents">
      <div className="header">
        <NavBar />
      </div>
      <div className="main">
        <div className="title__table-un">
          <h2 className="Edu__text-L">Рейтинг ППС</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th className="un_l">Отделения КОМТЕХНО</th>
              <th className="sorter un_l" onClick={() => sortData('middlePoints')}>Средний балл ППС</th>
            </tr>
          </thead>
          <tbody>
            {filteredInst.map((institution, i) => (
              <tr key={i}>
                <td><Link to={`/department/${institution.id}`}>{institution.name}</Link></td>
                <td>{institution.middlePoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <BackButton />
      </div>
    </div>
  )
}

export default Rating_inst_unc;