import {
  ArrowRight, Recycle, Users, Truck, ShieldCheck,
  Clock, MapPin, Heart, TrendingDown, Sparkles, CheckCircle2,
  HandHeart, Building2, Bike, LayoutDashboard, Search, BarChart3, Package, Zap,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function HomePage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="animate-fade-in">
      <Hero onNavigate={onNavigate} />
      <StatsBar />
      <AboutSection />
      <HowItWorks />
      <Features onNavigate={onNavigate} />
      <ImpactSection onNavigate={onNavigate} />
      <SafetySection />
      <GetStarted onNavigate={onNavigate} />
    </div>
  );
}

function Hero({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cream-50 via-cream-50 to-champagne/40" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-forest-200/15 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-300/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-cream-200 px-4 py-1.5 text-sm font-medium text-forest-700 mb-6 shadow-sm">
              <Sparkles size={14} className="text-accent-500" />
              Reducing food waste, one meal at a time
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-forest-900 leading-[1.1] mb-6">
              Surplus food becomes <span className="text-accent-600">someone's meal</span>
            </h1>
            <p className="text-lg text-forest-700/80 leading-relaxed mb-8 max-w-xl">
              FoodLoop connects restaurants, canteens and event organizers with NGOs and
              volunteers to redistribute edible surplus food — reducing waste while feeding
              communities.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => onNavigate('register')} className="btn-primary text-base px-6 py-3.5">
                Join FoodLoop
                <ArrowRight size={18} />
              </button>
              <button onClick={() => onNavigate('how')} className="btn-secondary text-base px-6 py-3.5">
                How It Works
              </button>
            </div>

            <div className="flex items-center gap-6 mt-10 text-sm text-forest-600">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-forest-500" />
                Food safety first
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-forest-500" />
                Real-time matching
              </div>
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-forest-500" />
                Community driven
              </div>
            </div>
          </div>

          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative animate-scale-in">
      <div className="relative rounded-3xl overflow-hidden shadow-premium-lg aspect-[4/3]">
        <img
          src="https://images.pexels.com/photos/262918/pexels-photo-262918.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Fresh food sharing"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/50 to-transparent" />
      </div>

      <div className="absolute -bottom-6 -left-4 sm:-left-6 card p-4 shadow-premium-lg w-56">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cream-100 flex items-center justify-center">
            <Recycle size={24} className="text-accent-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-forest-800">Zero</p>
            <p className="text-xs text-forest-600">Waste goal</p>
          </div>
        </div>
      </div>

      <div className="absolute -top-4 -right-2 sm:-right-4 card p-4 shadow-premium-lg w-48">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center">
            <Heart size={24} className="text-accent-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-forest-800">Live</p>
            <p className="text-xs text-forest-600">Food matching</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsBar() {
  const [stats, setStats] = useState({ mealsSaved: 0, listings: 0, activeDonors: 0, deliveries: 0 });

  useEffect(() => {
    const sample = { mealsSaved: 1240, listings: 38, activeDonors: 22, deliveries: 17 };
    setStats(sample);
  }, []);

  return (
    <section className="bg-forest-700 text-white py-8 border-y border-forest-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatItem icon={<TrendingDown size={20} />} value={stats.mealsSaved} label="Meals Saved" />
          <StatItem icon={<Recycle size={20} />} value={stats.listings} label="Food Listings" />
          <StatItem icon={<Users size={20} />} value={stats.activeDonors} label="Active Donors" />
          <StatItem icon={<Truck size={20} />} value={stats.deliveries} label="Deliveries" />
        </div>
        <p className="text-center text-forest-200/70 text-xs mt-6">
          Sample data shown — real numbers update as the platform is used.
        </p>
      </div>
    </section>
  );
}

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-2 text-forest-200">{icon}</div>
      <p className="text-3xl font-bold">{value.toLocaleString()}</p>
      <p className="text-sm text-forest-200/80">{label}</p>
    </div>
  );
}

