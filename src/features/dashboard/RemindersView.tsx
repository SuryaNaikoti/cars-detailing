import React, { useState, useMemo } from 'react';
import type {
  ServiceReminder,
  ReminderStatus,
  ReminderType,
  ReminderPriority,
  VehicleRecord,
  JobCard,
  EstimateRecord,
} from '../../types';
import { createServiceReminder } from '../../lib/demoStore';
import {
  Bell,
  Search,
  Plus,
  Phone,
  MessageSquare,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Clock,
  Car,
  ExternalLink,
  X,
  RotateCcw,
  Check,
} from 'lucide-react';
import { MobileFormSheet } from '../../components/ui/MobileFormSheet';

export interface RemindersViewProps {
  reminders: ServiceReminder[];
  vehicles?: VehicleRecord[];
  jobs?: JobCard[];
  estimates?: Record<string, EstimateRecord>;
  onUpdateStatus: (id: string, status: ReminderStatus) => void;
  onOpenCustomer?: (name: string) => void;
  onOpenVehicle?: (registration: string) => void;
  onOpenEstimate?: (estimateId: string) => void;
  onOpenJob?: (jobId: string) => void;
  onNavigateModule?: (module: any) => void;
  onRefreshStore?: () => void;
}

// Canonical application anchor date: 21 September 2026
const APP_DATE_STR = '2026-09-21';
const APP_DATE = new Date('2026-09-21T00:00:00Z');

