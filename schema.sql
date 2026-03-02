-- ============================================================================
-- NOLA City Park Multi-Location Inventory & Operations Engine
-- PostgreSQL Schema with Full FSMA 204 Compliance & Real-time POS Integration
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- 1. AUTHENTICATION & ORGANIZATION TABLES
-- ============================================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location_address TEXT,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'park_managed' or 'tenant'
  address TEXT,
  phone VARCHAR(20),
  manager_name VARCHAR(255),
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  timezone VARCHAR(50) DEFAULT 'America/Chicago',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(org_id, name)
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL, -- 'admin', 'manager', 'staff', 'tenant_operator'
  location_ids UUID[] DEFAULT ARRAY[]::UUID[], -- NULL = all locations
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 2. MASTER INVENTORY & PRODUCTS
-- ============================================================================

CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  edi_enabled BOOLEAN DEFAULT FALSE,
  edi_vendor_id VARCHAR(100),
  lead_time_days INTEGER DEFAULT 2,
  min_order_value DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sku VARCHAR(100) NOT NULL,
  barcode VARCHAR(100) UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- 'food', 'beverage', 'supplies', 'equipment'
  unit_type VARCHAR(50), -- 'each', 'lb', 'oz', 'gal', 'case', etc.
  unit_cost DECIMAL(10, 4) NOT NULL,
  supplier_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  reorder_point INTEGER DEFAULT 0,
  reorder_quantity INTEGER DEFAULT 10,
  par_level INTEGER DEFAULT 50,
  is_hazmat BOOLEAN DEFAULT FALSE,
  allergens TEXT[], -- JSON array: ['peanuts', 'shellfish', etc.]
  storage_location VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(org_id, sku)
);

CREATE INDEX idx_inventory_items_barcode ON inventory_items(barcode);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_org ON inventory_items(org_id);

-- ============================================================================
-- 3. INVENTORY TRACKING BY LOCATION
-- ============================================================================

CREATE TABLE location_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_on_hand INTEGER DEFAULT 0,
  quantity_reserved INTEGER DEFAULT 0, -- For pending transfers
  last_counted_at TIMESTAMP,
  last_counted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  variance_percent NUMERIC(5, 2), -- Actual vs. Theoretical
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(location_id, item_id)
);

CREATE INDEX idx_location_inventory_location ON location_inventory(location_id);
CREATE INDEX idx_location_inventory_item ON location_inventory(item_id);

-- ============================================================================
-- 4. RECIPE & POS MENU MAPPING
-- ============================================================================

CREATE TABLE pos_systems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  system_type VARCHAR(50) NOT NULL, -- 'toast', 'square', 'clover', 'custom'
  api_key VARCHAR(500),
  api_secret VARCHAR(500),
  webhook_url TEXT,
  sync_enabled BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  pos_menu_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100),
  price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  out_of_stock BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(location_id, pos_menu_id)
);

CREATE TABLE recipe_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_per_unit DECIMAL(10, 4) NOT NULL, -- e.g., 0.5 oz of vanilla per ice cream cone
  unit_type VARCHAR(50) NOT NULL, -- must match inventory_items.unit_type
  is_core_ingredient BOOLEAN DEFAULT FALSE, -- if TRUE, disables menu item on zero stock
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(menu_item_id, inventory_item_id)
);

CREATE INDEX idx_recipe_lines_menu_item ON recipe_lines(menu_item_id);
CREATE INDEX idx_recipe_lines_inventory_item ON recipe_lines(inventory_item_id);

-- ============================================================================
-- 5. POS SALES & AUTO-86 LOGIC
-- ============================================================================

CREATE TABLE pos_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  transaction_id VARCHAR(255), -- External POS transaction ID
  quantity_sold INTEGER NOT NULL,
  unit_price DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  transaction_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pos_transactions_location ON pos_transactions(location_id);
CREATE INDEX idx_pos_transactions_date ON pos_transactions(transaction_date DESC);

-- Table to track which menu items are disabled on POS (Auto-86)
CREATE TABLE menu_item_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID NOT NULL UNIQUE REFERENCES menu_items(id) ON DELETE CASCADE,
  is_disabled_on_pos BOOLEAN DEFAULT FALSE,
  disabled_reason VARCHAR(255), -- 'out_of_core_ingredient', 'maintenance', 'manual_disable'
  disabled_at TIMESTAMP,
  synced_to_pos BOOLEAN DEFAULT FALSE,
  last_sync_attempt TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 6. INVENTORY MOVEMENTS & TRANSFERS
