import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function TeacherEmail() {
  const [email, setEmail] = useState('');
  const [load, setLoad] = useState(false);
  const [err, setErr]     = useState('');
  const nav = useNavigate();

  const sendCode = async e => {
    e.preventDefault();
    setLoad(true); setErr('');
    try {
      await api.post('/api/auth/code', { email });
      nav('/teacher/code', { state: { email } });
    } catch (e) {
      setErr(e.response?.data?.message || 'Не удалось отправить код');
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="auth__contain">
      <h2 className="Edu__text-L center">Регистрация преподавателя</h2>
      <form onSubmit={sendCode}>
        <p className="input__text Montherat">E-mail</p>
        <input type="email" className="auth__input" value={email} onChange={e => setEmail(e.target.value)} required />
        {err && <p style={{color:'crimson'}}>{err}</p>}
        <div className="auth__btn">
          <button disabled={load} className="bnt__log Edu__text-S">{load ? 'Отправка…' : 'Отправить код'}</button>
        </div>
      </form>
    </div>
  );
}