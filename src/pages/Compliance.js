import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { InventoryContext } from '../context';
import ComplianceTracker from '../components/ComplianceTracker';

function Compliance() {
  const { inventory } = useContext(InventoryContext);

  const ComplianceCard = ({ title, content, status }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={[styles.cardContent, { color: status === 'compliant' ? '#28a745' : '#ffc107' }]}>
        {content}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Compliance & Auditing</Text>
      </View>

      <View style={styles.overview}>
        <ComplianceCard
          title="FSMA 204 Compliance"
          content="Compliant"
          status="compliant"
        />
        <ComplianceCard
          title="Lot Tracking"
          content={`Tracking ${inventory.length} items`}
        />
        <ComplianceCard
          title="Waste Documentation"
          content="0 items logged today"
        />
      </View>

      <View style={styles.trackerSection}>
        <ComplianceTracker inventory={inventory} />
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
  overview: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: '#666',
  },
  trackerSection: {
    padding: 16,
  },
});

export default Compliance;
