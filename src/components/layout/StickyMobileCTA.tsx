import React from 'react';
import { Wrench } from 'lucide-react';

export interface StickyMobileCTAProps {
  onOpenBooking: () => void;
  isVisible?: boolean;
}

export const StickyMobileCTA: React.FC<StickyMobileCTAProps> = ({ onOpenBooking, isVisible = true }) => {
  if (!isVisible) return null;

  return (
    <div
      id="mobile-sticky-cta-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-obsidian/95 backdrop-blur-md border-t border-graphite-border px-4 py-3 pb-safe shadow-2xl transition-all"
    >
      <div className="max-w-md mx-auto">
        <button
          type="button"
          onClick={onOpenBooking}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-warm-white hover:bg-white text-obsidian text-xs font-extrabold uppercase tracking-wider rounded-xs transition-all shadow-lg min-h-[48px] focus-visible:ring-2 focus-visible:ring-accent-gold"
        >
          <Wrench className="w-4 h-4 text-obsidian shrink-0" />
          <span>BOOK A SERVICE</span>
        </button>
      </div>
    </div>
  );
};
