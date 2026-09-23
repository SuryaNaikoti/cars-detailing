import React, { useState, useMemo } from 'react';
import type { TechnicianRecord, JobCard, VehicleRecord } from '../../types';
import {
  Wrench,
  Search,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  X,
  Car,
  ChevronRight,
  ShieldCheck,
  Filter,
  ArrowUpDown,
  ArrowLeft,
} from 'lucide-react';
import { assignTechnicianToJob } from '../../lib/demoStore';

export interface TechniciansViewProps {
  technicians: TechnicianRecord[];
  jobs: JobCard[];
  vehicles?: VehicleRecord[];
  onOpenJob: (jobId: string) => void;
  onNavigateModule?: (module: any) => void;
  onRefreshStore?: () => void;
}

export const TechniciansView: React.FC<TechniciansViewProps> = ({
  technicians,
  jobs,
  vehicles: _vehicles = [],
  onOpenJob,
  onNavigateModule,
  onRefreshStore,
}) => {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'BUSY' | 'ON_BREAK'>('ALL');
  const [specFilter, setSpecFilter] = useState<string>('ALL');
  const [bayFilter, setBayFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'WORKLOAD' | 'NAME_ASC' | 'NAME_DESC' | 'STATUS'>('WORKLOAD');

  // Selected technician for dossier
  const [selectedTechId, setSelectedTechId] = useState<string>(technicians[0]?.id || 'tech-1');
  const [mobileDossierOpen, setMobileDossierOpen] = useState(false);

  // Assign job modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [modalSelectedJobId, setModalSelectedJobId] = useState<string>('');
  const [modalSelectedTechName, setModalSelectedTechName] = useState<string>(technicians[0]?.name || 'Arjun Sharma');
  const [modalReason, setModalReason] = useState<string>('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Helper to determine if a job is active (not delivered and not cancelled)
  const isJobActive = (job: JobCard) => job.status !== 'DELIVERED' && job.status !== 'CANCELLED';

  // Active jobs on the workshop floor
  const activeJobs = useMemo(() => jobs.filter(isJobActive), [jobs]);

  // Derived unique specializations
  const specializations = useMemo(() => {
    const set = new Set<string>();
    technicians.forEach((t) => {
      if (t.specialization) set.add(t.specialization);
    });
    return Array.from(set);
  }, [technicians]);

  // Derived unique occupied bays
  const activeBays = useMemo(() => {
    const set = new Set<string>();
    activeJobs.forEach((j) => {
      if (j.bay && j.bay !== 'UNASSIGNED') set.add(j.bay);
    });
    return Array.from(set).sort();
  }, [activeJobs]);

  // Map jobs to technicians reliably using canonical technician name or ID
  const getJobsForTech = (tech: TechnicianRecord) => {
    const firstName = tech.name.toLowerCase().split(' ')[0];
    return activeJobs.filter((j) => {
      if (!j.technician || j.technician.toLowerCase() === 'unassigned') return false;
      const jTech = j.technician.toLowerCase().trim();
      return jTech === tech.name.toLowerCase().trim() || jTech.includes(firstName) || jTech === tech.id.toLowerCase();
    });
  };

  // Canonical Dynamic Unassigned jobs queue
  const unassignedJobs = useMemo(() => {
    return activeJobs.filter(
      (j) => !j.technician || j.technician.toLowerCase() === 'unassigned' || j.technician.trim() === ''
    );
  }, [activeJobs]);

  // Canonical QC Queue jobs
  const qcJobs = useMemo(() => {
    return activeJobs.filter((j) => j.status === 'QUALITY_CHECK');
  }, [activeJobs]);

  // Operational KPI calculations (derived from canonical records)
  const kpis = useMemo(() => {
    const totalStaff = technicians.length;
    let availableCount = 0;
    let busyCount = 0;
    let onBreakCount = 0;
    let overloadCount = 0;

    technicians.forEach((tech) => {
      const assigned = getJobsForTech(tech);

      if (tech.status === 'ON_BREAK') {
        onBreakCount++;
      } else if (assigned.length > 0 || tech.status === 'BUSY') {
        busyCount++;
      } else {
        availableCount++;
      }

      // Overload definition (Section 10): active assigned jobs > 1
      if (assigned.length > 1) {
        overloadCount++;
      }
    });

    return {
      totalStaff,
      available: availableCount,
      busy: busyCount,
      onBreak: onBreakCount,
      // Section 9: ACTIVE JOBS must represent the number of active Job Cards (not summing technician counters)
      activeJobs: activeJobs.length,
      // Section 15: QC Queue derived from active jobs with status QUALITY_CHECK
      qcQueue: qcJobs.length,
      // Section 8: UNASSIGNED JOBS must equal unassigned active jobs
      unassignedJobs: unassignedJobs.length,
      // Section 10: OVERLOAD must equal number of technicians with >1 active assigned jobs
      overload: overloadCount,
    };
  }, [technicians, activeJobs, qcJobs, unassignedJobs]);

  // Filter and sort technicians
  const filteredTechnicians = useMemo(() => {
    return technicians
      .filter((tech) => {
        const assigned = getJobsForTech(tech);
        const query = searchQuery.toLowerCase().trim();

        // Search match across technician, specialization, job ID, vehicle summary, registration
        const matchesQuery =
          !query ||
          tech.name.toLowerCase().includes(query) ||
          tech.specialization.toLowerCase().includes(query) ||
          tech.phone.toLowerCase().includes(query) ||
          assigned.some(
            (j) =>
              j.id.toLowerCase().includes(query) ||
              j.vehicle_summary.toLowerCase().includes(query) ||
              j.registration.toLowerCase().includes(query) ||
              j.service_name.toLowerCase().includes(query)
          );

        if (!matchesQuery) return false;

        // Status Filter
        if (statusFilter !== 'ALL') {
          if (statusFilter === 'ON_BREAK' && tech.status !== 'ON_BREAK') return false;
          if (statusFilter === 'BUSY' && assigned.length === 0 && tech.status !== 'BUSY') return false;
          if (statusFilter === 'AVAILABLE' && (assigned.length > 0 || tech.status === 'ON_BREAK')) return false;
        }

        // Specialization Filter
        if (specFilter !== 'ALL' && tech.specialization !== specFilter) {
          return false;
        }

        // Bay Filter
        if (bayFilter !== 'ALL') {
          const inBay = assigned.some((j) => j.bay === bayFilter);
          if (!inBay) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const aJobs = getJobsForTech(a).length;
        const bJobs = getJobsForTech(b).length;

        if (sortBy === 'WORKLOAD') {
          return bJobs - aJobs; // Highest workload first
        }
        if (sortBy === 'NAME_ASC') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'NAME_DESC') {
          return b.name.localeCompare(a.name);
        }
        if (sortBy === 'STATUS') {
          return a.status.localeCompare(b.status);
        }
        return 0;
      });
  }, [technicians, activeJobs, searchQuery, statusFilter, specFilter, bayFilter, sortBy]);

  // Selected technician record
  const selectedTech = useMemo(() => {
    return technicians.find((t) => t.id === selectedTechId) || technicians[0] || null;
  }, [technicians, selectedTechId]);

  const selectedTechJobs = useMemo(() => {
    if (!selectedTech) return [];
    return getJobsForTech(selectedTech);
  }, [selectedTech, activeJobs]);

  // Completed jobs by technician from historical records
  const completedJobsCount = useMemo(() => {
    if (!selectedTech) return 0;
    const firstName = selectedTech.name.toLowerCase().split(' ')[0];
    return jobs.filter((j) => {
      if (j.status !== 'DELIVERED') return false;
      const jTech = (j.technician || '').toLowerCase();
      return jTech.includes(firstName);
    }).length;
  }, [selectedTech, jobs]);

  // Current primary bay of selected technician
  const selectedTechBay = useMemo(() => {
    if (!selectedTechJobs.length) return 'NOT ASSIGNED';
    const bays = selectedTechJobs.map((j) => j.bay).filter((b) => b && b !== 'UNASSIGNED');
    return bays.length > 0 ? bays[0] : 'NOT ASSIGNED';
  }, [selectedTechJobs]);

  // WhatsApp contextual deep link
  const getWhatsAppLink = (tech: TechnicianRecord) => {
    const rawDigits = tech.phone.replace(/[^0-9]/g, '');
    const cleanPhone = rawDigits.startsWith('91') ? rawDigits : `91${rawDigits}`;
    const assigned = getJobsForTech(tech);
    const jobRef = assigned[0]?.id ? ` regarding active job ${assigned[0].id}` : '';
    const text = encodeURIComponent(`Hi ${tech.name}, dispatch update from Workshop Floor${jobRef}.`);
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  // Handle opening Assign Modal
  const handleOpenAssignModal = (preselectedJobId?: string) => {
    if (preselectedJobId) {
      setModalSelectedJobId(preselectedJobId);
    } else if (unassignedJobs.length > 0) {
      setModalSelectedJobId(unassignedJobs[0].id);
    } else if (activeJobs.length > 0) {
      setModalSelectedJobId(activeJobs[0].id);
    } else {
      setModalSelectedJobId('');
    }
    setModalSelectedTechName(technicians[0]?.name || 'Arjun Sharma');
    setModalReason('');
    setAssignModalOpen(true);
  };

  // Handle Confirm Assignment
  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalSelectedJobId || !modalSelectedTechName) return;

    const res = assignTechnicianToJob(
      modalSelectedJobId,
      modalSelectedTechName,
      modalReason || 'Dispatched via Technicians & Workforce console',
      'Rohan Deshmukh (Advisor)'
    );

    if (res.success) {
      showToast(`TECHNICIAN ASSIGNED: ${modalSelectedJobId} assigned to ${modalSelectedTechName}.`);
      setAssignModalOpen(false);
      if (onRefreshStore) onRefreshStore();
    } else {
      showToast(`Assignment failed: ${res.error || 'Unknown error'}`);
    }
  };

  // Render Status Badge
  const renderStatusBadge = (status: string, activeCount: number) => {
    if (status === 'ON_BREAK') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs text-[10px] font-mono uppercase font-bold bg-graphite-border/60 text-muted border border-graphite-border">
          <span className="w-1.5 h-1.5 rounded-full bg-muted"></span>
          ON BREAK
        </span>
      );
    }
    if (activeCount > 0 || status === 'BUSY') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs text-[10px] font-mono uppercase font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          BUSY
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs text-[10px] font-mono uppercase font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        AVAILABLE
      </span>
    );
  };

  // Render Service Stage Badge
  const renderStageBadge = (stage: string) => {
    let color = 'bg-graphite text-muted border-graphite-border';
    if (stage === 'WORK_IN_PROGRESS') color = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    if (stage === 'QUALITY_CHECK') color = 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    if (stage === 'READY_FOR_COLLECTION') color = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (stage === 'VEHICLE_RECEIVED') color = 'bg-slate-500/15 text-slate-300 border-slate-500/30';

    return (
      <span className={`px-2 py-0.5 rounded-xs text-[9px] font-mono uppercase font-bold border ${color}`}>
        {stage.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 bg-graphite border border-accent-gold px-4 py-3 rounded-xs shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
          <span className="text-xs font-mono font-medium text-warm-white">{toastMessage}</span>
        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/* 1. HEADER                                                    */}
      {/* ------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-graphite-border">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block font-semibold">
            WORKSHOP STAFF & EXECUTION
          </span>
          <h1 className="text-2xl font-black uppercase tracking-tight text-warm-white mt-0.5">
            TECHNICIANS & WORKFORCE
          </h1>
          <p className="text-xs text-muted font-light mt-0.5">
            Technical specialists, workload distribution and active workshop execution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenAssignModal()}
            className="min-h-[44px] px-4 py-2.5 rounded-xs bg-accent-gold hover:bg-accent-gold/90 text-obsidian font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ ASSIGN JOB</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* 2. OPERATIONAL KPI STRIP                                     */}
      {/* ------------------------------------------------------------ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div data-testid="kpi-total-staff" className="p-3 bg-graphite/40 border border-graphite-border rounded-xs">
          <span className="text-[9px] font-mono uppercase text-muted tracking-wider block">TOTAL STAFF</span>
          <span className="text-xl font-mono font-black text-warm-white mt-1 block">{kpis.totalStaff}</span>
          <span className="text-[9px] text-muted-dark font-mono block mt-0.5">Certified Crew</span>
        </div>

        <div data-testid="kpi-available" className="p-3 bg-graphite/40 border border-graphite-border rounded-xs">
          <span className="text-[9px] font-mono uppercase text-emerald-400/90 tracking-wider block">AVAILABLE</span>
          <span className="text-xl font-mono font-black text-emerald-400 mt-1 block">{kpis.available}</span>
          <span className="text-[9px] text-muted-dark font-mono block mt-0.5">Ready for work</span>
        </div>

        <div data-testid="kpi-busy" className="p-3 bg-graphite/40 border border-graphite-border rounded-xs">
          <span className="text-[9px] font-mono uppercase text-amber-400/90 tracking-wider block">BUSY</span>
          <span className="text-xl font-mono font-black text-amber-400 mt-1 block">{kpis.busy}</span>
          <span className="text-[9px] text-muted-dark font-mono block mt-0.5">On Active Bay</span>
        </div>

        <div data-testid="kpi-on-break" className="p-3 bg-graphite/40 border border-graphite-border rounded-xs">
          <span className="text-[9px] font-mono uppercase text-muted tracking-wider block">ON BREAK</span>
          <span className="text-xl font-mono font-black text-warm-white mt-1 block">{kpis.onBreak}</span>
          <span className="text-[9px] text-muted-dark font-mono block mt-0.5">Off floor</span>
        </div>

        <div data-testid="kpi-active-jobs" className="p-3 bg-graphite/40 border border-graphite-border rounded-xs">
          <span className="text-[9px] font-mono uppercase text-accent-gold tracking-wider block">ACTIVE JOBS</span>
          <span className="text-xl font-mono font-black text-accent-gold mt-1 block">{kpis.activeJobs}</span>
          <span className="text-[9px] text-muted-dark font-mono block mt-0.5">In execution</span>
        </div>

        <div data-testid="kpi-qc-queue" className="p-3 bg-graphite/40 border border-graphite-border rounded-xs">
          <span className="text-[9px] font-mono uppercase text-blue-400 tracking-wider block">QC QUEUE</span>
          <span className="text-xl font-mono font-black text-blue-400 mt-1 block">{kpis.qcQueue}</span>
          <span className="text-[9px] text-muted-dark font-mono block mt-0.5">Awaiting test</span>
        </div>

        <div data-testid="kpi-unassigned-jobs" className="p-3 bg-graphite/40 border border-graphite-border rounded-xs">
          <span className="text-[9px] font-mono uppercase text-orange-400 tracking-wider block">UNASSIGNED JOBS</span>
          <span className="text-xl font-mono font-black text-orange-400 mt-1 block">{kpis.unassignedJobs}</span>
          <span className="text-[9px] text-muted-dark font-mono block mt-0.5">Requires tech</span>
        </div>

        <div data-testid="kpi-overload" className="p-3 bg-graphite/40 border border-graphite-border rounded-xs">
          <span className="text-[9px] font-mono uppercase text-red-400 tracking-wider block">OVERLOAD</span>
          <span className="text-xl font-mono font-black text-warm-white mt-1 block">{kpis.overload}</span>
          <span className="text-[9px] text-muted-dark font-mono block mt-0.5">≥ 2 active jobs</span>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* 3. WORKFORCE SEARCH + FILTER BAR                             */}
      {/* ------------------------------------------------------------ */}
      <div className="p-3.5 bg-graphite/30 border border-graphite-border rounded-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-dark absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="SEARCH TECHNICIAN / JOB / VEHICLE / REGISTRATION..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-obsidian border border-graphite-border rounded-xs pl-9 pr-3 py-2 text-xs font-mono text-warm-white placeholder:text-muted-dark focus:outline-none focus:border-accent-gold transition-colors min-h-[44px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-warm-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-obsidian border border-graphite-border px-2.5 py-1 rounded-xs min-h-[44px]">
            <Filter className="w-3.5 h-3.5 text-muted-dark shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-xs font-mono text-warm-white focus:outline-none cursor-pointer pr-2"
            >
              <option value="ALL" className="bg-graphite text-warm-white">ALL STATUS</option>
              <option value="AVAILABLE" className="bg-graphite text-emerald-400">AVAILABLE</option>
              <option value="BUSY" className="bg-graphite text-amber-400">BUSY</option>
              <option value="ON_BREAK" className="bg-graphite text-muted">ON BREAK</option>
            </select>
          </div>

          {/* Specialization Filter */}
          <div className="flex items-center gap-1.5 bg-obsidian border border-graphite-border px-2.5 py-1 rounded-xs min-h-[44px]">
            <Wrench className="w-3.5 h-3.5 text-muted-dark shrink-0" />
            <select
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
              className="bg-transparent text-xs font-mono text-warm-white focus:outline-none cursor-pointer max-w-[150px] truncate pr-2"
            >
              <option value="ALL" className="bg-graphite text-warm-white">ALL SPECIALIZATIONS</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec} className="bg-graphite text-warm-white">
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Bay Filter */}
          <div className="flex items-center gap-1.5 bg-obsidian border border-graphite-border px-2.5 py-1 rounded-xs min-h-[44px]">
            <span className="text-[10px] font-mono text-muted-dark font-bold">BAY</span>
            <select
              value={bayFilter}
              onChange={(e) => setBayFilter(e.target.value)}
              className="bg-transparent text-xs font-mono text-warm-white focus:outline-none cursor-pointer pr-2"
            >
              <option value="ALL" className="bg-graphite text-warm-white">ALL BAYS</option>
              {activeBays.map((bay) => (
                <option key={bay} value={bay} className="bg-graphite text-warm-white">
                  {bay}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-obsidian border border-graphite-border px-2.5 py-1 rounded-xs min-h-[44px]">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-dark shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-mono text-warm-white focus:outline-none cursor-pointer pr-2"
            >
              <option value="WORKLOAD" className="bg-graphite text-warm-white">SORT: WORKLOAD</option>
              <option value="NAME_ASC" className="bg-graphite text-warm-white">NAME A-Z</option>
              <option value="NAME_DESC" className="bg-graphite text-warm-white">NAME Z-A</option>
              <option value="STATUS" className="bg-graphite text-warm-white">STATUS</option>
            </select>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* 4. WORKSPACE CONTENT (DESKTOP 65% / 35% SPLIT)               */}
      {/* ------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: 65% (lg:col-span-8 or 7-8) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Section: Workforce Queue */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-warm-white font-bold tracking-wider">
                  Active Specialist Roster
                </span>
                <span className="px-2 py-0.5 rounded-xs bg-graphite border border-graphite-border text-[10px] font-mono text-muted">
                  {filteredTechnicians.length} Specialists
                </span>
              </div>
            </div>

            {filteredTechnicians.length === 0 ? (
              <div className="p-8 bg-graphite/20 border border-graphite-border rounded-xs text-center space-y-2">
                <Wrench className="w-8 h-8 text-muted mx-auto opacity-50" />
                <p className="text-sm font-mono text-warm-white font-bold uppercase">No Specialists Match Filter</p>
                <p className="text-xs text-muted">Adjust search terms, specializations, or status selections.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setSpecFilter('ALL');
                    setBayFilter('ALL');
                  }}
                  className="mt-3 px-3 py-1.5 rounded-xs bg-graphite border border-graphite-border text-xs font-mono text-accent-gold hover:border-accent-gold"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              /* Two-Column Workforce Grid on Desktop, Vertical on Mobile */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTechnicians.map((tech) => {
                  const assignedJobs = getJobsForTech(tech);
                  const isSelected = selectedTech?.id === tech.id;

                  return (
                    <div
                      key={tech.id}
                      data-testid={`tech-card-${tech.id}`}
                      onClick={() => {
                        setSelectedTechId(tech.id);
                        if (window.innerWidth < 1024) {
                          setMobileDossierOpen(true);
                        }
                      }}
                      className={`p-4 rounded-xs bg-graphite/40 border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                        isSelected
                          ? 'border-accent-gold ring-1 ring-accent-gold/40 shadow-lg'
                          : 'border-graphite-border hover:border-graphite-border/80'
                      }`}
                    >
                      {/* Top: Avatar, Name, Specialization, Status */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-graphite-border">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-accent-gold/15 border border-accent-gold/30 flex items-center justify-center text-accent-gold font-mono font-bold text-xs shrink-0">
                            {tech.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-warm-white truncate">{tech.name}</h3>
                            <p className="text-[11px] text-muted font-mono truncate">{tech.specialization}</p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {renderStatusBadge(tech.status, assignedJobs.length)}
                        </div>
                      </div>

                      {/* Middle: Phone & Workload Meta */}
                      <div className="grid grid-cols-2 gap-3 text-xs py-1">
                        <div>
                          <span className="text-[9px] text-muted-dark uppercase font-mono block">Direct Contact</span>
                          <span className="font-mono text-warm-white text-[11px] truncate block">{tech.phone}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-muted-dark uppercase font-mono block">Active Floor Workload</span>
                          <span data-testid="tech-card-workload" className="font-mono text-accent-gold font-bold text-[11px]">
                            {assignedJobs.length} Assigned {assignedJobs.length === 1 ? 'Job' : 'Jobs'}
                          </span>
                        </div>
                      </div>

                      {/* Assigned Service Jobs */}
                      <div className="space-y-2 pt-3 border-t border-graphite-border">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase text-muted-dark tracking-wider block">
                            Assigned Service Jobs
                          </span>
                          {assignedJobs.length > 0 && (
                            <span className="text-[9px] font-mono text-muted">
                              {!assignedJobs[0].bay || assignedJobs[0].bay === 'UNASSIGNED' ? 'BAY: UNASSIGNED' : `Bay: ${assignedJobs[0].bay}`}
                            </span>
                          )}
                        </div>

                        {assignedJobs.length === 0 ? (
                          <div className="p-3 rounded-xs bg-obsidian/60 border border-graphite-border/60 text-center space-y-1.5">
                            <p className="text-[11px] text-muted font-mono">NO ACTIVE ASSIGNMENTS</p>
                            <p className="text-[10px] text-muted-dark">This technician currently has no active service jobs.</p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalSelectedTechName(tech.name);
                                handleOpenAssignModal();
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono font-bold uppercase text-accent-gold border border-accent-gold/40 hover:bg-accent-gold/10 rounded-xs transition-colors min-h-[36px]"
                            >
                              <Plus className="w-3 h-3" />
                              ASSIGN JOB
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {assignedJobs.map((job) => (
                              <div
                                key={job.id}
                                className="p-2.5 rounded-xs bg-obsidian border border-graphite-border hover:border-accent-gold/60 transition-colors space-y-2"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono font-bold text-accent-gold text-xs shrink-0">
                                      {job.id}
                                    </span>
                                    <span className="text-warm-white font-medium text-xs truncate">
                                      {job.vehicle_summary}
                                    </span>
                                  </div>
                                  <span className="font-mono text-[10px] text-muted shrink-0">
                                    {job.registration}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-1 border-t border-graphite-border/60">
                                  <span className="text-[10px] font-mono text-warm-white font-semibold">
                                    {!job.bay || job.bay === 'UNASSIGNED' ? 'BAY: UNASSIGNED' : job.bay}
                                  </span>
                                  {renderStageBadge(job.status)}
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenJob(job.id);
                                    }}
                                    className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase text-warm-white bg-graphite border border-graphite-border hover:border-accent-gold rounded-xs transition-colors min-h-[36px] flex items-center gap-1"
                                  >
                                    OPEN JOB CARD
                                    <ChevronRight className="w-3 h-3 text-accent-gold" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onNavigateModule) onNavigateModule('vehicles');
                                    }}
                                    className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase text-muted hover:text-warm-white bg-graphite/40 border border-graphite-border rounded-xs transition-colors min-h-[36px] flex items-center gap-1"
                                  >
                                    <Car className="w-3 h-3" />
                                    VIEW VEHICLE
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Quick Select Detail Indicator */}
                      <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-muted-dark border-t border-graphite-border/40">
                        <span>ID: {tech.id}</span>
                        <span className="text-accent-gold flex items-center gap-1">
                          View Dossier <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: UNASSIGNED JOBS QUEUE */}
          <div data-testid="unassigned-jobs-queue" className="p-4 rounded-xs bg-graphite/30 border border-graphite-border space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-graphite-border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <h3 className="text-xs font-mono uppercase text-warm-white font-bold tracking-wider">
                  UNASSIGNED JOBS
                </h3>
                <span className="px-2 py-0.5 rounded-xs bg-orange-500/10 border border-orange-500/30 text-[10px] font-mono text-orange-400 font-bold">
                  {unassignedJobs.length}
                </span>
              </div>
              <span className="text-[10px] text-muted font-mono">
                {unassignedJobs.length > 0 ? 'Requires Specialist Allocation' : 'Queue Clear'}
              </span>
            </div>

            {unassignedJobs.length === 0 ? (
              <div className="p-4 text-center rounded-xs bg-obsidian/40 border border-graphite-border/60">
                <p className="text-xs font-mono text-warm-white font-bold">ALL ACTIVE JOBS ASSIGNED</p>
                <p className="text-[11px] text-muted mt-0.5">
                  No active Job Cards are currently waiting for technician assignment.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {unassignedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3 rounded-xs bg-obsidian border border-orange-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-accent-gold text-xs">{job.id}</span>
                        <span className="font-semibold text-warm-white text-xs">{job.vehicle_summary}</span>
                        <span className="font-mono text-[10px] text-muted">({job.registration})</span>
                      </div>
                      <p className="text-[11px] text-muted mt-0.5">{job.service_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-muted-dark">Customer: {job.customer_name}</span>
                        <span className="text-[10px] font-mono text-muted-dark">·</span>
                        <span className="text-[10px] font-mono text-orange-400">Bay: {job.bay || 'UNASSIGNED'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenAssignModal(job.id)}
                        className="min-h-[44px] px-3.5 py-2 rounded-xs bg-accent-gold text-obsidian font-mono font-bold text-xs uppercase tracking-wider hover:bg-accent-gold/90 transition-colors flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        ASSIGN TECHNICIAN
                      </button>

                      <button
                        onClick={() => onOpenJob(job.id)}
                        className="min-h-[44px] px-3 py-2 rounded-xs bg-graphite border border-graphite-border text-warm-white font-mono text-xs uppercase hover:border-accent-gold transition-colors"
                      >
                        OPEN JOB
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: QC QUEUE */}
          <div className="p-4 rounded-xs bg-graphite/30 border border-graphite-border space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-graphite-border">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-mono uppercase text-warm-white font-bold tracking-wider">
                  QC QUEUE (QUALITY CHECK)
                </h3>
                <span className="px-2 py-0.5 rounded-xs bg-blue-500/10 border border-blue-500/30 text-[10px] font-mono text-blue-400 font-bold">
                  {qcJobs.length}
                </span>
              </div>
              <span className="text-[10px] text-muted font-mono">
                {qcJobs.length > 0 ? 'Vehicles Awaiting Quality Verification' : 'Queue Clear'}
              </span>
            </div>

            {qcJobs.length === 0 ? (
              <div className="p-4 text-center rounded-xs bg-obsidian/40 border border-graphite-border/60">
                <p className="text-xs font-mono text-warm-white font-bold">QC QUEUE CLEAR</p>
                <p className="text-[11px] text-muted mt-0.5">
                  No vehicles are currently awaiting quality check.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {qcJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3 rounded-xs bg-obsidian border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-accent-gold text-xs">{job.id}</span>
                        <span className="font-semibold text-warm-white text-xs">{job.vehicle_summary}</span>
                        <span className="font-mono text-[10px] text-muted">({job.registration})</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted mt-0.5">
                        <span>Lead Tech: <strong className="text-warm-white">{job.technician}</strong></span>
                        <span>·</span>
                        <span>Location: <strong className="text-accent-gold">{job.bay || 'BAY 02'}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-1 rounded-xs bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold uppercase">
                        QUALITY CHECK
                      </span>
                      <button
                        onClick={() => onOpenJob(job.id)}
                        className="min-h-[44px] px-3.5 py-2 rounded-xs bg-graphite border border-graphite-border text-warm-white font-mono font-bold text-xs uppercase hover:border-accent-gold transition-colors flex items-center gap-1.5"
                      >
                        OPEN JOB CARD
                        <ChevronRight className="w-3.5 h-3.5 text-accent-gold" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: 35% STICKY TECHNICIAN DOSSIER (DESKTOP) */}
        <div className="hidden lg:block lg:col-span-4 sticky top-20 space-y-4">
          {selectedTech ? (
            <div data-testid="technician-dossier" className="p-5 rounded-xs bg-graphite/40 border border-graphite-border space-y-5">
              
              {/* Dossier Header */}
              <div className="pb-4 border-b border-graphite-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-accent-gold tracking-widest uppercase font-bold">
                    TECHNICIAN PROFILE
                  </span>
                  <span className="text-[10px] font-mono text-muted">
                    ID: {selectedTech.id}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent-gold/15 border border-accent-gold/30 flex items-center justify-center text-accent-gold font-mono font-bold text-sm shrink-0">
                    {selectedTech.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-base font-black text-warm-white tracking-tight">{selectedTech.name}</h2>
                    <p className="text-xs text-muted font-mono mt-0.5">{selectedTech.specialization}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {renderStatusBadge(selectedTech.status, selectedTechJobs.length)}
                  <span className="text-xs font-mono text-muted-dark">{selectedTech.phone}</span>
                </div>
              </div>

              {/* Current Status & Bay Assignment */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-muted-dark tracking-wider block">
                  CURRENT STATUS
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-obsidian border border-graphite-border rounded-xs">
                    <span className="text-[9px] font-mono text-muted uppercase block">Status</span>
                    <span className="font-mono font-bold text-warm-white">{selectedTech.status}</span>
                  </div>
                  <div className="p-2.5 bg-obsidian border border-graphite-border rounded-xs">
                    <span className="text-[9px] font-mono text-muted uppercase block">Current Bay</span>
                    <span className="font-mono font-bold text-accent-gold">{selectedTechBay}</span>
                  </div>
                </div>
              </div>

              {/* Current Assignments */}
              <div className="space-y-2">
                <div data-testid="dossier-current-assignments-header" className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-muted-dark tracking-wider block">
                    CURRENT ASSIGNMENTS ({selectedTechJobs.length})
                  </span>
                </div>

                {selectedTechJobs.length === 0 ? (
                  <div className="p-3 bg-obsidian border border-graphite-border rounded-xs text-center space-y-1">
                    <p className="text-xs font-mono text-muted">NO ACTIVE ASSIGNMENTS</p>
                    <p className="text-[10px] text-muted-dark">Technician available for new work allocation.</p>
                    <button
                      onClick={() => {
                        setModalSelectedTechName(selectedTech.name);
                        handleOpenAssignModal();
                      }}
                      className="mt-2 min-h-[36px] px-3 py-1 rounded-xs bg-accent-gold text-obsidian font-mono font-bold text-[10px] uppercase"
                    >
                      ASSIGN JOB
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selectedTechJobs.map((job) => (
                      <div key={job.id} className="p-3 bg-obsidian border border-graphite-border rounded-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-accent-gold text-xs">{job.id}</span>
                          <span className="font-mono text-[10px] text-muted">
                            {!job.bay || job.bay === 'UNASSIGNED' ? 'BAY: UNASSIGNED' : job.bay}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-warm-white">{job.vehicle_summary}</h4>
                          <p className="text-[11px] text-muted">{job.service_name}</p>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-graphite-border/60">
                          <span className="text-[10px] font-mono text-muted-dark">Registration: {job.registration}</span>
                          {renderStageBadge(job.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => onOpenJob(job.id)}
                            className="min-h-[38px] px-2 py-1 bg-graphite border border-graphite-border hover:border-accent-gold rounded-xs text-[10px] font-mono font-bold uppercase text-warm-white flex items-center justify-center gap-1"
                          >
                            OPEN JOB CARD
                          </button>
                          <button
                            onClick={() => {
                              if (onNavigateModule) onNavigateModule('vehicles');
                            }}
                            className="min-h-[38px] px-2 py-1 bg-graphite/40 border border-graphite-border hover:text-warm-white rounded-xs text-[10px] font-mono font-bold uppercase text-muted flex items-center justify-center gap-1"
                          >
                            VIEW VEHICLE
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Today's Workload Metrics */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-muted-dark tracking-wider block">
                  TODAY'S WORKLOAD
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-obsidian border border-graphite-border rounded-xs">
                    <span className="text-[9px] font-mono text-muted uppercase block">Assigned Jobs</span>
                    <span className="font-mono font-bold text-warm-white">{selectedTechJobs.length}</span>
                  </div>
                  <div className="p-2.5 bg-obsidian border border-graphite-border rounded-xs">
                    <span className="text-[9px] font-mono text-muted uppercase block">Completed (Delivered)</span>
                    <span className="font-mono font-bold text-warm-white">{completedJobsCount}</span>
                  </div>
                  <div className="p-2.5 bg-obsidian border border-graphite-border rounded-xs">
                    <span className="text-[9px] font-mono text-muted uppercase block">QC Pending</span>
                    <span className="font-mono font-bold text-warm-white">
                      {selectedTechJobs.filter((j) => j.status === 'QUALITY_CHECK').length}
                    </span>
                  </div>
                  <div className="p-2.5 bg-obsidian border border-graphite-border rounded-xs">
                    <span className="text-[9px] font-mono text-muted uppercase block">Overdue Jobs</span>
                    <span className="font-mono font-bold text-muted text-[11px]">
                      NOT RECORDED
                    </span>
                  </div>
                </div>
              </div>

              {/* Specialization Details */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono uppercase text-muted-dark tracking-wider block">
                  SPECIALIZATION
                </span>
                <p className="text-xs font-mono text-warm-white bg-obsidian p-2.5 border border-graphite-border rounded-xs">
                  {selectedTech.specialization}
                </p>
              </div>

              {/* Direct Contact & Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-graphite-border">
                <span className="text-[10px] font-mono uppercase text-muted-dark tracking-wider block">
                  DIRECT CONTACT
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${selectedTech.phone}`}
                    className="min-h-[44px] px-3 py-2 rounded-xs bg-graphite border border-graphite-border hover:border-accent-gold text-warm-white font-mono text-xs uppercase flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-accent-gold" />
                    CALL
                  </a>
                  <a
                    href={getWhatsAppLink(selectedTech)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-3 py-2 rounded-xs bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-400 font-mono text-xs uppercase flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    WHATSAPP
                  </a>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-6 rounded-xs bg-graphite/20 border border-graphite-border text-center text-xs text-muted font-mono">
              Select a technician from the roster to inspect dossier.
            </div>
          )}
        </div>

      </div>

      {/* ------------------------------------------------------------ */}
      {/* 5. MOBILE FULL SCREEN DOSSIER DRAWER (< 1024px)              */}
      {/* ------------------------------------------------------------ */}
      {mobileDossierOpen && selectedTech && (
        <div className="fixed inset-0 z-50 bg-obsidian/95 backdrop-blur-md overflow-y-auto lg:hidden p-4 space-y-5 animate-in fade-in">
          {/* Back button */}
          <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
            <button
              onClick={() => setMobileDossierOpen(false)}
              className="min-h-[44px] px-3 py-2 rounded-xs bg-graphite border border-graphite-border text-warm-white font-mono text-xs uppercase flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-accent-gold" />
              BACK TO TECHNICIANS
            </button>
            <span className="text-[10px] font-mono text-muted">ID: {selectedTech.id}</span>
          </div>

          <div className="p-4 rounded-xs bg-graphite/40 border border-graphite-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent-gold/15 border border-accent-gold/30 flex items-center justify-center text-accent-gold font-mono font-bold text-sm shrink-0">
                {selectedTech.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-base font-black text-warm-white">{selectedTech.name}</h2>
                <p className="text-xs text-muted font-mono">{selectedTech.specialization}</p>
                <div className="mt-1">
                  {renderStatusBadge(selectedTech.status, selectedTechJobs.length)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2">
              <div className="p-2 bg-obsidian border border-graphite-border rounded-xs">
                <span className="text-[9px] font-mono text-muted uppercase block">Phone</span>
                <span className="font-mono text-warm-white text-[11px]">{selectedTech.phone}</span>
              </div>
              <div className="p-2 bg-obsidian border border-graphite-border rounded-xs">
                <span className="text-[9px] font-mono text-muted uppercase block">Primary Bay</span>
                <span className="font-mono font-bold text-accent-gold text-[11px]">{selectedTechBay}</span>
              </div>
            </div>

            {/* Active Assignments */}
            <div className="space-y-2 pt-2 border-t border-graphite-border">
              <span className="text-[10px] font-mono uppercase text-muted-dark tracking-wider block">
                CURRENT ASSIGNMENTS ({selectedTechJobs.length})
              </span>

              {selectedTechJobs.length === 0 ? (
                <p className="text-xs text-muted font-mono p-2 bg-obsidian border border-graphite-border rounded-xs">
                  NO ACTIVE ASSIGNMENTS
                </p>
              ) : (
                selectedTechJobs.map((job) => (
                  <div key={job.id} className="p-3 bg-obsidian border border-graphite-border rounded-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-accent-gold text-xs">{job.id}</span>
                      <span className="font-mono text-[10px] text-muted">
                        {!job.bay || job.bay === 'UNASSIGNED' ? 'BAY: UNASSIGNED' : job.bay}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-warm-white">{job.vehicle_summary}</p>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-muted">{job.registration}</span>
                      {renderStageBadge(job.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          setMobileDossierOpen(false);
                          onOpenJob(job.id);
                        }}
                        className="min-h-[44px] px-2 py-1 bg-graphite border border-graphite-border text-warm-white font-mono text-xs uppercase"
                      >
                        OPEN JOB CARD
                      </button>
                      <button
                        onClick={() => {
                          setMobileDossierOpen(false);
                          if (onNavigateModule) onNavigateModule('vehicles');
                        }}
                        className="min-h-[44px] px-2 py-1 bg-graphite/40 border border-graphite-border text-muted font-mono text-xs uppercase"
                      >
                        VIEW VEHICLE
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Contact Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-graphite-border">
              <a
                href={`tel:${selectedTech.phone}`}
                className="min-h-[44px] px-3 py-2 rounded-xs bg-graphite border border-graphite-border text-warm-white font-mono text-xs uppercase flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-accent-gold" />
                CALL
              </a>
              <a
                href={getWhatsAppLink(selectedTech)}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-3 py-2 rounded-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs uppercase flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                WHATSAPP
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/* 6. OPERATIONAL ASSIGN TECHNICIAN MODAL                       */}
      {/* ------------------------------------------------------------ */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 bg-obsidian/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-graphite border border-graphite-border rounded-xs shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block font-semibold">
                  WORKFLOW DISPATCH
                </span>
                <h3 className="text-lg font-black uppercase text-warm-white mt-0.5">
                  ASSIGN TECHNICIAN TO JOB
                </h3>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-warm-white p-2 rounded-xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-4">
              {/* Step 1: Select Job */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-muted-dark block">
                  SELECT SERVICE JOB
                </label>
                <select
                  value={modalSelectedJobId}
                  onChange={(e) => setModalSelectedJobId(e.target.value)}
                  className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2.5 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                  required
                >
                  <option value="" disabled>-- Select Active Job Card --</option>
                  {activeJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.id} · {job.vehicle_summary} ({job.registration}) — Tech: {job.technician || 'Unassigned'} [{job.status}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Job Card Preview */}
              {(() => {
                const previewJob = activeJobs.find((j) => j.id === modalSelectedJobId);
                if (!previewJob) return null;
                return (
                  <div className="p-3 rounded-xs bg-obsidian/60 border border-graphite-border space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between text-accent-gold font-bold">
                      <span>{previewJob.id}</span>
                      <span>{previewJob.bay || 'BAY NOT ASSIGNED'}</span>
                    </div>
                    <p className="text-warm-white font-medium">{previewJob.vehicle_summary} ({previewJob.registration})</p>
                    <div className="flex items-center justify-between text-[10px] text-muted pt-1">
                      <span>Customer: {previewJob.customer_name}</span>
                      <span>Current Status: {previewJob.status}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Step 2: Select Technician */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-mono uppercase text-muted-dark block">
                  SELECT TECHNICIAN SPECIALIST
                </label>
                <div className="space-y-2">
                  {technicians.map((tech) => {
                    const techJobs = getJobsForTech(tech);
                    const isSelected = modalSelectedTechName === tech.name;

                    return (
                      <div
                        key={tech.id}
                        onClick={() => setModalSelectedTechName(tech.name)}
                        className={`p-3 rounded-xs border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-obsidian border-accent-gold ring-1 ring-accent-gold/40'
                            : 'bg-obsidian/50 border-graphite-border hover:border-graphite-border/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-accent-gold bg-accent-gold' : 'border-muted-dark'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-obsidian"></div>}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-warm-white block">{tech.name}</span>
                            <span className="text-[10px] font-mono text-muted block">{tech.specialization}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted">
                            {techJobs.length} active {techJobs.length === 1 ? 'job' : 'jobs'}
                          </span>
                          {renderStatusBadge(tech.status, techJobs.length)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reason / Notes */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-mono uppercase text-muted-dark block">
                  ASSIGNMENT REASON / INTAKE NOTE (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diagnostic escalation, specialized calibration, primary shift assignment"
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white placeholder:text-muted-dark focus:outline-none focus:border-accent-gold min-h-[44px]"
                />
              </div>

              {/* Compact Assignment Summary (Section 18) */}
              {(() => {
                const targetJob = activeJobs.find((j) => j.id === modalSelectedJobId);
                const targetTech = technicians.find((t) => t.name === modalSelectedTechName);
                const currentWorkload = targetTech ? getJobsForTech(targetTech).length : 0;
                if (!targetJob || !targetTech) return null;

                return (
                  <div className="p-3 bg-graphite/40 border border-accent-gold/40 rounded-xs space-y-1.5 font-mono text-xs">
                    <div className="text-[10px] uppercase text-accent-gold font-bold tracking-wider">
                      ASSIGNMENT SUMMARY
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-graphite-border/60">
                      <div>
                        <span className="text-[9px] text-muted uppercase block">JOB</span>
                        <span className="text-warm-white font-bold">{targetJob.id}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted uppercase block">TECHNICIAN</span>
                        <span className="text-warm-white font-bold">{targetTech.name}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted uppercase block">VEHICLE</span>
                        <span className="text-warm-white truncate block">{targetJob.vehicle_summary}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted uppercase block">CURRENT WORKLOAD</span>
                        <span className="text-accent-gold font-bold">{currentWorkload} ACTIVE {currentWorkload === 1 ? 'JOB' : 'JOBS'}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-graphite-border">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="min-h-[44px] px-4 py-2.5 rounded-xs bg-obsidian border border-graphite-border text-muted hover:text-warm-white font-mono text-xs uppercase"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={!modalSelectedJobId || !modalSelectedTechName}
                  className="min-h-[44px] px-5 py-2.5 rounded-xs bg-accent-gold hover:bg-accent-gold/90 disabled:opacity-50 text-obsidian font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  ASSIGN TECHNICIAN
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
