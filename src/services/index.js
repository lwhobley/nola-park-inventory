import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Weather Service with error handling
export const weatherService = {
  async getWeatherData() {
    try {
      const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;
      if (!apiKey) {
        console.warn('OpenWeather API key not configured');
        return null;
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=29.9511&lon=-90.2625&appid=${apiKey}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Weather fetch error:', error);
      return null; // Return null instead of crashing
    }
  },
};

// POS Service with error handling
export const posService = {
  async syncSales() {
    try {
      // Toast or Square sync logic
      console.log('Syncing POS sales...');
      return { success: true };
    } catch (error) {
      console.error('POS sync error:', error);
      throw new Error('Failed to sync POS: ' + error.message);
    }
  },

  async getTransactions(locationId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('pos_transactions')
        .select('*')
        .eq('location_id', locationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch POS transactions:', error);
      throw error;
    }
  },
};

// Notification Service with error handling
export const notificationService = {
  async sendEmailAlert(recipient, subject, message) {
    try {
      const apiKey = process.env.REACT_APP_SENDGRID_API_KEY;
      if (!apiKey) {
        console.warn('SendGrid API key not configured');
        return null;
      }

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: recipient }],
            },
          ],
          from: { email: 'alerts@nolapark.com' },
          subject,
          content: [
            {
              type: 'text/plain',
              value: message,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`SendGrid error: ${response.status}`);
      }

      console.log(`Email alert sent to ${recipient}`);
      return { success: true };
    } catch (error) {
      console.error('Email sending error:', error);
      return null; // Don't crash app if email fails
    }
  },
};

// Analytics Service with error handling
export const analyticsService = {
  trackEvent(eventName, eventData = {}) {
    try {
      console.log(`Event tracked: ${eventName}`, eventData);
      // Could send to analytics service here
    } catch (error) {
      console.error('Analytics error:', error);
    }
  },

  trackPageView(pageName) {
    this.trackEvent('page_view', { page: pageName });
  },

  trackError(errorMessage, errorData = {}) {
    this.trackEvent('error', { message: errorMessage, ...errorData });
  },
};
