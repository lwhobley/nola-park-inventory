import React, { useState } from 'react';
import './styles/App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'pos':
        return <POS />;
      case 'compliance':
        return <Compliance />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1 className="header-title">NOLA Park Inventory</h1>
        <p className="header-subtitle">Inventory Management System</p>
      </header>

      <main className="main">
        {renderPage()}
      </main>

      <nav className="bottom-nav">
        <button
          className={`nav-button ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentPage('dashboard')}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">Dashboard</span>
        </button>
        <button
          className={`nav-button ${currentPage === 'inventory' ? 'active' : ''}`}
          onClick={() => setCurrentPage('inventory')}
        >
          <span className="nav-icon">📦</span>
          <span className="nav-label">Inventory</span>
        </button>
        <button
          className={`nav-button ${currentPage === 'pos' ? 'active' : ''}`}
          onClick={() => setCurrentPage('pos')}
        >
          <span className="nav-icon">💳</span>
          <span className="nav-label">POS</span>
        </button>
        <button
          className={`nav-button ${currentPage === 'compliance' ? 'active' : ''}`}
          onClick={() => setCurrentPage('compliance')}
        >
          <span className="nav-icon">✓</span>
          <span className="nav-label">Compliance</span>
        </button>
        <button
          className={`nav-button ${currentPage === 'settings' ? 'active' : ''}`}
          onClick={() => setCurrentPage('settings')}
        >
          <span className="nav-icon">⚙️</span>
          <span className="nav-label">Settings</span>
        </button>
      </nav>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="page">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Items</h3>
          <p className="stat-value">0</p>
          <p className="stat-label">in inventory</p>
        </div>
        <div className="stat-card">
          <h3>Low Stock</h3>
          <p className="stat-value">0</p>
          <p className="stat-label">items</p>
        </div>
        <div className="stat-card">
          <h3>Out of Stock</h3>
          <p className="stat-value">0</p>
          <p className="stat-label">items</p>
        </div>
        <div className="stat-card">
          <h3>Locations</h3>
          <p className="stat-value">0</p>
          <p className="stat-label">active</p>
        </div>
      </div>

      <div className="card">
        <h2>Welcome to NOLA Park Inventory System</h2>
        <p>
          This is a comprehensive inventory management system designed for New Orleans City Park.
          Use the navigation below to manage your inventory, track POS transactions, monitor compliance,
          and configure your preferences.
        </p>
        <div className="info-box">
          <h3>Getting Started</h3>
          <ul>
            <li><strong>Inventory:</strong> View and manage all inventory items</li>
            <li><strong>POS:</strong> Sync with your point-of-sale system</li>
            <li><strong>Compliance:</strong> Track FSMA 204 compliance and audits</li>
            <li><strong>Settings:</strong> Configure your preferences and options</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="page">
      <h1>Inventory Management</h1>
      
      <div className="card">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search inventory items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="button button-primary">Search</button>
        </div>
      </div>

      <div className="card">
        <h2>Inventory Items</h2>
        <p>No items configured yet.</p>
        <p style={{ fontSize: '12px', color: '#666' }}>
          Connect your database to view and manage inventory items here.
        </p>
      </div>

      <div className="card">
        <h2>Quick Actions</h2>
        <button className="button button-primary">+ Add Item</button>
        <button className="button button-secondary">Import CSV</button>
        <button className="button button-secondary">Export Data</button>
      </div>
    </div>
  );
}

function POS() {
  const [syncStatus, setSyncStatus] = useState('idle');

  const handleSync = () => {
    setSyncStatus('syncing');
    setTimeout(() => setSyncStatus('success'), 2000);
  };

  return (
    <div className="page">
      <h1>POS Integration</h1>

      <div className="card">
        <h2>Point of Sale System</h2>
        <p>Connect and sync your POS system with inventory management.</p>
        
        <div style={{ marginTop: '20px' }}>
          <p><strong>Status:</strong> <span style={{
            color: syncStatus === 'success' ? '#28a745' : syncStatus === 'syncing' ? '#ffc107' : '#999'
          }}>
            {syncStatus === 'idle' ? 'Idle' : syncStatus === 'syncing' ? 'Syncing...' : 'Last sync: Just now'}
          </span></p>
        </div>

        <button 
          className="button button-primary"
          onClick={handleSync}
          disabled={syncStatus === 'syncing'}
        >
          {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      <div className="card">
        <h2>Configuration</h2>
        <div className="form-group">
          <label>POS Provider</label>
          <select className="form-input">
            <option>-- Select Provider --</option>
            <option>Square</option>
            <option>Toast</option>
            <option>TouchBistro</option>
            <option>Other</option>
          </select>
        </div>
        <button className="button button-primary">Connect POS</button>
      </div>
    </div>
  );
}

function Compliance() {
  return (
    <div className="page">
      <h1>Compliance & Auditing</h1>

      <div className="card">
        <h2>FSMA 204 Traceability</h2>
        <div className="compliance-item">
          <h3>✓ Lot Tracking</h3>
          <p>Enabled for {0} items</p>
          <p style={{ fontSize: '12px', color: '#666' }}>Track product lots and expiration dates</p>
        </div>
      </div>

      <div className="card">
        <h2>Documentation</h2>
        <div className="compliance-item">
          <h3>✓ Waste Log</h3>
          <p>All waste documented and tracked</p>
          <p style={{ fontSize: '12px', color: '#666' }}>Maintain records of all waste disposal</p>
        </div>
      </div>

      <div className="card">
        <h2>Audit Trail</h2>
        <div className="compliance-item">
          <h3>✓ Complete History</h3>
          <p>All transactions logged</p>
          <p style={{ fontSize: '12px', color: '#666' }}>Review audit logs for compliance verification</p>
        </div>
      </div>

      <div className="card">
        <button className="button button-primary">Generate Report</button>
        <button className="button button-secondary">Download Audit Log</button>
      </div>
    </div>
  );
}

function Settings() {
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    emailAlerts: true,
    smsAlerts: false,
  });

  const handleChange = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="page">
      <h1>Settings</h1>

      <div className="card">
        <h2>Preferences</h2>
        <div className="settings-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={() => handleChange('notifications')}
            />
            Enable Notifications
          </label>
        </div>
        <div className="settings-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.emailAlerts}
              onChange={() => handleChange('emailAlerts')}
            />
            Email Alerts
          </label>
        </div>
        <div className="settings-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.smsAlerts}
              onChange={() => handleChange('smsAlerts')}
            />
            SMS Alerts
          </label>
        </div>
      </div>

      <div className="card">
        <h2>Theme</h2>
        <div className="form-group">
          <select 
            value={settings.theme}
            onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
            className="form-input"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>
      </div>

      <div className="card">
        <h2>Account</h2>
        <button className="button button-secondary">Change Password</button>
        <button className="button button-secondary">Logout</button>
      </div>

      <div className="card">
        <button className="button button-primary">Save Settings</button>
      </div>
    </div>
  );
}
