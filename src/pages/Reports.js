import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Picker,
} from 'react-native';
import CostAnalysis from '../components/CostAnalysis';

function Reports() {
  const [reportType, setReportType] = useState('inventory');
  const [dateRange, setDateRange] = useState('week');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports & Analytics</Text>
      </View>

      <View style={styles.controlsSection}>
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Report Type:</Text>
          <Picker
            selectedValue={reportType}
            onValueChange={setReportType}
            style={styles.picker}
          >
            <Picker.Item label="Inventory Report" value="inventory" />
            <Picker.Item label="Sales Report" value="sales" />
            <Picker.Item label="Waste Report" value="waste" />
            <Picker.Item label="COGS Analysis" value="cogs" />
            <Picker.Item label="Compliance Report" value="compliance" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Date Range:</Text>
          <Picker
            selectedValue={dateRange}
            onValueChange={setDateRange}
            style={styles.picker}
          >
            <Picker.Item label="This Week" value="week" />
            <Picker.Item label="This Month" value="month" />
            <Picker.Item label="This Quarter" value="quarter" />
            <Picker.Item label="This Year" value="year" />
          </Picker>
        </View>
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Generate Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Export as PDF
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <CostAnalysis dateRange={dateRange} />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  picker: {
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  buttonSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#fff',
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

export default Reports;
