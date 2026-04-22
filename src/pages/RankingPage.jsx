import { useState } from 'react';
import { useApp } from '../App.jsx';
import { calcRanking, calcTeamRanking } from '../utils/db.js';
import { fmtPrice, fmtPct } from '../utils/finance.js';

export default function RankingPage() {
  const { quotes } = useApp();
  const [tab, setTab] = useState('individual');

  const ranking = calcRanking(quotes);
  const teamRanking = calcTeamRanking(quotes);

  return (
    <div>
      <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 22 }}>🏆 랭킹</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['individual', '🧑 학생 랭킹'], ['team', '👥 팀 랭킹']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: tab === id ? '#0ea5e9' : '#1e293b', color: tab === id ? '#fff' : '#64748b' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'individual' ? (
        <div>
          <h3 style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600, marginBottom: 14, letterSpacing: '0.06em' }}>수익률 순위</h3>
          {ranking.length === 0
            ? <Empty />
            : (
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
                {ranking.map((u, i) => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: '1px solid #0f172a' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, background: i === 0 ? '#fbbf2422' : i === 1 ? '#94a3b822' : i === 2 ? '#b4540022' : '#1e293b', color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#b45400' : '#64748b' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: '#f1f5f9' }}>{u.nickname}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>총 자산 ₩{fmtPrice(u.totalAsset)}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontFamily: 'IBM Plex Mono', fontWeight: 700, fontSize: 16, color: u.returnRate >= 0 ? '#f87171' : '#60a5fa' }}>
                      {u.returnRate >= 0 ? '+' : ''}{u.returnRate.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      ) : (
        <div>
          <h3 style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600, marginBottom: 14, letterSpacing: '0.06em' }}>팀 랭킹 (평균 수익률 기준)</h3>
          {teamRanking.length === 0
            ? <Empty text="팀이 없습니다." />
            : (
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
                {teamRanking.map((t, i) => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: '1px solid #0f172a' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, background: '#1e293b', color: '#64748b' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: '#f1f5f9' }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{t.memberCount}명</div>
                    </div>
                    <div style={{ textAlign: 'right', fontFamily: 'IBM Plex Mono', fontWeight: 700, fontSize: 16, color: t.avgReturnRate >= 0 ? '#f87171' : '#60a5fa' }}>
                      {t.avgReturnRate >= 0 ? '+' : ''}{t.avgReturnRate.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}

function Empty({ text = '아직 데이터가 없습니다.' }) {
  return <div style={{ textAlign: 'center', padding: '60px 0', color: '#475569' }}><div style={{ fontSize: 36, marginBottom: 12 }}>🏆</div>{text}</div>;
}
