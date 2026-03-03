import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { weatherService } from '../services';

function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      setLoading(true);
      const data = await weatherService.getWeatherData();
      setWeather(data);
    } catch (error) {
      console.error('Weather load error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NOLA Weather</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#007bff" style={styles.loader} />
      ) : weather ? (
        <View style={styles.info}>
          <Text style={styles.temp}>{Math.round(weather.main?.temp || 0)}°C</Text>
          <Text style={styles.condition}>{weather.weather?.[0]?.main || 'Unknown'}</Text>
          <Text style={styles.impact}>Affects inventory forecasting</Text>
        </View>
      ) : (
        <Text style={styles.error}>Unable to load weather</Text>
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
  loader: {
    marginVertical: 20,
  },
  info: {
    alignItems: 'center',
  },
  temp: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007bff',
  },
  condition: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  impact: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  error: {
    fontSize: 14,
    color: '#dc3545',
  },
});

export default WeatherWidget;
