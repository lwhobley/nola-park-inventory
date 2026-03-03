import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import config from './config.environment';

// 1. IMPORT DIRECTLY FROM THE FOLDERS YOU SEE
// We are skipping 'navigation' because it doesn't exist in your list!
import Dashboard from './pages/Dashboard'; 
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// 2. LIVE DATABASE CONNECTION
export const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
const queryClient = new QueryClient();

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {/* This loads the main Dashboard page Claude built */}
          <Dashboard />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
