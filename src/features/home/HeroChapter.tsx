import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface HeroChapterProps {
  onOpenBooking: () => void;
  onExploreServices?: () => void;
}

export const HeroChapter: React.FC<HeroChapterProps> = ({ onOpenBooking, onExploreServices }) => {
  return (
    <section id="hero" className="relative min-h-[90vh] lg:min-h-[94vh] flex items-end bg-obsidian overflow-hidden border-b border-graphite-border">
      
      {/* 1. Large, Dominant Cinematic Automotive Backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=85"
          alt="Porsche high-performance German sports car in specialist workshop environment"
          className="w-full h-full object-cover object-center lg:object-[center_35%] scale-[1.02] filter brightness-[0.75] contrast-[1.12]"
          loading="eager"
        />
        {/* Editorial gradient overlays - subtle and directional, not muddy */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/90 via-obsidian/40 to-transparent" />
      </div>

      {/* 2. Editorial Typography & CTAs anchored to bottom-left */}
      <div className="relative z-10 w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-12 pb-16 sm:pb-20 lg:pb-24">
        <div className="max-w-3xl space-y-6">
          
          {/* Eyebrow: Pure typographic luxury, no pill background */}
          <div className="flex items-center gap-3">
            <span className="w-8 h-[1px] bg-accent-gold" />
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-accent-gold">
              German & Luxury Car Specialists
            </span>
          </div>

          {/* Primary Editorial Headline */}
          <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.04em] text-warm-white leading-[1.04] uppercase font-sans">
            Precision Service. <br />
            <span className="text-warm-white/80 font-light italic">Expert Diagnosis.</span>
          </h1>

          {/* Value proposition subtext */}
          <p className="text-xs sm:text-base lg:text-lg text-muted-light font-normal leading-relaxed max-w-xl">
            A modern service experience built around your vehicle, the way it’s made, and the people who understand it.
          </p>

          {/* Primary and Secondary CTAs with clear visual hierarchy */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <button
              id="hero-primary-cta"
              onClick={onOpenBooking}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 sm:px-8 py-4 bg-warm-white hover:bg-white text-obsidian font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xs transition-all shadow-xl active:scale-[0.99] min-h-[48px] focus-visible:ring-2 focus-visible:ring-accent-gold"
            >
              <span>Book a Service</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-secondary-cta"
              onClick={() => {
                if (onExploreServices) {
                  onExploreServices();
                } else {
                  const el = document.getElementById('services');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-4 bg-graphite/80 hover:bg-graphite text-warm-white/90 hover:text-warm-white border border-graphite-border hover:border-warm-white/40 text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-xs backdrop-blur-sm transition-all min-h-[48px] focus-visible:ring-2 focus-visible:ring-accent-gold"
            >
              <span>Explore Services</span>
            </button>
          </div>

        </div>
      </div>

    </section>
  );
};
