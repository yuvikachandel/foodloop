import type { ReactNode } from 'react';
import { LogOut, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Logo } from '@/components/Logo';
import { ROLE_LABELS } from '@/lib/supabase';

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  onNavigate: (page: string) => void;
  actions?: ReactNode;
}

export function DashboardShell({ title, subtitle, children, onNavigate, actions }: Props) {
  const { profile, signOut } = useAuth();

  function handleSignOut() {
    signOut();
    onNavigate('home');
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => onNavigate('back')}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-forest-600 hover:text-forest-800 hover:bg-forest-50 rounded-lg px-2 py-1 transition-colors"
                title="Back to previous page"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-forest-900">{title}</h1>
            <p className="text-sm text-forest-600 mt-1">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <button
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-forest-700 bg-forest-50 hover:bg-forest-100 transition-colors"
              title="Go to your dashboard"
            >
              <LayoutDashboard size={16} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-cream-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-forest-800">{profile?.full_name}</p>
                <p className="text-xs text-forest-500">{profile && ROLE_LABELS[profile.role]}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg text-forest-600 hover:bg-cream-100 hover:text-accent-600 transition-colors"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StatCard({
  label, value, icon, color = 'forest',
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: 'forest' | 'cream' | 'accent' | 'copper';
}) {
  const colors = {
    forest: 'bg-forest-100 text-forest-700',
    cream: 'bg-cream-200 text-cream-800',
    accent: 'bg-accent-100 text-accent-700',
    copper: 'bg-accent-200 text-accent-800',
  };
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-forest-900">{value}</p>
      <p className="text-sm text-forest-600">{label}</p>
    </div>
  );
}

export function EmptyState({ icon, title, message }: { icon: ReactNode; title: string; message: string }) {
  return (
    <div className="card p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-cream-100 flex items-center justify-center mx-auto mb-4 text-accent-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-forest-800 mb-1">{title}</h3>
      <p className="text-sm text-forest-600">{message}</p>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-3 text-forest-600">
        <div className="w-5 h-5 border-2 border-cream-300 border-t-accent-500 rounded-full animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    </div>
  );
}
