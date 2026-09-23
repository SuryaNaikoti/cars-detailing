import React, { useState, useEffect } from 'react';
import { Container } from '../../components/layout/SectionHeader';
import { getCustomerSafeJobView } from '../../lib/demoStore';
import {
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Phone,
  MessageSquare,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import type { CustomerSafeJob } from '../../types';

export interface ServiceStatusTrackerProps {
  token: string;
  onBack: () => void;
}

export const ServiceStatusTrackerPage: React.FC<ServiceStatusTrackerProps> = ({
  token,
  onBack,
}) => {
  const [safeJob, setSafeJob] = useState<CustomerSafeJob | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = () => {
    setLoading(true);
    // Fetch directly from privacy-isolated customer-safe view model
    const data = getCustomerSafeJobView(token);
    setSafeJob(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Auto-listen to window focus so when user switches back from dashboard it updates instantly
    const handleFocus = () => {
      loadData();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [token]);

  // Invalid, unknown, malformed, or missing token
  if (!loading && !safeJob) {
    return (
      <div className="py-24 bg-obsidian text-center text-warm-white min-h-[70vh] flex items-center justify-center">
        <Container className="max-w-md">
          <div className="p-8 rounded-sm bg-graphite/40 border border-graphite-border space-y-5 text-left">
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold uppercase tracking-tight text-warm-white">
                Service Tracking Not Found
              </h2>
              <p className="text-xs text-muted font-light leading-relaxed">
                The requested tracking token is invalid, unrecognized, or has expired. If you believe this is an error, please contact the workshop directly.
              </p>
            </div>
            <div className="pt-2 border-t border-graphite-border flex items-center justify-between">
              <button
                onClick={onBack}
                className="px-4 py-2 bg-warm-white text-obsidian rounded-xs text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
              >
                Return to Overview
              </button>
              <a
                href="tel:+919876543210"
                className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-accent-gold transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> Call Workshop
              </a>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (loading || !safeJob) {
    return (
      <div className="py-24 bg-obsidian text-center text-warm-white min-h-[60vh] flex items-center justify-center">
        <div className="space-y-3">
          <RefreshCw className="w-6 h-6 text-accent-gold animate-spin mx-auto" />
          <p className="text-xs font-mono uppercase tracking-widest text-muted">
            Resolving Service Record...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-20 bg-obsidian text-warm-white min-h-screen">
      <Container className="max-w-3xl">
        {/* Navigation & Refresh bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-accent-gold transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return Home
          </button>

          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted hover:text-warm-white transition-colors uppercase"
            title="Refresh current workshop progress"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        {/* Brand Header */}
        <div className="mb-10 pb-6 border-b border-graphite-border space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-6 h-[1px] bg-accent-gold" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-gold">
              Torque Expert's · Customer Service Portal
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tightest uppercase">
            Your Vehicle Service
          </h1>
          <p className="text-xs sm:text-sm text-muted font-light">
            Customer: <strong className="text-warm-white font-medium">{safeJob.customer_display_name}</strong> · Registered: <strong className="text-warm-white font-medium">{safeJob.registration}</strong>
          </p>
        </div>

        {/* Main Status Display Card */}
        <div className="p-6 sm:p-8 rounded-sm bg-graphite/40 border border-graphite-border space-y-8">
          
          {/* Current Status Block */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-graphite-border gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-dark block">
                Current Status
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-warm-white uppercase tracking-tight">
                {safeJob.status_label}
              </h2>
              <p className="text-[11px] text-muted font-mono">
                Job ID: {safeJob.job_id}
              </p>
            </div>

            <div className="self-start sm:self-auto">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xs bg-accent-gold/15 text-accent-gold border border-accent-gold/30 text-xs font-bold uppercase tracking-wider font-mono">
                <span className="w-2 h-2 rounded-full bg-accent-gold" />
                SERVICE STATUS
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xs bg-obsidian/70 border border-graphite-border text-xs text-muted font-light leading-relaxed">
            Track the latest service status shared by the workshop.
          </div>

          {/* Progress Timeline Stepper - Dedicated Vertical Mobile & Desktop Stepper */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-dark block">
                Progress Timeline
              </span>
              <span className="text-[10px] font-mono text-muted-dark uppercase">
                Sequential Stages
              </span>
            </div>

            <div className="relative pl-6 space-y-5 pt-2 before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-[2px] before:bg-graphite-border">
              {safeJob.timeline.map((item, idx) => (
                <div key={idx} className="relative flex items-start gap-3">
                  {/* Stepper Node */}
                  <div className="absolute -left-[24px] top-0.5 bg-obsidian p-0.5 rounded-full z-10">
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : item.current ? (
                      <div className="w-4 h-4 rounded-full border-2 border-accent-gold flex items-center justify-center bg-obsidian">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-ping" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-graphite-border bg-obsidian" />
                    )}
                  </div>

                  {/* Stage Card */}
                  <div
                    className={`w-full p-3 rounded-xs border transition-colors ${
                      item.current
                        ? 'bg-accent-gold/10 border-accent-gold/40 text-warm-white'
                        : item.completed
                        ? 'bg-graphite/30 border-graphite-border/60 text-muted-light'
                        : 'bg-obsidian/30 border-graphite-border/30 text-muted-dark opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className={`text-xs font-bold uppercase tracking-wide ${
                        item.current ? 'text-accent-gold' : item.completed ? 'text-warm-white' : 'text-muted-dark'
                      }`}>
                        {item.label}
                      </span>
                      {item.timestamp && (
                        <span className="text-[10px] font-mono text-muted shrink-0">
                          {item.timestamp}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-graphite-border">
            
            {/* Vehicle & Service */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-dark block">
                  Vehicle
                </span>
                <p className="text-sm font-semibold text-warm-white mt-0.5">
                  {safeJob.vehicle}
                </p>
                <p className="text-xs text-muted font-mono mt-0.5">
                  Reg: {safeJob.registration} · Odometer: {safeJob.odometer.toLocaleString()} km
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-dark block">
                  Service Package
                </span>
                <p className="text-xs font-medium text-warm-white mt-0.5">
                  {safeJob.service}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-dark block">
                  Estimate Status
                </span>
                <p className="text-xs font-semibold text-accent-gold mt-0.5">
                  {safeJob.estimate_approved_state}
                </p>
              </div>
            </div>

            {/* Updates & Next Steps */}
            <div className="space-y-4 bg-obsidian/60 p-4 rounded-xs border border-graphite-border/70">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-dark block">
                  Latest Update
                </span>
                <p className="text-xs text-warm-white leading-relaxed mt-1">
                  {safeJob.latest_update}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-dark block">
                  Next Step
                </span>
                <p className="text-xs text-muted leading-relaxed mt-1">
                  {safeJob.next_step}
                </p>
              </div>

              <div className="pt-2 border-t border-graphite-border/50">
                <span className="text-[10px] font-mono text-muted-dark block">
                  Last Updated: {new Date(safeJob.last_updated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}, {new Date(safeJob.last_updated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>

          </div>

          {/* Contact Actions */}
          <div className="pt-6 border-t border-graphite-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 safe-pb">
            <div className="flex items-center gap-2 text-xs text-muted">
              <ShieldCheck className="w-4 h-4 text-accent-gold shrink-0" />
              <span>Dedicated German marque service advisor assigned</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full sm:w-auto">
              <a
                href={safeJob.whatsapp_prefilled_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xs text-xs font-bold uppercase tracking-wider hover:bg-emerald-500/25 transition-colors min-h-[44px]"
              >
                <MessageSquare className="w-4 h-4" /> WhatsApp Expert
              </a>
              <a
                href={`tel:${safeJob.workshop_phone}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-graphite border border-graphite-border text-warm-white rounded-xs text-xs font-bold uppercase tracking-wider hover:bg-graphite-light transition-colors min-h-[44px]"
              >
                <Phone className="w-4 h-4" /> Call Workshop
              </a>
            </div>
          </div>

        </div>
      </Container>
    </div>
  );
};
