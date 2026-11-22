import { UtensilsCrossed, Heart, Clock, ShieldCheck } from 'lucide-react';

export function Footer({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <footer className="bg-forest-900 text-cream-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-forest-600 flex items-center justify-center">
                <UtensilsCrossed size={18} className="text-champagne" strokeWidth={2} />
              </div>
              <span className="text-xl font-display font-bold">
                Food<span className="text-accent-400">Loop</span>
              </span>
            </div>
            <p className="text-cream-200/70 text-sm max-w-md leading-relaxed">
              Connecting food donors, NGOs and volunteers to redistribute surplus edible food,
              reduce waste and feed communities. A college-level computer science project
              demonstrating a practical real-world solution.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-cream-100 mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-cream-200/70">
              <li><button onClick={() => onNavigate('about')} className="hover:text-accent-400 transition-colors">About FoodLoop</button></li>
              <li><button onClick={() => onNavigate('how')} className="hover:text-accent-400 transition-colors">How It Works</button></li>
              <li><button onClick={() => onNavigate('features')} className="hover:text-accent-400 transition-colors">Features</button></li>
              <li><button onClick={() => onNavigate('impact')} className="hover:text-accent-400 transition-colors">Impact</button></li>
              <li><button onClick={() => onNavigate('get-started')} className="hover:text-accent-400 transition-colors">Get Started</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-cream-100 mb-3">Food Safety</h4>
            <ul className="space-y-2 text-sm text-cream-200/70">
              <li className="flex items-center gap-2"><ShieldCheck size={14} className="text-accent-400" /> Safe handling guidelines</li>
              <li className="flex items-center gap-2"><Clock size={14} className="text-accent-400" /> Pickup deadline tracking</li>
              <li className="flex items-center gap-2"><Heart size={14} className="text-accent-400" /> Community driven</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-forest-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-cream-300/50">
            &copy; {new Date().getFullYear()} FoodLoop. Built as a college CS project.
          </p>
          <p className="text-xs text-cream-300/50">
            Made with care for our communities.
          </p>
        </div>
      </div>
    </footer>
  );
}
