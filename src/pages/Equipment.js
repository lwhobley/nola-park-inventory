import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useLoadingState } from '../hooks/useLoadingState';
import EquipmentMaintenance from '../components/EquipmentMaintenance';

function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const { loading, startLoading, stopLoading } = useLoadingState();

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      startLoading();
      // Load equipment data from Supabase
      // const { data } = await supabase.from('equipment').select('*');
      // setEquipment(data || []);
    } catch (error) {
      console.error('Equipment load error:', error);
    } finally {
      stopLoading();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Equipment Maintenance</Text>
      </View>

      <View style={styles.controlsSection}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>+ Add Equipment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Schedule Maintenance
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : (
        <View style={styles.content}>
          <EquipmentMaintenance equipment={equipment} />
        </View>
      )}
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
    minHeight: 300,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  button: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  secondaryButtonText: {
    color: '#fff',
  },
  content: {
    padding: 16,
  },
});

export default Equipment;
