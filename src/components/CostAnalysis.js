import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function CostAnalysis({ dateRange }) {
  const dateRangeLabel = {
    week: 'This Week',
    month: 'This Month',
    quarter: 'This Quarter',
    year: 'This Year',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Cost Analysis - {dateRangeLabel[dateRange] || dateRange}
      </Text>
      <View style={styles.chart}>
        <Text style={styles.chartLabel}>COGS Variance Analysis</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.placeholderText}>Chart will display here</Text>
        </View>
      </View>
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
    marginBottom: 16,
  },
  chart: {
    minHeight: 300,
  },
  chartLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  chartPlaceholder: {
    height: 250,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
  },
});

export default CostAnalysis;
