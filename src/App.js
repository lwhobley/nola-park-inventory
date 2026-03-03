import React, { useState } from 'react';
import './styles/App.css';

export default function App() {
  const [page, setPage] = useState('dashboard');

  return (
    <div className="app">
      <header className="header">
        <h1>NOLA Park Inventory</h1>
      </header>

      <main className="main">
        <div className="card">
          <h2>Welcome!</h2>
          <p>Current Page: {page}</p>
        </div>
      </main>

      <nav className="bottom-nav">
        <button 
          className={`nav-button ${page === 'dashboard' ? 'active' : ''}`}
          onClick={() => setPage('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`nav-button ${page === 'inventory' ? 'active' : ''}`}
          onClick={() => setPage('inventory')}
        >
          Inventory
        </button>
        <button 
          className={`nav-button ${page === 'pos' ? 'active' : ''}`}
          onClick={() => setPage('pos')}
        >
          POS
        </button>
        <button 
          className={`nav-button ${page === 'compliance' ? 'active' : ''}`}
          onClick={() => setPage('compliance')}
        >
          Compliance
        </button>
        <button 
          className={`nav-button ${page === 'settings' ? 'active' : ''}`}
          onClick={() => setPage('settings')}
        >
          Settings
        </button>
      </nav>
    </div>
  );
}
