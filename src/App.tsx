import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Chatbot } from '@/components/Chatbot';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DonorDashboard } from '@/pages/DonorDashboard';
import { NgoDashboard } from '@/pages/NgoDashboard';
import { VolunteerDashboard } from '@/pages/VolunteerDashboard';
import { AdminDashboard } from '@/pages/AdminDashboard';
import type { Role } from '@/lib/supabase';

function pageFromHash(hash: string): string {
  if (!hash || hash === '#' || hash === '#home') return 'home';
  return hash.slice(1);
}

function pageToHash(page: string): string {
  return `#${page}`;
}

function AppContent() {
  const { session, profile, loading } = useAuth();
  const [page, setPage] = useState<string>(() => pageFromHash(window.location.hash));
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('home');

  const resolvePage = useCallback((target: string, role?: string | null): string => {
    if (target === 'dashboard' && role) return `dashboard-${role}`;
    return target;
  }, []);

  // Listen to browser back/forward (popstate) and update page accordingly.
  useEffect(() => {
    function onPopState() {
      const next = pageFromHash(window.location.hash);
      setPage(next);
      setActiveSection(next === 'home' ? 'home' : '');
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Auth guard flags — declared before the effect that uses them
  const isDashboardPage = page.startsWith('dashboard-');
  const isRegisterRolePage = page.startsWith('register-');
  const requestedRole = isDashboardPage ? page.replace('dashboard-', '') : null;
  const registerRole = isRegisterRolePage ? (page.replace('register-', '') as Role) : null;

  // Auto-redirect to dashboard when logged in and on auth pages
  useEffect(() => {
    if (session && profile && (page === 'login' || page === 'register' || isRegisterRolePage)) {
      const dash = `dashboard-${profile.role}`;
      window.history.pushState(null, '', pageToHash(dash));
      setPage(dash);
      setActiveSection('');
    }
  }, [session, profile, page, isRegisterRolePage]);

  // Scroll to a section whenever scrollTarget changes.
  useEffect(() => {
    if (!scrollTarget) return;
    const id = scrollTarget;
    const timer = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setScrollTarget(null);
    }, 60);
    return () => clearTimeout(timer);
  }, [scrollTarget]);

  const navigate = useCallback((target: string) => {
    // "back" — use native browser history to go one step back.
    // If no app history exists, fall back to the role dashboard.
    if (target === 'back') {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      // No browser history — go to role dashboard or home
      const fallback = profile ? `dashboard-${profile.role}` : 'home';
      window.history.pushState(null, '', pageToHash(fallback));
      setPage(fallback);
      setActiveSection(fallback === 'home' ? 'home' : '');
      window.scrollTo(0, 0);
      return;
    }

    const resolved = resolvePage(target, profile?.role);

    // Homepage section scroll — update hash to 'home' and scroll to section
    const homeSections = ['about', 'how', 'features', 'impact', 'get-started'];
    if (homeSections.includes(resolved)) {
      if (page !== 'home') {
        window.history.pushState(null, '', pageToHash('home'));
      }
      setPage('home');
      setActiveSection(resolved);
      setScrollTarget(resolved);
      return;
    }

    if (page !== resolved) {
      window.history.pushState(null, '', pageToHash(resolved));
      setPage(resolved);
      setActiveSection(resolved === 'home' ? 'home' : '');
      window.scrollTo(0, 0);
    }
  }, [page, profile, resolvePage]);

  if (loading && isDashboardPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="flex items-center gap-3 text-forest-600">
          <div className="w-5 h-5 border-2 border-forest-300 border-t-forest-600 rounded-full animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if trying to access dashboard without auth
  if (isDashboardPage && !session) {
    return (
      <div className="min-h-screen">
        <Navbar onNavigate={navigate} currentPage="login" />
        <LoginPage onNavigate={navigate} />
        <Footer onNavigate={navigate} />
      </div>
    );
  }

  // Redirect if trying to access wrong role dashboard
  if (isDashboardPage && profile && requestedRole !== profile.role && requestedRole !== 'admin') {
    navigate(`dashboard-${profile.role}`);
  }

  function renderPage() {
    switch (page) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'login':
        return <LoginPage onNavigate={navigate} />;
      case 'register':
        return <RegisterPage onNavigate={navigate} />;
      case 'dashboard-donor':
        return <DonorDashboard onNavigate={navigate} />;
      case 'dashboard-ngo':
        return <NgoDashboard onNavigate={navigate} />;
      case 'dashboard-volunteer':
        return <VolunteerDashboard onNavigate={navigate} />;
      case 'dashboard-admin':
        return <AdminDashboard onNavigate={navigate} />;
      default:
        if (isRegisterRolePage && registerRole) {
          return <RegisterPage onNavigate={navigate} initialRole={registerRole} />;
        }
        return <HomePage onNavigate={navigate} />;
    }
  }

  const showFooter = !isDashboardPage;

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar onNavigate={navigate} currentPage={activeSection} />
      <main className="flex-1">{renderPage()}</main>
      {showFooter && <Footer onNavigate={navigate} />}
      <Chatbot />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
