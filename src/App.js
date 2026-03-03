import React from 'react';

// Ultra simple test component
export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#007bff' }}>NOLA Park Inventory</h1>
      <p>If you see this, React is working!</p>
      <button onClick={() => alert('Button works!')}>Test Button</button>
      
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <h2>Navigation</h2>
        <p>
          <button style={{ marginRight: '10px', padding: '8px 16px' }}>Dashboard</button>
          <button style={{ marginRight: '10px', padding: '8px 16px' }}>Inventory</button>
          <button style={{ marginRight: '10px', padding: '8px 16px' }}>POS</button>
          <button style={{ marginRight: '10px', padding: '8px 16px' }}>Compliance</button>
          <button style={{ padding: '8px 16px' }}>Settings</button>
        </p>
      </div>
    </div>
  );
}
