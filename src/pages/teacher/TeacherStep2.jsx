import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import NavBar from '../../components/NavBar';
import '../../css/PrivateOfficeNew.css';

export default function TeacherStep2() {
  const navigate = useNavigate();

  // Справочники
  const [positions, setPositions] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [institutes, setInstitutes] = useState({}); // { orgId: [inst] }

  // Поля формы
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [positionId, setPositionId] = useState('');
  // workplaces - каждый элемент: { organizationId, instituteId, regular }
  const [workplaces, setWorkplaces] = useState([
    { organizationId: '', instituteId: '', regular: true }
  ]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка справочников
  useEffect(() => {
    let mounted = true;

    Promise.all([
      api.get('/api/positions').then(r => mounted && setPositions(r.data)),
      api.get('/api/organizations').then(r => mounted && setOrganizations(r.data))
    ]).then(() => loadInstitutes(workplaces));

    return () => { mounted = false };
    // eslint-disable-next-line
  }, []);

  // Подгрузка институтов для выбранных организаций
  const loadInstitutes = async (wps) => {
    const orgIds = [...new Set(wps.map(w => w.organizationId).filter(Boolean))];
    if (orgIds.length === 0) {
      setInstitutes({});
      return;
    }
    const data = await Promise.all(
      orgIds.map(orgId =>
        api.get(`/api/organizations/${orgId}/institutes`)
          .then(r => ({ orgId, list: r.data }))
      )
    );
    const map = {};
    data.forEach(({ orgId, list }) => map[orgId] = list);
    setInstitutes(map);
  };

  // Управление workplaces
  const addWorkplace = () => {
    setWorkplaces([
      ...workplaces,
      { organizationId: '', instituteId: '', regular: true }
    ]);
  };

  const removeWorkplace = (idx) => {
    if (workplaces.length === 1) return;
    setWorkplaces(workplaces.filter((_, i) => i !== idx));
  };

  const changeWP = (idx, field, val) => {
    const w = [...workplaces];
    w[idx] = { ...w[idx], [field]: val };

    if (field === 'organizationId') {
      w[idx].instituteId = '';
      loadInstitutes(w);
    }
    setWorkplaces(w);
  };

  // Валидация
  const isValidWorkplaces = () =>
    workplaces.length > 0 &&
    workplaces.every(w =>
      w.organizationId && w.instituteId && typeof w.regular === 'boolean'
    );

  // Отправка
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!firstName.trim() || !lastName.trim() || !positionId) {
      setError('Проверьте, что все обязательные поля (Имя, Фамилия, Должность) заполнены.');
      return;
    }
    if (!isValidWorkplaces()) {
      setError('Проверьте, что для каждого места работы выбраны организация, институт и тип занятости.');
      return;
    }
    setSubmitLoading(true);
    try {
      await api.put('/api/me/registration-step2', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        middleName: middleName.trim(),
        positionId: Number(positionId),
        workplaces: workplaces.map(w => ({
          organizationId: Number(w.organizationId),
          instituteId: Number(w.instituteId),
          regular: Boolean(w.regular)
        }))
      });
      navigate('/private_office');
    } catch (err) {
      const msg = err.response?.data?.violations
        ? err.response.data.violations.map(v => v.message).join('; ')
        : err.response?.data?.message || 'Ошибка сохранения';
      setError(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="step2-root">
      <div className="header">
        <NavBar />
      </div>

      <div className="step2-page-wrap">
        <div className="po-page">
          <h2 className="po-page-title">Заполните профиль</h2>
          <p className="step2-subtitle">Добро пожаловать! Пожалуйста, заполните основные данные для продолжения.</p>

          <form onSubmit={handleSubmit} className="po-card">

            {/* Личные данные */}
            <div className="po-section-label">Личные данные</div>
            <div className="po-form-grid">
              <div className="po-form-group">
                <label className="po-label">Фамилия <span className="po-required">*</span></label>
                <input
                  type="text"
                  className="po-input"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Иванов"
                  required
                />
              </div>

              <div className="po-form-group">
                <label className="po-label">Имя <span className="po-required">*</span></label>
                <input
                  type="text"
                  className="po-input"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Иван"
                  required
                />
              </div>

              <div className="po-form-group">
                <label className="po-label">Отчество</label>
                <input
                  type="text"
                  className="po-input"
                  value={middleName}
                  onChange={e => setMiddleName(e.target.value)}
                  placeholder="Иванович"
                />
              </div>

              <div className="po-form-group">
                <label className="po-label">Должность <span className="po-required">*</span></label>
                <select
                  className="po-input po-select"
                  value={positionId}
                  onChange={e => setPositionId(e.target.value)}
                  required
                >
                  <option value="">Выберите должность</option>
                  {positions.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}{p.reduction ? ` (${p.reduction})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Места работы */}
            <div className="po-section-label">Места работы</div>

            {workplaces.map((wp, idx) => (
              <div className="po-institute-edit-card" key={idx}>
                <div className="po-institute-edit-header">
                  <span className="po-institute-edit-num">#{idx + 1}</span>
                  {workplaces.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWorkplace(idx)}
                      className="po-btn-icon po-btn-icon--danger"
                      title="Удалить место работы"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="po-form-grid">
                  <div className="po-form-group">
                    <label className="po-label">Учреждение <span className="po-required">*</span></label>
                    <select
                      className="po-input po-select"
                      value={wp.organizationId}
                      onChange={e => changeWP(idx, 'organizationId', e.target.value)}
                      required
                    >
                      <option value="">Выберите организацию</option>
                      {organizations.map(o => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="po-form-group">
                    <label className="po-label">Институт <span className="po-required">*</span></label>
                    <select
                      className="po-input po-select"
                      value={wp.instituteId}
                      onChange={e => changeWP(idx, 'instituteId', e.target.value)}
                      required
                      disabled={!wp.organizationId}
                    >
                      <option value="">Выберите институт</option>
                      {(institutes[wp.organizationId] || []).map(ins => (
                        <option key={ins.id} value={ins.id}>{ins.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="po-checkboxes">
                  <label className="po-checkbox-label">
                    <input
                      type="checkbox"
                      className="po-checkbox"
                      checked={wp.regular === true}
                      onChange={() => changeWP(idx, 'regular', !wp.regular)}
                    />
                    <span className="po-checkbox-custom"></span>
                    Штатный (основное место работы)
                  </label>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="po-btn po-btn--outline"
              onClick={addWorkplace}
            >
              + Добавить место работы
            </button>

            {error && (
              <div className="po-alert po-alert--error" style={{ marginTop: 16 }}>
                {error}
              </div>
            )}

            <div className="po-actions">
              <button
                type="submit"
                className="po-btn po-btn--primary"
                disabled={submitLoading}
              >
                {submitLoading ? 'Сохранение...' : 'Сохранить и продолжить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}