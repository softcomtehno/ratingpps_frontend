import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../../services/api";
import NavBar from "../../../components/NavBar";


export default function AdminOrganization() {
  const [organizations, setOrganizations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/organizations")
      .then(res => setOrganizations(res.data))
      .catch(err => console.error(err));
  }, []);

  const goToInstitutes = (orgId) => {
    navigate(`/organizations/${orgId}/institutes`);
  };

  return (
    <>
    <NavBar /> 
    <div className="auth__contain">
        
      <h2 className="Edu__text-L center">Выберите организацию</h2>

      <div className="org-list">
        {organizations.map(org => (
          <button
            key={org.id}
            onClick={() => goToInstitutes(org.id)}
            className="bnt__log Edu__text-S"
            style={{ margin: '.5rem 0', width: '100%' }}
          >
            {org.name}
          </button>
        ))}
      </div>
    </div>
    </>
  );
}