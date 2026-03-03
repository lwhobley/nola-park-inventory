import React from 'react';
import { View, Text } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import config from './config.environment';

// --- ATTEMPT IMPORTS ---
let Dashboard;
let AuthProvider;

try {
  Dashboard = require('./src/pages/Dashboard').default;
  // Claude often exports AuthProvider as a named export or default
  const AuthModule = require('./src/context/index');
  AuthProvider = AuthModule.AuthProvider || AuthModule.default;
} catch (e) {
  console.log("Import Error:", e);
}

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
const queryClient = new QueryClient();

// Simple Error Catcher
class GlobalError extends React.Component {
  state = { hasError: false, msg: '' };
  static getDerivedStateFromError(error) { return { hasError: true, msg: error.message }; }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>⚠️ Dashboard Crash</Text>
          <Text style={{ marginTop: 10, color: 'red' }}>{this.state.msg}</Text>
          <Text style={{ marginTop: 20, fontSize: 12 }}>Check your Supabase URL & Keys in Vercel</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <GlobalError>
      <QueryClientProvider client={queryClient}>
        {Dashboard ? <Dashboard /> : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Loading NOLA Park Engine...</Text>
            <Text style={{fontSize: 10, color: 'gray'}}>If this stays white, check src/pages/Dashboard.js</Text>
          </View>
        )}
      </QueryClientProvider>
    </GlobalError>
  );
}
