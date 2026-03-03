import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

function StockLevels({ inventory }) {
  const StockItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.itemStock}>{item.stock_level || 0}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Stock Levels</Text>
      {inventory && inventory.length > 0 ? (
        <FlatList
          data={inventory.slice(0, 5)}
          renderItem={({ item }) => <StockItem item={item} />}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.emptyText}>No inventory data available</Text>
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
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  itemStock: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007bff',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
});

export default StockLevels;
