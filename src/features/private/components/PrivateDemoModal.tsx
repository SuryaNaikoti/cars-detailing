import React, { useState } from 'react';
import { X, CheckCircle2, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input, Select } from '../../../components/ui/Input';
import { saveLead } from '../../../lib/demoStore';
import type { Lead } from '../../../types';

export interface PrivateDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialInterest?: string;
}

export const PrivateDemoModal: React.FC<PrivateDemoModalProps> = ({
  isOpen,
  onClose,
  initialInterest = 'Workshop OS — Full Platform Walkthrough',
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [workshopName, setWorkshopName] = useState('');
  const [city, setCity] = useState('');
  const [workshopType, setWorkshopType] = useState('Independent Luxury / Specialist');
  const [bayCount, setBayCount] = useState('3–6 Bays');
  const [preferredSlot, setPreferredSlot] = useState('Weekday Morning (10:00 AM – 1:00 PM)');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Please enter your full name';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Valid phone number is required (min 10 digits)';
    }
    if (!workshopName.trim()) errs.workshopName = 'Please enter your workshop / garage name';
    if (!city.trim()) errs.city = 'Please enter your city';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Create a high-priority commercial demo lead record in the local store
      const newLead: Lead = {
        id: `lead-demo-${Date.now()}`,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        vehicle_summary: `${workshopName.trim()} (${workshopType}, ${bayCount})`,
        vehicle_make: workshopType,
        vehicle_model: workshopName.trim(),
        vehicle_year: new Date().getFullYear(),
        registration: city.trim().toUpperCase(),
        service_requested: `Commercial Demo: ${initialInterest}`,
        service_name: 'Commercial Demo Walkthrough',
        message: `Preferred Slot: ${preferredSlot}. Notes: ${notes.trim() || 'None'}`,
        notes: `City: ${city.trim()} | Bays: ${bayCount} | Preferred Slot: ${preferredSlot} | Notes: ${notes.trim() || 'None'}`,
        priority: 'HIGH',
        assigned_advisor: 'Solutions Director',
        next_action: `Schedule 30-min walkthrough with ${name.trim()} (${phone.trim()})`,
        source: 'Other',
        status: 'NEW',
        created_at: new Date().toISOString(),
        timeline: [
          {
            id: `tl-${Date.now()}`,
            timestamp: new Date().toISOString(),
            event: 'DEMO_REQUESTED',
            notes: `Private demo requested by workshop owner (${workshopName.trim()}, ${city.trim()}). Preferred slot: ${preferredSlot}.`,
            actor: 'System (Private Sales Portal)',
          },
        ],
      };

      saveLead(newLead);
      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const whatsappMessage = `Hello, I'd like to book a private 30-minute demonstration of Workshop OS for my garage.\n\nName: ${name || '[Your Name]'}\nWorkshop: ${workshopName || '[Your Workshop]'}\nCity: ${city || '[City]'}\nBays: ${bayCount}\nPreferred Slot: ${preferredSlot}`;

  const directWhatsAppUrl = `https://wa.me/919000000000?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-obsidian/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="w-full max-w-xl bg-graphite-card border border-graphite-border rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-graphite-border bg-obsidian/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent-gold font-semibold">
                Direct Consultation
              </span>
            </div>
            <h3 id="modal-title" className="text-lg sm:text-xl font-bold tracking-tight text-warm-white mt-1">
              Book a Private Workshop OS Demo
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted hover:text-warm-white rounded-sm hover:bg-graphite transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {isSubmitted ? (
            <div className="text-center py-8 space-y-5">
              <div className="w-12 h-12 bg-accent-gold/15 text-accent-gold border border-accent-gold/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold tracking-tight text-warm-white">
                  Demo Request Confirmed
                </h4>
                <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-warm-white">{name}</strong>. We have logged your demonstration request for <strong className="text-warm-white">{workshopName}</strong> ({city}).
                </p>
                <p className="text-xs text-muted-dark max-w-sm mx-auto leading-relaxed pt-2">
                  Our solutions director will connect with you on <span className="text-accent-gold font-mono">{phone}</span> to confirm your preferred 30-minute walkthrough.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-accent-gold hover:bg-accent-goldHover text-obsidian text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Immediate WhatsApp Note</span>
                </a>
                <Button variant="secondary" size="md" onClick={onClose} className="w-full sm:w-auto text-xs uppercase tracking-wider">
                  Close Window
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xs bg-graphite/50 border border-graphite-border text-xs text-muted leading-relaxed">
                <p>
                  <strong className="text-warm-white font-semibold">30-minute tailored walkthrough:</strong> We will configure a live preview around your actual bay capacity, repair disciplines, and team structure.
                </p>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Name *"
                  placeholder="e.g. Rajesh Verma"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  error={errors.name}
                />
                <Input
                  label="Direct Phone / WhatsApp *"
                  placeholder="+91 98765 43210"
                  type="tel"
                  value={phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                  error={errors.phone}
                />
              </div>

              {/* Workshop Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Workshop / Garage Name *"
                  placeholder="e.g. Apex Autocare"
                  value={workshopName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWorkshopName(e.target.value)}
                  error={errors.workshopName}
                />
                <Input
                  label="City / Location *"
                  placeholder="e.g. Hyderabad, Bengaluru, Mumbai"
                  value={city}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
                  error={errors.city}
                />
              </div>

              {/* Operational Profile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Workshop Type"
                  value={workshopType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setWorkshopType(e.target.value)}
                >
                  <option value="Independent Luxury / Specialist">Independent Luxury / Specialist</option>
                  <option value="Multi-Brand Service Centre">Multi-Brand Service Centre</option>
                  <option value="Performance & Tuning Garage">Performance & Tuning Garage</option>
                  <option value="Body Shop & Detailing Studio">Body Shop & Detailing Studio</option>
                  <option value="Multi-Location Workshop Group">Multi-Location Workshop Group</option>
                </Select>

                <Select
                  label="Active Bay Capacity"
                  value={bayCount}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBayCount(e.target.value)}
                >
                  <option value="1–2 Bays">1–2 Bays (Boutique Garage)</option>
                  <option value="3–6 Bays">3–6 Bays (Standard Workshop)</option>
                  <option value="7–12 Bays">7–12 Bays (High-Volume Facility)</option>
                  <option value="12+ Bays">12+ Bays (Multi-Bay Hub)</option>
                </Select>
              </div>

              <Select
                label="Preferred Walkthrough Time"
                value={preferredSlot}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPreferredSlot(e.target.value)}
              >
                <option value="Weekday Morning (10:00 AM – 1:00 PM)">Weekday Morning (10:00 AM – 1:00 PM)</option>
                <option value="Weekday Afternoon (2:00 PM – 5:00 PM)">Weekday Afternoon (2:00 PM – 5:00 PM)</option>
                <option value="Weekday Evening (5:00 PM – 8:00 PM)">Weekday Evening (5:00 PM – 8:00 PM)</option>
                <option value="Saturday Morning (10:00 AM – 2:00 PM)">Saturday Morning (10:00 AM – 2:00 PM)</option>
              </Select>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-light">
                  Specific Operational Bottleneck or Questions (Optional)
                </label>
                <textarea
                  rows={2}
                  className="w-full bg-graphite border border-graphite-border rounded-sm px-3.5 py-2.5 text-sm text-warm-white placeholder:text-muted-dark focus:border-accent-gold/80 focus:ring-1 focus:ring-accent-gold/40 focus:outline-none resize-none transition-colors"
                  placeholder="e.g. Estimates taking too long, tracking technician assignments, WhatsApp chaos..."
                  value={notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                />
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-graphite-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={onClose}
                  className="w-full sm:w-auto text-xs uppercase tracking-wider"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="md"
                  isLoading={isSubmitting}
                  className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider gap-2 min-h-[44px]"
                >
                  <span>Confirm Walkthrough Request</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
