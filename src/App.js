import React, { useState } from 'react';

export default function App() {
  const [page, setPage] = useState('dashboard');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
      }}>
        <h1 style={{ margin: '0', fontSize: '28px' }}>NOLA Park Inventory</h1>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
      }}>
        {page === 'dashboard' && (
          <div>
            <h2>Dashboard</h2>
            <p>Welcome to NOLA Park Inventory System</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '20px' }}>
              <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
                <p style={{ margin: '0', color: '#999', fontSize: '12px' }}>Total Items</p>
                <h3 style={{ margin: '10px 0 0 0', fontSize: '28px', color: '#007bff' }}>0</h3>
              </div>
              <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
                <p style={{ margin: '0', color: '#999', fontSize: '12px' }}>Low Stock</p>
                <h3 style={{ margin: '10px 0 0 0', fontSize: '28px', color: '#007bff' }}>0</h3>
              </div>
              <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
                <p style={{ margin: '0', color: '#999', fontSize: '12px' }}>Out of Stock</p>
                <h3 style={{ margin: '10px 0 0 0', fontSize: '28px', color: '#007bff' }}>0</h3>
              </div>
              <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
                <p style={{ margin: '0', color: '#999', fontSize: '12px' }}>Locations</p>
                <h3 style={{ margin: '10px 0 0 0', fontSize: '28px', color: '#007bff' }}>0</h3>
              </div>
            </div>
          </div>
        )}

        {page === 'inventory' && (
          <div>
            <h2>Inventory Management</h2>
            <p>Manage your inventory items here</p>
            <input type="text" placeholder="Search items..." style={{ width: '100%', padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
          </div>
        )}

        {page === 'pos' && (
          <div>
            <h2>POS Integration</h2>
            <p>Sync your point-of-sale system</p>
            <button onClick={() => alert('Sync started')} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>Sync Now</button>
          </div>
        )}

        {page === 'compliance' && (
          <div>
            <h2>Compliance</h2>
            <p>FSMA 204 Compliance Tracking</p>
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
              <h3 style={{ color: '#28a745' }}>✓ Lot Tracking</h3>
              <p>Enabled for 0 items</p>
            </div>
          </div>
        )}

        {page === 'settings' && (
          <div>
            <h2>Settings</h2>
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                <input type="checkbox" defaultChecked /> Enable Notifications
              </label>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                <input type="checkbox" defaultChecked /> Email Alerts
              </label>
              <button style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>Save Settings</button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        backgroundColor: 'white',
        borderTop: '1px solid #ddd',
        padding: '0',
      }}>
        {['dashboard', 'inventory', 'pos', 'compliance', 'settings'].map(name => (
          <button
            key={name}
            onClick={() => setPage(name)}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              backgroundColor: page === name ? '#f0f0f0' : 'white',
              borderBottom: page === name ? '3px solid #007bff' : 'none',
              color: page === name ? '#007bff' : '#999',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
