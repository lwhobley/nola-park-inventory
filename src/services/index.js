// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// weatherService.js
export const weatherService = {
  async getWeatherData() {
    try {
      const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=29.9511&lon=-90.2625&appid=${apiKey}&units=metric`
      );
      return await response.json();
    } catch (error) {
      console.error('Weather fetch error:', error);
      return null;
    }
  },
};

// posService.js
export const posService = {
  async syncSales() {
    try {
      // Toast or Square sync logic
      console.log('Syncing POS sales...');
    } catch (error) {
      console.error('POS sync error:', error);
    }
  },
};

// notificationService.js
export const notificationService = {
  async sendEmailAlert(recipient, subject, message) {
    try {
      const apiKey = process.env.REACT_APP_SENDGRID_API_KEY;
      // SendGrid email sending logic
      console.log(`Email alert sent to ${recipient}`);
    } catch (error) {
      console.error('Email sending error:', error);
    }
  },
};

// analyticsService.js
export const analyticsService = {
  trackEvent(eventName, eventData) {
    console.log(`Event tracked: ${eventName}`, eventData);
  },
};
