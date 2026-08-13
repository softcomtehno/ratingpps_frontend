import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { API_BASE_URL } from "../../../services/api";
import NavBar from "../../../components/NavBar";
import useAuthToken from "../../../hooks/useAuthToken";
import useUserRole from "../../../hooks/useUserRole";
import "../../../css/Rating.css";

export default function AdminOrganization() {
  const [organizations, setOrganizations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentOrg, setCurrentOrg] = useState(null); // null means "create mode", object means "edit mode"
  const [formData, setFormData] = useState({ name: "", photoFile: null });
  const navigate = useNavigate();

  const token = useAuthToken();
  const { organization, isSuperAdmin } = useUserRole(token);

  // /api/organizations is not filtered by organization — the organization is
  // the tenant, not something owned by one — so an admin bound to a single
  // organization is narrowed down here. Creating and deleting are super admin
  // only, and the backend refuses them either way.
  const fetchOrganizations = useCallback(() => {
    api.get("/api/organizations")
      .then(res => {
        const all = res.data ?? [];
        setOrganizations(
          isSuperAdmin || !organization
            ? all
            : all.filter(org => org.id === organization.id)
        );
      })
      .catch(err => console.error(err));
  }, [organization, isSuperAdmin]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const goToInstitutes = (orgId) => {
    navigate(`/admin/organization/${orgId}/institutes`);
  };

  const handleOpenModal = (org = null) => {
    setCurrentOrg(org);
    if (org) {
      setFormData({ name: org.name, photoFile: null });
    } else {
      setFormData({ name: "", photoFile: null });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentOrg(null);
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photoFile: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    if (formData.photoFile) {
      data.append("photoFile", formData.photoFile);
    }

    try {
      if (currentOrg) {
        // Edit mode
        await api.post(`/api/admin/organizations/${currentOrg.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        // Create mode
        await api.post("/api/admin/organizations", data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      handleCloseModal();
      fetchOrganizations();
    } catch (err) {
      console.error(err);
      alert("Ошибка при сохранении организации.");
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // prevent clicking the card
    if (!window.confirm("Вы уверены, что хотите удалить эту организацию? Все связанные данные могут быть удалены!")) return;
    try {
      await api.delete(`/api/admin/organizations/${id}`);
      fetchOrganizations();
    } catch (err) {
      console.error(err);
      alert(`Ошибка при удалении организации: ${err.response?.data?.message || err.message}`);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    return `${API_BASE_URL}${url}`;
  };

  return (
    <>
      <NavBar />
      <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '20px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 className="Edu__text-L" style={{ margin: 0 }}>Управление организациями</h2>
          {isSuperAdmin && (
            <button className="bnt__log" onClick={() => handleOpenModal()} style={{ background: '#22c55e', whiteSpace: 'nowrap' }}>
              + Добавить
            </button>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {organizations.map(org => {
            const bgImage = getImageUrl(org.photoUrl);
            return (
              <div
                key={org.id}
                className="org-card"
                onClick={() => goToInstitutes(org.id)}
                style={{
                  position: 'relative',
                  backgroundImage: bgImage ? `url(${bgImage})` : 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  height: '200px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'flex-end',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1))'
                }}></div>
                <div style={{ position: 'relative', zIndex: 1, padding: '15px', color: '#fff', width: '100%' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{org.name}</h3>
                </div>
                <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 2, display: 'flex', gap: '8px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenModal(org); }}
                    style={{ background: '#3b82f6', border: 'none', borderRadius: '4px', color: '#fff', padding: '5px 10px', cursor: 'pointer' }}
                  >✏️</button>
                  {isSuperAdmin && (
                    <button
                      onClick={(e) => handleDelete(e, org.id)}
                      style={{ background: '#ef4444', border: 'none', borderRadius: '4px', color: '#fff', padding: '5px 10px', cursor: 'pointer' }}
                    >🗑️</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {showModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              background: '#fff', padding: '30px', borderRadius: '8px',
              width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ marginTop: 0 }}>{currentOrg ? 'Редактировать организацию' : 'Новая организация'}</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label htmlFor="org-name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Название</label>
                  <input
                    id="org-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label htmlFor="org-photo" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Фотография</label>
                  <input
                    id="org-photo"
                    name="photoFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  {formData.photoFile && (
                    <p style={{ marginTop: '5px', color: '#16A767', fontSize: '14px' }}>
                      Выбран файл: {formData.photoFile.name}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={handleCloseModal} style={{ padding: '10px 15px', border: 'none', borderRadius: '4px', background: '#ccc', cursor: 'pointer' }}>Отмена</button>
                  <button type="submit" style={{ padding: '10px 15px', border: 'none', borderRadius: '4px', background: '#3b82f6', color: '#fff', cursor: 'pointer' }}>Сохранить</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
}