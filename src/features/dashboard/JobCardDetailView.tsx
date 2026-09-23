import React, { useState, useRef } from 'react';
import type {
  JobCard,
  JobCardStatus,
  InspectionRecord,
  EstimateRecord,
} from '../../types';
import {
  STAGE_DISPLAY_MAP,
  updateJobStatus,
  createCustomerPortalToken,
} from '../../lib/demoStore';
import {
  ArrowLeft,
  CheckCircle2,
  Car,
  Wrench,
  ClipboardList,
  Calculator,
  History,
  ExternalLink,
  Copy,
  Share2,
  AlertTriangle,
  PenTool,
  Eraser,
} from 'lucide-react';

export interface JobCardDetailViewProps {
  job: JobCard;
  inspection: InspectionRecord | null;
  estimate: EstimateRecord | null;
  onBack: () => void;
  onJobUpdated: (updatedJob: JobCard) => void;
  onOpenCustomerView: (token: string) => void;
  onOpenQuoteToken?: (token: string) => void;
}

export const JobCardDetailView: React.FC<JobCardDetailViewProps> = ({
  job,
  inspection,
  estimate,
  onBack,
  onJobUpdated,
  onOpenCustomerView,
  onOpenQuoteToken,
}) => {
  const [activeTab, setActiveTab] = useState<
    'SUMMARY' | 'INSPECTION' | 'ESTIMATE' | 'WORK' | 'TIMELINE' | 'CUSTOMER_VIEW'
  >('SUMMARY');

  const [copied, setCopied] = useState(false);
  const [statusActionLoading, setStatusActionLoading] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [confirmDeliveryModalOpen, setConfirmDeliveryModalOpen] = useState(false);

  // CF-03: Customer Handover Sign-Off state
  const [deliverySigneeName, setDeliverySigneeName] = useState(job.customer_name);
  const [deliveryNotesInput, setDeliveryNotesInput] = useState('');
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  // Ordered lifecycle progression
  const lifecycleStages: JobCardStatus[] = [
    'VEHICLE_RECEIVED',
    'INSPECTION_COMPLETED',
    'ESTIMATE_SENT',
    'ESTIMATE_APPROVED',
    'WORK_IN_PROGRESS',
    'QUALITY_CHECK',
    'READY_FOR_COLLECTION',
    'DELIVERED',
  ];

  const currentIdx = lifecycleStages.indexOf(job.status);
  const nextStage = currentIdx < lifecycleStages.length - 1 ? lifecycleStages[currentIdx + 1] : null;

  const executeStatusAdvance = (
    targetStatus: JobCardStatus,
    deliveryOptions?: { signature?: string; signoffName?: string; deliveryNotes?: string }
  ) => {
    setStatusActionLoading(true);
    setStatusFeedback(null);

    setTimeout(() => {
      const res = updateJobStatus(
        job.id,
        targetStatus,
        'Rohan Deshmukh (Advisor)',
        `Status transitioned to ${STAGE_DISPLAY_MAP[targetStatus]}`,
        deliveryOptions
      );

      setStatusActionLoading(false);
      if (res.success && res.job) {
        onJobUpdated(res.job);
        setStatusFeedback(`Job successfully moved to ${STAGE_DISPLAY_MAP[targetStatus]}`);
        setTimeout(() => setStatusFeedback(null), 4000);
      }
    }, 200);
  };

  // Canvas drawing helpers for handover signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    isDrawingRef.current = true;
    setHasDrawnSignature(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#D6A84F'; // Accent gold ink
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureDataUrl(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
    setSignatureDataUrl(null);
  };

  const handleAdvanceStatus = (targetStatus: JobCardStatus) => {
    if (targetStatus === 'DELIVERED') {
      setConfirmDeliveryModalOpen(true);
      return;
    }
    executeStatusAdvance(targetStatus);
  };

  const handleCopyTrackingLink = () => {
    const token = job.public_token || createCustomerPortalToken(job.id);
    const trackingUrl = `${window.location.origin}/?page=status&jobToken=${token}`;
    navigator.clipboard.writeText(trackingUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const trackingToken = job.public_token || createCustomerPortalToken(job.id);
  const trackingUrl = `${window.location.origin}/?page=status&jobToken=${trackingToken}`;

  // Pre-filled contextual WhatsApp deep link for customer
  const waMsg = encodeURIComponent(
    `Hi ${job.customer_name}, your ${job.vehicle_summary} service progress at Torque Expert's is currently at: ${STAGE_DISPLAY_MAP[job.status]}.\n\nTrack your vehicle here: ${trackingUrl}`
  );
  const waShareUrl = `https://wa.me/${job.customer_phone.replace(/[^0-9]/g, '')}?text=${waMsg}`;

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-graphite-border">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xs border border-graphite-border text-muted hover:text-warm-white hover:bg-graphite transition-colors"
            title="Return to Job Card List"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-mono uppercase text-warm-white">
                {job.id}
              </h1>
              <span className="px-2.5 py-0.5 rounded-xs bg-accent-gold/15 text-accent-gold border border-accent-gold/30 text-xs font-mono font-bold uppercase">
                {STAGE_DISPLAY_MAP[job.status]}
              </span>
            </div>
            <p className="text-xs text-muted font-light">
              {job.vehicle_summary} · {job.registration} · Owner: <strong className="text-warm-white">{job.customer_name}</strong>
            </p>
          </div>
        </div>

        {/* Status Transition Action Button */}
        <div className="flex items-stretch sm:items-center gap-2 flex-wrap w-full sm:w-auto">
          {nextStage && (
            <button
              disabled={statusActionLoading}
              onClick={() => handleAdvanceStatus(nextStage)}
              className="flex-1 sm:flex-initial px-4 py-3 sm:py-2 bg-accent-gold text-obsidian rounded-xs text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="truncate">MOVE TO {STAGE_DISPLAY_MAP[nextStage].toUpperCase()}</span>
            </button>
          )}

          <button
            onClick={() => onOpenCustomerView(job.public_token)}
            className="flex-1 sm:flex-initial px-3 py-3 sm:py-2 bg-graphite border border-graphite-border text-warm-white rounded-xs text-xs font-semibold uppercase tracking-wider hover:border-accent-gold transition-colors inline-flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            <ExternalLink className="w-3.5 h-3.5 text-accent-gold shrink-0" />
            <span className="truncate">Customer View</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {statusFeedback && (
        <div className="p-3 rounded-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusFeedback} (Shared canonical state persisted to customer portal)</span>
        </div>
      )}

      {/* Lifecycle Stage Indicator */}
      <div className="p-4 rounded-xs bg-graphite/40 border border-graphite-border space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase text-muted-dark tracking-wider">
          <span>Workshop Lifecycle</span>
          <span>Stage {currentIdx + 1} of {lifecycleStages.length}</span>
        </div>

        {/* Mobile Compact Lifecycle Bar (< 768px) */}
        <div className="md:hidden space-y-2 pt-1">
          <div className="flex items-center justify-between p-2.5 rounded-xs bg-obsidian border border-accent-gold/40">
            <span className="text-xs font-mono font-bold text-accent-gold uppercase">
              Current: {STAGE_DISPLAY_MAP[job.status]}
            </span>
            <span className="text-[10px] font-mono text-muted-dark">
              {currentIdx + 1}/{lifecycleStages.length}
            </span>
          </div>
          {nextStage && (
            <button
              onClick={() => handleAdvanceStatus(nextStage)}
              disabled={statusActionLoading}
              className="w-full py-3 bg-accent-gold text-obsidian rounded-xs text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors flex items-center justify-center gap-1.5 min-h-[48px] shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Advance to {STAGE_DISPLAY_MAP[nextStage].toUpperCase()}</span>
            </button>
          )}
        </div>

        {/* Desktop Detailed Stage Grid (>= 768px) */}
        <div className="hidden md:grid sm:grid-cols-4 lg:grid-cols-8 gap-1.5 pt-1">
          {lifecycleStages.map((st, idx) => {
            const isPassed = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <button
                key={st}
                onClick={() => handleAdvanceStatus(st)}
                title={`Set stage to ${STAGE_DISPLAY_MAP[st]}`}
                className={`p-2 rounded-xs text-left transition-all border ${
                  isCurrent
                    ? 'bg-accent-gold/20 border-accent-gold text-accent-gold font-bold ring-1 ring-accent-gold/30'
                    : isPassed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-obsidian border-graphite-border text-muted-dark hover:text-muted'
                }`}
              >
                <span className="text-[9px] font-mono block opacity-70">0{idx + 1}</span>
                <span className="text-[10px] font-semibold uppercase leading-tight block truncate">
                  {STAGE_DISPLAY_MAP[st]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Section Selector (< 768px) - App Style, No Horizontal Slider */}
      <div className="md:hidden bg-graphite/40 border border-graphite-border p-3 rounded-xs space-y-1.5">
        <label className="text-[10px] font-mono uppercase tracking-widest text-muted-dark block">
          Job Card View Section
        </label>
        <div className="relative">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="w-full bg-obsidian border border-accent-gold/50 rounded-xs py-3 px-3 text-xs font-bold text-accent-gold uppercase font-mono focus:outline-none min-h-[44px]"
          >
            <option value="SUMMARY">1. Summary & Vehicle Intake</option>
            <option value="INSPECTION">2. Vehicle Condition Inspection</option>
            <option value="ESTIMATE">3. Scope & Financial Estimate</option>
            <option value="WORK">4. Work Notes & Technical Log</option>
            <option value="TIMELINE">5. Lifecycle Event Timeline</option>
            <option value="CUSTOMER_VIEW">6. Customer Portal Link</option>
          </select>
        </div>
      </div>

      {/* Desktop Tabs (>= 768px) */}
      <div className="hidden md:flex border-b border-graphite-border items-center gap-1 text-xs font-mono tracking-wider">
        {[
          { id: 'SUMMARY', label: '1. SUMMARY', icon: Car },
          { id: 'INSPECTION', label: '2. INSPECTION', icon: ClipboardList },
          { id: 'ESTIMATE', label: '3. ESTIMATE', icon: Calculator },
          { id: 'WORK', label: '4. WORK', icon: Wrench },
          { id: 'TIMELINE', label: '5. TIMELINE', icon: History },
          { id: 'CUSTOMER_VIEW', label: '6. CUSTOMER VIEW', icon: ExternalLink },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 uppercase border-b-2 font-semibold transition-colors flex items-center gap-2 ${
                isActive
                  ? 'border-accent-gold text-accent-gold bg-accent-gold/5'
                  : 'border-transparent text-muted hover:text-warm-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SUMMARY */}
      {activeTab === 'SUMMARY' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xs bg-graphite/40 border border-graphite-border space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent-gold font-mono">
              Vehicle & Customer Intake
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Customer Name</span>
                  <span className="font-semibold text-warm-white">{job.customer_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Phone</span>
                  <span className="font-mono text-warm-white">{job.customer_phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Vehicle</span>
                  <span className="font-semibold text-warm-white">{job.vehicle_summary}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Registration</span>
                  <span className="font-mono text-warm-white">{job.registration}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Odometer</span>
                  <span className="font-mono text-warm-white">{job.odometer.toLocaleString()} km</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Fuel Level</span>
                  <span className="font-mono text-warm-white">{job.fuel_level}</span>
                </div>
              </div>

              <div className="p-3 rounded-xs bg-obsidian border border-graphite-border space-y-1">
                <span className="text-[10px] text-muted-dark uppercase font-mono block">Customer Complaint</span>
                <p className="text-warm-white leading-relaxed">{job.customer_complaint}</p>
              </div>

              {job.intake_notes && (
                <div className="p-3 rounded-xs bg-obsidian border border-graphite-border space-y-1">
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Intake Notes</span>
                  <p className="text-muted leading-relaxed">{job.intake_notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-5 rounded-xs bg-graphite/40 border border-graphite-border space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent-gold font-mono">
              Workshop Floor Assignment
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Assigned Bay</span>
                  <span className="font-mono font-bold text-warm-white text-sm">{job.bay}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Lead Technician</span>
                  <span className="font-semibold text-warm-white text-sm">{job.technician}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Service Advisor</span>
                  <span className="font-medium text-warm-white">{job.advisor}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Promised Completion</span>
                  <span className="font-mono text-warm-white">
                    {new Date(job.promised_completion).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}, {new Date(job.promised_completion).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-graphite-border">
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Estimate Total</span>
                  <span className="font-mono font-bold text-accent-gold text-base">
                    {job.estimate_total > 0 ? `₹${job.estimate_total.toLocaleString()}` : 'Pending'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Approval State</span>
                  <span className={`text-xs font-bold font-mono uppercase ${
                    job.approval_status === 'APPROVED' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {job.approval_status}
                  </span>
                </div>
              </div>

              {/* Handover Delivery Acknowledgement Display */}
              {job.delivered_at && (
                <div className="p-3 rounded-xs bg-obsidian border border-emerald-500/30 text-xs space-y-1.5 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Handover Completed
                    </span>
                    <span className="text-[10px] text-muted font-mono">
                      {new Date(job.delivered_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {job.handover_signoff_name && (
                    <p className="text-warm-white text-[11px]">
                      Received By: <strong>{job.handover_signoff_name}</strong>
                    </p>
                  )}
                  {job.customer_signature && (
                    <div className="pt-1">
                      <span className="text-[9px] text-muted uppercase font-mono block mb-1">Customer Sign-off</span>
                      <img
                        src={job.customer_signature}
                        alt="Customer Signature"
                        className="h-10 border border-graphite-border rounded-xs bg-obsidian/60 px-2 py-0.5 object-contain"
                      />
                    </div>
                  )}
                  {job.delivery_notes && (
                    <p className="text-[10px] text-muted italic">Notes: {job.delivery_notes}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INSPECTION */}
      {activeTab === 'INSPECTION' && (
        <div className="p-5 rounded-xs bg-graphite/40 border border-graphite-border space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
            <div>
              <h3 className="text-sm font-bold uppercase text-warm-white">
                Digital Vehicle Inspection Findings
              </h3>
              <p className="text-xs text-muted">
                Inspector: <strong className="text-warm-white">{inspection?.inspector_name || job.technician}</strong> · Status: <strong className="text-accent-gold">{inspection?.status || 'COMPLETED'}</strong>
              </p>
            </div>
          </div>

          {inspection ? (
            <div className="space-y-4">
              {/* Category Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { label: 'Exterior', cond: inspection.exterior_status },
                  { label: 'Interior', cond: inspection.interior_status },
                  { label: 'Engine Bay', cond: inspection.engine_bay_status },
                  { label: 'Brakes', cond: inspection.brakes_status },
                  { label: 'Tyres/Wheels', cond: inspection.tyres_status },
                  { label: 'Lights', cond: inspection.lights_status },
                  { label: 'Battery', cond: inspection.battery_status },
                  { label: 'Fluids', cond: inspection.fluids_status },
                ].map((item) => (
                  <div key={item.label} className="p-2.5 rounded-xs bg-obsidian border border-graphite-border space-y-1">
                    <span className="text-[10px] text-muted-dark uppercase font-mono block">{item.label}</span>
                    <span className={`text-[11px] font-mono font-bold uppercase ${
                      item.cond === 'GOOD'
                        ? 'text-emerald-400'
                        : item.cond === 'ATTENTION'
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}>
                      {item.cond}
                    </span>
                  </div>
                ))}
              </div>

              {/* Itemized Findings */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase text-warm-white block">
                  Detailed Findings & Recommendations ({inspection.findings.length})
                </span>

                <div className="space-y-2">
                  {inspection.findings.map((f) => (
                    <div key={f.id} className="p-3 rounded-xs bg-obsidian border border-graphite-border text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-warm-white">{f.category}</span>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-xs uppercase ${
                          f.condition === 'CRITICAL' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
                        }`}>
                          {f.condition}
                        </span>
                      </div>
                      <p className="text-muted"><strong className="text-warm-white">Observation:</strong> {f.finding}</p>
                      <p className="text-accent-gold"><strong className="text-warm-white">Recommendation:</strong> {f.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted text-xs">
              No inspection recorded for this job yet.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ESTIMATE */}
      {activeTab === 'ESTIMATE' && (
        <div className="p-5 rounded-xs bg-graphite/40 border border-graphite-border space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
            <div>
              <h3 className="text-sm font-bold uppercase text-warm-white">
                Itemized Scope Estimate & Customer Authorization
              </h3>
              <p className="text-xs text-muted">
                Estimate: <strong className="text-warm-white">{estimate?.estimate_number || 'Pending'}</strong> · Status: <strong className="text-accent-gold">{estimate?.status || job.approval_status}</strong>
              </p>
            </div>

            {estimate && (
              <button
                onClick={() => {
                  if (onOpenQuoteToken) onOpenQuoteToken(estimate.public_token);
                }}
                className="text-xs font-mono text-accent-gold hover:underline inline-flex items-center gap-1 uppercase"
              >
                Open Quote Portal View <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {estimate ? (
            <div className="space-y-4">
              <div className="border border-graphite-border rounded-xs overflow-hidden bg-obsidian text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-graphite/80 border-b border-graphite-border text-[10px] font-mono uppercase text-muted-dark">
                      <th className="p-3">Scope Description</th>
                      <th className="p-3">Type</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-graphite-border/60">
                    {estimate.items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-3 text-warm-white font-medium">{item.description}</td>
                        <td className="p-3 text-muted font-mono">{item.type}</td>
                        <td className="p-3 text-center text-muted font-mono">{item.quantity}</td>
                        <td className="p-3 text-right font-mono font-bold text-warm-white">
                          ₹{item.line_total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted">
                    <span>Labour</span>
                    <span className="font-mono">₹{estimate.labour_total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Parts & Consumables</span>
                    <span className="font-mono">₹{estimate.parts_total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-warm-white pt-2 border-t border-graphite-border">
                    <span>Estimate Total</span>
                    <span className="font-mono text-accent-gold">₹{estimate.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted text-xs">
              No digital estimate generated yet.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: WORK */}
      {activeTab === 'WORK' && (
        <div className="p-5 rounded-xs bg-graphite/40 border border-graphite-border space-y-4">
          <h3 className="text-sm font-bold uppercase text-warm-white">
            Technician Assignment & Work Log
          </h3>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-muted-dark uppercase font-mono block">Assigned Technician</span>
                <span className="text-warm-white font-semibold">{job.technician}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-dark uppercase font-mono block">Current Bay</span>
                <span className="text-warm-white font-mono">{job.bay}</span>
              </div>
            </div>

            <div className="p-4 rounded-xs bg-obsidian border border-graphite-border space-y-2">
              <span className="text-[10px] text-muted-dark uppercase font-mono block">Work Execution Notes</span>
              <p className="text-warm-white leading-relaxed">
                {job.work_notes || 'Diagnostic scanning executed. Technician progressing with approved scope items.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TIMELINE */}
      {activeTab === 'TIMELINE' && (
        <div className="p-5 rounded-xs bg-graphite/40 border border-graphite-border space-y-4">
          <h3 className="text-sm font-bold uppercase text-warm-white">
            Chronological Job Timeline
          </h3>

          <div className="space-y-3">
            {[...job.timeline].reverse().map((event) => (
              <div
                key={event.id}
                className="p-3 rounded-xs bg-obsidian border border-graphite-border text-xs flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-warm-white">{event.event_label}</span>
                    <span className="px-1.5 py-0.5 rounded-xs bg-accent-gold/10 text-accent-gold text-[9px] font-mono uppercase">
                      {event.status}
                    </span>
                  </div>
                  <p className="text-muted text-[11px]">Actor: <strong className="text-warm-white">{event.actor}</strong></p>
                  {event.notes && <p className="text-muted-dark text-[11px] italic">{event.notes}</p>}
                </div>

                <span className="text-[10px] font-mono text-muted whitespace-nowrap">
                  {new Date(event.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}, {new Date(event.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: CUSTOMER VIEW */}
      {activeTab === 'CUSTOMER_VIEW' && (
        <div className="p-6 rounded-xs bg-graphite/40 border border-graphite-border space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
            <div>
              <h3 className="text-sm font-bold uppercase text-warm-white">
                Customer Service Tracking Link
              </h3>
              <p className="text-xs text-muted">
                Opaque, non-guessable customer token: <strong className="font-mono text-accent-gold">{job.public_token}</strong>
              </p>
            </div>

            <button
              onClick={() => onOpenCustomerView(job.public_token)}
              className="px-3 py-1.5 bg-accent-gold text-obsidian rounded-xs text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors inline-flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open Customer View
            </button>
          </div>

          <div className="p-4 rounded-xs bg-obsidian border border-graphite-border space-y-3">
            <span className="text-[10px] font-mono text-muted-dark uppercase tracking-wider block">
              Direct Tracking URL
            </span>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={trackingUrl}
                className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white select-all focus:outline-none"
              />
              <button
                onClick={handleCopyTrackingLink}
                className="px-3 py-2 bg-graphite border border-graphite-border hover:border-accent-gold rounded-xs text-xs font-mono uppercase text-warm-white shrink-0 inline-flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-accent-gold" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={waShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xs text-xs font-bold uppercase tracking-wider hover:bg-emerald-500/25 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> Share Progress via WhatsApp
            </a>
          </div>

          <div className="p-4 rounded-xs bg-obsidian border border-graphite-border/60 text-xs text-muted space-y-1 leading-relaxed">
            <span className="font-bold text-warm-white block">Privacy Guarantee:</span>
            <p>
              The customer tracking portal is isolated via <code>getCustomerSafeJobView()</code>. Internal technician notes, staff margins, inventory details, and other customer data are strictly omitted from this public view.
            </p>
          </div>
        </div>
      )}

      {/* DELIVERY CONFIRMATION MODAL */}
      {confirmDeliveryModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deliver-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/85 backdrop-blur-xs"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setConfirmDeliveryModalOpen(false);
          }}
        >
          <div className="max-w-md w-full p-6 rounded-xs bg-graphite border border-accent-gold/50 space-y-4 shadow-2xl font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-accent-gold pb-2 border-b border-graphite-border">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 id="deliver-modal-title" className="text-sm font-bold uppercase tracking-wider text-warm-white">
                CONFIRM VEHICLE DELIVERY
              </h3>
            </div>

            <p className="text-muted leading-relaxed">
              You are completing the final delivery handover for <strong className="text-warm-white">{job.vehicle_summary} ({job.registration})</strong> to customer <strong className="text-warm-white">{job.customer_name}</strong>.
            </p>

            {/* CF-03: Optional Customer Handover Sign-off */}
            <div className="p-3 rounded-xs bg-obsidian/90 border border-graphite-border space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-accent-gold uppercase flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Customer Handover Acknowledgement (Optional)</span>
                </span>
                {hasDrawnSignature && (
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-[10px] text-muted hover:text-red-400 flex items-center gap-1 font-mono transition-colors"
                  >
                    <Eraser className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>

              <div>
                <label className="text-[10px] text-muted-dark block mb-1 font-mono">Signee Name</label>
                <input
                  type="text"
                  value={deliverySigneeName}
                  onChange={(e) => setDeliverySigneeName(e.target.value)}
                  placeholder="Customer or authorized recipient name"
                  className="w-full bg-graphite border border-graphite-border rounded-xs px-2.5 py-1.5 text-xs text-warm-white font-mono focus:border-accent-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted-dark block mb-1 font-mono">
                  Digital Signature (Draw or Touch)
                </label>
                <div className="border border-graphite-border rounded-xs bg-obsidian relative overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={380}
                    height={110}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-[110px] cursor-crosshair touch-none block"
                  />
                  {!hasDrawnSignature && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-[11px] text-muted-dark font-mono">
                      <span>Sign here with stylus or finger (Optional)</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-muted-dark block mb-1 font-mono">Handover Notes</label>
                <input
                  type="text"
                  value={deliveryNotesInput}
                  onChange={(e) => setDeliveryNotesInput(e.target.value)}
                  placeholder="Optional delivery handover remark"
                  className="w-full bg-graphite border border-graphite-border rounded-xs px-2.5 py-1.5 text-xs text-warm-white font-mono focus:border-accent-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 rounded-xs bg-obsidian/80 border border-graphite-border text-[11px] text-muted space-y-1">
              <span className="font-bold text-accent-gold block">OPERATIONAL CONSEQUENCES:</span>
              <span>• Job status will transition to <strong className="text-warm-white">DELIVERED</strong>.</span>
              <br />
              <span>• Bay allocation will be cleared and marked available.</span>
              <br />
              <span>• Service history archive entry will be permanently linked.</span>
              <br />
              <span>• Customer tracking status will reflect vehicle handover complete.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-graphite-border">
              <button
                type="button"
                onClick={() => setConfirmDeliveryModalOpen(false)}
                className="px-4 py-2 rounded-xs border border-graphite-border hover:border-warm-white text-muted hover:text-warm-white transition-colors min-h-[44px]"
              >
                CANCEL
              </button>
              <button
                type="button"
                id="btn-confirm-deliver-vehicle"
                onClick={() => {
                  setConfirmDeliveryModalOpen(false);
                  executeStatusAdvance('DELIVERED', {
                    signature: signatureDataUrl || undefined,
                    signoffName: deliverySigneeName.trim() || job.customer_name,
                    deliveryNotes: deliveryNotesInput.trim() || undefined,
                  });
                }}
                className="px-4 py-2 rounded-xs bg-accent-gold hover:bg-white text-obsidian font-bold transition-colors min-h-[44px] flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CONFIRM & DELIVER VEHICLE</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
