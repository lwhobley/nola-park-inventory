/**
 * config/environment.js
 * Streamlined for Expo SDK 50 + Vercel
 */

const config = {
  // 1. SUPABASE (The only ones required for the green light)
  // We must type these out fully for the Expo compiler to "inline" them
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // 2. FEATURE FLAGS (Default to false if missing)
  ENABLE_POS_SYNC: process.env.EXPO_PUBLIC_ENABLE_POS_SYNC === 'true',
  ENABLE_WEATHER_FORECAST: process.env.EXPO_PUBLIC_ENABLE_WEATHER_FORECAST === 'true',

  // 3. TOAST POS
  TOAST_API_BASE_URL: process.env.EXPO_PUBLIC_TOAST_API_BASE_URL || 'https://api.toast.com',
  TOAST_RESTAURANT_GUID: process.env.EXPO_PUBLIC_TOAST_RESTAURANT_GUID || '',

  // 4. SQUARE POS
  SQUARE_API_BASE_URL: process.env.EXPO_PUBLIC_SQUARE_API_BASE_URL || 'https://connect.squareup.com',
  SQUARE_LOCATION_ID: process.env.EXPO_PUBLIC_SQUARE_LOCATION_ID || '',

  // 5. APP ENVIRONMENT
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Simple validation that won't crash the build
const validateConfig = () => {
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase configuration is missing!');
    return false;
  }
  return true;
};

export default {
  ...config,
  validate: validateConfig,
  isDevelopment: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
  isProduction: process.env.NODE_ENV === 'production',
};

export const getConfig = () => config;
