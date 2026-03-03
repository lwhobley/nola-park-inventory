import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import config from './config.environment';

// 1. IMPORT DIRECTLY FROM YOUR SRC FOLDERS
import Dashboard from './src/pages/Dashboard'; 
import { AuthProvider } from './src/context/AuthContext';
import ErrorBoundary from './src/components/ErrorBoundary';

// 2. CONNECT TO SUPABASE
export const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
const queryClient = new QueryClient();

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {/* This launches the actual Dashboard Claude built */}
          <Dashboard />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
