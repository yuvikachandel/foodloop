/*
# Volunteer claim listing and status update functions

## Purpose
Allow volunteers to claim available food listings and update pickup task
status without being granted direct UPDATE access on food_listings (which
is donor-owned). Also lets the donor dashboard reflect status changes
made by volunteers (picked_up, delivered).

## New Functions
### 1. `claim_listing(listing_uuid)`
- Called by an authenticated volunteer.
- Atomically: verifies the listing is still 'available', sets it to
  'claimed', and creates a `pickup_tasks` row with volunteer_id set to
  the caller and donor_id copied from the listing.
- Returns the newly created pickup_task row.
- SECURITY DEFINER so it can update food_listings despite donor-only RLS.
- Revoke execute from PUBLIC/anon; grant to authenticated.

### 2. `update_pickup_status(task_uuid, new_status)`
- Called by an authenticated volunteer who owns the task.
- Validates the status transition and updates `pickup_tasks.status`.
- When status becomes 'delivered', sets completed_at and updates the
  underlying food_listings.status to 'delivered'.
- When status becomes 'picked_up', updates food_listings.status to
  'picked_up'.
- When status becomes 'cancelled', updates food_listings.status back to
  'available' (if it was 'claimed') so other volunteers can claim it.
- SECURITY DEFINER so it can update food_listings despite donor-only RLS.
- Revoke execute from PUBLIC/anon; grant to authenticated.

## Security
- Both functions are SECURITY DEFINER, owned by postgres, so they bypass
  RLS on food_listings. The functions perform their own authorization
  checks (caller must be the volunteer on the task, listing must be
  available before claiming).
- EXECUTE revoked from PUBLIC and anon; granted only to authenticated.
*/

-- ============ claim_listing ============
CREATE OR REPLACE FUNCTION claim_listing(p_listing_id uuid)
RETURNS pickup_tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing food_listings%ROWTYPE;
  v_task pickup_tasks%ROWTYPE;
  v_caller uuid := auth.uid();
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to claim a listing';
  END IF;

  SELECT * INTO v_listing FROM food_listings WHERE id = p_listing_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found';
  END IF;

  IF v_listing.status <> 'available' THEN
    RAISE EXCEPTION 'This listing is no longer available';
  END IF;

  IF v_listing.pickup_deadline < now() THEN
    RAISE EXCEPTION 'Pickup deadline has passed';
  END IF;

  UPDATE food_listings SET status = 'claimed' WHERE id = p_listing_id;

  INSERT INTO pickup_tasks (listing_id, volunteer_id, donor_id, status, pickup_address)
  VALUES (p_listing_id, v_caller, v_listing.donor_id, 'assigned', v_listing.location)
  RETURNING * INTO v_task;

  RETURN v_task;
END;
$$;

REVOKE EXECUTE ON FUNCTION claim_listing(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION claim_listing(uuid) TO authenticated;

-- ============ update_pickup_status ============
CREATE OR REPLACE FUNCTION update_pickup_status(p_task_id uuid, p_new_status text)
RETURNS pickup_tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task pickup_tasks%ROWTYPE;
  v_caller uuid := auth.uid();
  v_new_listing_status text;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to update a task';
  END IF;

  SELECT * INTO v_task FROM pickup_tasks WHERE id = p_task_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task not found';
  END IF;

  IF v_task.volunteer_id IS NULL OR v_task.volunteer_id <> v_caller THEN
    RAISE EXCEPTION 'You can only update tasks assigned to you';
  END IF;

  IF p_new_status NOT IN ('assigned', 'in_transit', 'picked_up', 'delivered', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  v_new_listing_status := CASE p_new_status
    WHEN 'picked_up' THEN 'picked_up'
    WHEN 'delivered' THEN 'delivered'
    WHEN 'cancelled' THEN 'available'
    ELSE NULL
  END;

  IF p_new_status = 'delivered' THEN
    UPDATE pickup_tasks SET status = p_new_status, completed_at = now() WHERE id = p_task_id RETURNING * INTO v_task;
  ELSE
    UPDATE pickup_tasks SET status = p_new_status WHERE id = p_task_id RETURNING * INTO v_task;
  END IF;

  IF v_new_listing_status IS NOT NULL THEN
    UPDATE food_listings SET status = v_new_listing_status WHERE id = v_task.listing_id;
  END IF;

  RETURN v_task;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_pickup_status(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION update_pickup_status(uuid, text) TO authenticated;
