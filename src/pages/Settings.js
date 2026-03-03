import React, { useState } from 'react';
import '../styles/pages.css';

function Settings() {
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    emailAlerts: true,
    smsAlerts: false,
    defaultLocation: null,
  });

  const handleSaveSettings = async () => {
    // Save settings to Supabase
    console.log('Settings saved:', settings);
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <div className="settings-sections">
        <section className="settings-section">
          <h2>Appearance</h2>
          <div className="setting-item">
            <label>Theme</label>
            <select 
              value={settings.theme}
              onChange={(e) => setSettings({...settings, theme: e.target.value})}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </section>

        <section className="settings-section">
          <h2>Notifications</h2>
          <div className="setting-item">
            <label>
              <input 
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
              />
              Enable Notifications
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input 
                type="checkbox"
                checked={settings.emailAlerts}
                onChange={(e) => setSettings({...settings, emailAlerts: e.target.checked})}
              />
              Email Alerts
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input 
                type="checkbox"
                checked={settings.smsAlerts}
                onChange={(e) => setSettings({...settings, smsAlerts: e.target.checked})}
              />
              SMS Alerts (Requires Twilio)
            </label>
          </div>
        </section>

        <section className="settings-section">
          <h2>Preferences</h2>
          <div className="setting-item">
            <label>Default Location</label>
            <select className="select-input">
              <option value="">Select Location</option>
            </select>
          </div>
        </section>

        <button onClick={handleSaveSettings} className="btn-primary btn-large">
          Save Settings
        </button>
      </div>
    </div>
  );
}

export default Settings;
