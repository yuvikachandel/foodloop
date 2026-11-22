import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase environment variables are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export type Role = 'donor' | 'ngo' | 'volunteer' | 'admin';

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  organization_name: string | null;
  phone: string | null;
  location: string | null;
  created_at: string;
}

export type FoodCategory =
  | 'prepared'
  | 'raw'
  | 'packaged'
  | 'bakery'
  | 'dairy'
  | 'produce'
  | 'other';

export type ListingStatus =
  | 'available'
  | 'claimed'
  | 'picked_up'
  | 'delivered'
  | 'cancelled';

export interface FoodListing {
  id: string;
  donor_id: string;
  food_name: string;
  category: FoodCategory;
  quantity: string;
  quantity_value: number | null;
  unit: string | null;
  preparation_time: string;
  pickup_deadline: string;
  location: string;
  description: string | null;
  status: ListingStatus;
  image_url: string | null;
  created_at: string;
  donor?: Profile;
}

export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'fulfilled';

export interface FoodRequest {
  id: string;
  ngo_id: string;
  listing_id: string;
  people_count: number;
  message: string | null;
  status: RequestStatus;
  created_at: string;
  ngo?: Profile;
  listing?: FoodListing;
}

export type TaskStatus =
  | 'assigned'
  | 'in_transit'
  | 'picked_up'
  | 'delivered'
  | 'cancelled';

export interface PickupTask {
  id: string;
  listing_id: string;
  volunteer_id: string | null;
  donor_id: string;
  ngo_id: string | null;
  status: TaskStatus;
  pickup_address: string;
  delivery_address: string | null;
  notes: string | null;
  assigned_at: string;
  completed_at: string | null;
  listing?: FoodListing;
  volunteer?: Profile | null;
  donor?: Profile;
  ngo?: Profile | null;
}

export const CATEGORY_LABELS: Record<FoodCategory, string> = {
  prepared: 'Prepared Food',
  raw: 'Raw Ingredients',
  packaged: 'Packaged',
  bakery: 'Bakery',
  dairy: 'Dairy',
  produce: 'Produce',
  other: 'Other',
};

export const CATEGORY_ICONS: Record<FoodCategory, string> = {
  prepared: '🍽️',
  raw: '🥬',
  packaged: '📦',
  bakery: '🥖',
  dairy: '🥛',
  produce: '🍎',
  other: '🍴',
};

export const STATUS_LABELS: Record<ListingStatus, string> = {
  available: 'Available',
  claimed: 'Claimed',
  picked_up: 'Picked Up',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const STATUS_COLORS: Record<ListingStatus, string> = {
  available: 'bg-forest-100 text-forest-700',
  claimed: 'bg-cream-200 text-cream-800',
  picked_up: 'bg-accent-100 text-accent-700',
  delivered: 'bg-forest-500 text-white',
  cancelled: 'bg-cream-100 text-forest-800',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  assigned: 'Assigned',
  in_transit: 'In Transit',
  picked_up: 'Picked Up',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  assigned: 'bg-cream-200 text-cream-800',
  in_transit: 'bg-accent-100 text-accent-700',
  picked_up: 'bg-accent-200 text-accent-800',
  delivered: 'bg-forest-500 text-white',
  cancelled: 'bg-cream-100 text-forest-800',
};

export const ROLE_LABELS: Record<Role, string> = {
  donor: 'Food Donor',
  ngo: 'NGO / Charity',
  volunteer: 'Volunteer',
  admin: 'Administrator',
};
