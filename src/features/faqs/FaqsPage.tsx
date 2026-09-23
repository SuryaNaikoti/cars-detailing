import React, { useState } from 'react';
import { Container } from '../../components/layout/SectionHeader';
import { APPROVED_FAQS } from '../../data/demoData';
import { Plus, Minus, MessageSquare } from 'lucide-react';
import { generateWhatsAppLink } from '../../lib/utils';
import { Button } from '../../components/ui/Button';

export const FaqsPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<string | null>(APPROVED_FAQS[0].id);

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const categories = ['All', 'Workshop & Parts', 'Diagnostics', 'Booking & Timing', 'Estimates & Quotes', 'Service Tracking'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFaqs = selectedCategory === 'All'
    ? APPROVED_FAQS
    : APPROVED_FAQS.filter((f) => f.category === selectedCategory);

  return (
    <div className="py-20 sm:py-28 bg-obsidian text-warm-white">
      <Container className="max-w-4xl">
        
        {/* Page Header */}
        <div className="mb-16 pb-8 border-b border-graphite-border space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-6 h-[1px] bg-accent-gold" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-gold">
              Knowledge & Advisory
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tightest uppercase">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-muted font-light leading-relaxed max-w-2xl">
            Detailed guidance on German marque diagnostic protocols, genuine OEM component sourcing, transparent estimate authorizations, and workshop turnaround standards.
          </p>
        </div>

        {/* Category Selection: Mobile Compact Dropdown (< 640px), Desktop Pills (>= 640px) */}
        <div className="mb-12">
          {/* Mobile Selector */}
          <div className="sm:hidden">
            <label className="text-xs uppercase tracking-wider text-muted-dark font-bold block mb-2">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-graphite border border-graphite-border rounded-xs px-4 py-3 text-sm font-semibold text-warm-white focus:outline-none focus:border-accent-gold min-h-[48px]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-graphite text-warm-white">
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Category Pills */}
          <div className="hidden sm:flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xs border transition-colors ${
                  selectedCategory === cat
                    ? 'bg-warm-white text-obsidian border-warm-white font-bold'
                    : 'bg-graphite text-muted hover:text-warm-white border-graphite-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Minimalist Divider Accordion */}
        <div className="divide-y divide-graphite-border border-y border-graphite-border">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaq === faq.id;
            return (
              <div key={faq.id} className="py-6">
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left flex items-start justify-between gap-4 group focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-accent-gold block">
                      {faq.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-warm-white group-hover:text-accent-gold transition-colors">
                      {faq.question}
                    </h3>
                  </div>
                  <span className="p-1 text-muted group-hover:text-warm-white transition-colors shrink-0 mt-1">
                    {isOpen ? <Minus className="w-4 h-4 text-accent-gold" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="pt-4 pb-2 text-xs sm:text-sm text-muted leading-relaxed font-light animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Unresolved Question Callout */}
        <div className="mt-16 p-8 rounded-xs bg-graphite border border-graphite-border flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold text-warm-white uppercase">
              Have a Marque-Specific Technical Question?
            </h4>
            <p className="text-xs text-muted">
              Our lead workshop advisor in Madhapur can discuss technical diagnostic trouble codes or parts availability.
            </p>
          </div>

          <a
            href={generateWhatsAppLink({})}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button variant="gold" size="md" className="text-xs font-bold gap-2 uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask an Advisor</span>
            </Button>
          </a>
        </div>

      </Container>
    </div>
  );
};
