import { useState, useEffect } from 'react';
import { KOSPI, KOSDAQ, US } from '../utils/stocks.js';
import { useApp } from '../App.jsx';
import { fetchBatch, fmtPrice, fmtPct, pctChange } from '../utils/finance.js';

export default function StockListPage() {
  const { quotes, setQuotes } = useApp();
  const [tab, setTab] = useState('KOSPI');
  const [search, setSearch] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState({});

  const markets = { KOSPI, KOSDAQ, US };
  const currency = { KOSPI: '₩', KOSDAQ: '₩', US: '$' };

  useEffect(() => {
    if (loaded[tab]) return;
    setLoading(true);
    fetchBatch(markets[tab].map(s => s.symbol), p => setProgress(p)).then(r => {
      setQuotes(q => ({ ...q, ...r }));
      setLoaded(l => ({ ...l, [tab]: true }));
      setLoading(false);
    });
  }, [tab]);

  const filtered = markets[tab].filter(s =>
    s.name.includes(search) || s.symbol.toLowerCase().includes(search.toLowerCase())
  );
  const cur = currency[tab];

  return (
    <div>
      <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 22 }}>📈 전체 종목</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['KOSPI', 'KOSDAQ', 'US'].map(m => (
          <button key={m} onClick={() => { setTab(m); setSearch(''); }}
            style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: tab === m ? '#0ea5e9' : '#1e293b', color: tab === m ? '#fff' : '#64748b' }}>
            {m === 'US' ? '🇺🇸 미국' : `🇰🇷 ${m}`}
          </button>
        ))}
      </div>
      <input placeholder="종목 검색..." value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', marginBottom: 12, padding: '10px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
      {loading && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ height: 4, background: '#1e293b', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#0ea5e9', borderRadius: 2, transition: 'width 0.3s' }} />
          </div>
          <div style={{ color: '#64748b', fontSize: 13 }}>종목 데이터 불러오는 중... {progress}%</div>
        </div>
      )}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
              <th style={th('left')}>#</th>
              <th style={th('left')}>종목명</th>
              <th style={th('right')}>현재가</th>
              <th style={th('right')}>등락률</th>
              <th style={th('right')}>고가</th>
              <th style={th('right')}>저가</th>
              <th style={th('right')}>거래량</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => {
              const q = quotes[s.symbol];
              const chg = pctChange(q?.price, q?.prevClose);
              return (
                <tr key={s.symbol} style={{ borderBottom: '1px solid #0f172a' }}>
                  <td style={{ padding: '10px 14px', color: '#475569', fontSize: 13, fontFamily: 'IBM Plex Mono' }}>{i + 1}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#f1f5f9' }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: '#475569', fontFamily: 'IBM Plex Mono' }}>{s.symbol}</div>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'IBM Plex Mono', fontWeight: 600, color: '#f1f5f9' }}>
                    {q ? `${cur}${fmtPrice(q.price)}` : '-'}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                    {chg != null ? (
                      <span style={{ color: chg > 0 ? '#f87171' : chg < 0 ? '#60a5fa' : '#64748b', fontSize: 13, fontFamily: 'IBM Plex Mono' }}>
                        {chg > 0 ? '▲' : '▼'}{Math.abs(chg).toFixed(2)}%
                      </span>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: 13, fontFamily: 'IBM Plex Mono', color: '#f87171' }}>{q ? `${cur}${fmtPrice(q.high)}` : '-'}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: 13, fontFamily: 'IBM Plex Mono', color: '#60a5fa' }}>{q ? `${cur}${fmtPrice(q.low)}` : '-'}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: 12, color: '#475569', fontFamily: 'IBM Plex Mono' }}>{q?.volume ? fmtPrice(q.volume) : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
const th = (align) => ({ padding: '11px 14px', textAlign: align, color: '#64748b', fontSize: 12, fontWeight: 600 });