-- ============================================================================

CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  movement_type VARCHAR(50) NOT NULL, -- 'purchase', 'count', 'waste', 'transfer_out', 'transfer_in', 'adjustment'
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10, 4),
  total_value DECIMAL(12, 2), -- quantity * unit_cost
  reference_id VARCHAR(255), -- PO number, receipt ID, etc.
  notes TEXT,
  recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  recorded_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT quantity_not_zero CHECK (quantity != 0)
);

CREATE INDEX idx_inventory_movements_location ON inventory_movements(location_id);
CREATE INDEX idx_inventory_movements_item ON inventory_movements(item_id);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX idx_inventory_movements_date ON inventory_movements(recorded_at DESC);

-- ============================================================================
-- 7. WASTAGE & SPOILAGE TRACKING
-- ============================================================================

CREATE TABLE waste_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_wasted INTEGER NOT NULL,
  unit_type VARCHAR(50),
  waste_reason VARCHAR(100) NOT NULL, -- 'spoilage', 'spillage', 'broken', 'overstock', 'pest_damage', 'temperature_breach'
  cost_impact DECIMAL(10, 2),
  documented_by UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  photo_url TEXT, -- URL to photo evidence for compliance
  recorded_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_waste_log_location ON waste_log(location_id);
CREATE INDEX idx_waste_log_item ON waste_log(item_id);
CREATE INDEX idx_waste_log_reason ON waste_log(waste_reason);

-- ============================================================================
-- 8. EQUIPMENT & MAINTENANCE
-- ============================================================================

CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  equipment_type VARCHAR(100), -- 'refrigerator', 'freezer', 'fryer', 'grill', etc.
  asset_id VARCHAR(100),
  serial_number VARCHAR(100),
  purchase_date DATE,
  last_service_date DATE,
  next_service_date DATE,
  maintenance_cost_ytd DECIMAL(10, 2) DEFAULT 0,
  is_operational BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE equipment_maintenance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  maintenance_type VARCHAR(50), -- 'routine', 'repair', 'inspection', 'calibration'
  description TEXT,
  cost DECIMAL(10, 2),
  vendor VARCHAR(255),
  performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  service_date TIMESTAMP NOT NULL,
  next_due_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_equipment_maintenance_equipment ON equipment_maintenance(equipment_id);

-- ============================================================================
-- 9. INTER-LOCATION TRANSFERS
-- ============================================================================

CREATE TABLE transfer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  from_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  to_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_requested INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'in_transit', 'received', 'cancelled'
  requested_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,
  received_by UUID REFERENCES users(id) ON DELETE SET NULL,
  received_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transfer_requests_from ON transfer_requests(from_location_id);
CREATE INDEX idx_transfer_requests_to ON transfer_requests(to_location_id);
CREATE INDEX idx_transfer_requests_status ON transfer_requests(status);

-- ============================================================================
-- 10. FSMA 204 TRACEABILITY (Food Safety Modernization Act)
-- ============================================================================

CREATE TABLE lot_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  lot_number VARCHAR(100) NOT NULL,
  batch_date DATE NOT NULL,
  received_date DATE NOT NULL,
  expiration_date DATE,
  supplier_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  quantity_received INTEGER NOT NULL,
  quantity_remaining INTEGER NOT NULL,
  unit_cost DECIMAL(10, 4),
  storage_location VARCHAR(100),
  is_quarantined BOOLEAN DEFAULT FALSE,
  quarantine_reason TEXT,
  document_url TEXT, -- Certificate of Analysis, etc.
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(location_id, item_id, lot_number)
);

CREATE INDEX idx_lot_tracking_location ON lot_tracking(location_id);
CREATE INDEX idx_lot_tracking_expiration ON lot_tracking(expiration_date);
CREATE INDEX idx_lot_tracking_item ON lot_tracking(item_id);

-- ============================================================================
-- 11. FINANCIAL & COST OF GOODS SOLD (COGS)
-- ============================================================================

CREATE TABLE cogs_reconciliation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  theoretical_cogs DECIMAL(12, 2), -- Calculated from POS sales
  actual_cogs DECIMAL(12, 2), -- Calculated from physical count
  variance_amount DECIMAL(12, 2),
  variance_percent NUMERIC(5, 2),
  total_sales DECIMAL(12, 2),
  cogs_percent NUMERIC(5, 2), -- (actual_cogs / total_sales) * 100
  shrinkage_percent NUMERIC(5, 2), -- Variance percent
  notes TEXT,
  reconciled_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reconciled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(location_id, period_start_date, period_end_date)
);

