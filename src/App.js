import React from 'react';

export default function App() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#fff',
    }}>
      <div style={{
        padding: '20px',
        backgroundColor: '#007bff',
        color: 'white',
      }}>
        <h1 style={{ margin: '0', fontSize: '24px' }}>NOLA Park</h1>
      </div>
      
      <div style={{ padding: '20px', flex: 1 }}>
        <h2 style={{ color: '#333' }}>Hello from React!</h2>
        <p style={{ color: '#666' }}>If you see this, the app is working.</p>
      </div>
      
      <div style={{
        display: 'flex',
        borderTop: '1px solid #ddd',
      }}>
        <button style={{
          flex: 1,
          padding: '12px',
          border: 'none',
          backgroundColor: '#f0f0f0',
          color: '#333',
          fontSize: '12px',
        }}>Dashboard</button>
        <button style={{
          flex: 1,
          padding: '12px',
          border: 'none',
          backgroundColor: '#f0f0f0',
          color: '#333',
          fontSize: '12px',
        }}>Inventory</button>
        <button style={{
          flex: 1,
          padding: '12px',
          border: 'none',
          backgroundColor: '#f0f0f0',
          color: '#333',
          fontSize: '12px',
        }}>POS</button>
      </div>
    </div>
  );
}
