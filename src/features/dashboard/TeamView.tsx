import React, { useState, useMemo } from 'react';
import type { TeamMemberRecord, JobCard, TechnicianRecord } from '../../types';
import {
  Users,
  Search,
  Plus,
  X,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  Briefcase,
} from 'lucide-react';

export interface TeamViewProps {
  teamMembers: TeamMemberRecord[];
  technicians: TechnicianRecord[];
  jobs: JobCard[];
  onSaveTeamMember: (member: TeamMemberRecord) => void;
  onOpenJob?: (jobId: string) => void;
  onNavigateModule?: (module: string) => void;
}

export const CAPABILITIES_MATRIX: {
  capability: string;
  category: string;
  admin: string;
  manager: string;
  advisor: string;
  reception: string;
  technician: string;
  viewer: string;
}[] = [
  { capability: 'Control Center Dashboard', category: 'OVERVIEW', admin: 'ADMIN', manager: 'VIEW', advisor: 'VIEW', reception: 'VIEW', technician: 'VIEW', viewer: 'VIEW' },
  { capability: 'Workshop Floor & Bays', category: 'WORKSHOP', admin: 'ADMIN', manager: 'EDIT', advisor: 'EDIT', reception: 'VIEW', technician: 'VIEW', viewer: 'VIEW' },
  { capability: 'Leads & Enquiries', category: 'INTAKE', admin: 'ADMIN', manager: 'EDIT', advisor: 'EDIT', reception: 'CREATE', technician: '—', viewer: 'VIEW' },
  { capability: 'Appointments & Reception', category: 'INTAKE', admin: 'ADMIN', manager: 'EDIT', advisor: 'EDIT', reception: 'EDIT', technician: '—', viewer: 'VIEW' },
  { capability: 'Job Cards Master Console', category: 'OPERATIONS', admin: 'ADMIN', manager: 'ADMIN', advisor: 'EDIT', reception: 'VIEW', technician: 'EDIT', viewer: 'VIEW' },
  { capability: 'Inspections & DVI Findings', category: 'OPERATIONS', admin: 'ADMIN', manager: 'APPROVE', advisor: 'VIEW', reception: '—', technician: 'EDIT', viewer: 'VIEW' },
  { capability: 'Estimates & Scope Approvals', category: 'COMMERCIAL', admin: 'ADMIN', manager: 'APPROVE', advisor: 'EDIT', reception: '—', technician: '—', viewer: 'VIEW' },
  { capability: 'Customer Profiles', category: 'CLIENTS', admin: 'ADMIN', manager: 'EDIT', advisor: 'EDIT', reception: 'EDIT', technician: 'VIEW', viewer: 'VIEW' },
  { capability: 'Vehicle Asset Records', category: 'CLIENTS', admin: 'ADMIN', manager: 'EDIT', advisor: 'EDIT', reception: 'EDIT', technician: 'VIEW', viewer: 'VIEW' },
  { capability: 'Service History & Invoices', category: 'HISTORY', admin: 'ADMIN', manager: 'EDIT', advisor: 'VIEW', reception: 'VIEW', technician: 'VIEW', viewer: 'VIEW' },
  { capability: 'Service Reminders & Follow-up', category: 'RETENTION', admin: 'ADMIN', manager: 'EDIT', advisor: 'EDIT', reception: 'EDIT', technician: '—', viewer: 'VIEW' },
  { capability: 'Technician Allocation Roster', category: 'WORKFORCE', admin: 'ADMIN', manager: 'ADMIN', advisor: 'VIEW', reception: '—', technician: 'VIEW', viewer: 'VIEW' },
  { capability: 'WhatsApp Deep-Link Comms', category: 'MESSAGING', admin: 'ADMIN', manager: 'EDIT', advisor: 'EDIT', reception: 'EDIT', technician: '—', viewer: '—' },
  { capability: 'Workshop Reports (Factual)', category: 'INSIGHTS', admin: 'ADMIN', manager: 'VIEW', advisor: 'VIEW', reception: '—', technician: '—', viewer: 'VIEW' },
  { capability: 'Workshop Analytics & Funnels', category: 'INSIGHTS', admin: 'ADMIN', manager: 'VIEW', advisor: '—', reception: '—', technician: '—', viewer: 'VIEW' },
  { capability: 'Team Members & Staff Access', category: 'SYSTEM', admin: 'ADMIN', manager: 'VIEW', advisor: '—', reception: '—', technician: '—', viewer: '—' },
  { capability: 'Workshop Operating Settings', category: 'SYSTEM', admin: 'ADMIN', manager: '—', advisor: '—', reception: '—', technician: '—', viewer: '—' },
  { capability: 'System Audit Trail & Logging', category: 'SECURITY', admin: 'ADMIN', manager: 'VIEW', advisor: '—', reception: '—', technician: '—', viewer: '—' },
];

