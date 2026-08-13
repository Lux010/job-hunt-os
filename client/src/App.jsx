import React, { useState, useEffect, useCallback } from 'react';
import { api, getToken, setToken, clearToken } from './api.js';
import Auth from './components/Auth.jsx';
import Dashboard from './components/Dashboard.jsx';
import Board from './components/Board.jsx';
import FitChecker from './components/FitChecker.jsx';
import Settings from './components/Settings.jsx';

const TABS = [
  ['board', 'Board'],
  ['insights', 'Insights'],
  ['fit', 'Fit Checker'],
  ['settings', 'Settings']
];

export default function App() {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('board');

  const refresh = useCallback(async () => {
    try {
      const [j, s] = await Promise.all([api('/jobs'), api('/stats')]);
      setJobs(j);
      setStats(s);
    } catch (err) {
      if (err.message === 'Authentication required' || err.message === 'Invalid or expired session') {
        logout();
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      api('/user/me')
        .then(u => {
          setUser(u);
          refresh();
        })
        .catch(() => logout());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function logout() {
    clearToken();
    setTokenState(null);
    setUser(null);
    setJobs([]);
    setStats(null);
  }

  function onAuth(tokenVal, userVal) {
    setTokenState(tokenVal);
    setUser(userVal);
  }

  if (!token || !user) return <Auth onAuth={onAuth} />;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">JH</span>
          Job Hunt OS <small>— track · follow up · get hired</small>
        </div>
        <nav className="tabs" aria-label="Main">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              className={tab === id ? 'active' : ''}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="topbar-right">
          <span className="user-chip" title={user.email}>{user.email}</span>
          <button className="logout" onClick={logout}>Log out</button>
        </div>
      </header>
      <main>
        {tab === 'board' && (
          <Board jobs={jobs} refresh={refresh} />
        )}
        {tab === 'insights' && (
          <Dashboard stats={stats} jobs={jobs} refresh={refresh} />
        )}
        {tab === 'fit' && (
          <FitChecker />
        )}
        {tab === 'settings' && (
          <Settings user={user} setUser={setUser} refresh={refresh} />
        )}
      </main>
      <footer>
        Job Hunt OS — a monolithic MERN application tracker with AI fit scoring and follow-up reminders.
      </footer>
    </div>
  );
}
