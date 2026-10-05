import React from 'react';
import { ArrowRight, Phone } from 'lucide-react';

interface FinalCtaChapterProps {
  onBookService: () => void;
  onContactWorkshop: () => void;
}

export const FinalCtaChapter: React.FC<FinalCtaChapterProps> = ({
  onBookService,
  onContactWorkshop,
}) => {
  return (
    <section id="final-cta" className="py-24 sm:py-32 bg-obsidian-subtle border-b border-graphite-border relative overflow-hidden">
      {/* Subtle ambient lighting / gold gradient accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-w-full h-[300px] bg-accent-gold/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-12 relative z-10 text-center space-y-8">
        
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-3">
          <span className="w-8 h-[1px] bg-accent-gold" />
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-accent-gold">
            READY WHEN YOU ARE
          </span>
          <span className="w-8 h-[1px] bg-accent-gold" />
        </div>

        {/* Headline */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tightest text-warm-white uppercase leading-none max-w-4xl mx-auto">
          YOUR VEHICLE DESERVES
          <br />
          <span className="text-muted">THE RIGHT KIND OF ATTENTION.</span>
        </h2>

        {/* Supporting Line */}
        <p className="text-base sm:text-lg text-muted font-light max-w-xl mx-auto leading-relaxed">
          Tell us about your vehicle and what it needs. We&apos;ll help you choose the right service.
        </p>

        {/* Conversion Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            type="button"
            id="cta-final-book-service"
            onClick={onBookService}
            className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 bg-warm-white hover:bg-white text-obsidian text-xs font-extrabold uppercase tracking-widest rounded-xs transition-all shadow-lg hover:shadow-warm-white/10 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>REQUEST SERVICE</span>
            <ArrowRight className="w-4 h-4 text-obsidian group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            id="cta-final-contact-workshop"
            onClick={onContactWorkshop}
            className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 bg-graphite hover:bg-graphite-subtle text-warm-white border border-graphite-border text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-accent-gold" />
            <span>CONTACT THE WORKSHOP</span>
          </button>
        </div>

        {/* Trust micro-guarantee */}
        <p className="text-[11px] font-mono text-muted-dark pt-2">
          Structured Intake · Itemized Estimate Authorization · Defined Quality Check
        </p>

      </div>
    </section>
  );
};
