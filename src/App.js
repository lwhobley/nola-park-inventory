import React from 'react';

// Ultra simple test component - fully mobile optimized
export default function App() {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
    position: 'fixed',
    top: 0,
    left: 0,
  };

  const headerStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '16px',
    textAlign: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid #0056b3',
  };

  const headerH1Style = {
    fontSize: '24px',
    fontWeight: '600',
    margin: '0',
  };

  const mainStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    WebkitOverflowScrolling: 'touch',
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  };

  const h1Style = {
    fontSize: '20px',
    marginBottom: '12px',
    color: '#333',
  };

  const h2Style = {
    fontSize: '18px',
    marginBottom: '8px',
    color: '#333',
  };

  const pStyle = {
    color: '#666',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '0 0 12px 0',
  };

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderTop: '1px solid #ddd',
    padding: '8px 0',
    gap: '0',
  };

  const buttonStyle = {
    flex: 1,
    padding: '12px 8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#999',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'center',
    WebkitAppearance: 'none',
    borderRadius: '0',
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={headerH1Style}>NOLA Park Inventory</h1>
      </header>

      <main style={mainStyle}>
        <div style={cardStyle}>
          <h1 style={h1Style}>Welcome!</h1>
          <p style={pStyle}>
            If you can see this text on your iPhone, React is working! ✓
          </p>
        </div>

        <div style={cardStyle}>
          <h2 style={h2Style}>Quick Test</h2>
          <button 
            style={{ 
              ...buttonStyle, 
              backgroundColor: '#007bff', 
              color: 'white', 
              padding: '10px 16px',
              marginBottom: '8px',
              width: '100%',
            }}
            onClick={() => alert('Button works!')}
          >
            Test Button
          </button>
          <p style={pStyle}>Click the button above to test interactivity.</p>
        </div>

        <div style={cardStyle}>
          <h2 style={h2Style}>Navigation</h2>
          <p style={pStyle}>Use the buttons at the bottom to navigate between sections.</p>
        </div>
      </main>

      <nav style={navStyle}>
        <button style={buttonStyle}>📊 Dashboard</button>
        <button style={buttonStyle}>📦 Inventory</button>
        <button style={buttonStyle}>💳 POS</button>
        <button style={buttonStyle}>✓ Compliance</button>
        <button style={buttonStyle}>⚙️ Settings</button>
      </nav>
    </div>
  );
}
