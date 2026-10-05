import React, { useState, useEffect } from 'react';
import { DashboardLayout, type DashboardNavModule } from './DashboardLayout';
import { OverviewView } from './OverviewView';
import { WorkshopFloorView } from './WorkshopFloorView';
import { LeadsView } from './LeadsView';
import { AppointmentsView } from './AppointmentsView';
import { JobCardsView } from './JobCardsView';
import { InspectionsView } from './InspectionsView';
import { EstimatesView } from './EstimatesView';
import { CustomersView } from './CustomersView';
import { VehiclesView } from './VehiclesView';
import { ServiceHistoryView } from './ServiceHistoryView';
import { TechniciansView } from './TechniciansView';
import { CommunicationsView } from './CommunicationsView';
import { RemindersView } from './RemindersView';
import { ReportsView } from './ReportsView';
import { AnalyticsView } from './AnalyticsView';
import { TeamView } from './TeamView';
import { SettingsView } from './SettingsView';

import {
  getJobs,
  saveJob,
  getAppointments,
  saveAppointment,
  updateAppointmentStatus,
  convertAppointmentToJobCard,
  getLeads,
  saveLead,
  updateLeadStatus,
  convertLeadToAppointment,
  getCustomers,
  getVehicles,
  getInspections,
  saveInspection,
  createInspectionFromJobCard,
  getEstimates,
  saveEstimate,
  getTechnicians,
  getReminders,
  updateReminderStatus,
  getTeamMembers,
  saveTeamMember,
  getWorkshopProfile,
  saveWorkshopProfile,
  getSystemAuditEvents,
  subscribeToStorageUpdates,
} from '../../lib/demoStore';

import type {
  JobCard,
  AppointmentRecord,
  LeadRecord,
  CustomerRecord,
  VehicleRecord,
  InspectionRecord,
  EstimateRecord,
  TechnicianRecord,
  ServiceReminder,
  TeamMemberRecord,
  WorkshopProfileConfig,
  SystemAuditEvent,
} from '../../types';

