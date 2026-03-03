import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

function NotFound({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.errorCode}>404</Text>
        <Text style={styles.errorTitle}>Page Not Found</Text>
        <Text style={styles.errorMessage}>
          The page you're looking for doesn't exist.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation?.navigate('Dashboard')}
        >
          <Text style={styles.buttonText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorCode: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default NotFound;
