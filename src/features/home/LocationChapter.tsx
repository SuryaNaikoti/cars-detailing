import React from 'react';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { generateWhatsAppLink } from '../../lib/utils';

export const LocationChapter: React.FC = () => {
  return (
    <section id="location" className="py-24 sm:py-32 bg-obsidian border-b border-graphite-border">
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Strong Workshop Facility Photography */}
          <div className="lg:col-span-7 relative group">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xs border border-graphite-border bg-graphite">
              <img
                src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1600&q=80"
                alt="Torque Expert’s German specialist workshop bays and diagnostic facility"
                className="w-full h-full object-cover object-center filter brightness-[0.8] contrast-[1.1] transition-transform duration-700 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 px-3 py-1.5 rounded-xs bg-obsidian/90 border border-graphite-border text-[10px] uppercase font-bold tracking-widest text-warm-white backdrop-blur-sm">
                Madhapur Engineering Bays · Low-Clearance Lifts
              </div>
            </div>
          </div>

          {/* Right Column: Concise Physical Workshop Information */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-6 h-[1px] bg-accent-gold" />
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-gold">
                  Workshop Presence
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tightest text-warm-white uppercase leading-tight">
                The Workshop
              </h2>
            </div>

            <div className="space-y-6 text-xs sm:text-sm">
              <div className="space-y-1.5 border-b border-graphite-border pb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-dark block">
                  Address
                </span>
                <p className="text-warm-white font-medium leading-relaxed">
                  Plot 14, Madhapur Main Road, Near Cyber Towers Zone, Hyderabad, Telangana 500081
                </p>
              </div>

              <div className="space-y-1.5 border-b border-graphite-border pb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-dark block">
                  Hours
                </span>
                <p className="text-warm-white font-medium">
                  Monday – Saturday: 9:00 AM – 7:00 PM <br />
                  <span className="text-muted text-xs">Sunday: Closed for maintenance & calibration</span>
                </p>
              </div>
            </div>

            {/* Action Buttons: Get Directions & WhatsApp */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href="https://maps.google.com/?q=Madhapur+Hyderabad"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-warm-white hover:bg-white text-obsidian text-xs font-bold uppercase tracking-wider rounded-xs transition-all text-center"
              >
                <span>Get Directions</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={generateWhatsAppLink({})}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-graphite hover:bg-graphite-subtle text-warm-white border border-graphite-border text-xs font-semibold tracking-wider uppercase rounded-xs transition-all text-center"
              >
                <MessageSquare className="w-4 h-4 text-accent-gold" />
                <span>WhatsApp Desk</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
