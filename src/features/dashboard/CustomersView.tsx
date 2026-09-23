import React, { useState } from 'react';
import type { CustomerRecord, JobCard } from '../../types';
import {
  Search,
  ChevronRight,
} from 'lucide-react';

export interface CustomersViewProps {
  customers: CustomerRecord[];
  jobs: JobCard[];
  onOpenJob: (jobId: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  jobs,
  onOpenJob,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCustId, setSelectedCustId] = useState<string>(
    customers[0]?.id || 'cust-1'
  );

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedCustomer =
    customers.find((c) => c.id === selectedCustId) || customers[0];

  const customerJobs = jobs.filter(
    (j) => j.customer_name === selectedCustomer?.name || j.customer_id === selectedCustomer?.id
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-graphite-border">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block">
            Customer Directory
          </span>
          <h1 className="text-2xl font-black uppercase tracking-tight text-warm-white">
            Customers
          </h1>
          <p className="text-xs text-muted font-light mt-0.5">
            Client profiles, linked vehicle assets, active jobs, and historical visit records.
          </p>
        </div>
      </div>

      {/* Main Grid: List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Customer List (Cols 1-6) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-dark absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-graphite/40 border border-graphite-border rounded-xs pl-8 pr-3 py-1.5 text-xs text-warm-white focus:outline-none focus:border-accent-gold"
            />
          </div>

          <div className="border border-graphite-border rounded-xs bg-obsidian divide-y divide-graphite-border/60">
            {filteredCustomers.length === 0 ? (
              <div className="py-12 text-center text-muted text-xs space-y-1">
                <p className="font-semibold text-warm-white">No customer profiles found</p>
                <p className="text-[11px] text-muted-dark">
                  {search ? `No customers matching "${search}". Try searching by name or phone.` : 'No customers registered in directory.'}
                </p>
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = selectedCustomer?.id === cust.id;
                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustId(cust.id)}
                    className={`p-4 hover:bg-graphite/30 cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected ? 'bg-accent-gold/10' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-warm-white text-xs">{cust.name}</span>
                        {cust.active_job_id && (
                          <span className="px-1.5 py-0.5 rounded-xs bg-accent-gold/20 text-accent-gold text-[9px] font-mono font-bold">
                            ACTIVE JOB
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted font-mono">{cust.phone}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-dark font-mono">
                        <span>Vehicles: {cust.vehicle_count}</span>
                        <span>Total Visits: {cust.total_visits}</span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-muted" />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Customer Detail (Cols 7-12) */}
        <div className="lg:col-span-6">
          {selectedCustomer ? (
            <div className="p-5 rounded-xs bg-graphite/40 border border-graphite-border space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-muted-dark uppercase tracking-wider">
                    Profile Detail
                  </span>
                  <h3 className="text-lg font-bold text-warm-white">
                    {selectedCustomer.name}
                  </h3>
                </div>

                <span className="font-mono text-xs text-accent-gold">
                  {selectedCustomer.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Phone</span>
                  <span className="font-mono text-warm-white">{selectedCustomer.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Email</span>
                  <span className="font-mono text-warm-white">{selectedCustomer.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Last Service</span>
                  <span className="font-mono text-warm-white">{selectedCustomer.last_service_date || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Next Service Due</span>
                  <span className="font-mono text-accent-gold">{selectedCustomer.next_service_due || 'N/A'}</span>
                </div>
              </div>

              {selectedCustomer.notes && (
                <div className="p-3 rounded-xs bg-obsidian border border-graphite-border text-xs space-y-1">
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Customer Preferences & Notes</span>
                  <p className="text-muted leading-relaxed font-light">{selectedCustomer.notes}</p>
                </div>
              )}

              {/* Linked Active & Historical Jobs */}
              <div className="space-y-2 pt-2 border-t border-graphite-border">
                <span className="text-xs font-bold uppercase text-warm-white block">
                  Service Jobs ({customerJobs.length})
                </span>

                <div className="space-y-2">
                  {customerJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => onOpenJob(job.id)}
                      className="p-3 rounded-xs bg-obsidian border border-graphite-border hover:border-accent-gold cursor-pointer transition-colors flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-accent-gold">{job.id}</span>
                          <span className="text-warm-white font-medium">{job.vehicle_summary}</span>
                        </div>
                        <p className="text-[11px] text-muted mt-0.5">{job.service_name}</p>
                      </div>

                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-xs bg-accent-gold/10 text-accent-gold text-[9px] font-mono uppercase block">
                          {job.status}
                        </span>
                        <span className="text-[10px] text-muted font-mono block mt-1">
                          ₹{job.estimate_total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-muted text-xs">
              Select a customer to inspect records.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
