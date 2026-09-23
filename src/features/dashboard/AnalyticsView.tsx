import React, { useState, useMemo } from 'react';
import type {
  JobCard,
  LeadRecord,
  AppointmentRecord,
  CustomerRecord,
  VehicleRecord,
  EstimateRecord,
  TechnicianRecord,
  ServiceReminder,
} from '../../types';
import {
  getDateRange,
  getComparisonDateRange,
  isDateInRange,
  formatDateRangeDisplay,
  DATE_RANGE_OPTIONS,
  type DateRangePreset,
} from '../../lib/dateRangeUtils';
import {
  TrendingUp,
  Calendar,
  Layers,
  AlertOctagon,
  Clock,
  PieChart,
  BarChart2,
  ChevronRight,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

export interface AnalyticsViewProps {
  jobs: JobCard[];
  leads: LeadRecord[];
  appointments: AppointmentRecord[];
  customers: CustomerRecord[];
  vehicles: VehicleRecord[];
  estimates: Record<string, EstimateRecord>;
  technicians: TechnicianRecord[];
  reminders: ServiceReminder[];
  onOpenJob?: (jobId: string) => void;
  onNavigateModule?: (module: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  jobs,
  leads,
  appointments,
  customers: _customers,
  vehicles: _vehicles,
  estimates,
  technicians: _technicians,
  reminders: _reminders,
  onOpenJob,
  onNavigateModule,
}) => {
  const [datePreset, setDatePreset] = useState<DateRangePreset>('current_month');
  const [customStart] = useState<string>('2026-09-01');
  const [customEnd] = useState<string>('2026-09-30');
  const [enableComparison, setEnableComparison] = useState<boolean>(true);

  // Compute active & comparison date ranges
  const currentRange = useMemo(() => {
    return getDateRange(datePreset, customStart, customEnd);
  }, [datePreset, customStart, customEnd]);

  const comparisonRange = useMemo(() => {
    return getComparisonDateRange(currentRange);
  }, [currentRange]);

  const allEstimates = useMemo(() => Object.values(estimates), [estimates]);

  // ----------------------------------------------------
  // FILTERED POPULATIONS
  // ----------------------------------------------------
  const currentJobs = useMemo(() => {
    return jobs.filter((j) => isDateInRange(j.opened_at, currentRange));
  }, [jobs, currentRange]);

  const prevJobs = useMemo(() => {
    return jobs.filter((j) => isDateInRange(j.opened_at, comparisonRange));
  }, [jobs, comparisonRange]);

  const currentLeads = useMemo(() => {
    return leads.filter((l) => isDateInRange(l.created_at, currentRange));
  }, [leads, currentRange]);

  const currentAppointments = useMemo(() => {
    return appointments.filter((a) =>
      isDateInRange(a.requested_date || a.created_at, currentRange)
    );
  }, [appointments, currentRange]);

  const currentEstimates = useMemo(() => {
    return allEstimates.filter((e) =>
      isDateInRange(e.created_date || e.created_at, currentRange)
    );
  }, [allEstimates, currentRange]);

  // ----------------------------------------------------
  // SECTION 1: EXECUTIVE PERFORMANCE RATIOS
  // ----------------------------------------------------
  // Job Throughput: Delivered in period
  const deliveredInPeriod = useMemo(() => {
    return jobs.filter((j) => {
      if (j.status !== 'DELIVERED') return false;
      const d = j.delivered_at || j.opened_at;
      return isDateInRange(d, currentRange);
    });
  }, [jobs, currentRange]);

  // Completion Rate: Delivered / (Active + Delivered)
  const activeJobs = jobs.filter((j) => j.status !== 'DELIVERED' && j.status !== 'CANCELLED');
  const totalThroughputPopulation = activeJobs.length + deliveredInPeriod.length;
  const completionRate =
    totalThroughputPopulation > 0
      ? Math.round((deliveredInPeriod.length / totalThroughputPopulation) * 100)
      : 0;

  // Estimate Approval Rate: Approved or Partially Approved / Decisionable Estimates
  const decisionableEstimates = currentEstimates.filter(
    (e) => e.status !== 'DRAFT' && e.status !== 'CANCELLED' && e.status !== 'EXPIRED'
  );
  const approvedOrPartial = decisionableEstimates.filter(
    (e) =>
      e.status === 'APPROVED' ||
      e.status === 'PARTIALLY_APPROVED' ||
      e.status === 'CONVERTED_TO_WORK'
  );
  const estimateApprovalRate =
    decisionableEstimates.length > 0
      ? `${Math.round((approvedOrPartial.length / decisionableEstimates.length) * 100)}%`
      : 'N/A';

  // Appointment Arrival Rate: Arrived+CheckedIn+Converted / Total scheduled appointments
  const arrivedAppointments = currentAppointments.filter(
    (a) => a.status === 'ARRIVED' || a.status === 'CHECKED_IN' || a.status === 'CONVERTED'
  );
  const appointmentArrivalRate =
    currentAppointments.length > 0
      ? `${Math.round((arrivedAppointments.length / currentAppointments.length) * 100)}%`
      : 'N/A';

  // Lead Conversion Rate: Converted / Total Leads
  const convertedLeads = currentLeads.filter(
    (l) => l.status === 'CONVERTED' || l.appointment_id || l.job_card_id
  );
  const leadConversionRate =
    currentLeads.length > 0
      ? `${Math.round((convertedLeads.length / currentLeads.length) * 100)}%`
      : 'N/A';

  const readyForCollectionCount = jobs.filter((j) => j.status === 'READY_FOR_COLLECTION').length;
  const overdueCount = jobs.filter((j) => {
    if (j.status === 'DELIVERED' || j.status === 'CANCELLED') return false;
    return j.promised_completion && new Date(j.promised_completion).getTime() < currentRange.endDate.getTime();
  }).length;

  // ----------------------------------------------------
  // SECTION 2: CUSTOMER INTAKE FUNNEL (8 STAGES)
  // ----------------------------------------------------
  const funnel = useMemo(() => {
    const stage1_lead = currentLeads.length;
    const stage2_qualified = currentLeads.filter(
      (l) =>
        l.status === 'QUALIFIED' ||
        l.status === 'APPOINTMENT_REQUESTED' ||
        l.status === 'APPOINTMENT_CONFIRMED' ||
        l.status === 'CONVERTED'
    ).length;
    const stage3_apptReq = currentLeads.filter(
      (l) =>
        l.status === 'APPOINTMENT_REQUESTED' ||
        l.status === 'APPOINTMENT_CONFIRMED' ||
        l.status === 'CONVERTED' ||
        l.appointment_id
    ).length;
    const stage4_apptConf = currentAppointments.filter(
      (a) =>
        a.status === 'CONFIRMED' ||
        a.status === 'ARRIVED' ||
        a.status === 'CHECKED_IN' ||
        a.status === 'CONVERTED'
    ).length;
    const stage5_arrived = currentAppointments.filter(
      (a) => a.status === 'ARRIVED' || a.status === 'CHECKED_IN' || a.status === 'CONVERTED'
    ).length;
    const stage6_checkedIn = currentAppointments.filter(
      (a) => a.status === 'CHECKED_IN' || a.status === 'CONVERTED'
    ).length;
    const stage7_jobCard = currentAppointments.filter(
      (a) => a.status === 'CONVERTED' || a.job_card_id
    ).length;
    const stage8_delivered = deliveredInPeriod.length;

    return [
      { id: 'lead', label: '1. LEAD INTAKE', count: stage1_lead, pct: '100%' },
      {
        id: 'qualified',
        label: '2. QUALIFIED',
        count: stage2_qualified,
        pct: stage1_lead > 0 ? `${Math.round((stage2_qualified / stage1_lead) * 100)}%` : 'N/A',
      },
      {
        id: 'appt_req',
        label: '3. APPT REQUESTED',
        count: stage3_apptReq,
        pct: stage2_qualified > 0 ? `${Math.round((stage3_apptReq / stage2_qualified) * 100)}%` : 'N/A',
      },
      {
        id: 'appt_conf',
        label: '4. APPT CONFIRMED',
        count: stage4_apptConf,
        pct: stage3_apptReq > 0 ? `${Math.round((stage4_apptConf / stage3_apptReq) * 100)}%` : 'N/A',
      },
      {
        id: 'arrived',
        label: '5. CUSTOMER ARRIVED',
        count: stage5_arrived,
        pct: stage4_apptConf > 0 ? `${Math.round((stage5_arrived / stage4_apptConf) * 100)}%` : 'N/A',
      },
      {
        id: 'checked_in',
        label: '6. CHECKED IN',
        count: stage6_checkedIn,
        pct: stage5_arrived > 0 ? `${Math.round((stage6_checkedIn / stage5_arrived) * 100)}%` : 'N/A',
      },
      {
        id: 'job_card',
        label: '7. JOB CARD ISSUED',
        count: stage7_jobCard,
        pct: stage6_checkedIn > 0 ? `${Math.round((stage7_jobCard / stage6_checkedIn) * 100)}%` : 'N/A',
      },
      {
        id: 'delivered',
        label: '8. HANDOVER DELIVERED',
        count: stage8_delivered,
        pct: stage7_jobCard > 0 ? `${Math.round((stage8_delivered / stage7_jobCard) * 100)}%` : 'N/A',
      },
    ];
  }, [currentLeads, currentAppointments, deliveredInPeriod]);

  // ----------------------------------------------------
  // SECTION 3: ESTIMATE DECISION FUNNEL
  // ----------------------------------------------------
  const estFunnel = useMemo(() => {
    const draftCount = currentEstimates.filter((e) => e.status === 'DRAFT').length;
    const sentCount = currentEstimates.filter(
      (e) => e.status === 'SENT' || e.status === 'VIEWED'
    ).length;
    const viewedCount = currentEstimates.filter((e) => e.status === 'VIEWED').length;
    const approvedCount = currentEstimates.filter(
      (e) => e.status === 'APPROVED' || e.status === 'CONVERTED_TO_WORK'
    ).length;
    const partialCount = currentEstimates.filter((e) => e.status === 'PARTIALLY_APPROVED').length;
    const workAuthCount = currentEstimates.filter(
      (e) => e.status === 'CONVERTED_TO_WORK' || e.authorized_at
    ).length;

    const proposedSum = currentEstimates.reduce((s, e) => s + (e.total || 0), 0);
    const approvedSum = currentEstimates.reduce((s, e) => {
      if (e.approved_total && e.approved_total > 0) return s + e.approved_total;
      if (e.status === 'APPROVED' || e.status === 'CONVERTED_TO_WORK') return s + (e.total || 0);
      const items = e.items?.filter((i) => i.approval_status === 'APPROVED') || [];
      return s + items.reduce((sum, item) => sum + (item.line_total || 0), 0);
    }, 0);
    const declinedSum = currentEstimates.reduce((s, e) => {
      if (e.declined_total && e.declined_total > 0) return s + e.declined_total;
      if (e.status === 'DECLINED') return s + (e.total || 0);
      const items = e.items?.filter((i) => i.approval_status === 'DECLINED') || [];
      return s + items.reduce((sum, item) => sum + (item.line_total || 0), 0);
    }, 0);

    return {
      draftCount,
      sentCount,
      viewedCount,
      approvedCount,
      partialCount,
      workAuthCount,
      proposedSum,
      approvedSum,
      declinedSum,
    };
  }, [currentEstimates]);

  // ----------------------------------------------------
  // SECTION 5: SERVICE MIX (DERIVED STRICTLY FROM JOBS & ESTIMATES)
  // ----------------------------------------------------
  const serviceMix = useMemo(() => {
    const map: Record<string, number> = {};
    jobs.forEach((j) => {
      const name = j.service_name || 'General Service';
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [jobs]);

  // ----------------------------------------------------
  // SECTION 7: ACTION QUEUES & DERIVED BOTTLENECKS
  // ----------------------------------------------------
  const actionQueues = useMemo(() => {
    const queueList = [
      {
        id: 'tech_alloc',
        name: 'Awaiting Technician Allocation',
        records: jobs.filter(
          (j) =>
            j.status !== 'DELIVERED' &&
            j.status !== 'CANCELLED' &&
            (!j.technician || j.technician.toLowerCase().includes('unassigned'))
        ),
        targetModule: 'floor',
      },
      {
        id: 'bay_alloc',
        name: 'Awaiting Bay Allocation',
        records: jobs.filter(
          (j) =>
            j.status !== 'DELIVERED' &&
            j.status !== 'CANCELLED' &&
            (!j.bay || j.bay.toUpperCase() === 'UNASSIGNED')
        ),
        targetModule: 'floor',
      },
      {
        id: 'cust_appr',
        name: 'Awaiting Customer Scope Approval',
        records: jobs.filter(
          (j) => j.status === 'ESTIMATE_SENT' || j.approval_status === 'PENDING'
        ),
        targetModule: 'estimates',
      },
      {
        id: 'qc_queue',
        name: 'Quality Check & Road Test Queue',
        records: jobs.filter((j) => j.status === 'QUALITY_CHECK'),
        targetModule: 'jobs',
      },
      {
        id: 'handover_queue',
        name: 'Customer Vehicle Handover & Collection',
        records: jobs.filter((j) => j.status === 'READY_FOR_COLLECTION'),
        targetModule: 'jobs',
      },
    ];

    return queueList.map((q) => {
      // Find oldest record by opened_at
      const sorted = [...q.records].sort(
        (a, b) => new Date(a.opened_at).getTime() - new Date(b.opened_at).getTime()
      );
      const oldest = sorted[0];
      return {
        ...q,
        count: q.records.length,
        oldestRecordId: oldest?.id || '—',
        oldestRegistration: oldest?.registration || '—',
        oldestVehicle: oldest?.vehicle_summary || '—',
      };
    });
  }, [jobs]);

  // ----------------------------------------------------
  // SECTION 8: DETERMINISTIC KEY OBSERVATIONS (ZERO VAGUE AI)
  // ----------------------------------------------------
  const observations = useMemo(() => {
    const notes: { id: string; type: 'gold' | 'sky' | 'emerald' | 'rose'; text: string; actionId?: string }[] = [];

    const approvalPending = jobs.filter((j) => j.status === 'ESTIMATE_SENT');
    if (approvalPending.length > 0) {
      notes.push({
        id: 'obs-approval',
        type: 'gold',
        text: `${approvalPending.length} active job (${approvalPending.map((j) => j.id).join(', ')}) is currently awaiting customer estimate decision.`,
        actionId: approvalPending[0]?.id,
      });
    }

    const unassignedTechs = jobs.filter(
      (j) =>
        j.status !== 'DELIVERED' &&
        j.status !== 'CANCELLED' &&
        (!j.technician || j.technician.toLowerCase().includes('unassigned'))
    );
    if (unassignedTechs.length > 0) {
      notes.push({
        id: 'obs-tech',
        type: 'rose',
        text: `${unassignedTechs.length} active job (${unassignedTechs.map((j) => j.id).join(', ')}) requires technician allocation.`,
        actionId: unassignedTechs[0]?.id,
      });
    }

    const readyHandover = jobs.filter((j) => j.status === 'READY_FOR_COLLECTION');
    if (readyHandover.length > 0) {
      notes.push({
        id: 'obs-handover',
        type: 'emerald',
        text: `${readyHandover.length} vehicle (${readyHandover.map((j) => j.registration).join(', ')}) passed QC and is ready for customer collection.`,
      });
    }

    const overdueList = jobs.filter(
      (j) =>
        j.status !== 'DELIVERED' &&
        j.status !== 'CANCELLED' &&
        j.promised_completion &&
        new Date(j.promised_completion).getTime() < currentRange.endDate.getTime()
    );
    if (overdueList.length > 0) {
      notes.push({
        id: 'obs-overdue',
        type: 'rose',
        text: `${overdueList.length} service card (${overdueList.map((j) => j.id).join(', ')}) has exceeded promised completion time.`,
      });
    }

    if (notes.length === 0) {
      notes.push({
        id: 'obs-nominal',
        type: 'sky',
        text: 'All active workshop jobs are allocated with no critical queue staleness.',
      });
    }

    return notes;
  }, [jobs, currentRange]);

  return (
    <div id="workshop-analytics-page" className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* 1. Header with Eyebrow, Title, Period Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-graphite-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block">
              OPERATIONAL INTELLIGENCE
            </span>
            <span className="text-muted-dark text-xs font-mono">· V4.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-warm-white">
            WORKSHOP ANALYTICS
          </h1>
          <p className="text-xs text-muted font-light mt-0.5 max-w-2xl">
            Understand workshop throughput, conversion, approval behaviour, capacity and customer patterns.
          </p>
        </div>

        {/* Date and Comparison Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-graphite/60 p-1.5 rounded-xs border border-graphite-border">
            <Calendar className="w-3.5 h-3.5 text-accent-gold ml-1.5" />
            <select
              id="analytics-date-filter"
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as DateRangePreset)}
              className="bg-obsidian border border-graphite-border rounded-xs px-2.5 py-1 text-xs text-warm-white font-mono focus:outline-none focus:border-accent-gold min-h-[36px]"
              aria-label="Analytics Date Range"
            >
              {DATE_RANGE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setEnableComparison(!enableComparison)}
            className={`px-3 py-1.5 rounded-xs text-xs font-mono border transition-colors min-h-[36px] flex items-center gap-1.5 ${
              enableComparison
                ? 'bg-accent-gold/10 border-accent-gold/40 text-accent-gold font-bold'
                : 'bg-graphite/40 border-graphite-border text-muted'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>COMPARE PREV PERIOD</span>
          </button>
        </div>
      </div>

      {/* Comparison Context Bar */}
      <div className="px-3.5 py-2 rounded-xs bg-graphite/20 border border-graphite-border/60 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-muted-dark uppercase tracking-wider text-[10px]">ANALYSIS WINDOW:</span>
          <span className="text-accent-gold font-bold">{currentRange.label}</span>
          <span className="text-muted text-[11px]">({formatDateRangeDisplay(currentRange)})</span>
        </div>
        {enableComparison && (
          <div className="flex items-center gap-2">
            <span className="text-muted-dark uppercase tracking-wider text-[10px]">COMPARED TO:</span>
            <span className="text-sky-400 font-bold">{comparisonRange.label}</span>
            <span className="text-muted text-[11px]">
              ({formatDateRangeDisplay(comparisonRange)} · {prevJobs.length} jobs opened)
            </span>
          </div>
        )}
      </div>

      {/* 2. SECTION 1: WORKSHOP EXECUTIVE PERFORMANCE RATIOS */}
      <div className="p-5 rounded-xs bg-graphite/30 border border-graphite-border space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-graphite-border/60">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block">
              RATIOS & CONVERSION METRICS
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-warm-white">
              WORKSHOP PERFORMANCE
            </h2>
          </div>
          <span className="text-xs font-mono text-muted">
            Mathematical Derivations
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3" id="analytics-ratios-grid">
          
          <div className="p-3 rounded-xs bg-obsidian/40 border border-graphite-border/60 space-y-1">
            <span className="text-[9px] font-mono uppercase text-muted-dark tracking-wider block">Throughput</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-warm-white">{deliveredInPeriod.length}</span>
            <p className="text-[9px] text-muted leading-tight">Delivered in period</p>
          </div>

          <div className="p-3 rounded-xs bg-obsidian/40 border border-graphite-border/60 space-y-1">
            <span className="text-[9px] font-mono uppercase text-muted-dark tracking-wider block">Completion Rate</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">{completionRate}%</span>
            <p className="text-[9px] text-muted leading-tight">Of total active workload</p>
          </div>

          <div className="p-3 rounded-xs bg-obsidian/40 border border-graphite-border/60 space-y-1">
            <span className="text-[9px] font-mono uppercase text-muted-dark tracking-wider block">Approval Rate</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-accent-gold">{estimateApprovalRate}</span>
            <p className="text-[9px] text-muted leading-tight">Of decisionable estimates</p>
          </div>

          <div className="p-3 rounded-xs bg-obsidian/40 border border-graphite-border/60 space-y-1">
            <span className="text-[9px] font-mono uppercase text-muted-dark tracking-wider block">Arrival Rate</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-sky-400">{appointmentArrivalRate}</span>
            <p className="text-[9px] text-muted leading-tight">Appointments on site</p>
          </div>

          <div className="p-3 rounded-xs bg-obsidian/40 border border-graphite-border/60 space-y-1">
            <span className="text-[9px] font-mono uppercase text-muted-dark tracking-wider block">Lead Conversion</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-warm-white">{leadConversionRate}</span>
            <p className="text-[9px] text-muted leading-tight">Enquiries to booking</p>
          </div>

          <div className="p-3 rounded-xs bg-obsidian/40 border border-graphite-border/60 space-y-1">
            <span className="text-[9px] font-mono uppercase text-muted-dark tracking-wider block">Ready Collection</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-300">{readyForCollectionCount}</span>
            <p className="text-[9px] text-muted leading-tight">Staged for customer</p>
          </div>

          <div className="p-3 rounded-xs bg-obsidian/40 border border-graphite-border/60 space-y-1">
            <span className="text-[9px] font-mono uppercase text-muted-dark tracking-wider block">Overdue Jobs</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-rose-400">{overdueCount}</span>
            <p className="text-[9px] text-muted leading-tight">Elapsed delivery SLA</p>
          </div>

          <div className="p-3 rounded-xs bg-obsidian/40 border border-graphite-border/60 space-y-1">
            <span className="text-[9px] font-mono uppercase text-muted-dark tracking-wider block">Cycle Time</span>
            <span className="text-sm font-black font-mono text-muted-dark pt-1 block">INSUFFICIENT DATA</span>
            <p className="text-[9px] text-muted-dark leading-tight">Requires duration log</p>
          </div>

        </div>
      </div>

      {/* 3. SECTION 2: CUSTOMER INTAKE MULTI-STAGE FUNNEL */}
      <div className="p-5 rounded-xs bg-graphite/30 border border-graphite-border space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-graphite-border/60">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block">
              LIFECYCLE TRANSITION FLOW
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-warm-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent-gold" />
              CUSTOMER INTAKE & CONVERSION FUNNEL
            </h2>
          </div>
          <span className="text-xs font-mono text-muted">
            8 Sequential Workshop Milestones
          </span>
        </div>

        {/* Visual Multi-Step Funnel Progression */}
        <div id="intake-funnel-grid" className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {funnel.map((stage) => (
            <div
              key={stage.id}
              data-testid={`funnel-stage-${stage.id}`}
              className="p-3 rounded-xs bg-obsidian/60 border border-graphite-border flex flex-col justify-between relative group hover:border-accent-gold/40 transition-colors"
            >
              <div>
                <span className="text-[9px] font-mono text-muted-dark uppercase tracking-wider block">
                  {stage.label}
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-warm-white my-1 block">
                  {stage.count}
                </span>
              </div>
              <div className="pt-2 border-t border-graphite-border/40 flex items-center justify-between text-[10px] font-mono">
                <span className="text-muted">Step:</span>
                <span className="font-bold text-accent-gold">{stage.pct}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SECTION 3: ESTIMATE DECISION FUNNEL */}
      <div className="p-5 rounded-xs bg-graphite/30 border border-graphite-border space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-graphite-border/60">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block">
              COMMERCIAL CONVERSION
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-warm-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-gold" />
              ESTIMATE DECISION FUNNEL
            </h2>
          </div>
          <span className="text-xs font-mono text-muted">
            Customer Approval vs Workshop Authorization
          </span>
        </div>

        {/* Funnel Stages */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xs bg-obsidian/40 border border-graphite-border/60 space-y-1">
            <span className="text-[9px] font-mono uppercase text-muted-dark block">DRAFT</span>
            <span className="text-xl font-bold font-mono text-warm-white">{estFunnel.draftCount}</span>
            <p className="text-[9px] text-muted">Awaiting technician / pricing</p>
          </div>

          <div className="p-3 rounded-xs bg-obsidian/40 border border-graphite-border/60 space-y-1">
            <span className="text-[9px] font-mono uppercase text-muted-dark block">SENT</span>
            <span className="text-xl font-bold font-mono text-sky-400">{estFunnel.sentCount}</span>
            <p className="text-[9px] text-muted">Transmitted to customer</p>
          </div>

          <div className="p-3 rounded-xs bg-obsidian/40 border border-graphite-border/60 space-y-1">
            <span className="text-[9px] font-mono uppercase text-muted-dark block">VIEWED</span>
            <span className="text-xl font-bold font-mono text-warm-white">{estFunnel.viewedCount}</span>
            <p className="text-[9px] text-muted">Opened in Quote Viewer</p>
          </div>

          <div className="p-3 rounded-xs bg-obsidian/40 border border-graphite-border/60 space-y-1">
            <span className="text-[9px] font-mono uppercase text-muted-dark block">APPROVED</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{estFunnel.approvedCount}</span>
            <p className="text-[9px] text-muted">Full scope accepted</p>
          </div>

          <div className="p-3 rounded-xs bg-obsidian/40 border border-graphite-border/60 space-y-1">
            <span className="text-[9px] font-mono uppercase text-muted-dark block">PARTIALLY APPROVED</span>
            <span className="text-xl font-bold font-mono text-accent-gold">{estFunnel.partialCount}</span>
            <p className="text-[9px] text-muted">Selective item acceptance</p>
          </div>

          <div className="p-3 rounded-xs bg-obsidian/40 border border-graphite-border/60 space-y-1">
            <span className="text-[9px] font-mono uppercase text-muted-dark block">WORK AUTHORIZED</span>
            <span className="text-xl font-bold font-mono text-emerald-300">{estFunnel.workAuthCount}</span>
            <p className="text-[9px] text-muted">Transferred to execution</p>
          </div>
        </div>

        {/* Scope Values (Explicitly Non-Revenue) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xs bg-obsidian/60 border border-graphite-border/60 space-y-1 font-mono">
            <span className="text-[10px] text-muted uppercase block">PROPOSED SCOPE</span>
            <span className="text-lg font-bold text-warm-white">
              ₹{estFunnel.proposedSum.toLocaleString('en-IN')}
            </span>
            <p className="text-[9px] text-muted-dark">Total value drafted & sent</p>
          </div>
          <div className="p-3 rounded-xs bg-obsidian/60 border border-graphite-border/60 space-y-1 font-mono">
            <span className="text-[10px] text-muted uppercase block">APPROVED SCOPE</span>
            <span className="text-lg font-bold text-emerald-400">
              ₹{estFunnel.approvedSum.toLocaleString('en-IN')}
            </span>
            <p className="text-[9px] text-muted-dark">Owner-authorized work order value</p>
          </div>
          <div className="p-3 rounded-xs bg-obsidian/60 border border-graphite-border/60 space-y-1 font-mono">
            <span className="text-[10px] text-muted uppercase block">DECLINED SCOPE</span>
            <span className="text-lg font-bold text-rose-400">
              ₹{estFunnel.declinedSum.toLocaleString('en-IN')}
            </span>
            <p className="text-[9px] text-muted-dark">Deferred or rejected line items</p>
          </div>
        </div>
      </div>

      {/* 5. SECTION 4 & 5: WORKSHOP THROUGHPUT & SERVICE MIX (2-COL) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Throughput Trend (No fake chart - genuine state representation) */}
        <div className="p-5 rounded-xs bg-graphite/30 border border-graphite-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-graphite-border/60">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block">
                EXECUTION CADENCE
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-warm-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-accent-gold" />
                WORKSHOP THROUGHPUT
              </h2>
            </div>
            <span className="text-xs font-mono text-muted">
              Period Volume
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-graphite-border/40">
              <span className="text-muted">Jobs Opened in Period</span>
              <span className="font-bold text-warm-white">{currentJobs.length}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-graphite-border/40">
              <span className="text-muted">Jobs Concluded & Delivered</span>
              <span className="font-bold text-emerald-400">{deliveredInPeriod.length}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-graphite-border/40">
              <span className="text-muted">Current Active Workshop Floor</span>
              <span className="font-bold text-accent-gold">{activeJobs.length}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-graphite-border/40">
              <span className="text-muted">Staged for Collection</span>
              <span className="font-bold text-sky-400">{readyForCollectionCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Overdue SLA Expirations</span>
              <span className="font-bold text-rose-400">{overdueCount}</span>
            </div>
          </div>

          <div className="p-3 rounded-xs bg-obsidian/80 border border-graphite-border/60 flex items-center gap-3">
            <Clock className="w-4 h-4 text-muted-dark shrink-0" />
            <div className="text-[10px] font-mono text-muted">
              <span className="text-warm-white font-bold block uppercase">
                HISTORICAL TRENDS: INSUFFICIENT HISTORICAL DATA
              </span>
              Detailed daily multi-point trend visualizers require continuous 30-day telemetry points.
            </div>
          </div>
        </div>

        {/* Service Mix */}
        <div className="p-5 rounded-xs bg-graphite/30 border border-graphite-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-graphite-border/60">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block">
                SPECIALIZATION BREAKDOWN
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-warm-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-accent-gold" />
                SERVICE MIX
              </h2>
            </div>
            <span className="text-xs font-mono text-muted">
              Canonical Job Categories
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {serviceMix.map(([serviceName, count]) => {
              const pct = Math.round((count / Math.max(1, jobs.length)) * 100);
              return (
                <div key={serviceName} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-warm-white font-semibold truncate max-w-[240px]">
                      {serviceName}
                    </span>
                    <span className="text-muted">
                      {count} Jobs ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-obsidian h-1.5 rounded-full overflow-hidden border border-graphite-border/40">
                    <div
                      className="bg-accent-gold h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 6. SECTION 7: OPERATIONAL ACTION QUEUES (BOTTLENECK SIGNALS) */}
      <div className="p-5 rounded-xs bg-graphite/30 border border-graphite-border space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-graphite-border/60">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block">
              WORKSHOP DELAYS & DISPATCH
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-warm-white flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-accent-gold" />
              OPERATIONAL ACTION QUEUES
            </h2>
          </div>
          <span className="text-xs font-mono text-muted">
            Live Records Requiring Action
          </span>
        </div>

        <div className="border border-graphite-border rounded-xs overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-obsidian text-[10px] uppercase text-muted border-b border-graphite-border">
              <tr>
                <th className="py-2.5 px-3">Queue Name</th>
                <th className="py-2.5 px-3 text-center">Active Count</th>
                <th className="py-2.5 px-3">Oldest Waiting Record</th>
                <th className="py-2.5 px-3">Vehicle Details</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-border/40 text-warm-white">
              {actionQueues.map((q) => (
                <tr key={q.id} className="hover:bg-graphite/40">
                  <td className="py-2.5 px-3 font-semibold text-warm-white">
                    {q.name}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-xs font-bold ${
                        q.count > 0
                          ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/40'
                          : 'bg-graphite text-muted'
                      }`}
                    >
                      {q.count}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-accent-gold">
                    {q.oldestRecordId}
                  </td>
                  <td className="py-2.5 px-3 text-muted text-[11px] truncate max-w-[200px]">
                    {q.oldestVehicle !== '—' ? `${q.oldestRegistration} (${q.oldestVehicle})` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {q.count > 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (q.oldestRecordId !== '—' && onOpenJob) {
                            onOpenJob(q.oldestRecordId);
                          } else if (onNavigateModule) {
                            onNavigateModule(q.targetModule);
                          }
                        }}
                        className="text-[10px] font-bold text-accent-gold hover:underline flex items-center justify-end gap-1 ml-auto min-h-[36px]"
                      >
                        RESOLVE <ChevronRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-muted-dark">CLEAR</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. SECTION 8: DETERMINISTIC MANAGEMENT OBSERVATIONS */}
      <div className="p-5 rounded-xs bg-graphite/30 border border-graphite-border space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-graphite-border/60">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block">
              DETERMINISTIC RULES ENGINE
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-warm-white flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-accent-gold" />
              KEY OBSERVATIONS & MANAGEMENT SIGNALS
            </h2>
          </div>
          <span className="text-xs font-mono text-muted">
            Zero Hallucinated / Fabricated Advice
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="analytics-observations-list">
          {observations.map((obs) => (
            <div
              key={obs.id}
              className={`p-3.5 rounded-xs border font-mono text-xs flex items-start gap-3 ${
                obs.type === 'gold'
                  ? 'bg-accent-gold/5 border-accent-gold/30 text-warm-white'
                  : obs.type === 'rose'
                  ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                  : obs.type === 'emerald'
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                  : 'bg-graphite/40 border-graphite-border text-muted'
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-accent-gold mt-0.5" />
              <div className="space-y-1">
                <span className="block font-medium leading-relaxed">{obs.text}</span>
                {obs.actionId && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenJob) onOpenJob(obs.actionId!);
                    }}
                    className="text-[10px] font-bold text-accent-gold hover:underline inline-flex items-center gap-1 mt-1 min-h-[30px]"
                  >
                    OPEN RECORD {obs.actionId} →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
