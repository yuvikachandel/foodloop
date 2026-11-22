import { useState } from 'react';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const { session, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Home', page: 'home' },
    { label: 'About', page: 'about' },
    { label: 'How It Works', page: 'how' },
    { label: 'Features', page: 'features' },
    { label: 'Impact', page: 'impact' },
    { label: 'Get Started', page: 'get-started' },
  ];

  function getDashboardPage(): string {
    if (!profile) return 'login';
    return `dashboard-${profile.role}`;
  }

  function handleNav(page: string) {
    onNavigate(page);
    setMobileOpen(false);
  }

  function handleSignOut() {
    signOut();
    onNavigate('home');
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-cream-50/90 backdrop-blur-md border-b border-cream-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button onClick={() => handleNav('home')} className="flex-shrink-0">
          <Logo />
        </button>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => handleNav(link.page)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === link.page
                  ? 'text-forest-700 bg-forest-50'
                  : 'text-forest-600 hover:text-forest-800 hover:bg-cream-100'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {session && profile ? (
            <>
              <button
                onClick={() => handleNav(getDashboardPage())}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-forest-700 bg-forest-50 hover:bg-forest-100 transition-colors"
                title="Go to your dashboard"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg text-forest-600 hover:bg-cream-100 hover:text-accent-600 transition-colors"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => handleNav('login')} className="btn-secondary text-sm">
                Sign In
              </button>
              <button onClick={() => handleNav('get-started')} className="btn-primary text-sm">
                Get Started
              </button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-lg text-forest-700 hover:bg-cream-100"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-cream-200 bg-cream-50 px-4 py-4 space-y-2 animate-slide-up">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => handleNav(link.page)}
              className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
                currentPage === link.page
                  ? 'text-forest-700 bg-forest-50'
                  : 'text-forest-600 hover:bg-cream-100'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-cream-200 space-y-2">
            {session && profile ? (
              <>
                <button onClick={() => handleNav(getDashboardPage())} className="flex items-center gap-2 w-full text-left btn-primary text-sm">
                  <LayoutDashboard size={16} />
                  Dashboard
                </button>
                <button onClick={handleSignOut} className="btn-secondary w-full text-sm">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => handleNav('login')} className="btn-secondary w-full text-sm">
                  Sign In
                </button>
                <button onClick={() => handleNav('get-started')} className="btn-primary w-full text-sm">
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
