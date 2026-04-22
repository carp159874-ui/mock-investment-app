import { useState } from 'react';
import { login, register, getTeams } from '../utils/db.js';

export default function AuthPage({ onLogin }) {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', email: '', isTeacher: false, teacherCode: '', teamId: '' });
  const [error, setError] = useState('');

  const teams = Object.values(getTeams());

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLogin = () => {
    const r = login({ username: form.username, password: form.password });
    if (r.error) { setError(r.error); return; }
    onLogin();
  };

  const handleRegister = () => {
    if (!form.username || !form.password) { setError('아이디와 비밀번호를 입력하세요.'); return; }
    const r = register({ username: form.username, password: form.password, email: form.email, isTeacher: form.isTeacher, teacherCode: form.teacherCode, teamId: form.teamId || null });
    if (r.error) { setError(r.error); return; }
    // 자동 로그인
    login({ username: form.username, password: form.password });
    onLogin();
  };

  const inp = (ph, key, type = 'text') => (
    <input placeholder={ph} type={type} value={form[key]}
      onChange={e => { set(key, e.target.value); setError(''); }}
      style={iStyle} />
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📈</div>
        <h1 style={{ color: '#f1f5f9', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>주식 모의투자</h1>
        <p style={{ color: '#64748b', fontSize: 15 }}>실전처럼 배우는 투자 시뮬레이터</p>
      </div>

      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 36, width: 360 }}>
        {/* 탭 */}
        <div style={{ display: 'flex', marginBottom: 24, background: '#0f172a', borderRadius: 10, padding: 4 }}>
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }}
              style={{ flex: 1, padding: '9px 0', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, background: tab === t ? '#38bdf8' : 'transparent', color: tab === t ? '#0f172a' : '#64748b', transition: 'all 0.2s' }}>
              {t === 'login' ? '로그인' : '회원가입'}
            </button>
          ))}
        </div>

        {tab === 'login' ? (
          <>
            {inp('아이디', 'username')}
            {inp('비밀번호', 'password', 'password')}
            {error && <div style={errStyle}>{error}</div>}
            <button onClick={handleLogin} style={btnStyle}>로그인</button>
          </>
        ) : (
          <>
            {inp('아이디', 'username')}
            {inp('이메일 (선택)', 'email', 'email')}
            {inp('비밀번호', 'password', 'password')}
            {teams.length > 0 && (
              <select value={form.teamId} onChange={e => set('teamId', e.target.value)} style={{ ...iStyle, color: form.teamId ? '#f1f5f9' : '#64748b' }}>
                <option value=''>팀 선택 (선택사항)</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#94a3b8', fontSize: 14, cursor: 'pointer' }}>
              <input type='checkbox' checked={form.isTeacher} onChange={e => set('isTeacher', e.target.checked)} />
              선생님 계정으로 가입
            </label>
            {form.isTeacher && inp('선생님 코드', 'teacherCode')}
            {error && <div style={errStyle}>{error}</div>}
            <button onClick={handleRegister} style={btnStyle}>회원가입 (초기 자금 1,000만원 지급)</button>
          </>
        )}
      </div>

      <div style={{ marginTop: 20, color: '#334155', fontSize: 12 }}>
        💡 선생님 코드: <span style={{ color: '#38bdf8' }}>TEACHER2024</span>
      </div>
    </div>
  );
}

const iStyle = { display: 'block', width: '100%', marginBottom: 12, padding: '11px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 14, outline: 'none', fontFamily: 'inherit' };
const btnStyle = { width: '100%', padding: '13px 0', background: '#0ea5e9', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4, fontFamily: 'inherit' };
const errStyle = { color: '#f87171', fontSize: 13, marginBottom: 10, padding: '8px 12px', background: '#7f1d1d22', borderRadius: 6, border: '1px solid #7f1d1d' };
