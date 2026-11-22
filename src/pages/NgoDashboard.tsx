import { useState, useEffect, useCallback } from 'react';
import { Search, Package, Clock, MapPin, Users, HandHeart, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { supabase, CATEGORY_LABELS, CATEGORY_ICONS, type FoodListing, type FoodRequest, type FoodCategory } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { DashboardShell, StatCard, EmptyState, LoadingState } from '@/components/DashboardShell';

export function NgoDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { profile } = useAuth();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [myRequests, setMyRequests] = useState<FoodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FoodCategory | 'all'>('all');
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [peopleCount, setPeopleCount] = useState('');
  const [message, setMessage] = useState('');
  const [view, setView] = useState<'browse' | 'requests'>('browse');

  const loadAll = useCallback(async () => {
    if (!profile) return;
    const [listingsRes, reqRes] = await Promise.all([
      supabase
        .from('food_listings')
        .select('*, donor:profiles!food_listings_donor_id_fkey(*)')
        .eq('status', 'available')
        .order('created_at', { ascending: false }),
      supabase
        .from('food_requests')
        .select('*, listing:food_listings(*)')
        .eq('ngo_id', profile.id)
        .order('created_at', { ascending: false }),
    ]);

    if (listingsRes.data) setListings(listingsRes.data as unknown as FoodListing[]);
    if (reqRes.data) setMyRequests(reqRes.data as unknown as FoodRequest[]);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function submitRequest(listingId: string) {
    if (!profile) return;
    const count = parseInt(peopleCount, 10);
    if (!count || count < 1) {
      alert('Please enter how many people this food will serve.');
      return;
    }
    const { error } = await supabase.from('food_requests').insert({
      ngo_id: profile.id,
      listing_id: listingId,
      people_count: count,
      message: message || null,
    });
    if (error) {
      alert(error.message);
    } else {
      setRequestingId(null);
      setPeopleCount('');
      setMessage('');
      loadAll();
    }
  }

  const filtered = listings.filter((l) => {
    const matchesSearch = !search ||
      l.food_name.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || l.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    available: listings.length,
    pending: myRequests.filter((r) => r.status === 'pending').length,
    accepted: myRequests.filter((r) => r.status === 'accepted' || r.status === 'fulfilled').length,
    fulfilled: myRequests.filter((r) => r.status === 'fulfilled').length,
  };

  if (loading) {
    return (
      <DashboardShell title="NGO Dashboard" subtitle="Browse and request available food" onNavigate={onNavigate}>
        <LoadingState />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="NGO Dashboard"
      subtitle="Browse available food and manage your requests"
      onNavigate={onNavigate}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Available Food" value={stats.available} icon={<Package size={18} />} />
        <StatCard label="Pending Requests" value={stats.pending} icon={<Clock size={18} />} color="cream" />
        <StatCard label="Accepted" value={stats.accepted} icon={<CheckCircle2 size={18} />} color="accent" />
        <StatCard label="Fulfilled" value={stats.fulfilled} icon={<HandHeart size={18} />} color="forest" />
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('browse')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'browse' ? 'bg-forest-600 text-white' : 'bg-white text-forest-600 border border-forest-100 hover:bg-forest-50'}`}
        >
          Browse Food
        </button>
        <button
          onClick={() => setView('requests')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'requests' ? 'bg-forest-600 text-white' : 'bg-white text-forest-600 border border-forest-100 hover:bg-forest-50'}`}
        >
          My Requests ({myRequests.length})
        </button>
      </div>

      {view === 'browse' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
                placeholder="Search by food name or location..."
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as FoodCategory | 'all')}
              className="input sm:w-48"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Package size={28} />}
              title="No food available"
              message="Check back later — new listings appear as donors post surplus food."
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((listing) => (
                <BrowseCard
                  key={listing.id}
                  listing={listing}
                  onRequest={() => setRequestingId(listing.id)}
                  isRequesting={requestingId === listing.id}
                  peopleCount={peopleCount}
                  setPeopleCount={setPeopleCount}
                  message={message}
                  setMessage={setMessage}
                  onSubmit={() => submitRequest(listing.id)}
                  onCancel={() => { setRequestingId(null); setPeopleCount(''); setMessage(''); }}
                />
              ))}
            </div>
          )}
        </>
      )}

      {view === 'requests' && (
        <>
          {myRequests.length === 0 ? (
            <EmptyState
              icon={<HandHeart size={28} />}
              title="No requests yet"
              message="Browse available food and request what your community needs."
            />
          ) : (
            <div className="space-y-3">
              {myRequests.map((req) => (
                <RequestRow key={req.id} request={req} />
              ))}
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}

function BrowseCard({ listing, onRequest, isRequesting, peopleCount, setPeopleCount, message, setMessage, onSubmit, onCancel }: {
  listing: FoodListing;
  onRequest: () => void;
  isRequesting: boolean;
  peopleCount: string;
  setPeopleCount: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const expired = new Date(listing.pickup_deadline) < new Date();
  const donorName = listing.donor?.organization_name || listing.donor?.full_name || 'Unknown donor';

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{CATEGORY_ICONS[listing.category]}</span>
          <div>
            <h3 className="font-semibold text-forest-900">{listing.food_name}</h3>
            <p className="text-xs text-forest-500">{CATEGORY_LABELS[listing.category]} &middot; by {donorName}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm text-forest-700 mb-4">
        <div className="flex items-center gap-2"><Package size={14} className="text-forest-400" /> {listing.quantity}</div>
        <div className="flex items-center gap-2"><MapPin size={14} className="text-forest-400" /> {listing.location}</div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-forest-400" />
          Pickup by: {new Date(listing.pickup_deadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
        </div>
      </div>

      {expired && (
        <div className="flex items-center gap-2 rounded-lg bg-cream-100 border border-cream-300 p-2 text-xs text-forest-800 mb-3">
          <AlertCircle size={14} /> Pickup deadline has passed
        </div>
      )}

      {listing.description && (
        <p className="text-sm text-forest-600 bg-cream-50 rounded-lg p-3 mb-4">{listing.description}</p>
      )}

      {!isRequesting ? (
        <button onClick={onRequest} disabled={expired} className="btn-primary w-full text-sm">
          <HandHeart size={16} /> Request This Food
        </button>
      ) : (
        <div className="space-y-3 animate-fade-in">
          <div>
            <label className="label">How many people will this serve?</label>
            <input
              type="number"
              min="1"
              value={peopleCount}
              onChange={(e) => setPeopleCount(e.target.value)}
              className="input"
              placeholder="e.g. 30"
              autoFocus
            />
          </div>
          <div>
            <label className="label">Message to donor (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input min-h-[60px] resize-y"
              placeholder="Any notes for the donor"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={onCancel} className="btn-secondary text-sm flex-1">Cancel</button>
            <button onClick={onSubmit} className="btn-primary text-sm flex-1">Submit Request</button>
          </div>
        </div>
      )}
    </div>
  );
}

function RequestRow({ request }: { request: FoodRequest }) {
  const statusColors: Record<string, string> = {
    pending: 'bg-cream-200 text-cream-800',
    accepted: 'bg-forest-100 text-forest-700',
    declined: 'bg-cream-100 text-forest-800',
    fulfilled: 'bg-forest-500 text-white',
  };
  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock size={14} />,
    accepted: <CheckCircle2 size={14} />,
    declined: <XCircle size={14} />,
    fulfilled: <CheckCircle2 size={14} />,
  };

  return (
    <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-forest-900">{request.listing?.food_name ?? 'Food listing'}</h3>
          <span className={`badge ${statusColors[request.status]}`}>{statusIcons[request.status]} {request.status}</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-forest-600">
          <span className="flex items-center gap-1"><Users size={14} /> {request.people_count} people</span>
          {request.listing && (
            <span className="flex items-center gap-1"><MapPin size={14} /> {request.listing.location}</span>
          )}
          <span className="text-xs">Requested {new Date(request.created_at).toLocaleDateString()}</span>
        </div>
        {request.message && <p className="text-sm text-forest-600 mt-2 italic">"{request.message}"</p>}
      </div>
    </div>
  );
}
