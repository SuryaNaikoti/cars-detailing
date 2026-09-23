import React from 'react';
import { Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ServiceHistoryRecord {
  year: string;
  category: string;
  vehicle: string;
  milestone: string;
  scopeSummary: string;
}

const ILLUSTRATIVE_SERVICE_HISTORY: ServiceHistoryRecord[] = [
  {
    year: '2026',
    category: 'PERIODIC SERVICE',
    vehicle: 'BMW 5 SERIES · 530D',
    milestone: 'Scheduled Interval Care',
    scopeSummary: 'Synthetic engine oil renewal, microfilter replacement, comprehensive brake system assessment and electronic service indicator reset.',
  },
  {
    year: '2025',
    category: 'BRAKE SERVICE',
    vehicle: 'BMW 5 SERIES · 530D',
    milestone: 'Friction & Hydraulic Refurbishment',
    scopeSummary: 'Front ventilated brake discs, OEM compound pads, wear sensors and hydraulic brake fluid flush under pressure.',
  },
  {
    year: '2025',
    category: 'VEHICLE INSPECTION',
    vehicle: 'BMW 5 SERIES · 530D',
    milestone: 'Comprehensive Health Check',
    scopeSummary: '60-point multi-system diagnostics, control unit interrogation, suspension bushing wear audit, and baseline telemetry log.',
  },
];

interface ServiceHistoryChapterProps {
  onViewServiceHistory?: () => void;
}

export const ServiceHistoryChapter: React.FC<ServiceHistoryChapterProps> = ({
  onViewServiceHistory,
}) => {
  return (
    <section id="service-history" className="py-20 sm:py-28 bg-obsidian border-b border-graphite-border">
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Context & Narrative */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-6 h-[1px] bg-accent-gold" />
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-gold">
                  SERVICE HISTORY
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tightest text-warm-white uppercase leading-tight">
                YOUR VEHICLE&apos;S HISTORY.
                <br />
                <span className="text-muted">KEPT WITH THE SERVICE.</span>
              </h2>
            </div>

            <p className="text-sm sm:text-base text-muted font-light leading-relaxed">
              Completed work contributes to a structured service history, giving you and the workshop
              a clearer record of previous service activity over the lifetime of ownership.
            </p>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xs bg-graphite/40 border border-graphite-border/60 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-warm-white">
                  <Clock className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                  <span>Permanent Record</span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed font-light">
                  Past invoices, parts replaced, and inspection findings remain accessible for provenance.
                </p>
              </div>

              <div className="p-4 rounded-xs bg-graphite/40 border border-graphite-border/60 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-warm-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                  <span>Resale Confidence</span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed font-light">
                  Transparent digital documentation protects vehicle value when transferring ownership.
                </p>
              </div>
            </div>

            {onViewServiceHistory && (
              <div className="pt-4">
                <button
                  type="button"
                  id="cta-view-service-history"
                  onClick={onViewServiceHistory}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-gold hover:text-white transition-colors group cursor-pointer"
                >
                  <span>VIEW SERVICE HISTORY</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Compact Editorial Timeline */}
          <div className="lg:col-span-7">
            <div className="rounded-xs border border-graphite-border bg-graphite/50 p-6 sm:p-8 backdrop-blur-sm relative">
              <div className="flex items-center justify-between border-b border-graphite-border pb-4 mb-6">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-accent-gold">
                    HISTORICAL RECORD
                  </div>
                  <div className="text-sm font-bold uppercase tracking-wider text-warm-white mt-0.5">
                    BMW 5 Series · Sample History
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-graphite border border-graphite-border text-muted">
                  ARCHIVAL AUDIT
                </span>
              </div>

              {/* Vertical Timeline Progression */}
              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[1px] before:bg-graphite-border">
                {ILLUSTRATIVE_SERVICE_HISTORY.map((item, idx) => (
                  <div key={idx} className="relative group">
                    {/* Timeline Node */}
                    <div className="absolute -left-[29px] sm:-left-[37px] top-1.5 w-4 h-4 rounded-full bg-obsidian border-2 border-accent-gold flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-xs font-mono font-bold text-accent-gold tracking-wider">
                          {item.year}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-graphite border border-graphite-border/70 text-warm-white font-semibold uppercase tracking-wider">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-mono text-muted-dark uppercase tracking-widest hidden sm:inline">
                          {item.vehicle}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-warm-white">
                        {item.milestone}
                      </h3>

                      <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                        {item.scopeSummary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-4 border-t border-graphite-border/70 flex items-center gap-2 text-[11px] font-mono text-muted-dark">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                <span>Illustrative timeline based on canonical Workshop OS service records.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
