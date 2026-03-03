import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

function VoiceAudit() {
  const [isListening, setIsListening] = useState(false);

  const handleStartAudit = () => {
    setIsListening(true);
    // Integrate with react-native-voice or expo-speech-recognition
  };

  const handleStopAudit = () => {
    setIsListening(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Audit</Text>
      <Text style={styles.description}>
        Use voice commands to count inventory items
      </Text>
      <TouchableOpacity
        style={[styles.button, isListening && styles.buttonActive]}
        onPress={isListening ? handleStopAudit : handleStartAudit}
      >
        <Text style={styles.buttonText}>
          {isListening ? '⏹ Stop Listening' : '🎤 Start Voice Counting'}
        </Text>
      </TouchableOpacity>
      {isListening && (
        <Text style={styles.listeningText}>Listening for voice input...</Text>
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
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  listeningText: {
    color: '#28a745',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
});

export default VoiceAudit;
