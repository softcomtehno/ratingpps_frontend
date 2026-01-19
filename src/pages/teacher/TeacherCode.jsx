import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function TeacherCode() {
  const { state } = useLocation(); // { email }
  const nav = useNavigate();
  const [code, setCode] = useState('');
  const [pass, setPass] = useState('');
  const [load, setLoad] = useState(false);
  const [err, setErr]   = useState('');

  const verify = async e => {
    e.preventDefault();
    setLoad(true); setErr('');
    try {
      const { data } = await api.post('/api/auth/verify', { email: state.email, code, password: pass });
      localStorage.setItem('token', data.token);
      nav('/teacher/step2');
    } catch (e) {
      setErr(e.response?.data?.message || 'Неверный код/пароль');
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="auth__contain">
      <h2 className="Edu__text-L center">Проверка кода</h2>
      <form onSubmit={verify}>
        <p className="input__text Montherat">Код из письма</p>
        <input type="text" className="auth__input" value={code} onChange={e => setCode(e.target.value)} maxLength={6} required />
        <p className="input__text Montherat">Придумайте пароль</p>
        <input type="password" className="auth__input" value={pass} onChange={e => setPass(e.target.value)} minLength={6} required />
        {err && <p style={{color:'crimson'}}>{err}</p>}
        <div className="auth__btn">
          <button disabled={load} className="bnt__log Edu__text-S">{load ? 'Проверка…' : 'Далее'}</button>
        </div>
      </form>
    </div>
  );
}