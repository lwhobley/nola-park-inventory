import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

function LowStockAlerts({ inventory }) {
  const lowStockItems = inventory?.filter(
    (item) => item.stock_level <= item.reorder_point
  ) || [];

  const AlertItem = ({ item }) => (
    <View style={styles.alertItem}>
      <Text style={styles.alertTitle}>{item.name}</Text>
      <Text style={styles.alertStock}>{item.stock_level || 0} units</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Low Stock Alerts</Text>
      {lowStockItems.length > 0 ? (
        <FlatList
          data={lowStockItems}
          renderItem={({ item }) => <AlertItem item={item} />}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.noAlerts}>All items are well stocked</Text>
      )}
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
    marginBottom: 12,
  },
  alertItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  alertStock: {
    fontSize: 13,
    color: '#dc3545',
    marginTop: 4,
  },
  noAlerts: {
    color: '#28a745',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LowStockAlerts;
