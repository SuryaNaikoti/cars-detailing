import React from 'react';
import { ArrowRight, Play } from 'lucide-react';

export interface SpecialistCareChapterProps {
  onDiscoverStandard: () => void;
  onWatchVideo?: () => void;
}

export const SpecialistCareChapter: React.FC<SpecialistCareChapterProps> = ({
  onDiscoverStandard,
  onWatchVideo,
}) => {
  return (
    <section id="specialist-care" className="py-20 sm:py-28 lg:py-32 bg-obsidian border-b border-graphite-border">
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* EDITORIAL STORY: Two-column asymmetrical photographic composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Heavy Photography with Play Moment */}
          <div className="lg:col-span-7 relative group">
            <div className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden rounded-xs border border-graphite-border bg-graphite">
              <img
                src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=80"
                alt="Precision technical inspection and workshop bay calibration"
                className="w-full h-full object-cover object-center filter brightness-[0.8] contrast-[1.1] transition-transform duration-700 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent" />
              
              {/* Floating editorial play tag */}
              {onWatchVideo && (
                <button
                  type="button"
                  onClick={onWatchVideo}
                  className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6 inline-flex items-center gap-3 px-4 py-2.5 rounded-xs bg-obsidian/90 border border-graphite-border text-warm-white hover:border-accent-gold transition-colors backdrop-blur-md text-xs font-semibold tracking-wider uppercase min-h-[44px]"
                >
                  <span className="w-6 h-6 rounded-full bg-accent-gold text-obsidian flex items-center justify-center shrink-0">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </span>
                  <span>Watch Workshop Process · 2 min</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Editorial Typographic Narrative (Truthful Philosophy) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-[1px] bg-accent-gold" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-gold">
                Specialist Care
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tightest text-warm-white uppercase leading-[1.08]">
              Specialist Care <br />
              <span className="text-warm-white/70 font-light italic">for Extraordinary Vehicles</span>
            </h2>

            <p className="text-sm sm:text-base text-muted-light leading-relaxed font-light">
              Expert servicing, calibrated diagnostics, and mechanical repairs without the guesswork. Every vehicle receives documented inspections, transparent estimates, and thorough road verification.
            </p>

            {/* Three Triad Values */}
            <div className="pt-6 border-t border-graphite-border/70 grid grid-cols-3 gap-3 sm:gap-4 text-center">
              <div className="space-y-1">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-warm-white block font-sans">
                  Inspections
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-dark font-medium">Documented Findings</span>
              </div>
              <div className="space-y-1 border-x border-graphite-border/50">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-accent-gold block font-sans">
                  Estimates
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-dark font-medium">Clear Authorization</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-warm-white block font-sans">
                  History
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-dark font-medium">Archived Lifecycle</span>
              </div>
            </div>

            {/* Low-intent context CTA to move to standard */}
            <div className="pt-2">
              <button
                type="button"
                id="cta-discover-standard"
                onClick={onDiscoverStandard}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-gold hover:text-warm-white transition-colors group min-h-[44px]"
              >
                <span>Discover The Torque Expert Standard</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
