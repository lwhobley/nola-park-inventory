import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { supabase } from '../../App';

// MOBILE-SAFE DASHBOARD
export default function Dashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>NOLA City Park</Text>
          <Text style={styles.subtitle}>Inventory & Operations Engine</Text>
        </View>

        {/* QUICK STATS CARDS */}
        <View style={styles.statsRow}>
          <View style={[styles.card, { borderLeftColor: '#2e7d32' }]}>
            <Text style={styles.cardLabel}>Stock Alerts</Text>
            <Text style={styles.cardValue}>12 Items Low</Text>
          </View>
          <View style={[styles.card, { borderLeftColor: '#1976d2' }]}>
            <Text style={styles.cardLabel}>Active Locations</Text>
            <Text style={styles.cardValue}>5 Open</Text>
          </View>
        </View>

        {/* RECENT ACTIVITY LIST */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Operations</Text>
          <View style={styles.listItem}>
            <Text style={styles.itemText}>Carousel Gardens: Bulk Ice Restock</Text>
            <Text style={styles.itemTime}>10 mins ago</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.itemText}>Big Lake: Equipment Check</Text>
            <Text style={styles.itemTime}>45 mins ago</Text>
          </View>
        </View>

        {/* ACTION BUTTON */}
        <TouchableOpacity style={styles.button} onPress={() => alert('Opening Scanner...')}>
          <Text style={styles.buttonText}>Start Inventory Audit</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20 },
  header: { marginBottom: 30, marginTop: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1b5e20' },
  subtitle: { fontSize: 16, color: '#666' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 15, width: '48%', borderRadius: 10, borderLeftWidth: 5, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardLabel: { fontSize: 12, color: '#888', textTransform: 'uppercase' },
  cardValue: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 5 },
  section: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  listItem: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 12 },
  itemText: { fontSize: 14, color: '#444' },
  itemTime: { fontSize: 12, color: '#999', marginTop: 4 },
  button: { backgroundColor: '#2e7d32', padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
