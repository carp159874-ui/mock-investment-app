import { useState } from 'react';
import { useApp } from '../App.jsx';
import { updateUser } from '../utils/db.js';
import { fmtPrice, fmtPct } from '../utils/finance.js';

const INITIAL_CASH = 10_000_000;

export default function MyPage() {
  const { user, quotes, refreshUser } = useApp();
  const [nickname, setNickname] = useState(user.nickname);
  const [msg, setMsg] = useState('');

  const portfolio = user.portfolio || {};
  const stockVal = Object.entries(portfolio).reduce((sum, [sym, pos]) => {
    const q = quotes[sym];
    return sum + (q ? q.price * pos.qty : pos.avgPrice * pos.qty);
  }, 0);
  const totalAsset = user.cash + stockVal;
  const returnRate = ((totalAsset - INITIAL_CASH) / INITIAL_CASH) * 100;
  const tradeCount = (user.trades || []).length;

  const saveNickname = () => {
    if (!nickname.trim() || nickname.length > 20) { setMsg('닉네임은 1~20자로 입력하세요.'); return; }
    updateUser(user.id, { nickname: nickname.trim() });
    refreshUser();
    setMsg('닉네임이 변경되었습니다!');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 22 }}>👤 마이페이지</h2>

      {/* 프로필 */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '28px 28px', marginBottom: 20, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#0ea5e9', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
          {user.isTeacher ? '👩‍🏫' : '🎓'}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{user.nickname}</div>
        <div style={{ fontSize: 13, color: '#64748b' }}>{user.id} · {user.isTeacher ? '선생님' : '학생'}</div>
      </div>

      {/* 통계 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        {[
          ['💰 보유 현금', `₩${fmtPrice(user.cash)}`, '#38bdf8'],
          ['📈 총 자산', `₩${fmtPrice(totalAsset)}`, '#a78bfa'],
          ['📊 수익률', `${returnRate >= 0 ? '+' : ''}${returnRate.toFixed(2)}%`, returnRate >= 0 ? '#f87171' : '#60a5fa'],
          ['🔁 거래 횟수', `${tradeCount}회`, '#34d399'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ color: '#64748b', fontSize: 12, marginBottom: 6 }}>{label}</div>
            <div style={{ color, fontSize: 16, fontWeight: 700, fontFamily: 'IBM Plex Mono' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* 닉네임 변경 */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '22px 24px' }}>
        <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 }}>닉네임 변경</div>
        <div style={{ color: '#64748b', fontSize: 12, marginBottom: 14 }}>랭킹과 화면에 표시되는 이름을 변경할 수 있습니다.</div>
        <div style={{ color: '#475569', fontSize: 12, marginBottom: 10 }}>현재 닉네임: <span style={{ color: '#94a3b8' }}>{user.nickname}</span></div>
        <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="새 닉네임 (최대 20자)"
          style={{ width: '100%', marginBottom: 10, padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
        {msg && <div style={{ marginBottom: 10, fontSize: 13, color: msg.includes('변경') ? '#4ade80' : '#f87171' }}>{msg}</div>}
        <button onClick={saveNickname}
          style={{ width: '100%', padding: '11px 0', background: '#0ea5e9', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>닉네임 저장</button>
      </div>
    </div>
  );
}