export interface DashboardPageProps {
  onLogout: () => void;
  onOpenQuoteToken?: (token: string) => void;
  onOpenJobToken?: (token: string) => void;
  initialModule?: DashboardNavModule;
  initialJobId?: string | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onLogout,
  onOpenQuoteToken,
  onOpenJobToken,
  initialModule = 'overview',
  initialJobId = null,
}) => {
  const [currentModule, setCurrentModule] = useState<DashboardNavModule>(initialModule);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(initialJobId);

  // Central Store State
  const [jobs, setJobs] = useState<JobCard[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [inspections, setInspections] = useState<Record<string, InspectionRecord>>({});
  const [estimates, setEstimates] = useState<Record<string, EstimateRecord>>({});
  const [technicians, setTechnicians] = useState<TechnicianRecord[]>([]);
  const [reminders, setReminders] = useState<ServiceReminder[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberRecord[]>([]);
  const [workshopProfile, setWorkshopProfile] = useState<WorkshopProfileConfig>(getWorkshopProfile());
  const [auditEvents, setAuditEvents] = useState<SystemAuditEvent[]>([]);

  // Reload all records from centralized store
  const refreshStore = () => {
    setJobs(Object.values(getJobs()));
    setAppointments(getAppointments());
    setLeads(getLeads());
    setCustomers(Object.values(getCustomers()));
    setVehicles(Object.values(getVehicles()));
    setInspections(getInspections());
    setEstimates(getEstimates());
    setTechnicians(getTechnicians());
    setReminders(getReminders());
    setTeamMembers(getTeamMembers());
    setWorkshopProfile(getWorkshopProfile());
    setAuditEvents(getSystemAuditEvents());
  };

  useEffect(() => {
    refreshStore();
    const unsubscribe = subscribeToStorageUpdates((_key) => {
      refreshStore();
    });
    return () => unsubscribe();
  }, []);

  const handleOpenJob = (id: string) => {
    setSelectedJobId(id);
    setCurrentModule('jobs');
  };

  const handleJobUpdated = (updated: JobCard) => {
    saveJob(updated);
    refreshStore();
  };

  const handleQuickAction = (action: string) => {
    if (action === 'new-lead') {
      setCurrentModule('leads');
    } else if (action === 'new-appointment') {
      setCurrentModule('appointments');
    } else if (action === 'new-job') {
      setSelectedJobId(null);
      setCurrentModule('jobs');
    }
  };


  return (
    <DashboardLayout
      currentModule={currentModule}
      onSelectModule={(mod) => {
        if (mod !== 'jobs') setSelectedJobId(null);
        setCurrentModule(mod);
      }}
      onLogout={onLogout}
      onQuickAction={handleQuickAction}
      activeJobId={selectedJobId}
    >
      {/* 1. OVERVIEW */}
      {currentModule === 'overview' && (
        <OverviewView
          jobs={jobs}
          appointments={appointments}
          leads={leads}
          reminders={reminders}
          onOpenJob={handleOpenJob}
          onNavigateModule={(mod) => setCurrentModule(mod)}
          onQuickAction={handleQuickAction}
        />
      )}

      {/* 2. WORKSHOP FLOOR */}
      {currentModule === 'floor' && (
        <WorkshopFloorView
          jobs={jobs}
          technicians={technicians}
          customers={customers}
          vehicles={vehicles}
          onOpenJob={handleOpenJob}
          onNavigateModule={(mod) => setCurrentModule(mod)}
          onUpdateJob={handleJobUpdated}
          onOpenCustomerView={(token) => {
            if (onOpenJobToken) onOpenJobToken(token);
          }}
        />
      )}

      {/* 3. LEADS & ENQUIRIES */}
      {currentModule === 'leads' && (
        <LeadsView
          leads={leads}
          onUpdateLeadStatus={(id, st, actor, notes, lostReason) => {
            updateLeadStatus(id, st, actor, notes, lostReason);
            refreshStore();
          }}
          onConvertToAppointment={(leadId, date, time, advisor) => {
            convertLeadToAppointment(leadId, date, time, advisor);
            refreshStore();
            setCurrentModule('appointments');
          }}
          onSaveNewLead={(newLead) => {
            saveLead(newLead);
            refreshStore();
          }}
          onOpenCustomer={() => setCurrentModule('customers')}
          onOpenVehicle={() => setCurrentModule('vehicles')}
          onOpenAppointment={() => setCurrentModule('appointments')}
          onOpenJobCard={(jobId) => handleOpenJob(jobId)}
        />
      )}

      {/* 4. APPOINTMENTS */}
      {currentModule === 'appointments' && (
        <AppointmentsView
          appointments={appointments}
          onUpdateStatus={(id, st) => {
            updateAppointmentStatus(id, st);
            refreshStore();
          }}
          onUpdateAppointment={(updated) => {
            saveAppointment(updated);
            refreshStore();
          }}
          onConvertToJobCard={(apptId) => {
            const newJob = convertAppointmentToJobCard(apptId);
            refreshStore();
            if (newJob) {
              handleOpenJob(newJob.id);
            }
          }}
          onSaveNewAppointment={(newAppt) => {
            saveAppointment(newAppt);
            refreshStore();
          }}
          onOpenJobCard={(jobId) => {
            handleOpenJob(jobId);
          }}
          onOpenLead={() => {
            setCurrentModule('leads');
          }}
          onOpenCustomer={() => {
            setCurrentModule('customers');
          }}
          onOpenVehicle={() => {
            setCurrentModule('vehicles');
          }}
        />
      )}

      {/* 5. JOB CARDS (Central Workshop Execution Workspace) */}
      {currentModule === 'jobs' && (
        <JobCardsView
          jobs={jobs}
          appointments={appointments}
          inspections={inspections}
          estimates={estimates}
          selectedJobId={selectedJobId}
          onSelectJobId={(id) => setSelectedJobId(id)}
          onOpenJob={handleOpenJob}
          onSaveNewJob={(newJob) => {
            saveJob(newJob);
            refreshStore();
          }}
          onUpdateJob={handleJobUpdated}
          onNavigateModule={(mod) => setCurrentModule(mod)}
          onOpenCustomerView={(token) => {
            if (onOpenJobToken) onOpenJobToken(token);
          }}
          onOpenQuoteToken={onOpenQuoteToken}
        />
      )}

      {/* 6. INSPECTIONS */}
      {currentModule === 'inspections' && (
        <InspectionsView
          inspections={inspections}
          jobs={jobs}
          estimates={estimates}
          technicians={technicians}
          onSaveInspection={(insp) => {
            saveInspection(insp);
            refreshStore();
          }}
          onCreateInspection={(jobId, tech) => {
            const job = jobs.find((j) => j.id === jobId);
            if (job) {
              const created = createInspectionFromJobCard(job, tech);
              refreshStore();
              return created;
            }
            return null;
          }}
          onOpenJob={handleOpenJob}
          onNavigateModule={(mod) => setCurrentModule(mod)}
          onOpenCustomerView={(token) => {
            if (onOpenJobToken) onOpenJobToken(token);
          }}
        />
      )}

      {/* 7. ESTIMATES & APPROVALS (Authoritative Commercial Workspace) */}
      {currentModule === 'estimates' && (
        <EstimatesView
          estimates={estimates}
          jobs={jobs}
          inspections={inspections}
          appointments={appointments}
          leads={leads}
          onSaveEstimate={(est) => {
            saveEstimate(est);
            refreshStore();
          }}
          onOpenQuoteToken={(tok) => {
            if (onOpenQuoteToken) onOpenQuoteToken(tok);
          }}
          onOpenJob={handleOpenJob}
          onNavigateModule={(mod) => setCurrentModule(mod)}
        />
      )}

      {/* 8. CUSTOMERS */}
      {currentModule === 'customers' && (
        <CustomersView
          customers={customers}
          jobs={jobs}
          onOpenJob={handleOpenJob}
        />
      )}

      {/* 9. VEHICLES */}
      {currentModule === 'vehicles' && (
        <VehiclesView
          vehicles={vehicles}
          jobs={jobs}
          onOpenJob={handleOpenJob}
        />
      )}

      {/* 10. SERVICE HISTORY */}
      {currentModule === 'service-history' && (
        <ServiceHistoryView
          jobs={jobs}
          customers={customers}
          vehicles={vehicles}
          inspections={inspections}
          estimates={estimates}
          technicians={technicians}
          reminders={reminders}
          onOpenJob={handleOpenJob}
          onNavigateModule={(mod) => setCurrentModule(mod)}
          onRefreshStore={refreshStore}
        />
      )}

      {/* 11. REMINDERS (Retention & Follow-Ups Workspace) */}
      {currentModule === 'reminders' && (
        <RemindersView
          reminders={reminders}
          vehicles={vehicles}
          jobs={jobs}
          estimates={estimates}
          onUpdateStatus={(id, st) => {
            updateReminderStatus(id, st);
            refreshStore();
          }}
          onOpenCustomer={() => {
            setCurrentModule('customers');
          }}
          onOpenVehicle={(_reg) => {
            setCurrentModule('vehicles');
          }}
          onOpenEstimate={(_estId) => {
            setCurrentModule('estimates');
          }}
          onOpenJob={(jobId) => {
            handleOpenJob(jobId);
          }}
          onNavigateModule={(mod) => setCurrentModule(mod)}
          onRefreshStore={refreshStore}
        />
      )}

      {/* 12. TECHNICIANS */}
      {currentModule === 'technicians' && (
        <TechniciansView
          technicians={technicians}
          jobs={jobs}
          vehicles={vehicles}
          onOpenJob={handleOpenJob}
          onNavigateModule={(mod) => setCurrentModule(mod)}
          onRefreshStore={refreshStore}
        />
      )}

      {/* 13. COMMUNICATIONS */}
      {currentModule === 'communications' && (
        <CommunicationsView
          jobs={jobs}
          onOpenCustomerView={(token) => {
            if (onOpenJobToken) onOpenJobToken(token);
          }}
        />
      )}

      {/* 14. REPORTS (Operational Facts & Period Totals) */}
      {currentModule === 'reports' && (
        <ReportsView
          jobs={jobs}
          leads={leads}
          appointments={appointments}
          customers={customers}
          vehicles={vehicles}
          estimates={estimates}
          technicians={technicians}
          reminders={reminders}
          onOpenJob={handleOpenJob}
          onNavigateModule={(mod) => setCurrentModule(mod as DashboardNavModule)}
        />
      )}

      {/* 15. ANALYTICS (Operational Intelligence, Funnels & Action Queues) */}
      {currentModule === 'analytics' && (
        <AnalyticsView
          jobs={jobs}
          leads={leads}
          appointments={appointments}
          customers={customers}
          vehicles={vehicles}
          estimates={estimates}
          technicians={technicians}
          reminders={reminders}
          onOpenJob={handleOpenJob}
          onNavigateModule={(mod) => setCurrentModule(mod as DashboardNavModule)}
        />
      )}

      {/* 16. SYSTEM: TEAM & PERMISSIONS */}
      {currentModule === 'team' && (
        <TeamView
          teamMembers={teamMembers}
          technicians={technicians}
          jobs={jobs}
          onSaveTeamMember={(member) => {
            saveTeamMember(member);
            refreshStore();
          }}
          onOpenJob={handleOpenJob}
          onNavigateModule={(mod) => setCurrentModule(mod as DashboardNavModule)}
        />
      )}

      {/* 17. SYSTEM: WORKSHOP SETTINGS & GOVERNANCE */}
      {currentModule === 'settings' && (
        <SettingsView
          workshopProfile={workshopProfile}
          jobs={jobs}
          estimates={estimates}
          inspections={inspections}
          leads={leads}
          appointments={appointments}
          auditEvents={auditEvents}
          onSaveProfile={(prof) => {
            saveWorkshopProfile(prof);
            refreshStore();
          }}
          onNavigateModule={(mod) => setCurrentModule(mod as DashboardNavModule)}
        />
      )}
    </DashboardLayout>
  );
};
