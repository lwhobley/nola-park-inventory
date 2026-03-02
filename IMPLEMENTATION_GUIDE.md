# NOLA City Park Inventory & Operations Engine - Implementation Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Database Setup](#database-setup)
3. [Environment Configuration](#environment-configuration)
4. [API Integrations](#api-integrations)
5. [Deployment](#deployment)
6. [Testing](#testing)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+ (via Supabase)
- Expo CLI (for React Native)
- Git & GitHub

### Installation
```bash
# Clone repository
git clone https://github.com/your-org/nola-park-inventory.git
cd nola-park-inventory

# Install dependencies
npm install

# Copy environment template
cp .env.template .env.local

# Install Expo CLI (if needed)
npm install -g eas-cli

# Start development server
npm start
```

---

## Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose region: **US (Virginia)** for lowest latency to NOLA
3. Save your credentials (URL, Anon Key, Service Role Key)

### 2. Deploy Schema

```bash
# Option A: Using Supabase Dashboard (Recommended for first-time setup)
1. Navigate to "SQL Editor" in Supabase Dashboard
2. Click "New Query"
3. Copy entire contents of schema.sql into editor
4. Click "Run" to execute

# Option B: Using psql CLI
psql -h db.your-project.supabase.co -U postgres -d postgres \
  -c "$(cat schema.sql)"

# Option C: Using Supabase CLI
supabase db push --db-url postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

### 3. Verify Schema Installation

```sql
-- Run in Supabase SQL Editor to verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected output: 18+ tables including organizations, locations, inventory_items, etc.
```

### 4. Enable Row-Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Example RLS policy: Users can only see their organization's data
CREATE POLICY "org_isolation" 
ON locations 
FOR SELECT 
USING (org_id IN (SELECT org_id FROM users WHERE auth.uid() = id));
```

### 5. Create Storage Buckets

```bash
# Via Supabase Dashboard:
1. Go to "Storage" > "Buckets"
2. Create three buckets:
   - voice_audits (for voice audit recordings)
   - compliance_photos (for wastage/maintenance photos)
   - documents (for certificates, receipts, etc.)

# Make buckets public if needed (for viewing photos/documents):
1. Click bucket name
2. "Policies" tab
3. Add public read policy (optional)
```

---

## Environment Configuration

### 1. Copy and Edit .env.local

```bash
cp .env.template .env.local
```

### 2. Fill in Supabase Credentials

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Get Supabase Credentials

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** > **API**
4. Copy:
   - **Project URL** → `REACT_APP_SUPABASE_URL`
   - **anon key** → `REACT_APP_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Configure Feature Flags

```env
# Enable/disable major features based on your needs
ENABLE_POS_SYNC=true              # Enable Toast/Square sync
ENABLE_VOICE_AUDIT=true           # Enable voice counting
ENABLE_WEATHER_FORECAST=true      # Enable weather-based alerts
ENABLE_AI_FORECAST=false          # Disable until ML pipeline is ready
ENABLE_VENDOR_EDI=false           # Disable until vendor setup complete
```

---

## API Integrations

### 1. Toast POS Integration

**Prerequisites:**
- Toast account with API access
- Restaurant GUID from Toast platform

**Setup Steps:**

```bash
# 1. Get Toast API credentials
# - Go to Toast Dashboard > Integrations > API Keys
# - Create new API key
# - Save Client ID, Client Secret, Restaurant GUID

# 2. Fill environment variables
TOAST_API_BASE_URL=https://api.toast.com
TOAST_OAUTH_CLIENT_ID=your-client-id
TOAST_OAUTH_CLIENT_SECRET=your-client-secret
TOAST_RESTAURANT_GUID=your-restaurant-guid
TOAST_ENABLE_SYNC=true

# 3. Test connection
npm run test:toast-sync
```

**API Endpoints Used:**
- `GET /v1/orders` - Fetch recent orders
- `PATCH /v1/menus/items/{id}` - Disable/enable menu items
- `GET /v1/inventory` - Fetch inventory status

**Webhook Setup:**
```bash
# In Toast Dashboard > Webhooks:
1. Register webhook endpoint: https://your-api.com/webhooks/toast
2. Subscribe to events: order.created, order.closed, inventory.updated
3. Save webhook secret in TOAST_WEBHOOK_SECRET
```

### 2. Square POS Integration

**Prerequisites:**
- Square Developer Account
- Square Application ID & Secret

**Setup Steps:**

```bash
# 1. Create Square Application
# - Go to developer.squareup.com > Applications
# - Create new application
# - Get Application ID & Secret

# 2. Set up OAuth flow
# - Add redirect URI: https://your-app.com/auth/square/callback
# - Save credentials to environment

SQUARE_API_BASE_URL=https://connect.squareup.com
SQUARE_APPLICATION_ID=your-app-id
SQUARE_APPLICATION_SECRET=your-app-secret
SQUARE_ENABLE_SYNC=true

# 3. Obtain Access Token (via OAuth flow)
# - Use Square OAuth to get access token for merchant
# - Store in database (not .env)
```

**API Endpoints Used:**
- `POST /v2/orders/search` - Fetch recent orders
- `PUT /v2/catalog/objects` - Update menu item availability
- `GET /v2/locations` - List locations

**Webhook Setup:**
```bash
# In Square Developer Dashboard > Webhooks:
1. Register webhook endpoint: https://your-api.com/webhooks/square
2. Subscribe to events: order.created, order.updated
3. Save signature key in SQUARE_WEBHOOK_SIGNATURE_KEY
4. Verify webhooks in app:
   import { Client } from 'square';
   
   const isSignatureValid = 
     Client.WebhooksHelper.isValidWebhookEventSignature(
       body, 
       signature, 
       signatureKey
   );
```

### 3. OpenWeather API

**Setup:**

```bash
# 1. Sign up at openweathermap.org
# 2. Get API Key from account settings
# 3. Add to environment

OPENWEATHER_API_KEY=your-api-key
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/3.0/onecall

# 4. Test with NOLA coordinates
curl -X GET "https://api.openweathermap.org/data/3.0/onecall?lat=30.1186&lon=-90.1205&appid=YOUR_KEY"
```

**Usage in App:**
```javascript
// Automatically called daily to update weather_data table
const fetchWeatherForecast = async (locationId) => {
  const { data: location } = await supabase
    .from('locations')
    .select('latitude, longitude')
    .eq('id', locationId)
    .single();

  const response = await fetch(
    `${config.OPENWEATHER_BASE_URL}?` +
    `lat=${location.latitude}&` +
    `lon=${location.longitude}&` +
    `appid=${config.OPENWEATHER_API_KEY}`
  );
  
  const weatherData = await response.json();
  
  // Insert into weather_data table
  await supabase.from('weather_data').insert({
    location_id: locationId,
    forecast_date: new Date(),
    high_temp_f: weatherData.daily[0].temp.max,
    low_temp_f: weatherData.daily[0].temp.min,
    rainfall_inches: weatherData.daily[0].rain || 0,
    humidity_percent: weatherData.daily[0].humidity,
    conditions: weatherData.daily[0].weather[0].main,
  });
};
```

### 4. Twilio SMS Alerts (Optional)

**Setup:**

```bash
# 1. Sign up at twilio.com
# 2. Get Account SID, Auth Token, and phone number
# 3. Add to environment

TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_FROM_PHONE=+15125550100

# 4. Test with npm package
npm install twilio

# 5. Send test SMS
const twilio = require('twilio');
const client = twilio(SID, TOKEN);

await client.messages.create({
  from: '+15125550100',
  to: '+15125550101',
  body: 'Low stock alert: Vanilla Ice Cream'
});
```

---

## Deployment

### 1. Frontend Deployment (Vercel)

```bash
# 1. Push code to GitHub
git add .
git commit -m "Initial deployment"
git push origin main

# 2. Connect to Vercel
vercel --prod

# 3. Set environment variables in Vercel Dashboard
# - Go to Project Settings > Environment Variables
# - Add all REACT_APP_* variables from .env.local

# 4. Deploy
vercel deploy --prod
```

### 2. React Native (Expo) Deployment

```bash
# 1. Create Expo account
eas account:login

# 2. Configure app.json
{
  "expo": {
    "name": "NOLA Park Inventory",
    "slug": "nola-park-inventory",
    "version": "1.0.0",
    "android": {
      "package": "com.nolapark.inventory"
    },
    "ios": {
      "bundleIdentifier": "com.nolapark.inventory"
    }
  }
}

# 3. Build and submit
eas build --platform android --auto-submit
eas build --platform ios --auto-submit
```

### 3. Backend Functions (Supabase Edge Functions)

```bash
# Create function to sync POS data periodically
supabase functions new sync-pos-transactions

# In supabase/functions/sync-pos-transactions/index.ts:
export const handler = async (req: Request) => {
  const client = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  // Get all locations
  const { data: locations } = await client
    .from('locations')
    .select('id')
    .eq('is_active', true);
  
  // Sync POS for each location
  for (const location of locations) {
    await syncPOSForLocation(location.id);
  }
  
  return new Response(JSON.stringify({ success: true }));
};

# Deploy
supabase functions deploy sync-pos-transactions

# Schedule with GitHub Actions or Cron
# Run every 5 minutes via Supabase scheduler or external cron service
```

---

## Testing

### 1. Database Tests

```bash
# Test schema is correctly deployed
npm run test:schema

# Test RLS policies
npm run test:rls

# Test triggers
npm run test:triggers
```

### 2. API Tests

```bash
# Test Supabase client connection
npm run test:supabase-connection

# Test Toast POS sync
npm run test:toast-sync

# Test Square POS sync
npm run test:square-sync

# Test weather API
npm run test:weather-api
```

### 3. Integration Tests

```bash
# Test end-to-end inventory flow
npm run test:inventory-flow

# Test POS auto-86 logic
npm run test:auto-86

# Test demand forecasting
npm run test:forecasting
```

**Example Test:**
```javascript
// __tests__/inventory.test.js
import { supabase } from '../App';

describe('Inventory Management', () => {
  it('should deduct inventory from POS sale', async () => {
    // Insert test menu item and recipe
    const { data: menuItem } = await supabase
      .from('menu_items')
      .insert({ name: 'Test Item' });
    
    const { data: inventoryItem } = await supabase
      .from('inventory_items')
      .insert({ name: 'Test Ingredient', unit_cost: 1.50 });
    
    // Insert recipe line
    await supabase.from('recipe_lines').insert({
      menu_item_id: menuItem.id,
      inventory_item_id: inventoryItem.id,
      quantity_per_unit: 0.5,
      is_core_ingredient: true,
    });
    
    // Record POS sale
    await supabase.from('pos_transactions').insert({
      menu_item_id: menuItem.id,
      quantity_sold: 10,
      transaction_date: new Date(),
    });
    
    // Verify inventory was deducted
    const { data: inventory } = await supabase
      .from('location_inventory')
      .select('quantity_on_hand')
      .eq('item_id', inventoryItem.id);
    
    expect(inventory[0].quantity_on_hand).toBe(-5); // 10 * 0.5
  });
});
```

---

## Monitoring & Maintenance

### 1. Set Up Alerts

**Database Performance:**
```sql
-- Monitor slow queries
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

SELECT query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000 -- Queries slower than 1 second
ORDER BY mean_exec_time DESC;
```

**Application Health:**
- Set up Sentry for error tracking
- Set up LogRocket for session replay (optional)
- Monitor Vercel deployment logs

### 2. Database Backups

```bash
# Enable automatic backups in Supabase Dashboard
# Settings > Database > Backups

# Manual backup
supabase db pull
# or
pg_dump -h db.your-project.supabase.co -U postgres > backup-$(date +%Y%m%d).sql

# Restore from backup
psql -h db.your-project.supabase.co -U postgres < backup-20240101.sql
```

### 3. Regular Maintenance Tasks

**Weekly:**
- Review alert logs for anomalies
- Check waste/spoilage trends
- Verify POS sync is running

**Monthly:**
- Audit user permissions
- Review COGS reconciliation reports
- Update vendor pricing in system
- Analyze demand forecasting accuracy

**Quarterly:**
- Full system health check
- Update API credentials
- Review and optimize database indexes
- Security audit

---

## Troubleshooting

### Common Issues

#### 1. POS Sync Not Running

```bash
# Check pos_systems table
SELECT * FROM pos_systems WHERE location_id = 'your-location-id';

# Verify API keys are correct
# Check last_sync_at timestamp

# Run manual sync
npm run sync:pos

# Check logs
tail -f logs/pos-sync.log
```

#### 2. Inventory Not Updating

```bash
# Verify location_inventory record exists
SELECT * FROM location_inventory WHERE location_id = 'your-location-id';

# Check inventory_movements table for recent entries
SELECT * FROM inventory_movements 
WHERE location_id = 'your-location-id' 
ORDER BY created_at DESC LIMIT 10;

# Check trigger execution
SELECT * FROM pg_stat_user_functions WHERE funcname LIKE '%inventory%';
```

#### 3. Menu Items Not Disabling on POS (Auto-86)

```bash
# Check menu_item_status table
SELECT * FROM menu_item_status WHERE menu_item_id = 'your-item-id';

# Verify recipe_lines have is_core_ingredient = TRUE
SELECT * FROM recipe_lines WHERE menu_item_id = 'your-item-id';

# Check if inventory is actually at zero
SELECT * FROM location_inventory 
WHERE item_id = 'your-item-id' 
AND quantity_on_hand = 0;

# Manually trigger check
SELECT * FROM check_menu_item_stock();
```

#### 4. Weather Data Not Updating

```bash
# Check weather_data table
SELECT * FROM weather_data 
WHERE location_id = 'your-location-id'
ORDER BY created_at DESC;

# Verify OpenWeather API key is correct
curl "https://api.openweathermap.org/data/3.0/onecall?lat=30.1186&lon=-90.1205&appid=YOUR_KEY"

# Check Supabase logs
supabase logs pull
```

#### 5. Voice Audit Transcription Not Working

```bash
# Check voice_audits table
SELECT * FROM voice_audits WHERE location_id = 'your-location-id';

# Check storage bucket for audio files
# In Supabase Dashboard > Storage > voice_audits

# Verify transcription service is running
# (Requires integration with speech-to-text API: Google Cloud Speech, Azure, etc.)
```

### Getting Help

**Resources:**
- Supabase Docs: https://supabase.com/docs
- Toast API Docs: https://developers.toasttab.com
- Square API Docs: https://developer.squareup.com/docs
- GitHub Issues: https://github.com/your-org/nola-park-inventory/issues

**Contact:**
- Technical Support: tech-support@nolapark.com
- Database Issues: db-team@nolapark.com
- POS Integration: pos-team@nolapark.com

---

## Security Best Practices

1. **Never commit .env files** - Add to .gitignore
2. **Rotate API keys regularly** - Every 90 days minimum
3. **Use different credentials per environment** - dev, staging, prod
4. **Enable RLS on all sensitive tables** - Always
5. **Audit all user actions** - Check audit_logs table
6. **Use HTTPS everywhere** - Enforce in production
7. **Keep dependencies updated** - Run `npm audit` weekly
8. **Use secrets management** - GitHub Secrets, 1Password, Vault, etc.

---

## Next Steps

1. ✅ Deploy schema to Supabase
2. ✅ Configure environment variables
3. ✅ Set up POS integrations
4. ✅ Enable weather forecasting
5. ⏳ Configure voice auditing (optional)
6. ⏳ Set up vendor EDI (optional)
7. ⏳ Enable ML demand forecasting (optional)
8. ⏳ Deploy to production

---

**Version:** 1.0.0  
**Last Updated:** 2024-01-15  
**Maintained By:** NOLA Park Operations Team
