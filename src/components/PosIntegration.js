import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function PosIntegration({ posData }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>POS Integration Status</Text>
      {posData ? (
        <View style={styles.content}>
          <Text style={styles.status}>✓ Connected</Text>
          <Text style={styles.systemName}>Connected POS System</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.warning}>⚠ Not Configured</Text>
          <Text style={styles.instruction}>Configure POS integration in settings</Text>
        </View>
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
  content: {
    alignItems: 'center',
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
  },
  warning: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffc107',
  },
  systemName: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  instruction: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
  },
});

export default PosIntegration;
