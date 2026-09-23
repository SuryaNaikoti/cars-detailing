import React from 'react';
import {
  CheckCircle2,
} from 'lucide-react';

export interface TeamSettingsViewProps {
  mode: 'team' | 'settings';
}

export const TeamSettingsView: React.FC<TeamSettingsViewProps> = ({ mode }) => {
  const [workshopName, setWorkshopName] = React.useState("Torque Expert's");
  const [address, setAddress] = React.useState('Plot 42, Central Auto Hub, Phase II, Industrial Estate');
  const [phone, setPhone] = React.useState('+91 98765 43210');
  const [baysCount, setBaysCount] = React.useState(4);
  const [saved, setSaved] = React.useState(false);

  const teamMembers = [
    { name: 'Rohan Deshmukh', role: 'Service Advisor', email: 'rohan@torqueexperts.example', permissions: 'Full Workshop OS' },
    { name: 'Pooja Varma', role: 'Intake Advisor', email: 'pooja@torqueexperts.example', permissions: 'Leads, Appointments, Estimates' },
    { name: 'Arjun Sharma', role: 'Lead Diagnostic Tech', email: 'arjun@torqueexperts.example', permissions: 'Inspections, Work Logs' },
    { name: 'Rahul Sen', role: 'Senior Systems Tech', email: 'rahul@torqueexperts.example', permissions: 'Inspections, Work Logs' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (mode === 'team') {
    return (
      <div className="space-y-6">
        <div className="pb-4 border-b border-graphite-border">
          <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block">
            Access Governance
          </span>
          <h1 className="text-2xl font-black uppercase tracking-tight text-warm-white">
            Team & Permissions
          </h1>
          <p className="text-xs text-muted font-light mt-0.5">
            Role-based access control for workshop advisors, technicians, and floor managers.
          </p>
        </div>

        <div className="border border-graphite-border rounded-xs bg-obsidian overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-graphite/80 border-b border-graphite-border text-[10px] font-mono uppercase text-muted-dark tracking-wider">
                <th className="p-3">Staff Member</th>
                <th className="p-3">Role</th>
                <th className="p-3">Permissions Scope</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-border/60">
              {teamMembers.map((member) => (
                <tr key={member.name} className="hover:bg-graphite/30 transition-colors">
                  <td className="p-3">
                    <span className="font-semibold text-warm-white block">{member.name}</span>
                    <span className="text-[10px] text-muted font-mono">{member.email}</span>
                  </td>
                  <td className="p-3 text-warm-white font-medium">{member.role}</td>
                  <td className="p-3 text-muted font-mono">{member.permissions}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-xs bg-emerald-500/15 text-emerald-400 text-[9px] font-mono uppercase">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-graphite-border">
        <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block">
          Configuration
        </span>
        <h1 className="text-2xl font-black uppercase tracking-tight text-warm-white">
          Workshop Settings
        </h1>
        <p className="text-xs text-muted font-light mt-0.5">
          General facility configuration, bay limits, and default intake parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="max-w-xl p-6 rounded-xs bg-graphite/40 border border-graphite-border space-y-4 text-xs">
        {saved && (
          <div className="p-3 rounded-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Settings successfully saved.</span>
          </div>
        )}

        <div>
          <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">Facility Name</label>
          <input
            type="text"
            value={workshopName}
            onChange={(e) => setWorkshopName(e.target.value)}
            className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-1.5 text-xs text-warm-white focus:outline-none focus:border-accent-gold"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">Official Workshop Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-1.5 text-xs text-warm-white focus:outline-none focus:border-accent-gold"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">Support Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-1.5 text-xs text-warm-white focus:outline-none focus:border-accent-gold"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">Physical Bay Count</label>
            <input
              type="number"
              min="1"
              max="20"
              value={baysCount}
              onChange={(e) => setBaysCount(Number(e.target.value))}
              className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-1.5 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-graphite-border flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-accent-gold text-obsidian font-bold rounded-xs text-xs uppercase hover:bg-white transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
