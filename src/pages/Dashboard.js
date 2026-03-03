import React, { useContext, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { AppContext, InventoryContext } from '../context';
import { useLoadingState } from '../hooks/useLoadingState';
import InventoryDashboard from '../components/InventoryDashboard';
import LocationSelector from '../components/LocationSelector';
import StockLevels from '../components/StockLevels';
import LowStockAlerts from '../components/LowStockAlerts';
import WeatherWidget from '../components/WeatherWidget';

function Dashboard() {
  const { appState } = useContext(AppContext);
  const { inventory, loadInventory } = useContext(InventoryContext);
  const { loading, error, startLoading, stopLoading } = useLoadingState();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      startLoading();
      await loadInventory();
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      stopLoading();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadInventory();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && !inventory.length) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Inventory Dashboard</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.content}>
        <LocationSelector />
        
        <View style={styles.statsSection}>
          <InventoryDashboard />
        </View>

        <View style={styles.mainContent}>
          <View style={styles.mainPanel}>
            <StockLevels inventory={inventory} />
          </View>
          
          <View style={styles.sidePanel}>
            <WeatherWidget />
            <LowStockAlerts inventory={inventory} />
          </View>
        </View>
      </View>
    </ScrollView>
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
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
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 4,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  statsSection: {
    marginBottom: 20,
  },
  mainContent: {
    flexDirection: 'row',
    gap: 16,
  },
  mainPanel: {
    flex: 3,
  },
  sidePanel: {
    flex: 1,
    gap: 16,
  },
});

export default Dashboard;
