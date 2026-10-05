import React, { useState, useMemo } from 'react';
import type {
  LeadRecord,
  LeadPriority,
  LeadStatus,
  LeadSource,
  LostReason,
} from '../../types';
import {
  Search,
  UserCheck,
  Calendar,
  ChevronRight,
  Plus,
  Phone,
  MessageSquare,
  ChevronLeft,
  Clock,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react';
import { MobileFormSheet } from '../../components/ui/MobileFormSheet';

export interface LeadsViewProps {
  leads: LeadRecord[];
  onUpdateLeadStatus: (
    id: string,
    status: LeadStatus,
    actor?: string,
    notes?: string,
    lostReason?: LostReason
  ) => void;
  onConvertToAppointment: (
    leadId: string,
    date: string,
    time: string,
    advisor?: string
  ) => void;
  onSaveNewLead: (lead: LeadRecord) => void;
  onOpenCustomer?: (customerId: string) => void;
  onOpenVehicle?: (vehicleId: string) => void;
  onOpenAppointment?: (apptId: string) => void;
  onOpenJobCard?: (jobId: string) => void;
}

export const LEAD_SOURCES: LeadSource[] = [
  'Website',
  'WhatsApp',
  'Direct Call',
  'Walk-In',
  'Instagram',
  'Google',
  'Referral',
  'Other',
];

export const LOST_REASONS: { key: LostReason; label: string }[] = [
  { key: 'CUSTOMER_DECLINED', label: 'Customer Declined Service' },
  { key: 'PRICE', label: 'Price / Quote Too High' },
  { key: 'NO_RESPONSE', label: 'Customer Unresponsive' },
  { key: 'CHANGED_MIND', label: 'Customer Postponed / Changed Mind' },
  { key: 'OUT_OF_SCOPE', label: 'Service Out of Workshop Scope' },
  { key: 'COMPETITOR', label: 'Chose Competitor / Dealership' },
  { key: 'LOCATION', label: 'Distance / Location Inconvenient' },
  { key: 'TIMING', label: 'Schedule / Turnaround Time Incompatible' },
  { key: 'OTHER', label: 'Other Operational Reason' },
];

export function isLeadFollowUpDue(lead: LeadRecord): boolean {
  if (!lead.next_follow_up_at) return false;
  if (lead.status === 'CONVERTED' || lead.status === 'LOST') return false;
  const followUpTime = new Date(lead.next_follow_up_at).getTime();
  if (isNaN(followUpTime)) return false;
  return followUpTime <= Date.now();
}

export function formatFollowUpDateTime(isoString?: string | null): string {
  if (!isoString) return 'Not Scheduled';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return (
    d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
    ' · ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  );
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads,
  onUpdateLeadStatus,
  onConvertToAppointment,
  onSaveNewLead,
  onOpenCustomer,
  onOpenVehicle,
  onOpenAppointment,
  onOpenJobCard,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [followUpDueOnly, setFollowUpDueOnly] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [advisorFilter, setAdvisorFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<
    'NEWEST' | 'OLDEST' | 'FOLLOW_UP_DUE' | 'PRIORITY' | 'STATUS'
  >('NEWEST');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(
    leads[0]?.id || null
  );

  // Mobile detail view toggle
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  // Convert to Appointment modal
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [convertDate, setConvertDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [convertTime, setConvertTime] = useState('10:00');
  const [convertAdvisor, setConvertAdvisor] = useState('Rohan Deshmukh');

  // Mark Lost modal
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [lostReason, setLostReason] = useState<LostReason>('CUSTOMER_DECLINED');
  const [lostNotes, setLostNotes] = useState('');

  // New Lead modal
  const [newLeadModalOpen, setNewLeadModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newVehicle, setNewVehicle] = useState('');
  const [newReg, setNewReg] = useState('');
  const [newService, setNewService] = useState('Computer Diagnostics');
  const [newMessage, setNewMessage] = useState('');
  const [newPriority, setNewPriority] = useState<LeadPriority>('HIGH');
  const [newSource, setNewSource] = useState<LeadSource>('Website');
  const [newAdvisor, setNewAdvisor] = useState('Rohan Deshmukh');
  const [newFollowUpDate, setNewFollowUpDate] = useState('');
  const [newFollowUpTime, setNewFollowUpTime] = useState('10:30');

  // Follow-up scheduling inline edit modal
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [editFollowUpDate, setEditFollowUpDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [editFollowUpTime, setEditFollowUpTime] = useState('10:30');

  // Feedback notifications
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Derive Operational KPIs dynamically from canonical data
  const kpiCounts = useMemo(() => {
    return {
      new: leads.filter((l) => l.status === 'NEW').length,
      followUpDue: leads.filter((l) => isLeadFollowUpDue(l)).length,
      highPriority: leads.filter(
        (l) => l.priority === 'HIGH' || l.priority === 'URGENT'
      ).length,
      appointmentRequested: leads.filter(
        (l) => l.status === 'APPOINTMENT_REQUESTED'
      ).length,
      converted: leads.filter((l) => l.status === 'CONVERTED').length,
      lost: leads.filter((l) => l.status === 'LOST').length,
    };
  }, [leads]);

  // Filtered & Sorted Leads
  const filteredLeads = useMemo(() => {
    const list = leads.filter((l) => {
      // Search across Customer, Phone, Vehicle, Registration, Service, Lead ID, Advisor
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = l.customer_name.toLowerCase().includes(q);
        const matchPhone = l.customer_phone.includes(q);
        const matchVeh = l.vehicle_summary.toLowerCase().includes(q);
        const matchReg = (l.registration || '').toLowerCase().includes(q);
        const matchService = l.service_requested.toLowerCase().includes(q);
        const matchId = l.id.toLowerCase().includes(q);
        const matchAdv = (l.assigned_advisor || '').toLowerCase().includes(q);

        if (
          !matchName &&
          !matchPhone &&
          !matchVeh &&
          !matchReg &&
          !matchService &&
          !matchId &&
          !matchAdv
        ) {
          return false;
        }
      }

      // Status Filter
      if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;

      // Follow-up Due filter
      if (followUpDueOnly && !isLeadFollowUpDue(l)) return false;

      // Priority Filter
      if (priorityFilter !== 'ALL' && l.priority !== priorityFilter) return false;

      // Source Filter
      if (sourceFilter !== 'ALL' && l.source !== sourceFilter) return false;

      // Advisor Filter
      if (advisorFilter !== 'ALL' && l.assigned_advisor !== advisorFilter)
        return false;

      return true;
    });

    if (sortBy === 'PRIORITY') {
      const priorityOrder: Record<string, number> = {
        URGENT: 0,
        HIGH: 1,
        MEDIUM: 2,
        LOW: 3,
      };
      list.sort(
        (a, b) =>
          (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4)
      );
    } else if (sortBy === 'STATUS') {
      list.sort((a, b) => a.status.localeCompare(b.status));
    } else if (sortBy === 'OLDEST') {
      list.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sortBy === 'FOLLOW_UP_DUE') {
      list.sort((a, b) => {
        const aDue = a.next_follow_up_at
          ? new Date(a.next_follow_up_at).getTime()
          : Infinity;
        const bDue = b.next_follow_up_at
          ? new Date(b.next_follow_up_at).getTime()
          : Infinity;
        return aDue - bDue;
      });
    } else {
      // Default: NEWEST
      list.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return list;
  }, [
    leads,
    search,
    statusFilter,
    followUpDueOnly,
    priorityFilter,
    sourceFilter,
    advisorFilter,
    sortBy,
  ]);

  // Keep selected lead synchronized
  const selectedLead = useMemo(() => {
    if (!selectedLeadId) return filteredLeads[0] || leads[0] || null;
    return (
      leads.find((l) => l.id === selectedLeadId) ||
      filteredLeads[0] ||
      leads[0] ||
      null
    );
  }, [leads, selectedLeadId, filteredLeads]);

  // Handlers
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    let followUpTimestamp: string | null = null;
    if (newFollowUpDate) {
      followUpTimestamp = `${newFollowUpDate}T${newFollowUpTime || '10:30'}:00+05:30`;
    }

    const leadId = 'lead-' + Date.now();
    const lead: LeadRecord = {
      id: leadId,
      created_at: new Date().toISOString(),
      source: newSource,
      customer_name: newName.trim(),
      customer_phone: newPhone.trim(),
      customer_email: newEmail.trim() || undefined,
      vehicle_summary: newVehicle.trim() || 'German Marque',
      registration: newReg.trim().toUpperCase() || undefined,
      service_requested: newService.trim(),
      message: newMessage.trim() || 'Direct customer service consultation.',
      priority: newPriority,
      assigned_advisor: newAdvisor,
      next_action: followUpTimestamp
        ? `Follow-up scheduled for ${formatFollowUpDateTime(followUpTimestamp)}`
        : 'Initial contact and vehicle diagnosis review',
      status: 'NEW',
      next_follow_up_at: followUpTimestamp,
      timeline: [
        {
          id: 'tl-lead-' + Date.now(),
          timestamp: new Date().toISOString(),
          actor: newAdvisor,
          event: `Enquiry Created via ${newSource}`,
          notes: newMessage.trim() || undefined,
        },
      ],
    };

    onSaveNewLead(lead);
    setSelectedLeadId(lead.id);
    setNewLeadModalOpen(false);
    showNotice(`Lead ${lead.id} created successfully.`);

    // Reset form
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewVehicle('');
    setNewReg('');
    setNewMessage('');
    setNewFollowUpDate('');
    setNewFollowUpTime('10:30');
  };

  const handleStatusChange = (newStatus: LeadStatus) => {
    if (!selectedLead) return;
    if (newStatus === 'LOST') {
      setLostModalOpen(true);
      return;
    }
    onUpdateLeadStatus(
      selectedLead.id,
      newStatus,
      selectedLead.assigned_advisor || 'Rohan Deshmukh',
      `Status changed to ${newStatus}`
    );
    showNotice(`Lead status updated to ${newStatus}.`);
  };

  const handleConfirmLost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    onUpdateLeadStatus(
      selectedLead.id,
      'LOST',
      selectedLead.assigned_advisor || 'Rohan Deshmukh',
      lostNotes.trim() || undefined,
      lostReason
    );
    setLostModalOpen(false);
    showNotice(`Lead ${selectedLead.id} recorded as LOST (${lostReason}).`);
  };

  const handleSaveFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    const newFollowUpAt = editFollowUpDate
      ? `${editFollowUpDate}T${editFollowUpTime || '10:30'}:00+05:30`
      : null;

    const actionText = newFollowUpAt
      ? `Follow-up scheduled for ${formatFollowUpDateTime(newFollowUpAt)}`
      : 'Initial contact and vehicle diagnosis review';

    const updatedTimeline = selectedLead.timeline || [];
    updatedTimeline.unshift({
      id: 'tl-lead-' + Date.now(),
      timestamp: new Date().toISOString(),
      actor: selectedLead.assigned_advisor || 'Rohan Deshmukh',
      event: newFollowUpAt
        ? `Follow-Up Scheduled for ${formatFollowUpDateTime(newFollowUpAt)}`
        : 'Follow-Up Schedule Cleared',
    });

    const updatedLead: LeadRecord = {
      ...selectedLead,
      next_follow_up_at: newFollowUpAt,
      next_action: actionText,
      timeline: updatedTimeline,
    };

    onSaveNewLead(updatedLead);
    setFollowUpModalOpen(false);
    showNotice('Follow-up schedule updated.');
  };

  const handleConvertSubmit = () => {
    if (!selectedLead) return;
    onConvertToAppointment(
      selectedLead.id,
      convertDate,
      convertTime,
      convertAdvisor
    );
    setConvertModalOpen(false);
    showNotice(
      `Lead ${selectedLead.id} converted to appointment for ${convertDate} at ${convertTime}.`
    );
  };

  // WhatsApp contextual link
  const getWhatsAppUrl = (lead: LeadRecord) => {
    const cleanPhone = lead.customer_phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Hello ${lead.customer_name}, this is ${
        lead.assigned_advisor || "Torque Expert's Workshop"
      }. We received your enquiry regarding your ${
        lead.vehicle_summary
      } (${lead.service_requested}). How can we assist you today?`
    );
    return `https://wa.me/${cleanPhone || '919876543210'}?text=${msg}`;
  };

  // Derive Contextual Primary Action Label & Action
  const getPrimaryAction = (lead: LeadRecord) => {
    switch (lead.status) {
      case 'NEW':
        return {
          label: 'CONTACT CUSTOMER',
          action: () => handleStatusChange('CONTACTED'),
          icon: Phone,
          color: 'bg-sky-500 text-obsidian hover:bg-white',
        };
      case 'CONTACTED':
        return {
          label: 'QUALIFY LEAD',
          action: () => handleStatusChange('QUALIFIED'),
          icon: CheckCircle2,
          color: 'bg-blue-500 text-white hover:bg-white hover:text-obsidian',
        };
      case 'QUALIFIED':
        return {
          label: 'CREATE APPOINTMENT',
          action: () => setConvertModalOpen(true),
          icon: Calendar,
          color: 'bg-accent-gold text-obsidian hover:bg-white shadow-sm',
        };
      case 'FOLLOW_UP_DUE':
        return {
          label: 'CONTACT CUSTOMER',
          action: () => handleStatusChange('CONTACTED'),
          icon: Phone,
          color: 'bg-amber-500 text-obsidian hover:bg-white',
        };
      case 'APPOINTMENT_REQUESTED':
      case 'APPOINTMENT_CONFIRMED':
        return {
          label: 'OPEN APPOINTMENT',
          action: () => {
            if (lead.appointment_id && onOpenAppointment) {
              onOpenAppointment(lead.appointment_id);
            } else {
              setConvertModalOpen(true);
            }
          },
          icon: Calendar,
          color: 'bg-emerald-500 text-obsidian hover:bg-white',
        };
      case 'CONVERTED':
        return {
          label: lead.job_card_id ? 'OPEN JOB CARD' : 'OPEN APPOINTMENT',
          action: () => {
            if (lead.job_card_id && onOpenJobCard) {
              onOpenJobCard(lead.job_card_id);
            } else if (lead.appointment_id && onOpenAppointment) {
              onOpenAppointment(lead.appointment_id);
            }
          },
          icon: FileCheck2,
          color:
            'bg-graphite border border-accent-gold text-accent-gold hover:bg-accent-gold hover:text-obsidian',
        };
      case 'LOST':
        return {
          label: 'VIEW LOSS REASON',
          action: () => setLostModalOpen(true),
          icon: AlertTriangle,
          color: 'bg-graphite border border-red-500/40 text-red-400',
        };
      default:
        return {
          label: 'SCHEDULE APPOINTMENT',
          action: () => setConvertModalOpen(true),
          icon: Calendar,
          color: 'bg-accent-gold text-obsidian hover:bg-white',
        };
    }
  };

  return (
    <div id="leads-page" className="space-y-5 sm:space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-4 right-4 z-50 bg-obsidian border border-accent-gold/50 text-warm-white text-xs px-4 py-2.5 rounded-xs shadow-xl flex items-center gap-2 font-mono animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. PAGE HEADER */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-graphite-border">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block font-bold">
            Customer Intake & Pipeline
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-warm-white">
            Leads & Enquiries
          </h1>
          <p className="text-xs sm:text-sm text-muted font-light mt-1 max-w-2xl">
            Capture every customer enquiry, qualify the opportunity, and move
            confirmed work into the workshop schedule.
          </p>
        </div>

        <button
          id="btn-new-lead"
          onClick={() => setNewLeadModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] bg-accent-gold text-obsidian rounded-xs text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Lead</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 2. OPERATIONAL KPI STRIP */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {/* 1. NEW */}
        <div
          id="leads-kpi-new"
          onClick={() => setStatusFilter(statusFilter === 'NEW' ? 'ALL' : 'NEW')}
          className={`p-3 sm:p-3.5 rounded-xs bg-graphite/40 border transition-all cursor-pointer flex flex-col justify-between min-h-[76px] ${
            statusFilter === 'NEW'
              ? 'border-sky-400 bg-sky-500/10 ring-1 ring-sky-400/40'
              : 'border-graphite-border hover:border-graphite-border/80'
          }`}
        >
          <span className="text-[10px] font-mono uppercase tracking-wider block font-semibold text-muted-dark">
            New
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono tracking-tight text-sky-400">
              {kpiCounts.new}
            </span>
            <span className="text-[9px] font-mono text-muted uppercase">Intake</span>
          </div>
        </div>

        {/* 2. FOLLOW-UP DUE */}
        <div
          id="leads-kpi-followup"
          onClick={() => {
            setFollowUpDueOnly(!followUpDueOnly);
            setStatusFilter('ALL');
          }}
          className={`p-3 sm:p-3.5 rounded-xs bg-graphite/40 border transition-all cursor-pointer flex flex-col justify-between min-h-[76px] ${
            followUpDueOnly
              ? 'border-amber-400 bg-amber-500/10 ring-1 ring-amber-400/40'
              : 'border-graphite-border hover:border-graphite-border/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider block font-semibold text-muted-dark">
              Follow-Up Due
            </span>
            {followUpDueOnly && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            )}
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono tracking-tight text-amber-400">
              {kpiCounts.followUpDue}
            </span>
            <span className="text-[9px] font-mono text-muted uppercase">Actionable</span>
          </div>
        </div>

        {/* 3. HIGH PRIORITY */}
        <div
          id="leads-kpi-high-priority"
          onClick={() =>
            setPriorityFilter(priorityFilter === 'HIGH' ? 'ALL' : 'HIGH')
          }
          className={`p-3 sm:p-3.5 rounded-xs bg-graphite/40 border transition-all cursor-pointer flex flex-col justify-between min-h-[76px] ${
            priorityFilter === 'HIGH'
              ? 'border-accent-gold bg-accent-gold/10 ring-1 ring-accent-gold/40'
              : 'border-graphite-border hover:border-graphite-border/80'
          }`}
        >
          <span className="text-[10px] font-mono uppercase tracking-wider block font-semibold text-muted-dark">
            High Priority
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono tracking-tight text-accent-gold">
              {kpiCounts.highPriority}
            </span>
            <span className="text-[9px] font-mono text-muted uppercase">Urgent</span>
          </div>
        </div>

        {/* 4. APPOINTMENT REQUESTED */}
        <div
          id="leads-kpi-appointment-requested"
          onClick={() =>
            setStatusFilter(
              statusFilter === 'APPOINTMENT_REQUESTED'
                ? 'ALL'
                : 'APPOINTMENT_REQUESTED'
            )
          }
          className={`p-3 sm:p-3.5 rounded-xs bg-graphite/40 border transition-all cursor-pointer flex flex-col justify-between min-h-[76px] ${
            statusFilter === 'APPOINTMENT_REQUESTED'
              ? 'border-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-400/40'
              : 'border-graphite-border hover:border-graphite-border/80'
          }`}
        >
          <span className="text-[10px] font-mono uppercase tracking-wider block font-semibold text-muted-dark">
            Appt Requested
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono tracking-tight text-emerald-400">
              {kpiCounts.appointmentRequested}
            </span>
            <span className="text-[9px] font-mono text-muted uppercase">Booking</span>
          </div>
        </div>

        {/* 5. CONVERTED */}
        <div
          id="leads-kpi-converted"
          onClick={() =>
            setStatusFilter(statusFilter === 'CONVERTED' ? 'ALL' : 'CONVERTED')
          }
          className={`p-3 sm:p-3.5 rounded-xs bg-graphite/40 border transition-all cursor-pointer flex flex-col justify-between min-h-[76px] ${
            statusFilter === 'CONVERTED'
              ? 'border-accent-gold bg-accent-gold/10 ring-1 ring-accent-gold/40'
              : 'border-graphite-border hover:border-graphite-border/80'
          }`}
        >
          <span className="text-[10px] font-mono uppercase tracking-wider block font-semibold text-muted-dark">
            Converted
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono tracking-tight text-warm-white">
              {kpiCounts.converted}
            </span>
            <span className="text-[9px] font-mono text-muted uppercase">Scheduled</span>
          </div>
        </div>

        {/* 6. LOST */}
        <div
          id="leads-kpi-lost"
          onClick={() =>
            setStatusFilter(statusFilter === 'LOST' ? 'ALL' : 'LOST')
          }
          className={`p-3 sm:p-3.5 rounded-xs bg-graphite/40 border transition-all cursor-pointer flex flex-col justify-between min-h-[76px] ${
            statusFilter === 'LOST'
              ? 'border-red-400 bg-red-500/10 ring-1 ring-red-400/40'
              : 'border-graphite-border hover:border-graphite-border/80'
          }`}
        >
          <span className="text-[10px] font-mono uppercase tracking-wider block font-semibold text-muted-dark">
            Lost
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono tracking-tight text-muted">
              {kpiCounts.lost}
            </span>
            <span className="text-[9px] font-mono text-muted uppercase">Closed</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. SEARCH & COMPACT FILTER BAR */}
      {/* ============================================================ */}
      <div className="bg-graphite/30 p-3 rounded-xs border border-graphite-border space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-muted-dark absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer, phone, vehicle, registration, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-obsidian border border-graphite-border rounded-xs pl-8 pr-3 py-2 text-xs text-warm-white placeholder-muted-dark focus:outline-none focus:border-accent-gold min-h-[44px] sm:min-h-[36px]"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                if (e.target.value !== 'ALL') setFollowUpDueOnly(false);
              }}
              className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px] sm:min-h-[36px]"
              aria-label="Filter by Status"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">Status: NEW</option>
              <option value="CONTACTED">Status: CONTACTED</option>
              <option value="QUALIFIED">Status: QUALIFIED</option>
              <option value="APPOINTMENT_REQUESTED">
                Status: APPOINTMENT_REQUESTED
              </option>
              <option value="APPOINTMENT_CONFIRMED">
                Status: APPOINTMENT_CONFIRMED
              </option>
              <option value="CONVERTED">Status: CONVERTED</option>
              <option value="LOST">Status: LOST</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px] sm:min-h-[36px]"
              aria-label="Filter by Priority"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Priority: URGENT</option>
              <option value="HIGH">Priority: HIGH</option>
              <option value="MEDIUM">Priority: MEDIUM</option>
              <option value="LOW">Priority: LOW</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px] sm:min-h-[36px]"
              aria-label="Filter by Source"
            >
              <option value="ALL">All Sources</option>
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>
                  Source: {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary controls row: Advisor & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-graphite-border/40 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-muted-dark tracking-wider">
              Advisor:
            </span>
            <select
              value={advisorFilter}
              onChange={(e) => setAdvisorFilter(e.target.value)}
              className="bg-obsidian border border-graphite-border rounded-xs px-2.5 py-1 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[34px]"
            >
              <option value="ALL">All Advisors</option>
              <option value="Rohan Deshmukh">Rohan Deshmukh</option>
              <option value="Pooja Varma">Pooja Varma</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-muted-dark tracking-wider">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-obsidian border border-graphite-border rounded-xs px-2.5 py-1 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[34px]"
            >
              <option value="NEWEST">Newest Enquiries First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="FOLLOW_UP_DUE">Follow-up Due</option>
              <option value="PRIORITY">Operational Priority</option>
              <option value="STATUS">Workflow Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. MAIN OPERATIONAL WORKSPACE (65/35 DESKTOP SPLIT) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* LEFT: Lead Queue (Cols 1-7 on Desktop) */}
        <div
          id="leads-queue"
          className={`lg:col-span-7 space-y-3 ${
            mobileDetailOpen ? 'hidden md:block' : 'block'
          }`}
        >
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-warm-white font-mono">
                Enquiry Queue ({filteredLeads.length})
              </span>
              {followUpDueOnly && (
                <span className="px-2 py-0.5 rounded-xs bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[9px] font-mono font-bold uppercase">
                  Follow-Up Due Active
                </span>
              )}
            </div>
            {(statusFilter !== 'ALL' ||
              followUpDueOnly ||
              priorityFilter !== 'ALL' ||
              sourceFilter !== 'ALL' ||
              advisorFilter !== 'ALL' ||
              search) && (
              <button
                onClick={() => {
                  setStatusFilter('ALL');
                  setFollowUpDueOnly(false);
                  setPriorityFilter('ALL');
                  setSourceFilter('ALL');
                  setAdvisorFilter('ALL');
                  setSearch('');
                }}
                className="text-[10px] text-accent-gold hover:underline font-mono uppercase"
              >
                Reset Filters
              </button>
            )}
          </div>

          {filteredLeads.length === 0 ? (
            <div className="border border-graphite-border rounded-xs bg-obsidian py-16 text-center text-muted space-y-2">
              <UserCheck className="w-8 h-8 text-muted-dark mx-auto" />
              <p className="text-xs font-semibold text-warm-white">
                No enquiries found
              </p>
              <p className="text-[11px] text-muted-dark">
                No customer leads match the current search or filter criteria.
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE LEAD CARDS (< 768px) */}
              <div className="md:hidden space-y-2.5">
                {filteredLeads.map((lead) => {
                  const isSelected = selectedLead?.id === lead.id;
                  const followDue = isLeadFollowUpDue(lead);
                  return (
                    <div
                      key={lead.id}
                      data-testid={`lead-card-${lead.id}`}
                      onClick={() => {
                        setSelectedLeadId(lead.id);
                        setMobileDetailOpen(true);
                      }}
                      className={`p-3.5 rounded-xs bg-obsidian border transition-colors cursor-pointer space-y-2 ${
                        isSelected
                          ? 'border-accent-gold bg-accent-gold/5'
                          : 'border-graphite-border hover:border-accent-gold/40'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-graphite-border/50">
                        <div>
                          <span className="font-bold text-warm-white text-sm block">
                            {lead.customer_name}
                          </span>
                          <span className="text-[10px] font-mono text-muted-dark">
                            {lead.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {followDue && (
                            <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-mono font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
                              DUE
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-xs text-[9px] font-mono font-bold uppercase ${
                              lead.priority === 'HIGH' ||
                              lead.priority === 'URGENT'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-graphite text-muted'
                            }`}
                          >
                            {lead.priority}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-xs text-[9px] font-mono font-bold uppercase ${
                              lead.status === 'NEW'
                                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                                : lead.status === 'CONVERTED'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : lead.status === 'LOST'
                                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                : 'bg-graphite text-muted'
                            }`}
                          >
                            {lead.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-baseline justify-between">
                          <p className="text-xs font-semibold text-warm-white">
                            {lead.vehicle_summary}
                          </p>
                          {lead.registration && (
                            <span className="text-[10px] font-mono text-accent-gold font-bold">
                              {lead.registration}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-accent-gold font-medium">
                          {lead.service_requested}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted font-mono pt-1.5 border-t border-graphite-border/30">
                        <span>{lead.customer_phone}</span>
                        <span className="text-accent-gold inline-flex items-center gap-1 text-[10px]">
                          VIEW SPECIFICATION <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP OPERATIONAL TABLE (>= 768px) */}
              <div className="hidden md:block border border-graphite-border rounded-xs bg-obsidian overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-graphite/80 border-b border-graphite-border text-[10px] font-mono uppercase text-muted-dark tracking-wider">
                      <th className="p-3">Customer / ID</th>
                      <th className="p-3">Vehicle / Service</th>
                      <th className="p-3">Source</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-graphite-border/50">
                    {filteredLeads.map((lead) => {
                      const isSelected = selectedLead?.id === lead.id;
                      const followDue = isLeadFollowUpDue(lead);
                      return (
                        <tr
                          key={lead.id}
                          data-testid={`lead-card-${lead.id}`}
                          onClick={() => setSelectedLeadId(lead.id)}
                          className={`hover:bg-graphite/40 cursor-pointer transition-colors ${
                            isSelected ? 'bg-accent-gold/10' : ''
                          }`}
                        >
                          <td className="p-3">
                            <span className="font-bold text-warm-white block">
                              {lead.customer_name}
                            </span>
                            <span className="text-[10px] text-muted-dark font-mono">
                              {lead.id} · {lead.customer_phone}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-warm-white font-medium">
                                {lead.vehicle_summary}
                              </span>
                              {lead.registration && (
                                <span className="text-[9px] font-mono text-accent-gold font-bold px-1.5 py-0.2 rounded-xs bg-graphite border border-graphite-border">
                                  {lead.registration}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-accent-gold block mt-0.5">
                              {lead.service_requested}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-[10px] font-mono text-muted uppercase">
                              {lead.source}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-xs text-[9px] font-mono font-bold uppercase ${
                                lead.priority === 'HIGH' ||
                                lead.priority === 'URGENT'
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                  : 'bg-graphite text-muted'
                              }`}
                            >
                              {lead.priority}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-xs text-[9px] font-mono font-bold uppercase ${
                                  lead.status === 'NEW'
                                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                                    : lead.status === 'CONVERTED'
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : lead.status === 'LOST'
                                    ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                    : 'bg-graphite text-muted'
                                }`}
                              >
                                {lead.status}
                              </span>
                              {followDue && (
                                <span className="px-1.5 py-0.5 rounded-xs text-[8px] font-mono font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
                                  DUE
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <ChevronRight className="w-4 h-4 text-muted ml-auto" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* RIGHT: Selected Lead Detail Dossier (Cols 8-12 on Desktop) */}
        <div
          id="lead-dossier"
          data-testid="lead-dossier"
          className={`lg:col-span-5 ${
            mobileDetailOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          {selectedLead ? (
            <div className="p-4 sm:p-5 rounded-xs bg-graphite/40 border border-graphite-border space-y-5">
              {/* Mobile back navigation bar */}
              <div className="flex md:hidden items-center justify-between pb-2 border-b border-graphite-border">
                <button
                  onClick={() => setMobileDetailOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-accent-gold uppercase min-h-[44px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Leads List</span>
                </button>
                <span className="text-xs font-mono text-muted">
                  {selectedLead.id}
                </span>
              </div>

              {/* A. LEAD HEADER */}
              <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-dark block">
                    LEAD SPECIFICATION
                  </span>
                  <h2 className="text-lg font-bold text-warm-white">
                    {selectedLead.customer_name}
                  </h2>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-xs bg-obsidian border border-graphite-border font-mono text-xs text-accent-gold font-bold block">
                    {selectedLead.id}
                  </span>
                  <span className="text-[9px] font-mono text-muted uppercase mt-0.5 block">
                    {selectedLead.source}
                  </span>
                </div>
              </div>

              {/* B. CUSTOMER & VEHICLE DETAILS */}
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xs bg-obsidian border border-graphite-border">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-dark uppercase font-mono block">
                        Vehicle
                      </span>
                      {onOpenVehicle && (
                        <button
                          onClick={() => onOpenVehicle(selectedLead.id)}
                          className="text-[9px] text-accent-gold font-mono hover:underline inline-flex items-center gap-0.5"
                        >
                          OPEN VEHICLE <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                    <span className="font-semibold text-warm-white block mt-0.5">
                      {selectedLead.vehicle_summary}
                    </span>
                    <span className="text-[10px] font-mono text-accent-gold">
                      {selectedLead.registration || 'NOT RECORDED'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-dark uppercase font-mono block">
                        Customer
                      </span>
                      {onOpenCustomer && (
                        <button
                          onClick={() => onOpenCustomer(selectedLead.id)}
                          className="text-[9px] text-accent-gold font-mono hover:underline inline-flex items-center gap-0.5"
                        >
                          CUSTOMER → <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                    <span className="font-semibold text-warm-white block mt-0.5">
                      {selectedLead.customer_name}
                    </span>
                    <span className="font-mono text-muted block text-[11px]">
                      {selectedLead.customer_phone}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-graphite-border/40">
                    <span className="text-[10px] text-muted-dark uppercase font-mono block">
                      Service Requested
                    </span>
                    <span className="text-accent-gold font-medium block mt-0.5">
                      {selectedLead.service_requested}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-graphite-border/40">
                    <span className="text-[10px] text-muted-dark uppercase font-mono block">
                      Assigned Advisor
                    </span>
                    <span className="text-warm-white font-medium block mt-0.5">
                      {selectedLead.assigned_advisor || 'Rohan Deshmukh'}
                    </span>
                  </div>
                </div>

                {/* Canonical Lineage Links */}
                {(selectedLead.appointment_id || selectedLead.job_card_id) && (
                  <div className="p-2.5 rounded-xs bg-graphite/30 border border-graphite-border text-[11px] font-mono flex items-center justify-between">
                    <span className="text-muted">Workflow Lineage:</span>
                    <div className="flex items-center gap-2">
                      {selectedLead.appointment_id && (
                        <button
                          onClick={() =>
                            onOpenAppointment &&
                            onOpenAppointment(selectedLead.appointment_id!)
                          }
                          className="text-sky-400 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          {selectedLead.appointment_id}{' '}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                      {selectedLead.job_card_id && (
                        <button
                          onClick={() =>
                            onOpenJobCard &&
                            onOpenJobCard(selectedLead.job_card_id!)
                          }
                          className="text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          {selectedLead.job_card_id}{' '}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* C. FOLLOW-UP STATUS BOX */}
                <div
                  className={`p-3 rounded-xs border text-xs space-y-1.5 transition-colors ${
                    isLeadFollowUpDue(selectedLead)
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                      : selectedLead.next_follow_up_at
                      ? 'bg-graphite/40 border-graphite-border text-warm-white'
                      : 'bg-graphite/20 border-graphite-border/60 text-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Next Follow-Up
                    </span>
                    {isLeadFollowUpDue(selectedLead) ? (
                      <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-mono font-bold uppercase bg-amber-500/25 text-amber-300 border border-amber-500/50">
                        OVERDUE / DUE TODAY
                      </span>
                    ) : selectedLead.next_follow_up_at ? (
                      <span className="text-[9px] font-mono text-muted uppercase">
                        SCHEDULED
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-muted uppercase">
                        NOT SET
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between pt-0.5">
                    <span className="font-mono text-xs font-semibold">
                      {formatFollowUpDateTime(selectedLead.next_follow_up_at)}
                    </span>
                    {selectedLead.status !== 'CONVERTED' &&
                      selectedLead.status !== 'LOST' && (
                        <button
                          onClick={() => {
                            if (selectedLead.next_follow_up_at) {
                              const [d, t] =
                                selectedLead.next_follow_up_at.split('T');
                              setEditFollowUpDate(
                                d || new Date().toISOString().split('T')[0]
                              );
                              setEditFollowUpTime(
                                t ? t.substring(0, 5) : '10:30'
                              );
                            } else {
                              setEditFollowUpDate(
                                new Date().toISOString().split('T')[0]
                              );
                              setEditFollowUpTime('10:30');
                            }
                            setFollowUpModalOpen(true);
                          }}
                          className="text-[10px] text-accent-gold hover:underline font-mono uppercase"
                        >
                          {selectedLead.next_follow_up_at
                            ? 'RESCHEDULE'
                            : '+ SCHEDULE'}
                        </button>
                      )}
                  </div>
                </div>

                {/* Direct Communication Triggers */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${selectedLead.customer_phone}`}
                    className="py-2 px-3 min-h-[44px] bg-graphite border border-graphite-border hover:border-accent-gold text-warm-white rounded-xs text-xs font-mono font-semibold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-accent-gold" />
                    <span>Call Customer</span>
                  </a>
                  <a
                    href={getWhatsAppUrl(selectedLead)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 min-h-[44px] bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-xs text-xs font-mono font-semibold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1.5"
                    title="Open WhatsApp with pre-filled message"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                {/* D. CUSTOMER MESSAGE / ISSUE */}
                <div className="p-3 rounded-xs bg-obsidian border border-graphite-border space-y-1.5">
                  <span className="text-[10px] text-muted-dark uppercase font-mono block font-semibold">
                    CUSTOMER ENQUIRY / SYMPTOM
                  </span>
                  <p className="text-muted leading-relaxed font-light text-xs">
                    "{selectedLead.message}"
                  </p>
                </div>

                {/* E. NEXT ACTION */}
                <div className="p-3 rounded-xs bg-graphite/30 border border-accent-gold/30 space-y-1">
                  <span className="text-[10px] text-accent-gold uppercase font-mono block font-bold">
                    NEXT ACTION
                  </span>
                  <p className="text-warm-white font-medium text-xs">
                    {selectedLead.next_action ||
                      'Contact customer to qualify symptoms and offer workshop inspection appointment.'}
                  </p>
                </div>

                {/* Loss Details if Lost */}
                {selectedLead.status === 'LOST' && (
                  <div className="p-3 rounded-xs bg-red-500/10 border border-red-500/30 text-xs space-y-1">
                    <span className="text-[10px] font-mono text-red-400 uppercase font-bold block">
                      LOST OPPORTUNITY
                    </span>
                    <p className="text-warm-white">
                      Reason:{' '}
                      <strong className="text-red-400">
                        {selectedLead.lost_reason || 'NOT RECORDED'}
                      </strong>
                    </p>
                    {selectedLead.lost_notes && (
                      <p className="text-muted text-[11px]">
                        Notes: {selectedLead.lost_notes}
                      </p>
                    )}
                  </div>
                )}

                {/* F. ACTIVITY TIMELINE */}
                <div
                  id="lead-activity-timeline"
                  data-testid="lead-activity-timeline"
                  className="space-y-2 pt-1"
                >
                  <span className="text-[10px] text-muted-dark uppercase font-mono block font-semibold">
                    ACTIVITY TIMELINE
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {(
                      selectedLead.timeline || [
                        {
                          id: 'tl-def',
                          timestamp: selectedLead.created_at,
                          actor: selectedLead.assigned_advisor || 'System',
                          event: `Enquiry captured via ${selectedLead.source}`,
                        },
                      ]
                    ).map((act) => (
                      <div
                        key={act.id}
                        className="p-2 rounded-xs bg-obsidian/70 border border-graphite-border/60 text-[11px] flex items-start justify-between gap-2"
                      >
                        <div>
                          <p className="text-warm-white font-medium">
                            {act.event}
                          </p>
                          <span className="text-[10px] text-muted-dark font-mono">
                            {act.actor}
                            {act.notes ? ` · ${act.notes}` : ''}
                          </span>
                        </div>
                        <span className="text-[10px] text-accent-gold font-mono shrink-0">
                          {new Date(act.timestamp).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* G. STATUS CONTROL & H. PRIMARY CONTEXTUAL ACTION */}
              <div className="pt-3 border-t border-graphite-border space-y-3">
                <div>
                  <label
                    htmlFor="lead-status-select"
                    className="text-[10px] font-mono text-muted-dark uppercase block mb-1"
                  >
                    UPDATE LEAD STATUS
                  </label>
                  <select
                    id="lead-status-select"
                    data-testid="lead-status-select"
                    value={selectedLead.status}
                    onChange={(e) => handleStatusChange(e.target.value as any)}
                    className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                  >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="QUALIFIED">QUALIFIED</option>
                    <option value="FOLLOW_UP_DUE">FOLLOW_UP_DUE</option>
                    <option value="APPOINTMENT_REQUESTED">
                      APPOINTMENT_REQUESTED
                    </option>
                    <option value="APPOINTMENT_CONFIRMED">
                      APPOINTMENT_CONFIRMED
                    </option>
                    <option value="CONVERTED">CONVERTED</option>
                    <option value="LOST">LOST</option>
                  </select>
                </div>

                {(() => {
                  const primary = getPrimaryAction(selectedLead);
                  const Icon = primary.icon;
                  return (
                    <button
                      id="lead-primary-action"
                      data-testid="lead-primary-action"
                      onClick={primary.action}
                      className={`w-full py-2.5 px-4 min-h-[44px] rounded-xs text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors font-mono ${primary.color}`}
                    >
                      <Icon className="w-4 h-4 stroke-[2.5]" />
                      <span>{primary.label}</span>
                    </button>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xs bg-graphite/20 border border-graphite-border text-center text-muted">
              <p className="text-xs">
                Select an enquiry to view details and convert to appointment.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. CONVERT TO APPOINTMENT MODAL */}
      {/* ============================================================ */}
      {/* ============================================================ */}
      {/* 5. CONVERT TO APPOINTMENT MODAL */}
      {/* ============================================================ */}
      {convertModalOpen && selectedLead && (
        <MobileFormSheet
          isOpen={convertModalOpen}
          onClose={() => setConvertModalOpen(false)}
          eyebrow="LEAD CONVERSION"
          title="SCHEDULE APPOINTMENT"
          primaryActionLabel="Confirm Appointment"
          onPrimaryAction={handleConvertSubmit}
          primaryActionVariant="gold"
          maxWidthClass="sm:max-w-md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-muted">
              Scheduling workshop intake for{' '}
              <strong className="text-warm-white">
                {selectedLead.customer_name}
              </strong>{' '}
              ({selectedLead.vehicle_summary}).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                  Requested Date *
                </label>
                <input
                  type="date"
                  value={convertDate}
                  onChange={(e) => setConvertDate(e.target.value)}
                  className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                  Requested Arrival Time *
                </label>
                <input
                  type="time"
                  value={convertTime}
                  onChange={(e) => setConvertTime(e.target.value)}
                  className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                Service Advisor
              </label>
              <div className="relative">
                <select
                  value={convertAdvisor}
                  onChange={(e) => setConvertAdvisor(e.target.value)}
                  className="w-full appearance-none bg-graphite border border-graphite-border rounded-xs px-3 py-2 pr-10 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                >
                  <option value="Rohan Deshmukh">Rohan Deshmukh</option>
                  <option value="Pooja Varma">Pooja Varma</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-3 bg-graphite/40 border border-graphite-border rounded-xs space-y-1 text-[11px] text-muted font-mono">
              <span className="text-accent-gold uppercase block font-bold">
                Canonical Lineage Record
              </span>
              <p>Lead ID: {selectedLead.id}</p>
              <p>Registration: {selectedLead.registration || 'NOT RECORDED'}</p>
              <p>Service: {selectedLead.service_requested}</p>
            </div>
          </div>
        </MobileFormSheet>
      )}

      {/* ============================================================ */}
      {/* 6. MARK LOST LEAD MODAL */}
      {/* ============================================================ */}
      {lostModalOpen && selectedLead && (
        <MobileFormSheet
          isOpen={lostModalOpen}
          onClose={() => setLostModalOpen(false)}
          eyebrow="PIPELINE STATUS"
          title="RECORD LOST OPPORTUNITY"
          primaryActionLabel="Mark as Lost"
          onPrimaryAction={() => {
            const form = document.getElementById('lost-lead-form') as HTMLFormElement;
            if (form) form.requestSubmit();
          }}
          primaryActionVariant="danger"
          maxWidthClass="sm:max-w-md"
        >
          <form
            id="lost-lead-form"
            onSubmit={handleConfirmLost}
            className="space-y-4 text-xs"
          >
            <p className="text-muted leading-relaxed">
              Please specify the reason why lead{' '}
              <strong className="text-warm-white">{selectedLead.id}</strong>{' '}
              was lost. This will remain a permanent historical business record.
            </p>

            <div>
              <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                Loss Reason *
              </label>
              <div className="relative">
                <select
                  required
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value as LostReason)}
                  className="w-full appearance-none bg-graphite border border-graphite-border rounded-xs px-3 py-2 pr-10 text-xs font-mono text-warm-white focus:outline-none focus:border-red-400 min-h-[46px]"
                >
                  {LOST_REASONS.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label}
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

            <div>
              <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                Additional Notes
              </label>
              <textarea
                rows={3}
                value={lostNotes}
                onChange={(e) => setLostNotes(e.target.value)}
                placeholder="Record customer comments or competitive quotes..."
                className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-red-400 min-h-[70px]"
              />
            </div>
          </form>
        </MobileFormSheet>
      )}

      {/* ============================================================ */}
      {/* 7. NEW LEAD MODAL */}
      {/* ============================================================ */}
      {newLeadModalOpen && (
        <MobileFormSheet
          isOpen={newLeadModalOpen}
          onClose={() => setNewLeadModalOpen(false)}
          eyebrow="NEW CUSTOMER INTAKE"
          title="LOG NEW CUSTOMER ENQUIRY"
          primaryActionLabel="Create Lead"
          onPrimaryAction={() => {
            const form = document.getElementById('new-lead-form') as HTMLFormElement;
            if (form) form.requestSubmit();
          }}
          primaryActionVariant="gold"
          maxWidthClass="sm:max-w-lg"
        >
          <form
            id="new-lead-form"
            onSubmit={handleCreateLead}
            className="space-y-4 text-xs"
          >
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya Rao"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98XXX XXXXX"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MH 02 ER 4500"
                    value={newReg}
                    onChange={(e) => setNewReg(e.target.value)}
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono uppercase text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                    Vehicle Specification *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2023 Porsche Macan GTS"
                    value={newVehicle}
                    onChange={(e) => setNewVehicle(e.target.value)}
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                    Acquisition Source *
                  </label>
                  <div className="relative">
                    <select
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value as LeadSource)}
                      className="w-full appearance-none bg-graphite border border-graphite-border rounded-xs px-3 py-2 pr-10 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                    >
                      {LEAD_SOURCES.map((s) => (
                        <option key={s} value={s}>
                          {s}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                    Service Requested *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Periodic Service + Brake Inspection"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                    Priority *
                  </label>
                  <div className="relative">
                    <select
                      value={newPriority}
                      onChange={(e) =>
                        setNewPriority(e.target.value as LeadPriority)
                      }
                      className="w-full appearance-none bg-graphite border border-graphite-border rounded-xs px-3 py-2 pr-10 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                    >
                      <option value="URGENT">URGENT</option>
                      <option value="HIGH">HIGH</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="LOW">LOW</option>
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
                <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                  Customer Enquiry / Symptoms
                </label>
                <textarea
                  rows={2}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Record customer's stated symptoms or requested scope..."
                  className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[64px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-graphite-border/50">
                <div>
                  <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                    Initial Follow-Up Date
                  </label>
                  <input
                    type="date"
                    value={newFollowUpDate}
                    onChange={(e) => setNewFollowUpDate(e.target.value)}
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                    Assigned Advisor
                  </label>
                  <div className="relative">
                    <select
                      value={newAdvisor}
                      onChange={(e) => setNewAdvisor(e.target.value)}
                      className="w-full appearance-none bg-graphite border border-graphite-border rounded-xs px-3 py-2 pr-10 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                    >
                      <option value="Rohan Deshmukh">Rohan Deshmukh</option>
                      <option value="Pooja Varma">Pooja Varma</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </MobileFormSheet>
      )}

      {/* ============================================================ */}
      {/* 8. RESCHEDULE FOLLOW-UP MODAL */}
      {/* ============================================================ */}
      {followUpModalOpen && selectedLead && (
        <MobileFormSheet
          isOpen={followUpModalOpen}
          onClose={() => setFollowUpModalOpen(false)}
          eyebrow="TASK SCHEDULING"
          title="SCHEDULE LEAD FOLLOW-UP"
          primaryActionLabel="Save Schedule"
          onPrimaryAction={() => {
            const form = document.getElementById('followup-lead-form') as HTMLFormElement;
            if (form) form.requestSubmit();
          }}
          primaryActionVariant="gold"
          maxWidthClass="sm:max-w-md"
        >
          <form
            id="followup-lead-form"
            onSubmit={handleSaveFollowUp}
            className="space-y-4 text-xs"
          >
            <p className="text-muted leading-relaxed">
              Set an actionable follow-up timestamp for{' '}
              <strong className="text-warm-white">
                {selectedLead.customer_name}
              </strong>{' '}
              ({selectedLead.vehicle_summary}).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                  Follow-Up Date *
                </label>
                <input
                  type="date"
                  required
                  value={editFollowUpDate}
                  onChange={(e) => setEditFollowUpDate(e.target.value)}
                  className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                  Follow-Up Time *
                </label>
                <input
                  type="time"
                  required
                  value={editFollowUpTime}
                  onChange={(e) => setEditFollowUpTime(e.target.value)}
                  className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                />
              </div>
            </div>

            <div className="p-3 rounded-xs bg-graphite/30 border border-graphite-border text-[11px] text-muted space-y-1">
              <span className="font-mono text-[10px] uppercase text-accent-gold block font-semibold">
                Advisor Assignment
              </span>
              <p>
                Advisor:{' '}
                <strong className="text-warm-white">
                  {selectedLead.assigned_advisor || 'Rohan Deshmukh'}
                </strong>
              </p>
              <p>
                Status:{' '}
                <strong className="text-warm-white font-mono">
                  {selectedLead.status}
                </strong>
              </p>
            </div>

            {selectedLead.next_follow_up_at && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditFollowUpDate('');
                    onSaveNewLead({
                      ...selectedLead,
                      next_follow_up_at: null,
                    });
                    setFollowUpModalOpen(false);
                    showNotice('Follow-up schedule cleared.');
                  }}
                  className="text-xs font-mono text-red-400 hover:underline uppercase inline-flex items-center gap-1.5 py-1"
                >
                  ✕ Clear Existing Follow-Up
                </button>
              </div>
            )}
          </form>
        </MobileFormSheet>
      )}
    </div>
  );
};
