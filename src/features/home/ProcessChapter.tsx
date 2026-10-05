import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface ProcessChapterProps {
  onStartServiceRequest: () => void;
}

export const ProcessChapter: React.FC<ProcessChapterProps> = ({ onStartServiceRequest }) => {
  const stages = [
    {
      num: '01',
      title: 'Vehicle Received',
      desc: 'Physical intake checklist logged and reported symptoms recorded.',
    },
    {
      num: '02',
      title: 'Inspection',
      desc: 'Multi-point mechanical inspection and digital ECU diagnostics.',
    },
    {
      num: '03',
      title: 'Estimate & Approval',
      desc: 'Itemized quotation presented. You decide what proceeds.',
    },
    {
      num: '04',
      title: 'Service in Progress',
      desc: 'Mechanical execution following manufacturer torque specs.',
    },
    {
      num: '05',
      title: 'Quality Check',
      desc: 'Road evaluation, torque re-audit, and quality sign-off.',
    },
    {
      num: '06',
      title: 'Ready for Collection',
      desc: 'Exterior wipe-down and collection readiness notification.',
    },
    {
      num: '07',
      title: 'Vehicle Delivered',
      desc: 'Documented handover and permanent service history archival.',
    },
  ];

  return (
    <section id="process" className="py-24 sm:py-32 bg-obsidian border-b border-graphite-border">
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-3">
          <div className="flex items-center justify-center gap-3">
            <span className="w-8 h-[1px] bg-accent-gold" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-gold">
              The Torque Expert Process
            </span>
            <span className="w-8 h-[1px] bg-accent-gold" />
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tightest text-warm-white uppercase">
            From Concern to Collection
          </h2>
          <p className="text-xs sm:text-base text-muted font-light leading-relaxed max-w-lg mx-auto">
            Every vehicle follows a defined service journey—from intake and inspection through approval, execution, quality control, and collection.
          </p>
        </div>

        {/* DESKTOP: Horizontal Editorial Progression Line (>= 1024px) */}
        <div className="hidden lg:grid grid-cols-7 gap-4 relative">
          
          {/* Subtle connecting horizontal track */}
          <div className="absolute top-5 left-6 right-6 h-[1px] bg-graphite-border z-0" />

          {stages.map((stage, idx) => (
            <div key={stage.num} className="relative z-10 space-y-3 text-left">
              {/* Node Indicator */}
              <div className="w-10 h-10 rounded-full bg-obsidian border border-accent-gold/60 text-accent-gold flex items-center justify-center font-mono text-xs font-bold shadow-md">
                {stage.num}
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-[9px] font-mono uppercase text-muted-dark tracking-widest block">
                  Stage 0{idx + 1}
                </span>
                <h3 className="text-xs font-bold text-warm-white tracking-tight uppercase leading-snug">
                  {stage.title}
                </h3>
                <p className="text-[11px] text-muted leading-relaxed font-light">
                  {stage.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* MOBILE / TABLET: Clean Vertical Editorial Progression (< 1024px) */}
        <div className="lg:hidden space-y-8 relative pl-8 ml-3 border-l-2 border-graphite-border">
          {stages.map((stage) => (
            <div key={stage.num} className="relative space-y-2 text-left">
              {/* Node dot on the left line */}
              <div className="absolute -left-[41px] top-0.5 w-5 h-5 rounded-full bg-obsidian border-2 border-accent-gold flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
              </div>
              
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-xs font-bold text-accent-gold">{stage.num}</span>
                <h3 className="text-base font-bold text-warm-white uppercase tracking-tight">
                  {stage.title}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-muted leading-relaxed font-light">
                {stage.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Post-Process Primary CTA */}
        <div className="pt-12 sm:pt-16 flex items-center justify-center">
          <button
            type="button"
            id="cta-start-service-request"
            onClick={onStartServiceRequest}
            className="inline-flex items-center gap-3 py-4 px-8 bg-warm-white hover:bg-white text-obsidian font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xs transition-all shadow-xl active:scale-[0.99] min-h-[48px] focus-visible:ring-2 focus-visible:ring-accent-gold"
          >
            <span>Start Your Service Request</span>
            <ArrowRight className="w-4 h-4 text-accent-gold" />
          </button>
        </div>

      </div>
    </section>
  );
};