export const ROLE_DEFINITIONS = [
  {
    role: 'OWNER / ADMIN',
    summary: 'Full operational, commercial and administrative control across all facilities and staff.',
    capabilities: ['Complete system access', 'Staff creation & permissions', 'Profile & operating hours configuration', 'Audit log review'],
  },
  {
    role: 'WORKSHOP MANAGER',
    summary: 'Execution floor overseer responsible for bay allocations, technician loading, and estimate authorizations.',
    capabilities: ['Workshop floor orchestration', 'Technician assignments', 'Estimate approvals', 'Quality verification oversight'],
  },
  {
    role: 'SERVICE ADVISOR',
    summary: 'Primary customer relationship contact managing customer intake, digital estimates, and repair authorizations.',
    capabilities: ['Customer consultation', 'Estimate compilation & dispatch', 'Vehicle handover', 'Reminders & follow-ups'],
  },
  {
    role: 'RECEPTION / FRONT DESK',
    summary: 'First customer contact handling walk-ins, phone enquiries, and physical vehicle arrival check-in.',
    capabilities: ['Lead logging', 'Appointment check-in', 'Customer profile registration', 'Initial arrival verification'],
  },
  {
    role: 'TECHNICIAN',
    summary: 'Mechanical and electronic specialist executing vehicle diagnostics, digital inspections, and repairs.',
    capabilities: ['Digital Vehicle Inspections (DVI)', 'Work item execution', 'Quality check checklists', 'Assigned job progression'],
  },
  {
    role: 'VIEWER / REPORTS',
    summary: 'Read-only administrative observer reviewing operational KPIs, throughput reports, and analytics.',
    capabilities: ['Reports review', 'Analytics review', 'Read-only operational monitoring'],
  },
];

