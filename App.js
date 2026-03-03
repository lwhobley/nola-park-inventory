import React, { Suspense } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import config from './config.environment';

// 1. Direct Imports
import Dashboard from './src/pages/Dashboard';

// 2. Initialize Supabase with the variables Vercel is using
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Don't hang if the network is slow
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={{marginTop: 10}}>Connecting to NOLA Park Database...</Text>
        </View>
      }>
        <Dashboard />
      </Suspense>
    </QueryClientProvider>
  );
}