CREATE INDEX idx_cogs_location ON cogs_reconciliation(location_id);

-- ============================================================================
-- 12. AI FORECASTING & WEATHER INTEGRATION
-- ============================================================================

CREATE TABLE weather_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  forecast_date DATE NOT NULL,
  high_temp_f NUMERIC(5, 2),
  low_temp_f NUMERIC(5, 2),
  rainfall_inches NUMERIC(5, 2),
  humidity_percent NUMERIC(5, 2),
  wind_mph NUMERIC(5, 2),
  conditions VARCHAR(100), -- 'sunny', 'rainy', 'cloudy', 'stormy'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(location_id, forecast_date)
);

CREATE TABLE demand_forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  forecast_date DATE NOT NULL,
  predicted_quantity INTEGER,
  confidence_level NUMERIC(3, 2), -- 0.0 to 1.0
  forecast_method VARCHAR(50), -- 'ml_model', 'weather_based', 'historical_avg'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(location_id, item_id, forecast_date)
);

CREATE INDEX idx_demand_forecasts_location ON demand_forecasts(location_id);
CREATE INDEX idx_demand_forecasts_item ON demand_forecasts(item_id);

-- ============================================================================
-- 13. ORDERS & PURCHASING
-- ============================================================================

CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE SET NULL,
  po_number VARCHAR(100) UNIQUE NOT NULL,
  order_date DATE NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'confirmed', 'received', 'cancelled'
  total_amount DECIMAL(12, 2),
  edi_sent BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE purchase_order_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_ordered INTEGER NOT NULL,
  unit_cost DECIMAL(10, 4),
  line_total DECIMAL(12, 2),
  quantity_received INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_purchase_orders_location ON purchase_orders(location_id);
CREATE INDEX idx_purchase_orders_vendor ON purchase_orders(vendor_id);
CREATE INDEX idx_purchase_order_lines_po ON purchase_order_lines(po_id);

-- ============================================================================
-- 14. VOICE INVENTORY AUDITING
-- ============================================================================

CREATE TABLE voice_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  audit_date TIMESTAMP NOT NULL,
  started_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  audio_file_url TEXT,
  transcription TEXT, -- Raw voice-to-text output
  confidence_score NUMERIC(3, 2),
  duration_minutes INTEGER,
  items_counted INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE TABLE voice_audit_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id UUID NOT NULL REFERENCES voice_audits(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_counted INTEGER,
  voice_segment_timestamp INTEGER, -- Seconds into audio
  confidence NUMERIC(3, 2),
  manually_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_voice_audit_items_audit ON voice_audit_items(audit_id);

-- ============================================================================
-- 15. AUDIT LOGS & COMPLIANCE
-- ============================================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL, -- 'create', 'update', 'delete', 'export'
  entity_type VARCHAR(100), -- 'inventory_item', 'location', 'purchase_order', etc.
  entity_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at DESC);

-- ============================================================================
-- 16. NOTIFICATIONS & ALERTS
-- ============================================================================

CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  alert_type VARCHAR(100) NOT NULL, -- 'low_stock', 'expiration_warning', 'equipment_maintenance', 'temp_breach', 'variance_alert'
  item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
  severity VARCHAR(20) DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
  title VARCHAR(255),
  message TEXT,
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMP,
  action_taken TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX idx_alerts_location ON alerts(location_id);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_unacknowledged ON alerts(is_acknowledged);

-- ============================================================================
-- 17. EVENTS & FORECASTING ADJUSTMENTS
-- ============================================================================

CREATE TABLE park_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_name VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  expected_attendance INTEGER,
  description TEXT,
  affects_locations UUID[] DEFAULT ARRAY[]::UUID[], -- Which locations to adjust forecasts for
  forecast_boost_percent NUMERIC(5, 2) DEFAULT 0, -- e.g., 25 = 25% increase
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(org_id, event_name, event_date)
);

-- ============================================================================
-- 18. PERMISSION OVERRIDES FOR TENANT LOCATIONS
-- ============================================================================

