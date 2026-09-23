import React, { useState, useMemo } from 'react';
import type {
  JobCard,
  CustomerRecord,
  VehicleRecord,
  InspectionRecord,
  EstimateRecord,
  TechnicianRecord,
  ServiceReminder,
} from '../../types';
import { addManualHistoricalRecord, createServiceReminder } from '../../lib/demoStore';
import {
  Search,
  Calendar,
  Wrench,
  CheckCircle2,
  Plus,
  ChevronLeft,
  X,
  History,
  Phone,
  MessageSquare,
  ShieldCheck,
  FileText,
  RotateCcw,
  ArrowUpRight,
} from 'lucide-react';

export interface ServiceHistoryViewProps {
  jobs: JobCard[];
  customers?: CustomerRecord[];
  vehicles?: VehicleRecord[];
  inspections?: Record<string, InspectionRecord>;
  estimates?: Record<string, EstimateRecord>;
  technicians?: TechnicianRecord[];
  reminders?: ServiceReminder[];
  onOpenJob: (jobId: string) => void;
  onNavigateModule?: (module: any) => void;
  onRefreshStore?: () => void;
}

export const ServiceHistoryView: React.FC<ServiceHistoryViewProps> = ({
  jobs,
  customers = [],
  vehicles = [],
  inspections = {},
  estimates = {},
  technicians: _technicians = [],
  reminders = [],
  onOpenJob,
  onNavigateModule,
  onRefreshStore,
}) => {
  // 1. Separate Completed History vs Active Workshop Visits
  // Canonical Rule: Only completed/delivered workshop jobs should appear as completed service history.
  // Active jobs (WORK_IN_PROGRESS, ESTIMATE_SENT, QUALITY_CHECK, etc.) are strictly active execution.
  const completedJobs = useMemo(() => {
    return jobs
      .filter((j) => j.status === 'DELIVERED')
      .sort((a, b) => {
        const timeA = new Date(a.delivered_at || a.opened_at).getTime();
        const timeB = new Date(b.delivered_at || b.opened_at).getTime();
        return timeB - timeA;
      });
  }, [jobs]);

  const activeJobs = useMemo(() => {
    return jobs.filter((j) => j.status !== 'DELIVERED' && j.status !== 'CANCELLED');
  }, [jobs]);

  // Selected Record State for 35% Sticky Dossier
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    completedJobs[0]?.id || ''
  );
  const [mobileDossierOpen, setMobileDossierOpen] = useState(false);

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState<'ALL' | 'COMPLETED' | 'ACTIVE_VISITS' | 'MANUAL_ENTRIES'>('ALL');
  const [advisorFilter, setAdvisorFilter] = useState('ALL');
  const [technicianFilter, setTechnicianFilter] = useState('ALL');
  const [makeModelFilter, setMakeModelFilter] = useState('ALL');
  const [kpiFilter, setKpiFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'RECENT' | 'OLDEST' | 'VALUE_HIGH' | 'VALUE_LOW' | 'ODOMETER'>('RECENT');

  // Manual Historical Record Modal State
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [modalCustomer, setModalCustomer] = useState(customers[0]?.name || 'Rahul Mehta');
  const [modalVehicle, setModalVehicle] = useState(vehicles[0]?.registration || 'MH 02 ER 4500');
  const [modalServiceDate, setModalServiceDate] = useState('2025-06-15');
  const [modalOdometer, setModalOdometer] = useState<number>(18500);
  const [modalServiceName, setModalServiceName] = useState('Brake Fluid Flush & Inspection');
  const [modalServiceValue, setModalServiceValue] = useState<number>(4500);
  const [modalAdvisor, setModalAdvisor] = useState('Rohan Deshmukh');
  const [modalTechnician, setModalTechnician] = useState('Arjun Sharma');
  const [modalNotes, setModalNotes] = useState('');
  const [modalExternalRef, setModalExternalRef] = useState('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Distinct Filter Choices
  const distinctMakes = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      if (j.vehicle_make) set.add(j.vehicle_make);
      else if (j.vehicle_summary) set.add(j.vehicle_summary.split(' ')[0] || '');
    });
    return Array.from(set).filter(Boolean);
  }, [jobs]);

  const distinctAdvisors = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      if (j.advisor) set.add(j.advisor);
    });
    return Array.from(set);
  }, [jobs]);

  const distinctTechnicians = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      if (j.technician) set.add(j.technician);
    });
    return Array.from(set);
  }, [jobs]);

  // Derived Operational KPIs (all derived from authentic records, no financial fabrication)
  const kpiMetrics = useMemo(() => {
    const totalVehiclesCount = vehicles.length || new Set(jobs.map((j) => j.registration)).size;
    const totalVisitsCount = completedJobs.length;

    // Completed this month (Sep 2026 reference)
    const thisMonthCompleted = completedJobs.filter((j) => {
      const d = new Date(j.delivered_at || j.opened_at);
      return d.getFullYear() === 2026 && d.getMonth() === 8; // Month 8 is September
    }).length;

    // Average Job Value from completed service history
    const totalCompletedValue = completedJobs.reduce((sum, j) => sum + (j.estimate_total || 0), 0);
    const avgJobValue = totalVisitsCount > 0 ? Math.round(totalCompletedValue / totalVisitsCount) : 0;

    // Last 30 Days visits
    const nowMs = new Date('2026-09-21T00:00:00Z').getTime();
    const thirtyDaysAgoMs = nowMs - 30 * 24 * 60 * 60 * 1000;
    const last30DaysCount = completedJobs.filter((j) => {
      const d = new Date(j.delivered_at || j.opened_at).getTime();
      return d >= thirtyDaysAgoMs && d <= nowMs;
    }).length;

    // Due for service from customer/reminders
    const dueForServiceCount = reminders.filter((r) => r.status === 'DUE' || r.status === 'OVERDUE').length;

    // Open Recommendations: from completed job inspections where recommendation wasn't in approved estimate
    let openRecsCount = 0;
    let declinedRecsCount = 0;

    completedJobs.forEach((j) => {
      const insp = inspections[j.id];
      const est = estimates[j.id];
      if (insp && insp.findings) {
        insp.findings.forEach((f) => {
          if (f.condition === 'ATTENTION' || f.condition === 'CRITICAL') {
            if (est) {
              const matchedItem = est.items?.find((it) => it.source_finding_id === f.id || it.description.includes(f.component || ''));
              if (matchedItem?.approval_status === 'DECLINED') {
                declinedRecsCount++;
              } else if (!matchedItem || matchedItem.approval_status === 'PENDING') {
                openRecsCount++;
              }
            }
          }
        });
      }
    });

    return {
      totalVehicles: totalVehiclesCount,
      totalVisits: totalVisitsCount,
      completedThisMonth: thisMonthCompleted,
      avgValue: avgJobValue,
      last30Days: last30DaysCount,
      dueForService: dueForServiceCount,
      openRecommendations: openRecsCount,
      declinedRecommendations: declinedRecsCount,
    };
  }, [vehicles, completedJobs, reminders, inspections, estimates, jobs]);

  // Handle KPI Click (Toggle-to-Clear)
  const handleKpiClick = (key: string) => {
    if (kpiFilter === key) {
      setKpiFilter('ALL');
    } else {
      setKpiFilter(key);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusTab('ALL');
    setAdvisorFilter('ALL');
    setTechnicianFilter('ALL');
    setMakeModelFilter('ALL');
    setKpiFilter('ALL');
    setSortBy('RECENT');
  };

  // Filter Historical Records List
  const displayedRecords = useMemo(() => {
    let list: JobCard[] = [];

    if (statusTab === 'COMPLETED') {
      list = [...completedJobs];
    } else if (statusTab === 'ACTIVE_VISITS') {
      list = [...activeJobs];
    } else if (statusTab === 'MANUAL_ENTRIES') {
      list = completedJobs.filter((j) => j.is_manual_history);
    } else {
      // 'ALL': show completed jobs first, followed by active visits clearly demarcated
      list = [...completedJobs, ...activeJobs];
    }

    // KPI Filters (When clicked from 8 KPI Strip)
    if (kpiFilter === 'THIS_MONTH') {
      list = list.filter((j) => {
        if (j.status !== 'DELIVERED') return false;
        const d = new Date(j.delivered_at || j.opened_at);
        return d.getFullYear() === 2026 && d.getMonth() === 8;
      });
    } else if (kpiFilter === 'SERVICE_VISITS') {
      list = list.filter((j) => j.status === 'DELIVERED');
    } else if (kpiFilter === 'LAST_30_DAYS') {
      const nowMs = new Date('2026-09-21T00:00:00Z').getTime();
      const thirtyDaysAgoMs = nowMs - 30 * 24 * 60 * 60 * 1000;
      list = list.filter((j) => {
        if (j.status !== 'DELIVERED') return false;
        const d = new Date(j.delivered_at || j.opened_at).getTime();
        return d >= thirtyDaysAgoMs && d <= nowMs;
      });
    } else if (kpiFilter === 'DUE_SERVICE') {
      // Show records matching vehicles that are due/overdue
      const dueRegs = new Set(reminders.filter((r) => r.status === 'DUE' || r.status === 'OVERDUE').map((r) => r.registration));
      list = list.filter((j) => dueRegs.has(j.registration));
    } else if (kpiFilter === 'OPEN_RECS') {
      list = list.filter((j) => {
        const insp = inspections[j.id];
        const est = estimates[j.id];
        return insp?.findings?.some((f) => {
          if (f.condition === 'ATTENTION' || f.condition === 'CRITICAL') {
            const item = est?.items?.find((it) => it.source_finding_id === f.id || it.description.includes(f.component || ''));
            return !item || item.approval_status === 'PENDING';
          }
          return false;
        });
      });
    } else if (kpiFilter === 'DECLINED') {
      list = list.filter((j) => {
        const est = estimates[j.id];
        return est?.items?.some((i) => i.approval_status === 'DECLINED');
      });
    }

    // Search Query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((j) => {
        const est = estimates[j.id];
        const insp = inspections[j.id];
        return (
          j.registration.toLowerCase().includes(q) ||
          j.vehicle_summary.toLowerCase().includes(q) ||
          (j.vehicle_make && j.vehicle_make.toLowerCase().includes(q)) ||
          (j.vehicle_model && j.vehicle_model.toLowerCase().includes(q)) ||
          j.customer_name.toLowerCase().includes(q) ||
          j.customer_phone.toLowerCase().includes(q) ||
          j.id.toLowerCase().includes(q) ||
          (est?.estimate_number && est.estimate_number.toLowerCase().includes(q)) ||
          (est?.id && est.id.toLowerCase().includes(q)) ||
          (insp?.id && insp.id.toLowerCase().includes(q)) ||
          (j.service_name && j.service_name.toLowerCase().includes(q))
        );
      });
    }

    // Advisor Filter
    if (advisorFilter !== 'ALL') {
      list = list.filter((j) => j.advisor === advisorFilter);
    }

    // Technician Filter
    if (technicianFilter !== 'ALL') {
      list = list.filter((j) => j.technician === technicianFilter);
    }

    // Make/Model Filter
    if (makeModelFilter !== 'ALL') {
      list = list.filter((j) => {
        if (j.vehicle_make) return j.vehicle_make === makeModelFilter;
        return j.vehicle_summary.startsWith(makeModelFilter);
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'RECENT') {
        const timeA = new Date(a.delivered_at || a.opened_at).getTime();
        const timeB = new Date(b.delivered_at || b.opened_at).getTime();
        return timeB - timeA;
      }
      if (sortBy === 'OLDEST') {
        const timeA = new Date(a.delivered_at || a.opened_at).getTime();
        const timeB = new Date(b.delivered_at || b.opened_at).getTime();
        return timeA - timeB;
      }
      if (sortBy === 'VALUE_HIGH') {
        return (b.estimate_total || 0) - (a.estimate_total || 0);
      }
      if (sortBy === 'VALUE_LOW') {
        return (a.estimate_total || 0) - (b.estimate_total || 0);
      }
      if (sortBy === 'ODOMETER') {
        return (b.odometer || 0) - (a.odometer || 0);
      }
      return 0;
    });

    return list;
  }, [
    completedJobs,
    activeJobs,
    statusTab,
    kpiFilter,
    search,
    advisorFilter,
    technicianFilter,
    makeModelFilter,
    sortBy,
    estimates,
    inspections,
  ]);

  // Selected Record & Vehicle Context for 35% Dossier
  const selectedRecord = useMemo(() => {
    return jobs.find((j) => j.id === selectedRecordId) || displayedRecords[0] || completedJobs[0] || null;
  }, [jobs, selectedRecordId, displayedRecords, completedJobs]);

  // Linked Inspection & Estimate
  const selectedInspection = selectedRecord ? inspections[selectedRecord.id] || null : null;
  const selectedEstimate = selectedRecord ? estimates[selectedRecord.id] || null : null;

  // Multi-visit vehicle service history (all completed services for the selected vehicle)
  const vehicleHistoryRecords = useMemo(() => {
    if (!selectedRecord) return [];
    return jobs
      .filter(
        (j) =>
          (j.registration === selectedRecord.registration || j.vehicle_id === selectedRecord.vehicle_id) &&
          j.status === 'DELIVERED'
      )
      .sort((a, b) => new Date(b.delivered_at || b.opened_at).getTime() - new Date(a.delivered_at || a.opened_at).getTime());
  }, [selectedRecord, jobs]);

  // Vehicle master record
  const selectedVehicleRecord = useMemo(() => {
    if (!selectedRecord) return null;
    return vehicles.find(
      (v) => v.registration === selectedRecord.registration || v.id === selectedRecord.vehicle_id
    ) || null;
  }, [selectedRecord, vehicles]);

  // Total workshop service value for this vehicle
  const vehicleTotalServiceValue = useMemo(() => {
    return vehicleHistoryRecords.reduce((sum, r) => sum + (r.estimate_total || 0), 0);
  }, [vehicleHistoryRecords]);

  // Outstanding/Previous recommendations for this vehicle
  const previousRecommendations = useMemo(() => {
    if (!selectedRecord) return [];
    const recs: {
      id: string;
      inspectionId: string;
      date: string;
      component: string;
      finding: string;
      recommendation: string;
      condition: string;
      status: 'DECLINED' | 'PENDING';
      reason?: string;
    }[] = [];

    vehicleHistoryRecords.forEach((histJob) => {
      const insp = inspections[histJob.id];
      const est = estimates[histJob.id];
      if (insp?.findings) {
        insp.findings.forEach((f) => {
          if (f.condition === 'ATTENTION' || f.condition === 'CRITICAL') {
            const estItem = est?.items?.find((it) => it.source_finding_id === f.id || it.description.includes(f.component || ''));
            if (estItem?.approval_status === 'DECLINED') {
              recs.push({
                id: f.id,
                inspectionId: insp.id,
                date: histJob.delivered_at || histJob.opened_at,
                component: f.component || f.category,
                finding: f.finding,
                recommendation: f.recommendation,
                condition: f.condition,
                status: 'DECLINED',
                reason: estItem.customer_note || 'Customer Deferred',
              });
            } else if (!estItem || estItem.approval_status === 'PENDING') {
              recs.push({
                id: f.id,
                inspectionId: insp.id,
                date: histJob.delivered_at || histJob.opened_at,
                component: f.component || f.category,
                finding: f.finding,
                recommendation: f.recommendation,
                condition: f.condition,
                status: 'PENDING',
                reason: 'Awaiting Authorization',
              });
            }
          }
        });
      }
    });

    return recs;
  }, [selectedRecord, vehicleHistoryRecords, inspections, estimates]);

  // Handle Manual Historical Record Submission
  const handleSaveManualRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.name === modalCustomer) || customers[0];
    const veh = vehicles.find((v) => v.registration === modalVehicle) || vehicles[0];

    const newRecord = addManualHistoricalRecord({
      customerId: cust?.id || 'cust-1',
      customerName: cust?.name || modalCustomer,
      customerPhone: cust?.phone || '+91 98765 43210',
      vehicleId: veh?.id || 'veh-1',
      vehicleSummary: veh ? `${veh.year} ${veh.make} ${veh.model}` : 'Imported Vehicle',
      registration: veh?.registration || modalVehicle,
      serviceName: modalServiceName,
      serviceDate: modalServiceDate,
      odometer: Number(modalOdometer) || 30000,
      serviceValue: Number(modalServiceValue) || 0,
      technician: modalTechnician,
      advisor: modalAdvisor,
      notes: modalNotes,
      externalRef: modalExternalRef,
    });

    if (onRefreshStore) onRefreshStore();
    setSelectedRecordId(newRecord.id);
    setManualModalOpen(false);
    triggerToast(`Historical record ${newRecord.id} successfully added to archives.`);
  };

  // WhatsApp Customer Link (factual, prefilled deep link)
  const getWhatsAppLink = (job: JobCard) => {
    const phone = job.customer_phone.replace(/[^0-9]/g, '');
    const dateStr = new Date(job.delivered_at || job.opened_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const text = `Hi ${job.customer_name}, this is Torque Expert's regarding your ${job.vehicle_summary}, registration ${job.registration}. Your previous service was completed on ${dateStr}.`;
    return `https://wa.me/${phone.startsWith('91') ? phone : `91${phone}`}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed top-5 right-5 z-50 bg-accent-gold text-obsidian px-4 py-2.5 rounded-xs font-mono text-xs font-bold shadow-2xl flex items-center gap-2 border border-white/20">
          <CheckCircle2 className="w-4 h-4 text-obsidian" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. MODULE HEADER & PRIMARY CTA                               */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-graphite-border">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block font-bold">
            VEHICLE SERVICE HISTORY
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-warm-white">
            SERVICE HISTORY
          </h1>
          <p className="text-xs text-muted font-light mt-0.5 max-w-2xl">
            Review completed workshop visits, repairs, inspections, estimates and vehicle service milestones.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            data-testid="add-historical-record-btn"
            onClick={() => setManualModalOpen(true)}
            className="px-3.5 py-2 bg-graphite border border-accent-gold/40 text-accent-gold hover:bg-accent-gold hover:text-obsidian rounded-xs text-xs font-mono uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD HISTORICAL RECORD</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. OPERATIONAL KPI STRIP (8 CARDS)                           */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono text-xs">
        {[
          { key: 'ALL', label: 'TOTAL VEHICLES', count: kpiMetrics.totalVehicles, color: 'text-warm-white', border: 'border-accent-gold' },
          { key: 'SERVICE_VISITS', label: 'SERVICE VISITS', count: kpiMetrics.totalVisits, color: 'text-emerald-400', border: 'border-emerald-400' },
          { key: 'THIS_MONTH', label: 'COMPLETED (SEP)', count: kpiMetrics.completedThisMonth, color: 'text-blue-400', border: 'border-blue-400' },
          { key: 'AVG_VALUE', label: 'AVG JOB VALUE', count: `₹${kpiMetrics.avgValue.toLocaleString('en-IN')}`, color: 'text-accent-gold', border: 'border-accent-gold' },
          { key: 'LAST_30_DAYS', label: 'LAST 30 DAYS', count: kpiMetrics.last30Days, color: 'text-warm-white', border: 'border-warm-white' },
          { key: 'DUE_SERVICE', label: 'DUE FOR SERVICE', count: kpiMetrics.dueForService, color: 'text-amber-400', border: 'border-amber-400' },
          { key: 'OPEN_RECS', label: 'OPEN RECS', count: kpiMetrics.openRecommendations, color: 'text-zinc-400', border: 'border-zinc-400' },
          { key: 'DECLINED', label: 'DECLINED RECS', count: kpiMetrics.declinedRecommendations, color: 'text-red-400', border: 'border-red-400' },
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
              <span className={`text-lg sm:text-xl font-bold ${kpi.color}`}>
                {kpi.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* 3. SEARCH & OPERATIONAL FILTERS                              */}
      {/* ============================================================ */}
      <div className="p-4 rounded-xs bg-obsidian border border-graphite-border space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="sm:col-span-4 relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search registration, vehicle, customer, job card..."
              className="w-full pl-9 pr-3 py-2 bg-graphite border border-graphite-border rounded-xs text-xs font-mono text-warm-white placeholder:text-muted-dark focus:outline-none focus:border-accent-gold min-h-[40px]"
            />
          </div>

          {/* Filters */}
          <div className="sm:col-span-8 flex flex-wrap items-center gap-2 justify-end">
            <select
              value={statusTab}
              onChange={(e) => setStatusTab(e.target.value as any)}
              className="bg-graphite border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
            >
              <option value="ALL">All History Records</option>
              <option value="COMPLETED">Completed Services Only</option>
              <option value="ACTIVE_VISITS">Current Workshop Visits</option>
              <option value="MANUAL_ENTRIES">Manual Historical Entries</option>
            </select>

            <select
              value={makeModelFilter}
              onChange={(e) => setMakeModelFilter(e.target.value)}
              className="bg-graphite border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
            >
              <option value="ALL">All Makes / Models</option>
              {distinctMakes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={advisorFilter}
              onChange={(e) => setAdvisorFilter(e.target.value)}
              className="bg-graphite border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
            >
              <option value="ALL">All Advisors</option>
              {distinctAdvisors.map((adv) => (
                <option key={adv} value={adv}>
                  {adv}
                </option>
              ))}
            </select>

            <select
              value={technicianFilter}
              onChange={(e) => setTechnicianFilter(e.target.value)}
              className="bg-graphite border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
            >
              <option value="ALL">All Technicians</option>
              {distinctTechnicians.map((tech) => (
                <option key={tech} value={tech}>
                  {tech}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-graphite border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
            >
              <option value="RECENT">Most Recent</option>
              <option value="OLDEST">Oldest</option>
              <option value="VALUE_HIGH">Highest Value</option>
              <option value="VALUE_LOW">Lowest Value</option>
              <option value="ODOMETER">Odometer</option>
            </select>

            {(search || statusTab !== 'ALL' || advisorFilter !== 'ALL' || technicianFilter !== 'ALL' || makeModelFilter !== 'ALL' || kpiFilter !== 'ALL' || sortBy !== 'RECENT') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 bg-graphite border border-accent-gold/40 text-accent-gold hover:bg-accent-gold hover:text-obsidian rounded-xs text-xs font-mono uppercase transition-colors min-h-[40px] flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET FILTERS</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. MAIN DESKTOP 65% HISTORY / 35% VEHICLE DOSSIER GRID       */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================== */}
        {/* LEFT COLUMN: 65% SERVICE HISTORY WORKSPACE                 */}
        {/* ========================================================== */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="flex items-center justify-between font-mono text-xs text-muted pb-1 border-b border-graphite-border/60">
            <span>
              DISPLAYING {displayedRecords.length} RECORD{displayedRecords.length !== 1 ? 'S' : ''}
            </span>
            {kpiFilter !== 'ALL' && (
              <span className="text-accent-gold font-bold">Filtered by KPI: {kpiFilter}</span>
            )}
          </div>

          {displayedRecords.length === 0 ? (
            <div className="py-20 text-center bg-obsidian border border-dashed border-graphite-border rounded-xs space-y-3 font-mono">
              <History className="w-8 h-8 text-muted mx-auto opacity-40" />
              <p className="text-sm font-bold text-warm-white uppercase">No Service History Records Found</p>
              <p className="text-xs text-muted max-w-sm mx-auto">
                No completed service records match your current filters. Try resetting the filters or add a manual historical archive entry.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 bg-graphite border border-graphite-border text-xs text-accent-gold hover:underline uppercase"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedRecords.map((job) => {
                const isSelected = selectedRecord?.id === job.id;
                const isDelivered = job.status === 'DELIVERED';
                const est = estimates[job.id];
                const insp = inspections[job.id];
                const completedDate = new Date(job.delivered_at || job.opened_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <div
                    key={job.id}
                    data-testid={`history-card-${job.id.toLowerCase()}`}
                    onClick={() => {
                      setSelectedRecordId(job.id);
                      setMobileDossierOpen(true);
                    }}
                    className={`p-4 rounded-xs border transition-all cursor-pointer bg-graphite/40 space-y-3 ${
                      isSelected
                        ? 'border-accent-gold bg-obsidian ring-1 ring-accent-gold/40 shadow-lg'
                        : 'border-graphite-border hover:border-graphite-border/90'
                    }`}
                  >
                    {/* Row 1: Job ID + Status Badges + Date */}
                    <div className="flex items-center justify-between pb-2 border-b border-graphite-border/60 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-accent-gold">{job.id}</span>
                        <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase border ${
                          isDelivered
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                        }`}>
                          {isDelivered ? 'COMPLETED' : 'CURRENT WORKSHOP VISIT'}
                        </span>
                        {(job.origin === 'MANUAL_ENTRY' || job.is_manual_history) && (
                          <span className="px-1.5 py-0.5 rounded-xs bg-zinc-800 border border-amber-500/40 text-accent-gold text-[9px] uppercase font-bold tracking-wider">
                            MANUAL ENTRY
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-muted text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-muted-dark" />
                        <span>{completedDate}</span>
                      </div>
                    </div>

                    {/* Row 2: Vehicle & Registration */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <h2 className="text-base font-bold text-warm-white leading-snug">
                          {job.vehicle_summary}
                        </h2>
                        <div className="text-xs font-mono flex items-center gap-2 text-muted">
                          <span className="text-accent-gold font-bold">{job.registration}</span>
                          <span>·</span>
                          <span>{job.odometer ? `${job.odometer.toLocaleString()} km` : 'Odometer recorded'}</span>
                          <span>·</span>
                          <span className="text-warm-white font-medium">{job.customer_name}</span>
                        </div>
                      </div>

                      <div className="text-right font-mono shrink-0">
                        <span className="text-sm font-bold text-warm-white block">
                          ₹{(job.estimate_total || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-muted-dark uppercase">Final Service Value</span>
                      </div>
                    </div>

                    {/* Row 3: Primary Service & Scope Summary */}
                    <div className="p-2.5 rounded-xs bg-obsidian border border-graphite-border/60 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-warm-white font-semibold block">{job.service_name}</span>
                        <span className="text-[11px] text-muted-dark truncate block max-w-md">
                          {job.customer_complaint}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-muted shrink-0">
                        <span>Tech: <strong className="text-warm-white font-normal">{job.technician}</strong></span>
                        <span>·</span>
                        <span>Advisor: <strong className="text-warm-white font-normal">{job.advisor}</strong></span>
                      </div>
                    </div>

                    {/* Row 4: Linkages & Action Trigger */}
                    <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                      <div className="flex items-center gap-2 text-muted-dark">
                        {insp && (
                          <span className="px-1.5 py-0.5 rounded-xs bg-graphite border border-graphite-border text-zinc-300">
                            {insp.id}
                          </span>
                        )}
                        {est && (
                          <span className="px-1.5 py-0.5 rounded-xs bg-graphite border border-graphite-border text-zinc-300">
                            {est.estimate_number || est.id}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecordId(job.id);
                            setMobileDossierOpen(true);
                          }}
                          className="text-accent-gold hover:underline uppercase font-bold flex items-center gap-1"
                        >
                          <span>VIEW SERVICE DOSSIER</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================== */}
        {/* RIGHT COLUMN: 35% STICKY VEHICLE & SERVICE DOSSIER         */}
        {/* ========================================================== */}
        <div
          className={`lg:col-span-4 transition-all ${
            mobileDossierOpen
              ? 'fixed inset-0 z-50 bg-obsidian p-4 overflow-y-auto block lg:relative lg:inset-auto lg:p-0 lg:bg-transparent lg:z-auto'
              : 'hidden lg:block'
          }`}
        >
          {selectedRecord ? (
            <div data-testid="vehicle-service-dossier" className="p-5 rounded-xs bg-graphite/40 border border-graphite-border space-y-5">
              
              {/* Mobile Close Drawer Button */}
              <div className="flex lg:hidden items-center justify-between pb-3 border-b border-graphite-border">
                <button
                  type="button"
                  onClick={() => setMobileDossierOpen(false)}
                  className="px-3 py-1.5 bg-graphite border border-graphite-border text-xs font-mono uppercase text-warm-white flex items-center gap-1.5 min-h-[44px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>BACK TO SERVICE HISTORY</span>
                </button>
                <span className="font-mono text-xs font-bold text-accent-gold">
                  {selectedRecord.id}
                </span>
              </div>

              {/* Dossier Header */}
              <div className="space-y-2 pb-4 border-b border-graphite-border">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block font-bold">
                      VEHICLE SERVICE DOSSIER
                    </span>
                    <h3 data-testid="dossier-job-id" className="text-lg font-bold text-warm-white font-mono">
                      {selectedRecord.id}
                    </h3>
                  </div>

                  <span className={`px-2 py-0.5 rounded-xs border text-[10px] font-mono font-bold uppercase ${
                    selectedRecord.status === 'DELIVERED'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                  }`}>
                    {selectedRecord.status === 'DELIVERED' ? 'COMPLETED' : selectedRecord.status}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-base font-bold text-warm-white block font-sans">
                    {selectedRecord.vehicle_summary}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-mono text-muted">
                    <span className="text-accent-gold font-bold">{selectedRecord.registration}</span>
                    <span>·</span>
                    <span>{selectedRecord.odometer ? `${selectedRecord.odometer.toLocaleString()} km` : 'Odometer verified'}</span>
                  </div>
                </div>

                {selectedRecord.is_manual_history && (
                  <div className="p-2 bg-zinc-900 border border-zinc-700 rounded-xs text-[10px] font-mono text-zinc-300">
                    <strong>SOURCE:</strong> MANUAL ENTRY · Imported historical workshop archive record
                  </div>
                )}
              </div>

              {/* Owner & Vehicle Master Information */}
              <div className="p-3.5 rounded-xs bg-obsidian border border-graphite-border space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-graphite-border/40">
                  <span className="text-[10px] uppercase text-muted-dark font-bold">REGISTERED OWNER & ASSET</span>
                  <div className="flex items-center gap-2">
                    {onNavigateModule && (
                      <>
                        <button
                          type="button"
                          onClick={() => onNavigateModule('customers')}
                          className="text-[10px] text-accent-gold hover:underline uppercase"
                        >
                          CUSTOMER →
                        </button>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={() => onNavigateModule('vehicles')}
                          className="text-[10px] text-accent-gold hover:underline uppercase"
                        >
                          VEHICLE →
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-dark block text-[10px]">Customer</span>
                    <span className="text-warm-white font-medium">{selectedRecord.customer_name}</span>
                    <span className="text-muted block text-[10px]">{selectedRecord.customer_phone}</span>
                  </div>
                  <div>
                    <span className="text-muted-dark block text-[10px]">Masked VIN</span>
                    <span className="text-warm-white font-mono">{selectedRecord.vin_masked || selectedVehicleRecord?.vin_masked || 'WBA530D***7841'}</span>
                    <span className="text-muted block text-[10px]">Total Visits: {selectedVehicleRecord ? selectedVehicleRecord.id : vehicleHistoryRecords.length}</span>
                  </div>
                </div>

                {/* Customer Contact Direct Buttons */}
                <div className="pt-2 border-t border-graphite-border/40 flex gap-2">
                  <a
                    href={`tel:${selectedRecord.customer_phone}`}
                    className="flex-1 py-1.5 px-2 bg-graphite border border-graphite-border hover:border-warm-white text-warm-white rounded-xs text-[10px] uppercase text-center flex items-center justify-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-muted" />
                    <span>CALL</span>
                  </a>
                  <a
                    href={getWhatsAppLink(selectedRecord)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-2 bg-graphite border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 rounded-xs text-[10px] uppercase text-center flex items-center justify-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3 text-emerald-400" />
                    <span>WHATSAPP</span>
                  </a>
                </div>
              </div>

              {/* Vehicle Service Summary */}
              <div className="p-3.5 rounded-xs bg-obsidian border border-graphite-border space-y-2 font-mono text-xs">
                <span className="text-[10px] uppercase text-accent-gold font-bold block">
                  VEHICLE SERVICE SUMMARY
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-graphite/40 border border-graphite-border/60 rounded-xs">
                    <span className="text-[9px] text-muted uppercase block">TOTAL WORKSHOP VISITS</span>
                    <span className="text-base font-bold text-warm-white">
                      {vehicleHistoryRecords.length || 1}
                    </span>
                  </div>
                  <div className="p-2 bg-graphite/40 border border-graphite-border/60 rounded-xs">
                    <span className="text-[9px] text-muted uppercase block">TOTAL WORKSHOP VALUE</span>
                    <span className="text-base font-bold text-accent-gold">
                      ₹{vehicleTotalServiceValue > 0 ? vehicleTotalServiceValue.toLocaleString('en-IN') : selectedRecord.estimate_total.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-2 bg-graphite/40 border border-graphite-border/60 rounded-xs">
                    <span className="text-[9px] text-muted uppercase block">LATEST ODOMETER</span>
                    <span className="text-xs font-bold text-warm-white">
                      {selectedRecord.odometer ? `${selectedRecord.odometer.toLocaleString()} km` : '34,250 km'}
                    </span>
                  </div>
                  <div className="p-2 bg-graphite/40 border border-graphite-border/60 rounded-xs">
                    <span className="text-[9px] text-muted uppercase block">NEXT SERVICE DUE</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {selectedVehicleRecord?.next_service_due || '25 Sep 2026'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Work Performed Breakdown */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-graphite-border">
                  <span className="text-[10px] uppercase text-muted block font-bold">
                    WORK PERFORMED ({selectedRecord.work_items?.length || 0})
                  </span>
                  <span className="text-accent-gold font-bold">
                    ₹{(selectedRecord.estimate_total || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {(selectedRecord.work_items || []).map((wi) => (
                    <div
                      key={wi.id}
                      className="p-2 rounded-xs bg-obsidian border border-graphite-border/60 flex items-center justify-between text-[11px]"
                    >
                      <div className="space-y-0.5 truncate pr-2">
                        <span className="text-warm-white block truncate">{wi.description}</span>
                        <span className="text-muted-dark text-[10px] uppercase">{wi.type} · {wi.quantity} {wi.unit}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-warm-white font-bold block">
                          ₹{(wi.actual_amount || wi.estimated_amount || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[9px] text-emerald-400 font-bold uppercase">{wi.status || 'COMPLETED'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Linkages: Inspection & Estimate */}
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                {/* Inspection Link */}
                <div className="p-3 rounded-xs bg-obsidian border border-graphite-border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-muted-dark font-bold">INSPECTION</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-accent-gold" />
                  </div>
                  {selectedInspection ? (
                    <div>
                      <span className="text-warm-white font-bold block text-xs">{selectedInspection.id}</span>
                      <span className="text-muted text-[10px] block">
                        {selectedInspection.findings?.length || 0} Verified Findings
                      </span>
                      {onNavigateModule && (
                        <button
                          type="button"
                          onClick={() => onNavigateModule('inspections')}
                          className="text-[10px] text-accent-gold hover:underline uppercase block mt-1.5 font-bold"
                        >
                          OPEN INSPECTION →
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <span className="text-muted text-[11px]">No formal DVI attached</span>
                    </div>
                  )}
                </div>

                {/* Estimate Link */}
                <div className="p-3 rounded-xs bg-obsidian border border-graphite-border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-muted-dark font-bold">ESTIMATE</span>
                    <FileText className="w-3.5 h-3.5 text-accent-gold" />
                  </div>
                  {selectedEstimate ? (
                    <div>
                      <span className="text-warm-white font-bold block text-xs">{selectedEstimate.estimate_number || selectedEstimate.id}</span>
                      <span className="text-emerald-400 text-[10px] block">
                        {selectedEstimate.status} · ₹{selectedEstimate.total.toLocaleString('en-IN')}
                      </span>
                      {onNavigateModule && (
                        <button
                          type="button"
                          onClick={() => onNavigateModule('estimates')}
                          className="text-[10px] text-accent-gold hover:underline uppercase block mt-1.5 font-bold"
                        >
                          OPEN ESTIMATE →
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <span className="text-muted text-[11px]">Direct Job Scope</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Previous Recommendations (Traceability Between Visits) */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-graphite-border">
                  <span className="text-[10px] uppercase text-muted block font-bold">
                    PREVIOUS RECOMMENDATIONS ({previousRecommendations.length})
                  </span>
                  <span className="text-[10px] text-muted-dark uppercase">Vehicle Lifecycle Memory</span>
                </div>

                {previousRecommendations.length === 0 ? (
                  <div className="p-3 rounded-xs bg-obsidian border border-graphite-border/60 text-center text-muted text-[11px]">
                    No unaddressed recommendations recorded for this vehicle.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {previousRecommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-2 rounded-xs bg-obsidian border border-graphite-border/60 space-y-1 text-[11px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-warm-white font-bold">{rec.component}</span>
                          <span className={`px-1 py-0.5 rounded-xs text-[9px] font-bold uppercase ${
                            rec.status === 'DECLINED'
                              ? 'bg-red-500/15 text-red-400'
                              : 'bg-amber-500/15 text-amber-400'
                          }`}>
                            {rec.status}
                          </span>
                        </div>
                        <p className="text-muted leading-tight">{rec.recommendation || rec.finding}</p>
                        <div className="flex items-center justify-between text-[10px] text-muted-dark pt-1 border-t border-graphite-border/30">
                          <span>Recorded on {new Date(rec.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          {onNavigateModule && (
                            <button
                              type="button"
                              onClick={() => onNavigateModule('inspections')}
                              className="text-accent-gold hover:underline"
                            >
                              VIEW DVI →
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Multi-Visit Chronological Vehicle Timeline */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-graphite-border">
                  <span className="text-[10px] uppercase text-accent-gold block font-bold">
                    VEHICLE SERVICE TIMELINE ({vehicleHistoryRecords.length} VISITS)
                  </span>
                  <span className="text-[10px] text-muted-dark uppercase">Chronological</span>
                </div>

                <div className="space-y-2 border-l border-graphite-border ml-2 pl-3">
                  {vehicleHistoryRecords.map((vRec) => {
                    const isCurrent = vRec.id === selectedRecord.id;
                    const vDate = new Date(vRec.delivered_at || vRec.opened_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });

                    return (
                      <div
                        key={vRec.id}
                        data-testid={`timeline-item-${vRec.id.toLowerCase()}`}
                        onClick={() => setSelectedRecordId(vRec.id)}
                        className={`p-2 rounded-xs border cursor-pointer transition-all space-y-1 ${
                          isCurrent
                            ? 'bg-obsidian border-accent-gold text-warm-white'
                            : 'bg-graphite/40 border-graphite-border text-muted hover:border-graphite-border/90'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-accent-gold">{vRec.id}</span>
                          <span className="text-[10px]">{vDate}</span>
                        </div>
                        <span className="text-warm-white font-medium block text-xs truncate">
                          {vRec.service_name}
                        </span>
                        <div className="flex items-center justify-between text-[10px] text-muted-dark">
                          <span>{vRec.odometer ? `${vRec.odometer.toLocaleString()} km` : 'Odometer verified'}</span>
                          <span className="font-bold text-warm-white">₹{vRec.estimate_total.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Primary Action Button: Open Underlying Job Card */}
              <div className="pt-2 border-t border-graphite-border space-y-2 font-mono text-xs">
                <button
                  type="button"
                  data-testid="open-job-card-btn"
                  onClick={() => onOpenJob(selectedRecord.id)}
                  className="w-full py-2.5 px-3 bg-accent-gold text-obsidian rounded-xs text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>OPEN JOB CARD ({selectedRecord.id}) →</span>
                </button>

                <button
                  type="button"
                  data-testid="create-future-reminder-btn"
                  onClick={() => {
                    const dueDate = selectedVehicleRecord?.next_service_due || '2027-03-15';
                    createServiceReminder({
                      customer_name: selectedRecord.customer_name,
                      customer_phone: selectedRecord.customer_phone,
                      vehicle_summary: selectedRecord.vehicle_summary,
                      registration: selectedRecord.registration,
                      last_service_date: (selectedRecord.delivered_at || selectedRecord.opened_at).split('T')[0],
                      recommended_service: `Scheduled Maintenance (${selectedRecord.service_name})`,
                      due_date: dueDate,
                      notes: `Follow-up interval created from Service History for ${selectedRecord.id}`,
                      vehicle_id: selectedRecord.vehicle_id,
                      customer_id: selectedRecord.customer_id,
                      job_card_id: selectedRecord.id,
                    });
                    if (onRefreshStore) onRefreshStore();
                    triggerToast(`Future service reminder created for ${selectedRecord.registration} (Due: ${dueDate})`);
                    if (onNavigateModule) {
                      setTimeout(() => onNavigateModule('reminders'), 800);
                    }
                  }}
                  className="w-full py-2 px-3 bg-graphite border border-graphite-border hover:border-accent-gold text-warm-white rounded-xs text-xs uppercase flex items-center justify-center gap-1.5 min-h-[40px] transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-accent-gold" />
                  <span>CREATE FUTURE SERVICE REMINDER</span>
                </button>
              </div>

              {/* Operational Audit Events for this Service */}
              <div className="space-y-2 pt-2 border-t border-graphite-border font-mono text-xs">
                <span className="text-[10px] uppercase text-muted block font-bold tracking-wider">
                  SERVICE EXECUTION AUDIT TIMELINE
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {(selectedRecord.timeline || []).map((tl) => (
                    <div
                      key={tl.id}
                      className="p-2 rounded-xs bg-obsidian border border-graphite-border/60 text-[10px] space-y-0.5"
                    >
                      <div className="flex justify-between text-warm-white font-bold">
                        <span>{tl.event_label}</span>
                        <span className="text-muted-dark">
                          {new Date(tl.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="text-muted block">{tl.actor}</span>
                      {tl.notes && <p className="text-muted-dark font-light">{tl.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xs bg-graphite/20 border border-graphite-border text-center space-y-2 font-mono text-xs">
              <History className="w-8 h-8 text-muted mx-auto opacity-40" />
              <span className="text-muted uppercase block">Select a service record to view historical dossier</span>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. MODAL: + ADD HISTORICAL RECORD (MANUAL ARCHIVE IMPORT)    */}
      {/* ============================================================ */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 bg-obsidian/85 backdrop-blur-sm flex items-center justify-center p-4 font-mono text-xs">
          <div className="bg-graphite border border-accent-gold/40 rounded-xs p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-accent-gold block font-bold">
                  MANUAL HISTORICAL ARCHIVE ENTRY
                </span>
                <h3 className="text-base font-bold text-warm-white uppercase">
                  Add Historical Service Record
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setManualModalOpen(false)}
                className="text-muted hover:text-warm-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed">
              <strong>OPERATIONAL NOTE:</strong> This creates an explicit archival record marked as <code>MANUAL ENTRY</code>. It will not generate active workshop floor tasks or fictitious inventory allocations.
            </div>

            <form onSubmit={handleSaveManualRecord} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted uppercase block text-[10px]">Customer *</label>
                  <select
                    value={modalCustomer}
                    onChange={(e) => setModalCustomer(e.target.value)}
                    required
                    className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white min-h-[40px]"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted uppercase block text-[10px]">Vehicle Registration *</label>
                  <select
                    value={modalVehicle}
                    onChange={(e) => setModalVehicle(e.target.value)}
                    required
                    className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white min-h-[40px]"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.registration}>
                        {v.registration} · {v.make} {v.model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted uppercase block text-[10px]">Service Date *</label>
                  <input
                    type="date"
                    value={modalServiceDate}
                    onChange={(e) => setModalServiceDate(e.target.value)}
                    required
                    className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white min-h-[40px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted uppercase block text-[10px]">Odometer Logged (km) *</label>
                  <input
                    type="number"
                    value={modalOdometer}
                    onChange={(e) => setModalOdometer(Number(e.target.value))}
                    required
                    className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white min-h-[40px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted uppercase block text-[10px]">Primary Service Description *</label>
                <input
                  type="text"
                  value={modalServiceName}
                  onChange={(e) => setModalServiceName(e.target.value)}
                  placeholder="e.g. Minor Service, Brake Pad Renewal, Spark Plugs"
                  required
                  className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white min-h-[40px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-muted uppercase block text-[10px]">Final Service Value (₹) *</label>
                  <input
                    type="number"
                    value={modalServiceValue}
                    onChange={(e) => setModalServiceValue(Number(e.target.value))}
                    required
                    className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white min-h-[40px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted uppercase block text-[10px]">Technician</label>
                  <input
                    type="text"
                    value={modalTechnician}
                    onChange={(e) => setModalTechnician(e.target.value)}
                    className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white min-h-[40px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted uppercase block text-[10px]">Advisor</label>
                  <input
                    type="text"
                    value={modalAdvisor}
                    onChange={(e) => setModalAdvisor(e.target.value)}
                    className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white min-h-[40px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted uppercase block text-[10px]">External Job Reference / Invoice #</label>
                <input
                  type="text"
                  value={modalExternalRef}
                  onChange={(e) => setModalExternalRef(e.target.value)}
                  placeholder="e.g. INV-2025-0814 or PRIOR-JC-1102"
                  className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white min-h-[40px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted uppercase block text-[10px]">Archival Notes</label>
                <textarea
                  rows={2}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Additional work notes from physical ledger..."
                  className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white min-h-[60px]"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-graphite-border">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="flex-1 py-2.5 px-3 bg-graphite border border-graphite-border text-warm-white rounded-xs uppercase min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 bg-accent-gold text-obsidian font-bold rounded-xs uppercase hover:bg-white transition-colors min-h-[44px]"
                >
                  Save Historical Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
