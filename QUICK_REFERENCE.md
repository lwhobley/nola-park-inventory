# NOLA City Park Inventory Engine - Quick Reference & Setup Checklist

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          NOLA CITY PARK OPERATIONS                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    FRONTEND LAYER                                │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │  React (Web Dashboard)  │  React Native/Expo (Mobile Staff App)  │  │
│  │  ├─ Inventory Dashboard │  ├─ Voice Auditing                    │  │
│  │  ├─ COGS Analytics      │  ├─ Quick Stock Check                │  │
│  │  ├─ Transfer Mgmt       │  ├─ Waste Logging                    │  │
│  │  └─ Reporting           │  └─ Equipment Maintenance            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                              ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │               STATE MANAGEMENT & CACHING                         │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │  TanStack Query (Offline-First)                                  │  │
│  │  ├─ Automatic cache invalidation                                │  │
│  │  ├─ Optimistic updates                                          │  │
│  │  ├─ Background sync                                             │  │
│  │  └─ LocalStorage persistence (24-hour cache)                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                              ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │          SUPABASE (Backend as a Service)                        │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │  ┌─ PostgreSQL Database (18 tables + triggers)                  │  │
│  │  │  └─ Row-Level Security (RLS) for multi-tenant isolation     │  │
│  │  │                                                               │  │
│  │  ├─ Real-time Listeners                                         │  │
│  │  │  ├─ Inventory changes (location_inventory)                  │  │
│  │  │  ├─ Alerts (low stock, equipment maintenance)               │  │
│  │  │  └─ Menu item status changes (Auto-86 sync)                 │  │
│  │  │                                                               │  │
│  │  ├─ Storage Buckets                                             │  │
│  │  │  ├─ voice_audits (audio recordings)                         │  │
│  │  │  ├─ compliance_photos (waste evidence, temp breaches)      │  │
│  │  │  └─ documents (COAs, receipts)                              │  │
│  │  │                                                               │  │
│  │  ├─ Authentication (Supabase Auth)                              │  │
│  │  │  └─ OAuth 2.0 with email/password fallback                  │  │
│  │  │                                                               │  │
│  │  └─ Edge Functions (scheduled tasks)                            │  │
│  │     ├─ Sync POS every 5 minutes                                 │  │
│  │     ├─ Fetch weather daily                                      │  │
│  │     └─ Generate demand forecasts                                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│         ▼           ▼              ▼              ▼                     │
│  ┌──────────┐ ┌────────────┐ ┌─────────────┐ ┌────────────┐           │
│  │  TOAST   │ │  SQUARE    │ │ OPENWEATHER │ │ TWILIO SMS │           │
│  │  POS     │ │  POS       │ │ API         │ │ ALERTS     │           │
│  └──────────┘ └────────────┘ └─────────────┘ └────────────┘           │
│      ▼            ▼              ▼              ▼                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              INTEGRATION LAYER (External APIs)                  │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │  Auto-86 Sync      │ Weather Forecasting  │ Demand Prediction  │  │
│  │  ├─ Toast menu     │ ├─ Daily forecast    │ ├─ ML model (future)  │  │
│  │  └─ Square catalog │ └─ Alert triggers    │ └─ Historical data    │  │
│  │                                                                  │  │
│  │  Vendor EDI (Optional)                                         │  │
│  │  ├─ Auto-generate POs based on stock levels                   │  │
│  │  └─ EDI 850/855 formatting                                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │          KEY FEATURES & AUTOMATION                              │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │  ✅ Real-time POS Auto-86 (disable items at zero stock)         │  │
│  │  ✅ Automatic inventory deduction from sales                    │  │
│  │  ✅ Weather-based demand adjustments                            │  │
│  │  ✅ Multi-location transfer tracking                            │  │
│  │  ✅ FSMA 204 lot number traceability                            │  │
│  │  ✅ Voice-to-text auditing (hands-free)                         │  │
│  │  ✅ COGS variance analysis & alerts                             │  │
│  │  ✅ Equipment maintenance scheduling                            │  │
│  │  ✅ Tenant operator isolation (Cafe Du Monde access control)   │  │
│  │  ✅ Offline-first with automatic sync                           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Overview

### Core Tables (18 Total)

**Authentication & Organization (2 tables)**
- `organizations` - Multi-tenant support for parks/companies
- `users` - Staff members with roles and location permissions
- `locations` - Park outlets (Carousel Gardens, Big Lake, Cafe Du Monde)

**Inventory Management (4 tables)**
- `inventory_items` - Master product list with barcodes, costs, par levels
- `location_inventory` - Real-time stock levels per location
- `vendors` - Suppliers with EDI capability
- `lot_tracking` - FSMA 204 traceability (lot numbers, expiration dates)

**POS Integration (5 tables)**
- `pos_systems` - Toast/Square configuration per location
- `menu_items` - POS menu items mapped to inventory
- `recipe_lines` - Ingredients per menu item (for auto-deduction)
- `pos_transactions` - Synced sales data from Toast/Square
- `menu_item_status` - Auto-86 tracking (disabled items)

