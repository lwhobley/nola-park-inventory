import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import config from './config.environment';

// 1. Initialize Supabase
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
const queryClient = new QueryClient();

// 2. The Real Dashboard Component
function InventoryDashboard() {
  const { data: inventory, isLoading, error } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      // This pulls from your 'location_inventory' table
      const { data, error } = await supabase.from('location_inventory').select('*');
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <p>Loading inventory data...</p>;
  if (error) return <p style={{color: 'red'}}>Error fetching data: {error.message}</p>;

  return (
    <div style={styles.container}>
      <h2>📦 Park Inventory Dashboard</h2>
      <table style={styles.table}>
        <thead>
          <tr style={styles.row}>
            <th>Item</th>
            <th>Location</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {inventory?.map((item) => (
            <tr key={item.id} style={styles.row}>
              <td>{item.item_name || 'Unnamed Item'}</td>
              <td>{item.location_name || 'Main'}</td>
              <td style={{ color: item.quantity < 5 ? 'red' : 'green' }}>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 3. Root App
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={styles.appRoot}>
        <header style={styles.header}>
          <h1>NOLA Park Operations</h1>
          <span style={styles.badge}>Live Connection: ✅</span>
        </header>
        <InventoryDashboard />
      </div>
    </QueryClientProvider>
  );
}

const styles = {
  appRoot: { fontFamily: 'sans-serif', backgroundColor: '#f5f5f5', minHeight: '100vh' },
  header: { backgroundColor: '#2e7d32', color: 'white', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  badge: { backgroundColor: '#4caf50', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' },
  container: { padding: '20px' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  row: { borderBottom: '1px solid #eee', textAlign: 'left', padding: '10px' }
};
