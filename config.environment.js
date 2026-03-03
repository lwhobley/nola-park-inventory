/**
 * config/environment.js
 * Environment configuration loader with validation
 * Loads and validates all environment variables from .env.local
 */

const requiredVars = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
];

const optionalVars = [
  'TOAST_API_BASE_URL',
  'TOAST_OAUTH_CLIENT_ID',
  'TOAST_OAUTH_CLIENT_SECRET',
  'TOAST_RESTAURANT_GUID',
  'TOAST_WEBHOOK_SECRET',
  'SQUARE_API_BASE_URL',
  'SQUARE_ACCESS_TOKEN',
  'SQUARE_APPLICATION_ID',
  'SQUARE_APPLICATION_SECRET',
  'SQUARE_LOCATION_ID',
  'SQUARE_WEBHOOK_SIGNATURE_KEY',
  'OPENWEATHER_API_KEY',
  'OPENWEATHER_BASE_URL',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_FROM_PHONE',
  'SENDGRID_API_KEY',
  'SENDGRID_FROM_EMAIL',
  'SENTRY_DSN',
  'LOGROCKET_APP_ID',
];

// Validate required variables
const missing = requiredVars.filter(
  (key) => !process.env[key] && !process.env[`REACT_APP_${key}`]
);

if (missing.length > 0 && process.env.NODE_ENV === 'production') {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}\n` +
    `Check your .env.local file and ensure all variables are set.`
  );
}

// Build config object
const config = {
  // Supabase (Required)
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // Feature Flags
  ENABLE_POS_SYNC: process.env.ENABLE_POS_SYNC === 'true',
  ENABLE_VOICE_AUDIT: process.env.ENABLE_VOICE_AUDIT === 'true',
  ENABLE_WEATHER_FORECAST: process.env.ENABLE_WEATHER_FORECAST === 'true',
  ENABLE_AI_FORECAST: process.env.ENABLE_AI_FORECAST === 'true',
  ENABLE_VENDOR_EDI: process.env.ENABLE_VENDOR_EDI === 'true',
  ENABLE_TENANT_PERMISSIONS: process.env.ENABLE_TENANT_PERMISSIONS === 'true',
  ENABLE_MULTI_LOCATION_TRANSFERS: process.env.ENABLE_MULTI_LOCATION_TRANSFERS === 'true',

  // Toast POS
  TOAST_ENABLED: process.env.TOAST_ENABLE_SYNC === 'true',
  TOAST_API_BASE_URL: process.env.TOAST_API_BASE_URL || 'https://api.toast.com',
  TOAST_OAUTH_CLIENT_ID: process.env.TOAST_OAUTH_CLIENT_ID || '',
  TOAST_OAUTH_CLIENT_SECRET: process.env.TOAST_OAUTH_CLIENT_SECRET || '',
  TOAST_RESTAURANT_GUID: process.env.TOAST_RESTAURANT_GUID || '',
  TOAST_WEBHOOK_SECRET: process.env.TOAST_WEBHOOK_SECRET || '',

  // Square POS
  SQUARE_ENABLED: process.env.SQUARE_ENABLE_SYNC === 'true',
  SQUARE_API_BASE_URL: process.env.SQUARE_API_BASE_URL || 'https://connect.squareup.com',
  SQUARE_ACCESS_TOKEN: process.env.SQUARE_ACCESS_TOKEN || '',
  SQUARE_REFRESH_TOKEN: process.env.SQUARE_REFRESH_TOKEN || '',
  SQUARE_APPLICATION_ID: process.env.SQUARE_APPLICATION_ID || '',
  SQUARE_APPLICATION_SECRET: process.env.SQUARE_APPLICATION_SECRET || '',
  SQUARE_LOCATION_ID: process.env.SQUARE_LOCATION_ID || '',
  SQUARE_WEBHOOK_SIGNATURE_KEY: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || '',

  // Weather
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || '',
  OPENWEATHER_BASE_URL: process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/3.0/onecall',

  // Email & SMS
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_FROM_PHONE: process.env.TWILIO_FROM_PHONE || '',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
  SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL || 'noreply@nolaparkoperations.com',

  // Error Tracking
  SENTRY_DSN: process.env.SENTRY_DSN || '',
  SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
  LOGROCKET_APP_ID: process.env.LOGROCKET_APP_ID || '',

  // Timing & Intervals
  POS_SYNC_INTERVAL_MINUTES: parseInt(process.env.POS_SYNC_INTERVAL_MINUTES || '5', 10),
  INVENTORY_COUNT_REMINDER_HOURS: parseInt(process.env.INVENTORY_COUNT_REMINDER_HOURS || '24', 10),

  // Thresholds
  LOW_STOCK_ALERT_THRESHOLD_PERCENT: parseInt(process.env.LOW_STOCK_ALERT_THRESHOLD_PERCENT || '25', 10),
  VARIANCE_ALERT_THRESHOLD_PERCENT: parseInt(process.env.VARIANCE_ALERT_THRESHOLD_PERCENT || '5', 10),

  // Locations
  DEFAULT_TIMEZONE: process.env.DEFAULT_TIMEZONE || 'America/Chicago',
  PARK_LATITUDE: parseFloat(process.env.PARK_LATITUDE || '30.1186'),
  PARK_LONGITUDE: parseFloat(process.env.PARK_LONGITUDE || '-90.1205'),

  // App Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  REACT_APP_DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE === 'true',
  REACT_APP_DEMO_MODE: process.env.REACT_APP_DEMO_MODE === 'true',

  // API Base URL
  REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',

  // CORS
  CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:19000', // Expo
  ],
};

// Validation helper
const validateConfig = () => {
  const errors = [];

  if (!config.SUPABASE_URL) errors.push('Missing SUPABASE_URL');
  if (!config.SUPABASE_ANON_KEY) errors.push('Missing SUPABASE_ANON_KEY');

  if (config.ENABLE_POS_SYNC && config.TOAST_ENABLED && !config.TOAST_OAUTH_CLIENT_ID) {
    errors.push('Toast POS enabled but TOAST_OAUTH_CLIENT_ID is missing');
  }

  if (config.ENABLE_POS_SYNC && config.SQUARE_ENABLED && !config.SQUARE_ACCESS_TOKEN) {
    errors.push('Square POS enabled but SQUARE_ACCESS_TOKEN is missing');
  }

  if (config.ENABLE_WEATHER_FORECAST && !config.OPENWEATHER_API_KEY) {
    errors.push('Weather forecast enabled but OPENWEATHER_API_KEY is missing');
  }

  if (errors.length > 0) {
    console.warn('⚠️  Configuration warnings:\n' + errors.map((e) => `  - ${e}`).join('\n'));
  }

  return errors.length === 0;
};

// Log config status in development
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_DEBUG_MODE) {
  console.log('✅ Configuration loaded:', {
    supabaseUrl: config.SUPABASE_URL,
    toastEnabled: config.TOAST_ENABLED,
    squareEnabled: config.SQUARE_ENABLED,
    weatherEnabled: config.ENABLE_WEATHER_FORECAST,
    debugMode: config.REACT_APP_DEBUG_MODE,
    demoMode: config.REACT_APP_DEMO_MODE,
  });
}

// Export config
export default {
  ...config,
  validate: validateConfig,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isStaging: process.env.NODE_ENV === 'staging',
};

export const getConfig = () => config;