function AboutSection() {
  return (
    <section id="about" className="py-20 lg:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-forest-50 px-4 py-1.5 text-sm font-medium text-forest-700 mb-5">
          <Sparkles size={14} className="text-accent-500" />
          About FoodLoop
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-forest-900 mb-6">
          Closing the gap between surplus and need
        </h2>
        <p className="text-lg text-forest-700/80 leading-relaxed mb-6">
          Every day, restaurants, canteens and event organizers prepare more food than they
          can serve — while nearby NGOs and community kitchens struggle to source enough.
          FoodLoop bridges that gap.
        </p>
        <p className="text-lg text-forest-700/80 leading-relaxed mb-8">
          Our platform connects surplus food providers with organisations that can distribute
          it to people who need it most. Volunteers handle the logistics, picking up food from
          donors and delivering it to NGOs — all coordinated in real time. Together, we're
          reducing avoidable food waste and making sure good food reaches people, not bins.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="card p-5">
            <Recycle size={24} className="text-accent-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-forest-800">Reduce Waste</p>
            <p className="text-xs text-forest-600 mt-1">Keep edible food out of landfills</p>
          </div>
          <div className="card p-5">
            <Heart size={24} className="text-accent-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-forest-800">Feed Communities</p>
            <p className="text-xs text-forest-600 mt-1">Connect surplus to those in need</p>
          </div>
          <div className="card p-5">
            <Users size={24} className="text-accent-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-forest-800">Unite People</p>
            <p className="text-xs text-forest-600 mt-1">Donors, NGOs and volunteers together</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: <HandHeart size={32} />,
      title: 'Donors List Food',
      description: 'Restaurants, canteens and event organizers post their available surplus food with quantity, preparation time and pickup deadline.',
      color: 'bg-forest-100 text-forest-700',
    },
    {
      icon: <Building2 size={32} />,
      title: 'NGOs Request Food',
      description: 'NGOs discover and request suitable donations based on the number of people they serve and the food they need.',
      color: 'bg-accent-100 text-accent-700',
    },
    {
      icon: <Bike size={32} />,
      title: 'Volunteers Deliver',
      description: 'Volunteers coordinate pickups and deliveries, collecting food from donors and delivering it to NGOs before the deadline.',
      color: 'bg-cream-200 text-cream-800',
    },
  ];

  return (
    <section id="how" className="py-20 lg:py-28 bg-gradient-to-b from-cream-100/60 to-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-forest-50 px-4 py-1.5 text-sm font-medium text-forest-700 mb-4">
            <Zap size={14} className="text-accent-500" />
            Simple Process
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-forest-900 mb-4">How FoodLoop Works</h2>
          <p className="text-lg text-forest-600 max-w-2xl mx-auto">
            Three simple steps take surplus food from a donor's kitchen to someone who needs it.
          </p>
        </div>

        <div className="relative grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="card p-8 text-center hover:shadow-premium-lg transition-all hover:-translate-y-1">
                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-5`}>
                  {step.icon}
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-forest-600 text-white text-sm font-bold mb-3">
                  {i + 1}
                </div>
                <h3 className="text-lg font-bold text-forest-800 mb-3">{step.title}</h3>
                <p className="text-sm text-forest-600 leading-relaxed">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-4 w-8 h-8 items-center justify-center text-accent-500 z-10">
                  <ArrowRight size={24} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features({ onNavigate }: { onNavigate: (page: string) => void }) {
  const features = [
    { icon: <Package />, title: 'Surplus Food Listings', description: 'Donors post surplus food with category, quantity, preparation time, pickup deadline and location — all in one structured form.' },
    { icon: <Search />, title: 'Smart Food Matching', description: 'NGOs find food near them through category, quantity and availability matching. The right food reaches the right organisation.' },
    { icon: <HandHeart />, title: 'NGO Food Requests', description: 'NGOs request specific donations based on the number of people they serve, with messaging to coordinate with donors.' },
    { icon: <Bike />, title: 'Volunteer Pickup Coordination', description: 'Volunteers browse available pickups, claim tasks and coordinate delivery routes between donors and NGOs.' },
    { icon: <Clock />, title: 'Real-Time Donation Tracking', description: 'Every donation is tracked end-to-end — from listing to request to pickup to delivery — with live status updates at every stage.' },
    { icon: <BarChart3 />, title: 'Impact Monitoring', description: 'Track total food donated, meals supported and successful deliveries with a clear dashboard for measuring real impact.' },
  ];

  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-forest-50 px-4 py-1.5 text-sm font-medium text-forest-700 mb-4">
            <LayoutDashboard size={14} className="text-accent-500" />
            Platform Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-forest-900 mb-4">Everything You Need</h2>
          <p className="text-lg text-forest-600 max-w-2xl mx-auto">
            A complete platform for food redistribution — from listing to delivery to impact measurement.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="card p-6 hover:shadow-premium-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-forest-100 text-accent-600 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-forest-800 mb-2">{f.title}</h3>
              <p className="text-sm text-forest-600 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button onClick={() => onNavigate('register')} className="btn-primary text-base px-6 py-3.5">
            Start Using FoodLoop
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

function ImpactSection({ onNavigate }: { onNavigate: (page: string) => void }) {
  const stats = [
    { icon: <Package size={28} />, value: '4,820 kg', label: 'Total Food Donated', color: 'bg-forest-100 text-forest-600' },
    { icon: <Heart size={28} />, value: '12,400', label: 'Meals Supported', color: 'bg-accent-100 text-accent-700' },
    { icon: <Truck size={28} />, value: '320', label: 'Successful Deliveries', color: 'bg-cream-200 text-cream-800' },
    { icon: <Users size={28} />, value: '145', label: 'Active Food Donors', color: 'bg-forest-100 text-forest-600' },
  ];

  return (
    <section id="impact" className="py-20 lg:py-28 bg-gradient-to-b from-cream-100/60 to-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-forest-100 px-4 py-1.5 text-sm font-medium text-forest-700 mb-4">
            <TrendingDown size={14} className="text-accent-500" />
            Measuring Our Impact
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-forest-900 mb-4">Food that counts</h2>
          <p className="text-lg text-forest-600 max-w-2xl mx-auto">
            Every listing, request and delivery is tracked. Here's a preview of what the impact dashboard will show.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="card p-8 text-center">
              <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center mx-auto mb-4`}>
                {stat.icon}
              </div>
              <p className="text-3xl font-bold text-forest-900">{stat.value}</p>
              <p className="text-sm text-forest-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="card p-6 border-2 border-cream-200 max-w-3xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cream-200 flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} className="text-cream-800" />
            </div>
            <div>
              <h4 className="font-semibold text-forest-900 mb-1">About these numbers</h4>
              <p className="text-sm text-forest-600 leading-relaxed">
                The figures above are <strong>sample data</strong> to illustrate what the impact
                dashboard will look like. Real numbers appear once donors, NGOs and volunteers
                start using the platform. The admin dashboard shows live data from the database —
                starting at zero for a new platform and growing with real activity.
              </p>
              <button onClick={() => onNavigate('register')} className="btn-secondary text-sm mt-4">
                Start contributing
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SafetySection() {
  return (
    <section className="py-20 bg-forest-800 text-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-forest-700 px-4 py-1.5 text-sm font-medium text-champagne mb-5">
              <ShieldCheck size={14} className="text-accent-400" />
              Food Safety Commitment
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-5">Safety is built into every step</h2>
            <p className="text-cream-200/80 leading-relaxed mb-6">
              FoodLoop is designed with food safety as a first priority. Every listing includes
              preparation time and a pickup deadline so recipients know exactly how fresh the food is.
            </p>
            <ul className="space-y-3">
              {[
                'Preparation time recorded for every listing',
                'Pickup deadlines prevent expired food from being shared',
                'Category labels help recipients handle food correctly',
                'Status tracking ensures end-to-end accountability',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-cream-100">
                  <CheckCircle2 size={20} className="text-accent-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-forest-700/50 rounded-2xl p-6 border border-forest-600">
              <Clock size={28} className="text-accent-400 mb-3" />
              <h4 className="font-semibold mb-1">Pickup Deadlines</h4>
              <p className="text-xs text-cream-300/70 leading-relaxed">Every listing expires automatically past its safe pickup window.</p>
            </div>
            <div className="bg-forest-700/50 rounded-2xl p-6 border border-forest-600">
              <ShieldCheck size={28} className="text-accent-400 mb-3" />
              <h4 className="font-semibold mb-1">Safe Handling</h4>
              <p className="text-xs text-cream-300/70 leading-relaxed">Guidelines included for prepared, raw, dairy and packaged food.</p>
            </div>
            <div className="bg-forest-700/50 rounded-2xl p-6 border border-forest-600">
              <Recycle size={28} className="text-accent-400 mb-3" />
              <h4 className="font-semibold mb-1">Waste Reduction</h4>
              <p className="text-xs text-cream-300/70 leading-relaxed">Track exactly how much food is saved from going to waste.</p>
            </div>
            <div className="bg-forest-700/50 rounded-2xl p-6 border border-forest-600">
              <LayoutDashboard size={28} className="text-accent-400 mb-3" />
              <h4 className="font-semibold mb-1">Full Transparency</h4>
              <p className="text-xs text-cream-300/70 leading-relaxed">Donors, NGOs and admins see real-time status at every stage.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GetStarted({ onNavigate }: { onNavigate: (page: string) => void }) {
  const roles = [
    {
      icon: <HandHeart size={28} />,
      title: 'Become a Donor',
      description: 'Restaurants, canteens, event organizers and home kitchens with surplus food to share.',
      cta: 'Register as a Donor',
      color: 'forest' as const,
    },
    {
      icon: <Building2 size={28} />,
      title: 'Register as an NGO',
      description: 'Organizations that serve meals to people in need — shelters, food banks, community kitchens.',
      cta: 'Register as an NGO',
      color: 'cream' as const,
    },
    {
      icon: <Bike size={28} />,
      title: 'Join as a Volunteer',
      description: 'Individuals who can pick up food from donors and deliver it to NGOs in their area.',
      cta: 'Register as a Volunteer',
      color: 'accent' as const,
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string; btn: string }> = {
    forest: { bg: 'bg-forest-50', text: 'text-forest-700', border: 'border-forest-200', btn: 'bg-forest-600 hover:bg-forest-700 text-white' },
    cream: { bg: 'bg-cream-100', text: 'text-cream-800', border: 'border-cream-300', btn: 'bg-forest-600 hover:bg-forest-700 text-white' },
    accent: { bg: 'bg-accent-50', text: 'text-accent-700', border: 'border-accent-200', btn: 'bg-forest-600 hover:bg-forest-700 text-white' },
  };

  return (
    <section id="get-started" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-forest-50 px-4 py-1.5 text-sm font-medium text-forest-700 mb-4">
            <Sparkles size={14} className="text-accent-500" />
            Get Started
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-forest-900 mb-4">Ready to make a difference?</h2>
          <p className="text-lg text-forest-600 max-w-2xl mx-auto">
            Whether you have surplus food to share, people to feed, or time to deliver — there's a place for you on FoodLoop.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {roles.map((role, i) => {
            const c = colorMap[role.color];
            return (
              <div key={i} className={`card p-8 ${c.border} hover:shadow-premium-lg transition-all hover:-translate-y-1`}>
                <div className={`w-16 h-16 rounded-2xl ${c.bg} ${c.text} flex items-center justify-center mb-5`}>
                  {role.icon}
                </div>
                <h3 className="text-xl font-bold text-forest-800 mb-3">{role.title}</h3>
                <p className="text-sm text-forest-600 mb-6 leading-relaxed">{role.description}</p>
                <button
                  onClick={() => onNavigate('register')}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-premium transition-all active:scale-[0.98] ${c.btn}`}
                >
                  {role.cta}
                  <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="relative rounded-3xl bg-gradient-to-br from-forest-700 to-forest-900 p-10 lg:p-12 text-center overflow-hidden shadow-premium-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-champagne/10 rounded-full blur-3xl" />
          <div className="relative">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Already have an account?
            </h3>
            <p className="text-cream-100/90 mb-6 max-w-xl mx-auto">
              Sign in to access your dashboard and continue your food redistribution journey.
            </p>
            <button onClick={() => onNavigate('login')} className="btn-accent text-base px-6 py-3.5">
              Sign In
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
