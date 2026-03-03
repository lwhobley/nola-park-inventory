import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { InventoryContext } from '../context';

function InventoryDashboard() {
  const { inventory } = useContext(InventoryContext);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
  });

  useEffect(() => {
    if (inventory && inventory.length > 0) {
      const lowStockCount = inventory.filter(
        (item) => item.stock_level <= item.reorder_point
      ).length;
      const outOfStockCount = inventory.filter(
        (item) => item.stock_level === 0
      ).length;
      const totalValue = inventory.reduce(
        (sum, item) => sum + ((item.stock_level || 0) * (item.unit_cost || 0)),
        0
      );

      setStats({
        totalItems: inventory.length,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        totalValue,
      });
    }
  }, [inventory]);

  const StatCard = ({ title, value, type = 'normal' }) => (
    <View style={[styles.statCard, type !== 'normal' && styles[`${type}Card`]]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      <StatCard title="Total Items" value={stats.totalItems} />
      <StatCard title="Low Stock" value={stats.lowStock} type="warning" />
      <StatCard title="Out of Stock" value={stats.outOfStock} type="danger" />
      <StatCard title="Total Value" value={`$${stats.totalValue.toFixed(2)}`} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    minWidth: 140,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  warningCard: {
    borderLeftColor: '#ffc107',
  },
  dangerCard: {
    borderLeftColor: '#dc3545',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
});

export default InventoryDashboard;
