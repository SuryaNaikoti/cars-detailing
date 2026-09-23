import React, { useState } from 'react';
import { X, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { APPROVED_SERVICES, CURATED_VEHICLE_OPTIONS } from '../../data/demoData';
import { generateWhatsAppLink } from '../../lib/utils';
import { saveLead } from '../../lib/demoStore';
import type { Lead } from '../../types';

export interface SmartEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicle?: { make: string; model: string; year: number } | null;
  initialServiceSlug?: string | null;
}

export const SmartEnquiryModal: React.FC<SmartEnquiryModalProps> = ({
  isOpen,
  onClose,
  initialVehicle,
  initialServiceSlug,
}) => {
  const [make, setMake] = useState(initialVehicle?.make || CURATED_VEHICLE_OPTIONS[0].make);
  const [model, setModel] = useState(initialVehicle?.model || CURATED_VEHICLE_OPTIONS[0].models[0]);
  const [year, setYear] = useState(initialVehicle?.year || CURATED_VEHICLE_OPTIONS[0].years[0]);
  const [service, setService] = useState(initialServiceSlug || APPROVED_SERVICES[0].slug);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [issue, setIssue] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Synchronize state when modal is opened with new vehicle or service context
  React.useEffect(() => {
    if (isOpen) {
      if (initialVehicle) {
        setMake(initialVehicle.make);
        setModel(initialVehicle.model);
        setYear(initialVehicle.year);
      }
      if (initialServiceSlug) {
        setService(initialServiceSlug);
      }
      setIsSubmitted(false);
      setErrors({});
    }
  }, [isOpen, initialVehicle, initialServiceSlug]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Please enter your full name';
    if (!phone.trim() || phone.length < 10) errs.phone = 'Valid phone number is required (min 10 digits)';
    if (!issue.trim()) errs.issue = 'Please describe your vehicle symptom or requirement';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Save canonically into the shared Workshop OS demoStore
    const newLead: Lead = {
      id: 'lead-' + Date.now(),
      created_at: new Date().toISOString(),
      customer_name: name,
      customer_phone: phone,
      vehicle_make: make,
      vehicle_model: model,
      vehicle_year: Number(year),
      service_name: APPROVED_SERVICES.find((s) => s.slug === service)?.name || service,
      issue,
      preferred_date: preferredDate || undefined,
      source: 'Website',
      status: 'NEW',
      priority: 'HIGH',
      assigned_advisor: 'Rohan Deshmukh',
      next_action: 'Initial contact and vehicle diagnosis review',
      vehicle_summary: `${year} ${make} ${model}`,
      service_requested: APPROVED_SERVICES.find((s) => s.slug === service)?.name || service,
      message: issue,
    };

    saveLead(newLead);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const selectedServiceObj = APPROVED_SERVICES.find((s) => s.slug === service);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-obsidian/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-graphite-card border border-graphite-subtle rounded-t-lg sm:rounded-md w-full max-w-xl max-h-[90vh] sm:max-h-[85vh] flex flex-col p-5 sm:p-8 my-0 sm:my-8 shadow-2xl animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted hover:text-warm-white rounded-xs focus-visible:ring-1 focus-visible:ring-accent-gold z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div className="overflow-y-auto pr-1">
            <div className="space-y-1 mb-5 pr-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent-gold block">
                Structured Service Inquiry
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-warm-white">
                Request Diagnostic or Workshop Appointment
              </h3>
              <p className="text-xs text-muted">
                Appointments are verified requests. Our service desk will contact you to confirm timing.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left safe-pb">
              
              {/* Vehicle Context */}
              <div className="p-3 rounded-sm bg-graphite border border-graphite-border grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-dark block mb-1">Make</label>
                  <select
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full bg-obsidian border border-graphite-border rounded-xs px-2 py-2 text-xs text-warm-white focus:outline-none min-h-[38px]"
                  >
                    {CURATED_VEHICLE_OPTIONS.map((o) => (
                      <option key={o.make} value={o.make}>{o.make}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-dark block mb-1">Model / Series</label>
                  <input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-obsidian border border-graphite-border rounded-xs px-2 py-2 text-xs text-warm-white focus:outline-none min-h-[38px]"
                    placeholder="e.g. 5 Series"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-dark block mb-1">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-obsidian border border-graphite-border rounded-xs px-2 py-2 text-xs text-warm-white focus:outline-none min-h-[38px]"
                  />
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-light block mb-1.5">
                  Target Service Category
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full bg-graphite border border-graphite-border rounded-sm px-3.5 py-2.5 text-xs text-warm-white focus:border-accent-gold focus:outline-none"
                >
                  {APPROVED_SERVICES.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Symptoms / Issue */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-light block">
                  Observed Symptoms / Requirements *
                </label>
                <textarea
                  rows={3}
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="e.g. Amber engine light illuminated; slight hesitation under load; scheduled 40,000 km periodic service."
                  className={`w-full bg-graphite border rounded-sm p-3 text-xs text-warm-white placeholder:text-muted-dark focus:outline-none ${
                    errors.issue ? 'border-red-500' : 'border-graphite-border focus:border-accent-gold'
                  }`}
                />
                {errors.issue && <p className="text-[11px] text-red-400 font-medium">{errors.issue}</p>}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Customer Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Mehta"
                  error={errors.name}
                />
                <Input
                  label="Contact Phone *"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  error={errors.phone}
                />
              </div>

              {/* Preferred Date Preference */}
              <div>
                <Input
                  label="Preferred Visit Date (Request Only)"
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  hint="Subject to workshop capacity. Not a live reservation."
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-graphite-border">
                <Button variant="ghost" size="md" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="gold"
                  size="md"
                  type="submit"
                  isLoading={isSubmitting}
                  className="font-bold text-xs"
                >
                  Submit Service Request
                </Button>
              </div>

            </form>
          </div>
        ) : (
          /* Confirmation Success State */
          <div className="text-center py-6 space-y-5">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-warm-white">
                Request Received Successfully
              </h3>
              <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
                Your service inquiry for the <strong>{year} {make} {model}</strong> ({selectedServiceObj?.name}) has been registered in our workshop queue.
              </p>
            </div>

            <div className="p-4 rounded-sm bg-graphite border border-graphite-border text-xs text-muted-light max-w-md mx-auto text-left space-y-1">
              <span className="text-[11px] font-bold text-accent-gold uppercase tracking-wider block">
                Next Steps:
              </span>
              <p>1. Our service advisor will call <strong className="text-warm-white">{phone}</strong> shortly to review symptoms.</p>
              <p>2. We will confirm part availability and arrange exact bay check-in timing.</p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={generateWhatsAppLink({
                  make,
                  model,
                  year,
                  service: selectedServiceObj?.name,
                  issue,
                  customerName: name,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="outline" size="md" className="w-full sm:w-auto text-xs gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-accent-gold" />
                  Speed Up on WhatsApp
                </Button>
              </a>

              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setIsSubmitted(false);
                  onClose();
                }}
                className="w-full sm:w-auto text-xs font-bold"
              >
                Done
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
