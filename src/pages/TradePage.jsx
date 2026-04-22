import { useState, useEffect } from 'react';
import { useApp } from '../App.jsx';
import { ALL_STOCKS, KOSPI, KOSDAQ, US } from '../utils/stocks.js';
import { fetchQuote, fetchBatch, fmtPrice, fmtPct, pctChange } from '../utils/finance.js';
import { executeTrade, refreshCurrentUser } from '../utils/db.js';

export default function TradePage() {
  const { user, quotes, setQuotes, refreshUser } = useApp();
  const [search, setSearch] = useState('');
  const [marketTab, setMarketTab] = useState('KOSPI');
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [loadingList, setLoadingList] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadedMarkets, setLoadedMarkets] = useState({});

  const marketStocks = { KOSPI, KOSDAQ, US };
  const currency = { KOSPI: '₩', KOSDAQ: '₩', US: '$' };

  // 현재 탭 종목 로드
  useEffect(() => {
    if (loadedMarkets[marketTab]) return;
    setLoadingList(true);
    setProgress(0);
    const stocks = marketStocks[marketTab];
    fetchBatch(stocks.map(s => s.symbol), p => setProgress(p)).then(r => {
      setQuotes(q => ({ ...q, ...r }));
      setLoadedMarkets(m => ({ ...m, [marketTab]: true }));
      setLoadingList(false);
    });
  }, [marketTab]);

  // 선택 종목 갱신
  useEffect(() => {
    if (!selected) return;
    const interval = setInterval(async () => {
      const q = await fetchQuote(selected.symbol);
      if (q) setQuotes(prev => ({ ...prev, [selected.symbol]: q }));
    }, 30000);
    return () => clearInterval(interval);
  }, [selected]);

  const stocks = marketStocks[marketTab];
  const filtered = stocks.filter(s =>
    s.name.includes(search) || s.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const q = selected ? quotes[selected.symbol] : null;
  const held = selected ? (user.portfolio?.[selected.symbol]?.qty || 0) : 0;
  const chg = q ? pctChange(q.price, q.prevClose) : null;
  const cur = currency[marketTab];

  const notify = (m, t = 'success') => {
    setMsg(m); setMsgType(t);
    setTimeout(() => setMsg(''), 3000);
  };

  const trade = (type) => {
    if (!selected || !q) { notify('종목을 먼저 선택하세요.', 'error'); return; }
    if (qty < 1) { notify('수량을 입력하세요.', 'error'); return; }
    const r = executeTrade({ userId: user.id, type, symbol: selected.symbol, name: selected.name, market: marketTab, currency: cur, qty, price: q.price });
    if (r.error) { notify(r.error, 'error'); return; }
    refreshUser();
    notify(`${selected.name} ${qty}주 ${type === 'buy' ? '매수' : '매도'} 완료!`);
    setQty(1);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
      {/* 왼쪽: 종목 목록 */}
      <div>
        <h2 style={h2}>💹 주식 거래</h2>
        {/* 시장 탭 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['KOSPI', 'KOSDAQ', 'US'].map(m => (
            <button key={m} onClick={() => { setMarketTab(m); setSelected(null); }}
              style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: marketTab === m ? '#0ea5e9' : '#1e293b', color: marketTab === m ? '#fff' : '#64748b', transition: 'all 0.2s' }}>
              {m === 'US' ? '🇺🇸 미국' : m === 'KOSPI' ? '🇰🇷 KOSPI' : '🇰🇷 KOSDAQ'}
            </button>
          ))}
          <button onClick={() => { setLoadedMarkets(m => ({ ...m, [marketTab]: false })); }} style={{ marginLeft: 'auto', padding: '8px 14px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: 13 }}>↻ 새로고침</button>
        </div>
        <input placeholder="종목명 또는 티커 검색..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', marginBottom: 12, padding: '10px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
        {loadingList && (
          <div style={{ marginBottom: 10, color: '#64748b', fontSize: 13 }}>
            <div style={{ height: 4, background: '#1e293b', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ width: `${progress}%`, height: '100%', background: '#0ea5e9', borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
            로딩 중... {progress}%
          </div>
        )}

        {/* 종목 테이블 */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
                {['종목명', '현재가', '등락률', '거래량'].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: h === '종목명' ? 'left' : 'right', color: '#64748b', fontSize: 12, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map(s => {
                const sq = quotes[s.symbol];
                const sc = pctChange(sq?.price, sq?.prevClose);
                const isSelected = selected?.symbol === s.symbol;
                return (
                  <tr key={s.symbol} onClick={() => { setSelected(s); setQty(1); }}
                    style={{ borderBottom: '1px solid #0f172a', cursor: 'pointer', background: isSelected ? '#0ea5e922' : 'transparent', transition: 'background 0.15s' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#f1f5f9' }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: '#475569', fontFamily: 'IBM Plex Mono' }}>{s.symbol}</div>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'IBM Plex Mono', fontWeight: 600, color: '#f1f5f9' }}>
                      {sq ? `${cur}${fmtPrice(sq.price)}` : <span style={{ color: '#334155' }}>-</span>}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      {sc != null ? (
                        <span style={{ color: sc > 0 ? '#f87171' : sc < 0 ? '#60a5fa' : '#64748b', background: sc > 0 ? '#f8717122' : sc < 0 ? '#60a5fa22' : 'transparent', padding: '2px 7px', borderRadius: 4, fontSize: 12, fontFamily: 'IBM Plex Mono' }}>
                          {sc > 0 ? '▲' : sc < 0 ? '▼' : ''}{Math.abs(sc).toFixed(2)}%
                        </span>
                      ) : <span style={{ color: '#334155' }}>-</span>}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: 12, color: '#475569', fontFamily: 'IBM Plex Mono' }}>
                      {sq?.volume ? fmtPrice(sq.volume) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 오른쪽: 매매 패널 */}
      <div style={{ position: 'sticky', top: 24 }}>
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 22 }}>
          {selected ? (
            <>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: '#475569', fontFamily: 'IBM Plex Mono' }}>{selected.symbol}</div>
              </div>
              {q ? (
                <div style={{ background: '#0f172a', borderRadius: 10, padding: '16px 18px', marginBottom: 18 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'IBM Plex Mono', color: '#f1f5f9', marginBottom: 4 }}>{cur}{fmtPrice(q.price)}</div>
                  <div style={{ color: chg >= 0 ? '#f87171' : '#60a5fa', fontSize: 14, fontFamily: 'IBM Plex Mono' }}>{chg != null ? fmtPct(chg) : '-'}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, fontSize: 12 }}>
                    {[['전일종가', `${cur}${fmtPrice(q.prevClose)}`], ['고가', `${cur}${fmtPrice(q.high)}`], ['저가', `${cur}${fmtPrice(q.low)}`], ['거래량', fmtPrice(q.volume)]].map(([l, v]) => (
                      <div key={l}><span style={{ color: '#64748b' }}>{l} </span><span style={{ color: '#94a3b8', fontFamily: 'IBM Plex Mono' }}>{v}</span></div>
                    ))}
                  </div>
                </div>
              ) : <div style={{ color: '#475569', marginBottom: 18 }}>시세 조회 중...</div>}

              <div style={{ marginBottom: 16 }}>
                <div style={{ color: '#64748b', fontSize: 12, marginBottom: 8 }}>수량 (주)</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  {[-10, -1].map(d => <button key={d} onClick={() => setQty(v => Math.max(1, v + d))} style={qBtn}>{d}</button>)}
                  <input type="number" value={qty} min={1} onChange={e => setQty(Math.max(1, Number(e.target.value)))}
                    style={{ flex: 1, padding: '9px 0', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', textAlign: 'center', fontSize: 16, fontFamily: 'IBM Plex Mono', outline: 'none' }} />
                  {[1, 10].map(d => <button key={d} onClick={() => setQty(v => v + d)} style={qBtn}>+{d}</button>)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b' }}>
                  <span>현재가 {q ? `${cur}${fmtPrice(q.price)}` : '-'}</span>
                  <span>예상 {q ? `${cur}${fmtPrice(q.price * qty)}` : '-'}</span>
                </div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>보유 수량 {held}주</div>
              </div>

              {msg && <div style={{ marginBottom: 12, padding: '9px 12px', borderRadius: 8, background: msgType === 'error' ? '#7f1d1d22' : '#14532d22', border: `1px solid ${msgType === 'error' ? '#7f1d1d' : '#14532d'}`, color: msgType === 'error' ? '#f87171' : '#4ade80', fontSize: 13 }}>{msg}</div>}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => trade('buy')} style={{ flex: 1, padding: '13px 0', background: '#1d4ed8', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>매수</button>
                <button onClick={() => trade('sell')} style={{ flex: 1, padding: '13px 0', background: '#991b1b', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>매도</button>
              </div>
              <div style={{ marginTop: 14, fontSize: 12, color: '#475569', textAlign: 'center' }}>보유 현금 ₩{fmtPrice(user.cash)}</div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#475569' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📌</div>
              <div>왼쪽 목록에서<br />종목을 선택하세요</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const h2 = { color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 22 };
const qBtn = { width: 38, height: 38, borderRadius: 8, background: '#0f172a', border: '1px solid #334155', color: '#94a3b8', cursor: 'pointer', fontSize: 13, fontFamily: 'IBM Plex Mono' };
