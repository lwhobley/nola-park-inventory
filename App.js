import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. SMART IMPORT: We wrap the Dashboard in a try/catch during the import itself
let Dashboard;
try {
  Dashboard = require('./src/pages/Dashboard').default;
} catch (importError) {
  console.error(importError);
}

const queryClient = new QueryClient();

export default function App() {
  // 2. EMERGENCY UI: If Dashboard failed to even load into memory
  if (!Dashboard) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>📂 Component Error</Text>
        <Text style={styles.text}>The Dashboard file exists, but it has a syntax error or a missing library (like Lucide icons or a Chart library).</Text>
      </SafeAreaView>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView style={styles.container}>
        <Dashboard />
      </SafeAreaView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#d32f2f', marginBottom: 10 },
  text: { textAlign: 'center', color: '#555', lineHeight: 20 }
});
