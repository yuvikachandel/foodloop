import { useState } from 'react';
import { Mail, Lock, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Logo } from '@/components/Logo';

export function LoginPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      onNavigate('dashboard');
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-cream-50 to-champagne/40">
      <div className="w-full max-w-md">
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
          <h1 className="text-2xl font-bold text-forest-900 mb-2">Welcome back</h1>
          <p className="text-sm text-forest-600">Sign in to access your FoodLoop dashboard</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-cream-100 border border-cream-300 p-3 text-sm text-forest-800">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3">
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="text-center text-sm text-forest-600 mt-6">
            Don't have an account?{' '}
            <button onClick={() => onNavigate('register')} className="font-semibold text-forest-700 hover:underline">
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