export const TeamView: React.FC<TeamViewProps> = ({
  teamMembers,
  technicians: _technicians,
  jobs,
  onSaveTeamMember,
  onOpenJob,
  onNavigateModule,
}) => {
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'ROLES' | 'PERMISSIONS'>('DIRECTORY');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(teamMembers[0]?.id || 'team-1');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add team member form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+91 ');
  const [newRole, setNewRole] = useState<'SERVICE_ADVISOR' | 'TECHNICIAN' | 'WORKSHOP_MANAGER' | 'RECEPTION'>('SERVICE_ADVISOR');
  const [newSpec, setNewSpec] = useState('');

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return teamMembers.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role_display.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.specialization && m.specialization.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [teamMembers, searchQuery, roleFilter]);

  // Active selected member
  const selectedMember = useMemo(() => {
    return teamMembers.find((m) => m.id === selectedMemberId) || teamMembers[0] || null;
  }, [teamMembers, selectedMemberId]);

  // Workload for selected member (Job cards)
  const memberJobs = useMemo(() => {
    if (!selectedMember) return [];
    const firstName = (selectedMember.name || '').split(' ')[0].toLowerCase();
    const fullName = (selectedMember.name || '').toLowerCase();
    const assignedIds = new Set(selectedMember.assigned_job_ids || []);

    return jobs.filter((j) => {
      if (j.status === 'DELIVERED' || j.status === 'CANCELLED') return false;
      if (assignedIds.has(j.id)) return true;

      const tech = (j.technician || '').toLowerCase();
      const adv = (j.advisor || '').toLowerCase();

      return (
        (tech && (tech.includes(firstName) || fullName.includes(tech))) ||
        (adv && (adv.includes(firstName) || fullName.includes(adv)))
      );
    });
  }, [jobs, selectedMember]);

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newMember: TeamMemberRecord = {
      id: `team-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim(),
      role: newRole,
      role_display:
        newRole === 'SERVICE_ADVISOR'
          ? 'Service Advisor'
          : newRole === 'TECHNICIAN'
          ? 'Technician'
          : newRole === 'WORKSHOP_MANAGER'
          ? 'Workshop Manager'
          : 'Receptionist',
      specialization: newSpec.trim() || 'General Workshop Operations',
      status: 'ACTIVE',
      access_level:
        newRole === 'TECHNICIAN'
          ? 'Technical Execution (Inspections, Work Items, QC)'
          : newRole === 'SERVICE_ADVISOR'
          ? 'Operational Staff (Intake, Estimations, Handover)'
          : 'Standard Staff Access',
      created_at: new Date().toISOString(),
    };

    onSaveTeamMember(newMember);
    setSelectedMemberId(newMember.id);
    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
    setNewSpec('');
  };

  return (
    <div id="team-permissions-page" className="space-y-6 max-w-7xl mx-auto pb-12 w-full max-w-full overflow-x-hidden">
      
      {/* 1. Header with Eyebrow, Title, Sub-Nav Tabs & Primary Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-graphite-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block">
              SYSTEM ADMINISTRATION
            </span>
            <span className="text-muted-dark text-xs font-mono">· V4.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-warm-white">
            TEAM & PERMISSIONS
          </h1>
          <p className="text-xs text-muted font-light mt-0.5 max-w-2xl">
            Manage workshop staff, operational roles and access to Workshop OS.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btn-add-team-member"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent-gold text-obsidian font-bold rounded-xs text-xs uppercase hover:bg-white transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>ADD TEAM MEMBER</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-graphite-border pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('DIRECTORY')}
          className={`px-4 py-2 rounded-xs text-xs font-mono font-bold transition-colors min-h-[44px] flex items-center gap-2 ${
            activeTab === 'DIRECTORY'
              ? 'bg-accent-gold/10 text-accent-gold border-b-2 border-accent-gold'
              : 'text-muted hover:text-warm-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>TEAM DIRECTORY ({teamMembers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ROLES')}
          className={`px-4 py-2 rounded-xs text-xs font-mono font-bold transition-colors min-h-[44px] flex items-center gap-2 ${
            activeTab === 'ROLES'
              ? 'bg-accent-gold/10 text-accent-gold border-b-2 border-accent-gold'
              : 'text-muted hover:text-warm-white'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>ROLES & RESPONSIBILITIES</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PERMISSIONS')}
          className={`px-4 py-2 rounded-xs text-xs font-mono font-bold transition-colors min-h-[44px] flex items-center gap-2 ${
            activeTab === 'PERMISSIONS'
              ? 'bg-accent-gold/10 text-accent-gold border-b-2 border-accent-gold'
              : 'text-muted hover:text-warm-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>PERMISSION MATRIX (18x6)</span>
        </button>
      </div>

      {/* 3. TAB 1: 35/65 MASTER-DETAIL TEAM DIRECTORY */}
      {activeTab === 'DIRECTORY' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: 35% Team Directory List */}
          <div className="lg:col-span-4 space-y-3">
            {/* Search & Role Filter */}
            <div className="space-y-2 bg-graphite/30 p-3 rounded-xs border border-graphite-border">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-muted-dark absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search staff by name or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-obsidian border border-graphite-border rounded-xs pl-9 pr-3 py-1.5 text-xs text-warm-white font-mono focus:outline-none focus:border-accent-gold min-h-[40px]"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[10px] uppercase text-muted-dark">Filter Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-obsidian border border-graphite-border rounded-xs px-2 py-1 text-xs text-warm-white font-mono focus:outline-none focus:border-accent-gold"
                >
                  <option value="ALL">All Roles</option>
                  <option value="SERVICE_ADVISOR">Service Advisor</option>
                  <option value="TECHNICIAN">Technician</option>
                  <option value="WORKSHOP_MANAGER">Manager</option>
                </select>
              </div>
            </div>

            {/* Staff Directory Cards List */}
            <div id="team-members-list" className="space-y-2">
              {filteredMembers.map((member) => {
                const isSelected = member.id === selectedMemberId;
                const firstName = (member.name || '').split(' ')[0].toLowerCase();
                const fullName = (member.name || '').toLowerCase();
                const assignedIds = new Set(member.assigned_job_ids || []);

                const memberJobsCount = jobs.filter((j) => {
                  if (j.status === 'DELIVERED' || j.status === 'CANCELLED') return false;
                  if (assignedIds.has(j.id)) return true;

                  const tech = (j.technician || '').toLowerCase();
                  const adv = (j.advisor || '').toLowerCase();

                  return (
                    (tech && (tech.includes(firstName) || fullName.includes(tech))) ||
                    (adv && (adv.includes(firstName) || fullName.includes(adv)))
                  );
                }).length;

                return (
                  <div
                    key={member.id}
                    data-testid={`team-card-${member.id}`}
                    onClick={() => setSelectedMemberId(member.id)}
                    className={`p-3.5 rounded-xs border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-graphite/80 border-accent-gold shadow-sm'
                        : 'bg-graphite/30 border-graphite-border hover:bg-graphite/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-warm-white text-xs block">
                          {member.name}
                        </span>
                        <span className="text-[11px] text-accent-gold font-mono block">
                          {member.role_display}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-xs bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 text-[9px] font-mono font-bold">
                        {member.status}
                      </span>
                    </div>

                    <div className="mt-2 text-[10px] text-muted font-mono truncate">
                      {member.specialization || 'Standard Specialty'}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-graphite-border/40 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-muted-dark">Active Workload:</span>
                      <span className="font-bold text-warm-white bg-obsidian px-2 py-0.5 rounded-xs border border-graphite-border">
                        {memberJobsCount} Active Jobs
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredMembers.length === 0 && (
                <div className="p-6 text-center text-xs font-mono text-muted border border-graphite-border rounded-xs bg-obsidian">
                  NO TEAM MEMBERS FOUND
                </div>
              )}
            </div>
          </div>

          {/* Right Column: 65% Staff Member Dossier */}
          <div className="lg:col-span-8 space-y-4">
            {selectedMember ? (
              <div id="team-member-dossier" className="p-5 rounded-xs bg-graphite/30 border border-graphite-border space-y-5">
                
                {/* Dossier Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-graphite-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-dark uppercase tracking-wider">
                        STAFF DOSSIER · ID: {selectedMember.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-xs bg-accent-gold/10 text-accent-gold text-[9px] font-mono font-bold border border-accent-gold/30">
                        {selectedMember.role_display}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-warm-white tracking-tight mt-1">
                      {selectedMember.name}
                    </h2>
                    <p className="text-xs text-muted font-mono mt-0.5">
                      {selectedMember.specialization}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${selectedMember.phone}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-obsidian border border-graphite-border text-xs font-mono text-warm-white hover:text-accent-gold min-h-[36px]"
                    >
                      <Phone className="w-3.5 h-3.5 text-accent-gold" />
                      <span>{selectedMember.phone}</span>
                    </a>
                  </div>
                </div>

                {/* Profile Key-Value Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xs bg-obsidian/40 border border-graphite-border/60 space-y-1">
                    <span className="text-[10px] text-muted-dark uppercase block">Official Email</span>
                    <span className="text-warm-white font-medium flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-accent-gold" />
                      {selectedMember.email}
                    </span>
                  </div>

                  <div className="p-3 rounded-xs bg-obsidian/40 border border-graphite-border/60 space-y-1">
                    <span className="text-[10px] text-muted-dark uppercase block">Access Scope</span>
                    <span className="text-warm-white font-medium">
                      {selectedMember.access_level}
                    </span>
                  </div>

                  <div className="p-3 rounded-xs bg-obsidian/40 border border-graphite-border/60 space-y-1">
                    <span className="text-[10px] text-muted-dark uppercase block">Onboarding Date</span>
                    <span className="text-warm-white font-medium">
                      {new Date(selectedMember.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="p-3 rounded-xs bg-obsidian/40 border border-graphite-border/60 space-y-1">
                    <span className="text-[10px] text-muted-dark uppercase block">Last Activity Log</span>
                    <span className="text-warm-white font-medium">
                      {selectedMember.last_active
                        ? new Date(selectedMember.last_active).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today'
                        : 'Active Today'}
                    </span>
                  </div>
                </div>

                {/* Active Workload Section */}
                <div className="space-y-3 pt-2 border-t border-graphite-border/60">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-warm-white flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-accent-gold" />
                      Current Floor Workload ({memberJobs.length} Active Jobs)
                    </h3>
                    {selectedMember.role === 'TECHNICIAN' && onNavigateModule && (
                      <button
                        type="button"
                        onClick={() => onNavigateModule('technicians')}
                        className="text-[10px] font-mono text-accent-gold hover:underline flex items-center gap-1"
                      >
                        VIEW WORKFORCE ROSTER →
                      </button>
                    )}
                  </div>

                  {memberJobs.length > 0 ? (
                    <div className="border border-graphite-border rounded-xs overflow-x-auto max-w-full">
                      <table className="w-full text-left text-xs font-mono min-w-[360px]">
                        <thead className="bg-obsidian text-[10px] uppercase text-muted border-b border-graphite-border">
                          <tr>
                            <th className="py-2 px-3">Job ID</th>
                            <th className="py-2 px-3">Vehicle</th>
                            <th className="py-2 px-3">Bay</th>
                            <th className="py-2 px-3">Status</th>
                            <th className="py-2 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-graphite-border/40 text-warm-white">
                          {memberJobs.map((j) => (
                            <tr key={j.id} className="hover:bg-graphite/40">
                              <td className="py-2 px-3 font-bold text-accent-gold">{j.id}</td>
                              <td className="py-2 px-3">{j.registration} ({j.vehicle_summary})</td>
                              <td className="py-2 px-3 text-muted">{j.bay}</td>
                              <td className="py-2 px-3">
                                <span className="text-[9px] bg-accent-gold/10 text-accent-gold px-1.5 py-0.5 rounded-xs">
                                  {j.status}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => onOpenJob && onOpenJob(j.id)}
                                  className="text-[10px] font-bold text-accent-gold hover:underline"
                                >
                                  OPEN JOB →
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xs bg-obsidian/40 border border-graphite-border/60 text-xs font-mono text-muted text-center">
                      No active service jobs currently allocated to this staff member.
                    </div>
                  )}
                </div>

                {/* Role Responsibility Card */}
                <div className="p-3.5 rounded-xs bg-obsidian/60 border border-graphite-border/60 space-y-2 text-xs font-mono">
                  <span className="text-[10px] text-muted-dark uppercase block">
                    OPERATIONAL RESPONSIBILITY SUMMARY
                  </span>
                  <p className="text-muted leading-relaxed">
                    {selectedMember.role === 'TECHNICIAN'
                      ? 'Authorized to perform physical vehicle health checks, electronic scans, log parts replacements, and execute service checklist items.'
                      : selectedMember.role === 'SERVICE_ADVISOR'
                      ? 'Authorized to consult owners, manage customer communication, compile digital estimates, and conduct customer vehicle handover.'
                      : 'Authorized to orchestrate workshop allocations, inspect operational bottlenecks, and authorize scope changes.'}
                  </p>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center text-xs font-mono text-muted border border-graphite-border rounded-xs bg-obsidian">
                SELECT A TEAM MEMBER FROM THE DIRECTORY
              </div>
            )}
          </div>

        </div>
      )}

      {/* 4. TAB 2: ROLES & RESPONSIBILITIES */}
      {activeTab === 'ROLES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLE_DEFINITIONS.map((r) => (
            <div
              key={r.role}
              className="p-5 rounded-xs bg-graphite/30 border border-graphite-border space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-accent-gold uppercase tracking-wider block">
                  WORKSHOP APPLICATION ROLE
                </span>
                <h3 className="text-sm font-bold uppercase text-warm-white font-mono">
                  {r.role}
                </h3>
                <p className="text-xs text-muted font-mono leading-relaxed">
                  {r.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-graphite-border/60 space-y-1.5 font-mono text-[11px]">
                <span className="text-[9px] text-muted-dark uppercase block font-bold">Key Capabilities:</span>
                {r.capabilities.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-muted">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. TAB 3: 18x6 PERMISSION MATRIX */}
      {activeTab === 'PERMISSIONS' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xs bg-graphite/20 border border-graphite-border/60 text-xs font-mono text-muted flex items-center justify-between">
            <span>
              Design Representation: Role-Based Access Control (RBAC) across 18 workshop modules.
            </span>
            <span className="text-[10px] text-muted-dark">
              Simulation Mode: Enforced on staff session context
            </span>
          </div>

          <div className="border border-graphite-border rounded-xs overflow-x-auto">
            <table className="w-full text-left text-xs font-mono min-w-[700px]">
              <thead className="bg-obsidian text-[10px] uppercase text-muted border-b border-graphite-border">
                <tr>
                  <th className="py-2.5 px-3">Capability / Module</th>
                  <th className="py-2.5 px-2 text-center text-accent-gold font-bold">ADMIN</th>
                  <th className="py-2.5 px-2 text-center text-warm-white">MANAGER</th>
                  <th className="py-2.5 px-2 text-center text-warm-white">ADVISOR</th>
                  <th className="py-2.5 px-2 text-center text-warm-white">RECEPTION</th>
                  <th className="py-2.5 px-2 text-center text-warm-white">TECH</th>
                  <th className="py-2.5 px-2 text-center text-warm-white">VIEWER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-border/40 text-warm-white">
                {CAPABILITIES_MATRIX.map((row, idx) => (
                  <tr key={idx} className="hover:bg-graphite/40">
                    <td className="py-2 px-3 font-semibold text-[11px] text-warm-white">
                      <span className="text-[9px] text-muted-dark uppercase mr-2 block sm:inline font-normal">
                        [{row.category}]
                      </span>
                      {row.capability}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className="text-[9px] font-bold text-accent-gold bg-accent-gold/10 px-1.5 py-0.5 rounded-xs">
                        {row.admin}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`text-[9px] ${row.manager === '—' ? 'text-muted-dark' : 'text-emerald-400'}`}>
                        {row.manager}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`text-[9px] ${row.advisor === '—' ? 'text-muted-dark' : 'text-sky-400'}`}>
                        {row.advisor}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`text-[9px] ${row.reception === '—' ? 'text-muted-dark' : 'text-purple-400'}`}>
                        {row.reception}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`text-[9px] ${row.technician === '—' ? 'text-muted-dark' : 'text-amber-400'}`}>
                        {row.technician}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`text-[9px] ${row.viewer === '—' ? 'text-muted-dark' : 'text-muted'}`}>
                        {row.viewer}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. ADD TEAM MEMBER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-obsidian border border-graphite-border rounded-xs max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent-gold" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-warm-white font-mono">
                  ADD NEW TEAM MEMBER
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-xs hover:bg-graphite text-muted hover:text-warm-white min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-muted-dark uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunil Gavaskar"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-graphite/40 border border-graphite-border rounded-xs px-3 py-2 text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-muted-dark uppercase block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="sunil@torqueexperts.in"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-graphite/40 border border-graphite-border rounded-xs px-3 py-2 text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-dark uppercase block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-graphite/40 border border-graphite-border rounded-xs px-3 py-2 text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-muted-dark uppercase block mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full bg-graphite/40 border border-graphite-border rounded-xs px-3 py-2 text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
                  >
                    <option value="SERVICE_ADVISOR">Service Advisor</option>
                    <option value="TECHNICIAN">Technician</option>
                    <option value="WORKSHOP_MANAGER">Workshop Manager</option>
                    <option value="RECEPTION">Receptionist</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-dark uppercase block mb-1">Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Drivetrain Specialist"
                    value={newSpec}
                    onChange={(e) => setNewSpec(e.target.value)}
                    className="w-full bg-graphite/40 border border-graphite-border rounded-xs px-3 py-2 text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-graphite-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xs bg-graphite border border-graphite-border text-muted hover:text-warm-white min-h-[44px]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent-gold text-obsidian font-bold rounded-xs uppercase hover:bg-white transition-colors min-h-[44px]"
                >
                  SAVE TEAM MEMBER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
