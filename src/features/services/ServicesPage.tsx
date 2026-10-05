import React, { useState } from 'react';
import { Container } from '../../components/layout/SectionHeader';
import { Button } from '../../components/ui/Button';
import { APPROVED_SERVICES } from '../../data/demoData';
import { ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { generateWhatsAppLink } from '../../lib/utils';
import type { ServiceItem } from '../../types';

export interface ServicesPageProps {
  onOpenBooking: (serviceSlug?: string) => void;
  onSelectServiceDetail?: (service: ServiceItem) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onOpenBooking, onSelectServiceDetail }) => {
  const [selectedDetail, setSelectedDetail] = useState<ServiceItem | null>(null);

  const servicesData: (ServiceItem & { image: string })[] = [
    {
      ...APPROVED_SERVICES[0],
      image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=80',
    },
    {
      ...APPROVED_SERVICES[1],
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    },
    {
      ...APPROVED_SERVICES[2],
      image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80',
    },
    {
      ...APPROVED_SERVICES[3],
      image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1200&q=80',
    },
    {
      ...APPROVED_SERVICES[4],
      image: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=1200&q=80',
    },
    {
      ...APPROVED_SERVICES[5],
      image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const handleOpenDetail = (service: ServiceItem) => {
    if (onSelectServiceDetail) {
      onSelectServiceDetail(service);
    } else {
      setSelectedDetail(service);
    }
  };

  return (
    <div className="py-20 sm:py-28 bg-obsidian text-warm-white">
      <Container>
        
        {/* Page Hero Header */}
        <div className="mb-20 pb-8 border-b border-graphite-border space-y-4 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="w-6 h-[1px] bg-accent-gold" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-gold">
              Specialist Disciplines
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tightest uppercase">
            Services & Engineering
          </h1>
          <p className="text-sm sm:text-base text-muted font-light leading-relaxed">
            Every mechanical, diagnostic, and aesthetic procedure follows manufacturer service guidelines using specialized diagnostic software and OEM-grade replacement components.
          </p>
        </div>

        {/* Editorial Services Alternating Story Layout */}
        <div className="space-y-24">
          {servicesData.map((service, idx) => {
            const isReversed = idx % 2 !== 0;

            return (
              <div
                key={service.id}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center ${
                  isReversed ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Visual Photography Column */}
                <div className={`lg:col-span-6 relative group ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div
                    onClick={() => handleOpenDetail(service)}
                    className="aspect-[16/10] overflow-hidden rounded-xs border border-graphite-border bg-graphite relative cursor-pointer"
                  >
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover object-center filter brightness-[0.8] contrast-[1.1] transition-transform duration-700 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-transparent" />
                    
                    <span className="absolute top-4 left-4 text-xs font-mono font-bold tracking-widest text-warm-white bg-obsidian/90 px-3 py-1 rounded-xs border border-graphite-border">
                      MODULE 0{service.display_order}
                    </span>

                    <span className="absolute bottom-4 right-4 text-xs font-bold uppercase tracking-wider text-warm-white/90 bg-obsidian/85 px-3 py-1.5 rounded-xs border border-graphite-border opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <span>View Specifications</span>
                      <ChevronRight className="w-3.5 h-3.5 text-accent-gold" />
                    </span>
                  </div>
                </div>

                {/* Content & Inclusions Column */}
                <div className={`lg:col-span-6 space-y-6 ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent-gold block font-semibold">
                      MARQUE-SPECIFIC STANDARD
                    </span>
                    <h2
                      onClick={() => handleOpenDetail(service)}
                      className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight uppercase text-warm-white hover:text-accent-gold cursor-pointer transition-colors"
                    >
                      {service.name}
                    </h2>
                    <p className="text-sm sm:text-base text-muted leading-relaxed font-light">
                      {service.description || service.short_description}
                    </p>
                  </div>

                  {/* Concise What's Included */}
                  {service.inclusions && (
                    <div className="space-y-2.5 pt-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-warm-white block">
                        WHAT'S INCLUDED
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-[13px] text-warm-white/90">
                        {service.inclusions.slice(0, 4).map((inc, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
                            <span>{inc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action CTAs */}
                  <div className="pt-4 border-t border-graphite-border flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Button
                      variant="gold"
                      size="md"
                      onClick={() => onOpenBooking(service.slug)}
                      className="text-xs sm:text-sm font-bold gap-2 uppercase tracking-wider min-h-[44px]"
                    >
                      <span>Inquire This Service</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>

                    <a
                      href={generateWhatsAppLink({ service: service.name })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <Button
                        variant="outline"
                        size="md"
                        className="w-full text-xs sm:text-sm uppercase tracking-wider border-graphite-border hover:border-warm-white/40 min-h-[44px]"
                      >
                        WhatsApp Consultation
                      </Button>
                    </a>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </Container>

      {/* In-place Service Detail Modal - Full mobile sheet on <640px */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-obsidian/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-graphite border border-graphite-border rounded-xs max-w-2xl w-full p-5 sm:p-8 space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-graphite-border gap-2">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-accent-gold uppercase tracking-widest block">
                  MODULE 0{selectedDetail.display_order} // SPECIFICATION
                </span>
                <h3 className="text-xl sm:text-2xl font-bold uppercase text-warm-white">
                  {selectedDetail.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="text-xs font-bold uppercase text-muted hover:text-warm-white px-2 py-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                Close ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              {selectedDetail.description || selectedDetail.short_description}
            </p>

            {selectedDetail.inclusions && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-warm-white block">
                  Mandatory Execution Inclusions:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-light">
                  {selectedDetail.inclusions.map((inc, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent-gold shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-graphite-border flex flex-col sm:flex-row justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDetail(null)}
                className="w-full sm:w-auto min-h-[44px]"
              >
                Back to Catalogue
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={() => {
                  const slug = selectedDetail.slug;
                  setSelectedDetail(null);
                  onOpenBooking(slug);
                }}
                className="w-full sm:w-auto font-bold text-xs uppercase min-h-[44px]"
              >
                Request Booking →
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
