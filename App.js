import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. CATCH ERRORS BEFORE THEY BLANK THE SCREEN
const ErrorScreen = ({ error }) => (
  <div style={{ padding: 20, backgroundColor: '#fff', color: '#000', fontFamily: 'monospace' }}>
    <h1 style={{ color: 'red' }}>⚠️ Build Error Detected</h1>
    <p><b>Message:</b> {error?.message || 'Unknown Error'}</p>
    <p><b>Stack:</b> {error?.stack?.substring(0, 300)}...</p>
    <button onClick={() => window.location.reload()}>Retry Load</button>
  </div>
);

// 2. IMPORT CONFIG (Safe Check)
let config;
try {
  config = require('./config.environment').default;
} catch (e) {
  config = { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' };
}

export default function App() {
  const [fatalError, setFatalError] = useState(null);

  // Catch global crashes
  useEffect(() => {
    window.onerror = (msg, url, line) => {
      setFatalError({ message: `${msg} at line ${line}` });
    };
  }, []);

  if (fatalError) return <ErrorScreen error={fatalError} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1 style={{ color: '#2e7d32' }}>NOLA Park System</h1>
      <p>Status: 🟢 Deployment Successful</p>
      <hr style={{ width: '80%' }} />
      <div style={{ padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
        <h3>Connection Stats:</h3>
        <p>URL: {config?.SUPABASE_URL ? '✅ Loaded' : '❌ Missing EXPO_PUBLIC_SUPABASE_URL'}</p>
        <p>Key: {config?.SUPABASE_ANON_KEY ? '✅ Loaded' : '❌ Missing EXPO_PUBLIC_SUPABASE_ANON_KEY'}</p>
      </div>
      <p style={{ marginTop: 20, color: '#666' }}>If you see this, the white screen is fixed.</p>
    </div>
  );
}
