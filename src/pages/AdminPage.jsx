import { useState } from 'react';
import { useApp } from '../App.jsx';
import { getUsers, getTeams, createTeam, deleteTeam, assignTeam, resetUser } from '../utils/db.js';

export default function AdminPage() {
  const { user } = useApp();
  const [teamName, setTeamName] = useState('');
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  if (!user.isTeacher) return <div style={{ color: '#f87171', padding: 40 }}>접근 권한이 없습니다.</div>;

  const users = Object.values(getUsers()).filter(u => !u.isTeacher);
  const teams = Object.values(getTeams());

  const handleCreateTeam = () => {
    if (!teamName.trim()) return;
    createTeam(teamName.trim());
    setTeamName('');
    refresh();
  };

  return (
    <div>
      <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 22 }}>⚙️ 관리자 패널</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* 팀 관리 */}
        <div style={card}>
          <div style={cardTitle}>팀 관리</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input value={teamName} onChange={e => setTeamName(e.target.value)}
              placeholder="새 팀 이름"
              style={{ flex: 1, padding: '9px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
            <button onClick={handleCreateTeam}
              style={{ padding: '9px 16px', background: '#0ea5e9', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>만들기</button>
          </div>
          {teams.length === 0
            ? <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>팀이 없습니다.</div>
            : teams.map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1e293b' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{users.filter(u => u.teamId === t.id).length}명</div>
                </div>
                <button onClick={() => { if (window.confirm(`"${t.name}" 팀을 삭제하시겠습니까?`)) { deleteTeam(t.id); refresh(); } }}
                  style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #7f1d1d', borderRadius: 6, color: '#f87171', cursor: 'pointer', fontSize: 12 }}>삭제</button>
              </div>
            ))}
        </div>

        {/* 학생 관리 */}
        <div style={card}>
          <div style={cardTitle}>학생 관리</div>
          {users.length === 0
            ? <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>학생이 없습니다.</div>
            : users.map(u => (
              <div key={u.id} style={{ padding: '10px 0', borderBottom: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14 }}>{u.nickname}</div>
                    <div style={{ fontSize: 11, color: '#475569' }}>{u.id}</div>
                  </div>
                  <button onClick={() => { if (window.confirm(`${u.nickname}의 포트폴리오를 초기화하시겠습니까?`)) { resetUser(u.id); refresh(); } }}
                    style={{ padding: '4px 10px', background: 'transparent', border: '1px solid #334155', borderRadius: 6, color: '#64748b', cursor: 'pointer', fontSize: 12 }}>초기화</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select value={u.teamId || ''} onChange={e => { assignTeam(u.id, e.target.value || null); refresh(); }}
                    style={{ flex: 1, padding: '5px 8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#94a3b8', fontSize: 12, fontFamily: 'inherit' }}>
                    <option value=''>팀 없음</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

const card = { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '20px 22px' };
const cardTitle = { color: '#94a3b8', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 16 };
