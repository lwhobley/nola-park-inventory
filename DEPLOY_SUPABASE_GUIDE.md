# 🚀 Deploy Users Table to Supabase - Step by Step

## Your Supabase Project
- **Project ID:** palgbegkojkdiqgdcihp
- **URL:** https://palgbegkojkdiqgdcihp.supabase.co

## STEP 1: Go to Supabase Dashboard

1. Visit: https://app.supabase.com
2. Log in with your account (GitHub/Google)
3. Click on your project: **palgbegkojkdiqgdcihp**
4. You'll see the dashboard

## STEP 2: Open SQL Editor

1. On the left sidebar, click **"SQL Editor"**
2. Click **"New Query"** (top right)
3. You'll see a blank SQL editor

## STEP 3: Copy & Paste the SQL

Copy the entire SQL code below and paste it into the Supabase SQL Editor:

```sql
-- Create app_users table for NOLA Park inventory system
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pin TEXT NOT NULL UNIQUE,
  is_owner BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create index on PIN for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_users_pin ON app_users(pin);

-- Insert default owner user (Liffort Hobley with PIN 2445)
INSERT INTO app_users (name, pin, is_owner)
VALUES ('Liffort Hobley', '2445', true)
ON CONFLICT (pin) DO NOTHING;

-- Enable Row Level Security (optional)
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read
CREATE POLICY IF NOT EXISTS "Allow all users to read app_users"
  ON app_users
  FOR SELECT
  USING (true);
```

## STEP 4: Execute the Query

1. Click the **blue "Run" button** (or press Ctrl+Enter)
2. Wait for it to complete (should be instant)
3. You'll see: **"Success. No rows returned."**

That's it! ✅

## STEP 5: Verify It Worked

1. Go to **"Table Editor"** on the left sidebar
2. You should see a new table: **"app_users"**
3. Click on it to see the data
4. You should see one row:
   - **name:** Liffort Hobley
   - **pin:** 2445
   - **is_owner:** true

## What This Created

✅ **app_users table** with:
- id (unique identifier)
- name (user name)
- pin (4-digit PIN - unique)
- is_owner (owner flag)
- created_at (timestamp)
- updated_at (timestamp)

✅ **Index on PIN** for fast lookups

✅ **Default owner user:**
- Name: Liffort Hobley
- PIN: 2445
- Role: Owner

✅ **Security policies** for data access

## Next Steps

1. ✅ SQL deployed to Supabase
2. Deploy app to Netlify (Trigger Deploy)
3. Test on your iPhone with PIN: 2445
4. Create new users in Admin dashboard
5. Share app with your team!

## Troubleshooting

**If you get an error:**

1. Check that the SQL is copied completely
2. Make sure you're in the SQL Editor (not Table Editor)
3. Try running just the CREATE TABLE line first
4. Contact support if issues persist

**The app will still work without this step** - it will create the table automatically when you first login, but it's better to create it manually first.

## Questions?

If you have any issues:
1. Go to Supabase Dashboard
2. Click "?" icon (Help)
3. Click "Contact Support"
4. Describe the error

Good luck! 🚀
