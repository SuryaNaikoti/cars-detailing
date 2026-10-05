import React, { useState, useMemo } from 'react';
import type {
  WorkshopProfileConfig,
  OperatingHoursDay,
  JobCard,
  EstimateRecord,
  InspectionRecord,
  LeadRecord,
  AppointmentRecord,
  SystemAuditEvent,
} from '../../types';
import { APPROVED_SERVICES } from '../../data/demoData';
import {
  Clock,
  Wrench,
  Layers,
  MessageSquare,
  Search,
  CheckCircle2,
  Building,
  Sliders,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { resetDemoData } from '../../lib/demoStore';
import { MobileFormSheet } from '../../components/ui/MobileFormSheet';

export interface SettingsViewProps {
  workshopProfile: WorkshopProfileConfig;
  jobs: JobCard[];
  estimates: Record<string, EstimateRecord>;
  inspections: Record<string, InspectionRecord>;
  leads: LeadRecord[];
  appointments: AppointmentRecord[];
  auditEvents: SystemAuditEvent[];
  onSaveProfile: (profile: WorkshopProfileConfig) => void;
  onNavigateModule?: (module: string) => void;
}

export const WORKFLOW_PIPELINES = [
  {
    name: 'LEAD INTAKE PIPELINE',
    stages: ['NEW', 'CONTACTED', 'QUALIFIED', 'FOLLOW_UP_DUE', 'APPOINTMENT_REQUESTED', 'APPOINTMENT_CONFIRMED', 'CONVERTED', 'LOST'],
    governance: 'Service Advisor or Receptionist qualifies lead; creates scheduled appointment on confirmation.',
  },
  {
    name: 'APPOINTMENT LIFECYCLE',
    stages: ['REQUESTED', 'CONFIRMED', 'ARRIVED', 'CHECKED_IN', 'CONVERTED', 'NO_SHOW', 'CANCELLED'],
    governance: 'Reception verifies arrival and odometers; Advisor converts check-in into operational Job Card.',
  },
  {
    name: 'JOB CARD EXECUTION PIPELINE',
    stages: ['VEHICLE_RECEIVED', 'INSPECTION_COMPLETED', 'ESTIMATE_SENT', 'ESTIMATE_APPROVED', 'WORK_IN_PROGRESS', 'QUALITY_CHECK', 'READY_FOR_COLLECTION', 'DELIVERED'],
    governance: 'Manager/Advisor assigns bay and tech; Technician completes DVI & QC; Advisor conducts customer handover.',
  },
  {
    name: 'DIGITAL ESTIMATE DECISION PIPELINE',
    stages: ['DRAFT', 'SENT', 'VIEWED', 'APPROVED', 'PARTIALLY_APPROVED', 'DECLINED', 'CONVERTED_TO_WORK'],
    governance: 'Advisor compiles from DVI findings; Customer authorizes on Quote Viewer; Manager authorizes floor execution.',
  },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  workshopProfile,
  jobs: _jobs,
  estimates: _estimates,
  inspections: _inspections,
  leads: _leads,
  appointments: _appointments,
  auditEvents,
  onSaveProfile,
  onNavigateModule: _onNavigateModule,
}) => {
  const [activeSection, setActiveSection] = useState<'PROFILE' | 'SERVICES' | 'WORKFLOW' | 'COMMUNICATIONS' | 'AUDIT' | 'PREFERENCES'>('PROFILE');

  // Editable Profile State
  const [profileName, setProfileName] = useState(workshopProfile.name);
  const [address, setAddress] = useState(workshopProfile.business_address);
  const [phone, setPhone] = useState(workshopProfile.phone);
  const [email, setEmail] = useState(workshopProfile.email);
  const [baysCount, setBaysCount] = useState(workshopProfile.bays_count);
  const [operatingHours, setOperatingHours] = useState<OperatingHoursDay[]>(workshopProfile.operating_hours);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Audit Log State
  const [auditSearch, setAuditSearch] = useState('');
  const [auditModuleFilter, setAuditModuleFilter] = useState<string>('ALL');

  const handleConfirmReset = () => {
    resetDemoData();
    setResetModalOpen(false);
    setResetSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const filteredAuditEvents = useMemo(() => {
    return auditEvents.filter((ev) => {
      const matchSearch =
        ev.actor.toLowerCase().includes(auditSearch.toLowerCase()) ||
        ev.record_id.toLowerCase().includes(auditSearch.toLowerCase()) ||
        ev.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        ev.change_summary.toLowerCase().includes(auditSearch.toLowerCase());
      const matchModule = auditModuleFilter === 'ALL' || ev.module === auditModuleFilter;
      return matchSearch && matchModule;
    });
  }, [auditEvents, auditSearch, auditModuleFilter]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: WorkshopProfileConfig = {
      ...workshopProfile,
      name: profileName,
      business_address: address,
      phone,
      email,
      bays_count: baysCount,
      operating_hours: operatingHours,
    };
    onSaveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const toggleDayStatus = (index: number) => {
    const next = [...operatingHours];
    next[index].status = next[index].status === 'OPEN' ? 'CLOSED' : 'OPEN';
    setOperatingHours(next);
  };

  return (
    <div id="workshop-settings-page" className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* 1. Header with Eyebrow, Title & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-graphite-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block">
              WORKSHOP GOVERNANCE & CONFIGURATION
            </span>
            <span className="text-muted-dark text-xs font-mono">· V4.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-warm-white">
            SETTINGS & ADMINISTRATION
          </h1>
          <p className="text-xs text-muted font-light mt-0.5 max-w-2xl">
            Configure workshop profile, services catalog, lifecycle governance, customer portal privacy, and inspect system audit trail.
          </p>
        </div>

        {/* System / Demo Controls */}
        <div className="flex items-center gap-2">
          {resetSuccess ? (
            <div className="px-3 py-1.5 rounded-xs bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>DEMO RESET SUCCESSFUL</span>
            </div>
          ) : (
            <button
              type="button"
              id="btn-reset-demo-data"
              onClick={() => setResetModalOpen(true)}
              className="px-3.5 py-2 rounded-xs border border-red-500/30 hover:border-red-500/60 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono font-bold transition-colors min-h-[44px] flex items-center gap-1.5"
              title="Reset workshop storage to canonical seed state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET DEMO DATA</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Navigation Domain Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-graphite-border pb-1">
        <button
          type="button"
          onClick={() => setActiveSection('PROFILE')}
          className={`px-3.5 py-2 rounded-xs text-xs font-mono font-bold transition-colors min-h-[44px] flex items-center gap-1.5 ${
            activeSection === 'PROFILE'
              ? 'bg-accent-gold/10 text-accent-gold border-b-2 border-accent-gold'
              : 'text-muted hover:text-warm-white'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>PROFILE & HOURS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('SERVICES')}
          className={`px-3.5 py-2 rounded-xs text-xs font-mono font-bold transition-colors min-h-[44px] flex items-center gap-1.5 ${
            activeSection === 'SERVICES'
              ? 'bg-accent-gold/10 text-accent-gold border-b-2 border-accent-gold'
              : 'text-muted hover:text-warm-white'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>SERVICES & CATALOG</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('WORKFLOW')}
          className={`px-3.5 py-2 rounded-xs text-xs font-mono font-bold transition-colors min-h-[44px] flex items-center gap-1.5 ${
            activeSection === 'WORKFLOW'
              ? 'bg-accent-gold/10 text-accent-gold border-b-2 border-accent-gold'
              : 'text-muted hover:text-warm-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>WORKFLOW GOVERNANCE</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('COMMUNICATIONS')}
          className={`px-3.5 py-2 rounded-xs text-xs font-mono font-bold transition-colors min-h-[44px] flex items-center gap-1.5 ${
            activeSection === 'COMMUNICATIONS'
              ? 'bg-accent-gold/10 text-accent-gold border-b-2 border-accent-gold'
              : 'text-muted hover:text-warm-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>COMMS & PORTAL</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('AUDIT')}
          className={`px-3.5 py-2 rounded-xs text-xs font-mono font-bold transition-colors min-h-[44px] flex items-center gap-1.5 ${
            activeSection === 'AUDIT'
              ? 'bg-accent-gold/10 text-accent-gold border-b-2 border-accent-gold'
              : 'text-muted hover:text-warm-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>SYSTEM AUDIT LOG ({auditEvents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('PREFERENCES')}
          className={`px-3.5 py-2 rounded-xs text-xs font-mono font-bold transition-colors min-h-[44px] flex items-center gap-1.5 ${
            activeSection === 'PREFERENCES'
              ? 'bg-accent-gold/10 text-accent-gold border-b-2 border-accent-gold'
              : 'text-muted hover:text-warm-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>PREFERENCES</span>
        </button>
      </div>

      {/* 3. SECTION: PROFILE & OPERATING HOURS */}
      {activeSection === 'PROFILE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Facility Profile Form */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-xs bg-graphite/30 border border-graphite-border space-y-4">
              <div className="pb-3 border-b border-graphite-border/60">
                <span className="text-[10px] font-mono text-accent-gold uppercase tracking-wider block">
                  FACILITY INFORMATION
                </span>
                <h2 className="text-sm font-bold uppercase text-warm-white font-mono">
                  WORKSHOP PROFILE
                </h2>
              </div>

              {savedSuccess && (
                <div className="p-3 rounded-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Workshop settings successfully saved.</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-3.5 font-mono text-xs">
                <div>
                  <label className="text-[10px] text-muted-dark uppercase block mb-1">Facility Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-muted-dark uppercase block mb-1">Official Workshop Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-dark uppercase block mb-1">Direct Support Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-dark uppercase block mb-1">Official Contact Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-dark uppercase block mb-1">Active Bays Count</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={baysCount}
                      onChange={(e) => setBaysCount(Number(e.target.value))}
                      className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-dark uppercase block mb-1">Operating Currency</label>
                    <input
                      type="text"
                      disabled
                      value={workshopProfile.default_currency}
                      className="w-full bg-graphite/40 border border-graphite-border rounded-xs px-3 py-2 text-muted-dark min-h-[40px] cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-graphite-border flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-accent-gold text-obsidian font-bold rounded-xs uppercase hover:bg-white transition-colors min-h-[44px]"
                  >
                    SAVE PROFILE SETTINGS
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Operating Hours Configuration */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-xs bg-graphite/30 border border-graphite-border space-y-4">
              <div className="pb-3 border-b border-graphite-border/60">
                <span className="text-[10px] font-mono text-accent-gold uppercase tracking-wider block">
                  SCHEDULE & INTAKE WINDOWS
                </span>
                <h2 className="text-sm font-bold uppercase text-warm-white font-mono">
                  OPERATING HOURS (7 DAYS)
                </h2>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {operatingHours.map((day, idx) => (
                  <div
                    key={day.day}
                    className="flex items-center justify-between p-2.5 rounded-xs bg-obsidian/60 border border-graphite-border"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleDayStatus(idx)}
                        className={`px-2 py-0.5 rounded-xs text-[9px] font-bold border transition-colors min-h-[28px] ${
                          day.status === 'OPEN'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                            : 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                        }`}
                      >
                        {day.status}
                      </button>
                      <span className="font-bold text-warm-white">{day.day}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted">
                      {day.status === 'OPEN' ? (
                        <span>{day.open_time} – {day.close_time} (IST)</span>
                      ) : (
                        <span className="text-muted-dark italic">Workshop Closed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-muted font-mono leading-relaxed">
                Conceptually drives customer booking slot availability on the web portal and Workshop Floor execution schedules.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* 4. SECTION: SERVICES CATALOG & PRICING */}
      {activeSection === 'SERVICES' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xs bg-graphite/20 border border-graphite-border/60 text-xs font-mono text-muted flex items-center justify-between">
            <span>
              Canonical Service Catalog derived strictly from approved workshop definitions.
            </span>
            <span className="text-[10px] text-muted-dark">
              Total Services: {APPROVED_SERVICES.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {APPROVED_SERVICES.map((svc) => (
              <div
                key={svc.id}
                className="p-5 rounded-xs bg-graphite/30 border border-graphite-border space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-accent-gold uppercase tracking-wider block">
                      CATALOG ID: {svc.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-xs bg-emerald-950/40 text-emerald-400 text-[9px] font-mono font-bold border border-emerald-800/40">
                      ACTIVE
                    </span>
                  </div>
                  <h3 className="text-sm font-bold uppercase text-warm-white font-mono">
                    {svc.name}
                  </h3>
                  <p className="text-xs text-muted font-mono leading-relaxed">
                    {svc.short_description}
                  </p>
                </div>

                <div className="pt-3 border-t border-graphite-border/60 space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-dark">Starting Scope:</span>
                    <span className="text-accent-gold font-bold">
                      {svc.id === 'periodic-service'
                        ? '₹12,800'
                        : svc.id === 'computer-diagnostics'
                        ? '₹2,500'
                        : 'PRICE NOT CONFIGURED'}
                    </span>
                  </div>

                  <div className="text-[10px] text-muted-dark">
                    <span className="font-bold uppercase text-muted block mb-1">Standard Inclusions:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-muted">
                      {svc.inclusions?.slice(0, 2).map((inc, i) => (
                        <li key={i} className="truncate">{inc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SECTION: WORKFLOW GOVERNANCE */}
      {activeSection === 'WORKFLOW' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xs bg-graphite/20 border border-graphite-border/60 text-xs font-mono text-muted">
            Canonical Workshop OS lifecycle state machines and role transition authorization rules.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WORKFLOW_PIPELINES.map((pipe) => (
              <div
                key={pipe.name}
                className="p-5 rounded-xs bg-graphite/30 border border-graphite-border space-y-4"
              >
                <div className="pb-2 border-b border-graphite-border/60">
                  <span className="text-[9px] font-mono text-accent-gold uppercase tracking-wider block">
                    CANONICAL STATE MACHINE
                  </span>
                  <h3 className="text-sm font-bold uppercase text-warm-white font-mono">
                    {pipe.name}
                  </h3>
                </div>

                <div className="space-y-1.5 font-mono text-xs">
                  <span className="text-[10px] text-muted-dark uppercase block">Sequential Lifecycle States:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {pipe.stages.map((st, i) => (
                      <span
                        key={st}
                        className="px-2 py-1 rounded-xs bg-obsidian border border-graphite-border text-[10px] text-warm-white flex items-center gap-1"
                      >
                        <span className="text-accent-gold font-bold">{i + 1}.</span> {st}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-graphite-border/40 font-mono text-xs space-y-1">
                  <span className="text-[10px] text-muted-dark uppercase block font-bold">Role Governance:</span>
                  <p className="text-muted text-[11px] leading-relaxed">{pipe.governance}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. SECTION: COMMUNICATIONS & CUSTOMER PORTAL */}
      {activeSection === 'COMMUNICATIONS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Communications Settings */}
          <div className="p-5 rounded-xs bg-graphite/30 border border-graphite-border space-y-4 font-mono text-xs">
            <div className="pb-3 border-b border-graphite-border/60">
              <span className="text-[10px] text-accent-gold uppercase tracking-wider block">
                CUSTOMER NOTIFICATIONS
              </span>
              <h2 className="text-sm font-bold uppercase text-warm-white">
                COMMUNICATIONS SETTINGS
              </h2>
            </div>

            <div className="space-y-2.5">
              {[
                { title: 'Customer Intake Confirmation', channel: 'WhatsApp Deep-Link', status: 'AVAILABLE IN DEMO' },
                { title: 'Appointment Reminders (24h Before)', channel: 'WhatsApp Deep-Link', status: 'AVAILABLE IN DEMO' },
                { title: 'Digital Estimate Notification', channel: 'SMS / Direct Link', status: 'AVAILABLE IN DEMO' },
                { title: 'Quality Check Completion Notice', channel: 'Internal Dispatch', status: 'SYSTEM ACTIVE' },
                { title: 'Ready for Collection Notification', channel: 'WhatsApp Deep-Link', status: 'AVAILABLE IN DEMO' },
                { title: 'Service Interval Due Reminder', channel: 'WhatsApp Deep-Link', status: 'AVAILABLE IN DEMO' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xs bg-obsidian/60 border border-graphite-border flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-warm-white block text-[11px]">{item.title}</span>
                    <span className="text-[10px] text-muted">{item.channel}</span>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-xs bg-accent-gold/10 text-accent-gold border border-accent-gold/30">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-muted-dark italic pt-2">
              Note: Automated SMS gateways and WhatsApp Cloud API require external production credentials not active in demo mode.
            </p>
          </div>

          {/* Customer Portal Privacy & Features */}
          <div className="p-5 rounded-xs bg-graphite/30 border border-graphite-border space-y-4 font-mono text-xs">
            <div className="pb-3 border-b border-graphite-border/60">
              <span className="text-[10px] text-accent-gold uppercase tracking-wider block">
                CLIENT PRIVACY & VIEWER
              </span>
              <h2 className="text-sm font-bold uppercase text-warm-white">
                CUSTOMER PORTAL & DATA PRIVACY
              </h2>
            </div>

            <div className="space-y-2.5">
              {[
                { feature: 'Digital Quote Viewer (/quote/:token)', state: 'ACTIVE' },
                { feature: 'Live Service Status Tracking (/track/:token)', state: 'ACTIVE' },
                { feature: 'Line-Item Authorization & Decline', state: 'ACTIVE' },
                { feature: 'Inspection Photo & Finding Evidence', state: 'ACTIVE' },
                { feature: 'Sensitive VIN Masking (e.g. WBA530D***7841)', state: 'ENFORCED' },
                { feature: 'Customer Personal Data Redaction', state: 'ENFORCED' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xs bg-obsidian/60 border border-graphite-border flex items-center justify-between"
                >
                  <span className="text-warm-white font-medium text-[11px]">{item.feature}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-xs bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                    {item.state}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-muted leading-relaxed pt-2">
              Customer portals operate via non-guessable cryptographic tokens without requiring external passwords or storing session cookies on customer devices.
            </p>
          </div>

        </div>
      )}

      {/* 7. SECTION: SYSTEM AUDIT LOG */}
      {activeSection === 'AUDIT' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-graphite/30 p-3 rounded-xs border border-graphite-border">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-muted-dark absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit trail by actor, record ID, or note..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full bg-obsidian border border-graphite-border rounded-xs pl-9 pr-3 py-1.5 text-xs text-warm-white font-mono focus:outline-none focus:border-accent-gold min-h-[40px]"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[10px] uppercase text-muted-dark">Filter Module:</span>
              <select
                value={auditModuleFilter}
                onChange={(e) => setAuditModuleFilter(e.target.value)}
                className="bg-obsidian border border-graphite-border rounded-xs px-2.5 py-1.5 text-xs text-warm-white font-mono focus:outline-none focus:border-accent-gold min-h-[40px]"
              >
                <option value="ALL">All Modules ({auditEvents.length})</option>
                <option value="JOBS">Job Cards</option>
                <option value="ESTIMATES">Estimates</option>
                <option value="INSPECTIONS">Inspections</option>
                <option value="LEADS">Leads</option>
                <option value="APPOINTMENTS">Appointments</option>
              </select>
            </div>
          </div>

          <div id="system-audit-log-table" className="border border-graphite-border rounded-xs overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-obsidian text-[10px] uppercase text-muted border-b border-graphite-border">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor & Role</th>
                  <th className="py-2.5 px-3">Module</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Record ID</th>
                  <th className="py-2.5 px-3">Change Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-border/40 text-warm-white">
                {filteredAuditEvents.slice(0, 25).map((ev) => (
                  <tr key={ev.id} className="hover:bg-graphite/40">
                    <td className="py-2 px-3 text-[11px] text-muted whitespace-nowrap">
                      {new Date(ev.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} {' '}
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-bold text-warm-white block">{ev.actor}</span>
                      <span className="text-[9px] text-muted-dark uppercase">{ev.role}</span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 rounded-xs bg-obsidian border border-graphite-border text-[9px] text-accent-gold font-bold">
                        {ev.module}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-medium text-warm-white">{ev.action}</td>
                    <td className="py-2 px-3 font-bold text-accent-gold">{ev.record_id}</td>
                    <td className="py-2 px-3 text-muted text-[11px] max-w-xs truncate">
                      {ev.change_summary}
                    </td>
                  </tr>
                ))}

                {filteredAuditEvents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted text-xs">
                      NO AUDIT EVENTS FOUND MATCHING CRITERIA
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. SECTION: PREFERENCES */}
      {activeSection === 'PREFERENCES' && (
        <div className="max-w-2xl p-5 rounded-xs bg-graphite/30 border border-graphite-border space-y-4 font-mono text-xs">
          <div className="pb-3 border-b border-graphite-border/60">
            <span className="text-[10px] text-accent-gold uppercase tracking-wider block">
              DISPLAY & LOCALIZATION
            </span>
            <h2 className="text-sm font-bold uppercase text-warm-white">
              APPLICATION PREFERENCES
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-xs bg-obsidian/60 border border-graphite-border">
              <div>
                <span className="font-bold text-warm-white block">Default Currency</span>
                <span className="text-[10px] text-muted">Indian Rupee (₹ INR)</span>
              </div>
              <span className="px-2 py-0.5 rounded-xs bg-graphite text-muted">System Locked</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xs bg-obsidian/60 border border-graphite-border">
              <div>
                <span className="font-bold text-warm-white block">Timezone</span>
                <span className="text-[10px] text-muted">Asia/Kolkata (IST +05:30)</span>
              </div>
              <span className="px-2 py-0.5 rounded-xs bg-graphite text-muted">System Locked</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xs bg-obsidian/60 border border-graphite-border">
              <div>
                <span className="font-bold text-warm-white block">Date Format</span>
                <span className="text-[10px] text-muted">DD/MM/YYYY (e.g. 21 Sep 2026)</span>
              </div>
              <span className="px-2 py-0.5 rounded-xs bg-graphite text-muted">Standard</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xs bg-obsidian/60 border border-graphite-border">
              <div>
                <span className="font-bold text-warm-white block">Default Console Landing</span>
                <span className="text-[10px] text-muted">Control Center (Overview)</span>
              </div>
              <span className="px-2 py-0.5 rounded-xs bg-graphite text-muted">Active</span>
            </div>
          </div>
        </div>
      )}

      {/* 9. RESET DEMO DATA CONFIRMATION MODAL */}
      <MobileFormSheet
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Confirm Demo Data Reset"
        eyebrow="SYSTEM MAINTENANCE"
        maxWidth="max-w-md"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 w-full font-mono text-xs">
            <button
              type="button"
              onClick={() => setResetModalOpen(false)}
              className="flex-1 min-h-[44px] py-2.5 px-3 bg-graphite border border-graphite-border text-warm-white rounded-xs uppercase font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              id="btn-confirm-reset-demo"
              onClick={handleConfirmReset}
              className="flex-1 min-h-[44px] py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xs uppercase transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Seed Data</span>
            </button>
          </div>
        }
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center gap-2.5 text-red-400 pb-2 border-b border-graphite-border">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-warm-white">
              Data Reset Confirmation
            </span>
          </div>

          <p className="text-muted leading-relaxed text-xs">
            This operation will restore all demo operational stores (Customers, Vehicles, Leads, Appointments, Job Cards, Inspections, Estimates, Technicians, Reminders, and Workshop Profile) back to their canonical seed state.
          </p>

          <div className="p-3 rounded-xs bg-obsidian border border-graphite-border text-xs text-muted space-y-1">
            <span className="font-bold text-accent-gold block text-[11px]">OPERATIONAL SAFETY VERIFIED:</span>
            <span>• Source code files remain intact.</span>
            <br />
            <span>• Configuration and database migrations are untouched.</span>
            <br />
            <span>• Only local browser demo state is re-initialized.</span>
          </div>
        </div>
      </MobileFormSheet>

    </div>
  );
};

