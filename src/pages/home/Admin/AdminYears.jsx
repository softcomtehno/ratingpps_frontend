import { useEffect, useState } from "react";
import NavBar from "../../../components/NavBar";
import api from "../../../services/api";
import "../../../css/Admin.css";

function AdminYears() {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newYearName, setNewYearName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const fetchYears = async () => {
    try {
      const resp = await api.get("/api/admin/years");
      setYears(resp.data);
    } catch (e) {
      setError("Ошибка загрузки годов");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleCreate = async () => {
    if (!newYearName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await api.post("/api/admin/years", { name: newYearName.trim() });
      setNewYearName("");
      showSuccess(`Год "${newYearName.trim()}" создан и установлен как текущий`);
      fetchYears();
    } catch (e) {
      setError(e?.response?.data?.error || "Ошибка создания года");
    } finally {
      setCreating(false);
    }
  };

  const handleSetCurrent = async (year) => {
    if (year.isCurrent) return;
    if (!confirm(`Установить "${year.name}" как текущий год?\nТекущий год будет снят.`)) return;
    try {
      await api.patch(`/api/admin/years/${year.id}/set-current`);
      showSuccess(`"${year.name}" установлен как текущий`);
      fetchYears();
    } catch (e) {
      setError(e?.response?.data?.error || "Ошибка");
    }
  };

  const handleToggleLock = async (year) => {
    const action = year.isLocked ? "разблокировать" : "заблокировать";
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} год "${year.name}"?`)) return;
    try {
      await api.patch(`/api/admin/years/${year.id}/lock`);
      showSuccess(`Год "${year.name}" ${year.isLocked ? "разблокирован" : "заблокирован"}`);
      fetchYears();
    } catch (e) {
      setError(e?.response?.data?.error || "Ошибка");
    }
  };

  const handleDelete = async (year) => {
    if (year.isCurrent) {
      setError("Нельзя удалить текущий год. Сначала установите другой год как текущий.");
      return;
    }
    if (!confirm(`Удалить год "${year.name}"? Это действие необратимо.`)) return;
    try {
      await api.delete(`/api/admin/years/${year.id}`);
      showSuccess(`Год "${year.name}" удалён`);
      fetchYears();
    } catch (e) {
      setError(e?.response?.data?.error || "Ошибка удаления");
    }
  };

  return (
    <div className="contents">
      <div className="private-office-contents">
        <div className="header">
          <NavBar />
        </div>
        <div className="admin-section" style={{ padding: "24px", maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ marginBottom: "20px", fontSize: "22px", fontWeight: 700 }}>
            🗓️ Управление академическими годами
          </h2>

          {/* Уведомления */}
          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fca5a5",
              borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", color: "#dc2626"
            }}>
              ❌ {error}
              <button onClick={() => setError(null)} style={{ float: "right", background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}>✕</button>
            </div>
          )}
          {successMsg && (
            <div style={{
              background: "#f0fdf4", border: "1px solid #86efac",
              borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", color: "#16a34a"
            }}>
              ✅ {successMsg}
            </div>
          )}

          {/* Создание нового года */}
          <div style={{
            background: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: "12px", padding: "20px", marginBottom: "24px"
          }}>
            <h3 style={{ marginBottom: "12px", fontSize: "16px", fontWeight: 600 }}>
              Создать новый год
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "14px" }}>
              При создании нового года текущий год будет переведён в архив (isCurrent = false, isLocked = true).
              Новые записи наград будут созданы только для категорий без срока действия (постоянные).
            </p>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <input
                type="text"
                value={newYearName}
                onChange={(e) => setNewYearName(e.target.value)}
                placeholder="Например: 2025-2026"
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: "8px",
                  border: "1px solid #cbd5e1", fontSize: "15px", outline: "none"
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                id="new-year-name-input"
              />
              <button
                onClick={handleCreate}
                disabled={creating || !newYearName.trim()}
                id="create-year-btn"
                style={{
                  padding: "10px 22px", borderRadius: "8px", border: "none",
                  background: creating ? "#94a3b8" : "#2563eb", color: "#fff",
                  fontWeight: 600, cursor: creating ? "not-allowed" : "pointer",
                  fontSize: "15px", whiteSpace: "nowrap"
                }}
              >
                {creating ? "Создание..." : "+ Создать год"}
              </button>
            </div>
          </div>

          {/* Список годов */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Загрузка...</div>
          ) : years.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Нет годов. Создайте первый.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {years.map((year) => (
                <div
                  key={year.id}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px 20px", borderRadius: "10px",
                    border: year.isCurrent ? "2px solid #2563eb" : "1px solid #e2e8f0",
                    background: year.isCurrent ? "#eff6ff" : "#fff",
                    boxShadow: year.isCurrent ? "0 0 0 3px rgba(37,99,235,0.08)" : "none",
                    transition: "all 0.2s"
                  }}
                >
                  {/* Название + бейджи */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "17px", fontWeight: 600, color: year.isCurrent ? "#1d4ed8" : "#1e293b" }}>
                      {year.name}
                    </span>
                    {year.isCurrent && (
                      <span style={{
                        background: "#2563eb", color: "#fff",
                        padding: "2px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600
                      }}>
                        Текущий
                      </span>
                    )}
                    {year.isLocked && (
                      <span style={{
                        background: "#f59e0b", color: "#fff",
                        padding: "2px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600
                      }}>
                        🔒 Закрыт
                      </span>
                    )}
                  </div>

                  {/* Действия */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    {!year.isCurrent && (
                      <button
                        onClick={() => handleSetCurrent(year)}
                        title="Установить как текущий"
                        style={{
                          padding: "6px 14px", borderRadius: "6px", border: "1px solid #2563eb",
                          background: "#fff", color: "#2563eb", cursor: "pointer", fontSize: "13px", fontWeight: 600
                        }}
                      >
                        Сделать текущим
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleLock(year)}
                      title={year.isLocked ? "Разблокировать" : "Заблокировать"}
                      style={{
                        padding: "6px 12px", borderRadius: "6px",
                        border: `1px solid ${year.isLocked ? "#16a34a" : "#f59e0b"}`,
                        background: "#fff", color: year.isLocked ? "#16a34a" : "#f59e0b",
                        cursor: "pointer", fontSize: "13px", fontWeight: 600
                      }}
                    >
                      {year.isLocked ? "🔓 Разблокировать" : "🔒 Закрыть"}
                    </button>
                    {!year.isCurrent && (
                      <button
                        onClick={() => handleDelete(year)}
                        title="Удалить год"
                        style={{
                          padding: "6px 10px", borderRadius: "6px",
                          border: "1px solid #fca5a5", background: "#fff",
                          color: "#dc2626", cursor: "pointer", fontSize: "13px", fontWeight: 600
                        }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminYears;
