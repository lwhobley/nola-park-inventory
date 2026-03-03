import React, { useState } from 'react';
import { View, Text, StyleSheet, Picker } from 'react-native';
import { LOCATIONS } from '../utils';

export function LocationSelector() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Location:</Text>
      <Picker
        selectedValue={selectedLocation}
        onValueChange={setSelectedLocation}
        style={styles.picker}
      >
        <Picker.Item label="All Locations" value={null} />
        {LOCATIONS.map((loc) => (
          <Picker.Item key={loc.id} label={loc.name} value={loc.id} />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  picker: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

export default LocationSelector;
