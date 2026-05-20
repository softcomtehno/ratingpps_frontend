import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import NavBar from "../../../components/NavBar";
import "../../../css/Rating.css";

export default function AdminOrgInstitutesPage() {
    const { id } = useParams(); // organization id
    const navigate = useNavigate();
    const [organization, setOrganization] = useState(null);
    const [institutes, setInstitutes] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [currentInstitute, setCurrentInstitute] = useState(null);
    const [formData, setFormData] = useState({ name: "", reduction: "", teacherTotal: "" });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const orgRes = await api.get(`/api/organizations/${id}`);
            setOrganization(orgRes.data);

            const instRes = await api.get(`/api/rating/organization/${id}/institutes`);
            setInstitutes(instRes.data.institutes || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleOpenModal = (inst = null) => {
        setCurrentInstitute(inst);
        if (inst) {
            setFormData({
                name: inst.name || "",
                reduction: inst.reduction || "",
                teacherTotal: inst.teacherTotal || ""
            });
        } else {
            setFormData({ name: "", reduction: "", teacherTotal: "" });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentInstitute(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            name: formData.name,
            reduction: formData.reduction || null,
            teacherTotal: formData.teacherTotal ? parseInt(formData.teacherTotal) : null
        };

        try {
            if (currentInstitute) {
                // Edit
                await api.put(`/api/admin/institutes/${currentInstitute.id}`, payload);
            } else {
                // Create
                payload.organization_id = id;
                await api.post(`/api/admin/institutes`, payload);
            }
            handleCloseModal();
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Ошибка при сохранении института.");
        }
    };

    const handleDelete = async (instId) => {
        if (!window.confirm("Удалить этот институт со всеми его данными?")) return;
        try {
            await api.delete(`/api/admin/institutes/${instId}`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Ошибка при удалении института.");
        }
    };

    return (
        <>
            <NavBar />
            <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '20px', boxSizing: 'border-box' }}>

                <div style={{ marginBottom: '20px' }}>
                    <button
                        onClick={() => navigate('/admin/organization')}
                        style={{ padding: '8px 15px', background: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        ← Назад к организациям
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                    <h2 className="Edu__text-L" style={{ margin: 0, overflowWrap: 'anywhere' }}>Институты организации: {organization?.name || "Загрузка..."}</h2>
                    <button className="bnt__log" onClick={() => handleOpenModal()} style={{ background: '#22c55e', whiteSpace: 'nowrap' }}>
                        + Добавить институт
                    </button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <thead>
                        <tr style={{ background: '#3b82f6', color: '#fff' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Название</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Сокращение</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Кол-во ППС</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {institutes.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Институтов пока нет</td></tr>
                        ) : (
                            institutes.map(inst => (
                                <tr key={inst.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '12px', color: '#1e293b', fontWeight: '500' }}>{inst.name}</td>
                                    <td style={{ padding: '12px', color: '#64748b' }}>{inst.reduction || "—"}</td>
                                    <td style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>{inst.teacherTotal ?? "—"}</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleOpenModal(inst)}
                                            style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', marginRight: '10px' }}
                                            title="Редактировать"
                                        >✏️</button>
                                        <button
                                            onClick={() => handleDelete(inst.id)}
                                            style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer' }}
                                            title="Удалить"
                                        >🗑️</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

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
                            <h3 style={{ marginTop: 0, color: '#1e293b' }}>{currentInstitute ? 'Редактировать институт' : 'Новый институт'}</h3>
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label htmlFor="inst-name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#1e293b' }}>Название института</label>
                                    <input
                                        id="inst-name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label htmlFor="inst-reduction" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#1e293b' }}>Сокращение (необязательно)</label>
                                    <input
                                        id="inst-reduction"
                                        name="reduction"
                                        type="text"
                                        value={formData.reduction}
                                        onChange={e => setFormData({ ...formData, reduction: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label htmlFor="inst-teacher-total" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#1e293b' }}>Количество ППС (опционально)</label>
                                    <input
                                        id="inst-teacher-total"
                                        name="teacherTotal"
                                        type="number"
                                        value={formData.teacherTotal}
                                        onChange={e => setFormData({ ...formData, teacherTotal: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
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