**Operations (4 tables)**
- `inventory_movements` - Stock in/out/waste/transfers
- `waste_log` - Spoilage tracking with reason codes
- `transfer_requests` - Inter-location stock movements (approval workflow)
- `equipment` - Freezers, fryers, refrigerators, etc.
- `equipment_maintenance` - Service history & costs

**Financial & Compliance (3 tables)**
- `cogs_reconciliation` - Theoretical vs actual cost of goods sold
- `purchase_orders` - Vendor orders (PO generation automation)
- `audit_logs` - All user actions (for compliance audits)

**AI & Forecasting (2 tables)**
- `weather_data` - Daily NOLA weather forecasts
- `demand_forecasts` - Predicted stock needs based on weather/events

**Notifications & Alerts (2 tables)**
- `alerts` - Low stock, expiration, temperature breaches, variance warnings
- `park_events` - Special events that boost expected demand

---

## Setup Checklist

### Phase 1: Database Setup (1-2 hours)

- [ ] Create Supabase project
  - [ ] Sign up at supabase.com
  - [ ] Create new project (US Virginia region)
  - [ ] Save credentials: URL, Anon Key, Service Role Key

- [ ] Deploy schema.sql
  - [ ] Open Supabase SQL Editor
  - [ ] Copy schema.sql into new query
  - [ ] Run execution
  - [ ] Verify all 18 tables created

- [ ] Enable Row-Level Security
  - [ ] Enable RLS on all sensitive tables
  - [ ] Create org isolation policy
  - [ ] Create tenant operator policy (if needed)

- [ ] Create Storage Buckets
  - [ ] voice_audits
  - [ ] compliance_photos
  - [ ] documents

### Phase 2: Environment & Credentials (1-2 hours)

- [ ] Copy .env.template to .env.local
- [ ] Fill in Supabase credentials
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY

- [ ] Set up Toast POS (if using)
  - [ ] Get Toast API credentials
  - [ ] Register webhook endpoint
  - [ ] Save TOAST_API_BASE_URL, TOAST_OAUTH_CLIENT_ID, TOAST_OAUTH_CLIENT_SECRET
  - [ ] Test connection: `npm run test:toast-sync`

- [ ] Set up Square POS (if using)
  - [ ] Create Square Developer app
  - [ ] Configure OAuth redirect URI
  - [ ] Get Application ID & Secret
  - [ ] Test connection: `npm run test:square-sync`

- [ ] Set up Weather API
  - [ ] Sign up at openweathermap.org
  - [ ] Get free API key
  - [ ] Test endpoint with NOLA coordinates

### Phase 3: Application Setup (1-2 hours)

- [ ] Clone repository & install dependencies
  ```bash
  git clone <repo>
  cd nola-park-inventory
  npm install
  ```

- [ ] Start development server
  ```bash
  npm start
  ```

- [ ] Create test organization & locations
  - [ ] Insert into `organizations` table
  - [ ] Insert Carousel Gardens, Big Lake, Cafe Du Monde locations
  - [ ] Create test users with appropriate roles

- [ ] Create test inventory items
  - [ ] Insert sample products (ice cream, soda syrup, napkins)
  - [ ] Add barcodes for scanning
  - [ ] Set reorder points and par levels

- [ ] Set up menu items & recipes
  - [ ] Create menu items (e.g., "Vanilla Ice Cream Cone")
  - [ ] Create recipe lines (0.5 oz vanilla per cone)
  - [ ] Mark as core ingredients

### Phase 4: Testing (1-2 hours)

- [ ] Test Supabase connection
  ```bash
  npm run test:supabase-connection
  ```

- [ ] Test inventory deduction from POS
  - [ ] Simulate POS sale
  - [ ] Verify location_inventory updated
  - [ ] Check inventory_movements table

- [ ] Test Auto-86 logic
  - [ ] Set item quantity to 0
  - [ ] Verify menu_item_status.is_disabled_on_pos = TRUE
  - [ ] Verify Toast/Square menu updated

- [ ] Test voice auditing
  - [ ] Record short audio
  - [ ] Verify transcription works
  - [ ] Check voice_audits table

- [ ] Test alerts
  - [ ] Create low stock condition
  - [ ] Verify alert created
  - [ ] Verify notification sent

### Phase 5: Deployment (2-4 hours)

- [ ] Deploy frontend to Vercel
  - [ ] Push to GitHub
  - [ ] Connect to Vercel
  - [ ] Set environment variables
  - [ ] Deploy: `vercel --prod`

- [ ] Deploy React Native to Expo
  - [ ] Create Expo account
  - [ ] Build Android: `eas build --platform android --auto-submit`
  - [ ] Build iOS: `eas build --platform ios --auto-submit`

- [ ] Deploy Supabase Edge Functions
  - [ ] Create sync-pos-transactions function
  - [ ] Deploy: `supabase functions deploy`

- [ ] Set up scheduled tasks
  - [ ] POS sync every 5 minutes
  - [ ] Weather sync daily
  - [ ] Demand forecast daily

- [ ] Configure monitoring
  - [ ] Set up Sentry for errors
  - [ ] Set up Vercel analytics
  - [ ] Set up database monitoring

