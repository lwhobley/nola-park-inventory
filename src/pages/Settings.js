import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Picker,
} from 'react-native';

function Settings() {
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    emailAlerts: true,
    smsAlerts: false,
    defaultLocation: null,
  });

  const handleSaveSettings = async () => {
    try {
      // Save settings to Supabase
      console.log('Settings saved:', settings);
      // await supabase.from('user_settings').upsert(settings);
    } catch (error) {
      console.error('Settings save error:', error);
    }
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const SettingRow = ({ label, value, onValueChange, isSwitch = false }) => (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#ccc', true: '#81c784' }}
        />
      ) : (
        <Text style={styles.settingValue}>{value}</Text>
      )}
    </View>
  );

  const Section = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.content}>
        <Section title="Appearance">
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Theme:</Text>
            <Picker
              selectedValue={settings.theme}
              onValueChange={(value) => updateSetting('theme', value)}
              style={styles.picker}
            >
              <Picker.Item label="Light" value="light" />
              <Picker.Item label="Dark" value="dark" />
              <Picker.Item label="Auto" value="auto" />
            </Picker>
          </View>
        </Section>

        <Section title="Notifications">
          <SettingRow
            label="Enable Notifications"
            value={settings.notifications}
            onValueChange={(value) => updateSetting('notifications', value)}
            isSwitch
          />
          <SettingRow
            label="Email Alerts"
            value={settings.emailAlerts}
            onValueChange={(value) => updateSetting('emailAlerts', value)}
            isSwitch
          />
          <SettingRow
            label="SMS Alerts (Requires Twilio)"
            value={settings.smsAlerts}
            onValueChange={(value) => updateSetting('smsAlerts', value)}
            isSwitch
          />
        </Section>

        <Section title="Preferences">
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Default Location:</Text>
            <Picker
              selectedValue={settings.defaultLocation}
              onValueChange={(value) => updateSetting('defaultLocation', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select Location" value={null} />
              <Picker.Item label="Carousel Gardens" value="carousel" />
              <Picker.Item label="Big Lake Snack Bar" value="biglake" />
              <Picker.Item label="Cafe Du Monde" value="cafedumond" />
            </Picker>
          </View>
        </Section>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveSettings}
        >
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
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
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
  },
  pickerContainer: {
    marginVertical: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  picker: {
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Settings;
