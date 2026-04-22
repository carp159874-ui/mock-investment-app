import { useApp } from '../App.jsx';
import { fmtPrice, fmtPct } from '../utils/finance.js';

export default function HistoryPage() {
  const { user } = useApp();
  const trades = user.trades || [];

  return (
    <div>
      <h2 style={h2}>📋 거래 내역</h2>
      {trades.length === 0
        ? <Empty icon="📭" text="거래 내역이 없습니다." />
        : (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
                  {['일시', '구분', '종목', '수량', '단가', '총액'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: h === '종목' || h === '일시' ? 'left' : 'right', color: '#64748b', fontSize: 12, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.map((t, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #0f172a' }}>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#64748b' }}>{t.date}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: t.type === 'buy' ? '#1d4ed822' : '#99183222', color: t.type === 'buy' ? '#60a5fa' : '#f87171' }}>
                        {t.type === 'buy' ? '매수' : '매도'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: '#475569' }}>{t.symbol}</div>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'IBM Plex Mono' }}>{t.qty}주</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'IBM Plex Mono', fontSize: 13 }}>{t.currency}{fmtPrice(t.price)}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'IBM Plex Mono', fontWeight: 600 }}>{t.currency}{fmtPrice(t.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}

const h2 = { color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 22 };
function Empty({ icon, text }) {
  return <div style={{ textAlign: 'center', padding: '60px 0', color: '#475569' }}><div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>{text}</div>;
}
