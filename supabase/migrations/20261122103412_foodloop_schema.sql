/*
# FoodLoop — Core Schema

## Purpose
FoodLoop connects food donors, NGOs and volunteers to redistribute surplus edible food.
This migration creates the core tables, relationships and row-level security policies.

## New Tables

### 1. `profiles`
- `id` (uuid PK, references auth.users)
- `role` (text: donor | ngo | volunteer | admin)
- `full_name` (text)
- `organization_name` (text, nullable — for donors/ngos)
- `phone` (text, nullable)
- `location` (text, nullable — general area)
- `created_at` (timestamptz)

### 2. `food_listings`
- `id` (uuid PK)
- `donor_id` (uuid FK -> profiles.id, defaults to auth.uid())
- `food_name` (text)
- `category` (text: prepared | raw | packaged | bakery | dairy | produce | other)
- `quantity` (text — free-form, e.g. "50 meals" or "20 kg")
- `quantity_value` (int, nullable — numeric for matching/metrics)
- `unit` (text, nullable — meals | kg | boxes | litres | units)
- `preparation_time` (timestamptz — when food was prepared)
- `pickup_deadline` (timestamptz — must be picked up by this time)
- `location` (text — pickup address/area)
- `description` (text, nullable)
- `status` (text: available | claimed | picked_up | delivered | cancelled)
- `image_url` (text, nullable)
- `created_at` (timestamptz)

### 3. `food_requests`
- `id` (uuid PK)
- `ngo_id` (uuid FK -> profiles.id, defaults to auth.uid())
- `listing_id` (uuid FK -> food_listings.id)
- `people_count` (int — how many people the food will serve)
- `message` (text, nullable)
- `status` (text: pending | accepted | declined | fulfilled)
- `created_at` (timestamptz)

### 4. `pickup_tasks`
- `id` (uuid PK)
- `listing_id` (uuid FK -> food_listings.id)
- `volunteer_id` (uuid FK -> profiles.id, nullable, defaults to auth.uid())
- `donor_id` (uuid FK -> profiles.id)
- `ngo_id` (uuid FK -> profiles.id, nullable)
- `status` (text: assigned | in_transit | picked_up | delivered | cancelled)
- `pickup_address` (text)
- `delivery_address` (text, nullable)
- `notes` (text, nullable)
- `assigned_at` (timestamptz)
- `completed_at` (timestamptz, nullable)

## Security (RLS)
- `profiles`: authenticated users can read all profiles (needed for listings/tasks display);
  users can update only their own profile. Inserts are handled at signup via service flow,
  but authenticated users can insert their own profile row.
- `food_listings`: donors (authenticated) manage their own listings; any authenticated
  user can read available listings (NGOs browse, volunteers see tasks).
- `food_requests`: NGOs manage their own requests; listing owners (donors) can read
  requests on their listings; admins read all.
- `pickup_tasks`: volunteers manage tasks assigned to them; donors read tasks on their
  listings; admins read all.

## Grants
- CRUD grants to `authenticated` on all tables.
- `service_role` granted on all tables for edge-function use.
*/

-- ============ profiles ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('donor','ngo','volunteer','admin')),
  full_name text NOT NULL,
  organization_name text,
  phone text,
  location text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO service_role;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all"
ON profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============ food_listings ============
CREATE TABLE IF NOT EXISTS food_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  food_name text NOT NULL,
  category text NOT NULL CHECK (category IN ('prepared','raw','packaged','bakery','dairy','produce','other')),
  quantity text NOT NULL,
  quantity_value int,
  unit text,
  preparation_time timestamptz NOT NULL,
  pickup_deadline timestamptz NOT NULL,
  location text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available','claimed','picked_up','delivered','cancelled')),
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE food_listings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON food_listings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON food_listings TO service_role;

DROP POLICY IF EXISTS "listings_select_all" ON food_listings;
CREATE POLICY "listings_select_all"
ON food_listings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "listings_insert_own" ON food_listings;
CREATE POLICY "listings_insert_own"
ON food_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = donor_id);

DROP POLICY IF EXISTS "listings_update_own" ON food_listings;
CREATE POLICY "listings_update_own"
ON food_listings FOR UPDATE TO authenticated USING (auth.uid() = donor_id) WITH CHECK (auth.uid() = donor_id);

