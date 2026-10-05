import React from 'react';
import { ArrowRight, ClipboardCheck, Calculator, UserCheck, ShieldCheck } from 'lucide-react';

export interface StandardChapterProps {
  onSeeHowItWorks: () => void;
}

export const StandardChapter: React.FC<StandardChapterProps> = ({ onSeeHowItWorks }) => {
  const pillars = [
    {
      num: '01',
      title: 'Digital Inspection',
      desc: 'Clear physical findings and electronic scan results recorded before recommendations proceed.',
      icon: ClipboardCheck,
    },
    {
      num: '02',
      title: 'Itemized Estimates',
      desc: 'Parts, labor, and costs itemized upfront with immediate vs future priorities clearly distinguished.',
      icon: Calculator,
    },
    {
      num: '03',
      title: 'Customer Approval',
      desc: 'You decide what work proceeds. No unapproved work—every item requires explicit authorization.',
      icon: UserCheck,
    },
    {
      num: '04',
      title: 'Quality Control',
      desc: 'Every completed job is verified through a structured quality-check before vehicle handover.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="torque-standard" className="py-20 sm:py-28 lg:py-32 bg-obsidian border-b border-graphite-border">
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-graphite-border/80 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="w-8 h-[1px] bg-accent-gold" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-gold">
                The Torque Expert Standard
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tightest text-warm-white uppercase leading-[1.08]">
              A more considered way <br />
              <span className="text-warm-white/70 font-light italic">to care for your vehicle.</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted max-w-md font-light leading-relaxed">
            The service experience is built around documented inspection, clear recommendations, customer approval, and controlled execution.
          </p>
        </div>

        {/* 4 Pillars Grid: Editorial 4-column layout on desktop, 2x2 on tablet, clean vertical on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.num}
                className="p-6 sm:p-7 rounded-xs bg-graphite/40 border border-graphite-border/80 hover:border-accent-gold/50 transition-colors space-y-4 group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-accent-gold tracking-widest">
                      {pillar.num}
                    </span>
                    <Icon className="w-5 h-5 text-muted-dark group-hover:text-accent-gold transition-colors" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-warm-white uppercase tracking-tight group-hover:text-accent-gold transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed font-light">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section Sub-Action: Move to Process */}
        <div className="pt-10 flex items-center justify-center">
          <button
            type="button"
            id="cta-see-how-it-works"
            onClick={onSeeHowItWorks}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-graphite border border-graphite-border hover:border-accent-gold text-warm-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors group min-h-[44px]"
          >
            <span>See How It Works</span>
            <ArrowRight className="w-3.5 h-3.5 text-accent-gold transition-transform group-hover:translate-x-1" />
          </button>
        </div>

      </div>
    </section>
  );
};
