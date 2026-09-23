import React from 'react';
import { MapPin, Phone, Clock, Shield } from 'lucide-react';
import { Container } from './SectionHeader';

export interface FooterProps {
  onNavigateSection?: (href: string) => void;
  onNavigatePage?: (page: 'services' | 'book' | 'faqs' | 'contact' | 'status' | 'dashboard') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateSection, onNavigatePage }) => {
  return (
    <footer className="bg-obsidian border-t border-graphite-border pt-16 pb-24 text-muted text-xs">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & Technical Positioning */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-warm-white">
                TORQUE EXPERT’S
              </span>
              <span className="text-[10px] uppercase tracking-eyebrow text-accent-gold font-semibold">
                German & Luxury Specialists
              </span>
            </div>
            <p className="text-muted leading-relaxed">
              Precision diagnostic and mechanical engineering workshop tailored specifically to German automotive platforms: BMW, Mercedes-Benz, Audi, Porsche, Volvo, and Land Rover.
            </p>
            <div className="pt-2 flex items-center gap-2 text-muted-dark">
              <Shield className="w-3.5 h-3.5 text-accent-gold" />
              <span>OEM-aligned service protocols</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-warm-white">
              Service Modules
            </h4>
            <ul className="space-y-2 text-muted">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage ? onNavigatePage('services') : (onNavigateSection && onNavigateSection('#services'))}
                  className="hover:text-warm-white transition-colors text-left"
                >
                  Periodic Maintenance
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage ? onNavigatePage('services') : (onNavigateSection && onNavigateSection('#services'))}
                  className="hover:text-warm-white transition-colors text-left"
                >
                  Computer Diagnostics
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage ? onNavigatePage('services') : (onNavigateSection && onNavigateSection('#services'))}
                  className="hover:text-warm-white transition-colors text-left"
                >
                  Mechanical & Suspension Repairs
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage ? onNavigatePage('services') : (onNavigateSection && onNavigateSection('#services'))}
                  className="hover:text-warm-white transition-colors text-left"
                >
                  Electrical System Audit
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage ? onNavigatePage('services') : (onNavigateSection && onNavigateSection('#services'))}
                  className="hover:text-warm-white transition-colors text-left"
                >
                  Thermal & AC Conditioning
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage ? onNavigatePage('services') : (onNavigateSection && onNavigateSection('#services'))}
                  className="hover:text-warm-white transition-colors text-left"
                >
                  Paint Correction & Detailing
                </button>
              </li>
            </ul>
          </div>

          {/* Workshop Details & Staff Entry */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-warm-white">
              Workshop Facility
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
                <span>Madhapur Industrial Corridor, HITEC City Zone, Hyderabad, Telangana</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-accent-gold shrink-0" />
                <span>Monday – Saturday: 9:00 AM – 7:00 PM</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-accent-gold shrink-0" />
                <span>+91 90000 00000 (Appointment Desk)</span>
              </div>
            </div>

            {/* Discreet Staff Entry Point */}
            <div className="pt-3 border-t border-graphite-border/60">
              <a
                href="/dashboard"
                onClick={(e) => {
                  if (onNavigatePage) {
                    e.preventDefault();
                    window.history.pushState({}, '', '/dashboard');
                    onNavigatePage('dashboard');
                  }
                }}
                aria-label="Staff Access — Workshop OS"
                className="inline-flex items-center gap-1.5 text-[11px] font-mono tracking-wider uppercase text-muted hover:text-accent-gold transition-colors duration-150 py-2 min-h-[44px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-gold rounded-xs"
              >
                <span>Staff Access</span>
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </a>
            </div>
          </div>

          {/* Governance & Token Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-warm-white">
              Customer Verification
            </h4>
            <p className="leading-relaxed">
              Have an active digital quotation or service status token?
            </p>
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => onNavigatePage && onNavigatePage('status')}
                className="inline-block text-accent-gold hover:underline font-medium text-xs text-left"
              >
                Track Service Status by Token →
              </button>
              <div className="block text-[11px] text-muted-dark">
                Torque Expert's Platform V2.0 · Synthetic demonstration records.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Colophon */}
        <div className="pt-8 border-t border-graphite-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-dark">
          <p>© {new Date().getFullYear()} Torque Expert’s Workshop. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Service Terms</span>
            <span>Anti-Fabrication Notice</span>
          </div>
        </div>
      </Container>
    </footer>
  );
};
