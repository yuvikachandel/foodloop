import { useState, useEffect, useCallback } from 'react';
import { Plus, Package, Clock, MapPin, Utensils, Trash2, Edit3, AlertTriangle } from 'lucide-react';
import { supabase, CATEGORY_LABELS, CATEGORY_ICONS, STATUS_LABELS, STATUS_COLORS, type FoodListing } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { DashboardShell, StatCard, EmptyState, LoadingState } from '@/components/DashboardShell';
import { ListingForm } from '@/components/ListingForm';

export function DonorDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { profile } = useAuth();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FoodListing | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'claimed' | 'delivered'>('all');

  const loadListings = useCallback(async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from('food_listings')
      .select('*')
      .eq('donor_id', profile.id)
      .order('created_at', { ascending: false });
    if (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
    setListings((data as FoodListing[]) ?? []);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    const { error } = await supabase.from('food_listings').delete().eq('id', id);
    if (error) {
      alert(error.message);
    } else {
      loadListings();
    }
  }

  async function handleCancel(id: string) {
    const { error } = await supabase.from('food_listings').update({ status: 'cancelled' }).eq('id', id);
    if (error) {
      alert(error.message);
    } else {
      loadListings();
    }
  }

  const filtered = listings.filter((l) => filter === 'all' || l.status === filter);

  const stats = {
    total: listings.length,
    available: listings.filter((l) => l.status === 'available').length,
    claimed: listings.filter((l) => l.status === 'claimed' || l.status === 'picked_up').length,
    delivered: listings.filter((l) => l.status === 'delivered').length,
  };

  if (loading) {
    return (
      <DashboardShell title="Donor Dashboard" subtitle="Manage your surplus food listings" onNavigate={onNavigate}>
        <LoadingState />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Donor Dashboard"
      subtitle="Manage your surplus food listings"
      onNavigate={onNavigate}
      actions={
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="btn-primary text-sm"
        >
          <Plus size={16} /> List Food
        </button>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Listings" value={stats.total} icon={<Package size={18} />} />
        <StatCard label="Available" value={stats.available} icon={<Utensils size={18} />} color="cream" />
        <StatCard label="In Progress" value={stats.claimed} icon={<Clock size={18} />} color="accent" />
        <StatCard label="Delivered" value={stats.delivered} icon={<MapPin size={18} />} color="forest" />
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {(['all', 'available', 'claimed', 'delivered'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f ? 'bg-forest-600 text-white' : 'bg-white text-forest-600 border border-forest-100 hover:bg-forest-50'
            }`}
          >
            {f === 'all' ? 'All' : STATUS_LABELS[f as keyof typeof STATUS_LABELS] ?? f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package size={28} />}
          title={listings.length === 0 ? 'No listings yet' : 'No listings in this category'}
          message={listings.length === 0 ? 'Click "List Food" to share your first surplus food listing.' : 'Try a different filter.'}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onEdit={() => { setEditing(listing); setShowForm(true); }}
              onDelete={() => handleDelete(listing.id)}
              onCancel={() => handleCancel(listing.id)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <ListingForm
          editing={editing}
          onClose={() => setShowForm(false)}
          onSaved={loadListings}
        />
      )}
    </DashboardShell>
  );
}

function ListingCard({ listing, onEdit, onDelete, onCancel }: {
  listing: FoodListing;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const expired = new Date(listing.pickup_deadline) < new Date() && listing.status === 'available';
  const canEdit = listing.status === 'available';

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{CATEGORY_ICONS[listing.category]}</span>
          <div>
            <h3 className="font-semibold text-forest-900">{listing.food_name}</h3>
            <p className="text-xs text-forest-500">{CATEGORY_LABELS[listing.category]}</p>
          </div>
        </div>
        <span className={`badge ${STATUS_COLORS[listing.status]}`}>{STATUS_LABELS[listing.status]}</span>
      </div>

      <div className="space-y-2 text-sm text-forest-700 mb-4">
        <div className="flex items-center gap-2"><Utensils size={14} className="text-forest-400" /> {listing.quantity}</div>
        <div className="flex items-center gap-2"><MapPin size={14} className="text-forest-400" /> {listing.location}</div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-forest-400" />
          Pickup by: {new Date(listing.pickup_deadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
        </div>
      </div>

      {expired && (
        <div className="flex items-center gap-2 rounded-lg bg-cream-100 border border-cream-300 p-2 text-xs text-forest-800 mb-3">
          <AlertTriangle size={14} /> Pickup deadline has passed
        </div>
      )}

      {listing.description && (
        <p className="text-sm text-forest-600 bg-cream-50 rounded-lg p-3 mb-4">{listing.description}</p>
      )}

      <div className="flex gap-2">
        {canEdit && (
          <button onClick={onEdit} className="btn-secondary text-xs px-3 py-2 flex-1">
            <Edit3 size={14} /> Edit
          </button>
        )}
        {listing.status === 'available' && (
          <button onClick={onCancel} className="btn-danger text-xs px-3 py-2 flex-1">
            Cancel
          </button>
        )}
        {canEdit && (
          <button onClick={onDelete} className="btn-danger text-xs px-3 py-2">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
