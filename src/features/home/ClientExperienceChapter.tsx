import React, { useState } from 'react';
import { Plus, Minus, Search, FileCheck, Eye, HelpCircle } from 'lucide-react';
import { SAMPLE_REVIEWS } from '../../data/demoData';

interface ClientExperienceChapterProps {
  onContactWorkshop?: () => void;
}

interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

const CANONICAL_OBJECTION_FAQS: FaqEntry[] = [
  {
    id: 'faq-1',
    question: 'Do you service premium and performance vehicles?',
    answer: 'Yes. Our tooling, diagnostic interfaces, and procedures are tailored specifically for German and luxury marques including BMW, Mercedes-Benz, Audi, Porsche, Jaguar, and Land Rover.',
  },
  {
    id: 'faq-2',
    question: 'How do I request a service?',
    answer: 'Use the vehicle qualification selector above to specify your make, model, year, and service requirement. Our service advisor contacts you promptly to confirm bay schedule and parts availability.',
  },
  {
    id: 'faq-3',
    question: 'Can I request an estimate before work begins?',
    answer: 'Always. Once preliminary intake and digital inspection are conducted, we present an itemized estimate outlining parts, labor, and recommended scopes. Nothing proceeds without your explicit authorization.',
  },
  {
    id: 'faq-4',
    question: 'Will recommended additional work require approval?',
    answer: 'Strictly yes. If our technicians identify supplementary issues during inspection or service, they are cataloged with notes and presented for your digital approval before any additional work commences.',
  },
  {
    id: 'faq-5',
    question: 'How does the service process work?',
    answer: 'Every vehicle follows a defined 7-stage workflow: Vehicle Received, Inspection, Estimate & Approval, Service In Progress, Quality Check, Ready for Collection, and Vehicle Delivered.',
  },
  {
    id: 'faq-6',
    question: 'Can I view my vehicle’s latest workshop status?',
    answer: 'Yes. You can access the dedicated customer status portal at any time to see the latest operational stage, documented findings, and collection readiness.',
  },
  {
    id: 'faq-7',
    question: 'Is my service history retained?',
    answer: 'Yes. Every completed job card, invoice, inspection report, and parts list is permanently recorded in your vehicle’s history file for ongoing reference and resale verification.',
  },
];

