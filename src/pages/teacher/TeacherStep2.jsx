import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function TeacherStep2() {
  const navigate = useNavigate();

  /*  справочники  */
  const [positions, setPositions]       = useState([]);
  const [organizations, setOrganizations]= useState([]);
  const [institutes, setInstitutes]     = useState({});   // { orgId: [inst] }

  /*  поля формы  */
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [middleName,setMiddleName]= useState('');
  const [hasTrousers,setTrousers] = useState(null);   // bool | null
  const [positionId,setPositionId]= useState('');
  const [workplaces,setWorkplaces]= useState([         // минимум 1 строка
    { organizationId:'', instituteId:'' }
  ]);

  /* загрузить справочники */
  useEffect(() => {
    Promise.all([
      api.get('/api/positions').then(r => setPositions(r.data)),
      api.get('/api/organizations').then(r => setOrganizations(r.data))
    ]).then(() => loadInstitutes(workplaces));
  }, []);

  /* подгрузить институты для выбранных организаций */
  const loadInstitutes = async (wps) => {
    const orgIds = [...new Set(wps.map(w => w.organizationId).filter(Boolean))];
    const data   = await Promise.all(
      orgIds.map(orgId =>
        api.get(`/api/organizations/${orgId}/institutes`)
           .then(r => ({ orgId, list: r.data }))
      )
    );
    const map = {};
    data.forEach(({ orgId, list }) => map[orgId] = list);
    setInstitutes(map);
  };

  /* управление строками workplaces */
  const addWorkplace = () =>
    setWorkplaces([...workplaces, { organizationId:'', instituteId:'' }]);

  const removeWorkplace = (idx) =>
    setWorkplaces(workplaces.filter((_, i) => i !== idx));

  const changeWP = (idx, field, val) => {
    const w = [...workplaces];
    w[idx][field] = val;
    if (field === 'organizationId') {          // сменили организацию → сброс института
      w[idx].instituteId = '';
      loadInstitutes(w);
    }
    setWorkplaces(w);
  };

  /* отправка step-2 */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/me/registration-step2', {
        firstName,
        lastName,
        middleName,
        hasTrousers,
        positionId: Number(positionId),
        workplaces: workplaces.map(w => ({
          organizationId: Number(w.organizationId),
          instituteId:    Number(w.instituteId)
        }))
      });
      navigate('/private_office');   // переход в кабинет
    } catch (err) {
      const msg = err.response?.data?.violations
        ? err.response.data.violations.map(v => v.message).join('; ')
        : err.response?.data?.message || 'Ошибка сохранения';
      alert(msg);
    }
  };

  /* разметка под ваши классы */
  return (
    <div className="auth__contain">
      <h2 className="Edu__text-L center">Заполните профиль</h2>

      <form onSubmit={handleSubmit}>

        {/*  ФИО  */}
        <p className="input__text Montherat">Имя</p>
        <input className="auth__input Montherat" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Иван" required />

        <p className="input__text Montherat">Фамилия</p>
        <input className="auth__input Montherat" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Иванов" required />

        <p className="input__text Montherat">Отчество</p>
        <input className="auth__input Montherat" value={middleName} onChange={e => setMiddleName(e.target.value)} placeholder="Иванович" />

        {/*  «Штаны»  */}
        <div style={{margin: '1rem 0'}}>
          <label className="Edu__text-S">
            <input type="checkbox" checked={hasTrousers === true} onChange={() => setTrousers(true)} /> В штанах
          </label>
          <label className="Edu__text-S">
            <input type="checkbox" checked={hasTrousers === false} onChange={() => setTrousers(false)} /> Без штанов
          </label>
        </div>

        {/*  Должность  */}
        <p className="input__text Montherat">Должность</p>
        <select className="auth__input Montherat" value={positionId} onChange={e => setPositionId(e.target.value)} required>
          <option value="">Выберите должность</option>
          {positions.map(p =>
            <option key={p.id} value={p.id}>
              {p.name} {p.reduction && `(${p.reduction})`}
            </option>
          )}
        </select>

        {/*  Места работы  */}
        <p className="input__text Montherat">Места работы</p>
        {workplaces.map((wp, idx) => (
          <div key={idx} className="workplace-row">
            <select className="auth__input Montherat"
                    value={wp.organizationId}
                    onChange={e => changeWP(idx, 'organizationId', e.target.value)}
                    required>
              <option value="">Организация</option>
              {organizations.map(o =>
                <option key={o.id} value={o.id}>{o.name}</option>
              )}
            </select>

            <select className="auth__input Montherat"
                    value={wp.instituteId}
                    onChange={e => changeWP(idx, 'instituteId', e.target.value)}
                    required>
              <option value="">Институт</option>
              {(institutes[wp.organizationId] || []).map(ins =>
                <option key={ins.id} value={ins.id}>{ins.name}</option>
              )}
            </select>

            <button type="button" className="bnt__log Edu__text-S" onClick={() => removeWorkplace(idx)}>✕</button>
          </div>
        ))}

        <div className="auth__btn">
          <button type="button" className="bnt__log Edu__text-S" onClick={addWorkplace}>+ добавить</button>
        </div>

        {/*  Сохранить  */}
        <div className="auth__btn">
          <button type="submit" className="bnt__log Edu__text-S">Сохранить и войти</button>
        </div>
      </form>
    </div>
  );
}