import { useState, useEffect, createContext, useContext } from 'react';
import { getCurrentUser, logout, refreshCurrentUser } from './utils/db.js';
import AuthPage from './pages/AuthPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TradePage from './pages/TradePage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import StockListPage from './pages/StockListPage.jsx';
import RankingPage from './pages/RankingPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import MyPage from './pages/MyPage.jsx';

export const AppContext = createContext(null);

const NAV = [
  { id: 'dashboard', label: '대시보드', icon: '📊' },
  { id: 'trade', label: '주식 거래', icon: '💹' },
  { id: 'history', label: '거래 내역', icon: '📋' },
  { id: 'stocks', label: '종목 목록', icon: '📈' },
  { id: 'ranking', label: '랭킹', icon: '🏆' },
];

export default function App() {
  const [user, setUser] = useState(() => getCurrentUser());
  const [page, setPage] = useState('dashboard');
  const [quotes, setQuotes] = useState({});
  const [sideOpen, setSideOpen] = useState(true);

  const refreshUser = () => setUser(refreshCurrentUser());

  const handleLogout = () => { logout(); setUser(null); setPage('dashboard'); };

  if (!user) return <AuthPage onLogin={() => { setUser(getCurrentUser()); }} />;

  const navItems = [...NAV];
  if (user.isTeacher) navItems.push({ id: 'admin', label: '관리자', icon: '⚙️' });
  navItems.push({ id: 'mypage', label: '마이페이지', icon: '👤' });

  const pages = { dashboard: Dashboard, trade: TradePage, history: HistoryPage, stocks: StockListPage, ranking: RankingPage, admin: AdminPage, mypage: MyPage };
  const PageComp = pages[page] || Dashboard;

  return (
    <AppContext.Provider value={{ user, refreshUser, quotes, setQuotes, setPage }}>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a' }}>
        {/* 사이드바 */}
        <aside style={{
          width: sideOpen ? 220 : 64,
          minHeight: '100vh',
          background: '#1e293b',
          borderRight: '1px solid #334155',
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.2s',
          flexShrink: 0,
          position: 'sticky', top: 0, height: '100vh',
          overflow: 'hidden',
        }}>
          {/* 로고 */}
          <div style={{ padding: '20px 16px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setSideOpen(o => !o)}>
            <span style={{ fontSize: 22 }}>📈</span>
            {sideOpen && <span style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', color: '#f1f5f9' }}>모의투자</span>}
          </div>
          {/* 유저 */}
          {sideOpen && (
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #334155' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{user.nickname}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{user.isTeacher ? '👩‍🏫 선생님' : '🎓 학생'}</div>
            </div>
          )}
          {/* 네비 */}
          <nav style={{ flex: 1, padding: '8px 0' }}>
            {navItems.map(item => (
              <button key={item.id} onClick={() => setPage(item.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 16px', border: 'none', cursor: 'pointer',
                  background: page === item.id ? '#0ea5e9' + '22' : 'transparent',
                  color: page === item.id ? '#38bdf8' : '#94a3b8',
                  borderLeft: page === item.id ? '3px solid #38bdf8' : '3px solid transparent',
                  fontSize: 14, fontWeight: page === item.id ? 600 : 400,
                  textAlign: 'left', whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {sideOpen && item.label}
              </button>
            ))}
          </nav>
          {/* 로그아웃 */}
          <button onClick={handleLogout}
            style={{
              margin: 12, padding: '10px 14px', borderRadius: 8,
              background: 'transparent', border: '1px solid #334155',
              color: '#64748b', cursor: 'pointer', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
            <span>🚪</span>{sideOpen && '로그아웃'}
          </button>
        </aside>

        {/* 메인 */}
        <main style={{ flex: 1, overflow: 'auto', padding: '28px 32px', minWidth: 0 }}>
          <PageComp />
        </main>
      </div>
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
