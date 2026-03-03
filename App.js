import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import config from './config.environment';

// --- DYNAMIC PATH FINDER ---
let AppNavigator;
let AuthProvider;
let ErrorBoundary;

try {
  // 1. Try Root Path (No 'src')
  AppNavigator = require('./navigation/AppNavigator').default;
  AuthProvider = require('./context/AuthContext').AuthProvider;
  ErrorBoundary = require('./components/ErrorBoundary').default;
} catch (e) {
  try {
    // 2. Try 'src' Path
    AppNavigator = require('./src/navigation/AppNavigator').default;
    AuthProvider = require('./src/context/AuthContext').AuthProvider;
    ErrorBoundary = require('./src/components/ErrorBoundary').default;
  } catch (e2) {
    // 3. Emergency Fallback
    AppNavigator = () => (
      <div style={{padding: 50, fontFamily: 'sans-serif'}}>
        <h1>📂 Navigation Missing</h1>
        <p>Build successful, but cannot find: <b>navigation/AppNavigator.js</b></p>
        <p>Please check your GitHub folder names.</p>
      </div>
    );
    ErrorBoundary = ({children}) => children;
    AuthProvider = ({children}) => children;
  }
}

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
const queryClient = new QueryClient();

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
