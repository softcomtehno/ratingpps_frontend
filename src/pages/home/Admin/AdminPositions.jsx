import { useCallback, useEffect, useMemo, useState } from "react";
import NavBar from "../../../components/NavBar";
import useAuthToken from "../../../hooks/useAuthToken";
import api from "../../../services/api";
import "../../../css/AdminDirectors.css";

export default function AdminPositions() {
  const token = useAuthToken();
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [reduction, setReduction] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editReduction, setEditReduction] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const loadPositions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/admin/positions", { headers });
      setPositions(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.response?.data?.error || "Ошибка загрузки должностей");
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    loadPositions();
  }, [loadPositions]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      await api.post(
        "/api/admin/positions",
        { name: name.trim(), reduction: reduction.trim() || null },
        { headers }
      );
      setName("");
      setReduction("");
      await loadPositions();
    } catch (e) {
      setError(e.response?.data?.error || "Ошибка при добавлении");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (position) => {
    setEditingId(position.id);
    setEditName(position.name ?? "");
    setEditReduction(position.reduction ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditReduction("");
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    setEditSaving(true);
    setError("");
    try {
      await api.put(
        `/api/admin/positions/${editingId}`,
        { name: editName.trim(), reduction: editReduction.trim() || null },
        { headers }
      );
      cancelEdit();
      await loadPositions();
    } catch (e) {
      setError(e.response?.data?.error || "Ошибка при сохранении");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="ad-root">
      <div className="header"><NavBar /></div>
      <div className="ad-container">
        <div className="ad-header">
          <div className="ad-header__left">
            <h1 className="ad-title">Управление должностями</h1>
            <p className="ad-subtitle">Добавление и редактирование позиций преподавателей</p>
          </div>
        </div>

        <div className="ad-card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 12, color: "#1e293b" }}>Добавить должность</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 220px auto", gap: 10 }}>
            <input
              className="ad-select"
              placeholder="Название должности"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="ad-select"
              placeholder="Сокращение (необязательно)"
              value={reduction}
              onChange={(e) => setReduction(e.target.value)}
            />
            <button className="ad-btn ad-btn--confirm" onClick={handleCreate} disabled={saving}>
              {saving ? "..." : "Добавить"}
            </button>
          </div>
        </div>

        {error && <div className="ad-alert ad-alert--error">{error}</div>}

        {loading ? (
          <div className="ad-empty"><p>Загрузка...</p></div>
        ) : positions.length === 0 ? (
          <div className="ad-empty"><p>Список должностей пуст</p></div>
        ) : (
          <div className="ad-card" style={{ padding: 20 }}>
            <div className="ad-directors-list">
              {positions.map((position) => (
                <div key={position.id} className="ad-director-row">
                  {editingId === position.id ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 220px auto auto", gap: 10, width: "100%" }}>
                      <input className="ad-select" value={editName} onChange={(e) => setEditName(e.target.value)} />
                      <input className="ad-select" value={editReduction} onChange={(e) => setEditReduction(e.target.value)} />
                      <button className="ad-btn ad-btn--confirm" onClick={saveEdit} disabled={editSaving}>{editSaving ? "..." : "Сохранить"}</button>
                      <button className="ad-btn ad-btn--cancel" onClick={cancelEdit} disabled={editSaving}>Отмена</button>
                    </div>
                  ) : (
                    <>
                      <div className="ad-director-row__info">
                        <span className="ad-director-row__avatar">{(position.name || "?")[0]}</span>
                        <div>
                          <p className="ad-director-row__name">{position.name}</p>
                          <p className="ad-director-row__email">{position.reduction || "Без сокращения"}</p>
                        </div>
                      </div>
                      <button className="ad-btn ad-btn--main" onClick={() => startEdit(position)}>Редактировать</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
