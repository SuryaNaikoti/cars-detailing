import React from 'react';
import type { JobCard } from '../../types';
import { STAGE_DISPLAY_MAP } from '../../lib/demoStore';
import {
  MessageSquare,
  Phone,
  ExternalLink,
} from 'lucide-react';

export interface CommunicationsViewProps {
  jobs: JobCard[];
  onOpenCustomerView: (token: string) => void;
}

export const CommunicationsView: React.FC<CommunicationsViewProps> = ({
  jobs,
  onOpenCustomerView,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-graphite-border">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block">
            Contextual Customer Engagement
          </span>
          <h1 className="text-2xl font-black uppercase tracking-tight text-warm-white">
            Communications
          </h1>
          <p className="text-xs text-muted font-light mt-0.5">
            Contextual WhatsApp deep links and phone actions with pre-composed vehicle telemetry updates. (No automated API bot claims).
          </p>
        </div>
      </div>

      {/* Interactive Communication Cards */}
      <div className="space-y-4">
        {jobs.map((job) => {
          const trackingUrl = `${window.location.origin}/?page=status&jobToken=${job.public_token}`;
          
          const waMsg = encodeURIComponent(
            `Hi ${job.customer_name}, this is Torque Expert's updating you on your ${job.vehicle_summary}.\n\nJob: ${job.id}\nCurrent stage: ${STAGE_DISPLAY_MAP[job.status]}\n\nYou can track the latest workshop status here: ${trackingUrl}\n\nPlease let us know if you have any questions!`
          );

          const waUrl = `https://wa.me/${job.customer_phone.replace(/[^0-9]/g, '')}?text=${waMsg}`;

          return (
            <div
              key={job.id}
              className="p-5 rounded-xs bg-graphite/40 border border-graphite-border space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-graphite-border gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-accent-gold">{job.id}</span>
                  <span className="font-bold text-warm-white">{job.customer_name}</span>
                  <span className="text-xs text-muted font-mono">({job.customer_phone})</span>
                </div>

                <span className="px-2.5 py-0.5 rounded-xs bg-accent-gold/15 text-accent-gold font-mono text-xs font-bold uppercase self-start sm:self-auto">
                  {STAGE_DISPLAY_MAP[job.status]}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Vehicle</span>
                  <span className="text-warm-white font-medium">{job.vehicle_summary} ({job.registration})</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Assigned Advisor</span>
                  <span className="text-warm-white font-medium">{job.advisor}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Promised Delivery</span>
                  <span className="text-warm-white font-mono">
                    {new Date(job.promised_completion).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}, {new Date(job.promised_completion).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>

              {/* Message Preview */}
              <div className="p-3 rounded-xs bg-obsidian border border-graphite-border text-xs space-y-1">
                <span className="text-[10px] font-mono text-muted-dark uppercase block">Pre-composed Contextual Message:</span>
                <p className="text-muted leading-relaxed font-mono text-[11px] whitespace-pre-wrap">
                  Hi {job.customer_name}, this is Torque Expert's updating you on your {job.vehicle_summary}.
                  Job: {job.id} · Current stage: {STAGE_DISPLAY_MAP[job.status]}
                  Track URL: {trackingUrl}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-[11px] text-muted-dark font-light">
                  Direct deep link triggers native WhatsApp client with pre-filled telemetry.
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${job.customer_phone}`}
                    className="px-3 py-1.5 bg-graphite border border-graphite-border hover:border-accent-gold text-warm-white rounded-xs text-xs font-mono uppercase inline-flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-accent-gold" /> Call Customer
                  </a>

                  <button
                    onClick={() => onOpenCustomerView(job.public_token)}
                    className="px-3 py-1.5 bg-graphite border border-graphite-border hover:border-accent-gold text-warm-white rounded-xs text-xs font-mono uppercase inline-flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-accent-gold" /> Preview Portal
                  </button>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 rounded-xs text-xs font-mono font-bold uppercase inline-flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Update
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
