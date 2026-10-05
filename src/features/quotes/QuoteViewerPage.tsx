import React, { useState } from 'react';
import { Container } from '../../components/layout/SectionHeader';
import { Button } from '../../components/ui/Button';
import { getCustomerSafeQuoteView, recordEstimateDecisions } from '../../lib/demoStore';
import { CheckCircle2, ShieldCheck, XCircle, ArrowLeft, Check, X, Printer } from 'lucide-react';
import type { CustomerSafeQuoteDTO } from '../../types';

export interface QuoteViewerPageProps {
  token: string;
  onBack: () => void;
}

export const QuoteViewerPage: React.FC<QuoteViewerPageProps> = ({ token, onBack }) => {
  const initialQuote = getCustomerSafeQuoteView(token);
  const [quote, setQuote] = useState<CustomerSafeQuoteDTO | null>(initialQuote);

  // Individual item decisions state map: item.id -> 'APPROVED' | 'DECLINED' | 'PENDING'
  const [decisions, setDecisions] = useState<Record<string, 'APPROVED' | 'DECLINED' | 'PENDING'>>(() => {
    const initial: Record<string, 'APPROVED' | 'DECLINED' | 'PENDING'> = {};
    if (initialQuote?.items) {
      for (const item of initialQuote.items) {
        initial[item.id] = item.approvalStatus || 'PENDING';
      }
    }
    return initial;
  });

  const [hasActioned, setHasActioned] = useState<boolean>(
    initialQuote?.status === 'APPROVED' ||
    initialQuote?.status === 'PARTIALLY_APPROVED' ||
    initialQuote?.status === 'DECLINED' ||
    initialQuote?.status === 'CONVERTED_TO_WORK'
  );

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Toggle single item decision
  const handleItemDecision = (itemId: string, status: 'APPROVED' | 'DECLINED') => {
    setDecisions((prev) => ({
      ...prev,
      [itemId]: prev[itemId] === status ? 'PENDING' : status,
    }));
  };

  // Submit all approved
  const handleApproveAll = () => {
    if (!quote) return;
    const allApproved: Record<string, 'APPROVED'> = {};
    for (const item of quote.items) {
      allApproved[item.id] = 'APPROVED';
    }
    const res = recordEstimateDecisions(token, allApproved, 'Customer authorized all scope via digital quote portal');
    if (res.success && res.estimate) {
      const refreshedSafeQuote = getCustomerSafeQuoteView(token);
      setQuote(refreshedSafeQuote);
      setDecisions(allApproved);
      setHasActioned(true);
      setActionMessage('All work items approved. Your workshop service team has received your authorization.');
    }
  };

  // Submit all declined
  const handleDeclineAll = () => {
    if (!quote) return;
    const allDeclined: Record<string, 'DECLINED'> = {};
    for (const item of quote.items) {
      allDeclined[item.id] = 'DECLINED';
    }
    const res = recordEstimateDecisions(token, allDeclined, 'Customer declined scope via digital quote portal');
    if (res.success && res.estimate) {
      const refreshedSafeQuote = getCustomerSafeQuoteView(token);
      setQuote(refreshedSafeQuote);
      setDecisions(allDeclined);
      setHasActioned(true);
      setActionMessage('Estimate declined. Your dedicated service advisor will contact you to discuss alternatives.');
    }
  };

  // Submit custom partial decisions
  const handleConfirmSelected = () => {
    if (!quote) return;
    const mapToSave: Record<string, 'APPROVED' | 'DECLINED'> = {};
    for (const [id, dec] of Object.entries(decisions)) {
      if (dec === 'APPROVED' || dec === 'DECLINED') {
        mapToSave[id] = dec;
      }
    }
    const res = recordEstimateDecisions(token, mapToSave, 'Customer confirmed selected items via digital quote portal');
    if (res.success && res.estimate) {
      const refreshedSafeQuote = getCustomerSafeQuoteView(token);
      setQuote(refreshedSafeQuote);
      setHasActioned(true);
      setActionMessage(
        res.estimate.status === 'PARTIALLY_APPROVED'
          ? 'Selected work items authorized. Excluded items have been marked as declined.'
          : res.estimate.status === 'APPROVED'
          ? 'All work items approved. Service authorized.'
          : 'Decisions recorded.'
      );
    }
  };

  if (!quote) {
    return (
      <div className="py-24 bg-obsidian text-center text-warm-white min-h-[60vh] flex items-center justify-center">
        <Container className="max-w-md">
          <div className="p-8 rounded-xs bg-graphite/50 border border-graphite-border space-y-4 text-left">
            <h3 className="text-lg font-bold uppercase text-warm-white">Quotation Token Not Found</h3>
            <p className="text-xs text-muted font-light">This quote token is invalid, unrecognized, or has expired.</p>
            <Button variant="outline" size="sm" onClick={onBack} className="text-xs uppercase">
              Return Home
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  // Calculate live approved vs total
  const approvedItemsList = quote.items.filter((i) => decisions[i.id] === 'APPROVED');
  const approvedTotalVal = approvedItemsList.reduce((acc, i) => acc + i.lineTotal, 0);

  const visibleItems = quote.items;

  return (
    <div className="py-12 sm:py-24 bg-obsidian text-warm-white min-h-screen">
      <Container className="max-w-3xl">
        
        {/* Back Link & Print Action Bar */}
        <div className="mb-6 flex items-center justify-between no-print">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent-gold transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
          </button>

          <button
            type="button"
            id="btn-print-quote"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-graphite border border-accent-gold/40 text-accent-gold hover:bg-accent-gold hover:text-obsidian rounded-xs text-xs font-mono font-bold uppercase transition-colors min-h-[36px]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Quote</span>
          </button>
        </div>

        {/* Dedicated Print-Only Formal Letterhead (Visible ONLY during print) */}
        <div className="hidden print:block print-header-brand border-b-2 border-black pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-black">
                TORQUE EXPERT'S WORKSHOP
              </h2>
              <p className="text-xs text-zinc-600">
                German & Luxury Car Specialist Centre · Digital Service Operations
              </p>
              <p className="text-xs text-zinc-600">
                Contact: +91 98200 12345 · Support: service@torqueexperts.in
              </p>
            </div>
            <div className="text-right font-mono text-xs text-black">
              <span className="font-bold text-sm block">OFFICIAL ESTIMATE</span>
              <span>{quote.estimateNumber}</span>
              <span className="block text-zinc-600">
                Date: {new Date(quote.createdDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-10 pb-6 border-b border-graphite-border space-y-3 print:mb-4 print:pb-2 print:border-zinc-300">
          <div className="flex items-center gap-3 no-print">
            <span className="w-6 h-[1px] bg-accent-gold" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-gold">
              Digital Scope Estimate & Customer Authorization
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tightest uppercase print:text-2xl print:text-black">
            Estimate {quote.estimateNumber}
          </h1>
          <p className="text-xs sm:text-sm text-muted font-light leading-relaxed print:text-xs print:text-zinc-800">
            Customer: <strong className="text-warm-white font-medium print:text-black">{quote.customerName}</strong> · Vehicle: <strong className="text-warm-white font-medium print:text-black">{quote.vehicleSummary}</strong>
            {quote.registration && (
              <span> · Reg: <strong className="text-accent-gold font-mono font-medium print:text-black">{quote.registration}</strong></span>
            )}
          </p>
        </div>

        {/* Editorial Estimate Panel */}
        <div className="p-6 sm:p-10 rounded-xs bg-graphite/50 border border-graphite-border space-y-8 print:p-0 print:border-none print:bg-transparent print:space-y-4">
          
          {/* Header Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-graphite-border gap-3 print:pb-3 print:border-zinc-300">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-dark block print:text-zinc-500">
                Estimate Identifier
              </span>
              <h3 className="text-xl font-bold text-warm-white font-mono print:text-black print:text-base">
                {quote.estimateNumber}
              </h3>
              <p className="text-xs text-muted font-light print:text-zinc-600">
                Generated: {new Date(quote.createdDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · Valid Until: {new Date(quote.validityDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider font-mono border print:border-black print:text-black print:bg-transparent ${
                quote.status === 'APPROVED' || quote.status === 'CONVERTED_TO_WORK'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : quote.status === 'PARTIALLY_APPROVED'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : quote.status === 'DECLINED'
                  ? 'bg-red-500/15 text-red-400 border-red-500/30'
                  : 'bg-accent-gold/10 text-accent-gold border-accent-gold/30'
              }`}>
                Status: {quote.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Itemized Scope of Work with Granular Customer Decision Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-dark block">
                Itemized Recommended Scope
              </span>
              <span className="text-[10px] font-mono text-muted">
                Tap items to selectively approve or decline
              </span>
            </div>

            {/* Desktop / Tablet Items Table */}
            <div className="hidden sm:block border border-graphite-border rounded-xs overflow-hidden bg-obsidian print:block print:bg-transparent print:border-zinc-300">
              <div className="grid grid-cols-12 px-4 py-2.5 bg-graphite/90 text-[10px] font-bold uppercase tracking-wider text-muted-dark border-b border-graphite-border print:bg-zinc-100 print:text-black print:border-zinc-300">
                <span className="col-span-6">Description</span>
                <span className="col-span-2 text-center">Qty / Rate</span>
                <span className="col-span-2 text-right">Amount (₹)</span>
                <span className="col-span-2 text-center">Status</span>
              </div>

              <div className="divide-y divide-graphite-border/60 print:divide-zinc-200">
                {visibleItems.map((item) => {
                  const state = decisions[item.id] || 'PENDING';
                  return (
                    <div key={item.id} className="grid grid-cols-12 px-4 py-3 text-xs items-center hover:bg-graphite/20 transition-colors print:py-2 print:text-black print-avoid-break">
                      <div className="col-span-6 pr-2">
                        <span className="text-warm-white font-medium block print:text-black">{item.description}</span>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted font-mono print:text-zinc-600">
                          <span className="uppercase text-accent-gold print:text-zinc-800 font-semibold">{item.type}</span>
                          {item.sourceRecommendation && (
                            <span className="text-muted-dark print:text-zinc-500 truncate max-w-xs">· Ref: {item.sourceRecommendation}</span>
                          )}
                        </div>
                      </div>

                      <div className="col-span-2 text-center text-muted font-mono text-[11px] print:text-zinc-800">
                        <span>{item.quantity} × ₹{item.unitPrice.toLocaleString()}</span>
                      </div>

                      <div className="col-span-2 text-right font-mono font-bold text-warm-white print:text-black">
                        ₹{item.lineTotal.toLocaleString()}
                      </div>

                      <div className="col-span-2 flex items-center justify-center gap-1.5">
                        {/* Interactive toggle buttons for screen UI */}
                        <div className="flex items-center gap-1.5 no-print">
                          <button
                            type="button"
                            onClick={() => handleItemDecision(item.id, 'APPROVED')}
                            className={`p-1.5 rounded-xs transition-colors text-xs font-mono flex items-center gap-1 ${
                              state === 'APPROVED'
                                ? 'bg-emerald-500 text-obsidian font-bold'
                                : 'bg-graphite border border-graphite-border text-muted hover:text-emerald-400'
                            }`}
                            title="Approve this item"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Yes</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleItemDecision(item.id, 'DECLINED')}
                            className={`p-1.5 rounded-xs transition-colors text-xs font-mono flex items-center gap-1 ${
                              state === 'DECLINED'
                                ? 'bg-red-500 text-white font-bold'
                                : 'bg-graphite border border-graphite-border text-muted hover:text-red-400'
                            }`}
                            title="Decline this item"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span className="text-[10px]">No</span>
                          </button>
                        </div>

                        {/* Static text badge for print output */}
                        <span className="hidden print:inline font-mono text-[10px] uppercase font-bold text-black">
                          {state}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Card List (< 640px) (Hidden in Print Mode) */}
            <div className="sm:hidden space-y-2.5 no-print">
              {visibleItems.map((item) => {
                const state = decisions[item.id] || 'PENDING';
                return (
                  <div key={item.id} className="p-3.5 rounded-xs bg-obsidian border border-graphite-border space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold text-warm-white leading-snug block">
                          {item.description}
                        </span>
                        <span className="text-[10px] text-accent-gold font-mono uppercase">
                          {item.type} · Qty: {item.quantity}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-warm-white shrink-0">
                        ₹{item.lineTotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-graphite-border/40">
                      <span className="text-[10px] font-mono text-muted">Your Selection:</span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleItemDecision(item.id, 'APPROVED')}
                          className={`px-2.5 py-1 rounded-xs text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1 min-h-[36px] ${
                            state === 'APPROVED'
                              ? 'bg-emerald-500 text-obsidian'
                              : 'bg-graphite border border-graphite-border text-muted'
                          }`}
                        >
                          <Check className="w-3 h-3" /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemDecision(item.id, 'DECLINED')}
                          className={`px-2.5 py-1 rounded-xs text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1 min-h-[36px] ${
                            state === 'DECLINED'
                              ? 'bg-red-500 text-white'
                              : 'bg-graphite border border-graphite-border text-muted'
                          }`}
                        >
                          <X className="w-3 h-3" /> Decline
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Calculation Summary */}
          <div className="pt-4 border-t border-graphite-border space-y-2 print:border-zinc-300 print:text-black print-avoid-break">
            <div className="flex justify-between text-xs text-muted print:text-zinc-800">
              <span>Labour Scope</span>
              <span className="font-mono">₹{quote.labourTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-muted print:text-zinc-800">
              <span>OEM Parts & Consumables</span>
              <span className="font-mono">₹{quote.partsTotal.toLocaleString()}</span>
            </div>
            {quote.discountTotal ? (
              <div className="flex justify-between text-xs text-emerald-400 print:text-black">
                <span>Promotional Courtesy Discount</span>
                <span className="font-mono">-₹{quote.discountTotal.toLocaleString()}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-sm sm:text-base font-bold text-warm-white pt-2 border-t border-graphite-border print:border-black print:text-black">
              <span>Total Quoted Scope</span>
              <span className="font-mono text-warm-white text-base sm:text-lg print:text-black">₹{quote.total.toLocaleString()}</span>
            </div>
            {approvedTotalVal > 0 && approvedTotalVal !== quote.total && (
              <div className="flex justify-between text-sm font-bold text-accent-gold pt-1 print:text-zinc-800">
                <span>Selected Authorized Value</span>
                <span className="font-mono text-accent-gold print:text-black">₹{approvedTotalVal.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Customer-Facing Notes (Internal notes strictly excluded) */}
          {quote.customerNotes && (
            <div className="p-4 rounded-xs bg-obsidian border border-graphite-border space-y-1 text-xs text-muted font-light leading-relaxed print:bg-transparent print:border-zinc-300 print:text-black print-avoid-break">
              <span className="text-[10px] uppercase tracking-wider text-accent-gold block font-mono font-bold print:text-black">
                Service Advisor Note
              </span>
              <p>{quote.customerNotes}</p>
            </div>
          )}

          {/* Workshop Policy Notice */}
          <div className="p-4 rounded-xs bg-obsidian border border-graphite-border space-y-1 text-xs text-muted font-light leading-relaxed print:bg-transparent print:border-zinc-300 print:text-zinc-700 print-avoid-break">
            <div className="flex items-center gap-1.5 font-bold text-warm-white print:text-black">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-gold print:text-black" />
              <span>Workshop Authorization Policy</span>
            </div>
            <p>
              {quote.policyNotice}
            </p>
          </div>

          {/* Customer Action Controls (Hidden completely during Print) */}
          {!hasActioned ? (
            <div className="pt-4 border-t border-graphite-border flex flex-col items-stretch gap-4 no-print">
              <span className="text-xs text-muted-dark font-light">
                Confirming authorization reserves required OEM parts and schedules workshop service execution.
              </span>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleDeclineAll}
                  className="w-full sm:flex-1 text-xs text-red-400 hover:text-red-300 border-red-500/30 uppercase tracking-wider min-h-[44px]"
                >
                  <XCircle className="w-4 h-4 mr-1.5" /> Decline All
                </Button>

                {/* If user selectively toggled items */}
                {Object.values(decisions).some((d) => d === 'APPROVED') && (
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleConfirmSelected}
                    className="w-full sm:flex-1 text-xs text-accent-gold hover:text-white border-accent-gold/40 uppercase tracking-wider min-h-[44px]"
                  >
                    Authorize Selected (₹{approvedTotalVal.toLocaleString()})
                  </Button>
                )}

                <Button
                  variant="gold"
                  size="md"
                  onClick={handleApproveAll}
                  className="w-full sm:flex-1 text-xs font-bold gap-1.5 uppercase tracking-wider min-h-[44px]"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Authorize Full Scope (₹{quote.total.toLocaleString()})
                </Button>
              </div>
            </div>
          ) : (
            <div className={`p-4 rounded-xs border text-xs flex items-center gap-2.5 font-light ${
              quote.status === 'APPROVED' || quote.status === 'CONVERTED_TO_WORK'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : quote.status === 'PARTIALLY_APPROVED'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {actionMessage || (
                  quote.status === 'APPROVED' || quote.status === 'CONVERTED_TO_WORK'
                    ? 'Authorization recorded. Workshop service has been scheduled.'
                    : quote.status === 'PARTIALLY_APPROVED'
                    ? `Partial approval recorded for ₹${(quote.approvedTotal || approvedTotalVal).toLocaleString()}. Excluded items declined.`
                    : 'Estimate declined. A service advisor will contact you to review alternatives.'
                )}
              </span>
            </div>
          )}

        </div>
      </Container>
    </div>
  );
};
