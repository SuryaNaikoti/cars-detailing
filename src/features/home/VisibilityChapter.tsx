import React from 'react';
import { ArrowRight, CheckCircle2, Shield } from 'lucide-react';

export interface VisibilityChapterProps {
  onViewServiceStatus?: () => void;
}

export const VisibilityChapter: React.FC<VisibilityChapterProps> = ({ onViewServiceStatus }) => {
  return (
    <section id="visibility" className="py-24 sm:py-32 bg-obsidian border-b border-graphite-border">
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Editorial Headline & Transparency Message */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-[1px] bg-accent-gold" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-gold">
                Customer Experience
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tightest text-warm-white uppercase leading-[1.08]">
              Your Vehicle. <br />
              <span className="text-accent-gold">Your Visibility.</span>
            </h2>

            <div className="text-sm sm:text-base font-bold text-warm-white tracking-wide uppercase font-mono">
              Know what's happening — not just when it's ready.
            </div>

            <p className="text-xs sm:text-base text-muted font-light leading-relaxed">
              Once your vehicle enters the workshop, its service journey moves through defined stages. The customer-facing experience lets you view the latest workshop status as work progresses—without needing to call for updates.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-muted-dark font-mono">
              <Shield className="w-4 h-4 text-accent-gold shrink-0" />
              <span>Sanitized customer tracking · Privacy protected · Verified stages</span>
            </div>

            {onViewServiceStatus && (
              <div className="pt-4">
                <button
                  type="button"
                  id="cta-view-service-status"
                  onClick={onViewServiceStatus}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-warm-white hover:bg-white text-obsidian text-xs font-bold uppercase tracking-wider rounded-xs transition-colors group min-h-[44px]"
                >
                  <span>View Sample Service Status</span>
                  <ArrowRight className="w-3.5 h-3.5 text-accent-gold transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Sanitized Representation of Customer Service Status Tracker */}
          <div className="lg:col-span-6">
            <div className="rounded-xs border border-graphite-border bg-graphite/60 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 blur-3xl pointer-events-none" />

              {/* Status Header */}
              <div className="flex items-center justify-between border-b border-graphite-border pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-accent-gold block font-semibold">
                    TORQUE EXPERT · CUSTOMER PORTAL
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-warm-white tracking-tight">
                    2022 BMW 5 Series (G30)
                  </h3>
                  <span className="text-xs font-mono text-muted-dark">MH 02 ER 4500</span>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-xs bg-obsidian border border-graphite-border text-[10px] font-mono text-accent-gold font-bold">
                    ACTIVE VISIT
                  </span>
                  <span className="text-[10px] text-muted-dark block mt-1 font-mono">Latest Status</span>
                </div>
              </div>

              {/* Progression Stage Nodes */}
              <div className="space-y-3.5 text-xs font-mono">
                <div className="flex items-center gap-3 text-warm-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="line-through text-muted">Vehicle Received</span>
                  <span className="text-[10px] text-muted-dark ml-auto">09:15 AM</span>
                </div>

                <div className="flex items-center gap-3 text-warm-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="line-through text-muted">Inspection Completed</span>
                  <span className="text-[10px] text-muted-dark ml-auto">10:45 AM</span>
                </div>

                <div className="flex items-center gap-3 text-warm-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="line-through text-muted">Estimate Approved</span>
                  <span className="text-[10px] text-muted-dark ml-auto">11:30 AM</span>
                </div>

                <div className="flex items-center gap-3 text-accent-gold bg-accent-gold/10 p-2 rounded-xs border border-accent-gold/30">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-gold animate-pulse ml-0.5 shrink-0" />
                  <span className="font-bold uppercase tracking-wider text-warm-white">Service in Progress</span>
                  <span className="text-[10px] text-accent-gold ml-auto font-bold uppercase">Current Stage</span>
                </div>

                <div className="flex items-center gap-3 text-muted-dark">
                  <span className="w-4 h-4 rounded-full border border-graphite-border shrink-0 ml-0.5" />
                  <span>Quality Check</span>
                  <span className="text-[10px] text-muted-dark ml-auto">Pending</span>
                </div>

                <div className="flex items-center gap-3 text-muted-dark">
                  <span className="w-4 h-4 rounded-full border border-graphite-border shrink-0 ml-0.5" />
                  <span>Ready for Collection</span>
                  <span className="text-[10px] text-muted-dark ml-auto">Scheduled 05:00 PM</span>
                </div>
              </div>

              {/* Status Footer Notice */}
              <div className="pt-3 border-t border-graphite-border/60 flex items-center justify-between text-[11px] text-muted">
                <span>Promised Handover: Today, 5:30 PM</span>
                <span className="text-emerald-400 font-bold">On Schedule</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
