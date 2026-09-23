import React, { useState, useMemo } from 'react';
import type { AppointmentRecord, AppointmentStatus } from '../../types';
import {
  Calendar,
  Clock,
  Plus,
  Car,
  FileCheck2,
  X,
  Search,
  Phone,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  RotateCcw,
  Gauge,
  Fuel,
  UserCheck,
} from 'lucide-react';

export interface AppointmentsViewProps {
  appointments: AppointmentRecord[];
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onUpdateAppointment?: (updated: AppointmentRecord) => void;
  onConvertToJobCard: (apptId: string) => void;
  onSaveNewAppointment: (appt: AppointmentRecord) => void;
  onOpenJobCard?: (jobId: string) => void;
  onOpenLead?: () => void;
  onOpenCustomer?: (customerId?: string) => void;
  onOpenVehicle?: (vehicleId?: string) => void;
}

const ADVISORS = ['Rohan Deshmukh', 'Pooja Varma', 'Vikram Malhotra'];
const SERVICES = [
  'Periodic Service',
  'Computer Diagnostics',
  'Brake Pad Renewal + Front Sensors',
  'AC & Cooling Systems',
  'Transmission Diagnostic & Flush',
  'Suspension Overhaul',
  'General Inspection',
];
const SOURCES: ('Website' | 'WhatsApp' | 'Direct Call' | 'Walk-In')[] = [
  'Website',
  'WhatsApp',
  'Direct Call',
  'Walk-In',
];

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  onUpdateStatus,
  onUpdateAppointment,
  onConvertToJobCard,
  onSaveNewAppointment,
  onOpenJobCard,
  onOpenLead,
  onOpenCustomer,
  onOpenVehicle,
}) => {
  // Mode & Filters
  const [scheduleMode, setScheduleMode] = useState<'today' | 'upcoming' | 'all'>('today');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [advisorFilter, setAdvisorFilter] = useState<string>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'TIME_ASC' | 'TIME_DESC' | 'STATUS' | 'NEWEST'>('TIME_ASC');

  // Selected Appointment ID for detail panel
  const [selectedApptId, setSelectedApptId] = useState<string | null>(() => {
    return appointments[0]?.id || null;
  });

  // Mobile dedicated detail panel toggle
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  // Modals
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // New Appointment Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formVehicle, setFormVehicle] = useState('');
  const [formMake, setFormMake] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formYear, setFormYear] = useState<number | ''>(2022);
  const [formReg, setFormReg] = useState('');
  const [formService, setFormService] = useState('Periodic Service');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState('10:00');
  const [formAdvisor, setFormAdvisor] = useState('Rohan Deshmukh');
  const [formSource, setFormSource] = useState<'Website' | 'WhatsApp' | 'Direct Call' | 'Walk-In'>('Direct Call');
  const [formInitialStatus, setFormInitialStatus] = useState<'REQUESTED' | 'CONFIRMED'>('CONFIRMED');
  const [formNotes, setFormNotes] = useState('');

  // Reschedule Form State
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleAdvisor, setRescheduleAdvisor] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Confirm Form State
  const [confirmDate, setConfirmDate] = useState('');
  const [confirmTime, setConfirmTime] = useState('');
  const [confirmAdvisor, setConfirmAdvisor] = useState('');
  const [confirmNotes, setConfirmNotes] = useState('');

  // Check-In Form State
  const [checkInReg, setCheckInReg] = useState('');
  const [checkInOdo, setCheckInOdo] = useState<number | ''>(35000);
  const [checkInFuel, setCheckInFuel] = useState('55%');
  const [checkInIssue, setCheckInIssue] = useState('');
  const [checkInNotes, setCheckInNotes] = useState('');

  // Cancel Form State
  const [cancelReason, setCancelReason] = useState('Customer Request');
  const [cancelNotes, setCancelNotes] = useState('');

  // Feedback notifications
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Helper to test if appointment time is past for no-show capability
  const isPastSlot = (appt: AppointmentRecord) => {
    try {
      const apptDate = new Date(`${appt.requested_date}T${appt.requested_time}:00`);
      return apptDate.getTime() < Date.now();
    } catch {
      return false;
    }
  };

  // Operational definition for appointments requiring advisor action
  const isAppointmentActionRequired = (appt: AppointmentRecord) => {
    // 1. REQUESTED appointments awaiting slot confirmation
    if (appt.status === 'REQUESTED') return true;
    // 2. ARRIVED appointments awaiting vehicle intake check-in
    if (appt.status === 'ARRIVED') return true;
    // 3. CHECKED_IN appointments awaiting Job Card issuance
    if (appt.status === 'CHECKED_IN') return true;
    // 4. Overdue CONFIRMED appointments where scheduled time has elapsed
    if (appt.status === 'CONFIRMED' && isPastSlot(appt)) return true;
    return false;
  };

  // Operational KPI metrics calculated from real data
  const kpiMetrics = useMemo(() => {
    const todayAppts = appointments.filter((a) => a.requested_date === todayStr);
    return {
      today: todayAppts.length,
      requested: appointments.filter((a) => a.status === 'REQUESTED').length,
      confirmed: appointments.filter((a) => a.status === 'CONFIRMED').length,
      arrived: appointments.filter((a) => a.status === 'ARRIVED').length,
      checkedIn: appointments.filter((a) => a.status === 'CHECKED_IN').length,
      actionNeeded: appointments.filter(isAppointmentActionRequired).length,
      noShow: appointments.filter((a) => a.status === 'NO_SHOW').length,
      cancelled: appointments.filter((a) => a.status === 'CANCELLED').length,
    };
  }, [appointments, todayStr]);

  // Filtered and Sorted Appointments
  const filteredAppointments = useMemo(() => {
    const list = appointments.filter((apt) => {
      // Schedule mode
      if (scheduleMode === 'today' && apt.requested_date !== todayStr) return false;
      if (scheduleMode === 'upcoming' && apt.requested_date < todayStr) return false;

      // Status / Operational Action filter
      if (statusFilter === 'ACTION_NEEDED') {
        if (!isAppointmentActionRequired(apt)) return false;
      } else if (statusFilter !== 'ALL' && apt.status !== statusFilter) {
        return false;
      }

      // Advisor filter
      if (advisorFilter !== 'ALL' && apt.advisor !== advisorFilter) return false;

      // Service filter
      if (serviceFilter !== 'ALL' && apt.service_name !== serviceFilter) return false;

      // Source filter
      if (sourceFilter !== 'ALL' && apt.source !== sourceFilter) return false;

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = apt.customer_name.toLowerCase().includes(q);
        const matchesPhone = apt.customer_phone.includes(q);
        const matchesVehicle = apt.vehicle_summary.toLowerCase().includes(q);
        const matchesReg = apt.registration_number?.toLowerCase().includes(q);
        const matchesService = apt.service_name.toLowerCase().includes(q);
        const matchesId = apt.id.toLowerCase().includes(q);
        const matchesLead = apt.lead_id?.toLowerCase().includes(q);
        const matchesJob = apt.job_card_id?.toLowerCase().includes(q);

        if (
          !matchesName &&
          !matchesPhone &&
          !matchesVehicle &&
          !matchesReg &&
          !matchesService &&
          !matchesId &&
          !matchesLead &&
          !matchesJob
        ) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'TIME_ASC') {
        const dateCmp = a.requested_date.localeCompare(b.requested_date);
        if (dateCmp !== 0) return dateCmp;
        return a.requested_time.localeCompare(b.requested_time);
      }
      if (sortBy === 'TIME_DESC') {
        const dateCmp = b.requested_date.localeCompare(a.requested_date);
        if (dateCmp !== 0) return dateCmp;
        return b.requested_time.localeCompare(a.requested_time);
      }
      if (sortBy === 'STATUS') {
        return a.status.localeCompare(b.status);
      }
      // NEWEST
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return list;
  }, [
    appointments,
    scheduleMode,
    todayStr,
    statusFilter,
    advisorFilter,
    serviceFilter,
    sourceFilter,
    search,
    sortBy,
  ]);

  // Selected Appointment Object
  const selectedAppt = useMemo(() => {
    if (!selectedApptId) return filteredAppointments[0] || appointments[0] || null;
    return (
      appointments.find((a) => a.id === selectedApptId) ||
      filteredAppointments[0] ||
      appointments[0] ||
      null
    );
  }, [appointments, filteredAppointments, selectedApptId]);

  // -------------------------------------------------------------
  // ACTION HANDLERS
  // -------------------------------------------------------------

  const handleCreateAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      showNotice('Customer name and phone number are required.');
      return;
    }

    const vehicleSummary =
      formVehicle.trim() ||
      (formMake && formModel
        ? `${formYear || ''} ${formMake} ${formModel}`.trim()
        : 'German Luxury Vehicle');

    const newAppt: AppointmentRecord = {
      id: 'apt-' + Date.now(),
      customer_name: formName.trim(),
      customer_phone: formPhone.trim(),
      customer_email: formEmail.trim() || undefined,
      vehicle_summary: vehicleSummary,
      vehicle_make: formMake.trim() || undefined,
      vehicle_model: formModel.trim() || undefined,
      vehicle_year: typeof formYear === 'number' ? formYear : undefined,
      registration_number: formReg.trim().toUpperCase() || undefined,
      service_name: formService,
      requested_date: formDate,
      requested_time: formTime,
      status: formInitialStatus,
      advisor: formAdvisor,
      source: formSource,
      notes: formNotes.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    onSaveNewAppointment(newAppt);
    setSelectedApptId(newAppt.id);
    setNewModalOpen(false);
    showNotice(`Appointment ${newAppt.id} booked as ${newAppt.status}.`);

    // Reset form
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormVehicle('');
    setFormMake('');
    setFormModel('');
    setFormYear(2022);
    setFormReg('');
    setFormNotes('');
  };

  const openConfirmModal = (appt: AppointmentRecord) => {
    setConfirmDate(appt.requested_date);
    setConfirmTime(appt.requested_time);
    setConfirmAdvisor(appt.advisor || 'Rohan Deshmukh');
    setConfirmNotes(appt.notes || '');
    setConfirmModalOpen(true);
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;

    const updated: AppointmentRecord = {
      ...selectedAppt,
      requested_date: confirmDate,
      requested_time: confirmTime,
      advisor: confirmAdvisor,
      notes: confirmNotes,
      status: 'CONFIRMED',
    };

    if (onUpdateAppointment) {
      onUpdateAppointment(updated);
    } else {
      onUpdateStatus(selectedAppt.id, 'CONFIRMED');
    }

    setConfirmModalOpen(false);
    showNotice(`Appointment ${selectedAppt.id} confirmed for ${confirmDate} at ${confirmTime}.`);
  };

  const openRescheduleModal = (appt: AppointmentRecord) => {
    setRescheduleDate(appt.requested_date);
    setRescheduleTime(appt.requested_time);
    setRescheduleAdvisor(appt.advisor || 'Rohan Deshmukh');
    setRescheduleReason('');
    setRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;
    if (!rescheduleDate || !rescheduleTime) {
      showNotice('Please select both a valid date and time.');
      return;
    }

    const noteAdd = rescheduleReason
      ? ` [Rescheduled from ${selectedAppt.requested_date} ${selectedAppt.requested_time}: ${rescheduleReason}]`
      : ` [Rescheduled from ${selectedAppt.requested_date} ${selectedAppt.requested_time}]`;

    const updated: AppointmentRecord = {
      ...selectedAppt,
      requested_date: rescheduleDate,
      requested_time: rescheduleTime,
      advisor: rescheduleAdvisor,
      notes: (selectedAppt.notes || '') + noteAdd,
      status: selectedAppt.status === 'REQUESTED' ? 'REQUESTED' : 'CONFIRMED',
    };

    if (onUpdateAppointment) {
      onUpdateAppointment(updated);
    } else {
      onUpdateStatus(selectedAppt.id, updated.status);
    }

    setRescheduleModalOpen(false);
    showNotice(`Appointment ${selectedAppt.id} rescheduled to ${rescheduleDate} at ${rescheduleTime}.`);
  };

  const handleMarkArrived = (appt: AppointmentRecord) => {
    const updated: AppointmentRecord = {
      ...appt,
      status: 'ARRIVED',
      arrival_time: new Date().toISOString(),
    };

    if (onUpdateAppointment) {
      onUpdateAppointment(updated);
    } else {
      onUpdateStatus(appt.id, 'ARRIVED');
    }
    showNotice(`Customer marked arrived for ${appt.id}. Physical vehicle intake unlocked.`);
  };

  const openCheckInModal = (appt: AppointmentRecord) => {
    setCheckInReg(appt.registration_number || '');
    setCheckInOdo(appt.check_in_odometer || 35000);
    setCheckInFuel(appt.check_in_fuel || '55%');
    setCheckInIssue(appt.notes || '');
    setCheckInNotes(appt.check_in_notes || '');
    setCheckInModalOpen(true);
  };

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;

    const updated: AppointmentRecord = {
      ...selectedAppt,
      status: 'CHECKED_IN',
      registration_number: checkInReg.trim().toUpperCase() || selectedAppt.registration_number,
      check_in_time: new Date().toISOString(),
      check_in_odometer: typeof checkInOdo === 'number' ? checkInOdo : 35000,
      check_in_fuel: checkInFuel,
      check_in_notes: checkInNotes.trim() || checkInIssue.trim(),
    };

    if (onUpdateAppointment) {
      onUpdateAppointment(updated);
    } else {
      onUpdateStatus(selectedAppt.id, 'CHECKED_IN');
    }

    setCheckInModalOpen(false);
    showNotice(`Vehicle intake verified for ${selectedAppt.id}. Status changed to CHECKED_IN.`);
  };

  const handleCreateJobCard = (appt: AppointmentRecord) => {
    onConvertToJobCard(appt.id);
    showNotice(`Job Card created for ${appt.id}. Appointment moved to CONVERTED.`);
  };

  const openCancelModal = () => {
    setCancelReason('Customer Request');
    setCancelNotes('');
    setCancelModalOpen(true);
  };

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;

    const updated: AppointmentRecord = {
      ...selectedAppt,
      status: 'CANCELLED',
      cancellation_reason: `${cancelReason}${cancelNotes ? ` - ${cancelNotes}` : ''}`,
    };

    if (onUpdateAppointment) {
      onUpdateAppointment(updated);
    } else {
      onUpdateStatus(selectedAppt.id, 'CANCELLED');
    }

    setCancelModalOpen(false);
    showNotice(`Appointment ${selectedAppt.id} cancelled.`);
  };

  const handleMarkNoShow = (appt: AppointmentRecord) => {
    const updated: AppointmentRecord = {
      ...appt,
      status: 'NO_SHOW',
      notes: (appt.notes || '') + ' [Customer marked as NO_SHOW by advisor]',
    };

    if (onUpdateAppointment) {
      onUpdateAppointment(updated);
    } else {
      onUpdateStatus(appt.id, 'NO_SHOW');
    }
    showNotice(`Appointment ${appt.id} recorded as NO_SHOW.`);
  };

  // WhatsApp prefilled URL generator
  const getWhatsAppUrl = (appt: AppointmentRecord) => {
    const cleanPhone = appt.customer_phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Hi ${appt.customer_name}, this is Torque Expert's regarding your scheduled workshop appointment for your ${appt.vehicle_summary} on ${appt.requested_date} at ${appt.requested_time}. Please let us know if you need any assistance prior to your arrival.`
    );
    return `https://wa.me/${cleanPhone || '919876543210'}?text=${msg}`;
  };

  // Status Badge Helper
  const renderStatusBadge = (st: AppointmentStatus) => {
    switch (st) {
      case 'REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            REQUESTED
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            CONFIRMED
          </span>
        );
      case 'ARRIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ARRIVED
          </span>
        );
      case 'CHECKED_IN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-accent-gold/20 text-accent-gold border border-accent-gold/40">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
            CHECKED IN
          </span>
        );
      case 'CONVERTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400/90 border border-emerald-500/20">
            <CheckCircle2 className="w-2.5 h-2.5" />
            CONVERTED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-graphite text-muted border border-graphite-border">
            COMPLETED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
            CANCELLED
          </span>
        );
      case 'NO_SHOW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/30">
            <AlertCircle className="w-2.5 h-2.5" />
            NO SHOW
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-graphite text-muted border border-graphite-border">
            {st}
          </span>
        );
    }
  };

  return (
    <div id="appointments-page" data-testid="appointments-page" className="space-y-5 pb-12">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-4 right-4 z-50 bg-obsidian border border-accent-gold/50 text-warm-white text-xs px-4 py-2.5 rounded-xs shadow-xl flex items-center gap-2 font-mono animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 1. APPOINTMENT DASHBOARD HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-graphite-border">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block">
            WORKSHOP SCHEDULING & INTAKE
          </span>
          <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tight text-warm-white mt-0.5">
            APPOINTMENTS
          </h1>
          <p className="text-xs text-muted font-light mt-1 max-w-2xl">
            Schedule customer visits, manage arrivals, and move confirmed vehicles into workshop intake.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setNewModalOpen(true)}
            id="btn-new-appointment"
            className="px-4 py-2.5 bg-accent-gold text-obsidian rounded-xs text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors inline-flex items-center gap-2 shadow-sm min-h-[44px]"
          >
            <Plus className="w-4 h-4 text-obsidian stroke-[2.5]" />
            <span>NEW APPOINTMENT</span>
          </button>
        </div>
      </div>

      {/* 2. OPERATIONAL KPI STRIP */}
      {/* DESKTOP: Complete 8-Card Operational Overview (Hidden on Mobile) */}
      <div className="hidden lg:grid lg:grid-cols-8 gap-2">
        {/* TODAY */}
        <button
          id="appointments-kpi-today"
          data-testid="appointments-kpi-today"
          onClick={() => {
            if (scheduleMode === 'today' && statusFilter === 'ALL') {
              setScheduleMode('all');
            } else {
              setScheduleMode('today');
              setStatusFilter('ALL');
            }
          }}
          className={`p-3 rounded-xs border text-left transition-all ${
            scheduleMode === 'today' && statusFilter === 'ALL'
              ? 'bg-graphite border-accent-gold/60 ring-1 ring-accent-gold/40'
              : 'bg-graphite/40 border-graphite-border hover:border-graphite-border/80'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-muted block">TODAY</span>
          <span className="text-xl font-black text-warm-white font-mono mt-0.5 block">
            {kpiMetrics.today}
          </span>
          <span className="text-[9px] text-muted-dark font-mono">Scheduled Today</span>
        </button>

        {/* REQUESTED */}
        <button
          id="appointments-kpi-requested"
          data-testid="appointments-kpi-requested"
          onClick={() => {
            if (statusFilter === 'REQUESTED') {
              setStatusFilter('ALL');
            } else {
              setScheduleMode('all');
              setStatusFilter('REQUESTED');
            }
          }}
          className={`p-3 rounded-xs border text-left transition-all ${
            statusFilter === 'REQUESTED'
              ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/40'
              : 'bg-graphite/40 border-graphite-border hover:border-graphite-border/80'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-amber-400 block">REQUESTED</span>
          <span className="text-xl font-black text-warm-white font-mono mt-0.5 block">
            {kpiMetrics.requested}
          </span>
          <span className="text-[9px] text-muted-dark font-mono">Awaiting Slot</span>
        </button>

        {/* CONFIRMED */}
        <button
          id="appointments-kpi-confirmed"
          data-testid="appointments-kpi-confirmed"
          onClick={() => {
            if (statusFilter === 'CONFIRMED' && scheduleMode === 'all') {
              setStatusFilter('ALL');
            } else {
              setScheduleMode('all');
              setStatusFilter('CONFIRMED');
            }
          }}
          className={`p-3 rounded-xs border text-left transition-all ${
            statusFilter === 'CONFIRMED' && scheduleMode === 'all'
              ? 'bg-sky-500/15 border-sky-500/60 ring-1 ring-sky-500/40'
              : 'bg-graphite/40 border-graphite-border hover:border-graphite-border/80'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-sky-400 block">CONFIRMED</span>
          <span className="text-xl font-black text-warm-white font-mono mt-0.5 block">
            {kpiMetrics.confirmed}
          </span>
          <span className="text-[9px] text-muted-dark font-mono">Booked Slots</span>
        </button>

        {/* ARRIVED */}
        <button
          id="appointments-kpi-arrived"
          data-testid="appointments-kpi-arrived"
          onClick={() => {
            if (statusFilter === 'ARRIVED') {
              setStatusFilter('ALL');
            } else {
              setScheduleMode('all');
              setStatusFilter('ARRIVED');
            }
          }}
          className={`p-3 rounded-xs border text-left transition-all ${
            statusFilter === 'ARRIVED'
              ? 'bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-500/40'
              : 'bg-graphite/40 border-graphite-border hover:border-graphite-border/80'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-emerald-400 block">ARRIVED</span>
          <span className="text-xl font-black text-warm-white font-mono mt-0.5 block">
            {kpiMetrics.arrived}
          </span>
          <span className="text-[9px] text-muted-dark font-mono">On Site Now</span>
        </button>

        {/* CHECKED IN */}
        <button
          id="appointments-kpi-checked-in"
          data-testid="appointments-kpi-checked-in"
          onClick={() => {
            if (statusFilter === 'CHECKED_IN') {
              setStatusFilter('ALL');
            } else {
              setScheduleMode('all');
              setStatusFilter('CHECKED_IN');
            }
          }}
          className={`p-3 rounded-xs border text-left transition-all ${
            statusFilter === 'CHECKED_IN'
              ? 'bg-accent-gold/15 border-accent-gold/60 ring-1 ring-accent-gold/40'
              : 'bg-graphite/40 border-graphite-border hover:border-graphite-border/80'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-accent-gold block">CHECKED IN</span>
          <span className="text-xl font-black text-warm-white font-mono mt-0.5 block">
            {kpiMetrics.checkedIn}
          </span>
          <span className="text-[9px] text-muted-dark font-mono">Ready For Job</span>
        </button>

        {/* ACTION NEEDED */}
        <button
          id="appointments-kpi-action-needed"
          data-testid="appointments-kpi-action-needed"
          onClick={() => {
            if (statusFilter === 'ACTION_NEEDED') {
              setStatusFilter('ALL');
            } else {
              setScheduleMode('all');
              setStatusFilter('ACTION_NEEDED');
            }
          }}
          className={`p-3 rounded-xs border text-left transition-all ${
            statusFilter === 'ACTION_NEEDED'
              ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/50'
              : 'bg-graphite/40 border-graphite-border hover:border-graphite-border/80'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-amber-300 block font-bold">
            ACTION NEEDED
          </span>
          <span className="text-xl font-black text-warm-white font-mono mt-0.5 block">
            {kpiMetrics.actionNeeded}
          </span>
          <span className="text-[9px] text-muted-dark font-mono">Advisor Intake Action</span>
        </button>

        {/* NO SHOW */}
        <button
          id="appointments-kpi-no-show"
          data-testid="appointments-kpi-no-show"
          onClick={() => {
            if (statusFilter === 'NO_SHOW') {
              setStatusFilter('ALL');
            } else {
              setScheduleMode('all');
              setStatusFilter('NO_SHOW');
            }
          }}
          className={`p-3 rounded-xs border text-left transition-all ${
            statusFilter === 'NO_SHOW'
              ? 'bg-red-500/15 border-red-500/60 ring-1 ring-red-500/40'
              : 'bg-graphite/40 border-graphite-border hover:border-graphite-border/80'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-red-400 block">NO SHOW</span>
          <span className="text-xl font-black text-warm-white font-mono mt-0.5 block">
            {kpiMetrics.noShow}
          </span>
          <span className="text-[9px] text-muted-dark font-mono">Missed Slots</span>
        </button>

        {/* CANCELLED */}
        <button
          id="appointments-kpi-cancelled"
          data-testid="appointments-kpi-cancelled"
          onClick={() => {
            if (statusFilter === 'CANCELLED') {
              setStatusFilter('ALL');
            } else {
              setScheduleMode('all');
              setStatusFilter('CANCELLED');
            }
          }}
          className={`p-3 rounded-xs border text-left transition-all ${
            statusFilter === 'CANCELLED'
              ? 'bg-graphite border-muted ring-1 ring-muted/50'
              : 'bg-graphite/40 border-graphite-border hover:border-graphite-border/80'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-muted block">CANCELLED</span>
          <span className="text-xl font-black text-warm-white font-mono mt-0.5 block">
            {kpiMetrics.cancelled}
          </span>
          <span className="text-[9px] text-muted-dark font-mono">Prior Bookings</span>
        </button>
      </div>

      {/* MOBILE: Compact 2-Column Operational Grid (< lg) */}
      <div className="lg:hidden space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {/* 1. TODAY */}
          <button
            onClick={() => {
              if (scheduleMode === 'today' && statusFilter === 'ALL') {
                setScheduleMode('all');
              } else {
                setScheduleMode('today');
                setStatusFilter('ALL');
              }
            }}
            className={`p-2.5 rounded-xs border text-left transition-all min-h-[56px] ${
              scheduleMode === 'today' && statusFilter === 'ALL'
                ? 'bg-graphite border-accent-gold/60 ring-1 ring-accent-gold/40'
                : 'bg-graphite/40 border-graphite-border hover:border-graphite-border/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-muted">TODAY</span>
              <span className="text-lg font-black text-warm-white font-mono">
                {kpiMetrics.today}
              </span>
            </div>
            <span className="text-[9px] text-muted-dark font-mono block truncate">Scheduled Today</span>
          </button>

          {/* 2. REQUESTED */}
          <button
            onClick={() => {
              if (statusFilter === 'REQUESTED') {
                setStatusFilter('ALL');
              } else {
                setScheduleMode('all');
                setStatusFilter('REQUESTED');
              }
            }}
            className={`p-2.5 rounded-xs border text-left transition-all min-h-[56px] ${
              statusFilter === 'REQUESTED'
                ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/40'
                : 'bg-graphite/40 border-graphite-border hover:border-graphite-border/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-amber-400">REQUESTED</span>
              <span className="text-lg font-black text-warm-white font-mono">
                {kpiMetrics.requested}
              </span>
            </div>
            <span className="text-[9px] text-muted-dark font-mono block truncate">Awaiting Slot</span>
          </button>

          {/* 3. CONFIRMED */}
          <button
            onClick={() => {
              if (statusFilter === 'CONFIRMED' && scheduleMode === 'all') {
                setStatusFilter('ALL');
              } else {
                setScheduleMode('all');
                setStatusFilter('CONFIRMED');
              }
            }}
            className={`p-2.5 rounded-xs border text-left transition-all min-h-[56px] ${
              statusFilter === 'CONFIRMED' && scheduleMode === 'all'
                ? 'bg-sky-500/15 border-sky-500/60 ring-1 ring-sky-500/40'
                : 'bg-graphite/40 border-graphite-border hover:border-graphite-border/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-sky-400">CONFIRMED</span>
              <span className="text-lg font-black text-warm-white font-mono">
                {kpiMetrics.confirmed}
              </span>
            </div>
            <span className="text-[9px] text-muted-dark font-mono block truncate">Booked Slots</span>
          </button>

          {/* 4. ARRIVED */}
          <button
            onClick={() => {
              if (statusFilter === 'ARRIVED') {
                setStatusFilter('ALL');
              } else {
                setScheduleMode('all');
                setStatusFilter('ARRIVED');
              }
            }}
            className={`p-2.5 rounded-xs border text-left transition-all min-h-[56px] ${
              statusFilter === 'ARRIVED'
                ? 'bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-500/40'
                : 'bg-graphite/40 border-graphite-border hover:border-graphite-border/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-emerald-400">ARRIVED</span>
              <span className="text-lg font-black text-warm-white font-mono">
                {kpiMetrics.arrived}
              </span>
            </div>
            <span className="text-[9px] text-muted-dark font-mono block truncate">On Site Now</span>
          </button>

          {/* 5. CHECKED IN */}
          <button
            onClick={() => {
              if (statusFilter === 'CHECKED_IN') {
                setStatusFilter('ALL');
              } else {
                setScheduleMode('all');
                setStatusFilter('CHECKED_IN');
              }
            }}
            className={`p-2.5 rounded-xs border text-left transition-all min-h-[56px] ${
              statusFilter === 'CHECKED_IN'
                ? 'bg-accent-gold/15 border-accent-gold/60 ring-1 ring-accent-gold/40'
                : 'bg-graphite/40 border-graphite-border hover:border-graphite-border/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-accent-gold">CHECKED IN</span>
              <span className="text-lg font-black text-warm-white font-mono">
                {kpiMetrics.checkedIn}
              </span>
            </div>
            <span className="text-[9px] text-muted-dark font-mono block truncate">Ready For Job</span>
          </button>

          {/* 6. ACTION NEEDED */}
          <button
            onClick={() => {
              if (statusFilter === 'ACTION_NEEDED') {
                setStatusFilter('ALL');
              } else {
                setScheduleMode('all');
                setStatusFilter('ACTION_NEEDED');
              }
            }}
            className={`p-2.5 rounded-xs border text-left transition-all min-h-[56px] ${
              statusFilter === 'ACTION_NEEDED'
                ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/50'
                : 'bg-graphite/40 border-graphite-border hover:border-graphite-border/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-amber-300 font-bold">ACTION NEEDED</span>
              <span className="text-lg font-black text-warm-white font-mono">
                {kpiMetrics.actionNeeded}
              </span>
            </div>
            <span className="text-[9px] text-muted-dark font-mono block truncate">Requires Advisor Action</span>
          </button>
        </div>

        {/* Secondary Compact Strip: NO SHOW & CANCELLED accessible on mobile */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (statusFilter === 'NO_SHOW') {
                setStatusFilter('ALL');
              } else {
                setScheduleMode('all');
                setStatusFilter('NO_SHOW');
              }
            }}
            className={`flex-1 px-3 py-2 rounded-xs border text-xs font-mono transition-all flex items-center justify-between min-h-[44px] ${
              statusFilter === 'NO_SHOW'
                ? 'bg-red-500/15 border-red-500/60 text-red-400 ring-1 ring-red-500/40'
                : 'bg-graphite/30 border-graphite-border text-muted hover:text-warm-white'
            }`}
          >
            <span className="text-[10px] uppercase">NO SHOW</span>
            <span className="font-bold text-warm-white font-mono">{kpiMetrics.noShow}</span>
          </button>

          <button
            onClick={() => {
              if (statusFilter === 'CANCELLED') {
                setStatusFilter('ALL');
              } else {
                setScheduleMode('all');
                setStatusFilter('CANCELLED');
              }
            }}
            className={`flex-1 px-3 py-2 rounded-xs border text-xs font-mono transition-all flex items-center justify-between min-h-[44px] ${
              statusFilter === 'CANCELLED'
                ? 'bg-graphite border-muted text-warm-white ring-1 ring-muted/50'
                : 'bg-graphite/30 border-graphite-border text-muted hover:text-warm-white'
            }`}
          >
            <span className="text-[10px] uppercase">CANCELLED</span>
            <span className="font-bold text-warm-white font-mono">{kpiMetrics.cancelled}</span>
          </button>
        </div>
      </div>

      {/* 3. SCHEDULE MODE TABS & FILTERS BAR */}
      <div className="bg-graphite/40 border border-graphite-border rounded-xs p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Schedule View Toggle */}
          <div className="flex items-center gap-1.5 bg-obsidian border border-graphite-border p-1 rounded-xs w-full sm:w-auto">
            <button
              onClick={() => setScheduleMode('today')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-mono font-bold uppercase rounded-xs transition-colors min-h-[38px] ${
                scheduleMode === 'today'
                  ? 'bg-accent-gold text-obsidian'
                  : 'text-muted hover:text-warm-white'
              }`}
            >
              TODAY'S INTAKE
            </button>
            <button
              onClick={() => setScheduleMode('upcoming')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-mono font-bold uppercase rounded-xs transition-colors min-h-[38px] ${
                scheduleMode === 'upcoming'
                  ? 'bg-accent-gold text-obsidian'
                  : 'text-muted hover:text-warm-white'
              }`}
            >
              UPCOMING SCHEDULE
            </button>
            <button
              onClick={() => setScheduleMode('all')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-mono font-bold uppercase rounded-xs transition-colors min-h-[38px] ${
                scheduleMode === 'all'
                  ? 'bg-accent-gold text-obsidian'
                  : 'text-muted hover:text-warm-white'
              }`}
            >
              ALL RECORDS
            </button>
          </div>

          {/* Quick Counter */}
          <div className="text-[11px] font-mono text-muted flex items-center gap-2">
            <span>Showing: <strong className="text-warm-white">{filteredAppointments.length}</strong> appointments</span>
            {(statusFilter !== 'ALL' || advisorFilter !== 'ALL' || serviceFilter !== 'ALL' || sourceFilter !== 'ALL' || search) && (
              <button
                onClick={() => {
                  setStatusFilter('ALL');
                  setAdvisorFilter('ALL');
                  setServiceFilter('ALL');
                  setSourceFilter('ALL');
                  setSearch('');
                  setScheduleMode('today');
                }}
                className="text-accent-gold hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Search and Secondary Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 pt-2 border-t border-graphite-border/70">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer, phone, vehicle, registration, ID..."
              className="w-full bg-obsidian border border-graphite-border rounded-xs pl-8 pr-3 py-2 text-xs text-warm-white placeholder:text-muted-dark focus:outline-none focus:border-accent-gold min-h-[44px]"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-obsidian border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTION_NEEDED">ACTION NEEDED</option>
              <option value="REQUESTED">REQUESTED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="ARRIVED">ARRIVED</option>
              <option value="CHECKED_IN">CHECKED IN</option>
              <option value="CONVERTED">CONVERTED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="NO_SHOW">NO SHOW</option>
            </select>
          </div>

          {/* Advisor Filter */}
          <div>
            <select
              value={advisorFilter}
              onChange={(e) => setAdvisorFilter(e.target.value)}
              className="w-full bg-obsidian border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
            >
              <option value="ALL">All Advisors</option>
              {ADVISORS.map((adv) => (
                <option key={adv} value={adv}>
                  {adv}
                </option>
              ))}
            </select>
          </div>

          {/* Service Filter */}
          <div>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full bg-obsidian border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
            >
              <option value="ALL">All Services</option>
              {SERVICES.map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-obsidian border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
            >
              <option value="TIME_ASC">Earliest First (Schedule)</option>
              <option value="TIME_DESC">Latest First</option>
              <option value="STATUS">Status Alphabetical</option>
              <option value="NEWEST">Newest Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. MAIN SPLIT WORKSPACE (Desktop: 65% Left, 35% Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Operational Schedule Queue (Timeline / Cards) */}
        <div id="appointments-queue" data-testid="appointments-queue" className="lg:col-span-7 space-y-3">
          {filteredAppointments.length === 0 ? (
            <div className="p-12 text-center bg-graphite/20 border border-graphite-border rounded-xs">
              <Calendar className="w-9 h-9 text-muted-dark mx-auto mb-2.5 stroke-1" />
              <h3 className="text-sm font-bold text-warm-white uppercase tracking-wider">
                No Appointments Found
              </h3>
              <p className="text-xs text-muted max-w-sm mx-auto mt-1">
                {scheduleMode === 'today'
                  ? 'No workshop visits scheduled for today matching your criteria.'
                  : 'No scheduled appointment records match your active search or filters.'}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setStatusFilter('ALL');
                    setAdvisorFilter('ALL');
                    setServiceFilter('ALL');
                    setSearch('');
                    setScheduleMode('all');
                  }}
                  className="px-3.5 py-2 bg-graphite border border-graphite-border rounded-xs text-xs font-mono uppercase text-muted hover:text-warm-white"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => setNewModalOpen(true)}
                  className="px-3.5 py-2 bg-accent-gold text-obsidian rounded-xs text-xs font-bold uppercase hover:bg-white transition-colors"
                >
                  + New Appointment
                </button>
              </div>
            </div>
          ) : (
            filteredAppointments.map((apt) => {
              const isSelected = selectedAppt?.id === apt.id;
              const isToday = apt.requested_date === todayStr;

              return (
                <div
                  key={apt.id}
                  id={`appointment-card-${apt.id}`}
                  data-testid={`appointment-card-${apt.id}`}
                  onClick={() => {
                    setSelectedApptId(apt.id);
                    setMobileDetailOpen(true);
                  }}
                  className={`p-3.5 sm:p-4 rounded-xs border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-graphite/80 border-accent-gold shadow-md'
                      : 'bg-graphite/35 border-graphite-border hover:border-accent-gold/40 hover:bg-graphite/50'
                  }`}
                >
                  {/* Top Bar: Time, Date & Status */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-graphite-border/70">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-warm-white bg-obsidian px-2.5 py-1 rounded-xs border border-graphite-border min-h-[30px]">
                        <Clock className="w-3 h-3 text-accent-gold" />
                        <span>{apt.requested_time}</span>
                      </div>
                      <span className="text-[11px] font-mono text-muted">
                        {apt.requested_date} {isToday && <span className="text-accent-gold font-bold">· TODAY</span>}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {apt.source && (
                        <span className="hidden sm:inline-block text-[9px] font-mono text-muted uppercase bg-obsidian px-1.5 py-0.5 rounded-xs border border-graphite-border/50">
                          {apt.source}
                        </span>
                      )}
                      {renderStatusBadge(apt.status)}
                    </div>
                  </div>

                  {/* Body: Customer & Vehicle */}
                  <div className="py-2.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-warm-white group-hover:text-accent-gold transition-colors">
                        {apt.customer_name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted font-mono mt-0.5">
                        <Phone className="w-3 h-3 text-muted-dark" />
                        <span>{apt.customer_phone}</span>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-warm-white">
                        <Car className="w-3.5 h-3.5 text-accent-gold" />
                        <span>{apt.vehicle_summary}</span>
                      </div>
                      {apt.registration_number && (
                        <div className="text-[11px] font-mono text-accent-gold/90 mt-0.5">
                          {apt.registration_number}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Row: Service, Advisor & Contextual Action */}
                  <div className="pt-2 border-t border-graphite-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[11px] text-muted">
                      <span className="text-warm-white font-medium">{apt.service_name}</span>
                      <span>·</span>
                      <span className="font-mono text-muted-dark">{apt.advisor || 'Rohan Deshmukh'}</span>
                    </div>

                    {/* Quick Inline Action */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      {apt.status === 'REQUESTED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openConfirmModal(apt);
                          }}
                          className="px-3 py-1.5 bg-sky-500/15 text-sky-400 border border-sky-500/30 rounded-xs text-[10px] font-mono font-bold uppercase hover:bg-sky-500/25 transition-colors min-h-[36px] flex items-center"
                        >
                          Confirm Slot
                        </button>
                      )}

                      {apt.status === 'CONFIRMED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkArrived(apt);
                          }}
                          className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xs text-[10px] font-mono font-bold uppercase hover:bg-emerald-500/30 transition-colors min-h-[36px] flex items-center"
                        >
                          Mark Arrived
                        </button>
                      )}

                      {apt.status === 'ARRIVED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openCheckInModal(apt);
                          }}
                          className="px-3 py-1.5 bg-accent-gold text-obsidian rounded-xs text-[10px] font-mono font-bold uppercase hover:bg-white transition-colors min-h-[36px] flex items-center"
                        >
                          Start Check-In
                        </button>
                      )}

                      {apt.status === 'CHECKED_IN' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateJobCard(apt);
                          }}
                          className="px-3 py-1.5 bg-accent-gold text-obsidian rounded-xs text-[10px] font-mono font-bold uppercase hover:bg-white transition-colors inline-flex items-center gap-1 min-h-[36px]"
                        >
                          <FileCheck2 className="w-3 h-3" /> Create Job Card
                        </button>
                      )}

                      {apt.status === 'CONVERTED' && apt.job_card_id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenJobCard) onOpenJobCard(apt.job_card_id!);
                          }}
                          className="px-3 py-1.5 bg-graphite border border-graphite-border text-warm-white rounded-xs text-[10px] font-mono uppercase hover:border-accent-gold transition-colors inline-flex items-center gap-1 min-h-[36px]"
                        >
                          Open {apt.job_card_id} <ExternalLink className="w-2.5 h-2.5 text-accent-gold" />
                        </button>
                      )}

                      <span className="text-muted-dark group-hover:text-accent-gold transition-colors p-1">
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>        {/* RIGHT COLUMN: Detailed Operational Specification Panel */}
        <div
          id="appointment-dossier"
          data-testid="appointment-dossier"
          className={`lg:col-span-5 bg-graphite/45 border border-graphite-border rounded-xs p-5 space-y-5 lg:sticky lg:top-4 ${
            mobileDetailOpen
              ? 'fixed inset-0 z-40 bg-obsidian p-6 overflow-y-auto lg:static lg:bg-graphite/45 lg:p-5'
              : 'hidden lg:block'
          }`}
        >
          {/* Mobile Back Button */}
          <div className="lg:hidden flex items-center justify-between pb-3 border-b border-graphite-border">
            <button
              onClick={() => setMobileDetailOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-accent-gold font-bold min-h-[44px]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>BACK TO APPOINTMENTS</span>
            </button>
            <span className="text-[10px] font-mono text-muted">{selectedAppt?.id}</span>
          </div>

          {selectedAppt ? (
            <>
              {/* Specification Header */}
              <div className="pb-4 border-b border-graphite-border space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-muted">
                    APPOINTMENT DOSSIER
                  </span>
                  <div id="appointment-status" data-testid="appointment-status">
                    {renderStatusBadge(selectedAppt.status)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black uppercase text-warm-white">
                    {selectedAppt.id}
                  </h3>
                  <span className="text-xs font-mono text-accent-gold font-bold">
                    {selectedAppt.requested_time} · {selectedAppt.requested_date}
                  </span>
                </div>
                {selectedAppt.source && (
                  <div className="text-[10px] font-mono text-muted flex items-center gap-1.5">
                    <span>Source:</span>
                    <strong className="text-warm-white">{selectedAppt.source}</strong>
                  </div>
                )}
              </div>

              {/* Customer Information Block */}
              <div className="p-3.5 bg-obsidian border border-graphite-border rounded-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-muted-dark block">
                    CUSTOMER DETAILS
                  </span>
                  {onOpenCustomer && (
                    <button
                      onClick={() => onOpenCustomer(selectedAppt.customer_phone)}
                      className="text-[10px] font-mono text-accent-gold hover:underline inline-flex items-center gap-0.5"
                    >
                      VIEW PROFILE <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-warm-white">
                      {selectedAppt.customer_name}
                    </h4>
                    <p className="text-xs font-mono text-muted mt-0.5">
                      {selectedAppt.customer_phone}
                    </p>
                    {selectedAppt.customer_email && (
                      <p className="text-[11px] text-muted-dark mt-0.5">
                        {selectedAppt.customer_email}
                      </p>
                    )}
                  </div>

                  {/* Direct Contact CTAs */}
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${selectedAppt.customer_phone}`}
                      className="p-2 bg-graphite border border-graphite-border rounded-xs text-muted hover:text-warm-white hover:border-accent-gold transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                      title="Call Customer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={getWhatsAppUrl(selectedAppt)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xs text-emerald-400 hover:bg-emerald-500/25 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                      title="Contextual WhatsApp Deep-Link"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Vehicle Specification Block */}
              <div className="p-3.5 bg-obsidian border border-graphite-border rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-muted-dark block">
                    VEHICLE SPECIFICATION
                  </span>
                  {onOpenVehicle && (
                    <button
                      onClick={() => onOpenVehicle(selectedAppt.registration_number)}
                      className="text-[10px] font-mono text-accent-gold hover:underline inline-flex items-center gap-0.5"
                    >
                      VEHICLE MASTER <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-accent-gold" />
                    <span className="text-xs font-bold text-warm-white">
                      {selectedAppt.vehicle_summary}
                    </span>
                  </div>
                  {selectedAppt.registration_number && (
                    <span className="text-xs font-mono font-bold text-accent-gold bg-graphite/80 px-2 py-0.5 rounded-xs border border-graphite-border">
                      {selectedAppt.registration_number}
                    </span>
                  )}
                </div>
                {(selectedAppt.vehicle_make || selectedAppt.vehicle_model) && (
                  <div className="text-[10px] font-mono text-muted grid grid-cols-3 gap-1 pt-1.5 border-t border-graphite-border/50">
                    <div>
                      <span className="text-muted-dark block">Make</span>
                      <strong className="text-warm-white">{selectedAppt.vehicle_make || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-muted-dark block">Model</span>
                      <strong className="text-warm-white">{selectedAppt.vehicle_model || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-muted-dark block">Year</span>
                      <strong className="text-warm-white">{selectedAppt.vehicle_year || '—'}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Service & Customer Issue */}
              <div className="p-3.5 bg-obsidian border border-graphite-border rounded-xs space-y-2">
                <span className="text-[9px] font-mono uppercase tracking-wider text-muted-dark block">
                  SERVICE REQUIREMENTS & SYMPTOMS
                </span>
                <div className="text-xs font-bold text-warm-white">
                  {selectedAppt.service_name}
                </div>
                {selectedAppt.notes ? (
                  <div className="text-[11px] text-muted italic bg-graphite/40 p-2 rounded-xs border border-graphite-border/50">
                    "{selectedAppt.notes}"
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-dark">No specific customer notes logged.</p>
                )}
              </div>

              {/* Physical Check-In Telemetry (If Checked In or Converted) */}
              {(selectedAppt.check_in_time || selectedAppt.check_in_odometer) && (
                <div className="p-3.5 bg-accent-gold/5 border border-accent-gold/30 rounded-xs space-y-2">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-accent-gold block font-bold">
                    VERIFIED INTAKE DATA
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-warm-white">
                      <Gauge className="w-3.5 h-3.5 text-accent-gold" />
                      <span>{selectedAppt.check_in_odometer?.toLocaleString()} km</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-warm-white">
                      <Fuel className="w-3.5 h-3.5 text-accent-gold" />
                      <span>Fuel: {selectedAppt.check_in_fuel || '—'}</span>
                    </div>
                  </div>
                  {selectedAppt.check_in_notes && (
                    <div className="text-[10px] text-muted font-mono pt-1.5 border-t border-accent-gold/20">
                      Intake Walkaround: {selectedAppt.check_in_notes}
                    </div>
                  )}
                </div>
              )}

              {/* Assigned Advisor & Traceability */}
              <div className="p-3.5 bg-obsidian border border-graphite-border rounded-xs space-y-2">
                <span className="text-[9px] font-mono uppercase tracking-wider text-muted-dark block">
                  WORKSHOP ALLOCATION & TRACEABILITY
                </span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Assigned Advisor:</span>
                  <strong className="text-warm-white font-mono">{selectedAppt.advisor || 'Rohan Deshmukh'}</strong>
                </div>

                {selectedAppt.lead_id && (
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-graphite-border/50">
                    <span className="text-muted">Linked Lead:</span>
                    <button
                      onClick={() => onOpenLead && onOpenLead()}
                      className="text-accent-gold font-mono font-bold hover:underline inline-flex items-center gap-1"
                    >
                      {selectedAppt.lead_id} <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}

                {selectedAppt.job_card_id && (
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-graphite-border/50">
                    <span className="text-muted">Job Card Record:</span>
                    <button
                      onClick={() => onOpenJobCard && onOpenJobCard(selectedAppt.job_card_id!)}
                      className="text-emerald-400 font-mono font-bold hover:underline inline-flex items-center gap-1"
                    >
                      {selectedAppt.job_card_id} <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Activity Timeline (Derived Real Milestones + Canonical Timeline) */}
              <div
                id="appointment-activity-timeline"
                data-testid="appointment-activity-timeline"
                className="p-3.5 bg-obsidian border border-graphite-border rounded-xs space-y-2"
              >
                <span className="text-[9px] font-mono uppercase tracking-wider text-muted-dark block">
                  APPOINTMENT ACTIVITY TIMELINE
                </span>
                <div className="space-y-2 text-[10px] font-mono">
                  {selectedAppt.timeline && selectedAppt.timeline.length > 0 ? (
                    selectedAppt.timeline.map((event) => (
                      <div key={event.id} className="flex items-center justify-between text-muted">
                        <span className="flex items-center gap-1 text-warm-white">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" /> {event.event}
                        </span>
                        <span className="text-muted-dark">
                          {new Date(event.timestamp).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-muted">
                        <span className="flex items-center gap-1 text-warm-white">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" /> Appointment Created
                        </span>
                        <span className="text-muted-dark">
                          {new Date(selectedAppt.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>

                      {selectedAppt.status !== 'REQUESTED' && (
                        <div className="flex items-center justify-between text-muted">
                          <span className="flex items-center gap-1 text-sky-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Confirmed by {selectedAppt.advisor}
                          </span>
                          <span className="text-muted-dark">Confirmed</span>
                        </div>
                      )}

                      {selectedAppt.arrival_time && (
                        <div className="flex items-center justify-between text-muted">
                          <span className="flex items-center gap-1 text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Customer Marked Arrived
                          </span>
                          <span className="text-muted-dark">On Site</span>
                        </div>
                      )}

                      {selectedAppt.check_in_time && (
                        <div className="flex items-center justify-between text-muted">
                          <span className="flex items-center gap-1 text-accent-gold">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" /> Vehicle Checked In
                          </span>
                          <span className="text-muted-dark">Intake Logged</span>
                        </div>
                      )}

                      {selectedAppt.job_card_id && (
                        <div className="flex items-center justify-between text-muted">
                          <span className="flex items-center gap-1 text-emerald-400 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Job Card {selectedAppt.job_card_id} Issued
                          </span>
                          <span className="text-muted-dark">Workshop Active</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* STATE-SPECIFIC CONTEXTUAL PRIMARY ACTIONS */}
              <div className="pt-2 border-t border-graphite-border space-y-2">
                {/* REQUESTED */}
                {selectedAppt.status === 'REQUESTED' && (
                  <div className="space-y-2">
                    <button
                      id="appointment-primary-action"
                      data-testid="appointment-primary-action"
                      onClick={() => openConfirmModal(selectedAppt)}
                      className="w-full py-2.5 bg-sky-500 text-obsidian font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-white transition-colors shadow-sm flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <CheckCircle2 className="w-4 h-4" /> CONFIRM APPOINTMENT
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openRescheduleModal(selectedAppt)}
                        className="py-2 bg-graphite border border-graphite-border text-warm-white text-xs font-mono uppercase rounded-xs hover:border-accent-gold transition-colors min-h-[44px]"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => openCancelModal()}
                        className="py-2 bg-graphite border border-graphite-border text-red-400 text-xs font-mono uppercase rounded-xs hover:border-red-500 transition-colors min-h-[44px]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* CONFIRMED */}
                {selectedAppt.status === 'CONFIRMED' && (
                  <div className="space-y-2">
                    <button
                      id="appointment-primary-action"
                      data-testid="appointment-primary-action"
                      onClick={() => handleMarkArrived(selectedAppt)}
                      className="w-full py-2.5 bg-emerald-500 text-obsidian font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-white transition-colors shadow-sm flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <UserCheck className="w-4 h-4" /> MARK ARRIVED
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openRescheduleModal(selectedAppt)}
                        className="py-2 bg-graphite border border-graphite-border text-warm-white text-xs font-mono uppercase rounded-xs hover:border-accent-gold transition-colors min-h-[44px]"
                      >
                        Reschedule
                      </button>
                      {isPastSlot(selectedAppt) ? (
                        <button
                          onClick={() => handleMarkNoShow(selectedAppt)}
                          className="py-2 bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-mono uppercase rounded-xs hover:bg-red-500/25 transition-colors min-h-[44px]"
                        >
                          Mark No-Show
                        </button>
                      ) : (
                        <button
                          onClick={() => openCancelModal()}
                          className="py-2 bg-graphite border border-graphite-border text-red-400 text-xs font-mono uppercase rounded-xs hover:border-red-500 transition-colors min-h-[44px]"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ARRIVED */}
                {selectedAppt.status === 'ARRIVED' && (
                  <div className="space-y-2">
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xs text-[11px] text-emerald-400 font-mono">
                      ✓ Customer present on site. Proceed to vehicle intake verification.
                    </div>
                    <button
                      id="btn-start-checkin"
                      data-testid="btn-start-checkin"
                      onClick={() => openCheckInModal(selectedAppt)}
                      className="w-full py-2.5 bg-accent-gold text-obsidian font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-white transition-colors shadow-sm flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <Gauge className="w-4 h-4" /> START VEHICLE CHECK-IN
                    </button>
                  </div>
                )}

                {/* CHECKED_IN */}
                {selectedAppt.status === 'CHECKED_IN' && (
                  <div className="space-y-2">
                    <div className="p-2.5 bg-accent-gold/15 border border-accent-gold/40 rounded-xs text-[11px] text-accent-gold font-mono font-bold text-center">
                      READY FOR JOB CARD
                    </div>
                    <button
                      id="btn-create-job-card"
                      data-testid="btn-create-job-card"
                      onClick={() => handleCreateJobCard(selectedAppt)}
                      className="w-full py-2.5 bg-accent-gold text-obsidian font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-white transition-colors shadow-sm flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <FileCheck2 className="w-4 h-4" /> CREATE JOB CARD
                    </button>
                  </div>
                )}

                {/* CONVERTED */}
                {selectedAppt.status === 'CONVERTED' && (
                  <div className="space-y-2">
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xs text-[11px] text-emerald-400 font-mono flex items-center justify-between">
                      <span>✓ Converted to Workshop Job</span>
                      <strong>{selectedAppt.job_card_id}</strong>
                    </div>
                    {selectedAppt.job_card_id && onOpenJobCard && (
                      <button
                        id="appointment-primary-action"
                        data-testid="appointment-primary-action"
                        onClick={() => onOpenJobCard(selectedAppt.job_card_id!)}
                        className="w-full py-2.5 bg-graphite border border-accent-gold/50 text-accent-gold font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-accent-gold hover:text-obsidian transition-colors shadow-sm flex items-center justify-center gap-1.5 min-h-[44px]"
                      >
                        OPEN JOB CARD {selectedAppt.job_card_id} →
                      </button>
                    )}
                  </div>
                )}

                {/* CANCELLED or NO_SHOW */}
                {(selectedAppt.status === 'CANCELLED' || selectedAppt.status === 'NO_SHOW') && (
                  <div className="space-y-2">
                    {selectedAppt.cancellation_reason && (
                      <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xs text-[11px] text-red-400 font-mono">
                        Reason: {selectedAppt.cancellation_reason}
                      </div>
                    )}
                    <button
                      id="appointment-primary-action"
                      data-testid="appointment-primary-action"
                      onClick={() => openRescheduleModal(selectedAppt)}
                      className="w-full py-2.5 bg-accent-gold text-obsidian font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-white transition-colors shadow-sm min-h-[44px]"
                    >
                      RESTORE & RESCHEDULE APPOINTMENT
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-muted">
              <p className="text-xs">Select an appointment from the queue to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: NEW APPOINTMENT */}
      {/* ============================================================ */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateAppointmentSubmit}
            className="bg-obsidian border border-graphite-border p-6 rounded-xs max-w-lg w-full space-y-4 my-8 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block">
                  RAPID INTAKE
                </span>
                <h4 className="text-sm font-bold uppercase text-warm-white">
                  + NEW WORKSHOP APPOINTMENT
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setNewModalOpen(false)}
                className="text-muted hover:text-warm-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Rahul Mehta"
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                    Customer Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="customer@domain.com"
                  className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                    Make
                  </label>
                  <input
                    type="text"
                    value={formMake}
                    onChange={(e) => setFormMake(e.target.value)}
                    placeholder="e.g. BMW"
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    placeholder="5 Series (G30)"
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                    Registration
                  </label>
                  <input
                    type="text"
                    value={formReg}
                    onChange={(e) => setFormReg(e.target.value)}
                    placeholder="MH 02 AB 1234"
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold uppercase font-mono min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                    Requested Service *
                  </label>
                  <select
                    value={formService}
                    onChange={(e) => setFormService(e.target.value)}
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                  >
                    {SERVICES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                    Source Channel
                  </label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value as any)}
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                  >
                    {SOURCES.map((sc) => (
                      <option key={sc} value={sc}>
                        {sc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                    Advisor
                  </label>
                  <select
                    value={formAdvisor}
                    onChange={(e) => setFormAdvisor(e.target.value)}
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-2.5 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                  >
                    {ADVISORS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                  Initial Appointment State
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer text-warm-white">
                    <input
                      type="radio"
                      name="initialStatus"
                      checked={formInitialStatus === 'CONFIRMED'}
                      onChange={() => setFormInitialStatus('CONFIRMED')}
                      className="accent-accent-gold"
                    />
                    <span>CONFIRMED (Accepted Slot)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-warm-white">
                    <input
                      type="radio"
                      name="initialStatus"
                      checked={formInitialStatus === 'REQUESTED'}
                      onChange={() => setFormInitialStatus('REQUESTED')}
                      className="accent-accent-gold"
                    />
                    <span>REQUESTED (Pending Advisor Review)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                  Customer Issue / Intake Notes
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Due for 40,000 km oil service + front brake warning inspection"
                  className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-graphite-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNewModalOpen(false)}
                className="px-4 py-2 bg-graphite text-muted hover:text-warm-white rounded-xs text-xs uppercase min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-accent-gold text-obsidian font-bold rounded-xs text-xs uppercase hover:bg-white transition-colors min-h-[44px]"
              >
                Create Appointment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: CONFIRM APPOINTMENT */}
      {/* ============================================================ */}
      {confirmModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmSubmit}
            className="bg-obsidian border border-graphite-border p-6 rounded-xs max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block">
                  ADVISOR ACTION
                </span>
                <h4 className="text-sm font-bold uppercase text-warm-white">
                  CONFIRM APPOINTMENT {selectedAppt.id}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="text-muted hover:text-warm-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-graphite/40 border border-graphite-border rounded-xs text-xs space-y-1">
              <div className="font-bold text-warm-white">{selectedAppt.customer_name}</div>
              <div className="text-muted font-mono">{selectedAppt.customer_phone}</div>
              <div className="text-accent-gold font-medium">{selectedAppt.vehicle_summary}</div>
              <div className="text-[11px] text-muted-dark">{selectedAppt.service_name}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                    Confirmed Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={confirmDate}
                    onChange={(e) => setConfirmDate(e.target.value)}
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                    Confirmed Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={confirmTime}
                    onChange={(e) => setConfirmTime(e.target.value)}
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                  Assigned Advisor
                </label>
                <select
                  value={confirmAdvisor}
                  onChange={(e) => setConfirmAdvisor(e.target.value)}
                  className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                >
                  {ADVISORS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                  Advisor Confirmation Notes
                </label>
                <textarea
                  rows={2}
                  value={confirmNotes}
                  onChange={(e) => setConfirmNotes(e.target.value)}
                  placeholder="Notes on bay slot, parts readiness or customer preferences..."
                  className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-graphite-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 bg-graphite text-muted hover:text-warm-white rounded-xs text-xs uppercase min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-500 text-obsidian font-bold rounded-xs text-xs uppercase hover:bg-white transition-colors min-h-[44px]"
              >
                Confirm Appointment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: RESCHEDULE APPOINTMENT */}
      {/* ============================================================ */}
      {rescheduleModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <form
            onSubmit={handleRescheduleSubmit}
            className="bg-obsidian border border-graphite-border p-6 rounded-xs max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block">
                  SCHEDULE MODIFICATION
                </span>
                <h4 className="text-sm font-bold uppercase text-warm-white">
                  RESCHEDULE APPOINTMENT
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleModalOpen(false)}
                className="text-muted hover:text-warm-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-graphite/40 border border-graphite-border rounded-xs text-xs space-y-1">
              <span className="text-[9px] font-mono uppercase text-muted-dark block">CURRENT SCHEDULE</span>
              <div className="font-mono text-warm-white font-bold">
                {selectedAppt.requested_date} · {selectedAppt.requested_time}
              </div>
              <div className="text-muted">{selectedAppt.customer_name} — {selectedAppt.vehicle_summary}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                    New Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                    New Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                  Advisor
                </label>
                <select
                  value={rescheduleAdvisor}
                  onChange={(e) => setRescheduleAdvisor(e.target.value)}
                  className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                >
                  {ADVISORS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                  Reason for Rescheduling
                </label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Customer requested afternoon slot instead"
                  className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-graphite-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRescheduleModalOpen(false)}
                className="px-4 py-2 bg-graphite text-muted hover:text-warm-white rounded-xs text-xs uppercase min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-accent-gold text-obsidian font-bold rounded-xs text-xs uppercase hover:bg-white transition-colors min-h-[44px]"
              >
                Save New Time
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: VEHICLE CHECK-IN (Intake Handoff) */}
      {/* ============================================================ */}
      {checkInModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleCheckInSubmit}
            className="bg-obsidian border border-accent-gold/40 p-6 rounded-xs max-w-md w-full space-y-4 my-8 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block">
                  PHYSICAL VEHICLE INTAKE
                </span>
                <h4 className="text-sm font-bold uppercase text-warm-white">
                  START VEHICLE CHECK-IN
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setCheckInModalOpen(false)}
                className="text-muted hover:text-warm-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-graphite/40 border border-graphite-border rounded-xs text-xs space-y-1">
              <div className="font-bold text-warm-white">{selectedAppt.customer_name}</div>
              <div className="text-accent-gold font-medium">{selectedAppt.vehicle_summary}</div>
              <div className="text-muted text-[11px]">Requested: {selectedAppt.service_name}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                  License Plate Registration *
                </label>
                <input
                  type="text"
                  required
                  value={checkInReg}
                  onChange={(e) => setCheckInReg(e.target.value)}
                  placeholder="e.g. MH 02 ER 4500"
                  className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono uppercase text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                    Current Odometer (km) *
                  </label>
                  <input
                    type="number"
                    required
                    value={checkInOdo}
                    onChange={(e) => setCheckInOdo(e.target.value ? Number(e.target.value) : '')}
                    placeholder="34250"
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                    Fuel Level *
                  </label>
                  <select
                    value={checkInFuel}
                    onChange={(e) => setCheckInFuel(e.target.value)}
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                  >
                    <option value="15%">15% (Reserve)</option>
                    <option value="25%">25% (1/4)</option>
                    <option value="50%">50% (1/2)</option>
                    <option value="75%">75% (3/4)</option>
                    <option value="100%">100% (Full)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                  Customer-Reported Symptom / Issue Confirmation
                </label>
                <input
                  type="text"
                  value={checkInIssue}
                  onChange={(e) => setCheckInIssue(e.target.value)}
                  placeholder="Confirm exact symptom customer describes on arrival..."
                  className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                  Intake Walkaround Notes (Scuffs, Valuables, Wheels)
                </label>
                <textarea
                  rows={2}
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  placeholder="e.g. Valuables removed. Slight scuff on passenger front rim noted."
                  className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-graphite-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCheckInModalOpen(false)}
                className="px-4 py-2 bg-graphite text-muted hover:text-warm-white rounded-xs text-xs uppercase min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-accent-gold text-obsidian font-bold rounded-xs text-xs uppercase hover:bg-white transition-colors min-h-[44px]"
              >
                Complete Intake Check-In
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 5: CANCEL APPOINTMENT */}
      {/* ============================================================ */}
      {cancelModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <form
            onSubmit={handleCancelSubmit}
            className="bg-obsidian border border-red-500/30 p-6 rounded-xs max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-red-400 block">
                  CANCELLATION CONFIRMATION
                </span>
                <h4 className="text-sm font-bold uppercase text-warm-white">
                  CANCEL APPOINTMENT {selectedAppt.id}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="text-muted hover:text-warm-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted">
              Historical appointments remain logged in the audit trail. Please state the operational reason:
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                  Reason *
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-red-500 min-h-[44px]"
                >
                  <option value="Customer Request">Customer Request</option>
                  <option value="Workshop Unavailable">Workshop Unavailable</option>
                  <option value="Vehicle Issue Resolved">Vehicle Issue Resolved</option>
                  <option value="Duplicate Booking">Duplicate Booking</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-muted uppercase block mb-1">
                  Additional Notes (Optional)
                </label>
                <input
                  type="text"
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  placeholder="Details regarding cancellation..."
                  className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-red-500 min-h-[44px]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-graphite-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 bg-graphite text-muted hover:text-warm-white rounded-xs text-xs uppercase min-h-[44px]"
              >
                Go Back
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-red-500 text-white font-bold rounded-xs text-xs uppercase hover:bg-red-600 transition-colors min-h-[44px]"
              >
                Confirm Cancellation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
