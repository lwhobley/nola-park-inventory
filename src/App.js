import React, { useState, useEffect } from 'react';
import './styles/App.css';

// Web Dashboard Component
function Dashboard() {
  return (
    <div className="page">
      <h1>Dashboard</h1>
      <div className="card">
        <h2>Welcome to NOLA Park Inventory</h2>
        <p>Manage your inventory efficiently with real-time tracking.</p>
        <div className="stats">
          <div className="stat">
            <h3>Total Items</h3>
            <p className="stat-value">0</p>
          </div>
          <div className="stat">
            <h3>Low Stock</h3>
            <p className="stat-value">0</p>
          </div>
          <div className="stat">
            <h3>Out of Stock</h3>
            <p className="stat-value">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Web Inventory Component
function Inventory() {
  return (
    <div className="page">
      <h1>Inventory</h1>
      <div className="card">
        <h2>Inventory Management</h2>
        <p>Track and manage all inventory items.</p>
        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          <p>No inventory items yet.</p>
          <p style={{ fontSize: '12px', color: '#666' }}>
            Configure your database connection to see items here.
          </p>
        </div>
      </div>
    </div>
  );
}

// Web POS Component
function POS() {
  return (
    <div className="page">
      <h1>POS Integration</h1>
      <div className="card">
        <h2>Point of Sale System</h2>
        <p>Integrate with your POS system for real-time sales data.</p>
        <button style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Sync Now
        </button>
      </div>
    </div>
  );
}

// Web Compliance Component
function Compliance() {
  return (
    <div className="page">
      <h1>Compliance & Auditing</h1>
      <div className="card">
        <h2>Compliance Tracking</h2>
        <div style={{ marginTop: '20px' }}>
          <div style={{ padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '4px', marginBottom: '10px' }}>
            <h3>FSMA 204 Compliance</h3>
            <p>✓ Tracking enabled for 0 items</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '4px', marginBottom: '10px' }}>
            <h3>Waste Documentation</h3>
            <p>✓ All waste logged and documented</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
            <h3>Audit Logs</h3>
            <p>✓ Complete audit trail available</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Web Equipment Component
function Equipment() {
  return (
    <div className="page">
      <h1>Equipment Maintenance</h1>
      <div className="card">
        <h2>Maintenance Schedule</h2>
        <p>Track equipment maintenance schedules and history.</p>
        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          <p>No equipment records yet.</p>
        </div>
      </div>
    </div>
  );
}

// Web Settings Component
function Settings() {
  return (
    <div className="page">
      <h1>Settings</h1>
      <div className="card">
        <h2>User Preferences</h2>
        <div style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label>
              <input type="checkbox" defaultChecked /> Enable Notifications
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label>
              <input type="checkbox" defaultChecked /> Email Alerts
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label>
              <input type="checkbox" /> SMS Alerts
            </label>
          </div>
          <button style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

// Main App Component
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
      case 'equipment':
        return <Equipment />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>NOLA Park Inventory Engine</h1>
      </header>

      <main className="main">
        {renderPage()}
      </main>

      <nav className="bottom-nav">
        <button
          className={`nav-button ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentPage('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`nav-button ${currentPage === 'inventory' ? 'active' : ''}`}
          onClick={() => setCurrentPage('inventory')}
        >
          Inventory
        </button>
        <button
          className={`nav-button ${currentPage === 'pos' ? 'active' : ''}`}
          onClick={() => setCurrentPage('pos')}
        >
          POS
        </button>
        <button
          className={`nav-button ${currentPage === 'compliance' ? 'active' : ''}`}
          onClick={() => setCurrentPage('compliance')}
        >
          Compliance
        </button>
        <button
          className={`nav-button ${currentPage === 'settings' ? 'active' : ''}`}
          onClick={() => setCurrentPage('settings')}
        >
          Settings
        </button>
      </nav>
    </div>
  );
}
