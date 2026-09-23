import React, { useState } from 'react';
import {
  LayoutDashboard,
  Kanban,
  UserCheck,
  Calendar,
  FileCheck2,
  ClipboardList,
  Calculator,
  Users,
  Car,
  History,
  BellRing,
  Wrench,
  MessageSquare,
  BarChart3,
  TrendingUp,
  ShieldAlert,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  LogOut,
  ChevronRight,
} from 'lucide-react';

export type DashboardNavModule =
  | 'overview'
  // WORKSHOP
  | 'floor'
  | 'leads'
  | 'appointments'
  | 'jobs'
  | 'inspections'
  | 'estimates'
  // CUSTOMERS
  | 'customers'
  | 'vehicles'
  | 'service-history'
  | 'reminders'
  // OPERATIONS
  | 'technicians'
  | 'communications'
  // INSIGHTS
  | 'reports'
  | 'analytics'
  // SYSTEM
  | 'team'
  | 'settings';

export interface DashboardLayoutProps {
  currentModule: DashboardNavModule;
  onSelectModule: (module: DashboardNavModule) => void;
  onLogout: () => void;
  onQuickAction?: (action: string) => void;
  children: React.ReactNode;
  activeJobId?: string | null;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentModule,
  onSelectModule,
  onLogout,
  onQuickAction,
  children,
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navGroups = [
    {
      label: 'OVERVIEW',
      items: [
        { id: 'overview' as DashboardNavModule, label: 'Control Center', icon: LayoutDashboard },
      ],
    },
    {
      label: 'WORKSHOP',
      items: [
        { id: 'floor' as DashboardNavModule, label: 'Workshop Floor', icon: Kanban },
        { id: 'leads' as DashboardNavModule, label: 'Leads & Enquiries', icon: UserCheck },
        { id: 'appointments' as DashboardNavModule, label: 'Appointments', icon: Calendar },
        { id: 'jobs' as DashboardNavModule, label: 'Job Cards', icon: FileCheck2 },
        { id: 'inspections' as DashboardNavModule, label: 'Inspections', icon: ClipboardList },
        { id: 'estimates' as DashboardNavModule, label: 'Estimates & Approvals', icon: Calculator },
      ],
    },
    {
      label: 'CUSTOMERS',
      items: [
        { id: 'customers' as DashboardNavModule, label: 'Customers', icon: Users },
        { id: 'vehicles' as DashboardNavModule, label: 'Vehicles', icon: Car },
        { id: 'service-history' as DashboardNavModule, label: 'Service History', icon: History },
        { id: 'reminders' as DashboardNavModule, label: 'Reminders', icon: BellRing },
      ],
    },
    {
      label: 'OPERATIONS',
      items: [
        { id: 'technicians' as DashboardNavModule, label: 'Technicians', icon: Wrench },
        { id: 'communications' as DashboardNavModule, label: 'Communications', icon: MessageSquare },
      ],
    },
    {
      label: 'INSIGHTS',
      items: [
        { id: 'reports' as DashboardNavModule, label: 'Reports', icon: BarChart3 },
        { id: 'analytics' as DashboardNavModule, label: 'Analytics', icon: TrendingUp },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        { id: 'team' as DashboardNavModule, label: 'Team & Permissions', icon: ShieldAlert },
        { id: 'settings' as DashboardNavModule, label: 'Settings', icon: Settings },
      ],
    },
  ];

