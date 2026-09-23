import React from 'react';
import { Container } from '../../components/layout/SectionHeader';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { generateWhatsAppLink } from '../../lib/utils';
import { Button } from '../../components/ui/Button';

export const ContactPage: React.FC = () => {
  return (
    <div className="py-20 sm:py-28 bg-obsidian text-warm-white">
      <Container>
        
        {/* Header */}
        <div className="mb-16 pb-8 border-b border-graphite-border space-y-4 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="w-6 h-[1px] bg-accent-gold" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-gold">
              Workshop Presence
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tightest uppercase">
            Facility & Direct Contact
          </h1>
          <p className="text-sm sm:text-base text-muted font-light leading-relaxed">
            Our Madhapur intake facility is equipped with dedicated low-clearance hydraulic lifts, dedicated diagnostic programming terminals, and dust-controlled clean bays.
          </p>
        </div>

        {/* 2-Column Composition on Desktop (lg:grid-cols-12), Ordered Single Column on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Information Column (Full width mobile, 5-col desktop) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Facility & Address */}
            <div className="space-y-2 border-b border-graphite-border pb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent-gold block font-semibold">
                LOCATION & INTAKE BAY
              </span>
              <h3 className="text-xl font-bold uppercase text-warm-white">
                Madhapur Specialist Hub
              </h3>
              <p className="text-sm text-muted leading-relaxed font-light">
                Plot 14, Madhapur Main Road, Near Cyber Towers Zone, Hyderabad, Telangana 500081
              </p>
              <div className="pt-2">
                <a
                  href="https://maps.google.com/?q=Madhapur+Hyderabad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-gold hover:underline"
                >
                  <span>Open in Google Maps</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* 2. Operating Hours */}
            <div className="space-y-2 border-b border-graphite-border pb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent-gold block font-semibold">
                OPERATING HOURS
              </span>
              <p className="text-sm text-warm-white font-medium">
                Monday – Saturday: 9:00 AM – 7:00 PM <br />
                <span className="text-muted text-xs font-light">Sunday: Closed for workshop maintenance & rig calibration</span>
              </p>
            </div>

            {/* 3. Direct Contact */}
            <div className="space-y-2 border-b border-graphite-border pb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent-gold block font-semibold">
                DIRECT CONTACT
              </span>
              <p className="text-sm text-warm-white font-medium">
                Desk: +91 90000 00000 <br />
                Advisory: advisor@torqueexperts.in
              </p>
            </div>

            {/* 4. WhatsApp CTA */}
            <div className="pt-1">
              <a
                href={generateWhatsAppLink({})}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-block"
              >
                <Button variant="gold" size="md" className="w-full text-xs sm:text-sm font-bold gap-2 uppercase tracking-wider min-h-[48px]">
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Service Desk</span>
                </Button>
              </a>
            </div>

          </div>

          {/* Media & Intake Protocol Column (Full width mobile, 7-col desktop) */}
          <div className="lg:col-span-7 space-y-4 pt-4 lg:pt-0">
            <div className="aspect-[16/10] overflow-hidden rounded-xs border border-graphite-border bg-graphite relative">
              <img
                src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1600&q=80"
                alt="Workshop intake and diagnostic bays"
                className="w-full h-full object-cover object-center filter brightness-[0.85] contrast-[1.1]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 px-3 py-1.5 rounded-xs bg-obsidian/90 border border-graphite-border text-[10px] uppercase font-mono tracking-widest text-warm-white backdrop-blur-sm">
                Clean Bay Protocol · Dedicated Low-Clearance Hoists
              </div>
            </div>

            <div className="p-4 rounded-xs bg-graphite/40 border border-graphite-border text-xs text-muted font-light leading-relaxed">
              <strong className="text-warm-white font-semibold">Intake Protocol:</strong> All vehicles undergo a walk-around inspection, odometer logging, and initial fault scan upon delivery before entry into the active bays.
            </div>
          </div>

        </div>

      </Container>
    </div>
  );
};
