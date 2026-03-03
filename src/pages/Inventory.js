import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { InventoryContext } from '../context';
import { useLoadingState } from '../hooks/useLoadingState';
import { helpers } from '../utils';

function Inventory() {
  const { inventory, loadInventory } = useContext(InventoryContext);
  const { loading, error, startLoading, stopLoading } = useLoadingState();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);

  useEffect(() => {
    loadPage();
  }, []);

  useEffect(() => {
    filterInventory();
  }, [searchTerm, inventory]);

  const loadPage = async () => {
    try {
      startLoading();
      await loadInventory();
    } catch (err) {
      console.error('Inventory load error:', err);
    } finally {
      stopLoading();
    }
  };

  const filterInventory = () => {
    const filtered = inventory.filter(item =>
      (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.sku?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false
    );
    setFilteredInventory(filtered);
  };

  const getStatusColor = (item) => {
    if (item.stock_level === 0) return '#dc3545';
    if (item.stock_level <= item.reorder_point) return '#ffc107';
    return '#28a745';
  };

  const InventoryItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.cell, styles.skuCell]}>{item.sku}</Text>
      <Text style={[styles.cell, styles.nameCell]} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={[styles.cell, styles.categoryCell]}>{item.category}</Text>
      <Text style={[styles.cell, styles.stockCell]}>
        {item.stock_level || 0}
      </Text>
      <Text style={[styles.cell, styles.statusCell]}>
        <Text
          style={[
            styles.statusBadge,
            { color: getStatusColor(item) },
          ]}
        >
          {item.stock_level <= item.reorder_point ? 'Low' : 'OK'}
        </Text>
      </Text>
    </View>
  );

  if (loading && !inventory.length) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory Management</Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView horizontal style={styles.tableContainer}>
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.skuCell]}>SKU</Text>
            <Text style={[styles.headerCell, styles.nameCell]}>Name</Text>
            <Text style={[styles.headerCell, styles.categoryCell]}>
              Category
            </Text>
            <Text style={[styles.headerCell, styles.stockCell]}>Stock</Text>
            <Text style={[styles.headerCell, styles.statusCell]}>Status</Text>
          </View>

          <FlatList
            data={filteredInventory}
            renderItem={({ item }) => <InventoryItem item={item} />}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No items found</Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      <Text style={styles.footerText}>
        Showing {filteredInventory.length} of {inventory.length} items
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchSection: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    borderRadius: 4,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 4,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cell: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 13,
    color: '#333',
  },
  skuCell: {
    width: 80,
  },
  nameCell: {
    width: 150,
  },
  categoryCell: {
    width: 100,
  },
  stockCell: {
    width: 60,
    textAlign: 'center',
  },
  statusCell: {
    width: 80,
  },
  statusBadge: {
    fontWeight: '600',
    fontSize: 12,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  footerText: {
    textAlign: 'center',
    paddingVertical: 12,
    color: '#999',
    fontSize: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});

export default Inventory;
