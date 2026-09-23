import React, { useState } from 'react';
import { Container } from '../../components/layout/SectionHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { CURATED_VEHICLE_OPTIONS, APPROVED_SERVICES } from '../../data/demoData';
import { CheckCircle2, MessageSquare, ShieldAlert, ArrowLeft } from 'lucide-react';
import { generateWhatsAppLink } from '../../lib/utils';
import { saveAppointment } from '../../lib/demoStore';
import type { Booking } from '../../types';

export interface BookServicePageProps {
  onBackToHome?: () => void;
  preselectedServiceSlug?: string | null;
}

export const BookServicePage: React.FC<BookServicePageProps> = ({ onBackToHome, preselectedServiceSlug }) => {
  const [make, setMake] = useState(CURATED_VEHICLE_OPTIONS[0].make);
  const [model, setModel] = useState(CURATED_VEHICLE_OPTIONS[0].models[0]);
  const [year, setYear] = useState(CURATED_VEHICLE_OPTIONS[0].years[0]);
  const [service, setService] = useState(preselectedServiceSlug || APPROVED_SERVICES[0].slug);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeOption = CURATED_VEHICLE_OPTIONS.find((v) => v.make === make) || CURATED_VEHICLE_OPTIONS[0];

  const handleMakeChange = (newMake: string) => {
    setMake(newMake);
    const opt = CURATED_VEHICLE_OPTIONS.find((v) => v.make === newMake);
    if (opt) {
      setModel(opt.models[0]);
      setYear(opt.years[0]);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!phone.trim() || phone.length < 10) errs.phone = 'Valid phone number is required';
    if (!date) errs.date = 'Please select a preferred visit date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const newBooking: Booking = {
      id: 'apt-' + Date.now(),
      customer_name: name,
      customer_phone: phone,
      vehicle_summary: `${year} ${make} ${model}`,
      vehicle_make: make,
      vehicle_model: model,
      vehicle_year: Number(year),
      service_name: APPROVED_SERVICES.find((s) => s.slug === service)?.name || service,
      requested_date: date,
      requested_time: time,
      status: 'REQUESTED',
      advisor: 'Rohan Deshmukh',
      notes: notes || undefined,
      created_at: new Date().toISOString(),
    };

    saveAppointment(newBooking);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const selectedServiceObj = APPROVED_SERVICES.find((s) => s.slug === service);

  return (
    <div className="py-20 sm:py-28 bg-obsidian text-warm-white">
      <Container className="max-w-3xl">
        
        {/* Optional Back button */}
        {onBackToHome && (
          <div className="mb-6">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent-gold transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-12 pb-6 border-b border-graphite-border space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-6 h-[1px] bg-accent-gold" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-gold">
              Appointment Preference
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tightest uppercase">
            Schedule Workshop Visit
          </h1>
          <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
            Submit your arrival preference. Appointments are verified requests—our service advisor in Madhapur will confirm bay capacity and arrival timing.
          </p>
        </div>

        {!isSubmitted ? (
          <div className="p-6 sm:p-10 rounded-xs bg-graphite/50 border border-graphite-border shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* STEP 1: YOUR VEHICLE */}
              <div className="space-y-4 pb-8 border-b border-graphite-border/70">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-accent-gold">
                    STEP 1
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-warm-white">
                    · YOUR VEHICLE
                  </span>
                </div>

                {/* Make Selector: Dropdown on mobile, buttons on tablet/desktop */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-light block">
                    Make *
                  </label>
                  <div className="sm:hidden">
                    <select
                      value={make}
                      onChange={(e) => handleMakeChange(e.target.value)}
                      className="w-full bg-obsidian border border-graphite-border rounded-xs px-4 py-3.5 text-sm font-semibold text-warm-white focus:outline-none focus:border-accent-gold min-h-[48px]"
                    >
                      {CURATED_VEHICLE_OPTIONS.map((opt) => (
                        <option key={opt.make} value={opt.make} className="bg-graphite text-warm-white">
                          {opt.make}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="hidden sm:grid grid-cols-3 lg:grid-cols-6 gap-2">
                    {CURATED_VEHICLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.make}
                        type="button"
                        onClick={() => handleMakeChange(opt.make)}
                        className={`py-3 px-2 text-xs font-bold uppercase tracking-wider rounded-xs border transition-all text-center min-h-[44px] ${
                          make === opt.make
                            ? 'bg-warm-white text-obsidian border-warm-white font-extrabold'
                            : 'bg-obsidian/70 text-muted hover:text-warm-white border-graphite-border'
                        }`}
                      >
                        {opt.make}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model & Year: Stacked on mobile (< 640px), 2 columns on tablet/desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-light">
                      Model / Series *
                    </label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full bg-obsidian border border-graphite-border rounded-xs px-4 py-3 text-sm text-warm-white focus:outline-none focus:border-accent-gold min-h-[48px]"
                    >
                      {activeOption.models.map((m) => (
                        <option key={m} value={m} className="bg-graphite text-warm-white">{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-light">
                      Production Year *
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full bg-obsidian border border-graphite-border rounded-xs px-4 py-3 text-sm text-warm-white focus:outline-none focus:border-accent-gold min-h-[48px] tabular-numbers"
                    >
                      {activeOption.years.map((y) => (
                        <option key={y} value={y} className="bg-graphite text-warm-white">{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* STEP 2: SERVICE */}
              <div className="space-y-3 pb-8 border-b border-graphite-border/70">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-accent-gold">
                    STEP 2
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-warm-white">
                    · REQUIRED SERVICE
                  </span>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-light">
                    Required Service Discipline *
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full bg-obsidian border border-graphite-border rounded-xs px-4 py-3 text-sm text-warm-white focus:outline-none focus:border-accent-gold min-h-[48px]"
                  >
                    {APPROVED_SERVICES.map((s) => (
                      <option key={s.slug} value={s.slug} className="bg-graphite text-warm-white">{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* STEP 3: VISIT PREFERENCE */}
              <div className="space-y-3 pb-8 border-b border-graphite-border/70">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-accent-gold">
                    STEP 3
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-warm-white">
                    · VISIT PREFERENCE
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Preferred Date *"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    error={errors.date}
                    className="min-h-[48px] py-3 text-sm"
                    hint="Target arrival day"
                  />
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-light mb-1.5">
                      Arrival Window *
                    </label>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-obsidian border border-graphite-border rounded-xs px-4 py-3 text-sm text-warm-white focus:outline-none focus:border-accent-gold min-h-[48px]"
                    >
                      <option value="09:30" className="bg-graphite text-warm-white">Morning (09:30 AM – 11:30 AM)</option>
                      <option value="12:00" className="bg-graphite text-warm-white">Midday (12:00 PM – 02:00 PM)</option>
                      <option value="15:00" className="bg-graphite text-warm-white">Afternoon (03:00 PM – 05:00 PM)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* STEP 4: YOUR DETAILS */}
              <div className="space-y-3 pb-8 border-b border-graphite-border/70">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-accent-gold">
                    STEP 4
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-warm-white">
                    · YOUR DETAILS
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    placeholder="e.g. Vikramaditya Rao"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                    className="min-h-[48px] py-3 text-sm"
                  />
                  <Input
                    label="Phone Number *"
                    placeholder="e.g. +91 98765 43210"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={errors.phone}
                    className="min-h-[48px] py-3 text-sm"
                  />
                </div>
              </div>

              {/* STEP 5: ADDITIONAL INFORMATION */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-accent-gold">
                    STEP 5
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-warm-white">
                    · ADDITIONAL INFORMATION
                  </span>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-light">
                    Symptoms / Mechanical Concerns (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe warning lights, fluid observations, or scheduled service requirements..."
                    className="w-full bg-obsidian border border-graphite-border rounded-xs p-3.5 text-sm text-warm-white placeholder:text-muted-dark focus:outline-none focus:border-accent-gold font-light"
                  />
                </div>
              </div>

              {/* Subordinate Intake Notice */}
              <div className="p-3.5 rounded-xs bg-obsidian/60 border border-graphite-border flex items-start gap-2.5 text-xs text-muted-dark font-light">
                <ShieldAlert className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
                <span>
                  <strong>Request Only:</strong> Booking submission records your arrival preference in our workshop queue. Our service desk will telephone to confirm workshop bay allocation and timing.
                </span>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <Button
                  variant="gold"
                  size="lg"
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full font-bold text-xs sm:text-sm uppercase tracking-wider py-4 min-h-[48px]"
                >
                  Submit Booking Request
                </Button>
              </div>

            </form>
          </div>
        ) : (
          /* Confirmation State */
          <div className="p-8 sm:p-14 text-center space-y-6 rounded-xs bg-graphite/50 border border-graphite-border">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent-gold block">
                Booking Reference Stored
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-warm-white">
                Request Received
              </h2>
              <p className="text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed font-light">
                Your preferred booking for <strong>{year} {make} {model}</strong> ({selectedServiceObj?.name}) on <strong className="text-warm-white">{date} ({time})</strong> has been registered in the workshop desk queue.
              </p>
            </div>

            <div className="p-4 rounded-xs bg-obsidian border border-graphite-border text-xs text-muted max-w-md mx-auto text-left space-y-1 font-light">
              <span className="font-bold text-warm-white block uppercase text-[10px]">What Happens Next:</span>
              <p>• Our front desk will telephone <strong className="text-warm-white">{phone}</strong> within working hours to verify specific requirements.</p>
              <p>• Necessary OEM diagnostic tooling and bay capacity will be assigned.</p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={generateWhatsAppLink({
                  make,
                  model,
                  year,
                  service: selectedServiceObj?.name,
                  preferredDate: `${date} at ${time}`,
                  customerName: name,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="outline" size="md" className="w-full sm:w-auto text-xs gap-1.5 uppercase tracking-wider">
                  <MessageSquare className="w-3.5 h-3.5 text-accent-gold" />
                  Speed Up on WhatsApp
                </Button>
              </a>

              <Button
                variant="primary"
                size="md"
                onClick={() => setIsSubmitted(false)}
                className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider"
              >
                Submit Another Request
              </Button>
            </div>
          </div>
        )}

      </Container>
    </div>
  );
};
