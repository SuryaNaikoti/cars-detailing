import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export interface ServicesChapterProps {
  onSelectServiceForBooking: (serviceSlug: string) => void;
}

export const ServicesChapter: React.FC<ServicesChapterProps> = ({ onSelectServiceForBooking }) => {
  const services = [
    {
      num: '01',
      name: 'Periodic Service',
      slug: 'periodic-service',
      problemPrompt: 'Due for your next service interval?',
      ctaLabel: 'Check Service Options',
      desc: 'Scheduled manufacturer-specified maintenance, OEM synthetic fluids, and comprehensive safety checks.',
      image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80',
    },
    {
      num: '02',
      name: 'Computer Diagnostics',
      slug: 'computer-diagnostics',
      problemPrompt: 'Warning light or unexplained fault?',
      ctaLabel: 'Request Diagnostic Service',
      desc: 'Structured fault diagnosis using professional diagnostic interfaces and documented inspection findings.',
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    },
    {
      num: '03',
      name: 'Mechanical Repairs',
      slug: 'mechanical-repairs',
      problemPrompt: "Something doesn't feel right under load?",
      ctaLabel: 'Request Repair Service',
      desc: 'Engine, transmission, and dynamic suspension repairs following torque specifications and service manual tolerances.',
      image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
    },
    {
      num: '04',
      name: 'Electrical & Electronics',
      slug: 'electrical-systems',
      problemPrompt: 'Electrical drain or module communication issue?',
      ctaLabel: 'Request Diagnostic Service',
      desc: 'Wiring harness integrity, battery energy management, and control module circuit troubleshooting.',
      image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
    },
    {
      num: '05',
      name: 'AC & Cooling',
      slug: 'ac-cooling',
      problemPrompt: 'AC cooling diminished or temperature fluctuating?',
      ctaLabel: 'Request AC Service',
      desc: 'Thermal regulation systems, condenser purity, compressor vacuum testing, and cooling circuit performance.',
      image: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=800&q=80',
    },
    {
      num: '06',
      name: 'Specialist Detailing',
      slug: 'precision-detailing',
      problemPrompt: 'Ready to restore and protect the finish?',
      ctaLabel: 'Enquire About Detailing',
      desc: 'Multi-stage paint correction, protective ceramic surface coatings, and bespoke interior leather conditioning.',
      image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <section id="services" className="py-24 sm:py-32 bg-obsidian border-b border-graphite-border">
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Section Header: Minimalist Editorial Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 pb-6 border-b border-graphite-border/80 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-6 h-[1px] bg-accent-gold" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-gold">
                Disciplines
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tightest text-warm-white uppercase">
              Specialist Services
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted max-w-sm font-light leading-relaxed">
            Calibrated technical execution across the mechanical and aesthetic lifecycle of German automobiles.
          </p>
        </div>

        {/* 6 Services Photographic Grid — High image dominance with problem-solving prompts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((srv) => (
            <div
              key={srv.num}
              onClick={() => onSelectServiceForBooking(srv.slug)}
              className="group cursor-pointer rounded-xs overflow-hidden border border-graphite-border bg-graphite transition-all duration-300 hover:border-accent-gold/60 flex flex-col justify-between"
            >
              <div>
                {/* Dominant Image Block */}
                <div className="relative aspect-[16/10] overflow-hidden bg-obsidian">
                  <img
                    src={srv.image}
                    alt={srv.name}
                    className="w-full h-full object-cover object-center filter brightness-[0.8] contrast-[1.1] transition-transform duration-700 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-80" />
                  
                  {/* Number Badge */}
                  <span className="absolute top-4 left-4 text-xs font-mono font-bold tracking-widest text-warm-white/90 bg-obsidian/80 px-2 py-1 rounded-xs border border-graphite-border">
                    {srv.num}
                  </span>

                  <span className="absolute top-4 right-4 text-accent-gold opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-5 h-5" />
                  </span>
                </div>

                {/* Concise Editorial Copy with Problem Prompt */}
                <div className="p-6 space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-accent-gold uppercase tracking-wider block">
                      {srv.problemPrompt}
                    </span>
                    <h3 className="text-lg font-bold text-warm-white group-hover:text-accent-gold transition-colors uppercase tracking-tight">
                      {srv.name}
                    </h3>
                  </div>
                  <p className="text-xs text-muted font-light leading-relaxed">
                    {srv.desc}
                  </p>
                </div>
              </div>

              {/* Contextual Micro-CTA */}
              <div className="px-6 pb-6 pt-2 border-t border-graphite-border/40 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-warm-white group-hover:text-accent-gold transition-colors min-h-[44px]">
                <span>{srv.ctaLabel}</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
