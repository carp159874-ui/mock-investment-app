// ── 간단한 로컬스토리지 기반 DB ─────────────────────────────────────────────
const INITIAL_CASH = 10_000_000;

function getDB() {
  try { return JSON.parse(localStorage.getItem('mockInvDB') || '{}'); } catch { return {}; }
}
function saveDB(db) {
  localStorage.setItem('mockInvDB', JSON.stringify(db));
}

// ── 유저 관련 ────────────────────────────────────────────────────────────────
export function getUsers() { return getDB().users || {}; }
export function getTeams() { return getDB().teams || {}; }
export function getCurrentUser() {
  const id = sessionStorage.getItem('currentUser');
  if (!id) return null;
  return getUsers()[id] || null;
}
export function setCurrentUser(id) { sessionStorage.setItem('currentUser', id); }
export function logout() { sessionStorage.removeItem('currentUser'); }

export function register({ username, password, email, isTeacher, teacherCode, teamId }) {
  const db = getDB();
  if (!db.users) db.users = {};
  if (db.users[username]) return { error: '이미 사용 중인 아이디입니다.' };

  // 선생님 등록 코드 확인
  if (isTeacher && teacherCode !== 'TEACHER2024') return { error: '선생님 코드가 올바르지 않습니다.' };

  db.users[username] = {
    id: username,
    username,
    password,
    email,
    isTeacher: !!isTeacher,
    nickname: username,
    cash: INITIAL_CASH,
    portfolio: {},   // { symbol: { qty, avgPrice, name, market, currency } }
    trades: [],      // [{ date, type, symbol, name, qty, price, total }]
    teamId: teamId || null,
    createdAt: Date.now(),
  };
  saveDB(db);
  return { ok: true };
}

export function login({ username, password }) {
  const users = getUsers();
  const user = users[username];
  if (!user) return { error: '존재하지 않는 아이디입니다.' };
  if (user.password !== password) return { error: '비밀번호가 올바르지 않습니다.' };
  setCurrentUser(username);
  return { ok: true, user };
}

export function updateUser(id, patch) {
  const db = getDB();
  if (!db.users[id]) return;
  db.users[id] = { ...db.users[id], ...patch };
  saveDB(db);
}

export function refreshCurrentUser() {
  const id = sessionStorage.getItem('currentUser');
  if (!id) return null;
  return getUsers()[id] || null;
}

// ── 거래 ─────────────────────────────────────────────────────────────────────
export function executeTrade({ userId, type, symbol, name, market, currency, qty, price }) {
  const db = getDB();
  const user = db.users[userId];
  if (!user) return { error: '유저 없음' };

  const total = price * qty;

  if (type === 'buy') {
    if (user.cash < total) return { error: '잔액이 부족합니다.' };
    user.cash -= total;
    const prev = user.portfolio[symbol];
    if (prev) {
      const newQty = prev.qty + qty;
      user.portfolio[symbol] = {
        ...prev,
        qty: newQty,
        avgPrice: (prev.avgPrice * prev.qty + total) / newQty,
      };
    } else {
      user.portfolio[symbol] = { qty, avgPrice: price, name, market, currency };
    }
  } else {
    const held = user.portfolio[symbol];
    if (!held || held.qty < qty) return { error: '보유 수량이 부족합니다.' };
    user.cash += total;
    const newQty = held.qty - qty;
    if (newQty === 0) delete user.portfolio[symbol];
    else user.portfolio[symbol] = { ...held, qty: newQty };
  }

  user.trades.unshift({
    date: new Date().toLocaleString('ko-KR'),
    type, symbol, name, qty, price, total,
    market, currency,
  });

  saveDB(db);
  return { ok: true };
}

// ── 팀 관련 ──────────────────────────────────────────────────────────────────
export function createTeam(name) {
  const db = getDB();
  if (!db.teams) db.teams = {};
  const id = `team_${Date.now()}`;
  db.teams[id] = { id, name, createdAt: Date.now() };
  saveDB(db);
  return id;
}

export function deleteTeam(id) {
  const db = getDB();
  if (!db.teams) return;
  delete db.teams[id];
  // 소속 학생 팀 해제
  Object.values(db.users || {}).forEach(u => {
    if (u.teamId === id) u.teamId = null;
  });
  saveDB(db);
}

export function assignTeam(userId, teamId) {
  const db = getDB();
  if (db.users[userId]) {
    db.users[userId].teamId = teamId;
    saveDB(db);
  }
}

export function resetUser(userId) {
  const db = getDB();
  if (db.users[userId]) {
    db.users[userId].cash = INITIAL_CASH;
    db.users[userId].portfolio = {};
    db.users[userId].trades = [];
    saveDB(db);
  }
}

// ── 랭킹 계산 ────────────────────────────────────────────────────────────────
export function calcRanking(quotes) {
  const users = getUsers();
  return Object.values(users)
    .filter(u => !u.isTeacher)
    .map(u => {
      const stockVal = Object.entries(u.portfolio).reduce((sum, [sym, pos]) => {
        const q = quotes[sym];
        return sum + (q ? q.price * pos.qty : pos.avgPrice * pos.qty);
      }, 0);
      const totalAsset = u.cash + stockVal;
      const returnRate = ((totalAsset - INITIAL_CASH) / INITIAL_CASH) * 100;
      return { id: u.id, nickname: u.nickname, totalAsset, returnRate, teamId: u.teamId };
    })
    .sort((a, b) => b.returnRate - a.returnRate);
}

export function calcTeamRanking(quotes) {
  const teams = getTeams();
  const ranking = calcRanking(quotes);
  return Object.values(teams).map(team => {
    const members = ranking.filter(u => u.teamId === team.id);
    const avg = members.length ? members.reduce((s, u) => s + u.returnRate, 0) / members.length : 0;
    return { ...team, memberCount: members.length, avgReturnRate: avg };
  }).sort((a, b) => b.avgReturnRate - a.avgReturnRate);
}
