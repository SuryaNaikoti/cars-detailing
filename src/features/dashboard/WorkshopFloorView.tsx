import React, { useState, useMemo } from 'react';
import type {
  JobCard,
  TechnicianRecord,
  CustomerRecord,
  VehicleRecord,
} from '../../types';
import {
  reassignJobBay,
  reassignJobTechnician,
  updateJobStatus,
} from '../../lib/demoStore';
import {
  Wrench,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  RotateCcw,
  Plus,
  ShieldCheck,
  Truck,
  ChevronLeft,
  X,
  Layers,
} from 'lucide-react';

export interface WorkshopFloorViewProps {
  jobs: JobCard[];
  technicians?: TechnicianRecord[];
  customers?: CustomerRecord[];
  vehicles?: VehicleRecord[];
  onOpenJob: (jobId: string) => void;
  onNavigateModule?: (module: any) => void;
  onUpdateJob?: (job: JobCard) => void;
  onOpenCustomerView?: (token: string) => void;
}

// 4 Canonical Workshop Bays
export const STANDARD_BAYS = [
  { bayNumber: 'BAY 01', name: 'Diagnostic & Heavy Mechanical' },
  { bayNumber: 'BAY 02', name: 'Electrical & Fast Mechanical' },
  { bayNumber: 'BAY 03', name: 'Periodic Service & Suspension' },
  { bayNumber: 'BAY 04', name: 'Quality Inspection & Detailing' },
];

export const STAGE_CONFIG: Record<
  string,
  { label: string; badgeClass: string; borderClass: string }
> = {
  AVAILABLE: {
    label: 'AVAILABLE',
    badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    borderClass: 'border-dashed border-graphite-border/70',
  },
  READY_FOR_INTAKE: {
    label: 'READY FOR INTAKE',
    badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    borderClass: 'border-dashed border-graphite-border/70',
  },
  INTAKE_RECEIVED: {
    label: 'INTAKE RECEIVED',
    badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    borderClass: 'border-zinc-700',
  },
  IN_PROGRESS: {
    label: 'IN PROGRESS',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    borderClass: 'border-blue-500/30',
  },
  WAITING: {
    label: 'WAITING',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    borderClass: 'border-amber-500/30',
  },
  QUALITY_CHECK: {
    label: 'QUALITY CHECK',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    borderClass: 'border-purple-500/30',
  },
  READY_FOR_COLLECTION: {
    label: 'READY FOR COLLECTION',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    borderClass: 'border-emerald-500/30',
  },
};

// Check if job is overdue (excluding delivered/cancelled)
export function isJobOverdue(job: JobCard | null): boolean {
  if (!job) return false;
  if (job.status === 'DELIVERED' || job.status === 'CANCELLED') return false;
  if (!job.promised_completion) return false;
  const promised = new Date(job.promised_completion).getTime();
  const now = new Date('2026-09-20T19:00:00Z').getTime(); // Reference current time
  return now > promised;
}

// Map job status to operational stage on the floor
export function mapJobToFloorStage(job: JobCard | null): {
  stageKey: string;
  stageLabel: string;
  isWaiting: boolean;
  isOverdue: boolean;
  blockerReason?: string;
} {
  if (!job) {
    return {
      stageKey: 'AVAILABLE',
      stageLabel: 'AVAILABLE',
      isWaiting: false,
      isOverdue: false,
    };
  }

  const overdue = isJobOverdue(job);

  // Explicit Waiting condition
  if (job.status === 'ESTIMATE_SENT' || job.waiting_reason || job.approval_status === 'PENDING') {
    return {
      stageKey: 'WAITING',
      stageLabel: 'WAITING',
      isWaiting: true,
      isOverdue: overdue,
      blockerReason: job.waiting_reason || (job.status === 'ESTIMATE_SENT' ? 'WAITING FOR CUSTOMER APPROVAL' : 'WAITING FOR PARTS'),
    };
  }

  if (job.status === 'QUALITY_CHECK') {
    return {
      stageKey: 'QUALITY_CHECK',
      stageLabel: 'QUALITY CHECK',
      isWaiting: false,
      isOverdue: overdue,
    };
  }

  if (job.status === 'READY_FOR_COLLECTION') {
    return {
      stageKey: 'READY_FOR_COLLECTION',
      stageLabel: 'READY FOR COLLECTION',
      isWaiting: false,
      isOverdue: overdue,
    };
  }

  if (job.status === 'WORK_IN_PROGRESS' || job.status === 'ESTIMATE_APPROVED') {
    return {
      stageKey: 'IN_PROGRESS',
      stageLabel: 'IN PROGRESS',
      isWaiting: false,
      isOverdue: overdue,
    };
  }

  return {
    stageKey: 'INTAKE_RECEIVED',
    stageLabel: 'INTAKE RECEIVED',
    isWaiting: false,
    isOverdue: overdue,
  };
}

