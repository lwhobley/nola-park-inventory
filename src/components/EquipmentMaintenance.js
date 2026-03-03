import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

function EquipmentMaintenance({ equipment }) {
  const EquipmentItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemDate}>
        Last Maintenance: {item.last_maintenance || 'Never'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Equipment Maintenance Schedule</Text>
      {equipment && equipment.length > 0 ? (
        <FlatList
          data={equipment}
          renderItem={({ item }) => <EquipmentItem item={item} />}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.empty}>No equipment records found</Text>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  itemDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  empty: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default EquipmentMaintenance;
