import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';

// 1. IMPORT CLAUDE'S COMPONENTS (No 'src' needed)
import AppNavigation from './navigation/AppNavigation';
import ErrorBoundary from './components/ErrorBoundary';
import config from './config.environment';

// 2. THE WORKING DATABASE CONNECTION
export const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
const queryClient = new QueryClient();

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {/* This launches Claude's full dashboard system */}
        <AppNavigation />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
