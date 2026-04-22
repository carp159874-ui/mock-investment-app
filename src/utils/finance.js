// Yahoo Finance v8 API → allorigins CORS 프록시
const cache = {};
const CACHE_TTL = 60_000; // 1분 캐시

export async function fetchQuote(symbol) {
  const now = Date.now();
  if (cache[symbol] && now - cache[symbol].ts < CACHE_TTL) {
    return cache[symbol].data;
  }
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d`;
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxy, { signal: AbortSignal.timeout(8000) });
    const json = await res.json();
    const parsed = JSON.parse(json.contents);
    const meta = parsed?.chart?.result?.[0]?.meta;
    if (!meta) return null;
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
  } catch {
    return cache[symbol]?.data || null;
  }
}

export async function fetchBatch(symbols, onProgress) {
  const results = {};
  const BATCH = 5;
  for (let i = 0; i < symbols.length; i += BATCH) {
    const batch = symbols.slice(i, i + BATCH);
    const res = await Promise.all(batch.map(fetchQuote));
    res.forEach((r, idx) => { if (r) results[batch[idx]] = r; });
    onProgress && onProgress(Math.min(100, Math.round(((i + BATCH) / symbols.length) * 100)));
    if (i + BATCH < symbols.length) await sleep(200);
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
