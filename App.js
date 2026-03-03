import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import config from './config.environment';

// 1. IMPORT CLAUDE'S CORE ARCHITECTURE
// Based on your transcript, Claude put everything in /src/
import AppNavigator from './src/navigation/AppNavigator'; 
import { AuthProvider } from './src/context/AuthContext';
import ErrorBoundary from './src/components/ErrorBoundary';

// 2. INITIALIZE THE LIVE CONNECTION
export const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
const queryClient = new QueryClient();

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {/* This launches the 8-page NOLA Park Engine */}
          <AppNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