export const ClientExperienceChapter: React.FC<ClientExperienceChapterProps> = ({
  onContactWorkshop,
}) => {
  const [openFaq, setOpenFaq] = useState<string | null>(CANONICAL_OBJECTION_FAQS[0].id);

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const featuredReview = SAMPLE_REVIEWS[0];

  return (
    <>
      {/* 10. CUSTOMER EXPERIENCE SECTION */}
      <section id="experience" className="py-20 sm:py-28 bg-obsidian border-b border-graphite-border">
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-12">
          
          <div className="space-y-4 max-w-3xl mb-16">
            <div className="flex items-center gap-3">
              <span className="w-6 h-[1px] bg-accent-gold" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-gold">
                CUSTOMER EXPERIENCE
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tightest text-warm-white uppercase leading-tight">
              THE EXPERIENCE
              <br />
              <span className="text-muted">AFTER YOU HAND OVER THE KEYS.</span>
            </h2>
            <p className="text-sm sm:text-base text-muted font-light leading-relaxed">
              We eliminate workshop uncertainty by building every interaction on three fundamental commitments.
            </p>
          </div>

          {/* Three Concrete Customer Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16">
            
            {/* Benefit 1 */}
            <div className="p-6 sm:p-8 rounded-xs bg-graphite/40 border border-graphite-border/70 space-y-4">
              <div className="w-10 h-10 rounded-xs bg-obsidian border border-graphite-border flex items-center justify-center text-accent-gold">
                <Search className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-accent-gold">
                  01 · TRANSPARENT FINDINGS
                </div>
                <h3 className="text-lg font-bold uppercase tracking-tight text-warm-white">
                  KNOW WHAT WAS FOUND
                </h3>
                <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                  Inspection findings are documented before recommended work is presented. You receive clear observations rather than unexpected line items.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="p-6 sm:p-8 rounded-xs bg-graphite/40 border border-graphite-border/70 space-y-4">
              <div className="w-10 h-10 rounded-xs bg-obsidian border border-graphite-border flex items-center justify-center text-accent-gold">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-accent-gold">
                  02 · CONTROLLED EXECUTION
                </div>
                <h3 className="text-lg font-bold uppercase tracking-tight text-warm-white">
                  KNOW WHAT WAS APPROVED
                </h3>
                <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                  Recommended work is organized into an itemized estimate before execution. You choose which scopes proceed and which can wait.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="p-6 sm:p-8 rounded-xs bg-graphite/40 border border-graphite-border/70 space-y-4">
              <div className="w-10 h-10 rounded-xs bg-obsidian border border-graphite-border flex items-center justify-center text-accent-gold">
                <Eye className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-accent-gold">
                  03 · WORKSHOP VISIBILITY
                </div>
                <h3 className="text-lg font-bold uppercase tracking-tight text-warm-white">
                  KNOW WHERE YOUR VEHICLE STANDS
                </h3>
                <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                  View the latest workshop status through the customer-facing service portal as your vehicle moves toward final quality check.
                </p>
              </div>
            </div>

          </div>

          {/* Genuine Editorial Testimonial Representation */}
          <div className="p-6 sm:p-8 rounded-xs bg-graphite/30 border border-graphite-border/60 max-w-4xl">
            <div className="space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent-gold border border-accent-gold/40 px-2 py-0.5 rounded-xs inline-block">
                Sample Client Feedback · Verified Owner
              </span>

              <blockquote className="text-base sm:text-lg lg:text-xl font-light italic text-warm-white leading-relaxed border-l-2 border-accent-gold pl-6">
                &ldquo;{featuredReview.content}&rdquo;
              </blockquote>

              <div className="pl-6 space-y-0.5">
                <div className="text-sm font-bold uppercase tracking-wider text-warm-white">
                  {featuredReview.name}
                </div>
                <div className="text-xs font-mono text-muted-dark">
                  {featuredReview.vehicle}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 11. FAQ SECTION — OBJECTION HANDLING */}
      <section id="faq" className="py-20 sm:py-28 bg-obsidian border-b border-graphite-border">
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Header & Help Callout */}
            <div className="lg:col-span-4 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-accent-gold" />
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-gold">
                    ADVISORY
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tightest text-warm-white uppercase">
                  FREQUENTLY ASKED
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-muted font-light leading-relaxed">
                Everything you need to know about our inspection standards, estimate approvals, and service workflows.
              </p>

              {/* Still Have Questions Box */}
              <div className="p-6 rounded-xs bg-graphite/40 border border-graphite-border/70 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-warm-white">
                  <HelpCircle className="w-4 h-4 text-accent-gold" />
                  <span>STILL HAVE QUESTIONS?</span>
                </div>
                <p className="text-xs text-muted font-light leading-relaxed">
                  Our service advisors are available to discuss specific symptoms, scheduled intervals, or booking availability.
                </p>
                {onContactWorkshop && (
                  <button
                    type="button"
                    id="cta-contact-workshop-faq"
                    onClick={onContactWorkshop}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-graphite hover:bg-graphite-subtle text-warm-white border border-graphite-border text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
                  >
                    CONTACT THE WORKSHOP
                  </button>
                )}
              </div>
            </div>

            {/* Right: Divider-Driven Accordion List */}
            <div className="lg:col-span-8">
              <div className="divide-y divide-graphite-border border-y border-graphite-border">
                {CANONICAL_OBJECTION_FAQS.map((faq) => {
                  const isOpen = openFaq === faq.id;
                  return (
                    <div key={faq.id} className="py-5">
                      <button
                        type="button"
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full text-left flex items-start justify-between gap-4 group focus:outline-none cursor-pointer"
                        aria-expanded={isOpen}
                      >
                        <span className="text-sm sm:text-base font-bold text-warm-white group-hover:text-accent-gold transition-colors">
                          {faq.question}
                        </span>
                        <span className="p-1 text-muted group-hover:text-warm-white transition-colors shrink-0">
                          {isOpen ? <Minus className="w-4 h-4 text-accent-gold" /> : <Plus className="w-4 h-4" />}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="pt-3 pb-2 text-xs sm:text-sm text-muted leading-relaxed font-light animate-in fade-in duration-200">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </section>
    </>
  );
};
