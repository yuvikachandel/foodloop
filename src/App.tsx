import { useState, useEffect } from 'react';
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

function AppContent() {
  const { session, profile, loading } = useAuth();
  const [page, setPage] = useState('home');
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('home');
  const [pageHistory, setPageHistory] = useState<string[]>([]);

  // Auto-redirect to dashboard when logged in and on auth pages
  useEffect(() => {
    if (session && profile && (page === 'login' || page === 'register')) {
      setPage(`dashboard-${profile.role}`);
      setActiveSection('');
    }
  }, [session, profile, page]);

  // Scroll to a section whenever scrollTarget changes.
  // Uses a state (not a ref) so it fires even when page is already 'home'.
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

  function navigate(target: string) {
    // "back" returns to the previous page, or the role dashboard if none
    if (target === 'back') {
      const prev = pageHistory.length > 0 ? pageHistory[pageHistory.length - 1] : null;
      if (prev) {
        setPageHistory((h) => h.slice(0, -1));
        setPage(prev);
        setActiveSection(prev === 'home' ? 'home' : '');
        window.scrollTo(0, 0);
      } else if (profile) {
        const dash = `dashboard-${profile.role}`;
        setPage(dash);
        setActiveSection('');
        window.scrollTo(0, 0);
      } else {
        setPage('home');
        setActiveSection('home');
        window.scrollTo(0, 0);
      }
      return;
    }

    // "dashboard" resolves to the user's role dashboard
    if (target === 'dashboard' && profile) {
      if (page !== `dashboard-${profile.role}`) {
        setPageHistory((h) => [...h, page]);
      }
      setPage(`dashboard-${profile.role}`);
      setActiveSection('');
      window.scrollTo(0, 0);
      return;
    }

    // Homepage sections that need scroll-to-section behavior
    const homeSections = ['about', 'how', 'features', 'impact', 'get-started'];
    if (homeSections.includes(target)) {
      if (page !== 'home') {
        setPageHistory((h) => [...h, page]);
      }
      setPage('home');
      setActiveSection(target);
      setScrollTarget(target);
      return;
    }

    if (page !== target) {
      setPageHistory((h) => [...h, page]);
    }
    setPage(target);
    setActiveSection(target === 'home' ? 'home' : '');
    window.scrollTo(0, 0);
  }

  // Auth guard for dashboard pages
  const isDashboardPage = page.startsWith('dashboard-');
  const requestedRole = isDashboardPage ? page.replace('dashboard-', '') : null;

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
