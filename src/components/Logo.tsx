import { UtensilsCrossed } from 'lucide-react';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 'w-8 h-8', md: 'w-9 h-9', lg: 'w-12 h-12' };
  const iconSize = { sm: 16, md: 18, lg: 24 };
  const textSize = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' };

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${dims[size]} rounded-xl bg-forest-600 flex items-center justify-center shadow-premium`}>
        <UtensilsCrossed size={iconSize[size]} className="text-champagne" strokeWidth={2} />
      </div>
      <span className={`${textSize[size]} font-display font-bold text-forest-800 tracking-tight`}>
        Food<span className="text-accent-500">Loop</span>
      </span>
    </div>
  );
}
