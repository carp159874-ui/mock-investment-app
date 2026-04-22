import { useEffect, useState } from 'react';
import { useApp } from '../App.jsx';
import { fetchBatch, fmtPrice, fmtPct, pctChange } from '../utils/finance.js';
import { ALL_STOCKS } from '../utils/stocks.js';

const INITIAL_CASH = 10_000_000;

export default function Dashboard() {
  const { user, quotes, setQuotes, setPage } = useApp();
  const [loading, setLoading] = useState(false);

  // 인기 종목 (고정 5개)
  const popular = ['005930.KS', '000660.KS', 'AAPL', 'NVDA', 'TSLA'];

  useEffect(() => {
    const missing = popular.filter(s => !quotes[s]);
    if (missing.length === 0) return;
    setLoading(true);
    fetchBatch(missing).then(r => { setQuotes(q => ({ ...q, ...r })); setLoading(false); });
  }, []);

  const portfolio = user.portfolio || {};
  const stockVal = Object.entries(portfolio).reduce((sum, [sym, pos]) => {
    const q = quotes[sym];
    return sum + (q ? q.price * pos.qty : pos.avgPrice * pos.qty);
  }, 0);
  const totalAsset = user.cash + stockVal;
  const returnAmt = totalAsset - INITIAL_CASH;
  const returnRate = (returnAmt / INITIAL_CASH) * 100;

  const cards = [
    { label: '보유 현금', value: `₩${fmtPrice(user.cash)}`, color: '#38bdf8' },
    { label: '주식 평가액', value: `₩${fmtPrice(stockVal)}`, color: '#a78bfa' },
    { label: '총 자산', value: `₩${fmtPrice(totalAsset)}`, color: '#34d399' },
    { label: '총 수익률', value: `${fmtPct(returnRate)} (${returnAmt >= 0 ? '+' : ''}₩${fmtPrice(returnAmt)})`, color: returnRate >= 0 ? '#f87171' : '#60a5fa' },
  ];

  return (
    <div>
      <h2 style={h2}>📊 대시보드</h2>

      {/* 요약 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '20px 22px' }}>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>{c.label}</div>
            <div style={{ color: c.color, fontSize: 20, fontWeight: 700, fontFamily: 'IBM Plex Mono' }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* 보유 종목 */}
        <div style={card}>
          <div style={cardTitle}>보유 종목</div>
          {Object.keys(portfolio).length === 0
            ? <div style={{ color: '#475569', textAlign: 'center', padding: '24px 0', fontSize: 14 }}>보유 종목이 없습니다.<br /><span style={{ color: '#38bdf8', cursor: 'pointer' }} onClick={() => setPage('trade')}>주식 거래하러 가기 →</span></div>
            : Object.entries(portfolio).map(([sym, pos]) => {
                const q = quotes[sym];
                const ret = q ? (q.price - pos.avgPrice) * pos.qty : 0;
                const pct = q ? ((q.price - pos.avgPrice) / pos.avgPrice) * 100 : 0;
                return (
                  <div key={sym} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1e293b' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{pos.name}</div>
                      <div style={{ color: '#64748b', fontSize: 12 }}>{pos.qty}주 · 평균 {pos.currency}{fmtPrice(pos.avgPrice)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: pct >= 0 ? '#f87171' : '#60a5fa', fontWeight: 600, fontSize: 14, fontFamily: 'IBM Plex Mono' }}>{fmtPct(pct)}</div>
                      <div style={{ color: '#64748b', fontSize: 12 }}>{ret >= 0 ? '+' : ''}{pos.currency}{fmtPrice(ret)}</div>
                    </div>
                  </div>
                );
              })
          }
        </div>

        {/* 인기 종목 */}
        <div style={card}>
          <div style={cardTitle}>인기 종목</div>
          {loading ? <div style={{ color: '#475569', fontSize: 13 }}>시세 조회 중...</div>
            : popular.map(sym => {
                const info = ALL_STOCKS.find(s => s.symbol === sym);
                const q = quotes[sym];
                if (!q || !info) return null;
                const chg = pctChange(q.price, q.prevClose);
                return (
                  <div key={sym} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1e293b', cursor: 'pointer' }}
                    onClick={() => setPage('trade')}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{info.name}</div>
                      <div style={{ color: '#64748b', fontSize: 12 }}>{sym}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 15, fontFamily: 'IBM Plex Mono' }}>{info.currency}{fmtPrice(q.price)}</div>
                      <div style={{ color: chg >= 0 ? '#f87171' : '#60a5fa', fontSize: 13, fontFamily: 'IBM Plex Mono' }}>{fmtPct(chg)}</div>
                    </div>
                  </div>
                );
              })
          }
        </div>
      </div>
    </div>
  );
}

const h2 = { color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 22 };
const card = { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '20px 22px' };
const cardTitle = { color: '#94a3b8', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 14 };
