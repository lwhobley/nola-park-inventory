import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function ComplianceTracker({ inventory }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compliance Tracking</Text>
      <View style={styles.items}>
        <View style={styles.item}>
          <Text style={styles.itemIcon}>✓</Text>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>FSMA 204 Lot Tracking</Text>
            <Text style={styles.itemText}>
              {inventory?.length || 0} items being tracked
            </Text>
          </View>
        </View>
        <View style={styles.item}>
          <Text style={styles.itemIcon}>✓</Text>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Waste Documentation</Text>
            <Text style={styles.itemText}>All waste logged and documented</Text>
          </View>
        </View>
        <View style={styles.item}>
          <Text style={styles.itemIcon}>✓</Text>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Audit Logs</Text>
            <Text style={styles.itemText}>Complete audit trail available</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  items: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    alignItems: 'flex-start',
  },
  itemIcon: {
    fontSize: 18,
    color: '#28a745',
    marginRight: 12,
    fontWeight: 'bold',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  itemText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default ComplianceTracker;
