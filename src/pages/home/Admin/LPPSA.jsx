import { useCallback, useEffect, useState } from "react";
import NavBar from "../../../components/NavBar";
import axios from "axios";
import { Link } from "react-router-dom";

function Lppsa() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get("https://api.pps.makalabox.com/api/rating/users");
      const data = response.data.users;
      setUsers(data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchData()
  }, [fetchData]);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="private-office-contents сontents">
      <div className="header">
        <NavBar />
      </div>
      <div className="admin-panel__main">
        <label htmlFor="" className="search__label-admin">
          <input
            type="text"
            className="search__input Montherat"
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
          <div className="search__btn">
            <div className="search__btn-in"></div>
          </div>
        </label>
        <div className="users">
          {filteredUsers.map((user, i) => (
            <div
              key={user.id}
              className="user"
              style={{
                backgroundColor: i % 2 === 0 ? "#0047FF4D" : "#33FF001A",
              }}
            >
              <Link to={`/user/admin/${user.id}`}>{user.name}</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Lppsa;