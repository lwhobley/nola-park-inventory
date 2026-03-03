/**
 * config/environment.js 
 * STATED PLAINLY FOR EXPO COMPILER
 */

const config = {
  // DO NOT LOOPS THROUGH THESE. They must be typed out exactly like this:
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // Feature Flags
  ENABLE_POS_SYNC: process.env.EXPO_PUBLIC_ENABLE_POS_SYNC === 'true',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Simple logic check
const validateConfig = () => {
  return !!(config.SUPABASE_URL && config.SUPABASE_ANON_KEY);
};

export default {
  ...config,
  validate: validateConfig,
  isProduction: process.env.NODE_ENV === 'production',
};

export const getConfig = () => config;
