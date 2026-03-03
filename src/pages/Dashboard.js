import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import config from '../../config.environment';

// Initialize Supabase for the Dashboard
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

export default function Dashboard() {
  const [stats, setStats] = useState({ lowStock: 0, totalLocations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // 1. Get Low Stock Count from your 'inventory_items' table
        const { count: lowCount } = await supabase
          .from('inventory_items')
          .select('*', { count: 'exact', head: true })
          .lt('current_stock', 10); // Adjust '10' based on your alert level

        // 2. Get Location Count
        const { count: locCount } = await supabase
          .from('locations')
          .select('*', { count: 'exact', head: true });

        setStats({ lowStock: lowCount || 0, totalLocations: locCount || 0 });
      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.header}>
          <Text style={styles.title}>NOLA Park Engine</Text>
          <Text style={styles.subtitle}>Real-Time Operations Dashboard</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.statsRow}>
            {/* LIVE DATA CARDS */}
            <View style={[styles.card, { borderLeftColor: '#d32f2f' }]}>
              <Text style={styles.cardLabel}>Low Stock Alerts</Text>
              <Text style={styles.cardValue}>{stats.lowStock} Items</Text>
            </View>
            <View style={[styles.card, { borderLeftColor: '#2e7d32' }]}>
              <Text style={styles.cardLabel}>Active Locations</Text>
              <Text style={styles.cardValue}>{stats.totalLocations} Outlets</Text>
            </View>
          </View>
        )}

        {/* CLAUDE'S OPERATIONS LOG (Placeholder for now) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Status</Text>
          <Text style={styles.itemText}>✅ Database: Connected</Text>
          <Text style={styles.itemText}>✅ POS Sync: Active</Text>
          <Text style={styles.itemText}>✅ Weather: Monitoring NOLA 70124</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  content: { padding: 20 },
  header: { marginBottom: 25 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1b5e20' },
  subtitle: { fontSize: 14, color: '#666' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 15, width: '48%', borderRadius: 12, borderLeftWidth: 6, elevation: 4 },
  cardLabel: { fontSize: 11, color: '#999', fontWeight: 'bold' },
  cardValue: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 5 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  itemText: { fontSize: 15, color: '#444', marginVertical: 5 }
});
