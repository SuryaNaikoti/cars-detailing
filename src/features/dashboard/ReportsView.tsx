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
  isDateInRange,
  formatDateRangeDisplay,
  DATE_RANGE_OPTIONS,
  type DateRangePreset,
} from '../../lib/dateRangeUtils';
import {
  Calendar,
  Download,
  HelpCircle,
  X,
  FileCheck2,
  Clock,
  Car,
  Users,
  Wrench,
} from 'lucide-react';

export interface ReportsViewProps {
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

export const ReportsView: React.FC<ReportsViewProps> = ({
  jobs,
  leads,
  appointments,
  customers,
  vehicles,
  estimates,
  technicians,
  reminders,
  onOpenJob,
  onNavigateModule,
}) => {
  const [datePreset, setDatePreset] = useState<DateRangePreset>('current_month');
  const [customStart, setCustomStart] = useState<string>('2026-09-01');
  const [customEnd, setCustomEnd] = useState<string>('2026-09-30');
  const [showDefinitionsModal, setShowDefinitionsModal] = useState<boolean>(false);

  // Compute active date range
  const currentRange = useMemo(() => {
    return getDateRange(datePreset, customStart, customEnd);
  }, [datePreset, customStart, customEnd]);

  // Convert estimates object to array
  const allEstimates = useMemo(() => Object.values(estimates), [estimates]);

  // ----------------------------------------------------
  // FILTERED POPULATIONS (STRICT DATE ALIGNMENT)
  // ----------------------------------------------------

  // 1. Jobs Opened during period
  const jobsOpenedInPeriod = useMemo(() => {
    return jobs.filter((j) => isDateInRange(j.opened_at, currentRange));
  }, [jobs, currentRange]);

  // 2. Jobs Delivered during period (DELIVERED with timestamp or status)
  const jobsDeliveredInPeriod = useMemo(() => {
    return jobs.filter((j) => {
      if (j.status !== 'DELIVERED') return false;
      const deliverDate = j.delivered_at || j.opened_at;
      return isDateInRange(deliverDate, currentRange);
    });
  }, [jobs, currentRange]);

  // 3. Jobs Completed (Delivered + Ready for Collection)
  const jobsCompletedInPeriod = useMemo(() => {
    return jobs.filter((j) => {
      if (j.status === 'DELIVERED') {
        const deliverDate = j.delivered_at || j.opened_at;
        return isDateInRange(deliverDate, currentRange);
      }
      if (j.status === 'READY_FOR_COLLECTION') {
        return isDateInRange(j.opened_at, currentRange);
      }
      return false;
    });
  }, [jobs, currentRange]);

  // 4. Ready for Collection (Current operational snapshot)
  const readyForCollection = useMemo(() => {
    return jobs.filter((j) => j.status === 'READY_FOR_COLLECTION');
  }, [jobs]);

  // 5. Overdue Jobs (promised_completion in past & status not DELIVERED)
  const overdueJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (j.status === 'DELIVERED' || j.status === 'CANCELLED') return false;
      if (!j.promised_completion) return false;
      return new Date(j.promised_completion).getTime() < currentRange.endDate.getTime();
    });
  }, [jobs, currentRange]);

  // 6. Estimates Created in Period
  const estimatesInPeriod = useMemo(() => {
    return allEstimates.filter((e) => isDateInRange(e.created_date || e.created_at, currentRange));
  }, [allEstimates, currentRange]);

  // 7. Approved Scope Value (Strictly from approved estimate items or approved estimates)
  const approvedScopeValue = useMemo(() => {
    return estimatesInPeriod.reduce((acc, est) => {
      if (est.approved_total && est.approved_total > 0) {
        return acc + est.approved_total;
      }
      if (est.status === 'APPROVED' || est.status === 'CONVERTED_TO_WORK') {
        return acc + (est.total || 0);
      }
      // If line items specify APPROVED
      const approvedItems = est.items?.filter((i) => i.approval_status === 'APPROVED') || [];
      const lineItemSum = approvedItems.reduce((sum, i) => sum + (i.line_total || 0), 0);
      return acc + lineItemSum;
    }, 0);
  }, [estimatesInPeriod]);

  // 8. New Customers Created in Period
  const newCustomersInPeriod = useMemo(() => {
    return customers.filter((c) => isDateInRange(c.created_at, currentRange));
  }, [customers, currentRange]);

  // ----------------------------------------------------
  // WORKSHOP OPERATIONS STATUS BREAKDOWN
  // ----------------------------------------------------
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      VEHICLE_RECEIVED: 0,
      INSPECTION_COMPLETED: 0,
      ESTIMATE_SENT: 0,
      ESTIMATE_APPROVED: 0,
      WORK_IN_PROGRESS: 0,
      QUALITY_CHECK: 0,
      READY_FOR_COLLECTION: 0,
      DELIVERED: 0,
    };
    jobs.forEach((j) => {
      if (counts[j.status] !== undefined) {
        counts[j.status]++;
      }
    });
    return counts;
  }, [jobs]);

  // Jobs by Bay
  const bayCounts = useMemo(() => {
    const bays: Record<string, number> = {
      'BAY 01': 0,
      'BAY 02': 0,
      'BAY 03': 0,
      'BAY 04': 0,
      UNASSIGNED: 0,
    };
    jobs.forEach((j) => {
      if (j.status !== 'DELIVERED' && j.status !== 'CANCELLED') {
        const b = (j.bay || 'UNASSIGNED').toUpperCase();
        if (bays[b] !== undefined) {
          bays[b]++;
        } else {
          bays.UNASSIGNED++;
        }
      }
    });
    return bays;
  }, [jobs]);

  // Operational Queues
  const awaitingTech = jobs.filter(
    (j) =>
      j.status !== 'DELIVERED' &&
      j.status !== 'CANCELLED' &&
      (!j.technician || j.technician.toLowerCase().includes('unassigned'))
  );
  const awaitingBay = jobs.filter(
    (j) =>
      j.status !== 'DELIVERED' &&
      j.status !== 'CANCELLED' &&
      (!j.bay || j.bay.toUpperCase() === 'UNASSIGNED')
  );
  const awaitingCustomerApproval = jobs.filter(
    (j) => j.status === 'ESTIMATE_SENT' || j.approval_status === 'PENDING'
  );
  const inProgressJobs = jobs.filter((j) => j.status === 'WORK_IN_PROGRESS');
  const qcJobs = jobs.filter((j) => j.status === 'QUALITY_CHECK');

  // ----------------------------------------------------
  // CUSTOMER INTAKE & CONVERSION METRICS
  // ----------------------------------------------------
  const leadsInPeriod = useMemo(() => {
    return leads.filter((l) => isDateInRange(l.created_at, currentRange));
  }, [leads, currentRange]);

  const appointmentsInPeriod = useMemo(() => {
    return appointments.filter((a) =>
      isDateInRange(a.requested_date || a.created_at, currentRange)
    );
  }, [appointments, currentRange]);

  const appointmentsConfirmed = appointmentsInPeriod.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'ARRIVED' || a.status === 'CHECKED_IN' || a.status === 'CONVERTED'
  ).length;

  const customersArrived = appointmentsInPeriod.filter(
    (a) => a.status === 'ARRIVED' || a.status === 'CHECKED_IN' || a.status === 'CONVERTED'
  ).length;

  const vehiclesCheckedIn = appointmentsInPeriod.filter(
    (a) => a.status === 'CHECKED_IN' || a.status === 'CONVERTED'
  ).length;

  const appointmentsConvertedToJob = appointmentsInPeriod.filter(
    (a) => a.status === 'CONVERTED' || a.job_card_id
  ).length;

  // Mathematically safe conversion rates
  const leadToApptRate =
    leadsInPeriod.length > 0
      ? `${Math.round((appointmentsInPeriod.length / leadsInPeriod.length) * 100)}%`
      : 'N/A';

  const apptToArrivalRate =
    appointmentsInPeriod.length > 0
      ? `${Math.round((customersArrived / appointmentsInPeriod.length) * 100)}%`
      : 'N/A';

  const arrivalToJobRate =
    customersArrived > 0
      ? `${Math.round((appointmentsConvertedToJob / customersArrived) * 100)}%`
      : 'N/A';

  // ----------------------------------------------------
  // ESTIMATE PERFORMANCE METRICS
  // ----------------------------------------------------
  const estCreatedCount = estimatesInPeriod.length;
  const estSentCount = estimatesInPeriod.filter(
    (e) => e.status === 'SENT' || e.status === 'VIEWED' || e.status === 'PARTIALLY_APPROVED' || e.status === 'APPROVED' || e.status === 'CONVERTED_TO_WORK'
  ).length;
  const estAwaitingDecisionCount = estimatesInPeriod.filter(
    (e) => e.status === 'SENT' || e.status === 'VIEWED'
  ).length;
  const estApprovedCount = estimatesInPeriod.filter(
    (e) => e.status === 'APPROVED' || e.status === 'CONVERTED_TO_WORK'
  ).length;
  const estPartiallyApprovedCount = estimatesInPeriod.filter(
    (e) => e.status === 'PARTIALLY_APPROVED'
  ).length;
  const estDeclinedCount = estimatesInPeriod.filter((e) => e.status === 'DECLINED').length;
  const estAuthorizedCount = estimatesInPeriod.filter(
    (e) => e.status === 'CONVERTED_TO_WORK' || e.authorized_at
  ).length;

  const proposedScopeTotal = estimatesInPeriod.reduce((sum, e) => sum + (e.total || 0), 0);
  const declinedScopeTotal = estimatesInPeriod.reduce((sum, e) => {
    if (e.declined_total && e.declined_total > 0) return sum + e.declined_total;
    if (e.status === 'DECLINED') return sum + (e.total || 0);
    const declinedItems = e.items?.filter((i) => i.approval_status === 'DECLINED') || [];
    return sum + declinedItems.reduce((s, i) => s + (i.line_total || 0), 0);
  }, 0);

  // ----------------------------------------------------
  // CUSTOMER ACTIVITY METRICS
  // ----------------------------------------------------
  const activeReminders = reminders.filter((r) => r.status !== 'COMPLETED');
  const dueReminders = reminders.filter((r) => r.status === 'DUE');
  const overdueReminders = reminders.filter((r) => r.status === 'OVERDUE');

  return (
    <div id="workshop-reports-page" className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* 1. Header with Eyebrow, Title, Date Picker, Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-graphite-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block">
              OPERATIONAL REPORTING
            </span>
            <span className="text-muted-dark text-xs font-mono">· V4.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-warm-white">
            WORKSHOP REPORTS
          </h1>
          <p className="text-xs text-muted font-light mt-0.5 max-w-2xl">
            Review workshop activity, customer intake, estimates, job throughput and team workload for a defined reporting period.
          </p>
        </div>

        {/* Global Date Filter Controls & Export */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-graphite/60 p-1.5 rounded-xs border border-graphite-border">
            <Calendar className="w-3.5 h-3.5 text-accent-gold ml-1.5" />
            <select
              id="reports-date-filter"
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as DateRangePreset)}
              className="bg-obsidian border border-graphite-border rounded-xs px-2.5 py-1 text-xs text-warm-white font-mono focus:outline-none focus:border-accent-gold min-h-[36px]"
              aria-label="Select Date Range"
            >
              {DATE_RANGE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {datePreset === 'custom' && (
            <div className="flex items-center gap-2 bg-graphite/40 p-1 rounded-xs border border-graphite-border">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-obsidian border border-graphite-border rounded-xs px-2 py-1 text-[11px] text-warm-white font-mono"
              />
              <span className="text-muted text-xs">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-obsidian border border-graphite-border rounded-xs px-2 py-1 text-[11px] text-warm-white font-mono"
              />
            </div>
          )}

          {/* Export CTA (Explicitly future action / disabled per instruction) */}
          <button
            type="button"
            disabled
            title="Scheduled export integration (Future release)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-graphite/40 border border-graphite-border text-muted-dark text-xs font-mono cursor-not-allowed opacity-60 min-h-[36px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT REPORT</span>
          </button>

          {/* Data Definitions Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowDefinitionsModal(true)}
            className="p-2 rounded-xs bg-graphite/40 border border-graphite-border text-muted hover:text-accent-gold transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="View Data Definitions"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Period Indicator Bar */}
      <div className="px-3.5 py-2 rounded-xs bg-graphite/20 border border-graphite-border/60 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-muted-dark uppercase tracking-wider text-[10px]">ACTIVE PERIOD:</span>
          <span className="text-accent-gold font-bold">{currentRange.label}</span>
          <span className="text-muted text-[11px]">({formatDateRangeDisplay(currentRange)})</span>
        </div>
        <span className="text-[10px] text-muted-dark">
          Deterministic calculation from canonical demoStore records
        </span>
      </div>

      {/* 2. Canonical 8-KPI Strip with Definitions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3" id="reports-kpi-strip">
        
        {/* KPI 1: Jobs Opened */}
        <div
          id="kpi-jobs-opened"
          className="p-3 rounded-xs bg-graphite/40 border border-graphite-border flex flex-col justify-between"
        >
          <span className="text-[9px] font-mono uppercase text-muted-dark tracking-wider block">
            JOBS OPENED
          </span>
          <span className="text-xl sm:text-2xl font-black font-mono text-warm-white my-1">
            {jobsOpenedInPeriod.length}
          </span>
          <p className="text-[9px] text-muted leading-tight">
            Created in selected period
          </p>
        </div>

        {/* KPI 2: Jobs Completed */}
        <div
          id="kpi-jobs-completed"
          className="p-3 rounded-xs bg-graphite/40 border border-graphite-border flex flex-col justify-between"
        >
          <span className="text-[9px] font-mono uppercase text-muted-dark tracking-wider block">
            JOBS COMPLETED
          </span>
          <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 my-1">
            {jobsCompletedInPeriod.length}
          </span>
          <p className="text-[9px] text-muted leading-tight">
            Reached completed state
          </p>
        </div>

        {/* KPI 3: Jobs Delivered */}
        <div
          id="kpi-jobs-delivered"
          className="p-3 rounded-xs bg-graphite/40 border border-graphite-border flex flex-col justify-between"
        >
          <span className="text-[9px] font-mono uppercase text-muted-dark tracking-wider block">
            JOBS DELIVERED
          </span>
          <span className="text-xl sm:text-2xl font-black font-mono text-emerald-300 my-1">
            {jobsDeliveredInPeriod.length}
          </span>
          <p className="text-[9px] text-muted leading-tight">
            Lifecycle state DELIVERED
          </p>
        </div>

        {/* KPI 4: Ready for Collection */}
        <div
          id="kpi-ready-collection"
          className="p-3 rounded-xs bg-graphite/40 border border-graphite-border flex flex-col justify-between"
        >
          <span className="text-[9px] font-mono uppercase text-muted-dark tracking-wider block">
            READY COLLECTION
          </span>
          <span className="text-xl sm:text-2xl font-black font-mono text-sky-400 my-1">
            {readyForCollection.length}
          </span>
          <p className="text-[9px] text-muted leading-tight">
            Post-QC collection queue
          </p>
        </div>

        {/* KPI 5: Overdue Jobs */}
        <div
          id="kpi-overdue-jobs"
          className="p-3 rounded-xs bg-graphite/40 border border-graphite-border flex flex-col justify-between"
        >
          <span className="text-[9px] font-mono uppercase text-muted-dark tracking-wider block">
            OVERDUE JOBS
          </span>
          <span className="text-xl sm:text-2xl font-black font-mono text-rose-400 my-1">
            {overdueJobs.length}
          </span>
          <p className="text-[9px] text-muted leading-tight">
            Past promised completion
          </p>
        </div>

        {/* KPI 6: Estimates Created */}
        <div
          id="kpi-estimates-created"
          className="p-3 rounded-xs bg-graphite/40 border border-graphite-border flex flex-col justify-between"
        >
          <span className="text-[9px] font-mono uppercase text-muted-dark tracking-wider block">
            ESTIMATES CREATED
          </span>
          <span className="text-xl sm:text-2xl font-black font-mono text-warm-white my-1">
            {estimatesInPeriod.length}
          </span>
          <p className="text-[9px] text-muted leading-tight">
            Estimates in period
          </p>
        </div>

        {/* KPI 7: Approved Scope Value */}
        <div
          id="kpi-approved-scope"
          className="p-3 rounded-xs bg-graphite/40 border border-graphite-border flex flex-col justify-between"
        >
          <span className="text-[9px] font-mono uppercase text-muted-dark tracking-wider block">
            APPROVED SCOPE
          </span>
          <span className="text-lg sm:text-xl font-black font-mono text-accent-gold my-1 truncate">
            ₹{approvedScopeValue.toLocaleString('en-IN')}
          </span>
          <p className="text-[9px] text-muted leading-tight">
            Authorized line-item scope
          </p>
        </div>

        {/* KPI 8: New Customer Records */}
        <div
          id="kpi-new-customers"
          className="p-3 rounded-xs bg-graphite/40 border border-graphite-border flex flex-col justify-between"
        >
          <span className="text-[9px] font-mono uppercase text-muted-dark tracking-wider block">
            NEW CUSTOMERS
          </span>
          <span className="text-xl sm:text-2xl font-black font-mono text-warm-white my-1">
            {newCustomersInPeriod.length}
          </span>
          <p className="text-[9px] text-muted leading-tight">
            Added in selected period
          </p>
        </div>

      </div>

      {/* 3. WORKSHOP OPERATIONS SECTION */}
      <div className="p-5 rounded-xs bg-graphite/30 border border-graphite-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-graphite-border/60">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block">
              EXECUTION MONITORING
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-warm-white">
              WORKSHOP OPERATIONS
            </h2>
          </div>
          <span className="text-[11px] font-mono text-muted">
            Total System Job Cards: {jobs.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Status Breakdown Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-dark flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-accent-gold" />
              Jobs by Lifecycle Status
            </h3>
            <div className="border border-graphite-border rounded-xs overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-obsidian text-[10px] uppercase text-muted border-b border-graphite-border">
                  <tr>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Count</th>
                    <th className="py-2 px-3 text-right">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite-border/40 text-warm-white">
                  {Object.entries(statusCounts).map(([st, cnt]) => {
                    const pct = jobs.length > 0 ? Math.round((cnt / jobs.length) * 100) : 0;
                    return (
                      <tr key={st} className="hover:bg-graphite/40">
                        <td className="py-1.5 px-3 text-[11px] text-muted hover:text-warm-white">
                          {st.replace(/_/g, ' ')}
                        </td>
                        <td className="py-1.5 px-3 text-right font-bold">{cnt}</td>
                        <td className="py-1.5 px-3 text-right text-muted">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bay Distribution Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-dark flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-accent-gold" />
              Active Jobs by Workshop Bay
            </h3>
            <div className="border border-graphite-border rounded-xs overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-obsidian text-[10px] uppercase text-muted border-b border-graphite-border">
                  <tr>
                    <th className="py-2 px-3">Bay Location</th>
                    <th className="py-2 px-3 text-right">Occupancy</th>
                    <th className="py-2 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite-border/40 text-warm-white">
                  {Object.entries(bayCounts).map(([bayName, count]) => (
                    <tr key={bayName} className="hover:bg-graphite/40">
                      <td className="py-2 px-3 font-semibold text-[11px]">
                        {bayName}
                      </td>
                      <td className="py-2 px-3 text-right font-bold">{count}</td>
                      <td className="py-2 px-3 text-right">
                        {count > 0 ? (
                          <span className="text-[10px] text-accent-gold bg-accent-gold/10 px-1.5 py-0.5 rounded-xs">
                            OCCUPIED
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded-xs">
                            AVAILABLE
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Operational Action Queues */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-dark flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-accent-gold" />
              Operational Queues
            </h3>
            <div className="border border-graphite-border rounded-xs p-3 bg-obsidian/60 space-y-2.5 text-xs font-mono">
              <div
                className="flex items-center justify-between pb-1.5 border-b border-graphite-border/40 cursor-pointer hover:text-accent-gold"
                onClick={() => onNavigateModule && onNavigateModule('floor')}
              >
                <span className="text-muted hover:text-warm-white">Awaiting Tech Allocation</span>
                <span className="font-bold text-warm-white">{awaitingTech.length}</span>
              </div>
              <div
                className="flex items-center justify-between pb-1.5 border-b border-graphite-border/40 cursor-pointer hover:text-accent-gold"
                onClick={() => onNavigateModule && onNavigateModule('floor')}
              >
                <span className="text-muted hover:text-warm-white">Awaiting Bay Allocation</span>
                <span className="font-bold text-warm-white">{awaitingBay.length}</span>
              </div>
              <div
                className="flex items-center justify-between pb-1.5 border-b border-graphite-border/40 cursor-pointer hover:text-accent-gold"
                onClick={() => onNavigateModule && onNavigateModule('estimates')}
              >
                <span className="text-muted hover:text-warm-white">Awaiting Customer Approval</span>
                <span className="font-bold text-accent-gold">{awaitingCustomerApproval.length}</span>
              </div>
              <div
                className="flex items-center justify-between pb-1.5 border-b border-graphite-border/40 cursor-pointer hover:text-accent-gold"
                onClick={() => onNavigateModule && onNavigateModule('jobs')}
              >
                <span className="text-muted hover:text-warm-white">Work in Progress</span>
                <span className="font-bold text-sky-400">{inProgressJobs.length}</span>
              </div>
              <div
                className="flex items-center justify-between pb-1.5 border-b border-graphite-border/40 cursor-pointer hover:text-accent-gold"
                onClick={() => onNavigateModule && onNavigateModule('jobs')}
              >
                <span className="text-muted hover:text-warm-white">Quality Check Queue</span>
                <span className="font-bold text-purple-400">{qcJobs.length}</span>
              </div>
              <div
                className="flex items-center justify-between cursor-pointer hover:text-accent-gold"
                onClick={() => {
                  if (readyForCollection[0]?.id && onOpenJob) {
                    onOpenJob(readyForCollection[0].id);
                  } else if (onNavigateModule) {
                    onNavigateModule('jobs');
                  }
                }}
              >
                <span className="text-muted hover:text-warm-white">Ready for Customer Handover</span>
                <span className="font-bold text-emerald-400">{readyForCollection.length}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. CUSTOMER INTAKE & CONVERSION + ESTIMATE PERFORMANCE (2-COL) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Customer Intake & Conversion */}
        <div className="p-5 rounded-xs bg-graphite/30 border border-graphite-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-graphite-border/60">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block">
                INTAKE FUNNEL FACTS
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-warm-white">
                CUSTOMER INTAKE & CONVERSION
              </h2>
            </div>
            <span className="text-xs font-mono text-muted">
              {currentRange.label}
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded-xs bg-obsidian/40 border border-graphite-border/40">
              <span className="text-muted">LEADS RECEIVED</span>
              <span className="font-bold text-warm-white">{leadsInPeriod.length}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xs bg-obsidian/40 border border-graphite-border/40">
              <span className="text-muted">APPOINTMENTS CREATED</span>
              <span className="font-bold text-warm-white">{appointmentsInPeriod.length}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xs bg-obsidian/40 border border-graphite-border/40">
              <span className="text-muted">APPOINTMENTS CONFIRMED</span>
              <span className="font-bold text-warm-white">{appointmentsConfirmed}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xs bg-obsidian/40 border border-graphite-border/40">
              <span className="text-muted">CUSTOMERS ARRIVED ON SITE</span>
              <span className="font-bold text-sky-400">{customersArrived}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xs bg-obsidian/40 border border-graphite-border/40">
              <span className="text-muted">VEHICLES CHECKED IN</span>
              <span className="font-bold text-warm-white">{vehiclesCheckedIn}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xs bg-obsidian/40 border border-graphite-border/40">
              <span className="text-muted">JOB CARDS CONVERTED</span>
              <span className="font-bold text-emerald-400">{appointmentsConvertedToJob}</span>
            </div>
          </div>

          {/* Mathematical Ratios */}
          <div className="pt-2 border-t border-graphite-border/40 grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2 rounded-xs bg-graphite/40 border border-graphite-border/40">
              <span className="text-[9px] text-muted-dark block uppercase">Lead → Appt</span>
              <span className="font-bold text-accent-gold">{leadToApptRate}</span>
            </div>
            <div className="p-2 rounded-xs bg-graphite/40 border border-graphite-border/40">
              <span className="text-[9px] text-muted-dark block uppercase">Appt → Arrival</span>
              <span className="font-bold text-sky-400">{apptToArrivalRate}</span>
            </div>
            <div className="p-2 rounded-xs bg-graphite/40 border border-graphite-border/40">
              <span className="text-[9px] text-muted-dark block uppercase">Arrival → Job</span>
              <span className="font-bold text-emerald-400">{arrivalToJobRate}</span>
            </div>
          </div>
        </div>

        {/* Estimate Performance */}
        <div className="p-5 rounded-xs bg-graphite/30 border border-graphite-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-graphite-border/60">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block">
                COMMERCIAL DECISION FACTS
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-warm-white">
                ESTIMATE PERFORMANCE
              </h2>
            </div>
            <span className="text-xs font-mono text-muted">
              {estimatesInPeriod.length} Estimates
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xs bg-obsidian/40 border border-graphite-border/40 flex justify-between">
              <span className="text-muted">Created:</span>
              <span className="font-bold text-warm-white">{estCreatedCount}</span>
            </div>
            <div className="p-2.5 rounded-xs bg-obsidian/40 border border-graphite-border/40 flex justify-between">
              <span className="text-muted">Sent to Customer:</span>
              <span className="font-bold text-warm-white">{estSentCount}</span>
            </div>
            <div className="p-2.5 rounded-xs bg-obsidian/40 border border-graphite-border/40 flex justify-between">
              <span className="text-muted">Awaiting Decision:</span>
              <span className="font-bold text-accent-gold">{estAwaitingDecisionCount}</span>
            </div>
            <div className="p-2.5 rounded-xs bg-obsidian/40 border border-graphite-border/40 flex justify-between">
              <span className="text-muted">Approved:</span>
              <span className="font-bold text-emerald-400">{estApprovedCount}</span>
            </div>
            <div className="p-2.5 rounded-xs bg-obsidian/40 border border-graphite-border/40 flex justify-between">
              <span className="text-muted">Partially Approved:</span>
              <span className="font-bold text-sky-400">{estPartiallyApprovedCount}</span>
            </div>
            <div className="p-2.5 rounded-xs bg-obsidian/40 border border-graphite-border/40 flex justify-between">
              <span className="text-muted">Declined:</span>
              <span className="font-bold text-rose-400">{estDeclinedCount}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xs bg-obsidian/40 border border-graphite-border/40 flex justify-between text-xs font-mono">
            <span className="text-muted">Approved Work Authorized:</span>
            <span className="font-bold text-emerald-400">{estAuthorizedCount} Jobs</span>
          </div>

          {/* Scope Financial Breakdown (Non-Revenue) */}
          <div className="pt-2 border-t border-graphite-border/40 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-muted">
              <span>PROPOSED SCOPE VALUE:</span>
              <span className="text-warm-white font-bold">
                ₹{proposedScopeTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center text-muted">
              <span>APPROVED SCOPE VALUE:</span>
              <span className="text-emerald-400 font-bold">
                ₹{approvedScopeValue.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center text-muted">
              <span>DECLINED SCOPE VALUE:</span>
              <span className="text-rose-400 font-bold">
                ₹{declinedScopeTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[9px] text-muted-dark pt-1 italic">
              * Approved scope values represent customer-authorized work orders and are distinct from accounting revenue.
            </p>
          </div>
        </div>

      </div>

      {/* 5. TECHNICIAN WORKLOAD & CUSTOMER ACTIVITY (2-COL) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Technician Workload (Factual counts only - no fabricated percentages) */}
        <div className="p-5 rounded-xs bg-graphite/30 border border-graphite-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-graphite-border/60">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block">
                ROSTER & CAPACITY
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-warm-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-accent-gold" />
                TECHNICIAN WORKLOAD
              </h2>
            </div>
            <span className="text-xs font-mono text-muted">
              {technicians.length} Active Staff
            </span>
          </div>

          <div className="border border-graphite-border rounded-xs overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-obsidian text-[10px] uppercase text-muted border-b border-graphite-border">
                <tr>
                  <th className="py-2 px-3">Technician</th>
                  <th className="py-2 px-2 text-center">Status</th>
                  <th className="py-2 px-2 text-right">Active</th>
                  <th className="py-2 px-2 text-right">Assigned</th>
                  <th className="py-2 px-3 text-right">QC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-border/40 text-warm-white">
                {technicians.map((tech) => {
                  const techJobs = jobs.filter(
                    (j) =>
                      j.status !== 'DELIVERED' &&
                      j.status !== 'CANCELLED' &&
                      j.technician.toLowerCase().includes(tech.name.split(' ')[0].toLowerCase())
                  );
                  const activeCount = techJobs.length;
                  const qcCount = techJobs.filter((j) => j.status === 'QUALITY_CHECK').length;

                  return (
                    <tr key={tech.id} className="hover:bg-graphite/40">
                      <td className="py-2 px-3">
                        <span className="font-bold block text-warm-white">{tech.name}</span>
                        <span className="text-[10px] text-muted block truncate max-w-[140px]">
                          {tech.specialization}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-xs ${
                            tech.status === 'AVAILABLE'
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                              : tech.status === 'BUSY'
                              ? 'bg-accent-gold/10 text-accent-gold border border-accent-gold/30'
                              : 'bg-graphite/60 text-muted border border-graphite-border'
                          }`}
                        >
                          {tech.status}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right font-bold">{activeCount}</td>
                      <td className="py-2 px-2 text-right text-muted">{tech.assigned_job_ids?.length || activeCount}</td>
                      <td className="py-2 px-3 text-right text-purple-400">{qcCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-muted-dark italic">
            Workload represents active Job Card allocation counts. Productivity percentages require time-tracking telemetry not configured in this workshop.
          </p>
        </div>

        {/* Customer Activity & Retention */}
        <div className="p-5 rounded-xs bg-graphite/30 border border-graphite-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-graphite-border/60">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block">
                RETENTION & FOLLOW-UP
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-warm-white flex items-center gap-2">
                <Users className="w-4 h-4 text-accent-gold" />
                CUSTOMER ACTIVITY
              </h2>
            </div>
            <span className="text-xs font-mono text-muted">
              Database Records
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xs bg-obsidian/40 border border-graphite-border/40 space-y-1">
              <span className="text-[10px] text-muted uppercase block">Total Customers</span>
              <span className="text-xl font-bold text-warm-white">{customers.length}</span>
              <span className="text-[10px] text-muted-dark block">Registered profiles</span>
            </div>
            <div className="p-3 rounded-xs bg-obsidian/40 border border-graphite-border/40 space-y-1">
              <span className="text-[10px] text-muted uppercase block">Vehicles Registered</span>
              <span className="text-xl font-bold text-warm-white">{vehicles.length}</span>
              <span className="text-[10px] text-muted-dark block">Under active service care</span>
            </div>
            <div className="p-3 rounded-xs bg-obsidian/40 border border-graphite-border/40 space-y-1">
              <span className="text-[10px] text-muted uppercase block">New In Period</span>
              <span className="text-xl font-bold text-emerald-400">{newCustomersInPeriod.length}</span>
              <span className="text-[10px] text-muted-dark block">First visit during period</span>
            </div>
            <div className="p-3 rounded-xs bg-obsidian/40 border border-graphite-border/40 space-y-1">
              <span className="text-[10px] text-muted uppercase block">Returning Customers</span>
              <span className="text-xl font-bold text-accent-gold">
                {customers.filter((c) => c.total_visits > 1).length}
              </span>
              <span className="text-[10px] text-muted-dark block">Historical visits &gt; 1</span>
            </div>
          </div>

          {/* Service Reminders & Retention Status */}
          <div className="p-3 rounded-xs bg-obsidian/60 border border-graphite-border/40 space-y-2 text-xs font-mono">
            <span className="text-[10px] font-bold text-muted uppercase block">
              SERVICE REMINDERS & RETENTION FOLLOW-UP
            </span>
            <div className="flex items-center justify-between pb-1.5 border-b border-graphite-border/40">
              <span className="text-muted">Active Reminders Staged</span>
              <span className="font-bold text-warm-white">{activeReminders.length}</span>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-graphite-border/40">
              <span className="text-muted">Due for Customer Outreach</span>
              <span className="font-bold text-accent-gold">{dueReminders.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Overdue Reminders</span>
              <span className="font-bold text-rose-400">{overdueReminders.length}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 6. DATA DEFINITIONS MODAL / OVERLAY */}
      {showDefinitionsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-obsidian border border-graphite-border rounded-xs max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-accent-gold" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-warm-white">
                  CANONICAL DATA DEFINITIONS
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDefinitionsModal(false)}
                className="p-1 rounded-xs hover:bg-graphite text-muted hover:text-warm-white min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono text-muted">
              <div>
                <span className="font-bold text-warm-white block">Jobs Opened</span>
                Job Cards created with opened timestamp within the selected period.
              </div>
              <div>
                <span className="font-bold text-warm-white block">Jobs Completed</span>
                Job Cards that concluded operational execution (Delivered or Ready for Collection) during the selected period.
              </div>
              <div>
                <span className="font-bold text-warm-white block">Jobs Delivered</span>
                Job Cards whose vehicle handover to the customer was completed with status DELIVERED during the period.
              </div>
              <div>
                <span className="font-bold text-warm-white block">Approved Scope</span>
                The monetary sum of digital estimate line items authorized by the customer. Note: Approved scope is an operational authorization metric, not accounting revenue.
              </div>
              <div>
                <span className="font-bold text-warm-white block">Ready for Collection</span>
                Current active Job Cards that passed Quality Check and are staged awaiting owner pickup.
              </div>
              <div>
                <span className="font-bold text-warm-white block">Overdue Jobs</span>
                Active Job Cards whose scheduled completion time has elapsed without reaching DELIVERED status.
              </div>
            </div>

            <div className="pt-3 border-t border-graphite-border flex justify-end">
              <button
                type="button"
                onClick={() => setShowDefinitionsModal(false)}
                className="px-4 py-1.5 rounded-xs bg-graphite border border-graphite-border text-xs font-mono text-warm-white hover:text-accent-gold min-h-[36px]"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
