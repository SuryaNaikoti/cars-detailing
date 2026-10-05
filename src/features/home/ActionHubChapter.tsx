import React, { useState, useEffect } from 'react';
import { CURATED_VEHICLE_OPTIONS, APPROVED_SERVICES } from '../../data/demoData';
import { saveLead } from '../../lib/demoStore';
import { CheckCircle2, MessageSquare, Wrench, Search, PhoneCall } from 'lucide-react';
import { generateWhatsAppLink } from '../../lib/utils';
import type { Lead } from '../../types';

export interface ActionHubChapterProps {
  selectedServicePreselect?: string | null;
  onServiceSelect?: (slug: string) => void;
  onViewServiceStatus?: () => void;
  onContactWorkshop?: () => void;
}

export const ActionHubChapter: React.FC<ActionHubChapterProps> = ({
  selectedServicePreselect,
  onServiceSelect,
  onViewServiceStatus,
  onContactWorkshop,
}) => {
  const [selectedMake, setSelectedMake] = useState<string>(CURATED_VEHICLE_OPTIONS[0].make);
  const [selectedModel, setSelectedModel] = useState<string>(CURATED_VEHICLE_OPTIONS[0].models[0]);
  const [selectedYear, setSelectedYear] = useState<number>(CURATED_VEHICLE_OPTIONS[0].years[0]);
  const [selectedService, setSelectedService] = useState<string>(
    selectedServicePreselect || APPROVED_SERVICES[0].slug
  );

  // Concern / notes
  const [concern, setConcern] = useState<string>('');

  // Customer contact details
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredContact, setPreferredContact] = useState<'PHONE' | 'WHATSAPP' | 'EMAIL'>('PHONE');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Synchronize when external service is preselected via CTA routing
  useEffect(() => {
    if (selectedServicePreselect) {
      setSelectedService(selectedServicePreselect);
    }
  }, [selectedServicePreselect]);

  const activeOption =
    CURATED_VEHICLE_OPTIONS.find((v) => v.make === selectedMake) || CURATED_VEHICLE_OPTIONS[0];

  const handleMakeChange = (make: string) => {
    setSelectedMake(make);
    const option = CURATED_VEHICLE_OPTIONS.find((v) => v.make === make);
    if (option) {
      setSelectedModel(option.models[0]);
      setSelectedYear(option.years[0]);
    }
  };

  const handleServiceChange = (slug: string) => {
    setSelectedService(slug);
    if (onServiceSelect) {
      onServiceSelect(slug);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Valid 10-digit phone number is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const serviceObj = APPROVED_SERVICES.find((s) => s.slug === selectedService);
    const serviceName = serviceObj ? serviceObj.name : selectedService;

    // Canonical write to workshop demoStore
    const newLead: Lead = {
      id: 'lead-' + Date.now(),
      created_at: new Date().toISOString(),
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      customer_email: email.trim() || undefined,
      vehicle_make: selectedMake,
      vehicle_model: selectedModel,
      vehicle_year: Number(selectedYear),
      service_name: serviceName,
      issue: concern.trim() || 'Service requested via Action Hub',
      preferred_date: preferredDate || undefined,
      source: 'Website',
      status: 'NEW',
      priority: 'HIGH',
      assigned_advisor: 'Rohan Deshmukh',
      next_action: `Follow up via ${preferredContact.toLowerCase()} for intake appointment`,
      vehicle_summary: `${selectedYear} ${selectedMake} ${selectedModel}`,
      service_requested: serviceName,
      message: `Preferred contact: ${preferredContact}. ${concern.trim()}`,
    };

    saveLead(newLead);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 500);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setName('');
    setPhone('');
    setEmail('');
    setConcern('');
    setPreferredDate('');
    setErrors({});
  };

  return (
    <section id="action-hub" className="py-24 sm:py-32 bg-obsidian border-b border-graphite-border scroll-mt-24">
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-12">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Action Hub Editorial Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-accent-gold" />
              <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-accent-gold">
                SERVICE CONSULTATION & BOOKING
              </span>
              <span className="w-8 h-[1px] bg-accent-gold" />
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tightest text-warm-white uppercase">
              YOUR NEXT SERVICE STARTS HERE.
            </h2>

            <p className="text-sm sm:text-base text-muted font-light max-w-xl mx-auto leading-relaxed">
              Tell us what your vehicle needs. We’ll confirm bay availability and scheduling.
            </p>
          </div>

          {/* Canonical Action Hub Conversion Container */}
          <div className="p-6 sm:p-10 lg:p-12 rounded-xs bg-graphite/60 border border-graphite-border shadow-2xl relative overflow-hidden">
            {isSubmitted ? (
              <div className="py-12 px-4 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2 max-w-lg mx-auto">
                  <h3 className="text-2xl font-bold uppercase tracking-tight text-warm-white">
                    Service Request Received
                  </h3>
                  <p className="text-sm text-muted font-light leading-relaxed">
                    Thank you, <strong className="text-warm-white font-medium">{name}</strong>. Your request for the{' '}
                    <strong className="text-accent-gold font-medium font-mono">{selectedYear} {selectedMake} {selectedModel}</strong>{' '}
                    has been cataloged in our workshop queue.
                  </p>
                  <p className="text-xs text-muted-dark font-mono pt-2">
                    Our lead service advisor will contact you via {preferredContact.toLowerCase()} shortly with bay scheduling details.
                  </p>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full sm:w-auto px-6 py-3 bg-graphite border border-graphite-border hover:border-warm-white/40 text-warm-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors min-h-[44px]"
                  >
                    Submit Another Request
                  </button>
                  <a
                    href={generateWhatsAppLink({})}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors min-h-[44px]"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Service Desk</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. VEHICLE SELECTION */}
                <div className="space-y-4 pb-6 border-b border-graphite-border/70">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-warm-white font-bold flex items-center gap-2">
                      <span className="text-accent-gold font-mono">01</span>
                      <span>VEHICLE SPECIFICATION</span>
                    </span>
                    <span className="text-[10px] font-mono text-muted-dark uppercase tracking-widest">
                      Select Marque & Platform
                    </span>
                  </div>

                  {/* Make Selector: Clean Button Grid on >= 640px, Native Dropdown on < 640px */}
                  <div className="space-y-2">
                    <label htmlFor="action-hub-make" className="text-[11px] uppercase tracking-wider text-muted font-mono block">
                      Marque / Make
                    </label>

                    {/* Mobile dropdown */}
                    <div className="sm:hidden">
                      <select
                        id="action-hub-make"
                        value={selectedMake}
                        onChange={(e) => handleMakeChange(e.target.value)}
                        className="w-full bg-obsidian border border-graphite-border rounded-xs px-4 py-3 text-sm font-semibold text-warm-white focus:outline-none focus:border-accent-gold min-h-[48px]"
                      >
                        {CURATED_VEHICLE_OPTIONS.map((opt) => (
                          <option key={opt.make} value={opt.make} className="bg-graphite text-warm-white">
                            {opt.make}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tablet/Desktop Grid */}
                    <div className="hidden sm:grid grid-cols-3 lg:grid-cols-6 gap-2">
                      {CURATED_VEHICLE_OPTIONS.map((opt) => (
                        <button
                          key={opt.make}
                          type="button"
                          onClick={() => handleMakeChange(opt.make)}
                          className={`py-3 px-2 text-xs font-bold uppercase tracking-wider rounded-xs border transition-all text-center min-h-[44px] ${
                            selectedMake === opt.make
                              ? 'bg-warm-white text-obsidian border-warm-white shadow-md font-extrabold'
                              : 'bg-obsidian/70 text-muted hover:text-warm-white border-graphite-border hover:border-graphite-subtle'
                          }`}
                        >
                          {opt.make}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Model & Year Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="action-hub-model" className="text-[11px] uppercase tracking-wider text-muted font-mono block">
                        Series / Model
                      </label>
                      <select
                        id="action-hub-model"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full bg-obsidian border border-graphite-border rounded-xs px-4 py-3 text-sm text-warm-white focus:outline-none focus:border-accent-gold tracking-wide min-h-[48px]"
                      >
                        {activeOption.models.map((m) => (
                          <option key={m} value={m} className="bg-graphite text-warm-white">{m}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="action-hub-year" className="text-[11px] uppercase tracking-wider text-muted font-mono block">
                        Production Year
                      </label>
                      <select
                        id="action-hub-year"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="w-full bg-obsidian border border-graphite-border rounded-xs px-4 py-3 text-sm text-warm-white focus:outline-none focus:border-accent-gold tracking-wide min-h-[48px] tabular-numbers"
                      >
                        {activeOption.years.map((y) => (
                          <option key={y} value={y} className="bg-graphite text-warm-white">{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. SERVICE SELECTION */}
                <div className="space-y-4 pb-6 border-b border-graphite-border/70">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-warm-white font-bold flex items-center gap-2">
                      <span className="text-accent-gold font-mono">02</span>
                      <span>SERVICE REQUIREMENT</span>
                    </span>
                    <span className="text-[10px] font-mono text-muted-dark uppercase tracking-widest">
                      Select Scope Discipline
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {APPROVED_SERVICES.map((srv) => {
                      const isSelected = selectedService === srv.slug;
                      return (
                        <button
                          key={srv.slug}
                          type="button"
                          onClick={() => handleServiceChange(srv.slug)}
                          className={`p-3 text-left rounded-xs border transition-all flex flex-col justify-between min-h-[60px] cursor-pointer ${
                            isSelected
                              ? 'bg-accent-gold text-obsidian border-accent-gold shadow-md'
                              : 'bg-obsidian/70 text-muted hover:text-warm-white border-graphite-border hover:border-graphite-subtle'
                          }`}
                        >
                          <span className={`text-xs font-bold uppercase tracking-tight block ${isSelected ? 'text-obsidian font-extrabold' : 'text-warm-white'}`}>
                            {srv.name}
                          </span>
                          <span className={`text-[10px] font-mono leading-tight mt-1 truncate ${isSelected ? 'text-obsidian/80' : 'text-muted-dark'}`}>
                            {srv.short_description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. VEHICLE / SERVICE CONCERN */}
                <div className="space-y-2 pb-6 border-b border-graphite-border/70">
                  <label htmlFor="action-hub-concern" className="text-xs uppercase tracking-widest text-warm-white font-bold flex items-center gap-2">
                    <span className="text-accent-gold font-mono">03</span>
                    <span>SYMPTOMS OR SPECIFIC REQUIREMENTS (OPTIONAL)</span>
                  </label>
                  <textarea
                    id="action-hub-concern"
                    rows={2}
                    value={concern}
                    onChange={(e) => setConcern(e.target.value)}
                    placeholder="e.g. Unusual brake squeal under load, check engine warning on cold start, 40,000 km periodic inspection due..."
                    className="w-full bg-obsidian border border-graphite-border rounded-xs p-3.5 text-xs sm:text-sm text-warm-white placeholder:text-muted-dark focus:outline-none focus:border-accent-gold resize-y"
                  />
                </div>

                {/* 4. CUSTOMER DETAILS */}
                <div className="space-y-4">
                  <span className="text-xs uppercase tracking-widest text-warm-white font-bold flex items-center gap-2">
                    <span className="text-accent-gold font-mono">04</span>
                    <span>YOUR CONTACT DETAILS</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="action-hub-name" className="text-[11px] uppercase tracking-wider text-muted font-mono block">
                        Full Name *
                      </label>
                      <input
                        id="action-hub-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Mehta"
                        className={`w-full bg-obsidian border rounded-xs px-4 py-3 text-sm text-warm-white focus:outline-none min-h-[48px] ${
                          errors.name ? 'border-red-500 focus:border-red-500' : 'border-graphite-border focus:border-accent-gold'
                        }`}
                      />
                      {errors.name && <span className="text-[11px] text-red-400 block">{errors.name}</span>}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="action-hub-phone" className="text-[11px] uppercase tracking-wider text-muted font-mono block">
                        Phone Number *
                      </label>
                      <input
                        id="action-hub-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 98200 12345"
                        className={`w-full bg-obsidian border rounded-xs px-4 py-3 text-sm text-warm-white focus:outline-none min-h-[48px] ${
                          errors.phone ? 'border-red-500 focus:border-red-500' : 'border-graphite-border focus:border-accent-gold'
                        }`}
                      />
                      {errors.phone && <span className="text-[11px] text-red-400 block">{errors.phone}</span>}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="action-hub-email" className="text-[11px] uppercase tracking-wider text-muted font-mono block">
                        Email Address (Optional)
                      </label>
                      <input
                        id="action-hub-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. r.mehta@example.com"
                        className="w-full bg-obsidian border border-graphite-border rounded-xs px-4 py-3 text-sm text-warm-white focus:outline-none focus:border-accent-gold min-h-[48px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="action-hub-date" className="text-[11px] uppercase tracking-wider text-muted font-mono block">
                        Preferred Date (Optional)
                      </label>
                      <input
                        id="action-hub-date"
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full bg-obsidian border border-graphite-border rounded-xs px-4 py-3 text-sm text-warm-white focus:outline-none focus:border-accent-gold min-h-[48px]"
                      />
                    </div>
                  </div>

                  {/* Preferred contact channel */}
                  <div className="space-y-2 pt-2">
                    <label className="text-[11px] uppercase tracking-wider text-muted font-mono block">
                      Preferred Contact Channel
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(['PHONE', 'WHATSAPP', 'EMAIL'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPreferredContact(method)}
                          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-xs border transition-colors ${
                            preferredContact === method
                              ? 'bg-accent-gold/20 text-accent-gold border-accent-gold font-bold'
                              : 'bg-obsidian border-graphite-border text-muted hover:text-warm-white'
                          }`}
                        >
                          {method === 'PHONE' ? 'Voice Call' : method === 'WHATSAPP' ? 'WhatsApp' : 'Email'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. PRIMARY ACTION */}
                <div className="pt-6 space-y-4">
                  <button
                    type="submit"
                    id="btn-action-hub-request-service"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-3 py-4 px-8 bg-warm-white hover:bg-white text-obsidian font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xs transition-all shadow-xl active:scale-[0.99] min-h-[52px] cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-gold"
                  >
                    <Wrench className="w-4 h-4 text-obsidian shrink-0" />
                    <span>{isSubmitting ? 'TRANSMITTING REQUEST...' : 'REQUEST SERVICE'}</span>
                    <span className="text-accent-gold">→</span>
                  </button>

                  {/* Secondary Conversions / Alternatives */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-muted-dark font-mono text-[11px]">
                      <span>Zero obligation</span>
                      <span>·</span>
                      <span>Itemized inspection estimate</span>
                      <span>·</span>
                      <span>Dedicated service advisor</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {onViewServiceStatus && (
                        <button
                          type="button"
                          id="action-hub-btn-check-status"
                          onClick={onViewServiceStatus}
                          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-accent-gold font-mono uppercase tracking-wider transition-colors cursor-pointer py-1"
                        >
                          <Search className="w-3.5 h-3.5" />
                          <span>CHECK SERVICE STATUS</span>
                        </button>
                      )}
                      {onContactWorkshop && (
                        <button
                          type="button"
                          id="action-hub-btn-talk-experts"
                          onClick={onContactWorkshop}
                          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-accent-gold font-mono uppercase tracking-wider transition-colors cursor-pointer py-1"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>TALK TO TORQUE EXPERTS</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
