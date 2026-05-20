import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import StageNav from "../../components/StageNav";
import AccountConf from "../../components/AccountConf";
import api from "../../services/api";
import useAuthToken from "../../hooks/useAuthToken";
import "../../css/PrivateOfficeNew.css";

function PrivateOffice() {
  const navigate = useNavigate();

  const token = useAuthToken();

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [editValues, setEditValues] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    positionId: "",
    institutes: [
      {
        organizationId: "",
        organizationName: "",
        instituteId: "",
        instituteName: "",
        isActive: false,
        isRegular: false,
      },
    ],
  });

  const [positions, setPositions] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [institutesMap, setInstitutesMap] = useState({});

  useEffect(() => {
    let mounted = true;
    const loadDictionaries = async () => {
      try {
        const [posRes, orgRes] = await Promise.all([
          api.get("/api/positions"),
          api.get("/api/organizations"),
        ]);
        if (!mounted) return;
        setPositions(Array.isArray(posRes.data) ? posRes.data : []);
        setOrganizations(Array.isArray(orgRes.data) ? orgRes.data : []);
      } catch (e) {
        // not critical
      }
    };
    loadDictionaries();
    return () => { mounted = false; };
  }, []);

  const normalizeProfile = (data) => {
    const user = Array.isArray(data) ? data[0] : data;
    if (!user) return null;
    return {
      id: user.id,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      middleName: user.middleName ?? "",
      email: user.email ?? "",
      position: user.position ?? "",
      positionId: user.positionId ?? "",
      institutes: Array.isArray(user.institutes) ? user.institutes : [],
    };
  };

  const fillEditValuesFromProfile = (p) => {
    setEditValues({
      firstName: p?.firstName ?? "",
      lastName: p?.lastName ?? "",
      middleName: p?.middleName ?? "",
      email: p?.email ?? "",
      positionId: p?.positionId ?? "",
      institutes:
        p?.institutes?.length > 0
          ? p.institutes.map((inst) => ({
            organizationId: inst.organizationId ?? "",
            organizationName: inst.organizationName ?? "",
            instituteId: inst.instituteId ?? "",
            instituteName: inst.instituteName ?? "",
            isActive: !!inst.isActive,
            isRegular: !!inst.isRegular,
          }))
          : [{ organizationId: "", organizationName: "", instituteId: "", instituteName: "", isActive: false, isRegular: false }],
    });
  };

  useEffect(() => {
    const orgIds = [...new Set((editValues.institutes || []).map((i) => i.organizationId).filter(Boolean))];
    if (orgIds.length === 0) { setInstitutesMap({}); return; }
    const load = async () => {
      try {
        const data = await Promise.all(
          orgIds.map((orgId) => api.get(`/api/organizations/${orgId}/institutes`).then((r) => ({ orgId, list: r.data })))
        );
        const map = {};
        data.forEach(({ orgId, list }) => { map[orgId] = list; });
        setInstitutesMap((prev) => ({ ...prev, ...map }));
      } catch (e) { /* ignore */ }
    };
    load();
  }, [editValues.institutes]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      if (!token) { setProfile(null); setEditMode(false); setLoading(false); return; }
      try {
        const res = await api.get("/api/teacher/name", { headers: { Authorization: `Bearer ${token}` } });
        const p = normalizeProfile(res.data);
        setProfile(p);
        fillEditValuesFromProfile(p);
        const hasBasic = (p?.firstName ?? "").trim() && (p?.lastName ?? "").trim() && (p?.email ?? "").trim() && (p?.institutes?.length ?? 0) > 0;
        setEditMode(!hasBasic);
      } catch (e) {
        setProfile(null);
        setEditMode(true);
        setError("Ошибка загрузки данных пользователя. Попробуйте снова.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleBack = useCallback(() => {
    if (editMode) {
      if (profile) fillEditValuesFromProfile(profile);
      setEditMode(false);
      setError(null);
      return;
    }
    navigate(-1);
  }, [editMode, navigate, profile]);

  const handleEdit = useCallback(() => { setEditMode(true); setError(null); }, []);

  const handleInputChange = (field, value) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleInstituteChange = (idx, field, value) => {
    setEditValues((prev) => {
      const updated = prev.institutes.map((inst, i) => {
        if (i !== idx) return inst;
        if (field === "organizationId") {
          const org = organizations.find((o) => String(o.id) === String(value));
          return { ...inst, organizationId: value, organizationName: org?.name ?? "", instituteId: "", instituteName: "" };
        }
        if (field === "instituteId") {
          const list = institutesMap[inst.organizationId] || [];
          const ins = list.find((item) => String(item.id) === String(value));
          return { ...inst, instituteId: value, instituteName: ins?.name ?? "" };
        }
        return { ...inst, [field]: value };
      });
      return { ...prev, institutes: updated };
    });
  };

  const handleInstituteCheckbox = (idx, field) => {
    setEditValues((prev) => ({
      ...prev,
      institutes: prev.institutes.map((inst, i) => (i === idx ? { ...inst, [field]: !inst[field] } : inst)),
    }));
  };

  const handleAddInstitute = () => {
    setEditValues((prev) => ({
      ...prev,
      institutes: [...prev.institutes, { organizationId: "", organizationName: "", instituteId: "", instituteName: "", isActive: false, isRegular: false }],
    }));
  };

  const handleRemoveInstitute = (idx) => {
    setEditValues((prev) => ({
      ...prev,
      institutes: prev.institutes.length > 1 ? prev.institutes.filter((_, i) => i !== idx) : prev.institutes,
    }));
  };

  const validate = () => {
    if (!editValues.lastName.trim() || !editValues.firstName.trim()) return "Заполните Фамилию и Имя.";
    if (!Array.isArray(editValues.institutes) || editValues.institutes.length === 0) return "Добавьте хотя бы один институт.";
    const bad = editValues.institutes.some((i) => !String(i.organizationName ?? "").trim() || !String(i.instituteName ?? "").trim());
    if (bad) return "Заполните Учреждение и Институт для каждого места.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const msg = validate();
    if (msg) { setError(msg); return; }
    setSubmitLoading(true);
    try {
      const payload = {
        id: parseInt(profile?.id, 10) || 0,
        firstName: String(editValues.firstName).trim(),
        lastName: String(editValues.lastName).trim(),
        middleName: String(editValues.middleName).trim(),
        email: String(editValues.email).trim(),
        positionId: parseInt(editValues.positionId, 10) || 0,
        institutes: editValues.institutes.map((i) => ({
          organizationId: parseInt(i.organizationId, 10) || 0,
          organizationName: String(i.organizationName ?? "").trim(),
          instituteId: parseInt(i.instituteId, 10) || 0,
          instituteName: String(i.instituteName ?? "").trim(),
          isRegular: i.isRegular === true,
        })),
      };
      await api.post("/api/teacher/profile/update", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const res = await api.get("/api/teacher/name", { headers: { Authorization: `Bearer ${token}` } });
      const p = normalizeProfile(res.data);
      setProfile(p);
      fillEditValuesFromProfile(p);
      setEditMode(false);
    } catch (e2) {
      const msg2 = e2.response?.data?.message || (Array.isArray(e2.response?.data?.violations) ? e2.response.data.violations.map((v) => v.message).join("; ") : null) || "Ошибка при сохранении данных. Попробуйте еще раз.";
      setError(msg2);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="private-office-contents">
      <div className="header">
        <NavBar />
      </div>

      <div className="private-office__main">
        <AccountConf />

        <div className="office">
          <StageNav />

          <div className="po-page">
            <h2 className="po-page-title">Личные данные</h2>

            {loading ? (
              <div className="po-loading">
                <div className="po-spinner"></div>
                <span>Загрузка данных...</span>
              </div>
            ) : error && !editMode ? (
              <div className="po-alert po-alert--error">{error}</div>
            ) : profile && !editMode ? (
              /* ======== VIEW MODE ======== */
              <div className="po-card">
                <div className="po-profile-grid">
                  <div className="po-field">
                    <span className="po-field-label">Фамилия</span>
                    <span className="po-field-value">{profile.lastName || "—"}</span>
                  </div>
                  <div className="po-field">
                    <span className="po-field-label">Имя</span>
                    <span className="po-field-value">{profile.firstName || "—"}</span>
                  </div>
                  <div className="po-field">
                    <span className="po-field-label">Отчество</span>
                    <span className="po-field-value">{profile.middleName || "—"}</span>
                  </div>
                  <div className="po-field">
                    <span className="po-field-label">Email</span>
                    <span className="po-field-value">{profile.email || "—"}</span>
                  </div>
                  <div className="po-field po-field--full">
                    <span className="po-field-label">Должность</span>
                    <span className="po-field-value">{positions.find(p => String(p.id) === String(profile.positionId))?.name || profile.position || "—"}</span>
                  </div>
                </div>

                <div className="po-section-label">Институты</div>
                {profile.institutes?.length > 0 ? (
                  <div className="po-institutes-list">
                    {profile.institutes.map((inst, idx) => (
                      <div className="po-institute-card" key={inst.instituteId ?? idx}>
                        <div className="po-institute-main">
                          <div className="po-institute-org">{inst.organizationName || "—"}</div>
                          <div className="po-institute-name">{inst.instituteName || "—"}</div>
                        </div>
                        <div className="po-institute-badges">
                          <span className={`po-badge ${inst.isRegular ? "po-badge--regular" : "po-badge--inactive"}`}>
                            {inst.isRegular ? "Штатный" : "Внештатный"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="po-empty-text">Нет информации об институтах.</p>
                )}

                <div className="po-actions">
                  <button type="button" onClick={handleEdit} className="po-btn po-btn--primary">
                    Редактировать
                  </button>
                  <button type="button" onClick={handleBack} className="po-btn po-btn--secondary">
                    Назад
                  </button>
                </div>
              </div>
            ) : (
              /* ======== EDIT MODE ======== */
              <form onSubmit={handleSubmit} className="po-card">
                <div className="po-form-grid">
                  <div className="po-form-group">
                    <label className="po-label">Фамилия <span className="po-required">*</span></label>
                    <input type="text" className="po-input" value={editValues.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} placeholder="Введите фамилию" required />
                  </div>
                  <div className="po-form-group">
                    <label className="po-label">Имя <span className="po-required">*</span></label>
                    <input type="text" className="po-input" value={editValues.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} placeholder="Введите имя" required />
                  </div>
                  <div className="po-form-group">
                    <label className="po-label">Отчество</label>
                    <input type="text" className="po-input" value={editValues.middleName} onChange={(e) => handleInputChange("middleName", e.target.value)} placeholder="Введите отчество" />
                  </div>
                  <div className="po-form-group">
                    <label className="po-label">Email</label>
                    <input type="email" className="po-input" value={editValues.email} readOnly disabled />
                    <span style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Email нельзя изменить</span>
                  </div>
                  <div className="po-form-group po-form-group--full">
                    <label className="po-label">Должность</label>
                    <select className="po-input po-select" value={editValues.positionId} onChange={(e) => handleInputChange("positionId", e.target.value)}>
                      <option value="">Выберите должность</option>
                      {positions.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} {p.reduction ? `(${p.reduction})` : ""}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="po-section-label">Институты</div>

                {editValues.institutes.map((inst, idx) => (
                  <div className="po-institute-edit-card" key={idx}>
                    <div className="po-institute-edit-header">
                      <span className="po-institute-edit-num">#{idx + 1}</span>
                      {editValues.institutes.length > 1 && (
                        <button type="button" onClick={() => handleRemoveInstitute(idx)} className="po-btn-icon po-btn-icon--danger" title="Удалить">✕</button>
                      )}
                    </div>
                    <div className="po-form-grid">
                      <div className="po-form-group">
                        <label className="po-label">Учреждение <span className="po-required">*</span></label>
                        <select className="po-input po-select" value={inst.organizationId} onChange={(e) => handleInstituteChange(idx, "organizationId", e.target.value)} required>
                          <option value="">Выберите организацию</option>
                          {organizations.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
                        </select>
                      </div>
                      <div className="po-form-group">
                        <label className="po-label">Институт <span className="po-required">*</span></label>
                        <select className="po-input po-select" value={inst.instituteId} onChange={(e) => handleInstituteChange(idx, "instituteId", e.target.value)} required disabled={!inst.organizationId}>
                          <option value="">Выберите институт</option>
                          {(institutesMap[inst.organizationId] || []).map((ins) => (<option key={ins.id} value={ins.id}>{ins.name}</option>))}
                        </select>
                      </div>
                    </div>
                    <div className="po-checkboxes">

                      <label className="po-checkbox-label">
                        <input type="checkbox" className="po-checkbox" checked={!!inst.isRegular} onChange={() => handleInstituteCheckbox(idx, "isRegular")} />
                        <span className="po-checkbox-custom"></span>
                        Штатный
                      </label>
                    </div>
                  </div>
                ))}

                <button type="button" className="po-btn po-btn--outline" onClick={handleAddInstitute}>+ Добавить институт</button>

                {error && <div className="po-alert po-alert--error" style={{ marginTop: 16 }}>{error}</div>}

                <div className="po-actions">
                  <button type="submit" className="po-btn po-btn--primary" disabled={submitLoading}>
                    {submitLoading ? "Сохранение..." : "Сохранить"}
                  </button>
                  <button type="button" className="po-btn po-btn--secondary" onClick={handleBack}>Отмена</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivateOffice;
