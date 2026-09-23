import React from 'react';
import {
  Car,
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  ArrowRight,
  Plus,
  Calendar,
  MessageSquare,
  BellRing,
  ExternalLink,
} from 'lucide-react';
import type {
  JobCard,
  AppointmentRecord,
  LeadRecord,
  ServiceReminder,
} from '../../types';
import { STAGE_DISPLAY_MAP } from '../../lib/demoStore';

export interface OverviewViewProps {
  jobs: JobCard[];
  appointments: AppointmentRecord[];
  leads: LeadRecord[];
  reminders: ServiceReminder[];
  onOpenJob: (jobId: string) => void;
  onNavigateModule: (module: any) => void;
  onQuickAction: (action: string) => void;
}

// 4 canonical bays in the workshop
const STANDARD_BAYS = [
  { bayNumber: 'BAY 01', defaultName: 'Diagnostic & Heavy Mechanical' },
  { bayNumber: 'BAY 02', defaultName: 'Electrical & Fast Mechanical' },
  { bayNumber: 'BAY 03', defaultName: 'Periodic Service & Suspension' },
  { bayNumber: 'BAY 04', defaultName: 'Quality Inspection & Detailing' },
];

export const OverviewView: React.FC<OverviewViewProps> = ({
  jobs,
  appointments,
  leads,
  reminders,
  onOpenJob,
  onNavigateModule,
  onQuickAction,
}) => {
  // Operational calculations adhering to canonical states
  const vehiclesToday = jobs.length;
  const activeJobs = jobs.filter((j) => j.status !== 'DELIVERED');
  const awaitingApproval = jobs.filter(
    (j) => j.status === 'ESTIMATE_SENT' || j.approval_status === 'PENDING'
  );
  const waitingForParts = jobs.filter(
    (j) =>
      j.intake_notes?.toLowerCase().includes('parts') ||
      j.work_notes?.toLowerCase().includes('parts')
  );
  const readyForCollection = jobs.filter(
    (j) => j.status === 'READY_FOR_COLLECTION'
  );
  const todaysEnquiries = leads.filter(
    (l) => l.status === 'NEW' || l.status === 'APPOINTMENT_REQUESTED'
  );

  // 6 Actionable KPI Concepts
  const kpis = [
    {
      id: 'kpi-vehicles',
      label: 'Vehicles Today',
      value: vehiclesToday,
      icon: Car,
      color: 'text-warm-white',
      destination: 'appointments',
      actionable: true,
    },
    {
      id: 'kpi-active-jobs',
      label: 'Active Jobs',
      value: activeJobs.length,
      icon: Wrench,
      color: 'text-accent-gold',
      destination: 'jobs',
      actionable: true,
    },
    {
      id: 'kpi-awaiting-approval',
      label: 'Awaiting Approval',
      value: awaitingApproval.length,
      icon: Clock,
      color: 'text-amber-400',
      destination: 'estimates',
      actionable: true,
    },
    {
      id: 'kpi-waiting-parts',
      label: 'Waiting for Parts',
      value: waitingForParts.length,
      icon: AlertTriangle,
      color: 'text-orange-400',
      destination: 'floor',
      actionable: waitingForParts.length > 0,
    },
    {
      id: 'kpi-ready-collection',
      label: 'Ready for Collection',
      value: readyForCollection.length,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      destination: 'jobs',
      actionable: true,
    },
    {
      id: 'kpi-todays-enquiries',
      label: "Today's Enquiries",
      value: todaysEnquiries.length,
      icon: UserCheck,
      color: 'text-sky-400',
      destination: 'leads',
      actionable: true,
    },
  ];

  // Compute "ATTENTION REQUIRED" items strictly from existing records
  interface AttentionItem {
    id: string;
    priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
    title: string;
    entity: string;
    reason: string;
    actionLabel: string;
    onAction: () => void;
  }

  const attentionItems: AttentionItem[] = [];

  // 1. Estimates awaiting customer approval
  awaitingApproval.forEach((job) => {
    attentionItems.push({
      id: `att-est-${job.id}`,
      priority: 'HIGH',
      title: 'Estimate awaiting approval',
      entity: `${job.vehicle_summary} · ${job.id}`,
      reason: 'Customer approval pending for estimate transmission',
      actionLabel: 'OPEN JOB',
      onAction: () => onOpenJob(job.id),
    });
  });

  // 2. Vehicles waiting for parts
  waitingForParts.forEach((job) => {
    attentionItems.push({
      id: `att-parts-${job.id}`,
      priority: 'HIGH',
      title: 'Vehicle waiting for parts',
      entity: `${job.vehicle_summary} · ${job.id}`,
      reason: 'Work halted pending parts allocation',
      actionLabel: 'OPEN JOB',
      onAction: () => onOpenJob(job.id),
    });
  });

  // 3. Vehicles ready for collection
  readyForCollection.forEach((job) => {
    attentionItems.push({
      id: `att-coll-${job.id}`,
      priority: 'HIGH',
      title: 'Vehicle ready for collection',
      entity: `${job.vehicle_summary} · ${job.id}`,
      reason: 'Quality check verified · Customer collection pending',
      actionLabel: 'OPEN JOB',
      onAction: () => onOpenJob(job.id),
    });
  });

  // 4. Appointments requiring confirmation
  appointments
    .filter((a) => a.status === 'REQUESTED')
    .forEach((apt) => {
      attentionItems.push({
        id: `att-apt-${apt.id}`,
        priority: 'NORMAL',
        title: 'Appointment requiring confirmation',
        entity: `${apt.customer_name} · ${apt.vehicle_summary}`,
        reason: `Requested for ${apt.requested_date} at ${apt.requested_time}`,
        actionLabel: 'VIEW SCHEDULE',
        onAction: () => onNavigateModule('appointments'),
      });
    });

  // 5. High-priority new leads
  leads
    .filter((l) => (l.status === 'NEW' || l.status === 'APPOINTMENT_REQUESTED') && (l.priority === 'HIGH' || l.priority === 'URGENT'))
    .forEach((lead) => {
      attentionItems.push({
        id: `att-lead-${lead.id}`,
        priority: lead.priority === 'URGENT' ? 'CRITICAL' : 'HIGH',
        title: 'High-priority new enquiry',
        entity: `${lead.customer_name} · ${lead.service_requested}`,
        reason: lead.message || 'Direct customer service consultation enquiry',
        actionLabel: 'OPEN LEAD',
        onAction: () => onNavigateModule('leads'),
      });
    });

  // 6. Overdue service follow-ups
  reminders
    .filter((r) => r.status === 'OVERDUE' || r.status === 'DUE')
    .slice(0, 2)
    .forEach((rem) => {
      attentionItems.push({
        id: `att-rem-${rem.id}`,
        priority: rem.status === 'OVERDUE' ? 'CRITICAL' : 'NORMAL',
        title: rem.status === 'OVERDUE' ? 'Overdue service follow-up' : 'Service follow-up due',
        entity: `${rem.customer_name} · ${rem.vehicle_summary}`,
        reason: `Due: ${rem.due_date} · ${rem.recommended_service}`,
        actionLabel: 'CONTACT',
        onAction: () => onNavigateModule('reminders'),
      });
    });

  // Urgency sort: CRITICAL -> HIGH -> NORMAL
  const priorityOrder: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 1,
    NORMAL: 2,
  };
  attentionItems.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ============================================================ */}
      {/* 1. PAGE HEADER & PRIMARY ACTIONS */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-graphite-border">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block font-bold">
            Operational Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-warm-white">
            Workshop Overview
          </h1>
          <p className="text-xs sm:text-sm text-muted font-light mt-1 max-w-2xl">
            Current workshop status, active jobs, upcoming appointments, and actions requiring attention.
          </p>
        </div>

        {/* Action hierarchy: 
            Desktop: [ + NEW LEAD ] [ + NEW APPOINTMENT ] [ + NEW JOB CARD ]
            Mobile: [ + NEW JOB CARD ] full-width on top, [ + NEW APPOINTMENT ] [ + NEW LEAD ] row below
        */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 md:pt-0 w-full sm:w-auto">
          {/* Mobile Top Full-Width Primary Action */}
          <button
            onClick={() => onQuickAction('new-job')}
            className="sm:order-3 w-full sm:w-auto px-4 py-2.5 min-h-[44px] md:min-h-[40px] bg-accent-gold text-obsidian rounded-xs text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm focus:outline-none focus:ring-1 focus:ring-warm-white shrink-0"
          >
            <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
            <span>New Job Card</span>
          </button>

          {/* Secondary Actions: Pair side-by-side on mobile, stack if extremely narrow */}
          <div className="flex flex-col min-[360px]:flex-row sm:order-1 items-stretch sm:items-center gap-2 flex-1 sm:flex-initial">
            <button
              onClick={() => onQuickAction('new-lead')}
              className="flex-1 px-3.5 py-2 min-h-[44px] md:min-h-[40px] bg-graphite border border-graphite-border hover:border-accent-gold text-warm-white rounded-xs text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-accent-gold whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 text-accent-gold" />
              <span>New Lead</span>
            </button>
            <button
              onClick={() => onQuickAction('new-appointment')}
              className="flex-1 px-3.5 py-2 min-h-[44px] md:min-h-[40px] bg-graphite border border-graphite-border hover:border-accent-gold text-warm-white rounded-xs text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-accent-gold whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 text-accent-gold" />
              <span>New Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. OPERATIONAL KPI STRIP */}
      {/* Desktop: 6-cols | Tablet: 3-cols | Mobile: 2-cols */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              onClick={() => {
                if (kpi.actionable && kpi.destination) {
                  onNavigateModule(kpi.destination);
                }
              }}
              role={kpi.actionable ? 'button' : undefined}
              tabIndex={kpi.actionable ? 0 : undefined}
              onKeyDown={(e) => {
                if (kpi.actionable && (e.key === 'Enter' || e.key === ' ')) {
                  onNavigateModule(kpi.destination);
                }
              }}
              className={`p-3 sm:p-4 rounded-xs bg-graphite/40 border border-graphite-border flex flex-col justify-between min-h-[90px] sm:min-h-[96px] transition-all relative ${
                kpi.actionable
                  ? 'cursor-pointer hover:border-accent-gold/70 hover:bg-graphite/60'
                  : 'cursor-default'
              }`}
            >
              <div className="flex items-start justify-between gap-1 text-muted-dark">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider block font-semibold leading-tight pr-1">
                  {kpi.label}
                </span>
                <Icon className={`w-3.5 h-3.5 shrink-0 opacity-70 ${kpi.color}`} />
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl sm:text-2xl font-black font-mono tracking-tight text-warm-white">
                  {kpi.value}
                </span>
                {kpi.actionable && (
                  <ArrowRight className="w-3 h-3 text-muted-dark opacity-30 hover:opacity-100" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* 3. ATTENTION REQUIRED (Display maximum 4 items) */}
      {/* ============================================================ */}
      <section className="p-4 sm:p-5 rounded-xs bg-graphite/30 border border-graphite-border space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-graphite-border/70">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-warm-white">
              Attention Required
            </h2>
            <span className="px-2 py-0.5 rounded-xs bg-accent-gold/15 text-accent-gold text-[10px] font-mono font-bold">
              {attentionItems.length}
            </span>
          </div>
          <button
            onClick={() => onNavigateModule('jobs')}
            className="text-[11px] text-accent-gold hover:underline uppercase tracking-wider font-mono inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {attentionItems.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted font-mono">
            No items currently requiring immediate attention. All jobs advancing normally.
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Limit display to maximum 4 highest-priority items */}
            {attentionItems.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xs bg-obsidian border border-graphite-border hover:border-accent-gold/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {item.priority === 'CRITICAL' && (
                      <span className="px-2 py-0.5 rounded-xs bg-red-500/15 border border-red-500/40 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                        CRITICAL
                      </span>
                    )}
                    {item.priority === 'HIGH' && (
                      <span className="px-2 py-0.5 rounded-xs bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                        HIGH
                      </span>
                    )}
                    {item.priority === 'NORMAL' && (
                      <span className="px-2 py-0.5 rounded-xs bg-graphite border border-graphite-border text-muted text-[10px] font-mono font-bold uppercase tracking-wider">
                        NORMAL
                      </span>
                    )}
                    <span className="text-xs sm:text-sm font-bold text-warm-white truncate">
                      {item.title}
                    </span>
                  </div>
                  
                  <p className="text-xs sm:text-sm font-semibold text-accent-gold truncate font-mono">
                    {item.entity}
                  </p>
                  <p className="text-xs text-muted line-clamp-1">
                    {item.reason}
                  </p>
                </div>

                <div className="shrink-0 flex items-center justify-end w-full sm:w-auto pt-1 sm:pt-0">
                  <button
                    onClick={item.onAction}
                    className="w-full sm:w-auto px-4 py-2 min-h-[44px] sm:min-h-[38px] bg-graphite/80 border border-graphite-border hover:border-accent-gold text-warm-white hover:text-accent-gold rounded-xs text-xs font-mono font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 4. MAIN OPERATIONAL AREA */}
      {/* Left: Active Workshop Floor + Priority Lifecycle Queue */}
      {/* Right: Today's Appointments */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols on Desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Workshop Floor */}
          <section className="space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-graphite-border/70">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-warm-white">
                  Active Workshop Floor
                </h2>
                <span className="text-xs font-mono text-muted-dark">
                  (Bays 01–04)
                </span>
              </div>
              <button
                onClick={() => onNavigateModule('floor')}
                className="text-xs text-accent-gold hover:underline uppercase tracking-wider font-mono inline-flex items-center gap-1"
              >
                <span>View All Bays</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Bay Grid: 2 columns on desktop, 1 column on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STANDARD_BAYS.map((bay) => {
                // Rule: DELIVERED vehicles do NOT appear on active workshop floor
                const activeJob = activeJobs.find((j) => j.bay === bay.bayNumber);

                if (!activeJob) {
                  return (
                    <div
                      key={bay.bayNumber}
                      className="p-4 sm:p-5 rounded-xs bg-obsidian/40 border border-graphite-border/50 border-dashed flex flex-col justify-between min-h-[190px]"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-graphite-border/30">
                        <span className="text-xs font-mono font-bold text-muted-dark">
                          {bay.bayNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-xs bg-graphite/40 border border-graphite-border text-[10px] font-mono text-muted uppercase">
                          AVAILABLE
                        </span>
                      </div>

                      <div className="py-4 space-y-1">
                        <p className="text-sm text-muted font-medium">
                          {bay.defaultName}
                        </p>
                        <p className="text-xs text-muted-dark font-mono">
                          No vehicle currently assigned.
                        </p>
                      </div>

                      <div className="text-[10px] font-mono text-muted-dark uppercase tracking-widest pt-2 border-t border-graphite-border/20">
                        Ready For Intake
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={bay.bayNumber}
                    className="p-4 sm:p-5 rounded-xs bg-graphite/50 border border-graphite-border hover:border-accent-gold/70 transition-all flex flex-col justify-between min-h-[220px] space-y-3.5 shadow-sm"
                  >
                    {/* Header: BAY & OCCUPIED badge + JOB ID */}
                    <div className="flex items-center justify-between pb-2 border-b border-graphite-border/60">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-xs bg-obsidian border border-accent-gold/30 text-[10px] font-mono font-bold text-accent-gold">
                          {activeJob.bay}
                        </span>
                        <span className="px-2 py-0.5 rounded-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase">
                          OCCUPIED
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-mono text-warm-white font-bold">
                        {activeJob.id}
                      </span>
                    </div>

                    {/* Vehicle, Registration & Customer */}
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-warm-white leading-snug truncate">
                        {activeJob.vehicle_summary}
                      </h3>
                      <div className="text-xs text-muted font-mono flex flex-wrap items-center gap-x-2">
                        <span className="text-warm-white font-semibold">{activeJob.registration}</span>
                        <span>·</span>
                        <span className="truncate">{activeJob.customer_name}</span>
                      </div>
                    </div>

                    {/* Stage & Technician */}
                    <div className="p-2.5 rounded-xs bg-obsidian border border-graphite-border space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-dark font-mono uppercase">Current Stage</span>
                        <span className="font-mono font-bold text-accent-gold uppercase text-[11px]">
                          {STAGE_DISPLAY_MAP[activeJob.status]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-graphite-border/40">
                        <span className="text-muted">Technician</span>
                        <span className="text-warm-white font-medium">{activeJob.technician}</span>
                      </div>
                    </div>

                    {/* Single Primary Action: OPEN JOB */}
                    <button
                      onClick={() => onOpenJob(activeJob.id)}
                      className="w-full py-2.5 min-h-[44px] md:min-h-[40px] bg-accent-gold/15 border border-accent-gold/40 hover:bg-accent-gold hover:text-obsidian text-accent-gold rounded-xs text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1.5 font-mono"
                    >
                      <span>OPEN JOB</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Priority Lifecycle Queue */}
          <section className="p-4 sm:p-5 rounded-xs bg-graphite/20 border border-graphite-border space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-graphite-border/60">
              <span className="text-xs font-bold uppercase tracking-wider text-warm-white">
                Priority Lifecycle Queue
              </span>
              <span className="text-[10px] font-mono text-muted-dark">
                Workflow Progression
              </span>
            </div>

            <div className="space-y-2">
              {activeJobs.length === 0 ? (
                <div className="py-4 text-center text-xs text-muted font-mono">
                  No active jobs awaiting progression.
                </div>
              ) : (
                activeJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => onOpenJob(job.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xs bg-obsidian border border-graphite-border hover:border-accent-gold transition-colors cursor-pointer text-xs gap-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-bold text-accent-gold shrink-0">{job.id}</span>
                      <div className="min-w-0">
                        <span className="text-warm-white font-semibold block sm:inline truncate">
                          {job.vehicle_summary}
                        </span>
                        <span className="text-muted font-mono text-xs sm:ml-2">({job.registration})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 shrink-0">
                      <span className="px-2 py-0.5 rounded-xs bg-accent-gold/10 text-accent-gold text-[10px] font-mono uppercase font-semibold">
                        {STAGE_DISPLAY_MAP[job.status]}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenJob(job.id);
                        }}
                        className="px-3 py-1.5 min-h-[36px] sm:min-h-[28px] text-[10px] font-mono text-warm-white hover:text-accent-gold border border-graphite-border rounded-xs uppercase tracking-wider inline-flex items-center justify-center"
                      >
                        OPEN JOB
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>

        {/* Right Column: Today's Appointments */}
        <div className="space-y-6">
          
          {/* Today's Appointments */}
          <section className="p-4 sm:p-5 rounded-xs bg-graphite/40 border border-graphite-border space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-graphite-border/60">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-accent-gold" />
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-warm-white">
                  Today's Appointments
                </h2>
              </div>
              <button
                onClick={() => onNavigateModule('appointments')}
                className="text-[10px] text-accent-gold uppercase font-mono hover:underline inline-flex items-center gap-1"
              >
                <span>Schedule</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {appointments.slice(0, 4).map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => onNavigateModule('appointments')}
                  className="p-3.5 rounded-xs bg-obsidian border border-graphite-border hover:border-accent-gold/60 transition-colors cursor-pointer space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-accent-gold font-bold text-xs sm:text-sm">{apt.requested_time}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded-xs uppercase font-bold ${
                        apt.status === 'ARRIVED'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : apt.status === 'CONFIRMED'
                          ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                          : 'bg-graphite text-muted'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-warm-white font-semibold text-xs sm:text-sm truncate">{apt.customer_name}</p>
                  <p className="text-xs text-muted truncate">{apt.vehicle_summary}</p>
                </div>
              ))}
            </div>
          </section>

        </div>

      </div>

      {/* ============================================================ */}
      {/* 5. SECONDARY SECTION: RECENT ENQUIRIES & SERVICE FOLLOW-UPS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        {/* Recent Enquiries */}
        <section className="p-4 sm:p-5 rounded-xs bg-graphite/40 border border-graphite-border space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-graphite-border/60">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-accent-gold" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-warm-white">
                Recent Enquiries
              </h2>
            </div>
            <button
              onClick={() => onNavigateModule('leads')}
              className="text-[10px] text-accent-gold uppercase font-mono hover:underline inline-flex items-center gap-1"
            >
              <span>All Leads</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {leads.slice(0, 3).map((lead) => (
              <div
                key={lead.id}
                onClick={() => onNavigateModule('leads')}
                className="p-3.5 rounded-xs bg-obsidian border border-graphite-border hover:border-accent-gold/60 transition-colors cursor-pointer space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                    {lead.source}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded-xs uppercase font-bold ${
                      lead.priority === 'HIGH' || lead.priority === 'URGENT'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-graphite text-muted'
                    }`}
                  >
                    {lead.priority}
                  </span>
                </div>
                <p className="text-warm-white font-semibold text-xs sm:text-sm truncate">{lead.customer_name}</p>
                <p className="text-xs text-muted line-clamp-2">
                  <strong className="text-warm-white/90">{lead.service_requested}:</strong> {lead.message}
                </p>
                <div className="pt-1.5 flex items-center justify-between text-[10px] font-mono text-muted-dark border-t border-graphite-border/30">
                  <span className="truncate pr-2">{lead.vehicle_summary}</span>
                  <span className="text-accent-gold shrink-0">[ OPEN LEAD ]</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Service Follow-ups */}
        <section className="p-4 sm:p-5 rounded-xs bg-graphite/40 border border-graphite-border space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-graphite-border/60">
            <div className="flex items-center gap-2">
              <BellRing className="w-3.5 h-3.5 text-accent-gold" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-warm-white">
                Service Due Follow-ups
              </h2>
            </div>
            <button
              onClick={() => onNavigateModule('reminders')}
              className="text-[10px] text-accent-gold uppercase font-mono hover:underline inline-flex items-center gap-1"
            >
              <span>Queue</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {reminders.slice(0, 3).map((rem) => (
              <div
                key={rem.id}
                onClick={() => onNavigateModule('reminders')}
                className="p-3.5 rounded-xs bg-obsidian border border-graphite-border hover:border-accent-gold/60 transition-colors cursor-pointer space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-warm-white font-semibold text-xs sm:text-sm truncate">{rem.customer_name}</span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded-xs uppercase font-bold ${
                      rem.status === 'OVERDUE'
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                        : rem.status === 'DUE'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-graphite text-muted'
                    }`}
                  >
                    {rem.status}
                  </span>
                </div>
                <p className="text-xs text-muted truncate">
                  {rem.vehicle_summary} ({rem.registration})
                </p>
                <div className="flex items-center justify-between pt-1.5 border-t border-graphite-border/30">
                  <span className="text-xs text-accent-gold font-mono">
                    Due: {rem.due_date}
                  </span>
                  <span className="text-[10px] font-mono text-warm-white hover:text-accent-gold uppercase">
                    [ CONTACT CUSTOMER ]
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
