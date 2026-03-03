import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import PosIntegration from '../components/PosIntegration';
import { useLoadingState } from '../hooks/useLoadingState';

function POSScreen() {
  const { loading: syncing, startLoading, stopLoading } = useLoadingState();
  const [syncStatus, setSyncStatus] = useState('idle');
  const [posData, setPosData] = useState(null);

  const handleSync = async () => {
    startLoading();
    setSyncStatus('syncing');
    try {
      // Call POS service to sync data
      // await posService.syncSales();
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      setSyncStatus('error');
      console.error('POS sync error:', error);
    } finally {
      stopLoading();
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'success':
        return '#28a745';
      case 'error':
        return '#dc3545';
      case 'syncing':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>POS Integration</Text>
      </View>

      <View style={styles.controlsSection}>
        <TouchableOpacity
          style={[styles.syncButton, syncing && styles.syncButtonDisabled]}
          onPress={handleSync}
          disabled={syncing}
        >
          {syncing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.syncButtonText}>
              {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
            </Text>
          )}
        </TouchableOpacity>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor() },
          ]}
        >
          <Text style={styles.statusText}>{syncStatus.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <PosIntegration posData={posData} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  controlsSection: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  syncButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  content: {
    padding: 16,
  },
});

export default POSScreen;
