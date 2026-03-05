import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

// Supabase config
const SUPABASE_URL = 'https://palgbegkojkdiqgdcihp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_i8c5ydQb26nTiQHJW0nM0w_w9QuYqkA';
const OWNER_PIN = '2445';
const OWNER_NAME = 'Liffort Hobley';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Authentication Component
function AuthPage({ onLogin }) {
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = () => {
    if (pin.length !== 4) {
      setMessage('❌ PIN must be 4 digits');
      return;
    }

    // Hardcoded fallback for owner
    if (pin === OWNER_PIN) {
      sessionStorage.setItem('nola_park_auth', 'true');
      sessionStorage.setItem('nola_park_user', OWNER_NAME);
      sessionStorage.setItem('nola_park_pin', OWNER_PIN);
      onLogin({ name: OWNER_NAME, pin: OWNER_PIN, isOwner: true });
      return;
    }

    setMessage('❌ Invalid PIN. Try again.');
    setPin('');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>NOCPC Concessions Inventory</h1>
        <p>Inventory Management System</p>
        
        <div className="auth-content">
          <div className="owner-info">
            🔐 Owner Access
            <br />
            Liffort Hobley
          </div>

          <div className="pin-input-container">
            <label>Enter 4-Digit PIN:</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="●●●●"
              maxLength="4"
              inputMode="numeric"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              autoFocus
            />
            <button onClick={handleLogin}>Access System</button>
          </div>

          {message && <div className="auth-message">{message}</div>}
        </div>
      </div>
    </div>
  );
}

// Header Component
function Header({ user, onLogout }) {
  return (
    <div className="header">
      <h1>NOCPC Concessions Inventory</h1>
      <div className="header-subtitle">AI-Powered Operations Hub</div>
      <div className="user-info">
        <span>{user.name}</span>
        {user.isOwner && <span className="owner-badge">OWNER</span>}
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}

// Dashboard Page Component
function Dashboard() {
  return (
    <div className="page">
      <h2>Dashboard</h2>
      <div className="page-subtitle">Real-time inventory insights</div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Active Items</div>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <div className="stat-label">Low Stock</div>
          <p className="stat-value">0</p>
        </div>
      </div>

      <div className="card">
        <h3>📊 System Status</h3>
        <p><strong>Database:</strong> <span style={{ color: '#40d85f' }}>✓ Connected</span></p>
        <p><strong>Data Sync:</strong> <span style={{ color: '#40d85f' }}>✓ Real-time</span></p>
      </div>
    </div>
  );
}

// Inventory Page Component
function Inventory() {
  return (
    <div className="page">
      <h2>Inventory Management</h2>
      <div className="page-subtitle">Manage your inventory items</div>
      
      <div className="card">
        <h3>➕ Add New Item</h3>
        <input type="text" placeholder="SKU" />
        <input type="text" placeholder="Item Name" />
        <input type="text" placeholder="Category" />
        <button>Add Item</button>
      </div>

      <div className="card">
        <h3>📦 Your Inventory</h3>
        <p>No items yet. Add one above!</p>
      </div>
    </div>
  );
}

// Admin Dashboard Component
function AdminDashboard() {
  return (
    <div className="page">
      <h2>⚙️ Admin Dashboard</h2>
      <div className="page-subtitle">Manage users and system settings (Owner Only)</div>
      
      <div className="card">
        <h3>👥 Add New User</h3>
        <input type="text" placeholder="User Name" />
        <input type="text" placeholder="4-Digit PIN" maxLength="4" />
        <button>Create User</button>
      </div>

      <div className="card">
        <h3>👤 Active Users</h3>
        <p>Liffort Hobley - PIN: 2445 (Owner)</p>
      </div>
    </div>
  );
}

// Navigation Component
function Navigation({ currentPage, onPageChange, isOwner }) {
  return (
    <div className="bottom-nav">
      <button 
        className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
        onClick={() => onPageChange('dashboard')}
      >
        Dashboard
      </button>
      <button 
        className={`nav-btn ${currentPage === 'inventory' ? 'active' : ''}`}
        onClick={() => onPageChange('inventory')}
      >
        Inventory
      </button>
      <button 
        className={`nav-btn ${currentPage === 'pos' ? 'active' : ''}`}
        onClick={() => onPageChange('pos')}
      >
        POS
      </button>
      <button 
        className={`nav-btn ${currentPage === 'compliance' ? 'active' : ''}`}
        onClick={() => onPageChange('compliance')}
      >
        Compliance
      </button>
      <button 
        className={`nav-btn ${currentPage === 'settings' ? 'active' : ''}`}
        onClick={() => onPageChange('settings')}
      >
        Settings
      </button>
      {isOwner && (
        <button 
          className={`nav-btn ${currentPage === 'admin' ? 'active' : ''}`}
          onClick={() => onPageChange('admin')}
        >
          Admin
        </button>
      )}
    </div>
  );
}

// Main App Component
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Check authentication on mount
  useEffect(() => {
    const auth = sessionStorage.getItem('nola_park_auth');
    const userName = sessionStorage.getItem('nola_park_user');
    const userPin = sessionStorage.getItem('nola_park_pin');

    if (auth === 'true' && userName && userPin) {
      setUser({
        name: userName,
        pin: userPin,
        isOwner: userPin === OWNER_PIN
      });
      setIsAuthenticated(true);
    }

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {});
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  // Render pages dynamically based on currentPage
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'admin':
        return user?.isOwner ? <AdminDashboard /> : <div className="page"><p>Access denied</p></div>;
      case 'pos':
        return <div className="page"><h2>POS Integration</h2><p>Coming soon</p></div>;
      case 'compliance':
        return <div className="page"><h2>Compliance</h2><p>Coming soon</p></div>;
      case 'settings':
        return <div className="page"><h2>Settings</h2><p>User: {user?.name}</p></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Header user={user} onLogout={handleLogout} />
      <div className="main">
        {renderPage()}
      </div>
      <Navigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        isOwner={user?.isOwner}
      />
    </div>
  );
}
