const cache = {};
const CACHE_TTL = 60_000;

async function tryFetch(symbol) {
  const url1 = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d`;
  const url2 = url1.replace('query1', 'query2');

  const attempts = [
    async () => {
      const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url1)}`, { signal: AbortSignal.timeout(8000) });
      const j = await r.json();
      return JSON.parse(j.contents);
    },
    async () => {
      const r = await fetch(`https://corsproxy.io/?${encodeURIComponent(url1)}`, { signal: AbortSignal.timeout(8000) });
      return r.json();
    },
    async () => {
      const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url2)}`, { signal: AbortSignal.timeout(8000) });
      const j = await r.json();
      return JSON.parse(j.contents);
    },
    async () => {
      const r = await fetch(`https://corsproxy.io/?${encodeURIComponent(url2)}`, { signal: AbortSignal.timeout(8000) });
      return r.json();
    },
  ];

  for (const attempt of attempts) {
    try {
      const parsed = await attempt();
      const meta = parsed?.chart?.result?.[0]?.meta;
      if (meta?.regularMarketPrice) return meta;
    } catch {
      // try next proxy
    }
  }
  return null;
}

export async function fetchQuote(symbol) {
  const now = Date.now();
  if (cache[symbol] && now - cache[symbol].ts < CACHE_TTL) {
    return cache[symbol].data;
  }
  const meta = await tryFetch(symbol);
  if (!meta) return cache[symbol]?.data || null;
  const data = {
    symbol,
    price: meta.regularMarketPrice,
    prevClose: meta.previousClose || meta.chartPreviousClose,
    currency: meta.currency,
    volume: meta.regularMarketVolume,
    high: meta.regularMarketDayHigh,
    low: meta.regularMarketDayLow,
    open: meta.regularMarketOpen,
  };
  cache[symbol] = { ts: now, data };
  return data;
}

export async function fetchBatch(symbols, onProgress) {
  const results = {};
  const BATCH = 3;
  for (let i = 0; i < symbols.length; i += BATCH) {
    const batch = symbols.slice(i, i + BATCH);
    const res = await Promise.all(batch.map(fetchQuote));
    res.forEach((r, idx) => { if (r) results[batch[idx]] = r; });
    onProgress && onProgress(Math.min(100, Math.round(((i + BATCH) / symbols.length) * 100)));
    if (i + BATCH < symbols.length) await sleep(500);
  }
  return results;
}

export function pctChange(price, prev) {
  if (!price || !prev) return null;
  return ((price - prev) / prev) * 100;
}

export function fmtPrice(n, digits = 0) {
  if (n == null) return '-';
  return n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function fmtPct(n) {
  if (n == null) return '-';
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
