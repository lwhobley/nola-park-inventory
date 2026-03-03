import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import config from './config.environment';
import { createClient } from '@supabase/supabase-js';

// 1. IMPORT CLAUDE'S COMPONENTS
// If these are in a 'src' folder, add 'src/' to the beginning of the paths below
import AppNavigation from './navigation/AppNavigation'; 
import ErrorBoundary from './components/ErrorBoundary';

// 2. THE WORKING CONNECTION
export const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
const queryClient = new QueryClient();

export default function App() {
  return (
    <ErrorBoundary fallback={<div><h1>Dashboard Load Error</h1><p>Check Vercel Logs</p></div>}>
      <QueryClientProvider client={queryClient}>
        {/* This launches the full Claude dashboard system */}
        <AppNavigation />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