CREATE TABLE location_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  can_view_inventory BOOLEAN DEFAULT FALSE,
  can_edit_inventory BOOLEAN DEFAULT FALSE,
  can_view_sales BOOLEAN DEFAULT FALSE,
  can_view_financials BOOLEAN DEFAULT FALSE,
  can_manage_transfers BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(location_id, user_id)
);

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function to update location_inventory when movement is recorded
CREATE OR REPLACE FUNCTION update_location_inventory_from_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.movement_type IN ('purchase', 'transfer_in', 'count', 'adjustment') THEN
    UPDATE location_inventory
    SET quantity_on_hand = quantity_on_hand + NEW.quantity,
        updated_at = NOW()
    WHERE location_id = NEW.location_id AND item_id = NEW.item_id;
  ELSIF NEW.movement_type IN ('waste', 'transfer_out') THEN
    UPDATE location_inventory
    SET quantity_on_hand = MAX(0, quantity_on_hand - NEW.quantity),
        updated_at = NOW()
    WHERE location_id = NEW.location_id AND item_id = NEW.item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory_from_movement
AFTER INSERT ON inventory_movements
FOR EACH ROW
EXECUTE FUNCTION update_location_inventory_from_movement();

-- Function to check for low stock and create alerts
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity_on_hand <= (SELECT reorder_point FROM inventory_items WHERE id = NEW.item_id) THEN
    INSERT INTO alerts (location_id, item_id, alert_type, severity, title, message, created_at)
    VALUES (
      NEW.location_id,
      NEW.item_id,
      'low_stock',
      'high',
      'Low Stock Alert',
      'Item ' || (SELECT name FROM inventory_items WHERE id = NEW.item_id) || ' is below reorder point.',
      NOW()
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_low_stock
AFTER UPDATE ON location_inventory
FOR EACH ROW
WHEN (NEW.quantity_on_hand < OLD.quantity_on_hand)
EXECUTE FUNCTION check_low_stock();

-- Function to check recipe core ingredients and disable menu items (Auto-86)
CREATE OR REPLACE FUNCTION check_menu_item_stock()
RETURNS TRIGGER AS $$
DECLARE
  v_menu_item_id UUID;
  v_recipe_line RECORD;
  v_stock_ok BOOLEAN;
BEGIN
  -- Find all menu items that use this inventory item as a core ingredient
  FOR v_recipe_line IN
    SELECT DISTINCT rl.menu_item_id
    FROM recipe_lines rl
    WHERE rl.inventory_item_id = NEW.item_id AND rl.is_core_ingredient = TRUE
  LOOP
    -- Check if stock is zero
    IF NEW.quantity_on_hand <= 0 THEN
      -- Disable the menu item
      INSERT INTO menu_item_status (menu_item_id, is_disabled_on_pos, disabled_reason, disabled_at)
      VALUES (v_recipe_line.menu_item_id, TRUE, 'out_of_core_ingredient', NOW())
      ON CONFLICT (menu_item_id) DO UPDATE
      SET is_disabled_on_pos = TRUE,
          disabled_reason = 'out_of_core_ingredient',
          disabled_at = NOW(),
          synced_to_pos = FALSE;

      -- Update menu_items table
      UPDATE menu_items
      SET out_of_stock = TRUE,
          last_updated = NOW()
      WHERE id = v_recipe_line.menu_item_id;
    ELSE
      -- Re-enable the menu item if stock is restored
      UPDATE menu_item_status
      SET is_disabled_on_pos = FALSE,
          disabled_reason = NULL,
          disabled_at = NULL,
          synced_to_pos = FALSE
      WHERE menu_item_id = v_recipe_line.menu_item_id
        AND disabled_reason = 'out_of_core_ingredient';

      UPDATE menu_items
      SET out_of_stock = FALSE,
          last_updated = NOW()
      WHERE id = v_recipe_line.menu_item_id;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_menu_item_stock
AFTER UPDATE ON location_inventory
FOR EACH ROW
EXECUTE FUNCTION check_menu_item_stock();

-- Function to deduct inventory from POS sales
CREATE OR REPLACE FUNCTION deduct_inventory_from_sale()
RETURNS TRIGGER AS $$
DECLARE
  v_recipe_line RECORD;
  v_location_id UUID;
BEGIN
  -- Get location_id from menu_item
  SELECT location_id INTO v_location_id FROM menu_items WHERE id = NEW.menu_item_id;

  -- Deduct each ingredient from the recipe
  FOR v_recipe_line IN
    SELECT inventory_item_id, quantity_per_unit
    FROM recipe_lines
    WHERE menu_item_id = NEW.menu_item_id
  LOOP
    INSERT INTO inventory_movements (
      location_id, item_id, movement_type, quantity,
      reference_id, notes, recorded_by, recorded_at
    ) VALUES (
      v_location_id,
      v_recipe_line.inventory_item_id,
      'sale',
      -1 * CEIL(NEW.quantity_sold * v_recipe_line.quantity_per_unit)::INTEGER,
      NEW.transaction_id,
      'Auto-deducted from POS sale',
      NULL,
      NEW.transaction_date
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deduct_inventory_from_sale
AFTER INSERT ON pos_transactions
FOR EACH ROW
EXECUTE FUNCTION deduct_inventory_from_sale();

-- Function to audit changes
CREATE OR REPLACE FUNCTION audit_table_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Determine org_id based on table
  CASE TG_TABLE_NAME
    WHEN 'inventory_items' THEN v_org_id := NEW.org_id;
    WHEN 'locations' THEN v_org_id := NEW.org_id;
    WHEN 'users' THEN v_org_id := NEW.org_id;
    ELSE v_org_id := NULL;
  END CASE;

  INSERT INTO audit_logs (
    org_id, user_id, action, entity_type, entity_id,
    old_values, new_values, created_at
  ) VALUES (
    v_org_id,
    NULL,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    to_jsonb(OLD),
    to_jsonb(NEW),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_inventory_items
AFTER INSERT OR UPDATE OR DELETE ON inventory_items
FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

CREATE TRIGGER audit_locations
AFTER INSERT OR UPDATE OR DELETE ON locations
FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

-- ============================================================================
-- MATERIALIZED VIEWS FOR REPORTING
-- ============================================================================

CREATE MATERIALIZED VIEW inventory_health_by_location AS
SELECT
  li.location_id,
  l.name as location_name,
  ii.id as item_id,
  ii.name as item_name,
  ii.category,
  li.quantity_on_hand,
  ii.reorder_point,
  ii.par_level,
  CASE
    WHEN li.quantity_on_hand <= 0 THEN 'out_of_stock'
    WHEN li.quantity_on_hand <= ii.reorder_point THEN 'critical'
    WHEN li.quantity_on_hand <= ii.par_level THEN 'low'
    ELSE 'adequate'
  END as stock_status,
  (ii.unit_cost * li.quantity_on_hand) as inventory_value,
  li.last_counted_at
FROM location_inventory li
JOIN locations l ON li.location_id = l.id
JOIN inventory_items ii ON li.item_id = ii.id;

CREATE INDEX idx_inventory_health_location ON inventory_health_by_location(location_id);

-- ============================================================================
-- SAMPLE DATA (Remove in Production)
-- ============================================================================

INSERT INTO organizations (id, name, location_address)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'New Orleans City Park', '1 Palm Drive, New Orleans, LA 70124');

INSERT INTO locations (id, org_id, name, type, address, phone, manager_name, latitude, longitude)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Carousel Gardens Concession', 'park_managed', '1 Palm Drive, New Orleans, LA 70124', '(504) 555-0100', 'Sarah Johnson', 30.1178, -90.1203),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Big Lake Snack Bar', 'park_managed', '1 Palm Drive, New Orleans, LA 70124', '(504) 555-0101', 'Marcus Lee', 30.1195, -90.1210),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Cafe Du Monde', 'tenant', '1 Palm Drive, New Orleans, LA 70124', '(504) 555-0102', 'Marie Dubois', 30.1188, -90.1205);

INSERT INTO vendors (id, org_id, name, contact_email, contact_phone, edi_enabled, lead_time_days)
VALUES
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Gulf Coast Food Distributor', 'orders@gulfcoast.com', '(504) 555-1000', FALSE, 2),
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Fresh Produce Co.', 'sales@freshproduce.com', '(504) 555-1001', FALSE, 1);

INSERT INTO inventory_items (id, org_id, sku, barcode, name, category, unit_type, unit_cost, supplier_id, reorder_point, par_level)
VALUES
  ('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', 'VANILLA-001', '8718293847561', 'Vanilla Ice Cream', 'food', 'gal', 12.50, '550e8400-e29b-41d4-a716-446655440010', 2, 8),
  ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440000', 'COKE-001', '4006381333035', 'Coca-Cola Syrup', 'beverage', 'gal', 25.00, '550e8400-e29b-41d4-a716-446655440010', 1, 4),
  ('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440000', 'NAPKIN-001', '7061107045678', 'Napkins (case)', 'supplies', 'case', 8.50, '550e8400-e29b-41d4-a716-446655440010', 5, 15);

-- ============================================================================
-- GRANTS (Adjust based on your actual Supabase user)
-- ============================================================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
-- GRANT USAGE ON SCHEMA public TO authenticated;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

COMMIT;
