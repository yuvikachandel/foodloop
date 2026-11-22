import { useState, useEffect, useCallback } from 'react';
import { Users, Package, Truck, TrendingDown, Building2, Bike, HandHeart, ShieldCheck } from 'lucide-react';
import { supabase, type Profile, type FoodListing, type PickupTask, STATUS_LABELS, STATUS_COLORS, ROLE_LABELS, type Role } from '@/lib/supabase';
import { DashboardShell, StatCard, EmptyState, LoadingState } from '@/components/DashboardShell';

export function AdminDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [tasks, setTasks] = useState<PickupTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'overview' | 'users' | 'listings' | 'tasks'>('overview');

  const loadAll = useCallback(async () => {
    const [pRes, lRes, tRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('food_listings').select('*').order('created_at', { ascending: false }),
      supabase.from('pickup_tasks').select('*, listing:food_listings(*)').order('assigned_at', { ascending: false }),
    ]);

    setProfiles((pRes.data as Profile[]) ?? []);
    setListings((lRes.data as FoodListing[]) ?? []);
    setTasks((tRes.data as PickupTask[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const roleCounts: Record<Role, number> = { donor: 0, ngo: 0, volunteer: 0, admin: 0 };
  profiles.forEach((p) => { roleCounts[p.role] = (roleCounts[p.role] || 0) + 1; });

  const statusCounts = {
    available: listings.filter((l) => l.status === 'available').length,
    claimed: listings.filter((l) => l.status === 'claimed' || l.status === 'picked_up').length,
    delivered: listings.filter((l) => l.status === 'delivered').length,
    cancelled: listings.filter((l) => l.status === 'cancelled').length,
  };

  const taskStats = {
    total: tasks.length,
    delivered: tasks.filter((t) => t.status === 'delivered').length,
    active: tasks.filter((t) => t.status !== 'delivered' && t.status !== 'cancelled').length,
  };

  const mealsDelivered = listings
    .filter((l) => l.status === 'delivered')
    .reduce((sum, l) => sum + (l.quantity_value ?? 0), 0);

  if (loading) {
    return (
      <DashboardShell title="Admin Dashboard" subtitle="Monitor platform activity" onNavigate={onNavigate}>
        <LoadingState />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Admin Dashboard"
      subtitle="Monitor users, listings and platform activity"
      onNavigate={onNavigate}
    >
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {(['overview', 'users', 'listings', 'tasks'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              view === v ? 'bg-forest-600 text-white' : 'bg-white text-forest-600 border border-forest-100 hover:bg-forest-50'
            }`}
          >
            {v === 'overview' ? 'Overview' : v === 'users' ? `Users (${profiles.length})` : v === 'listings' ? `Listings (${listings.length})` : `Tasks (${tasks.length})`}
          </button>
        ))}
      </div>

      {view === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={profiles.length} icon={<Users size={18} />} />
            <StatCard label="Food Listings" value={listings.length} icon={<Package size={18} />} color="cream" />
            <StatCard label="Pickup Tasks" value={tasks.length} icon={<Truck size={18} />} color="accent" />
            <StatCard label="Meals Delivered" value={mealsDelivered} icon={<TrendingDown size={18} />} color="forest" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold text-forest-900 mb-4">Users by Role</h3>
              <div className="space-y-3">
                <RoleBar label="Donors" count={roleCounts.donor} total={profiles.length} icon={<HandHeart size={16} />} color="bg-forest-500" />
                <RoleBar label="NGOs" count={roleCounts.ngo} total={profiles.length} icon={<Building2 size={16} />} color="bg-cream-500" />
                <RoleBar label="Volunteers" count={roleCounts.volunteer} total={profiles.length} icon={<Bike size={16} />} color="bg-accent-500" />
                <RoleBar label="Admins" count={roleCounts.admin} total={profiles.length} icon={<ShieldCheck size={16} />} color="bg-forest-700" />
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-forest-900 mb-4">Listing Status Breakdown</h3>
              <div className="space-y-3">
                <StatusRow label="Available" count={statusCounts.available} total={listings.length} color="bg-forest-500" />
                <StatusRow label="Claimed / Picked Up" count={statusCounts.claimed} total={listings.length} color="bg-accent-500" />
                <StatusRow label="Delivered" count={statusCounts.delivered} total={listings.length} color="bg-forest-600" />
                <StatusRow label="Cancelled" count={statusCounts.cancelled} total={listings.length} color="bg-cream-400" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-forest-900">Impact Summary</h3>
              <span className="text-xs text-forest-500 bg-cream-100 px-3 py-1 rounded-full">Live data from platform</span>
            </div>
            <p className="text-sm text-forest-600 mb-4">
              These numbers reflect real activity recorded in the database. When no data exists yet,
              they show zero — this is expected for a new platform.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-xl bg-forest-50">
                <p className="text-2xl font-bold text-forest-700">{mealsDelivered}</p>
                <p className="text-xs text-forest-600">Meals Delivered</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-cream-100">
                <p className="text-2xl font-bold text-cream-800">{statusCounts.available}</p>
                <p className="text-xs text-cream-700">Currently Available</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-accent-50">
                <p className="text-2xl font-bold text-accent-700">{taskStats.active}</p>
                <p className="text-xs text-accent-600">Active Tasks</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-forest-100">
                <p className="text-2xl font-bold text-forest-700">{taskStats.delivered}</p>
                <p className="text-xs text-forest-600">Completed Deliveries</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'users' && (
        <>
          {profiles.length === 0 ? (
            <EmptyState icon={<Users size={28} />} title="No users yet" message="Users will appear here after they register." />
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-forest-50 text-forest-700">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">Name</th>
                      <th className="text-left px-4 py-3 font-semibold">Role</th>
                      <th className="text-left px-4 py-3 font-semibold">Organization</th>
                      <th className="text-left px-4 py-3 font-semibold">Location</th>
                      <th className="text-left px-4 py-3 font-semibold">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-50">
                    {profiles.map((p) => (
                      <tr key={p.id} className="hover:bg-cream-50">
                        <td className="px-4 py-3 font-medium text-forest-900">{p.full_name}</td>
                        <td className="px-4 py-3">
                          <span className="badge bg-forest-100 text-forest-700">{ROLE_LABELS[p.role as Role]}</span>
                        </td>
                        <td className="px-4 py-3 text-forest-600">{p.organization_name ?? '—'}</td>
                        <td className="px-4 py-3 text-forest-600">{p.location ?? '—'}</td>
                        <td className="px-4 py-3 text-forest-500 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {view === 'listings' && (
        <>
          {listings.length === 0 ? (
            <EmptyState icon={<Package size={28} />} title="No listings yet" message="Food listings will appear here once donors start posting." />
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-forest-50 text-forest-700">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">Food</th>
                      <th className="text-left px-4 py-3 font-semibold">Category</th>
                      <th className="text-left px-4 py-3 font-semibold">Quantity</th>
                      <th className="text-left px-4 py-3 font-semibold">Location</th>
                      <th className="text-left px-4 py-3 font-semibold">Status</th>
                      <th className="text-left px-4 py-3 font-semibold">Deadline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-50">
                    {listings.map((l) => (
                      <tr key={l.id} className="hover:bg-cream-50">
                        <td className="px-4 py-3 font-medium text-forest-900">{l.food_name}</td>
                        <td className="px-4 py-3 text-forest-600 capitalize">{l.category}</td>
                        <td className="px-4 py-3 text-forest-600">{l.quantity}</td>
                        <td className="px-4 py-3 text-forest-600">{l.location}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${STATUS_COLORS[l.status]}`}>{STATUS_LABELS[l.status]}</span>
                        </td>
                        <td className="px-4 py-3 text-forest-500 text-xs">{new Date(l.pickup_deadline).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {view === 'tasks' && (
        <>
          {tasks.length === 0 ? (
            <EmptyState icon={<Truck size={28} />} title="No pickup tasks yet" message="Tasks will appear here when donors assign pickups." />
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-forest-50 text-forest-700">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">Food</th>
                      <th className="text-left px-4 py-3 font-semibold">Pickup</th>
                      <th className="text-left px-4 py-3 font-semibold">Delivery</th>
                      <th className="text-left px-4 py-3 font-semibold">Status</th>
                      <th className="text-left px-4 py-3 font-semibold">Assigned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-50">
                    {tasks.map((t) => (
                      <tr key={t.id} className="hover:bg-cream-50">
                        <td className="px-4 py-3 font-medium text-forest-900">{t.listing?.food_name ?? '—'}</td>
                        <td className="px-4 py-3 text-forest-600">{t.pickup_address}</td>
                        <td className="px-4 py-3 text-forest-600">{t.delivery_address ?? '—'}</td>
                        <td className="px-4 py-3 capitalize text-forest-600">{t.status.replace('_', ' ')}</td>
                        <td className="px-4 py-3 text-forest-500 text-xs">{new Date(t.assigned_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}

function RoleBar({ label, count, total, icon, color }: { label: string; count: number; total: number; icon: React.ReactNode; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="flex items-center gap-2 text-forest-700">{icon} {label}</span>
        <span className="text-forest-500 font-medium">{count}</span>
      </div>
      <div className="h-2 rounded-full bg-forest-50 overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatusRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-forest-700">{label}</span>
        <span className="text-forest-500 font-medium">{count}</span>
      </div>
      <div className="h-2 rounded-full bg-forest-50 overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