export const WorkshopFloorView: React.FC<WorkshopFloorViewProps> = ({
  jobs,
  technicians = [],
  customers: _customers = [],
  vehicles: _vehicles = [],
  onOpenJob,
  onNavigateModule,
  onUpdateJob,
  onOpenCustomerView,
}) => {
  // Filter active jobs (Rule: DELIVERED vehicles do NOT occupy active workshop floor bays)
  const activeJobs = useMemo(
    () => jobs.filter((j) => j.status !== 'DELIVERED' && j.status !== 'CANCELLED'),
    [jobs]
  );

  // Selected Bay / Job state
  const [selectedBayNumber, setSelectedBayNumber] = useState<string>('BAY 01');
  const [mobileDossierOpen, setMobileDossierOpen] = useState(false);

  // Filter States
  const [kpiFilter, setKpiFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [technicianFilter, setTechnicianFilter] = useState<string>('ALL');
  const [advisorFilter, setAdvisorFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('BAY_ORDER');

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reassignBayModalOpen, setReassignBayModalOpen] = useState(false);
  const [reassignTechModalOpen, setReassignTechModalOpen] = useState(false);

  // Form states for modals
  const [selectedAssignJobId, setSelectedAssignJobId] = useState<string>('');
  const [targetBaySelection, setTargetBaySelection] = useState<string>('BAY 01');
  const [targetTechSelection, setTargetTechSelection] = useState<string>('Arjun Sharma');
  const [reassignReason, setReassignReason] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Show transient confirmation toast
  const triggerToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  // Derive Bay items with occupied jobs
  const baySlots = useMemo(() => {
    return STANDARD_BAYS.map((bay) => {
      const occupiedJob = activeJobs.find((j) => j.bay === bay.bayNumber);
      const stageInfo = mapJobToFloorStage(occupiedJob || null);

      return {
        bayNumber: bay.bayNumber,
        bayName: bay.name,
        isOccupied: !!occupiedJob,
        job: occupiedJob || null,
        ...stageInfo,
      };
    });
  }, [activeJobs]);

  // Derive Active Selected Bay Item & Job
  const selectedBayItem = useMemo(() => {
    return baySlots.find((b) => b.bayNumber === selectedBayNumber) || baySlots[0];
  }, [baySlots, selectedBayNumber]);

  const activeDossierJob = selectedBayItem?.job || null;

  // Derive Operational KPIs (all derived deterministically from canonical JobCard state)
  const kpiMetrics = useMemo(() => {
    const onFloor = activeJobs.length;
    const activeBays = baySlots.filter((b) => b.isOccupied).length;
    const availableBays = STANDARD_BAYS.length - activeBays;
    const inProgress = activeJobs.filter(
      (j) => j.status === 'WORK_IN_PROGRESS' || j.status === 'ESTIMATE_APPROVED'
    ).length;
    const waiting = activeJobs.filter(
      (j) => j.status === 'ESTIMATE_SENT' || !!j.waiting_reason || j.approval_status === 'PENDING'
    ).length;
    const qcReady = activeJobs.filter((j) => j.status === 'QUALITY_CHECK').length;
    const readyCollection = activeJobs.filter((j) => j.status === 'READY_FOR_COLLECTION').length;
    const overdue = activeJobs.filter((j) => isJobOverdue(j)).length;

    return {
      onFloor,
      activeBays,
      availableBays,
      inProgress,
      waiting,
      qcReady,
      readyCollection,
      overdue,
    };
  }, [activeJobs, baySlots]);

  // Derived Queues for Secondary Operational Sections
  const qcQueueJobs = useMemo(
    () => activeJobs.filter((j) => j.status === 'QUALITY_CHECK'),
    [activeJobs]
  );

  const readyCollectionJobs = useMemo(
    () => activeJobs.filter((j) => j.status === 'READY_FOR_COLLECTION'),
    [activeJobs]
  );

  // Canonical unassigned breakdowns
  const unassignedTechJobs = useMemo(
    () => activeJobs.filter((j) => !j.technician || j.technician.toLowerCase() === 'unassigned'),
    [activeJobs]
  );

  const unassignedBayJobs = useMemo(
    () => activeJobs.filter((j) => !j.bay || j.bay === 'UNASSIGNED' || !STANDARD_BAYS.some((b) => b.bayNumber === j.bay)),
    [activeJobs]
  );

  // Derived Critical Attention Items (Consolidated: Exactly one entry per Job Card)
  const attentionItems = useMemo(() => {
    const items: {
      id: string;
      level: 'CRITICAL' | 'HIGH' | 'INFO';
      badge: string;
      title: string;
      subtitle: string;
      jobId?: string;
      bayNumber?: string;
      actionLabel: string;
      actionType: 'JOB' | 'BAY' | 'INTAKE';
    }[] = [];

    // Process each active job exactly once to avoid duplicate Job Card representation
    activeJobs.forEach((j) => {
      const isOverdue = isJobOverdue(j);
      const isAwaitingApproval = j.status === 'ESTIMATE_SENT' || j.approval_status === 'PENDING';
      const isTechnicianUnassigned = !j.technician || j.technician.toLowerCase() === 'unassigned';
      const isBayUnassigned = !j.bay || j.bay === 'UNASSIGNED' || !STANDARD_BAYS.some((b) => b.bayNumber === j.bay);

      if (isAwaitingApproval) {
        items.push({
          id: `att-${j.id}`,
          level: 'HIGH',
          badge: 'AWAITING CUSTOMER APPROVAL',
          title: `${j.id} · ${j.vehicle_summary}`,
          subtitle: `Awaiting Customer Approval · Tech: ${j.technician || 'Unassigned'} · Bay: ${j.bay || 'UNASSIGNED'}`,
          jobId: j.id,
          actionLabel: 'OPEN JOB CARD →',
          actionType: 'JOB',
        });
      } else if (isOverdue) {
        items.push({
          id: `att-${j.id}`,
          level: 'CRITICAL',
          badge: 'OVERDUE',
          title: `${j.id} · ${j.vehicle_summary}`,
          subtitle: `Delivery promised ${new Date(j.promised_completion).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · Tech: ${j.technician || 'Unassigned'} · Bay: ${j.bay || 'UNASSIGNED'}`,
          jobId: j.id,
          actionLabel: 'OPEN JOB CARD →',
          actionType: 'JOB',
        });
      } else if (j.waiting_reason) {
        items.push({
          id: `att-${j.id}`,
          level: 'HIGH',
          badge: 'BLOCKED',
          title: `${j.id} · ${j.vehicle_summary}`,
          subtitle: `${j.waiting_reason} · Tech: ${j.technician || 'Unassigned'} · Bay: ${j.bay || 'UNASSIGNED'}`,
          jobId: j.id,
          actionLabel: 'OPEN JOB CARD →',
          actionType: 'JOB',
        });
      } else if (isTechnicianUnassigned && isBayUnassigned) {
        items.push({
          id: `att-${j.id}`,
          level: 'INFO',
          badge: 'UNASSIGNED ALLOCATION',
          title: `${j.id} · ${j.vehicle_summary}`,
          subtitle: `Intake complete · Tech: Unassigned · Bay: Unassigned`,
          jobId: j.id,
          actionLabel: 'ASSIGN BAY →',
          actionType: 'BAY',
        });
      } else if (isBayUnassigned) {
        items.push({
          id: `att-${j.id}`,
          level: 'INFO',
          badge: 'AWAITING BAY',
          title: `${j.id} · ${j.vehicle_summary}`,
          subtitle: `Awaiting Bay Allocation · Tech: ${j.technician} · Advisor: ${j.advisor}`,
          jobId: j.id,
          actionLabel: 'ASSIGN BAY →',
          actionType: 'BAY',
        });
      }
    });

    return items;
  }, [activeJobs]);

  // Handle KPI Click (Toggle-to-Clear)
  const handleKpiClick = (filterKey: string) => {
    if (kpiFilter === filterKey) {
      setKpiFilter('ALL');
    } else {
      setKpiFilter(filterKey);
      setStageFilter('ALL');
    }
  };

  const handleResetFilters = () => {
    setKpiFilter('ALL');
    setSearchQuery('');
    setStageFilter('ALL');
    setTechnicianFilter('ALL');
    setAdvisorFilter('ALL');
    setPriorityFilter('ALL');
    setSortBy('BAY_ORDER');
  };

  // Filtered Bay Slots
  const filteredBays = useMemo(() => {
    return baySlots.filter((slot) => {
      const j = slot.job;

      // KPI filter
      if (kpiFilter === 'ACTIVE_BAYS' && !slot.isOccupied) return false;
      if (kpiFilter === 'AVAILABLE_BAYS' && slot.isOccupied) return false;
      if (kpiFilter === 'IN_PROGRESS' && (!j || (j.status !== 'WORK_IN_PROGRESS' && j.status !== 'ESTIMATE_APPROVED'))) return false;
      if (kpiFilter === 'WAITING' && (!j || (j.status !== 'ESTIMATE_SENT' && !j.waiting_reason && j.approval_status !== 'PENDING'))) return false;
      if (kpiFilter === 'QC_READY' && (!j || j.status !== 'QUALITY_CHECK')) return false;
      if (kpiFilter === 'READY_COLLECTION' && (!j || j.status !== 'READY_FOR_COLLECTION')) return false;
      if (kpiFilter === 'OVERDUE' && (!j || !isJobOverdue(j))) return false;

      // Secondary Stage Filter
      if (stageFilter !== 'ALL') {
        if (stageFilter === 'AVAILABLE' && slot.isOccupied) return false;
        if (stageFilter !== 'AVAILABLE' && (!j || slot.stageKey !== stageFilter)) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesBay = slot.bayNumber.toLowerCase().includes(q) || slot.bayName.toLowerCase().includes(q);
        const matchesJob = j
          ? j.id.toLowerCase().includes(q) ||
            j.registration.toLowerCase().includes(q) ||
            j.customer_name.toLowerCase().includes(q) ||
            j.vehicle_summary.toLowerCase().includes(q) ||
            (j.technician && j.technician.toLowerCase().includes(q))
          : false;

        if (!matchesBay && !matchesJob) return false;
      }

      // Technician Filter
      if (technicianFilter !== 'ALL') {
        if (!j || j.technician !== technicianFilter) return false;
      }

      // Advisor Filter
      if (advisorFilter !== 'ALL') {
        if (!j || j.advisor !== advisorFilter) return false;
      }

      // Priority Filter
      if (priorityFilter !== 'ALL') {
        if (!j || j.priority !== priorityFilter) return false;
      }

      return true;
    });
  }, [
    baySlots,
    kpiFilter,
    stageFilter,
    searchQuery,
    technicianFilter,
    advisorFilter,
    priorityFilter,
  ]);

  // Sorted Bays
  const sortedBays = useMemo(() => {
    const list = [...filteredBays];
    if (sortBy === 'BAY_ORDER') {
      list.sort((a, b) => a.bayNumber.localeCompare(b.bayNumber));
    } else if (sortBy === 'PRIORITY') {
      const priorityOrder: Record<string, number> = { URGENT: 3, HIGH: 2, NORMAL: 1 };
      list.sort((a, b) => {
        const pA = a.job?.priority ? priorityOrder[a.job.priority] || 1 : 0;
        const pB = b.job?.priority ? priorityOrder[b.job.priority] || 1 : 0;
        return pB - pA;
      });
    } else if (sortBy === 'PROMISED_DELIVERY') {
      list.sort((a, b) => {
        const tA = a.job?.promised_completion ? new Date(a.job.promised_completion).getTime() : Infinity;
        const tB = b.job?.promised_completion ? new Date(b.job.promised_completion).getTime() : Infinity;
        return tA - tB;
      });
    }
    return list;
  }, [filteredBays, sortBy]);

  // Handlers for Bay Assignment
  const handleAssignVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignJobId) return;

    const res = reassignJobBay(selectedAssignJobId, targetBaySelection, 'Assigned from Workshop Floor console');
    if (res.success && res.job) {
      if (targetTechSelection && targetTechSelection !== res.job.technician) {
        reassignJobTechnician(res.job.id, targetTechSelection, 'Technician assigned on bay allocation');
      }
      if (onUpdateJob) onUpdateJob(res.job);
      setSelectedBayNumber(targetBaySelection);
      setAssignModalOpen(false);
      triggerToast(`Vehicle assigned to ${targetBaySelection}.`);
    }
  };

  const handleReassignBaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDossierJob) return;

    const res = reassignJobBay(activeDossierJob.id, targetBaySelection, reassignReason || 'Reassigned via Workshop Floor');
    if (res.success && res.job) {
      if (onUpdateJob) onUpdateJob(res.job);
      setSelectedBayNumber(targetBaySelection);
      setReassignBayModalOpen(false);
      setReassignReason('');
      triggerToast(`Bay reassigned from ${activeDossierJob.bay} to ${targetBaySelection}.`);
    }
  };

  const handleReassignTechSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDossierJob) return;

    const res = reassignJobTechnician(activeDossierJob.id, targetTechSelection, reassignReason || 'Technician reallocated on Workshop Floor');
    if (res.success && res.job) {
      if (onUpdateJob) onUpdateJob(res.job);
      setReassignTechModalOpen(false);
      setReassignReason('');
      triggerToast(`Technician updated to ${targetTechSelection}.`);
    }
  };

  const handleResumeWork = () => {
    if (!activeDossierJob) return;
    const res = updateJobStatus(activeDossierJob.id, 'WORK_IN_PROGRESS', 'Rohan Deshmukh (Advisor)', 'Resumed work on floor');
    if (res.success && res.job) {
      if (onUpdateJob) onUpdateJob(res.job);
      triggerToast(`Work resumed on ${activeDossierJob.id}.`);
    }
  };

  const handleMoveToQC = () => {
    if (!activeDossierJob) return;
    const res = updateJobStatus(activeDossierJob.id, 'QUALITY_CHECK', 'Arjun Sharma (Technician)', 'Mechanical work complete. Moved to QC.');
    if (res.success && res.job) {
      if (onUpdateJob) onUpdateJob(res.job);
      triggerToast(`Job ${activeDossierJob.id} moved to Quality Check.`);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ============================================================ */}
      {/* 1. TOAST CONFIRMATION FEEDBACK                               */}
      {/* ============================================================ */}
      {feedbackMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-obsidian px-4 py-2.5 rounded-xs font-mono text-xs font-bold shadow-xl border border-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. PAGE HEADER                                               */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-graphite-border">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block font-bold">
            WORKSHOP OPERATIONS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-warm-white">
            WORKSHOP FLOOR
          </h1>
          <p className="text-xs sm:text-sm text-muted font-light mt-1 max-w-2xl">
            Monitor vehicles inside the workshop, bay assignments, active work, blockers and delivery commitments.
          </p>
        </div>

        {/* Primary CTA + Capacity Summary */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 rounded-xs bg-obsidian border border-graphite-border text-xs font-mono flex items-center gap-2">
            <span className="text-muted-dark uppercase tracking-wider text-[10px]">Occupancy:</span>
            <span className="text-emerald-400 font-bold">{kpiMetrics.activeBays} / {STANDARD_BAYS.length} Bays</span>
            <span className="text-muted-dark">·</span>
            <span className="text-warm-white font-bold">{kpiMetrics.availableBays} Free</span>
          </div>

          <button
            onClick={() => {
              setTargetBaySelection(STANDARD_BAYS.find((b) => !baySlots.find((s) => s.bayNumber === b.bayNumber)?.isOccupied)?.bayNumber || 'BAY 01');
              setAssignModalOpen(true);
            }}
            className="px-4 py-2.5 bg-accent-gold text-obsidian rounded-xs text-xs font-bold font-mono uppercase tracking-wider hover:bg-white transition-colors flex items-center gap-1.5 shadow-sm min-h-[44px]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ ASSIGN VEHICLE</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. OPERATIONAL KPI STRIP (8 Clickable Metrics, Toggle-to-Clear) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono text-xs">
        {[
          { key: 'ALL', label: 'VEHICLES ON FLOOR', count: kpiMetrics.onFloor, color: 'text-warm-white', border: 'border-accent-gold' },
          { key: 'ACTIVE_BAYS', label: 'ACTIVE BAYS', count: kpiMetrics.activeBays, color: 'text-emerald-400', border: 'border-emerald-400' },
          { key: 'AVAILABLE_BAYS', label: 'AVAILABLE BAYS', count: kpiMetrics.availableBays, color: 'text-zinc-400', border: 'border-zinc-400' },
          { key: 'IN_PROGRESS', label: 'IN PROGRESS', count: kpiMetrics.inProgress, color: 'text-blue-400', border: 'border-blue-400' },
          { key: 'WAITING', label: 'WAITING / BLOCKED', count: kpiMetrics.waiting, color: 'text-amber-400', border: 'border-amber-400' },
          { key: 'QC_READY', label: 'QC READY', count: kpiMetrics.qcReady, color: 'text-purple-400', border: 'border-purple-400' },
          { key: 'READY_COLLECTION', label: 'READY FOR PICKUP', count: kpiMetrics.readyCollection, color: 'text-emerald-400', border: 'border-emerald-400' },
          { key: 'OVERDUE', label: 'OVERDUE COMMITMENTS', count: kpiMetrics.overdue, color: 'text-red-400', border: 'border-red-400' },
        ].map((kpi) => {
          const isActive = kpiFilter === kpi.key;
          return (
            <button
              key={kpi.key}
              type="button"
              data-testid={`kpi-${kpi.key}`}
              onClick={() => handleKpiClick(kpi.key)}
              className={`p-3 rounded-xs border cursor-pointer transition-all bg-obsidian flex flex-col justify-between text-left min-h-[76px] ${
                isActive
                  ? `${kpi.border} ring-1 ${kpi.border.replace('border', 'ring')} shadow-md`
                  : 'border-graphite-border hover:border-graphite-border/90'
              }`}
            >
              <span className="text-[9px] uppercase tracking-wider text-muted font-bold block truncate">
                {kpi.label}
              </span>
              <span className={`text-xl font-bold ${kpi.color}`}>
                {kpi.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* 4. WORKSHOP FLOOR FILTERS & SEARCH                           */}
      {/* ============================================================ */}
      <div className="p-4 rounded-xs bg-obsidian border border-graphite-border space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="sm:col-span-4 relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Job Card, Reg, Customer, Technician..."
              className="w-full pl-9 pr-3 py-2 bg-graphite border border-graphite-border rounded-xs text-xs font-mono text-warm-white placeholder:text-muted-dark focus:outline-none focus:border-accent-gold min-h-[40px]"
            />
          </div>

          {/* Filters */}
          <div className="sm:col-span-8 flex flex-wrap items-center gap-2 justify-end">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-graphite border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
            >
              <option value="ALL">All Stages</option>
              <option value="AVAILABLE">Available Bays</option>
              <option value="INTAKE_RECEIVED">Intake Received</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING">Waiting / Blocked</option>
              <option value="QUALITY_CHECK">Quality Check</option>
              <option value="READY_FOR_COLLECTION">Ready for Collection</option>
            </select>

            <select
              value={technicianFilter}
              onChange={(e) => setTechnicianFilter(e.target.value)}
              className="bg-graphite border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
            >
              <option value="ALL">All Technicians</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-graphite border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="NORMAL">Normal</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-graphite border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
            >
              <option value="BAY_ORDER">Sort: Bay Order (01–04)</option>
              <option value="PROMISED_DELIVERY">Sort: Promised Delivery</option>
              <option value="PRIORITY">Sort: Priority Level</option>
            </select>

            {(kpiFilter !== 'ALL' ||
              searchQuery ||
              stageFilter !== 'ALL' ||
              technicianFilter !== 'ALL' ||
              priorityFilter !== 'ALL' ||
              sortBy !== 'BAY_ORDER') && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-2 bg-graphite text-muted-dark hover:text-warm-white border border-graphite-border rounded-xs text-xs font-mono uppercase flex items-center gap-1 min-h-[40px] shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">RESET FILTERS</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. WORKSPACE LAYOUT: 65% FLOOR / 35% OPERATIONS DOSSIER      */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: WORKSHOP BAY BOARD & OPERATIONAL QUEUES (65%)   */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Capacity Header */}
          <div className="flex items-center justify-between text-xs font-mono text-muted px-1">
            <span>
              SHOWING <strong className="text-warm-white">{sortedBays.length}</strong> WORKSHOP BAYS
            </span>
            {kpiFilter !== 'ALL' && (
              <span className="text-accent-gold font-bold">
                Filtered by: {kpiFilter}
              </span>
            )}
          </div>

          {/* Bay Cards Grid (2 Columns on MD/LG) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedBays.map((slot) => {
              const isSelected = selectedBayItem?.bayNumber === slot.bayNumber;
              const job = slot.job;
              const config = STAGE_CONFIG[slot.stageKey] || STAGE_CONFIG.AVAILABLE;

              // AVAILABLE BAY CARD
              if (!job) {
                return (
                  <div
                    key={slot.bayNumber}
                    onClick={() => {
                      setSelectedBayNumber(slot.bayNumber);
                      setMobileDossierOpen(true);
                    }}
                    className={`p-4 rounded-xs bg-obsidian/40 border border-dashed cursor-pointer transition-all flex flex-col justify-between min-h-[220px] space-y-3 ${
                      isSelected
                        ? 'border-accent-gold ring-1 ring-accent-gold/40 bg-graphite/20'
                        : 'border-graphite-border/70 hover:border-graphite-border'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b border-graphite-border/30">
                      <div>
                        <span className="text-xs font-mono font-bold text-warm-white block">
                          {slot.bayNumber}
                        </span>
                        <span className="text-[11px] text-muted-dark truncate block">
                          {slot.bayName}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-xs bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-zinc-400 uppercase font-bold">
                        AVAILABLE
                      </span>
                    </div>

                    <div className="py-2 space-y-1">
                      <span className="text-[11px] font-mono text-accent-gold uppercase tracking-widest font-semibold block">
                        READY FOR VEHICLE INTAKE
                      </span>
                      <p className="text-xs text-muted font-mono leading-relaxed">
                        Bay is unassigned and ready for heavy mechanical or diagnostic work.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-graphite-border/20 flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTargetBaySelection(slot.bayNumber);
                          setAssignModalOpen(true);
                        }}
                        className="w-full py-2 bg-graphite border border-graphite-border hover:border-accent-gold/60 text-warm-white rounded-xs text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 min-h-[38px]"
                      >
                        <Plus className="w-3.5 h-3.5 text-accent-gold" />
                        <span>ASSIGN VEHICLE TO {slot.bayNumber}</span>
                      </button>
                    </div>
                  </div>
                );
              }

              // OCCUPIED BAY CARD (7 Information Rows)
              return (
                <div
                  key={slot.bayNumber}
                  data-testid={`bay-card-${slot.bayNumber.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => {
                    setSelectedBayNumber(slot.bayNumber);
                    setMobileDossierOpen(true);
                  }}
                  className={`p-4 rounded-xs bg-graphite/40 border transition-all cursor-pointer flex flex-col justify-between min-h-[260px] space-y-3 ${
                    isSelected
                      ? 'border-accent-gold bg-obsidian ring-1 ring-accent-gold/50 shadow-md'
                      : 'border-graphite-border hover:border-graphite-border/90'
                  }`}
                >
                  {/* Row 1: Bay ID + Stage Badge + Overdue Alert */}
                  <div className="flex items-center justify-between pb-2 border-b border-graphite-border/60">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-xs bg-obsidian border border-accent-gold/30 text-[10px] font-mono font-bold text-accent-gold">
                        {slot.bayNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-xs border text-[10px] font-mono font-bold uppercase tracking-wider ${config.badgeClass}`}>
                        {config.label}
                      </span>
                      {slot.isOverdue && (
                        <span className="px-1.5 py-0.5 rounded-xs bg-red-500/20 border border-red-500/40 text-red-400 text-[9px] font-mono font-bold uppercase animate-pulse">
                          OVERDUE
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs font-bold text-warm-white">
                      {job.id}
                    </span>
                  </div>

                  {/* Row 2: Vehicle & Registration */}
                  <div className="space-y-0.5">
                    <h2 className="text-sm sm:text-base font-bold text-warm-white leading-snug truncate">
                      {job.vehicle_summary}
                    </h2>
                    <div className="text-xs font-mono flex items-center gap-2 text-muted">
                      <span className="text-accent-gold font-bold">{job.registration}</span>
                      <span>·</span>
                      <span>{job.odometer ? `${job.odometer.toLocaleString()} km` : 'Odometer verified'}</span>
                    </div>
                  </div>

                  {/* Row 3: Customer & Phone */}
                  <div className="text-xs text-muted flex items-center gap-2">
                    <span className="text-warm-white font-medium">{job.customer_name}</span>
                    <span className="text-muted-dark">·</span>
                    <span className="font-mono text-[11px] text-muted-dark">{job.customer_phone}</span>
                  </div>

                  {/* Row 4: Technician & Advisor */}
                  <div className="text-[11px] font-mono text-muted flex items-center justify-between pt-1 border-t border-graphite-border/40">
                    <span className="flex items-center gap-1 truncate">
                      <User className="w-3 h-3 text-accent-gold shrink-0" />
                      <span>Tech: <strong className="text-warm-white">{job.technician || 'Unassigned'}</strong></span>
                    </span>
                    <span>Adv: <strong className="text-warm-white">{job.advisor}</strong></span>
                  </div>

                  {/* Row 5: Current Work */}
                  <div className="text-[11px] font-mono text-muted-dark truncate">
                    <span className="text-muted uppercase text-[10px] block">Active Service:</span>
                    <span className="text-warm-white truncate block">{job.service_name}</span>
                  </div>

                  {/* Row 6: Promised Delivery & Blocker Note */}
                  <div className="text-[11px] font-mono flex items-center justify-between pt-1 border-t border-graphite-border/40">
                    <div className="flex items-center gap-1 text-muted">
                      <Clock className="w-3 h-3 text-muted-dark shrink-0" />
                      <span>
                        Promised:{' '}
                        <strong className={slot.isOverdue ? 'text-red-400 font-bold' : 'text-warm-white'}>
                          {job.promised_completion
                            ? new Date(job.promised_completion).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                            : 'Today 18:00'}
                        </strong>
                      </span>
                    </div>

                    {slot.isWaiting && slot.blockerReason && (
                      <span className="text-[10px] text-amber-400 font-bold uppercase truncate max-w-[140px]">
                        {slot.blockerReason}
                      </span>
                    )}
                  </div>

                  {/* Row 7: Contextual Primary Action */}
                  <div className="pt-2 border-t border-graphite-border/40 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenJob(job.id);
                      }}
                      className="w-full py-2 bg-graphite border border-accent-gold/40 hover:bg-accent-gold hover:text-obsidian text-accent-gold rounded-xs text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 min-h-[38px]"
                    >
                      <span>OPEN JOB CARD →</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Secondary Floor Section 1: Quality Check Queue */}
          {qcQueueJobs.length > 0 && (
            <div data-testid="qc-queue-section" className="p-4 rounded-xs bg-obsidian border border-purple-500/30 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                <span className="text-purple-400 font-bold text-xs uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  QUALITY CHECK QUEUE · {qcQueueJobs.length} VEHICLE{qcQueueJobs.length > 1 ? 'S' : ''}
                </span>
                <span className="text-[10px] text-muted-dark uppercase">Pending Final Verification</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {qcQueueJobs.map((qj) => (
                  <div
                    key={qj.id}
                    className="p-3 rounded-xs bg-graphite/60 border border-graphite-border flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-warm-white font-bold">{qj.id}</span>
                        <span className="text-accent-gold">{qj.registration}</span>
                      </div>
                      <span className="text-muted text-[11px] block truncate max-w-[220px]">
                        {qj.vehicle_summary}
                      </span>
                      <span className="text-muted-dark text-[10px] block">
                        Tech: {qj.technician} · Bay: {qj.bay}
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenJob(qj.id)}
                      className="px-2.5 py-1.5 bg-graphite border border-purple-500/40 text-purple-300 hover:bg-purple-500 hover:text-white rounded-xs text-[10px] uppercase font-bold transition-colors shrink-0"
                    >
                      EXECUTE QC →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Secondary Floor Section 2: Ready for Collection Queue */}
          <div className="p-4 rounded-xs bg-obsidian border border-emerald-500/30 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
              <span className="text-emerald-400 font-bold text-xs uppercase flex items-center gap-1.5">
                <Truck className="w-4 h-4" />
                READY FOR COLLECTION STAGING · {readyCollectionJobs.length} VEHICLE{readyCollectionJobs.length !== 1 ? 'S' : ''}
              </span>
              <span className="text-[10px] text-muted-dark uppercase">Staged for Handover</span>
            </div>

            {readyCollectionJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {readyCollectionJobs.map((rj) => (
                  <div
                    key={rj.id}
                    className="p-3 rounded-xs bg-graphite/60 border border-graphite-border flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-warm-white font-bold">{rj.id}</span>
                        <span className="text-accent-gold">{rj.registration}</span>
                      </div>
                      <span className="text-muted text-[11px] block truncate max-w-[220px]">
                        {rj.vehicle_summary} ({rj.customer_name})
                      </span>
                      <span className="text-emerald-400 text-[10px] block">
                        Inspection & QC Passed · Bay: {rj.bay}
                      </span>
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => onOpenJob(rj.id)}
                        className="px-2 py-1.5 bg-graphite border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-obsidian rounded-xs text-[10px] uppercase font-bold transition-colors"
                      >
                        HANDOVER
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-3 px-3 rounded-xs bg-graphite/20 border border-dashed border-graphite-border/60 text-center">
                <span className="text-[11px] text-muted font-mono">
                  No vehicles currently staged for collection. Completed handovers are archived in Service History.
                </span>
              </div>
            )}
          </div>

          {/* Secondary Floor Section 3: Dedicated Unassigned Workshop Allocation Queue */}
          {(unassignedTechJobs.length > 0 || unassignedBayJobs.length > 0) && (
            <div data-testid="unassigned-workshop-allocation" className="p-4 rounded-xs bg-obsidian border border-blue-500/30 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-blue-500/20">
                <span className="text-blue-400 font-bold text-xs uppercase flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  UNASSIGNED WORKSHOP ALLOCATION
                </span>
                <span className="text-[10px] text-muted-dark uppercase">Resource Scheduling</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Subsection A: Unassigned Technician */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-accent-gold font-bold uppercase tracking-wider">
                      UNASSIGNED TECHNICIAN ({unassignedTechJobs.length})
                    </span>
                    <span className="text-[9px] text-muted-dark">Requires Lead Tech</span>
                  </div>
                  {unassignedTechJobs.length > 0 ? (
                    <div data-testid="unassigned-technicians-list" className="space-y-2">
                      {unassignedTechJobs.map((tj) => (
                        <div key={tj.id} className="p-2.5 rounded-xs bg-graphite/50 border border-graphite-border flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-warm-white font-bold">{tj.id}</span>
                              <span className="text-accent-gold">{tj.registration}</span>
                            </div>
                            <span className="text-[11px] text-muted block truncate max-w-[180px]">{tj.vehicle_summary}</span>
                            <span className="text-[10px] text-zinc-400 block">Bay: {tj.bay || 'UNASSIGNED'} · Tech: <strong className="text-amber-400">UNASSIGNED</strong></span>
                          </div>
                          <button
                            onClick={() => onOpenJob(tj.id)}
                            className="px-2 py-1 bg-graphite border border-accent-gold/50 text-accent-gold hover:bg-accent-gold hover:text-obsidian rounded-xs text-[10px] uppercase font-bold"
                          >
                            ASSIGN
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2 rounded-xs bg-graphite/20 border border-dashed border-graphite-border/40 text-[10px] text-muted text-center">
                      All active jobs have an assigned technician.
                    </div>
                  )}
                </div>

                {/* Subsection B: Unassigned Bay */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-accent-gold font-bold uppercase tracking-wider">
                      AWAITING BAY ALLOCATION ({unassignedBayJobs.length})
                    </span>
                    <span className="text-[9px] text-muted-dark">Bay Assignment</span>
                  </div>
                  {unassignedBayJobs.length > 0 ? (
                    <div data-testid="unassigned-bays-list" className="space-y-2">
                      {unassignedBayJobs.map((bj) => (
                        <div key={bj.id} className="p-2.5 rounded-xs bg-graphite/50 border border-graphite-border flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-warm-white font-bold">{bj.id}</span>
                              <span className="text-accent-gold">{bj.registration}</span>
                            </div>
                            <span className="text-[11px] text-muted block truncate max-w-[180px]">{bj.vehicle_summary}</span>
                            <span className="text-[10px] text-zinc-400 block">Tech: {bj.technician || 'Unassigned'} · Bay: <strong className="text-blue-400">UNASSIGNED</strong></span>
                            {bj.status === 'ESTIMATE_SENT' && (
                              <span className="text-[9px] text-amber-400 block uppercase">Customer Approval Pending</span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedAssignJobId(bj.id);
                              setAssignModalOpen(true);
                            }}
                            className="px-2 py-1 bg-graphite border border-blue-400/50 text-blue-300 hover:bg-blue-400 hover:text-obsidian rounded-xs text-[10px] uppercase font-bold"
                          >
                            ASSIGN BAY
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2 rounded-xs bg-graphite/20 border border-dashed border-graphite-border/40 text-[10px] text-muted text-center">
                      All active jobs are allocated to bays.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Secondary Floor Section 4: Operational Attention Panel */}
          {attentionItems.length > 0 && (
            <div data-testid="operational-attention-panel" className="p-4 rounded-xs bg-obsidian border border-graphite-border space-y-3 font-mono text-xs">
              <span className="text-[10px] uppercase tracking-wider text-accent-gold font-bold block">
                OPERATIONAL ATTENTION REQUIRED ({attentionItems.length})
              </span>

              <div className="space-y-2">
                {attentionItems.map((att) => (
                  <div
                    key={att.id}
                    data-testid={`attention-item-${att.jobId || att.id}`}
                    className="p-2.5 rounded-xs bg-graphite/40 border border-graphite-border flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`px-1.5 py-0.5 rounded-xs text-[9px] font-bold uppercase shrink-0 ${
                        att.level === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : att.level === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {att.badge}
                      </span>
                      <div className="truncate">
                        <span className="text-warm-white font-bold truncate block">{att.title}</span>
                        <span className="text-muted-dark text-[10px] truncate block">{att.subtitle}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (att.jobId) onOpenJob(att.jobId);
                        else if (att.actionType === 'BAY') setAssignModalOpen(true);
                      }}
                      className="text-xs text-accent-gold hover:underline font-bold shrink-0 uppercase"
                    >
                      {att.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: 35% OPERATIONS DOSSIER (STICKY / FULL-SCREEN)  */}
        {/* ============================================================ */}
        <div
          className={`lg:col-span-4 transition-all ${
            mobileDossierOpen
              ? 'fixed inset-0 z-50 bg-obsidian p-4 overflow-y-auto block lg:relative lg:inset-auto lg:p-0 lg:bg-transparent lg:z-auto'
              : 'hidden lg:block'
          }`}
        >
          {selectedBayItem ? (
            <div className="p-5 rounded-xs bg-graphite/40 border border-graphite-border space-y-6">
              
              {/* Mobile Back Button */}
              <div className="flex lg:hidden items-center justify-between pb-3 border-b border-graphite-border">
                <button
                  onClick={() => setMobileDossierOpen(false)}
                  className="px-3 py-1.5 bg-graphite border border-graphite-border text-xs font-mono uppercase text-warm-white flex items-center gap-1.5 min-h-[44px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>BACK TO WORKSHOP FLOOR</span>
                </button>
                <span className="font-mono text-xs font-bold text-accent-gold">
                  {selectedBayItem.bayNumber}
                </span>
              </div>

              {/* 1. Header: Bay & Operational State */}
              <div className="space-y-3 pb-4 border-b border-graphite-border">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block font-bold">
                      WORKSHOP OPERATIONS DOSSIER
                    </span>
                    <h2 className="text-xl font-mono font-bold text-warm-white">
                      {selectedBayItem.bayNumber}
                    </h2>
                  </div>

                  <span className={`px-2.5 py-1 rounded-xs border text-[10px] font-mono font-bold uppercase tracking-wider ${
                    STAGE_CONFIG[selectedBayItem.stageKey]?.badgeClass || STAGE_CONFIG.AVAILABLE.badgeClass
                  }`}>
                    {selectedBayItem.stageLabel}
                  </span>
                </div>

                <p className="text-xs text-muted font-mono">{selectedBayItem.bayName}</p>

                {/* Overdue alert in dossier */}
                {selectedBayItem.isOverdue && (
                  <div className="p-2.5 rounded-xs bg-red-500/15 border border-red-500/30 text-red-400 font-mono text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>OVERDUE: Service promise expired today. Requires immediate advisor intervention.</span>
                  </div>
                )}
              </div>

              {/* 2. Occupied Vehicle & Customer Context */}
              {activeDossierJob ? (
                <>
                  {/* Vehicle Identity */}
                  <div className="p-3.5 rounded-xs bg-obsidian border border-graphite-border space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-graphite-border/40">
                      <span className="text-[10px] uppercase text-muted-dark font-bold">VEHICLE & CUSTOMER</span>
                      <button
                        onClick={() => onOpenJob(activeDossierJob.id)}
                        className="text-[10px] text-accent-gold hover:underline uppercase"
                      >
                        OPEN JOB CARD →
                      </button>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-sm font-bold text-warm-white block font-sans">
                        {activeDossierJob.vehicle_summary}
                      </span>
                      <div className="flex items-center gap-2 text-muted text-[11px]">
                        <span className="text-accent-gold font-bold">{activeDossierJob.registration}</span>
                        <span>·</span>
                        <span>{activeDossierJob.odometer ? `${activeDossierJob.odometer.toLocaleString()} km` : 'Odometer verified'}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-graphite-border/40 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-muted-dark block text-[10px]">Customer</span>
                        <div className="flex items-center justify-between">
                          <span className="text-warm-white font-medium truncate">{activeDossierJob.customer_name}</span>
                          {onNavigateModule && (
                            <button
                              onClick={() => onNavigateModule('customers')}
                              className="text-[9px] text-accent-gold hover:underline uppercase shrink-0"
                            >
                              VIEW →
                            </button>
                          )}
                        </div>
                        <span className="text-muted block text-[10px]">{activeDossierJob.customer_phone}</span>
                      </div>
                      <div>
                        <span className="text-muted-dark block text-[10px]">Vehicle & Advisor</span>
                        <div className="flex items-center justify-between">
                          <span className="text-warm-white font-medium truncate">{activeDossierJob.advisor}</span>
                          {onNavigateModule && (
                            <button
                              onClick={() => onNavigateModule('vehicles')}
                              className="text-[9px] text-accent-gold hover:underline uppercase shrink-0"
                            >
                              VIEW →
                            </button>
                          )}
                        </div>
                        <span className="text-muted block text-[10px]">Priority: {activeDossierJob.priority || 'NORMAL'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Workshop Assignments (Bay & Tech) */}
                  <div className="p-3.5 rounded-xs bg-obsidian border border-graphite-border space-y-2.5 font-mono text-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-graphite-border/40">
                      <span className="text-[10px] uppercase text-muted-dark font-bold">WORKSHOP ASSIGNMENTS</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setTargetBaySelection(selectedBayItem.bayNumber);
                            setReassignBayModalOpen(true);
                          }}
                          className="text-[10px] text-accent-gold hover:underline uppercase"
                        >
                          REASSIGN BAY
                        </button>
                        <span>·</span>
                        <button
                          onClick={() => {
                            setTargetTechSelection(activeDossierJob.technician || 'Arjun Sharma');
                            setReassignTechModalOpen(true);
                          }}
                          className="text-[10px] text-accent-gold hover:underline uppercase"
                        >
                          REASSIGN TECH
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-muted-dark block text-[10px]">Current Bay</span>
                        <span data-testid="dossier-bay-name" className="text-warm-white font-bold">{activeDossierJob.bay}</span>
                      </div>
                      <div>
                        <span className="text-muted-dark block text-[10px]">Assigned Technician</span>
                        <span data-testid="dossier-tech-name" className="text-warm-white font-bold">{activeDossierJob.technician || 'Unassigned'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Current Active Work Scope */}
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-graphite-border">
                      <span className="text-[10px] uppercase text-muted block font-bold">
                        ACTIVE WORK ITEMS ({activeDossierJob.work_items?.length || 0})
                      </span>
                      <span className="text-accent-gold font-bold">₹{activeDossierJob.estimate_total?.toLocaleString() || 0}</span>
                    </div>

                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {(activeDossierJob.work_items || []).map((wi) => (
                        <div
                          key={wi.id}
                          className="p-2 rounded-xs bg-obsidian border border-graphite-border/60 flex items-center justify-between text-[11px]"
                        >
                          <div className="space-y-0.5 truncate pr-2">
                            <span className="text-warm-white block truncate">{wi.description}</span>
                            <span className="text-muted-dark text-[10px] uppercase">{wi.type} · {wi.quantity} {wi.unit}</span>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded-xs text-[9px] font-bold uppercase shrink-0 ${
                            wi.status === 'COMPLETED'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : wi.status === 'IN_PROGRESS'
                              ? 'bg-blue-500/15 text-blue-400'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {wi.status || 'APPROVED'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Promised Delivery & Target Time */}
                  <div className="p-3 rounded-xs bg-obsidian border border-graphite-border space-y-1.5 font-mono text-xs">
                    <span className="text-[10px] text-muted uppercase block">PROMISED COMPLETION COMMITMENT</span>
                    <div className="flex justify-between items-center">
                      <span className="text-warm-white font-bold text-sm">
                        {activeDossierJob.promised_completion
                          ? new Date(activeDossierJob.promised_completion).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                          : 'Today 18:00'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase ${
                        selectedBayItem.isOverdue
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {selectedBayItem.isOverdue ? 'OVERDUE' : 'ON TRACK'}
                      </span>
                    </div>
                  </div>

                  {/* Blocker Reason (only if waiting) */}
                  {selectedBayItem.isWaiting && selectedBayItem.blockerReason && (
                    <div className="p-3 rounded-xs bg-amber-500/10 border border-amber-500/30 space-y-1 font-mono text-xs">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10px] uppercase">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>OPERATIONAL BLOCKER / PAUSE</span>
                      </div>
                      <p className="text-warm-white text-[11px] leading-relaxed">
                        {selectedBayItem.blockerReason}
                      </p>
                      {activeDossierJob.waiting_since && (
                        <span className="text-muted-dark text-[10px] block">
                          Waiting since {new Date(activeDossierJob.waiting_since).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Operational Actions */}
                  <div className="space-y-2 pt-2 border-t border-graphite-border font-mono text-xs">
                    <button
                      onClick={() => onOpenJob(activeDossierJob.id)}
                      className="w-full py-2.5 px-3 bg-accent-gold text-obsidian rounded-xs text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>OPEN JOB CARD ({activeDossierJob.id}) →</span>
                    </button>

                    {selectedBayItem.isWaiting && (
                      <button
                        onClick={handleResumeWork}
                        className="w-full py-2 px-3 bg-emerald-500 text-obsidian rounded-xs text-xs font-bold uppercase tracking-wider hover:bg-emerald-400 transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>RESUME WORK ON FLOOR</span>
                      </button>
                    )}

                    {activeDossierJob.status === 'WORK_IN_PROGRESS' && (
                      <button
                        onClick={handleMoveToQC}
                        className="w-full py-2 px-3 bg-graphite border border-purple-500 text-purple-300 hover:bg-purple-500 hover:text-white rounded-xs text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>MOVE TO QUALITY CHECK</span>
                      </button>
                    )}

                    {onOpenCustomerView && activeDossierJob.public_token && (
                      <button
                        onClick={() => onOpenCustomerView(activeDossierJob.public_token)}
                        className="w-full py-2 px-3 bg-graphite border border-graphite-border text-muted hover:text-warm-white rounded-xs text-xs uppercase flex items-center justify-center gap-1.5 min-h-[40px]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>CUSTOMER TRACKING PORTAL</span>
                      </button>
                    )}
                  </div>

                  {/* Recent Activity / Audit */}
                  <div className="space-y-2 pt-2 border-t border-graphite-border font-mono text-xs">
                    <span className="text-[10px] uppercase text-muted block font-bold tracking-wider">
                      RECENT OPERATIONAL AUDIT
                    </span>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {(activeDossierJob.timeline || []).slice(-4).reverse().map((t) => (
                        <div
                          key={t.id}
                          className="p-2 rounded-xs bg-obsidian border border-graphite-border/60 text-[10px] space-y-0.5"
                        >
                          <div className="flex justify-between text-warm-white font-bold">
                            <span>{t.event_label}</span>
                            <span className="text-muted-dark">
                              {new Date(t.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <span className="text-muted block">{t.actor}</span>
                          {t.notes && <p className="text-muted-dark font-light">{t.notes}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Unassigned / Available Bay Dossier Details */
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-4 rounded-xs bg-obsidian border border-graphite-border space-y-2">
                    <span className="text-[10px] text-accent-gold font-bold uppercase block">
                      BAY CAPACITY STATUS
                    </span>
                    <p className="text-muted text-[11px] leading-relaxed">
                      {selectedBayItem.bayNumber} is currently unassigned. Suitable for diagnostic sweeps, suspension work, or routine maintenance.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setTargetBaySelection(selectedBayItem.bayNumber);
                      setAssignModalOpen(true);
                    }}
                    className="w-full py-2.5 px-3 bg-accent-gold text-obsidian font-bold uppercase rounded-xs text-xs flex items-center justify-center gap-1.5 min-h-[44px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ASSIGN VEHICLE TO THIS BAY</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-xs bg-graphite/20 border border-graphite-border text-center space-y-2">
              <Layers className="w-8 h-8 text-muted mx-auto opacity-50" />
              <span className="text-xs font-mono text-muted uppercase block">
                Select a bay to inspect operations dossier
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: ASSIGN VEHICLE TO WORKSHOP BAY                      */}
      {/* ============================================================ */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 bg-obsidian/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-graphite border border-accent-gold/40 rounded-xs p-6 max-w-lg w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block font-bold">
                  BAY ALLOCATION
                </span>
                <h3 className="text-base font-bold text-warm-white uppercase">
                  Assign Vehicle to Workshop Bay
                </h3>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="text-muted hover:text-warm-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignVehicleSubmit} className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-muted uppercase block text-[10px]">Select Job Card *</label>
                <select
                  value={selectedAssignJobId}
                  onChange={(e) => setSelectedAssignJobId(e.target.value)}
                  required
                  className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
                >
                  <option value="">-- Choose eligible vehicle job card --</option>
                  {activeJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.id} · {j.vehicle_summary} ({j.registration}) — Current: {j.bay || 'UNASSIGNED'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted uppercase block text-[10px]">Target Bay *</label>
                  <select
                    value={targetBaySelection}
                    onChange={(e) => setTargetBaySelection(e.target.value)}
                    required
                    className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
                  >
                    {STANDARD_BAYS.map((b) => (
                      <option key={b.bayNumber} value={b.bayNumber}>
                        {b.bayNumber} ({b.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted uppercase block text-[10px]">Technician Lead</label>
                  <select
                    value={targetTechSelection}
                    onChange={(e) => setTargetTechSelection(e.target.value)}
                    className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
                  >
                    {technicians.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.specialization})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-muted text-[11px]">
                This updates the authoritative bay allocation in the central Job Card store and logs an operational timeline event.
              </p>

              <div className="flex gap-2 pt-3 border-t border-graphite-border">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="flex-1 py-2.5 px-3 bg-graphite border border-graphite-border text-warm-white rounded-xs uppercase min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedAssignJobId}
                  className="flex-1 py-2.5 px-3 bg-accent-gold text-obsidian font-bold rounded-xs uppercase hover:bg-white transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  Confirm Bay Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: REASSIGN BAY                                        */}
      {/* ============================================================ */}
      {reassignBayModalOpen && activeDossierJob && (
        <div className="fixed inset-0 z-50 bg-obsidian/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-graphite border border-accent-gold/40 rounded-xs p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block font-bold">
                  BAY TRANSFER
                </span>
                <h3 className="text-base font-bold text-warm-white uppercase">
                  Reassign Bay for {activeDossierJob.id}
                </h3>
              </div>
              <button
                onClick={() => setReassignBayModalOpen(false)}
                className="text-muted hover:text-warm-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReassignBaySubmit} className="space-y-4 font-mono text-xs">
              <div className="p-3 rounded-xs bg-obsidian border border-graphite-border space-y-1">
                <div className="flex justify-between text-muted text-[11px]">
                  <span>Vehicle:</span>
                  <span className="text-warm-white font-bold">{activeDossierJob.vehicle_summary}</span>
                </div>
                <div className="flex justify-between text-muted text-[11px]">
                  <span>Current Bay:</span>
                  <span className="text-accent-gold font-bold">{activeDossierJob.bay}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted uppercase block text-[10px]">Select New Bay *</label>
                <select
                  value={targetBaySelection}
                  onChange={(e) => setTargetBaySelection(e.target.value)}
                  className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white min-h-[40px]"
                >
                  {STANDARD_BAYS.map((b) => (
                    <option key={b.bayNumber} value={b.bayNumber}>
                      {b.bayNumber} · {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-muted uppercase block text-[10px]">Reason for Transfer</label>
                <input
                  type="text"
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="e.g. Cleared for suspension lift, moved to alignment rack"
                  className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white min-h-[40px]"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-graphite-border">
                <button
                  type="button"
                  onClick={() => setReassignBayModalOpen(false)}
                  className="flex-1 py-2.5 px-3 bg-graphite border border-graphite-border text-warm-white rounded-xs uppercase min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 bg-accent-gold text-obsidian font-bold rounded-xs uppercase hover:bg-white min-h-[44px]"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: REASSIGN TECHNICIAN                                 */}
      {/* ============================================================ */}
      {reassignTechModalOpen && activeDossierJob && (
        <div className="fixed inset-0 z-50 bg-obsidian/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-graphite border border-accent-gold/40 rounded-xs p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block font-bold">
                  TECHNICIAN REALLOCATION
                </span>
                <h3 className="text-base font-bold text-warm-white uppercase">
                  Assign Lead Tech for {activeDossierJob.id}
                </h3>
              </div>
              <button
                onClick={() => setReassignTechModalOpen(false)}
                className="text-muted hover:text-warm-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReassignTechSubmit} className="space-y-4 font-mono text-xs">
              <div className="p-3 rounded-xs bg-obsidian border border-graphite-border space-y-1">
                <div className="flex justify-between text-muted text-[11px]">
                  <span>Vehicle:</span>
                  <span className="text-warm-white font-bold">{activeDossierJob.vehicle_summary}</span>
                </div>
                <div className="flex justify-between text-muted text-[11px]">
                  <span>Current Lead Tech:</span>
                  <span className="text-warm-white font-bold">{activeDossierJob.technician || 'Unassigned'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted uppercase block text-[10px]">Available Technicians *</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {technicians.map((t) => {
                    const isSelected = targetTechSelection === t.name;
                    return (
                      <div
                        key={t.id}
                        data-testid={`tech-select-option-${t.id}`}
                        onClick={() => setTargetTechSelection(t.name)}
                        className={`p-2.5 rounded-xs border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-accent-gold/15 border-accent-gold text-accent-gold font-bold'
                            : 'bg-obsidian border-graphite-border text-muted hover:text-warm-white'
                        }`}
                      >
                        <div>
                          <span className="block font-medium">{t.name}</span>
                          <span className="text-[10px] text-muted-dark block">{t.specialization}</span>
                        </div>
                        <span className="text-[10px] font-mono">{t.status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-graphite-border">
                <button
                  type="button"
                  onClick={() => setReassignTechModalOpen(false)}
                  className="flex-1 py-2.5 px-3 bg-graphite border border-graphite-border text-warm-white rounded-xs uppercase min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 bg-accent-gold text-obsidian font-bold rounded-xs uppercase hover:bg-white min-h-[44px]"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
