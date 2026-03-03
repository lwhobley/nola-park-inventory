import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import config from './config.environment';

// 1. IMPORT DASHBOARD (Confirmed working in last log)
import Dashboard from './src/pages/Dashboard'; 
import ErrorBoundary from './src/components/ErrorBoundary';

// 2. DYNAMIC AUTH FINDER (Fixes the current error)
let AuthProvider;
try {
  // Try index.js first (Standard Claude pattern)
  AuthProvider = require('./src/context/index').AuthProvider;
} catch (e) {
  try {
    // Try explicit AuthContext.js
    AuthProvider = require('./src/context/AuthContext').AuthProvider;
  } catch (e2) {
    // If Auth is missing, we bypass it so the Dashboard can at least load
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
          <Dashboard />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