DROP POLICY IF EXISTS "listings_delete_own" ON food_listings;
CREATE POLICY "listings_delete_own"
ON food_listings FOR DELETE TO authenticated USING (auth.uid() = donor_id);

-- ============ food_requests ============
CREATE TABLE IF NOT EXISTS food_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES food_listings(id) ON DELETE CASCADE,
  people_count int NOT NULL CHECK (people_count > 0),
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','fulfilled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE food_requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON food_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON food_requests TO service_role;

-- NGO can see and manage their own requests
DROP POLICY IF EXISTS "requests_select_own_or_donor" ON food_requests;
CREATE POLICY "requests_select_own_or_donor"
ON food_requests FOR SELECT TO authenticated
USING (
  auth.uid() = ngo_id
  OR EXISTS (
    SELECT 1 FROM food_listings
    WHERE food_listings.id = food_requests.listing_id
    AND food_listings.donor_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "requests_insert_own" ON food_requests;
CREATE POLICY "requests_insert_own"
ON food_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = ngo_id);

DROP POLICY IF EXISTS "requests_update_own_or_donor" ON food_requests;
CREATE POLICY "requests_update_own_or_donor"
ON food_requests FOR UPDATE TO authenticated
USING (
  auth.uid() = ngo_id
  OR EXISTS (
    SELECT 1 FROM food_listings
    WHERE food_listings.id = food_requests.listing_id
    AND food_listings.donor_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = ngo_id
  OR EXISTS (
    SELECT 1 FROM food_listings
    WHERE food_listings.id = food_requests.listing_id
    AND food_listings.donor_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "requests_delete_own" ON food_requests;
CREATE POLICY "requests_delete_own"
ON food_requests FOR DELETE TO authenticated USING (auth.uid() = ngo_id);

-- ============ pickup_tasks ============
CREATE TABLE IF NOT EXISTS pickup_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES food_listings(id) ON DELETE CASCADE,
  volunteer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  donor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ngo_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned','in_transit','picked_up','delivered','cancelled')),
  pickup_address text NOT NULL,
  delivery_address text,
  notes text,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE pickup_tasks ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON pickup_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pickup_tasks TO service_role;

-- volunteer sees own tasks; donor sees tasks on their listings; admin sees all
DROP POLICY IF EXISTS "tasks_select_related" ON pickup_tasks;
CREATE POLICY "tasks_select_related"
ON pickup_tasks FOR SELECT TO authenticated
USING (
  auth.uid() = volunteer_id
  OR auth.uid() = donor_id
  OR auth.uid() = ngo_id
  OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- donors create tasks (assign to volunteers) or volunteers self-assign
DROP POLICY IF EXISTS "tasks_insert_donor_or_volunteer" ON pickup_tasks;
CREATE POLICY "tasks_insert_donor_or_volunteer"
ON pickup_tasks FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = donor_id
  OR auth.uid() = volunteer_id
  OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- volunteer updates own task; donor updates own listing task; admin updates all
DROP POLICY IF EXISTS "tasks_update_related" ON pickup_tasks;
CREATE POLICY "tasks_update_related"
ON pickup_tasks FOR UPDATE TO authenticated
USING (
  auth.uid() = volunteer_id
  OR auth.uid() = donor_id
  OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
)
WITH CHECK (
  auth.uid() = volunteer_id
  OR auth.uid() = donor_id
  OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "tasks_delete_related" ON pickup_tasks;
CREATE POLICY "tasks_delete_related"
ON pickup_tasks FOR DELETE TO authenticated
USING (
  auth.uid() = donor_id
  OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ============ Indexes ============
CREATE INDEX IF NOT EXISTS idx_food_listings_status ON food_listings(status);
CREATE INDEX IF NOT EXISTS idx_food_listings_donor ON food_listings(donor_id);
CREATE INDEX IF NOT EXISTS idx_food_requests_ngo ON food_requests(ngo_id);
CREATE INDEX IF NOT EXISTS idx_food_requests_listing ON food_requests(listing_id);
CREATE INDEX IF NOT EXISTS idx_pickup_tasks_volunteer ON pickup_tasks(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_pickup_tasks_donor ON pickup_tasks(donor_id);