---

## Feature Rollout Roadmap

### MVP (Week 1)
- [x] Inventory tracking by location
- [x] POS sales auto-deduction
- [x] Low stock alerts
- [x] Basic reporting

### Phase 2 (Week 2-3)
- [ ] Toast/Square Auto-86 sync
- [ ] Weather-based forecasting
- [ ] Multi-location transfers
- [ ] Voice auditing

### Phase 3 (Week 4-6)
- [ ] FSMA 204 compliance tracking
- [ ] COGS variance analysis
- [ ] Equipment maintenance scheduling
- [ ] Tenant operator isolation

### Future (Post-launch)
- [ ] ML demand prediction
- [ ] Vendor EDI integration
- [ ] Advanced analytics dashboard
- [ ] Mobile push notifications

---

## Key Database Triggers

All of these run automatically:

1. **`trigger_update_inventory_from_movement`** 
   - When: Record added to `inventory_movements`
   - Does: Updates `location_inventory` quantity

2. **`trigger_check_low_stock`**
   - When: Stock falls below reorder point
   - Does: Creates alert in `alerts` table

3. **`trigger_check_menu_item_stock`** (Auto-86)
   - When: Core ingredient stock hits zero
   - Does: Sets `menu_item_status.is_disabled_on_pos = TRUE`

4. **`trigger_deduct_inventory_from_sale`**
   - When: POS transaction inserted
   - Does: Creates inventory movement & deducts recipe ingredients

5. **`trigger_audit_changes`**
   - When: Any change to inventory_items, locations, users
   - Does: Logs change to `audit_logs` for compliance

---

## API Rate Limits & Quotas

| Service | Limit | Frequency | Cost |
|---------|-------|-----------|------|
| Supabase | 100 req/sec | Variable | Free tier included |
| Toast API | 300 req/min | Real-time | Included with POS |
| Square API | 100 req/sec | Real-time | Included with POS |
| OpenWeather | 60 calls/min | Daily | Free tier (1000/day) |
| Twilio SMS | Pay-as-you-go | Per alert | ~$0.0075 per SMS |
| Vercel | 100 Gib/month | Per deployment | Free tier included |

---

## File Structure

```
nola-park-inventory/
├── src/
│   ├── App.js (main component with Supabase setup)
│   ├── config/
│   │   └── environment.js (loads .env variables)
│   ├── context/
│   │   ├── AuthContext.js
│   │   ├── InventoryContext.js
│   │   └── POSIntegrationContext.js
│   ├── hooks/
│   │   ├── useNetworkStatus.js
│   │   ├── useInventoryMovements.js
│   │   ├── useDemandForecast.js
│   │   └── useWeatherData.js
│   ├── screens/
│   │   ├── InventoryDashboard.js
│   │   ├── TransferManager.js
│   │   ├── VoiceAudit.js
│   │   ├── Alerts.js
│   │   └── Reporting.js
│   ├── components/
│   │   ├── OfflineIndicator.js
│   │   ├── NotificationCenter.js
│   │   └── ErrorBoundary.js
│   └── utils/
│       ├── calculateTheoreticalCOGS.js
│       ├── generatePurchaseOrder.js
│       └── recordVoiceAudit.js
├── supabase/
│   ├── migrations/
│   │   └── schema.sql (complete database schema)
│   └── functions/
│       ├── sync-pos-transactions/
│       ├── fetch-weather/
│       └── generate-forecasts/
├── .env.template (all required env variables)
├── app.json (Expo configuration)
├── package.json
└── README.md
```

---

## Common Commands

```bash
# Development
npm start                    # Start dev server
npm run test:supabase        # Test Supabase connection
npm run test:toast-sync      # Test Toast POS sync
npm run sync:pos             # Manual POS sync

# Deployment
npm run build                # Build for production
vercel --prod                # Deploy to Vercel
eas build --platform android # Build Android APK
eas build --platform ios     # Build iOS app

# Database
supabase db pull             # Download latest schema
supabase db push             # Upload schema changes
supabase functions deploy    # Deploy edge functions

# Testing
npm test                     # Run all tests
npm run test:schema          # Test database schema
npm run test:triggers        # Test database triggers
npm run test:inventory-flow  # Test end-to-end inventory
```

---

## Support & Resources

**Documentation:**
- Supabase: https://supabase.com/docs
- Toast API: https://developers.toasttab.com
- Square API: https://developer.squareup.com
- React Query: https://tanstack.com/query/latest
- Expo: https://docs.expo.dev

**Team Contacts:**
- Liffort W. Hobley (Project Owner)
- Database Team: db-team@nolapark.com
- POS Integration: pos-team@nolapark.com
- Technical Support: tech-support@nolapark.com

---

## License & Security

- **License:** Proprietary (New Orleans City Park)
- **Compliance:** FSMA 204, FDA guidelines
- **Security:** Supabase RLS, encryption at rest & in transit
- **Data Retention:** 2 years (per FDA regulations)

---

**Last Updated:** March 2, 2026  
**Version:** 1.0.0-beta  
**Status:** Ready for Implementation
