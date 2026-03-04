# NOLA Park Inventory - Production Backend Setup Guide

## Step 1: Create Supabase Account & Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub/Google
4. Create a new organization
5. Create a new project:
   - Name: "nola-park-inventory"
   - Database password: (save this securely!)
   - Region: Select closest to you
6. Wait for project to initialize (~2 minutes)

## Step 2: Get Your API Keys

1. Go to Project Settings → API
2. Copy these values:
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_ANON_KEY`: Anon public key
3. Save them - you'll need these for the frontend

## Step 3: Create Database Tables

Go to SQL Editor in Supabase and run these queries:

### Users Table (handled by Supabase Auth - skip this)
Supabase Auth manages this automatically.

### Organizations Table
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Inventory Items
```sql
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  current_stock INT DEFAULT 0,
  reorder_level INT,
  max_quantity INT,
  cost_per_unit DECIMAL(10,2),
  selling_price DECIMAL(10,2),
  location TEXT,
  supplier_id TEXT,
  expiration_date DATE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_inventory_org ON inventory_items(organization_id);
CREATE INDEX idx_inventory_sku ON inventory_items(sku);
```

### Stock Transactions
```sql
CREATE TABLE stock_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id),
  transaction_type TEXT CHECK (transaction_type IN ('purchase', 'sale', 'adjustment', 'waste', 'return')),
  quantity INT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_transactions_org ON stock_transactions(organization_id);
CREATE INDEX idx_transactions_item ON stock_transactions(inventory_item_id);
CREATE INDEX idx_transactions_date ON stock_transactions(created_at);
```

### POS Transactions (Square/Toast sync)
```sql
CREATE TABLE pos_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  external_id TEXT UNIQUE,
  transaction_date TIMESTAMP,
  total_amount DECIMAL(10,2),
  items_sold INT,
  pos_system TEXT,
  synced_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_pos_org ON pos_transactions(organization_id);
CREATE INDEX idx_pos_date ON pos_transactions(transaction_date);
```

### Compliance & Lot Tracking
```sql
CREATE TABLE compliance_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id),
  lot_number TEXT NOT NULL,
  batch_date DATE,
  expiration_date DATE,
  quantity INT,
  supplier_info TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_compliance_org ON compliance_lots(organization_id);
CREATE INDEX idx_compliance_item ON compliance_lots(inventory_item_id);
```

### Waste Logs (FSMA 204)
```sql
CREATE TABLE waste_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id),
  quantity INT NOT NULL,
  reason TEXT,
  disposal_method TEXT,
  documented_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_waste_org ON waste_logs(organization_id);
CREATE INDEX idx_waste_date ON waste_logs(created_at);
```

### Audit Logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_audit_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_date ON audit_logs(created_at);
```

### AI Analytics (Stock Predictions)
```sql
CREATE TABLE ai_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id),
  prediction_type TEXT CHECK (prediction_type IN ('demand', 'stock_level', 'anomaly', 'reorder')),
  predicted_value DECIMAL(10,2),
  confidence DECIMAL(3,2),
  recommendation TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_analytics_org ON ai_analytics(organization_id);
CREATE INDEX idx_analytics_item ON ai_analytics(inventory_item_id);
```

## Step 4: Set Row Level Security (RLS)

Enable RLS on all tables:

```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only see their org data)
CREATE POLICY "Users can see organizations they're part of"
  ON organizations FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can see inventory for their org"
  ON inventory_items FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

-- Similar policies for other tables...
```

## Step 5: Environment Variables

Add to your `.env.local` file (don't commit to git):

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
REACT_APP_SUPABASE_POS_SYSTEM=square
```

## Step 6: Frontend Integration

The frontend will be updated to:
1. Use Supabase authentication (login/signup)
2. Load real data from database
3. Save all form submissions to database
4. Sync POS data automatically
5. Generate compliance reports
6. Run AI predictions

## Step 7: Backups & Security

Supabase provides:
- ✅ Daily automated backups
- ✅ Point-in-time recovery
- ✅ Encryption at rest
- ✅ SSL/TLS in transit
- ✅ DDoS protection

## Cost Estimate (for 20-50 users)

Free Tier includes:
- Up to 50,000 DB rows ✓
- Up to 1 GB file storage
- Auth for unlimited users ✓
- Real-time database ✓
- REST API ✓

Estimated cost: **$0/month** (free tier sufficient)

If you exceed limits:
- $25/month for Pro tier (500,000 rows)

## Next Steps

1. Create Supabase account
2. Set up tables using SQL above
3. I'll update the frontend to use Supabase
4. Test with sample data
5. Deploy and configure Netlify environment variables
