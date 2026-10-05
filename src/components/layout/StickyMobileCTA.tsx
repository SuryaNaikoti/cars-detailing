import React from 'react';
import { Wrench } from 'lucide-react';

export interface StickyMobileCTAProps {
  onOpenBooking: () => void;
  isVisible?: boolean;
}

export const StickyMobileCTA: React.FC<StickyMobileCTAProps> = ({ onOpenBooking, isVisible = true }) => {
  return (
    <div
      id="mobile-sticky-cta-bar"
      aria-hidden={!isVisible}
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-obsidian/95 backdrop-blur-md border-t border-graphite-border px-4 py-3 pb-safe shadow-2xl transition-all duration-300 ease-out ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-md mx-auto">
        <button
          type="button"
          tabIndex={isVisible ? 0 : -1}
          onClick={onOpenBooking}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-warm-white hover:bg-white text-obsidian text-xs font-extrabold uppercase tracking-wider rounded-xs transition-all shadow-lg min-h-[48px] focus-visible:ring-2 focus-visible:ring-accent-gold cursor-pointer active:scale-[0.99]"
        >
          <Wrench className="w-4 h-4 text-obsidian shrink-0" />
          <span>BOOK A SERVICE</span>
        </button>
      </div>
    </div>
  );
};
