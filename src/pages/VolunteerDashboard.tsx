import { useState, useEffect, useCallback } from 'react';
import { Bike, Package, MapPin, Clock, User, CheckCircle2, Truck, PackageCheck, AlertCircle } from 'lucide-react';
import { supabase, type PickupTask, type TaskStatus, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { DashboardShell, StatCard, EmptyState, LoadingState } from '@/components/DashboardShell';

export function VolunteerDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<PickupTask[]>([]);
  const [availableListings, setAvailableListings] = useState<PickupTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'available' | 'mytasks'>('available');

  const loadTasks = useCallback(async () => {
    if (!profile) return;

    const [openTasksRes, myTasksRes] = await Promise.all([
      supabase
        .from('pickup_tasks')
        .select('*, listing:food_listings(*), donor:profiles!pickup_tasks_donor_id_fkey(*), ngo:profiles!pickup_tasks_ngo_id_fkey(*)')
        .is('volunteer_id', null)
        .in('status', ['assigned'])
        .order('assigned_at', { ascending: false }),
      supabase
        .from('pickup_tasks')
        .select('*, listing:food_listings(*), donor:profiles!pickup_tasks_donor_id_fkey(*), ngo:profiles!pickup_tasks_ngo_id_fkey(*)')
        .eq('volunteer_id', profile.id)
        .order('assigned_at', { ascending: false }),
    ]);

    setAvailableListings((openTasksRes.data as unknown as PickupTask[]) ?? []);
    setTasks((myTasksRes.data as unknown as PickupTask[]) ?? []);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function claimTask(taskId: string) {
    if (!profile) return;
    const { error } = await supabase
      .from('pickup_tasks')
      .update({ volunteer_id: profile.id, status: 'assigned' })
      .eq('id', taskId)
      .is('volunteer_id', null);
    if (error) {
      alert(error.message);
    } else {
      loadTasks();
      setView('mytasks');
    }
  }

  async function updateStatus(taskId: string, status: TaskStatus) {
    const update: Record<string, unknown> = { status };
    if (status === 'delivered') {
      update.completed_at = new Date().toISOString();
    }
    const { error } = await supabase.from('pickup_tasks').update(update).eq('id', taskId);
    if (error) {
      alert(error.message);
    } else {
      loadTasks();
    }
  }

  const stats = {
    available: availableListings.length,
    myActive: tasks.filter((t) => t.status !== 'delivered' && t.status !== 'cancelled').length,
    delivered: tasks.filter((t) => t.status === 'delivered').length,
    inProgress: tasks.filter((t) => t.status === 'in_transit' || t.status === 'picked_up').length,
  };

  if (loading) {
    return (
      <DashboardShell title="Volunteer Dashboard" subtitle="Pick up and deliver food" onNavigate={onNavigate}>
        <LoadingState />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Volunteer Dashboard"
      subtitle="Find pickup tasks and track your deliveries"
      onNavigate={onNavigate}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Available Tasks" value={stats.available} icon={<Package size={18} />} />
        <StatCard label="My Active" value={stats.myActive} icon={<Bike size={18} />} color="accent" />
        <StatCard label="In Progress" value={stats.inProgress} icon={<Truck size={18} />} color="cream" />
        <StatCard label="Delivered" value={stats.delivered} icon={<CheckCircle2 size={18} />} color="forest" />
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('available')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'available' ? 'bg-forest-600 text-white' : 'bg-white text-forest-600 border border-forest-100 hover:bg-forest-50'}`}
        >
          Available Pickups
        </button>
        <button
          onClick={() => setView('mytasks')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'mytasks' ? 'bg-forest-600 text-white' : 'bg-white text-forest-600 border border-forest-100 hover:bg-forest-50'}`}
        >
          My Tasks ({tasks.length})
        </button>
      </div>

      {view === 'available' && (
        <>
          {availableListings.length === 0 ? (
            <EmptyState
              icon={<Bike size={28} />}
              title="No pickup tasks available"
              message="When donors assign pickup tasks, they'll appear here for you to claim."
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {availableListings.map((task) => (
                <AvailableTaskCard key={task.id} task={task} onClaim={() => claimTask(task.id)} />
              ))}
            </div>
          )}
        </>
      )}

      {view === 'mytasks' && (
        <>
          {tasks.length === 0 ? (
            <EmptyState
              icon={<Package size={28} />}
              title="No tasks yet"
              message="Claim an available pickup task to get started."
            />
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <MyTaskCard key={task.id} task={task} onUpdateStatus={updateStatus} />
              ))}
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}

function AvailableTaskCard({ task, onClaim }: { task: PickupTask; onClaim: () => void }) {
  const expired = task.listing && new Date(task.listing.pickup_deadline) < new Date();

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-forest-900">{task.listing?.food_name ?? 'Food pickup'}</h3>
          <p className="text-xs text-forest-500">{task.listing?.quantity}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-forest-700 mb-4">
        <div className="flex items-center gap-2"><MapPin size={14} className="text-forest-400" /> From: {task.pickup_address}</div>
        {task.delivery_address && (
          <div className="flex items-center gap-2"><MapPin size={14} className="text-accent-500" /> To: {task.delivery_address}</div>
        )}
        {task.donor && (
          <div className="flex items-center gap-2"><User size={14} className="text-forest-400" /> Donor: {task.donor.organization_name || task.donor.full_name}</div>
        )}
        {task.listing && (
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-forest-400" />
            Deadline: {new Date(task.listing.pickup_deadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
          </div>
        )}
      </div>

      {expired && (
        <div className="flex items-center gap-2 rounded-lg bg-cream-100 border border-cream-300 p-2 text-xs text-forest-800 mb-3">
          <AlertCircle size={14} /> Pickup deadline has passed
        </div>
      )}

      {task.notes && <p className="text-sm text-forest-600 bg-cream-50 rounded-lg p-3 mb-4">{task.notes}</p>}

      <button onClick={onClaim} disabled={!!expired} className="btn-primary w-full text-sm">
        <Bike size={16} /> Claim This Task
      </button>
    </div>
  );
}

function MyTaskCard({ task, onUpdateStatus }: { task: PickupTask; onUpdateStatus: (id: string, status: TaskStatus) => void }) {
  return (
    <div className="card p-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-forest-900">{task.listing?.food_name ?? 'Food pickup'}</h3>
            <span className={`badge ${TASK_STATUS_COLORS[task.status]}`}>{TASK_STATUS_LABELS[task.status]}</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-sm text-forest-700">
            <div className="flex items-center gap-2"><MapPin size={14} className="text-forest-400" /> Pickup: {task.pickup_address}</div>
            {task.delivery_address && (
              <div className="flex items-center gap-2"><MapPin size={14} className="text-accent-500" /> Drop: {task.delivery_address}</div>
            )}
            {task.donor && (
              <div className="flex items-center gap-2"><User size={14} className="text-forest-400" /> {task.donor.organization_name || task.donor.full_name}</div>
            )}
            {task.listing && (
              <div className="flex items-center gap-2"><Clock size={14} className="text-forest-400" /> By {new Date(task.listing.pickup_deadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
            )}
          </div>

          {task.notes && <p className="text-sm text-forest-600 bg-cream-50 rounded-lg p-3 mt-3">{task.notes}</p>}
        </div>

        <div className="flex flex-wrap gap-2 sm:w-auto">
          {task.status === 'assigned' && (
            <button onClick={() => onUpdateStatus(task.id, 'in_transit')} className="btn-secondary text-xs">
              <Truck size={14} /> Start Transit
            </button>
          )}
          {task.status === 'in_transit' && (
            <button onClick={() => onUpdateStatus(task.id, 'picked_up')} className="btn-secondary text-xs">
              <PackageCheck size={14} /> Mark Picked Up
            </button>
          )}
          {task.status === 'picked_up' && (
            <button onClick={() => onUpdateStatus(task.id, 'delivered')} className="btn-primary text-xs">
              <CheckCircle2 size={14} /> Mark Delivered
            </button>
          )}
          {(task.status === 'assigned' || task.status === 'in_transit') && (
            <button onClick={() => onUpdateStatus(task.id, 'cancelled')} className="btn-danger text-xs">
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
