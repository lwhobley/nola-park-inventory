import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import config from './config.environment';

// --- THE SMART SELECTOR ---
let Dashboard;
let AuthProvider;
let ErrorBoundary;

try {
  // Try lowercase folders (what you see on GitHub)
  Dashboard = require('./pages/Dashboard').default || require('./pages/dashboard').default;
  AuthProvider = require('./context/AuthContext').AuthProvider;
  ErrorBoundary = require('./components/ErrorBoundary').default;
} catch (e) {
  try {
    // Try Capitalized folders (how Claude often structures them)
    Dashboard = require('./Pages/Dashboard').default || require('./Pages/dashboard').default;
    AuthProvider = require('./Context/AuthContext').AuthProvider;
    ErrorBoundary = require('./Components/ErrorBoundary').default;
  } catch (e2) {
    // Debug Fallback
    Dashboard = () => (
      <div style={{padding: 50, textAlign: 'center', fontFamily: 'sans-serif'}}>
        <h1>📂 Path Troubleshooting</h1>
        <p>I can see the files on GitHub, but Vercel can't resolve the path.</p>
        <p>Please check if there is a <b>src</b> folder hiding these files.</p>
      </div>
    );
  }
}

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
const queryClient = new QueryClient();

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
