import React, { useState } from 'react';
import type { VehicleRecord, JobCard } from '../../types';
import {
  Search,
  ChevronRight,
} from 'lucide-react';

export interface VehiclesViewProps {
  vehicles: VehicleRecord[];
  jobs: JobCard[];
  onOpenJob: (jobId: string) => void;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({
  vehicles,
  jobs,
  onOpenJob,
}) => {
  const [search, setSearch] = useState('');
  const [selectedVehId, setSelectedVehId] = useState<string>(
    vehicles[0]?.id || 'veh-1'
  );

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.registration.toLowerCase().includes(search.toLowerCase()) ||
      v.make.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedVehicle =
    vehicles.find((v) => v.id === selectedVehId) || vehicles[0];

  const vehicleJobs = jobs.filter(
    (j) => j.registration === selectedVehicle?.registration || j.vehicle_id === selectedVehicle?.id
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-graphite-border">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block">
            Automotive Fleet Assets
          </span>
          <h1 className="text-2xl font-black uppercase tracking-tight text-warm-white">
            Vehicles
          </h1>
          <p className="text-xs text-muted font-light mt-0.5">
            Registered customer vehicles, masked VINs, service intervals, and active job linkages.
          </p>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Vehicles Table (Cols 1-7) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-dark absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search registration, make, model or owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-graphite/40 border border-graphite-border rounded-xs pl-8 pr-3 py-1.5 text-xs text-warm-white focus:outline-none focus:border-accent-gold"
            />
          </div>

          <div className="border border-graphite-border rounded-xs bg-obsidian divide-y divide-graphite-border/60">
            {filteredVehicles.length === 0 ? (
              <div className="py-12 text-center text-muted text-xs space-y-1">
                <p className="font-semibold text-warm-white">No vehicles found</p>
                <p className="text-[11px] text-muted-dark">
                  {search ? `No vehicles matching "${search}". Try adjusting registration or make.` : 'No vehicles registered in directory.'}
                </p>
              </div>
            ) : (
              filteredVehicles.map((veh) => {
                const isSelected = selectedVehicle?.id === veh.id;
                return (
                  <div
                    key={veh.id}
                    onClick={() => setSelectedVehId(veh.id)}
                    className={`p-4 hover:bg-graphite/30 cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected ? 'bg-accent-gold/10' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-warm-white text-xs">
                          {veh.year} {veh.make} {veh.model}
                        </span>
                        {veh.active_job_id && (
                          <span className="px-1.5 py-0.5 rounded-xs bg-accent-gold/20 text-accent-gold text-[9px] font-mono font-bold">
                            IN WORKSHOP
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-accent-gold font-mono font-semibold">{veh.registration}</p>
                      <p className="text-[10px] text-muted-dark">Owner: {veh.customer_name} · Odometer: {veh.odometer.toLocaleString()} km</p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-muted" />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Vehicle Detail Card (Cols 8-12) */}
        <div className="lg:col-span-5">
          {selectedVehicle ? (
            <div className="p-5 rounded-xs bg-graphite/40 border border-graphite-border space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
                <div>
                  <span className="text-[10px] font-mono text-muted-dark uppercase tracking-wider block">
                    Vehicle Specification
                  </span>
                  <h3 className="text-lg font-bold text-warm-white">
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  </h3>
                </div>

                <span className="px-2 py-0.5 rounded-xs bg-obsidian border border-graphite-border font-mono text-xs text-accent-gold">
                  {selectedVehicle.registration}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Registered Owner</span>
                  <span className="font-semibold text-warm-white">{selectedVehicle.customer_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Masked VIN</span>
                  <span className="font-mono text-warm-white">{selectedVehicle.vin_masked}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Current Odometer</span>
                  <span className="font-mono text-warm-white">{selectedVehicle.odometer.toLocaleString()} km</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-dark uppercase font-mono block">Next Service Due</span>
                  <span className="font-mono text-accent-gold">{selectedVehicle.next_service_due || 'N/A'}</span>
                </div>
              </div>

              {/* Connected Active & Past Jobs */}
              <div className="space-y-2 pt-2 border-t border-graphite-border">
                <span className="text-xs font-bold uppercase text-warm-white block">
                  Service Jobs ({vehicleJobs.length})
                </span>

                <div className="space-y-2">
                  {vehicleJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => onOpenJob(job.id)}
                      className="p-3 rounded-xs bg-obsidian border border-graphite-border hover:border-accent-gold cursor-pointer transition-colors flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-accent-gold">{job.id}</span>
                          <span className="text-warm-white font-medium">{job.service_name}</span>
                        </div>
                        <p className="text-[10px] text-muted mt-0.5">
                          Tech: {job.technician} · Bay: {job.bay}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-xs bg-accent-gold/10 text-accent-gold text-[9px] font-mono uppercase block">
                          {job.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-muted text-xs">
              Select a vehicle to inspect details.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