  const handleNavClick = (module: DashboardNavModule) => {
    onSelectModule(module);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-obsidian text-warm-white flex flex-col font-sans">
      
      {/* Top Header Bar */}
      <header className="h-16 bg-obsidian border-b border-graphite-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 text-muted hover:text-warm-white rounded-xs border border-graphite-border"
            aria-label="Toggle Navigation Drawer"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex flex-col">
            <span className="text-sm font-extrabold tracking-tight text-warm-white">
              TORQUE EXPERT’S
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase text-accent-gold">
              Workshop Operating System · V3.0
            </span>
          </div>
        </div>

        {/* Center: Global Search & Quick Filter */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-muted-dark absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Job ID, Registration, Customer or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-graphite/40 border border-graphite-border rounded-xs pl-8 pr-3 py-1.5 text-xs text-warm-white placeholder-muted-dark focus:outline-none focus:border-accent-gold"
            />
          </div>
        </div>

        {/* Right: Date, Notifications & Staff Profile */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-medium text-warm-white">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="text-[10px] font-mono text-muted-dark">
              Workshop Active · 08:00 - 20:00
            </span>
          </div>

          <div className="h-6 w-[1px] bg-graphite-border hidden sm:block" />

          {/* Quick Notifications */}
          <button
            title="Operational Notifications"
            className="relative p-2 text-muted hover:text-warm-white transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-accent-gold absolute top-1.5 right-1.5" />
          </button>

          {/* User Profile & Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xs hover:bg-graphite/40 border border-transparent hover:border-graphite-border transition-colors text-left"
              aria-label="User Profile Menu"
              aria-expanded={profileMenuOpen}
            >
              <div className="w-7 h-7 rounded-full bg-accent-gold/20 border border-accent-gold/40 flex items-center justify-center text-[11px] font-bold text-accent-gold font-mono">
                RD
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-warm-white leading-tight">
                  Rohan Deshmukh
                </span>
                <span className="text-[9px] text-muted-dark uppercase tracking-wider">
                  Service Advisor
                </span>
              </div>
            </button>

            {/* Profile Menu Dropdown */}
            {profileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-obsidian border border-graphite-border rounded-xs shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setProfileMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-graphite-border">
                  <p className="text-xs font-semibold text-warm-white">Rohan Deshmukh</p>
                  <p className="text-[10px] text-muted font-mono">Advisor · rohan@torqueexperts.in</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => handleNavClick('team')}
                    className="w-full text-left px-3 py-2 text-xs text-muted hover:text-warm-white hover:bg-graphite/40 transition-colors"
                  >
                    Profile & Credentials
                  </button>
                  <button
                    onClick={() => handleNavClick('settings')}
                    className="w-full text-left px-3 py-2 text-xs text-muted hover:text-warm-white hover:bg-graphite/40 transition-colors"
                  >
                    Workshop Preferences
                  </button>
                </div>
                <div className="border-t border-graphite-border pt-1">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Exit to Public Website</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex flex-1 relative overflow-hidden">
        
        {/* Mobile Backdrop Overlay */}
        {mobileNavOpen && (
          <div
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 top-16 bg-black/75 z-40 md:hidden backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />
        )}

        {/* Sidebar: Desktop Persistent & Mobile Off-Canvas Drawer */}
        <aside
          className={`fixed md:sticky top-16 z-50 md:z-20 h-[calc(100vh-4rem)] w-72 md:w-64 bg-obsidian border-r border-graphite-border flex flex-col justify-between overflow-y-auto transition-transform duration-250 ease-in-out shadow-2xl md:shadow-none ${
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="p-3 space-y-6">
            {navGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                <span className="text-[10px] font-mono tracking-widest text-muted-dark px-3 uppercase block font-semibold">
                  {group.label}
                </span>

                <nav className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentModule === item.id;
                    return (
                      <button
                        key={item.id}
                        data-module={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-medium transition-colors min-h-[40px] ${
                          isActive
                            ? 'bg-accent-gold/15 text-accent-gold font-semibold border-l-2 border-accent-gold'
                            : 'text-muted hover:text-warm-white hover:bg-graphite/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-accent-gold' : 'text-muted-dark'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {isActive && <ChevronRight className="w-3 h-3 text-accent-gold shrink-0" />}
                      </button>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Quick Actions Drawer Footer */}
          <div className="p-3 border-t border-graphite-border bg-graphite/20 space-y-2 safe-pb">
            <span className="text-[9px] font-mono text-muted-dark uppercase tracking-widest px-1 block">
              Quick Operations
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  if (onQuickAction) onQuickAction('new-lead');
                  else onSelectModule('leads');
                  setMobileNavOpen(false);
                }}
                className="px-2 py-2.5 bg-obsidian border border-graphite-border rounded-xs text-[10px] font-medium text-muted hover:text-warm-white hover:border-accent-gold transition-colors text-center min-h-[38px]"
              >
                + New Lead
              </button>
              <button
                onClick={() => {
                  if (onQuickAction) onQuickAction('new-job');
                  else onSelectModule('jobs');
                  setMobileNavOpen(false);
                }}
                className="px-2 py-2.5 bg-obsidian border border-graphite-border rounded-xs text-[10px] font-medium text-accent-gold hover:border-accent-gold transition-colors text-center min-h-[38px]"
              >
                + New Job
              </button>
            </div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 bg-obsidian/95 overflow-y-auto min-h-[calc(100vh-4rem)] p-3.5 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};