// Advisors list for filtering
const ADVISORS = ['Rohan Deshmukh', 'Pooja Varma', 'Vikram Malhotra'];

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  vehicles: _vehicles = [],
  jobs: _jobs = [],
  estimates: _estimates = {},
  onUpdateStatus,
  onOpenCustomer: _onOpenCustomer,
  onOpenVehicle,
  onOpenEstimate,
  onOpenJob: _onOpenJob,
  onNavigateModule,
  onRefreshStore,
}) => {
  // Top Tabs: [ OVERDUE ] [ DUE TODAY ] [ THIS WEEK ] [ UPCOMING ] [ COMPLETED ] (plus ALL)
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'OVERDUE' | 'DUE_TODAY' | 'THIS_WEEK' | 'UPCOMING' | 'COMPLETED'
  >('ALL');

  // Search state
  const [search, setSearch] = useState('');

  // Filters
  const [typeFilter, setTypeFilter] = useState<'ALL' | ReminderType>('ALL');
  const [advisorFilter, setAdvisorFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | ReminderPriority>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ReminderStatus>('ALL');
  const [sortBy, setSortBy] = useState<
    'DUE_SOONEST' | 'DUE_LATEST' | 'PRIORITY_HIGH' | 'CUSTOMER_AZ'
  >('DUE_SOONEST');

  // Modal State for New Follow-Up / Reminder
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCustomer, setModalCustomer] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalVehicle, setModalVehicle] = useState('');
  const [modalReg, setModalReg] = useState('');
  const [modalService, setModalService] = useState('');
  const [modalDueDate, setModalDueDate] = useState('2026-09-28');
  const [modalType, setModalType] = useState<ReminderType>('SERVICE_DUE');
  const [modalPriority, setModalPriority] = useState<ReminderPriority>('NORMAL');
  const [modalReason, setModalReason] = useState('');
  const [modalAdvisor, setModalAdvisor] = useState('Rohan Deshmukh');
  const [modalNotes, setModalNotes] = useState('');

  // Toast feedback
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Date classification helpers relative to 2026-09-21
  const isOverdue = (dueDateStr: string, status: ReminderStatus) => {
    if (status === 'COMPLETED') return false;
    const d = new Date(dueDateStr + 'T00:00:00Z');
    return d.getTime() < APP_DATE.getTime();
  };

  const isDueToday = (dueDateStr: string, status: ReminderStatus) => {
    if (status === 'COMPLETED') return false;
    return dueDateStr === APP_DATE_STR;
  };

  const isThisWeek = (dueDateStr: string, status: ReminderStatus) => {
    if (status === 'COMPLETED') return false;
    const d = new Date(dueDateStr + 'T00:00:00Z');
    const startMs = APP_DATE.getTime();
    const endMs = startMs + 7 * 24 * 60 * 60 * 1000;
    return d.getTime() >= startMs && d.getTime() <= endMs;
  };

  const isUpcoming = (dueDateStr: string, status: ReminderStatus) => {
    if (status === 'COMPLETED') return false;
    const d = new Date(dueDateStr + 'T00:00:00Z');
    const endOfWeekMs = APP_DATE.getTime() + 7 * 24 * 60 * 60 * 1000;
    return d.getTime() > endOfWeekMs;
  };

  // Dynamic Tab Counts derived dynamically from store
  const tabCounts = useMemo(() => {
    let overdue = 0;
    let dueToday = 0;
    let thisWeek = 0;
    let upcoming = 0;
    let completed = 0;

    reminders.forEach((r) => {
      if (r.status === 'COMPLETED') {
        completed++;
      } else {
        if (isOverdue(r.due_date, r.status)) overdue++;
        if (isDueToday(r.due_date, r.status)) dueToday++;
        if (isThisWeek(r.due_date, r.status)) thisWeek++;
        if (isUpcoming(r.due_date, r.status)) upcoming++;
      }
    });

    return {
      all: reminders.length,
      overdue,
      dueToday,
      thisWeek,
      upcoming,
      completed,
    };
  }, [reminders]);

  // Filtered and Sorted Action Queue Records
  const actionQueueRecords = useMemo(() => {
    let list = [...reminders];

    // 1. Top Tab Filtering
    if (activeTab === 'OVERDUE') {
      list = list.filter((r) => isOverdue(r.due_date, r.status));
    } else if (activeTab === 'DUE_TODAY') {
      list = list.filter((r) => isDueToday(r.due_date, r.status));
    } else if (activeTab === 'THIS_WEEK') {
      list = list.filter((r) => isThisWeek(r.due_date, r.status));
    } else if (activeTab === 'UPCOMING') {
      list = list.filter((r) => isUpcoming(r.due_date, r.status));
    } else if (activeTab === 'COMPLETED') {
      list = list.filter((r) => r.status === 'COMPLETED');
    }

    // 2. Search Query (Customer, Vehicle, Registration, Phone, Reason, Recommended Service)
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((r) => {
        return (
          r.customer_name.toLowerCase().includes(q) ||
          r.vehicle_summary.toLowerCase().includes(q) ||
          r.registration.toLowerCase().includes(q) ||
          r.customer_phone.includes(q) ||
          r.recommended_service.toLowerCase().includes(q) ||
          (r.reason && r.reason.toLowerCase().includes(q)) ||
          (r.source_estimate_number && r.source_estimate_number.toLowerCase().includes(q))
        );
      });
    }

    // 3. Dropdown Filter: Type
    if (typeFilter !== 'ALL') {
      list = list.filter((r) => {
        if (r.reminder_type) return r.reminder_type === typeFilter;
        return typeFilter === 'SERVICE_DUE';
      });
    }

    // 4. Dropdown Filter: Advisor
    if (advisorFilter !== 'ALL') {
      list = list.filter((r) => r.advisor === advisorFilter);
    }

    // 5. Dropdown Filter: Priority
    if (priorityFilter !== 'ALL') {
      list = list.filter((r) => (r.priority || 'NORMAL') === priorityFilter);
    }

    // 6. Dropdown Filter: Status
    if (statusFilter !== 'ALL') {
      list = list.filter((r) => r.status === statusFilter);
    }

    // 7. Sorting
    list.sort((a, b) => {
      if (sortBy === 'DUE_SOONEST') {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (sortBy === 'DUE_LATEST') {
        return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
      }
      if (sortBy === 'PRIORITY_HIGH') {
        const priorityWeight = { HIGH: 3, NORMAL: 2, LOW: 1 };
        const pA = priorityWeight[a.priority || 'NORMAL'] || 2;
        const pB = priorityWeight[b.priority || 'NORMAL'] || 2;
        return pB - pA;
      }
      if (sortBy === 'CUSTOMER_AZ') {
        return a.customer_name.localeCompare(b.customer_name);
      }
      return 0;
    });

    return list;
  }, [
    reminders,
    activeTab,
    search,
    typeFilter,
    advisorFilter,
    priorityFilter,
    statusFilter,
    sortBy,
  ]);

  // Contextual WhatsApp link generator
  const getWhatsAppLink = (rem: ServiceReminder) => {
    const phone = rem.customer_phone.replace(/[^0-9]/g, '');
    let text = '';

    if (rem.reminder_type === 'DECLINED_RECOMMENDATION') {
      text = `Hi ${rem.customer_name}, this is Torque Expert's regarding your ${rem.vehicle_summary} (${rem.registration}). Following your recent workshop visit, you deferred the recommendation: ${rem.recommended_service} (${rem.reason || 'Estimate context'}). Would you like us to schedule this maintenance check for you this week?`;
    } else {
      text = `Hi ${rem.customer_name}, this is Torque Expert's Workshop. Your ${rem.vehicle_summary} (${rem.registration}) is due for scheduled service: ${rem.recommended_service}. Previous service was recorded on ${rem.last_service_date}. Would you like us to reserve a service bay for you?`;
    }

    return `https://wa.me/${phone.startsWith('91') ? phone : `91${phone}`}?text=${encodeURIComponent(text)}`;
  };

  // Actions
  const handleMarkComplete = (rem: ServiceReminder) => {
    onUpdateStatus(rem.id, 'COMPLETED');
    triggerToast(`Reminder for ${rem.customer_name} marked COMPLETED.`);
    if (onRefreshStore) onRefreshStore();
  };

  const handleContacted = (rem: ServiceReminder) => {
    if (rem.status !== 'COMPLETED') {
      onUpdateStatus(rem.id, 'CONTACTED');
    }
  };

  const handleCreateReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCustomer.trim() || !modalReg.trim() || !modalService.trim()) {
      triggerToast('Please provide customer name, registration, and recommended service.');
      return;
    }

    createServiceReminder({
      customer_name: modalCustomer.trim(),
      customer_phone: modalPhone.trim() || '+91 98765 00000',
      vehicle_summary: modalVehicle.trim() || 'Customer Vehicle',
      registration: modalReg.trim().toUpperCase(),
      last_service_date: '2026-09-18',
      recommended_service: modalService.trim(),
      due_date: modalDueDate,
      reminder_type: modalType,
      priority: modalPriority,
      reason: modalReason.trim() || 'Scheduled customer follow-up',
      advisor: modalAdvisor,
      notes: modalNotes.trim() || 'Manually logged from Reminders workspace',
    });

    if (onRefreshStore) onRefreshStore();
    setModalOpen(false);
    triggerToast(`New reminder created for ${modalCustomer} (${modalReg}).`);

    // Reset form
    setModalCustomer('');
    setModalPhone('');
    setModalVehicle('');
    setModalReg('');
    setModalService('');
    setModalReason('');
    setModalNotes('');
  };

  const hasActiveFilters =
    activeTab !== 'ALL' ||
    search.trim() !== '' ||
    typeFilter !== 'ALL' ||
    advisorFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    sortBy !== 'DUE_SOONEST';

  const resetAllFilters = () => {
    setActiveTab('ALL');
    setSearch('');
    setTypeFilter('ALL');
    setAdvisorFilter('ALL');
    setPriorityFilter('ALL');
    setStatusFilter('ALL');
    setSortBy('DUE_SOONEST');
    triggerToast('All filters and search criteria reset.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div
          data-testid="reminders-toast"
          className="fixed top-5 right-5 z-50 bg-accent-gold text-obsidian px-4 py-2.5 rounded-xs font-mono text-xs font-bold shadow-2xl flex items-center gap-2 border border-white/20"
        >
          <CheckCircle2 className="w-4 h-4 text-obsidian" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. HEADER & PRIMARY ACTION                                   */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-graphite-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block">
              LIFECYCLE RETENTION & CONVERSION CONSOLE
            </span>
            <span className="px-2 py-0.5 rounded-xs bg-accent-gold/15 text-accent-gold text-[9px] font-mono font-bold">
              V4.1
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-warm-white flex items-center gap-2.5 mt-0.5">
            <Bell className="w-6 h-6 text-accent-gold" />
            Reminders & Follow-Ups
          </h1>
          <p className="text-xs text-muted font-light mt-1 max-w-2xl">
            Proactive maintenance follow-up queue, deferred inspection recommendations, and customer retention workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="px-3 py-2 rounded-xs border border-graphite-border bg-obsidian text-xs font-mono text-muted hover:text-warm-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          <button
            onClick={() => setModalOpen(true)}
            data-testid="add-reminder-btn"
            className="px-4 py-2 bg-accent-gold hover:bg-accent-gold/90 text-obsidian text-xs font-bold uppercase rounded-xs tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4" />
            + New Follow-Up
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. TOP TABS: [ OVERDUE ] [ DUE TODAY ] [ THIS WEEK ] etc.    */}
      {/* ============================================================ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs no-scrollbar">
        <button
          onClick={() => setActiveTab('ALL')}
          data-testid="tab-ALL"
          className={`px-3 py-2 rounded-xs border uppercase tracking-wider font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'ALL'
              ? 'bg-accent-gold text-obsidian border-accent-gold shadow-md font-bold'
              : 'bg-obsidian text-muted border-graphite-border hover:text-warm-white hover:border-graphite-border/90'
          }`}
        >
          <span>ALL REMINDERS</span>
          <span
            className={`px-1.5 py-0.2 rounded-xs text-[10px] ${
              activeTab === 'ALL' ? 'bg-obsidian/20 text-obsidian' : 'bg-graphite text-muted-dark'
            }`}
          >
            {tabCounts.all}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('OVERDUE')}
          data-testid="tab-OVERDUE"
          className={`px-3.5 py-2 rounded-xs border uppercase tracking-wider font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'OVERDUE'
              ? 'bg-red-500 text-white border-red-500 shadow-md font-bold'
              : 'bg-obsidian text-red-400 border-red-500/30 hover:bg-red-500/10'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>OVERDUE</span>
          <span
            className={`px-1.5 py-0.2 rounded-xs text-[10px] ${
              activeTab === 'OVERDUE' ? 'bg-black/30 text-white' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {tabCounts.overdue}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('DUE_TODAY')}
          data-testid="tab-DUE_TODAY"
          className={`px-3.5 py-2 rounded-xs border uppercase tracking-wider font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'DUE_TODAY'
              ? 'bg-amber-500 text-obsidian border-amber-500 shadow-md font-bold'
              : 'bg-obsidian text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>DUE TODAY</span>
          <span
            className={`px-1.5 py-0.2 rounded-xs text-[10px] ${
              activeTab === 'DUE_TODAY' ? 'bg-black/20 text-obsidian' : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {tabCounts.dueToday}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('THIS_WEEK')}
          data-testid="tab-THIS_WEEK"
          className={`px-3.5 py-2 rounded-xs border uppercase tracking-wider font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'THIS_WEEK'
              ? 'bg-blue-500 text-white border-blue-500 shadow-md font-bold'
              : 'bg-obsidian text-blue-400 border-blue-500/30 hover:bg-blue-500/10'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>THIS WEEK</span>
          <span
            className={`px-1.5 py-0.2 rounded-xs text-[10px] ${
              activeTab === 'THIS_WEEK' ? 'bg-black/30 text-white' : 'bg-blue-500/20 text-blue-400'
            }`}
          >
            {tabCounts.thisWeek}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('UPCOMING')}
          data-testid="tab-UPCOMING"
          className={`px-3.5 py-2 rounded-xs border uppercase tracking-wider font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'UPCOMING'
              ? 'bg-purple-500 text-white border-purple-500 shadow-md font-bold'
              : 'bg-obsidian text-purple-400 border-purple-500/30 hover:bg-purple-500/10'
          }`}
        >
          <span>UPCOMING</span>
          <span
            className={`px-1.5 py-0.2 rounded-xs text-[10px] ${
              activeTab === 'UPCOMING' ? 'bg-black/30 text-white' : 'bg-purple-500/20 text-purple-400'
            }`}
          >
            {tabCounts.upcoming}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          data-testid="tab-COMPLETED"
          className={`px-3.5 py-2 rounded-xs border uppercase tracking-wider font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'COMPLETED'
              ? 'bg-emerald-500 text-obsidian border-emerald-500 shadow-md font-bold'
              : 'bg-obsidian text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>COMPLETED</span>
          <span
            className={`px-1.5 py-0.2 rounded-xs text-[10px] ${
              activeTab === 'COMPLETED' ? 'bg-black/20 text-obsidian' : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {tabCounts.completed}
          </span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 3. SEARCH & MULTI-DIMENSIONAL FILTERS                        */}
      {/* ============================================================ */}
      <div className="p-4 rounded-xs bg-obsidian border border-graphite-border space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            data-testid="reminders-search"
            placeholder="Search customer / vehicle / registration / phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-graphite/40 border border-graphite-border rounded-xs pl-10 pr-10 py-2 text-xs text-warm-white placeholder:text-muted/60 focus:outline-none focus:border-accent-gold transition-colors font-mono"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-warm-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs font-mono">
          {/* Type Filter */}
          <div>
            <label className="text-[10px] text-muted-dark uppercase tracking-wider block mb-1">Type</label>
            <select
              value={typeFilter}
              data-testid="filter-type"
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full bg-graphite/60 border border-graphite-border rounded-xs px-2.5 py-1.5 text-warm-white focus:outline-none focus:border-accent-gold"
            >
              <option value="ALL">All Types</option>
              <option value="SERVICE_DUE">Service Due</option>
              <option value="DECLINED_RECOMMENDATION">Declined Recommendation</option>
              <option value="SEASONAL_CHECK">Seasonal Check</option>
              <option value="GENERAL_FOLLOW_UP">General Follow-Up</option>
            </select>
          </div>

          {/* Advisor Filter */}
          <div>
            <label className="text-[10px] text-muted-dark uppercase tracking-wider block mb-1">Advisor</label>
            <select
              value={advisorFilter}
              data-testid="filter-advisor"
              onChange={(e) => setAdvisorFilter(e.target.value)}
              className="w-full bg-graphite/60 border border-graphite-border rounded-xs px-2.5 py-1.5 text-warm-white focus:outline-none focus:border-accent-gold"
            >
              <option value="ALL">All Advisors</option>
              {ADVISORS.map((adv) => (
                <option key={adv} value={adv}>
                  {adv}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="text-[10px] text-muted-dark uppercase tracking-wider block mb-1">Priority</label>
            <select
              value={priorityFilter}
              data-testid="filter-priority"
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="w-full bg-graphite/60 border border-graphite-border rounded-xs px-2.5 py-1.5 text-warm-white focus:outline-none focus:border-accent-gold"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="NORMAL">Normal Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[10px] text-muted-dark uppercase tracking-wider block mb-1">Status</label>
            <select
              value={statusFilter}
              data-testid="filter-status"
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-graphite/60 border border-graphite-border rounded-xs px-2.5 py-1.5 text-warm-white focus:outline-none focus:border-accent-gold"
            >
              <option value="ALL">All Statuses</option>
              <option value="DUE">Due</option>
              <option value="OVERDUE">Overdue</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="CONTACTED">Contacted</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div>
            <label className="text-[10px] text-muted-dark uppercase tracking-wider block mb-1">Sort</label>
            <select
              value={sortBy}
              data-testid="filter-sort"
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-graphite/60 border border-graphite-border rounded-xs px-2.5 py-1.5 text-accent-gold focus:outline-none focus:border-accent-gold"
            >
              <option value="DUE_SOONEST">Due Soonest</option>
              <option value="DUE_LATEST">Due Latest</option>
              <option value="PRIORITY_HIGH">Priority (High to Low)</option>
              <option value="CUSTOMER_AZ">Customer Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. ACTION QUEUE HEADER                                       */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between pt-2 pb-1 border-b border-graphite-border">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-warm-white">
            ACTION QUEUE
          </span>
          <span className="text-xs font-mono text-muted">
            ({actionQueueRecords.length} {actionQueueRecords.length === 1 ? 'task' : 'tasks'} queued)
          </span>
        </div>

        <span className="text-[11px] font-mono text-muted-dark hidden sm:inline">
          ANCHOR DATE: 21 SEP 2026
        </span>
      </div>

      {/* ============================================================ */}
      {/* 5. ACTION QUEUE CARDS LIST                                   */}
      {/* ============================================================ */}
      {actionQueueRecords.length === 0 ? (
        <div className="p-12 text-center rounded-xs bg-obsidian border border-graphite-border space-y-3">
          <Bell className="w-8 h-8 text-muted mx-auto" />
          <p className="text-warm-white font-medium text-sm">No follow-ups matching current criteria.</p>
          <p className="text-xs text-muted max-w-sm mx-auto">
            All customer service reminders and deferred recommendation checks have either been contacted or cleared.
          </p>
          <button
            onClick={resetAllFilters}
            className="px-3 py-1.5 rounded-xs bg-graphite border border-graphite-border text-xs text-accent-gold font-mono hover:border-accent-gold transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {actionQueueRecords.map((rem) => {
            const isHighPriority = rem.priority === 'HIGH';
            const isDeclined = rem.reminder_type === 'DECLINED_RECOMMENDATION';
            const waUrl = getWhatsAppLink(rem);
            const isFinished = rem.status === 'COMPLETED';

            return (
              <div
                key={rem.id}
                data-testid={`reminder-card-${rem.id}`}
                className={`p-5 rounded-xs border transition-all duration-200 ${
                  isFinished
                    ? 'bg-obsidian/40 border-graphite-border/50 opacity-75'
                    : isHighPriority
                    ? 'bg-obsidian border-graphite-border hover:border-accent-gold/80 shadow-md'
                    : 'bg-obsidian border-graphite-border hover:border-graphite-border/90'
                }`}
              >
                {/* Top Badge Strip: Urgency & Type */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-graphite-border/60 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    {/* Priority Badge */}
                    {isHighPriority ? (
                      <span className="px-2 py-0.5 rounded-xs bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        HIGH PRIORITY
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-xs bg-graphite text-muted text-[10px] uppercase">
                        {rem.priority || 'NORMAL'}
                      </span>
                    )}

                    {/* Category / Type Tag */}
                    <span
                      className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wide ${
                        isDeclined
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-accent-gold/15 text-accent-gold border border-accent-gold/30'
                      }`}
                    >
                      {isDeclined ? 'CUSTOMER FOLLOW-UP' : 'SERVICE DUE'}
                    </span>

                    {/* Status Pill */}
                    <span
                      className={`px-2 py-0.5 rounded-xs text-[9px] font-mono font-bold uppercase ${
                        rem.status === 'OVERDUE'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : rem.status === 'DUE'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : rem.status === 'CONTACTED'
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                          : rem.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-graphite text-muted'
                      }`}
                    >
                      {rem.status}
                    </span>
                  </div>

                  {/* Advisor / ID Info */}
                  <div className="flex items-center gap-3 text-[10px] text-muted-dark">
                    {rem.advisor && (
                      <span>
                        Advisor: <span className="text-warm-white font-medium">{rem.advisor}</span>
                      </span>
                    )}
                    <span className="font-mono text-muted-dark/80">{rem.id}</span>
                  </div>
                </div>

                {/* Main Card Content: Prompt Hierarchy */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Left Column: Customer & Vehicle Asset (Cols 1-5) */}
                  <div className="md:col-span-5 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-warm-white tracking-tight">
                        {rem.customer_name}
                      </h3>
                      <span className="text-xs font-mono text-muted">{rem.customer_phone}</span>
                    </div>

                    <p className="text-xs text-warm-white font-medium">{rem.vehicle_summary}</p>
                    <p className="text-xs font-mono font-bold text-accent-gold tracking-wide">
                      {rem.registration}
                    </p>
                  </div>

                  {/* Middle Column: Specific Scope & Context (Cols 6-12) */}
                  <div className="md:col-span-7 space-y-2 bg-graphite/20 p-3 rounded-xs border border-graphite-border/50 text-xs">
                    {isDeclined ? (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold uppercase text-amber-400 text-[10px] tracking-wider">
                            DECLINED RECOMMENDATION
                          </span>
                          {rem.source_estimate_number && (
                            <span className="text-[10px] font-mono text-muted">
                              ({rem.source_estimate_number})
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-warm-white mt-0.5">
                          {rem.recommended_service}
                        </p>
                        <p className="text-[11px] text-muted mt-1">
                          {rem.reason || `Deferred during ${rem.source_estimate_number || 'Estimate'}`}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold uppercase text-accent-gold text-[10px] tracking-wider">
                            SERVICE DUE
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-warm-white mt-0.5">
                          {rem.recommended_service}
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[11px] text-muted">
                          <div>
                            Due:{' '}
                            <span
                              className={`font-semibold ${
                                isOverdue(rem.due_date, rem.status)
                                  ? 'text-red-400'
                                  : isDueToday(rem.due_date, rem.status)
                                  ? 'text-amber-400'
                                  : 'text-warm-white'
                              }`}
                            >
                              {new Date(rem.due_date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div>
                            Last service:{' '}
                            <span className="text-warm-white font-medium">
                              {new Date(rem.last_service_date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted mt-1">
                          Reason: <span className="text-warm-white">{rem.reason || 'Scheduled service interval'}</span>
                        </p>
                      </div>
                    )}

                    {rem.notes && (
                      <p className="text-[10px] text-muted-dark italic border-t border-graphite-border/40 pt-1.5">
                        Note: {rem.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Action Strip: Exact Prompt Buttons */}
                <div className="mt-4 pt-3 border-t border-graphite-border flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Primary Navigation Buttons */}
                    {isDeclined ? (
                      <button
                        type="button"
                        data-testid="view-estimate-btn"
                        onClick={() => {
                          if (onOpenEstimate && rem.source_estimate_id) {
                            onOpenEstimate(rem.source_estimate_id);
                          } else if (onNavigateModule) {
                            onNavigateModule('estimates');
                          }
                          triggerToast(`Navigating to Estimate ${rem.source_estimate_number || ''}`);
                        }}
                        className="px-3 py-1.5 bg-graphite hover:bg-graphite/80 text-warm-white border border-graphite-border rounded-xs text-xs font-mono font-semibold uppercase flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-accent-gold" />
                        [ VIEW ESTIMATE ]
                      </button>
                    ) : (
                      <button
                        type="button"
                        data-testid="open-vehicle-btn"
                        onClick={() => {
                          if (onOpenVehicle) {
                            onOpenVehicle(rem.registration);
                          } else if (onNavigateModule) {
                            onNavigateModule('vehicles');
                          }
                          triggerToast(`Opening vehicle ${rem.registration} records`);
                        }}
                        className="px-3 py-1.5 bg-graphite hover:bg-graphite/80 text-warm-white border border-graphite-border rounded-xs text-xs font-mono font-semibold uppercase flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
                      >
                        <Car className="w-3.5 h-3.5 text-accent-gold" />
                        [ OPEN VEHICLE ]
                      </button>
                    )}

                    {/* WhatsApp Action */}
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="whatsapp-btn"
                      onClick={() => handleContacted(rem)}
                      className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 rounded-xs text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      [ WHATSAPP ]
                    </a>

                    {/* Direct Call Action */}
                    <a
                      href={`tel:${rem.customer_phone}`}
                      data-testid="call-btn"
                      onClick={() => handleContacted(rem)}
                      className="px-3 py-1.5 bg-graphite hover:bg-graphite/80 text-warm-white border border-graphite-border rounded-xs text-xs font-mono font-semibold uppercase flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
                    >
                      <Phone className="w-3.5 h-3.5 text-sky-400" />
                      [ CALL ]
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Create Follow-Up Action (for declined recs or custom re-scheduling) */}
                    <button
                      type="button"
                      data-testid="create-follow-up-btn"
                      onClick={() => {
                        setModalCustomer(rem.customer_name);
                        setModalPhone(rem.customer_phone);
                        setModalVehicle(rem.vehicle_summary);
                        setModalReg(rem.registration);
                        setModalService(`Follow-up: ${rem.recommended_service}`);
                        setModalReason(rem.reason || 'Deferred recommendation follow-up');
                        setModalType(rem.reminder_type || 'GENERAL_FOLLOW_UP');
                        setModalPriority('HIGH');
                        setModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-accent-gold/10 hover:bg-accent-gold/20 text-accent-gold border border-accent-gold/30 rounded-xs text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      [ CREATE FOLLOW-UP ]
                    </button>

                    {/* Complete Action */}
                    {!isFinished && (
                      <button
                        type="button"
                        data-testid="complete-btn"
                        onClick={() => handleMarkComplete(rem)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-obsidian rounded-xs text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px] shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5 text-obsidian stroke-[3]" />
                        [ COMPLETE ]
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. MODAL: + NEW REMINDER / CREATE FUTURE FOLLOW-UP           */}
      {/* ============================================================ */}
      {modalOpen && (
        <MobileFormSheet
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          eyebrow="CUSTOMER RETENTION"
          title="SCHEDULE SERVICE FOLLOW-UP"
          primaryActionLabel="Save Follow-Up"
          onPrimaryAction={() => {
            const form = document.getElementById('reminder-modal-form') as HTMLFormElement;
            if (form) form.requestSubmit();
          }}
          primaryActionVariant="gold"
          maxWidthClass="sm:max-w-lg"
        >
          <form id="reminder-modal-form" onSubmit={handleCreateReminderSubmit} className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-dark uppercase tracking-wider block mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  data-testid="modal-input-customer"
                  value={modalCustomer}
                  onChange={(e) => setModalCustomer(e.target.value)}
                  placeholder="e.g. Rahul Mehta"
                  className="w-full bg-graphite/40 border border-graphite-border rounded-xs px-3 py-2 text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted-dark uppercase tracking-wider block mb-1">
                  Customer Phone *
                </label>
                <input
                  type="tel"
                  required
                  data-testid="modal-input-phone"
                  value={modalPhone}
                  onChange={(e) => setModalPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-graphite/40 border border-graphite-border rounded-xs px-3 py-2 text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-dark uppercase tracking-wider block mb-1">
                  Vehicle Model
                </label>
                <input
                  type="text"
                  value={modalVehicle}
                  onChange={(e) => setModalVehicle(e.target.value)}
                  placeholder="2022 BMW 5 Series (G30)"
                  className="w-full bg-graphite/40 border border-graphite-border rounded-xs px-3 py-2 text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted-dark uppercase tracking-wider block mb-1">
                  Registration *
                </label>
                <input
                  type="text"
                  required
                  data-testid="modal-input-reg"
                  value={modalReg}
                  onChange={(e) => setModalReg(e.target.value)}
                  placeholder="MH 02 ER 4500"
                  className="w-full bg-graphite/40 border border-graphite-border rounded-xs px-3 py-2 text-warm-white uppercase focus:outline-none focus:border-accent-gold min-h-[46px]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-muted-dark uppercase tracking-wider block mb-1">
                Service / Follow-Up Scope *
              </label>
              <input
                type="text"
                required
                data-testid="modal-input-service"
                value={modalService}
                onChange={(e) => setModalService(e.target.value)}
                placeholder="e.g. Front parking sensor replacement or Scheduled service interval"
                className="w-full bg-graphite/40 border border-graphite-border rounded-xs px-3 py-2 text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-muted-dark uppercase tracking-wider block mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={modalDueDate}
                  onChange={(e) => setModalDueDate(e.target.value)}
                  className="w-full bg-graphite/40 border border-graphite-border rounded-xs px-2.5 py-2 text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted-dark uppercase tracking-wider block mb-1">
                  Type
                </label>
                <div className="relative">
                  <select
                    value={modalType}
                    onChange={(e) => setModalType(e.target.value as any)}
                    className="w-full appearance-none bg-graphite/40 border border-graphite-border rounded-xs px-3 py-2 pr-10 text-warm-white focus:outline-none focus:border-accent-gold text-xs min-h-[46px]"
                  >
                    <option value="SERVICE_DUE">Service Due</option>
                    <option value="DECLINED_RECOMMENDATION">Declined Rec</option>
                    <option value="SEASONAL_CHECK">Seasonal</option>
                    <option value="GENERAL_FOLLOW_UP">General</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-muted-dark uppercase tracking-wider block mb-1">
                  Priority
                </label>
                <div className="relative">
                  <select
                    value={modalPriority}
                    onChange={(e) => setModalPriority(e.target.value as any)}
                    className="w-full appearance-none bg-graphite/40 border border-graphite-border rounded-xs px-3 py-2 pr-10 text-warm-white focus:outline-none focus:border-accent-gold text-xs min-h-[46px]"
                  >
                    <option value="HIGH">High</option>
                    <option value="NORMAL">Normal</option>
                    <option value="LOW">Low</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-dark uppercase tracking-wider block mb-1">
                  Reason / Context
                </label>
                <input
                  type="text"
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  placeholder="e.g. Deferred during EST-2026-2048"
                  className="w-full bg-graphite/40 border border-graphite-border rounded-xs px-3 py-2 text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted-dark uppercase tracking-wider block mb-1">
                  Assigned Advisor
                </label>
                <div className="relative">
                  <select
                    value={modalAdvisor}
                    onChange={(e) => setModalAdvisor(e.target.value)}
                    className="w-full appearance-none bg-graphite/40 border border-graphite-border rounded-xs px-3 py-2 pr-10 text-warm-white focus:outline-none focus:border-accent-gold text-xs min-h-[46px]"
                  >
                    {ADVISORS.map((adv) => (
                      <option key={adv} value={adv}>
                        {adv}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-muted-dark uppercase tracking-wider block mb-1">
                Internal Notes
              </label>
              <textarea
                rows={2}
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                placeholder="Customer preferences, discount authorizations, or part procurement details..."
                className="w-full bg-graphite/40 border border-graphite-border rounded-xs p-2.5 text-warm-white focus:outline-none focus:border-accent-gold resize-none min-h-[64px]"
              />
            </div>
          </form>
        </MobileFormSheet>
      )}
    </div>
  );
};
