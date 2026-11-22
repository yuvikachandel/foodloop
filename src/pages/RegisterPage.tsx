import { useState } from 'react';
import { Mail, Lock, User, Phone, MapPin, Building2, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Logo } from '@/components/Logo';
import type { Role } from '@/lib/supabase';
import { ROLE_LABELS } from '@/lib/supabase';

const ROLES: { value: Role; label: string; description: string }[] = [
  { value: 'donor', label: 'Food Donor', description: 'I have surplus food to share' },
  { value: 'ngo', label: 'NGO / Charity', description: 'I serve people who need food' },
  { value: 'volunteer', label: 'Volunteer', description: 'I can pick up and deliver food' },
];

export function RegisterPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { signUp } = useAuth();
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [role, setRole] = useState<Role | null>(null);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    organization_name: '',
    phone: '',
    location: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    setError(null);
    setLoading(true);

    const { error } = await signUp(form.email, form.password, {
      role,
      full_name: form.full_name,
      organization_name: role === 'donor' || role === 'ngo' ? form.organization_name : undefined,
      phone: form.phone || undefined,
      location: form.location || undefined,
    });

    setLoading(false);
    if (error) {
      setError(error);
    } else {
      onNavigate('dashboard');
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-cream-50 to-champagne/40">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <button
            onClick={() => onNavigate('back')}
            className="inline-flex items-center gap-2 text-sm font-medium text-forest-600 hover:text-forest-800 transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-forest-900 mb-2">Join FoodLoop</h1>
          <p className="text-sm text-forest-600">Help reduce food waste in your community</p>
        </div>

        <div className="card p-8">
          {step === 'role' && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-semibold text-forest-800 mb-4">I want to join as a...</h2>
              <div className="space-y-3">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => {
                      setRole(r.value);
                      setStep('details');
                    }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      role === r.value
                        ? 'border-forest-500 bg-forest-50'
                        : 'border-forest-100 bg-white hover:border-forest-300 hover:bg-forest-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-forest-800">{r.label}</p>
                        <p className="text-sm text-forest-600">{r.description}</p>
                      </div>
                      <ArrowRight size={20} className="text-forest-400" />
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-forest-600 pt-4">
                Already have an account?{' '}
                <button onClick={() => onNavigate('login')} className="font-semibold text-forest-700 hover:underline">
                  Sign in
                </button>
              </p>
            </div>
          )}

          {step === 'details' && role && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-forest-50 text-sm text-forest-700">
                <CheckCircle2 size={18} className="text-forest-500" />
                Joining as <strong>{ROLE_LABELS[role]}</strong>
                <button type="button" onClick={() => setStep('role')} className="ml-auto text-forest-600 hover:underline font-medium">
                  Change
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-cream-100 border border-cream-300 p-3 text-sm text-forest-800">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) => updateField('full_name', e.target.value)}
                    className="input pl-10"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>

              {(role === 'donor' || role === 'ngo') && (
                <div>
                  <label className="label">
                    {role === 'donor' ? 'Organization / Business Name' : 'Organization Name'}
                  </label>
                  <div className="relative">
                    <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
                    <input
                      type="text"
                      value={form.organization_name}
                      onChange={(e) => updateField('organization_name', e.target.value)}
                      className="input pl-10"
                      placeholder={role === 'donor' ? 'Sunrise Restaurant' : 'Hope Community Kitchen'}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="input pl-10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className="input pl-10"
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone (optional)</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="input pl-10"
                      placeholder="+1 555 0000"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Location (optional)</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      className="input pl-10"
                      placeholder="City, Area"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3">
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
