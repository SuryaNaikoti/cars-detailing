import React, { useState } from 'react';
import type { JobCard, LeadRecord, AppointmentRecord } from '../../types';
import {
  TrendingUp,
  Wrench,
} from 'lucide-react';

export interface ReportsAnalyticsViewProps {
  jobs: JobCard[];
  leads: LeadRecord[];
  appointments: AppointmentRecord[];
}

export const ReportsAnalyticsView: React.FC<ReportsAnalyticsViewProps> = ({
  jobs,
  leads,
  appointments,
}) => {
  const [dateFilter, setDateFilter] = useState('month');

  // Basic operational calculations (No fake financial accounting or fake AI)
  const jobsOpened = jobs.length;
  const jobsCompleted = jobs.filter((j) => j.status === 'DELIVERED').length;
  const approvedJobs = jobs.filter((j) => j.approval_status === 'APPROVED').length;
  const approvalRate = Math.round((approvedJobs / Math.max(1, jobs.length)) * 100);
  const readyForCollectionCount = jobs.filter((j) => j.status === 'READY_FOR_COLLECTION').length;
  const convertedLeads = leads.filter((l) => l.status === 'CONVERTED').length;
  const leadConversionRate = Math.round((convertedLeads / Math.max(1, leads.length)) * 100);
  const completedAppointments = appointments.filter((a) => a.status === 'ARRIVED' || a.status === 'COMPLETED').length;
  const appointmentArrivalRate = Math.round((completedAppointments / Math.max(1, appointments.length)) * 100);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-graphite-border">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block">
            Operational Intelligence
          </span>
          <h1 className="text-2xl font-black uppercase tracking-tight text-warm-white">
            Workshop Reports & Analytics
          </h1>
          <p className="text-xs text-muted font-light mt-0.5">
            Operational throughput, customer approval rates, intake funnel conversion, and technician workloads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-graphite border border-graphite-border rounded-xs px-3 py-1.5 text-xs text-warm-white font-mono focus:outline-none focus:border-accent-gold"
          >
            <option value="today">Today</option>
            <option value="week">Current Week</option>
            <option value="month">Current Month</option>
            <option value="quarter">Quarter to Date</option>
          </select>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xs bg-graphite/40 border border-graphite-border space-y-1">
          <span className="text-[10px] font-mono uppercase text-muted-dark tracking-wider block">Jobs Opened</span>
          <span className="text-2xl font-black font-mono text-warm-white">{jobsOpened}</span>
          <p className="text-[10px] text-muted">All active & staged cards</p>
        </div>

        <div className="p-4 rounded-xs bg-graphite/40 border border-graphite-border space-y-1">
          <span className="text-[10px] font-mono uppercase text-muted-dark tracking-wider block">Completed / Handed Over</span>
          <span className="text-2xl font-black font-mono text-emerald-400">{jobsCompleted}</span>
          <p className="text-[10px] text-muted">Lifecycle status: Delivered</p>
        </div>

        <div className="p-4 rounded-xs bg-graphite/40 border border-graphite-border space-y-1">
          <span className="text-[10px] font-mono uppercase text-muted-dark tracking-wider block">Estimate Approval Rate</span>
          <span className="text-2xl font-black font-mono text-accent-gold">{approvalRate}%</span>
          <p className="text-[10px] text-muted">{approvedJobs} of {jobs.length} authorized</p>
        </div>

        <div className="p-4 rounded-xs bg-graphite/40 border border-graphite-border space-y-1">
          <span className="text-[10px] font-mono uppercase text-muted-dark tracking-wider block">Ready for Collection</span>
          <span className="text-2xl font-black font-mono text-sky-400">{readyForCollectionCount}</span>
          <p className="text-[10px] text-muted">Post-QC collection queue</p>
        </div>
      </div>

      {/* Secondary Operational Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Funnel Conversion */}
        <div className="p-5 rounded-xs bg-graphite/40 border border-graphite-border space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-warm-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent-gold" />
            Intake Pipeline Performance
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-graphite-border/60">
              <span className="text-muted">Total Enquiries Received</span>
              <span className="font-mono font-bold text-warm-white">{leads.length}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-graphite-border/60">
              <span className="text-muted">Enquiries Converted to Bookings</span>
              <span className="font-mono font-bold text-emerald-400">{convertedLeads} ({leadConversionRate}%)</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-graphite-border/60">
              <span className="text-muted">Scheduled Appointments</span>
              <span className="font-mono font-bold text-warm-white">{appointments.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Arrival & Intake Rate</span>
              <span className="font-mono font-bold text-accent-gold">{appointmentArrivalRate}%</span>
            </div>
          </div>
        </div>

        {/* Technician Workload Distribution */}
        <div className="p-5 rounded-xs bg-graphite/40 border border-graphite-border space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-warm-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-accent-gold" />
            Technician Active Floor Allocation
          </h3>

          <div className="space-y-3 text-xs">
            {['Arjun Sharma', 'Rahul Sen', 'Vikram Singh', 'Farhan Akhtar'].map((tech) => {
              const techJobs = jobs.filter((j) => j.technician.includes(tech.split(' ')[0]));
              return (
                <div key={tech} className="flex items-center justify-between pb-2 border-b border-graphite-border/60 last:border-0 last:pb-0">
                  <div>
                    <span className="font-semibold text-warm-white block">{tech}</span>
                    <span className="text-[10px] text-muted-dark">German Specialist</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-xs bg-obsidian border border-graphite-border font-mono text-xs font-bold text-accent-gold">
                    {techJobs.length} Active Jobs
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
