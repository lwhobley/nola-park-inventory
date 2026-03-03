import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import config from './config.environment';

// 1. TRY ALL POSSIBLE PATHS FOR CLAUDE'S DASHBOARD
let AppNavigation;
let ErrorBoundary;

try {
  // Try Root Path first
  AppNavigation = require('./navigation/AppNavigation').default;
  ErrorBoundary = require('./components/ErrorBoundary').default;
} catch (e) {
  try {
    // Try SRC Path second
    AppNavigation = require('./src/navigation/AppNavigation').default;
    ErrorBoundary = require('./src/components/ErrorBoundary').default;
  } catch (e2) {
    // Fallback if both fail
    AppNavigation = () => (
      <div style={{padding: 20, textAlign: 'center'}}>
        <h1>📂 File Path Error</h1>
        <p>Could not find navigation/AppNavigation in / or /src</p>
        <p>Please check your GitHub folder names.</p>
      </div>
    );
    ErrorBoundary = ({children}) => children;
  }
}

// 2. DATABASE CONNECTION
export const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
const queryClient = new QueryClient();

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppNavigation />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
