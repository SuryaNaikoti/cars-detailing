import React, { useState } from 'react';
import { CURATED_VEHICLE_OPTIONS } from '../../data/demoData';

export interface VehicleConsultationProps {
  onStartEnquiryWithContext: (
    vehicle: { make: string; model: string; year: number },
    serviceSlug?: string
  ) => void;
  selectedServicePreselect?: string;
}

export const VehicleConsultationChapter: React.FC<VehicleConsultationProps> = ({
  onStartEnquiryWithContext,
  selectedServicePreselect,
}) => {
  const [selectedMake, setSelectedMake] = useState<string>(CURATED_VEHICLE_OPTIONS[0].make);
  const [selectedModel, setSelectedModel] = useState<string>(CURATED_VEHICLE_OPTIONS[0].models[0]);
  const [selectedYear, setSelectedYear] = useState<number>(CURATED_VEHICLE_OPTIONS[0].years[0]);
  const [selectedNeed, setSelectedNeed] = useState<string>(selectedServicePreselect || 'periodic-service');

  React.useEffect(() => {
    if (selectedServicePreselect) {
      setSelectedNeed(selectedServicePreselect);
    }
  }, [selectedServicePreselect]);

  const activeOption = CURATED_VEHICLE_OPTIONS.find((v) => v.make === selectedMake) || CURATED_VEHICLE_OPTIONS[0];

  const handleMakeChange = (make: string) => {
    setSelectedMake(make);
    const option = CURATED_VEHICLE_OPTIONS.find((v) => v.make === make);
    if (option) {
      setSelectedModel(option.models[0]);
      setSelectedYear(option.years[0]);
    }
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    onStartEnquiryWithContext(
      {
        make: selectedMake,
        model: selectedModel,
        year: selectedYear,
      },
      selectedNeed
    );
  };

  const serviceNeeds = [
    { label: 'Periodic Service', slug: 'periodic-service' },
    { label: 'Diagnostics', slug: 'computer-diagnostics' },
    { label: 'Mechanical Repair', slug: 'mechanical-repairs' },
    { label: 'Specialist Detailing', slug: 'precision-detailing' },
  ];

  return (
    <section id="vehicle-consultation" className="py-20 sm:py-28 lg:py-32 bg-obsidian border-b border-graphite-border">
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center space-y-3 mb-10 sm:mb-12">
            <div className="flex items-center justify-center gap-3">
              <span className="w-6 h-[1px] bg-accent-gold" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-gold">
                Vehicle Qualification
              </span>
              <span className="w-6 h-[1px] bg-accent-gold" />
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tightest text-warm-white uppercase">
              What do you drive?
            </h2>
            <p className="text-xs sm:text-base text-muted max-w-xl mx-auto font-light leading-relaxed">
              Select your vehicle make, series, and production year to configure a tailored service consultation with our workshop advisors.
            </p>
          </div>

          {/* High Prominence Editorial Consultation Form */}
          <form onSubmit={handleContinue} className="p-5 sm:p-8 lg:p-10 rounded-xs bg-graphite/60 border border-graphite-border shadow-2xl space-y-6 sm:space-y-8">
            
            {/* 1. Make selector: Desktop grid (>= 640px), Native Clean Select on Mobile */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label htmlFor="select-make" className="text-xs uppercase tracking-wider text-warm-white font-bold block">
                  MAKE
                </label>
                <span className="text-[10px] font-mono text-muted-dark uppercase tracking-widest">Select Marque</span>
              </div>

              {/* Mobile Dropdown View (< 640px) */}
              <div className="sm:hidden">
                <select
                  id="select-make"
                  value={selectedMake}
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

              {/* Desktop/Tablet Button Grid (>= 640px) */}
              <div className="hidden sm:grid grid-cols-3 lg:grid-cols-6 gap-2.5">
                {CURATED_VEHICLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.make}
                    type="button"
                    onClick={() => handleMakeChange(opt.make)}
                    className={`py-3.5 px-3 text-xs font-bold uppercase tracking-wider rounded-xs border transition-all text-center min-h-[48px] ${
                      selectedMake === opt.make
                        ? 'bg-warm-white text-obsidian border-warm-white shadow-lg font-extrabold'
                        : 'bg-obsidian/70 text-muted hover:text-warm-white border-graphite-border hover:border-graphite-subtle'
                    }`}
                  >
                    {opt.make}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Model and Year Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-2">
                <label htmlFor="select-model" className="text-xs uppercase tracking-wider text-warm-white font-bold block">
                  MODEL
                </label>
                <select
                  id="select-model"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-obsidian border border-graphite-border rounded-xs px-4 py-3.5 text-sm text-warm-white focus:outline-none focus:border-accent-gold tracking-wide min-h-[48px]"
                >
                  {activeOption.models.map((m) => (
                    <option key={m} value={m} className="bg-graphite text-warm-white">{m}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="select-year" className="text-xs uppercase tracking-wider text-warm-white font-bold block">
                  YEAR
                </label>
                <select
                  id="select-year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full bg-obsidian border border-graphite-border rounded-xs px-4 py-3.5 text-sm text-warm-white focus:outline-none focus:border-accent-gold tracking-wide min-h-[48px] tabular-numbers"
                >
                  {activeOption.years.map((y) => (
                    <option key={y} value={y} className="bg-graphite text-warm-white">{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Requirement Selection: WHAT DOES YOUR VEHICLE NEED? */}
            <div className="space-y-2.5 pt-2">
              <label className="text-xs uppercase tracking-wider text-warm-white font-bold block">
                WHAT DOES YOUR VEHICLE NEED?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {serviceNeeds.map((need) => (
                  <button
                    key={need.slug}
                    type="button"
                    onClick={() => setSelectedNeed(need.slug)}
                    className={`p-3.5 text-xs font-bold uppercase tracking-wider rounded-xs border transition-all text-center min-h-[48px] flex items-center justify-center ${
                      selectedNeed === need.slug
                        ? 'bg-accent-gold text-obsidian border-accent-gold shadow-md font-extrabold'
                        : 'bg-obsidian/70 text-muted hover:text-warm-white border-graphite-border hover:border-graphite-subtle'
                    }`}
                  >
                    {need.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Action Button with clear primary hierarchy */}
            <div className="pt-4">
              <button
                type="submit"
                id="btn-check-service-options"
                className="w-full inline-flex items-center justify-center gap-3 py-4 px-8 bg-warm-white hover:bg-white text-obsidian font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xs transition-all shadow-xl active:scale-[0.99] min-h-[48px] focus-visible:ring-2 focus-visible:ring-accent-gold"
              >
                <span>Check Service Options</span>
                <span className="text-accent-gold">→</span>
              </button>
            </div>

          </form>

        </div>
      </div>
    </section>
  );
};
