import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export interface CampaignChapterProps {
  onClaimSampleOffer: () => void;
}

export const CampaignChapter: React.FC<CampaignChapterProps> = ({ onClaimSampleOffer }) => {
  return (
    <section id="campaign" className="py-24 sm:py-32 bg-obsidian border-b border-graphite-border">
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Large Editorial Automotive Campaign Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-graphite-border rounded-xs overflow-hidden bg-graphite">
          
          {/* Left Column: Dominant High-Impact Automotive Image */}
          <div className="lg:col-span-7 relative min-h-[380px] sm:min-h-[480px] lg:min-h-[540px] bg-obsidian">
            <img
              src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=80"
              alt="High-performance luxury vehicle aesthetic engineering"
              className="w-full h-full object-cover object-center filter brightness-[0.8] contrast-[1.1]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-obsidian/60 hidden lg:block" />
            
            {/* Editorial Caption Tag */}
            <div className="absolute bottom-6 left-6 px-3 py-1 rounded-xs bg-obsidian/85 border border-graphite-border text-[10px] uppercase font-bold tracking-widest text-warm-white">
              Studio Calibration · Madhapur
            </div>
          </div>

          {/* Right Column: High-Contrast Warm-White Offer Panel */}
          <div className="lg:col-span-5 bg-warm-white text-obsidian p-8 sm:p-12 lg:p-14 flex flex-col justify-between space-y-8">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-obsidian/70 border-b border-obsidian/20 pb-1">
                <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
                <span>Sample Offer · Illustrative</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tightest leading-tight uppercase font-sans">
                Comprehensive Luxury Service Package
              </h2>

              <p className="text-xs sm:text-sm text-obsidian/80 leading-relaxed font-normal">
                Scheduled multi-point German diagnostic inspection, OEM synthetic fluid renewal, brake rotor assessment, and climate system calibration.
              </p>

              {/* Prominent Illustrative Price */}
              <div className="pt-4 border-t border-obsidian/10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-obsidian/60 block">
                  Starting from
                </span>
                <div className="text-3xl sm:text-5xl font-extrabold tracking-tight tabular-numbers text-obsidian font-mono">
                  ₹14,999
                </div>
                <span className="text-[10px] text-obsidian/60 italic block mt-1">
                  Sample demo package pricing. Final verified estimate provided following physical bay intake.
                </span>
              </div>
            </div>

            {/* Action */}
            <div className="pt-4">
              <button
                type="button"
                onClick={onClaimSampleOffer}
                className="w-full inline-flex items-center justify-center gap-3 py-4 px-6 bg-obsidian hover:bg-obsidian/90 text-warm-white font-bold text-xs uppercase tracking-wider rounded-xs transition-all shadow-md min-h-[48px] focus-visible:ring-2 focus-visible:ring-accent-gold"
              >
                <span>ENQUIRE ABOUT THIS SERVICE</span>
                <ArrowRight className="w-4 h-4 text-accent-gold" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
