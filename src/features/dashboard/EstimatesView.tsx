import React, { useState, useMemo } from 'react';
import type {
  EstimateRecord,
  EstimateItem,
  EstimateItemType,
  EstimateApprovalStatus,
  EstimateStatus,
  JobCard,
  InspectionRecord,
  AppointmentRecord,
  LeadRecord,
} from '../../types';
import {
  createEstimateFromInspection,
  createEstimateFromJobCard,
  authorizeApprovedEstimateWork,
  createEstimateRevision,
} from '../../lib/demoStore';
import {
  Calculator,
  Search,
  Plus,
  RotateCcw,
  ExternalLink,
  Trash2,
  Send,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  MessageSquare,
  Wrench,
  Sparkles,
  Printer,
} from 'lucide-react';
import { MobileFormSheet } from '../../components/ui/MobileFormSheet';

export interface EstimatesViewProps {
  estimates: Record<string, EstimateRecord>;
  jobs: JobCard[];
  inspections?: Record<string, InspectionRecord>;
  appointments?: AppointmentRecord[];
  leads?: LeadRecord[];
  onSaveEstimate: (estimate: EstimateRecord) => void;
  onOpenQuoteToken: (token: string) => void;
  onOpenJob?: (jobId: string) => void;
  onNavigateModule?: (module: any) => void;
}

const STATUS_CONFIG: Record<
  EstimateStatus,
  { label: string; badgeClass: string; rowBorder: string }
> = {
  DRAFT: {
    label: 'DRAFT',
    badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    rowBorder: 'border-zinc-700',
  },
  SENT: {
    label: 'AWAITING APPROVAL',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    rowBorder: 'border-blue-500/30',
  },
  VIEWED: {
    label: 'CUSTOMER VIEWED',
    badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    rowBorder: 'border-sky-500/30',
  },
  PARTIALLY_APPROVED: {
    label: 'PARTIALLY APPROVED',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    rowBorder: 'border-amber-500/30',
  },
  APPROVED: {
    label: 'APPROVED',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    rowBorder: 'border-emerald-500/30',
  },
  DECLINED: {
    label: 'DECLINED',
    badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30',
    rowBorder: 'border-red-500/30',
  },
  EXPIRED: {
    label: 'EXPIRED',
    badgeClass: 'bg-zinc-900 text-muted-dark border-zinc-800',
    rowBorder: 'border-zinc-800',
  },
  CANCELLED: {
    label: 'CANCELLED',
    badgeClass: 'bg-zinc-900 text-muted-dark border-zinc-800',
    rowBorder: 'border-zinc-800',
  },
  CONVERTED_TO_WORK: {
    label: 'WORK AUTHORIZED',
    badgeClass: 'bg-accent-gold/15 text-accent-gold border-accent-gold/40',
    rowBorder: 'border-accent-gold/40',
  },
};

export const EstimatesView: React.FC<EstimatesViewProps> = ({
  estimates,
  jobs,
  inspections = {},
  appointments = [],
  leads = [],
  onSaveEstimate,
  onOpenQuoteToken,
  onOpenJob,
  onNavigateModule,
}) => {
  const estimateList = useMemo(() => Object.values(estimates), [estimates]);

  // Selected Estimate state
  const [selectedEstimateId, setSelectedEstimateId] = useState<string>(
    estimateList[0]?.id || 'est-2047'
  );

  // Active Estimate
  const activeEstimate = useMemo(() => {
    return (
      estimateList.find(
        (e) => e.id === selectedEstimateId || e.job_id === selectedEstimateId
      ) ||
      estimateList[0] ||
      null
    );
  }, [estimateList, selectedEstimateId]);

  // Mobile drawer state
  const [mobileDossierOpen, setMobileDossierOpen] = useState(false);

  // Filter States
  const [kpiFilter, setKpiFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [advisorFilter, setAdvisorFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('RECENTLY_UPDATED');

  // Modals
  const [newEstimateModalOpen, setNewEstimateModalOpen] = useState(false);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [authorizeModalOpen, setAuthorizeModalOpen] = useState(false);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);

  // New Estimate Modal state
  const [creationOrigin, setCreationOrigin] = useState<'INSPECTION' | 'JOB' | 'MANUAL'>('INSPECTION');
  const [selectedInspJobId, setSelectedInspJobId] = useState<string>(jobs[0]?.id || 'JC-2047');
  const [selectedFindingCheckboxes, setSelectedFindingCheckboxes] = useState<Record<string, boolean>>({});
  const [advisorInput, setAdvisorInput] = useState('Rohan Deshmukh');

  // Add Item Modal form state
  const [itemType, setItemType] = useState<EstimateItemType>('Labour');
  const [itemCategory, setItemCategory] = useState('Mechanical Labour');
  const [itemDesc, setItemDesc] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemUnit, setItemUnit] = useState('job');
  const [itemUnitPrice, setItemUnitPrice] = useState(1500);
  const [itemDiscount, setItemDiscount] = useState(0);
  const [itemCustomerVisible, setItemCustomerVisible] = useState(true);
  const [itemInternalNote, setItemInternalNote] = useState('');
  const [itemCustomerNote, setItemCustomerNote] = useState('');
  const [itemSourceFindingId, setItemSourceFindingId] = useState<string>('');

  // Revision Modal form state
  const [revisionReason, setRevisionReason] = useState('');

  // KPI Calculations derived from canonical Estimate records
  const kpiMetrics = useMemo(() => {
    const total = estimateList.length;
    const draft = estimateList.filter((e) => e.status === 'DRAFT').length;
    const awaitingApproval = estimateList.filter(
      (e) => e.status === 'SENT' || e.status === 'VIEWED'
    ).length;
    const partiallyApproved = estimateList.filter(
      (e) => e.status === 'PARTIALLY_APPROVED'
    ).length;
    const approved = estimateList.filter((e) => e.status === 'APPROVED').length;
    const declined = estimateList.filter((e) => e.status === 'DECLINED').length;
    const expired = estimateList.filter((e) => e.status === 'EXPIRED').length;
    const authorized = estimateList.filter(
      (e) => e.status === 'CONVERTED_TO_WORK'
    ).length;

    return {
      total,
      draft,
      awaitingApproval,
      partiallyApproved,
      approved,
      declined,
      expired,
      authorized,
    };
  }, [estimateList]);

  // Handle KPI Click (Toggle-to-Clear)
  const handleKpiClick = (filterKey: string) => {
    if (kpiFilter === filterKey) {
      setKpiFilter('ALL');
    } else {
      setKpiFilter(filterKey);
      setStatusFilter('ALL');
    }
  };

  const handleResetFilters = () => {
    setKpiFilter('ALL');
    setSearchQuery('');
    setStatusFilter('ALL');
    setAdvisorFilter('ALL');
    setSourceFilter('ALL');
    setSortBy('RECENTLY_UPDATED');
  };

  // Filtered Queue
  const filteredEstimates = useMemo(() => {
    return estimateList
      .filter((e) => {
        // KPI Filter
        if (kpiFilter === 'DRAFT' && e.status !== 'DRAFT') return false;
        if (
          kpiFilter === 'AWAITING_APPROVAL' &&
          e.status !== 'SENT' &&
          e.status !== 'VIEWED'
        )
          return false;
        if (
          kpiFilter === 'PARTIALLY_APPROVED' &&
          e.status !== 'PARTIALLY_APPROVED'
        )
          return false;
        if (kpiFilter === 'APPROVED' && e.status !== 'APPROVED') return false;
        if (kpiFilter === 'DECLINED' && e.status !== 'DECLINED') return false;
        if (kpiFilter === 'EXPIRED' && e.status !== 'EXPIRED') return false;
        if (
          kpiFilter === 'AUTHORIZED' &&
          e.status !== 'CONVERTED_TO_WORK'
        )
          return false;

        // Secondary Status Filter
        if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;

        // Advisor Filter
        if (advisorFilter !== 'ALL' && e.advisor_name !== advisorFilter)
          return false;

        // Source Filter
        if (sourceFilter === 'INSPECTION' && !e.inspection_id) return false;
        if (sourceFilter === 'MANUAL' && e.inspection_id) return false;

        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchEst = e.estimate_number?.toLowerCase().includes(q);
          const matchJob = (e.job_card_id || e.job_id)?.toLowerCase().includes(q);
          const matchCust = e.customer_name?.toLowerCase().includes(q);
          const matchPhone = e.customer_phone?.toLowerCase().includes(q);
          const matchReg = e.registration?.toLowerCase().includes(q);
          const matchVeh = e.vehicle_summary?.toLowerCase().includes(q);
          const matchInsp = e.inspection_id?.toLowerCase().includes(q);
          if (
            !matchEst &&
            !matchJob &&
            !matchCust &&
            !matchPhone &&
            !matchReg &&
            !matchVeh &&
            !matchInsp
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'HIGHEST_VALUE') return b.total - a.total;
        if (sortBy === 'OLDEST_FIRST')
          return new Date(a.created_date).getTime() - new Date(b.created_date).getTime();
        // RECENTLY_UPDATED default
        return (
          new Date(b.updated_at || b.created_date).getTime() -
          new Date(a.updated_at || a.created_date).getTime()
        );
      });
  }, [
    estimateList,
    kpiFilter,
    statusFilter,
    advisorFilter,
    sourceFilter,
    searchQuery,
    sortBy,
  ]);

  // Active Estimate's Parent Workshop Lineage Records
  const activeJob = useMemo(() => {
    if (!activeEstimate) return null;
    return (
      jobs.find((j) => j.id === (activeEstimate.job_card_id || activeEstimate.job_id)) ||
      null
    );
  }, [jobs, activeEstimate]);

  const activeInspection = useMemo(() => {
    if (!activeEstimate) return null;
    const targetId = activeEstimate.inspection_id || activeEstimate.job_id;
    return (
      Object.values(inspections).find(
        (i) => i.id === targetId || i.job_id === activeEstimate.job_id
      ) || null
    );
  }, [inspections, activeEstimate]);

  // Recalculate totals for active estimate
  const activeLabourTotal = useMemo(() => {
    if (!activeEstimate?.items) return 0;
    return activeEstimate.items
      .filter((i) => i.type === 'Labour')
      .reduce((acc, i) => acc + (i.line_total || 0), 0);
  }, [activeEstimate]);

  const activePartsTotal = useMemo(() => {
    if (!activeEstimate?.items) return 0;
    return activeEstimate.items
      .filter((i) => i.type === 'Parts')
      .reduce((acc, i) => acc + (i.line_total || 0), 0);
  }, [activeEstimate]);

  const activeConsumablesTotal = useMemo(() => {
    if (!activeEstimate?.items) return 0;
    return activeEstimate.items
      .filter((i) => i.type === 'Consumables')
      .reduce((acc, i) => acc + (i.line_total || 0), 0);
  }, [activeEstimate]);

  const activeGrandTotal =
    activeLabourTotal + activePartsTotal + activeConsumablesTotal;

  // Save Item additions / removals / status updates
  const handleRemoveLineItem = (itemId: string) => {
    if (!activeEstimate) return;
    const newItems = activeEstimate.items.filter((i) => i.id !== itemId);
    const lab = newItems
      .filter((i) => i.type === 'Labour')
      .reduce((acc, i) => acc + i.line_total, 0);
    const prt = newItems
      .filter((i) => i.type !== 'Labour')
      .reduce((acc, i) => acc + i.line_total, 0);
    const updated: EstimateRecord = {
      ...activeEstimate,
      items: newItems,
      labour_total: lab,
      parts_total: prt,
      subtotal: lab + prt,
      total: lab + prt,
      updated_at: new Date().toISOString(),
    };
    onSaveEstimate(updated);
  };

  const handleUpdateItemApproval = (
    itemId: string,
    newApproval: EstimateApprovalStatus
  ) => {
    if (!activeEstimate) return;
    const updatedItems = activeEstimate.items.map((i) =>
      i.id === itemId ? { ...i, approval_status: newApproval } : i
    );

    const approvedSum = updatedItems
      .filter((i) => i.approval_status === 'APPROVED')
      .reduce((acc, i) => acc + i.line_total, 0);
    const declinedSum = updatedItems
      .filter((i) => i.approval_status === 'DECLINED')
      .reduce((acc, i) => acc + i.line_total, 0);

    const allApproved = updatedItems.every((i) => i.approval_status === 'APPROVED');
    const allDeclined = updatedItems.every((i) => i.approval_status === 'DECLINED');
    const anyApproved = updatedItems.some((i) => i.approval_status === 'APPROVED');

    let derivedStatus: EstimateStatus = activeEstimate.status;
    if (allApproved) derivedStatus = 'APPROVED';
    else if (allDeclined) derivedStatus = 'DECLINED';
    else if (anyApproved) derivedStatus = 'PARTIALLY_APPROVED';

    const updated: EstimateRecord = {
      ...activeEstimate,
      items: updatedItems,
      status: derivedStatus,
      approved_total: approvedSum,
      declined_total: declinedSum,
      updated_at: new Date().toISOString(),
    };
    onSaveEstimate(updated);
  };

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEstimate || !itemDesc.trim()) return;

    const lineTot = Number(itemQty) * Number(itemUnitPrice) - Number(itemDiscount || 0);

    const newItem: EstimateItem = {
      id: `item-${Date.now()}`,
      estimate_id: activeEstimate.id,
      description: itemDesc.trim(),
      type: itemType,
      category: itemCategory,
      quantity: Number(itemQty),
      unit: itemUnit,
      unit_price: Number(itemUnitPrice),
      discount: Number(itemDiscount || 0),
      line_total: Math.max(0, lineTot),
      is_price_configured: true,
      customer_visible: itemCustomerVisible,
      approval_status: 'PENDING',
      internal_note: itemInternalNote.trim() || undefined,
      customer_note: itemCustomerNote.trim() || undefined,
      source_finding_id: itemSourceFindingId || undefined,
      display_order: activeEstimate.items.length + 1,
      created_at: new Date().toISOString(),
    };

    const newItems = [...activeEstimate.items, newItem];
    const lab = newItems
      .filter((i) => i.type === 'Labour')
      .reduce((acc, i) => acc + i.line_total, 0);
    const prt = newItems
      .filter((i) => i.type !== 'Labour')
      .reduce((acc, i) => acc + i.line_total, 0);

    const updated: EstimateRecord = {
      ...activeEstimate,
      items: newItems,
      labour_total: lab,
      parts_total: prt,
      subtotal: lab + prt,
      total: lab + prt,
      updated_at: new Date().toISOString(),
    };

    onSaveEstimate(updated);
    setAddItemModalOpen(false);

    // Reset fields
    setItemDesc('');
    setItemQty(1);
    setItemUnitPrice(1500);
    setItemDiscount(0);
    setItemInternalNote('');
    setItemCustomerNote('');
    setItemSourceFindingId('');
  };

  // Transmit Estimate to Customer (Advance to SENT)
  const handleSendEstimate = () => {
    if (!activeEstimate) return;
    const updated: EstimateRecord = {
      ...activeEstimate,
      status: 'SENT',
      updated_at: new Date().toISOString(),
      timeline: [
        ...(activeEstimate.timeline || []),
        {
          id: `et-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: `${activeEstimate.advisor_name || 'Rohan Deshmukh'} (Advisor)`,
          event: 'Estimate Transmitted to Customer',
          notes: 'Customer notified via digital link.',
        },
      ],
    };
    onSaveEstimate(updated);
  };

  // Confirm Work Authorization
  const handleConfirmAuthorization = () => {
    if (!activeEstimate) return;
    const res = authorizeApprovedEstimateWork(
      activeEstimate.id,
      `${activeEstimate.advisor_name || 'Rohan Deshmukh'} (Advisor)`
    );
    if (res.success && res.estimate) {
      onSaveEstimate(res.estimate);
    }
    setAuthorizeModalOpen(false);
  };

  // Submit Revision
  const handleSubmitRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEstimate || !revisionReason.trim()) return;
    const rev = createEstimateRevision(
      activeEstimate.id,
      revisionReason.trim(),
      `${activeEstimate.advisor_name || 'Rohan Deshmukh'} (Advisor)`
    );
    if (rev) {
      onSaveEstimate(rev);
    }
    setRevisionModalOpen(false);
    setRevisionReason('');
  };

  // Create New Estimate from Modal
  const handleCreateEstimateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (creationOrigin === 'INSPECTION') {
      const insp = Object.values(inspections).find(
        (i) => i.job_id === selectedInspJobId || i.id === selectedInspJobId
      );
      if (insp) {
        const selectedIds = Object.keys(selectedFindingCheckboxes).filter(
          (k) => selectedFindingCheckboxes[k]
        );
        const created = createEstimateFromInspection(insp, selectedIds, advisorInput);
        onSaveEstimate(created);
        setSelectedEstimateId(created.id);
      }
    } else {
      const job = jobs.find((j) => j.id === selectedInspJobId) || jobs[0];
      if (job) {
        const created = createEstimateFromJobCard(job, advisorInput);
        onSaveEstimate(created);
        setSelectedEstimateId(created.id);
      }
    }
    setNewEstimateModalOpen(false);
  };

  // WhatsApp Pre-filled message generator (explicitly labeled manual deep-link)
  const handleGenerateWhatsAppLink = () => {
    if (!activeEstimate) return;
    const quoteUrl = `${window.location.origin}/quote/${activeEstimate.public_token}`;
    const message = `Hi ${activeEstimate.customer_name},\n\nYour vehicle estimate for the ${activeEstimate.vehicle_summary} is ready for your review.\n\nEstimate: ${activeEstimate.estimate_number}\nTotal Amount: ₹${activeEstimate.total.toLocaleString()}\n\nPlease review and authorize your scope here:\n${quoteUrl}\n\nThank you,\nTorque Expert's Workshop OS`;
    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/${(activeEstimate.customer_phone || '').replace(/[^0-9]/g, '')}?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* ============================================================ */}
      {/* 9. PAGE HEADER                                              */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-graphite-border">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block font-bold">
            COMMERCIAL CONTROL
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-warm-white">
            ESTIMATES & APPROVALS
          </h1>
          <p className="text-xs text-muted font-light mt-0.5 max-w-2xl">
            Prepare repair estimates, manage customer approvals, and authorize approved workshop work.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              // Pre-select findings from current inspection
              const targetInsp = Object.values(inspections)[0];
              if (targetInsp?.findings) {
                const initialChecks: Record<string, boolean> = {};
                for (const f of targetInsp.findings) {
                  if (f.add_to_estimate) initialChecks[f.id] = true;
                }
                setSelectedFindingCheckboxes(initialChecks);
              }
              setNewEstimateModalOpen(true);
            }}
            className="px-4 py-2.5 bg-accent-gold text-obsidian rounded-xs text-xs font-bold font-mono uppercase tracking-wider hover:bg-white transition-colors flex items-center gap-1.5 min-h-[44px] shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ NEW ESTIMATE</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 10. OPERATIONAL KPI STRIP (Clickable with Toggle-to-Clear)   */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono text-xs">
        {[
          { key: 'ALL', label: 'TOTAL ESTIMATES', count: kpiMetrics.total, color: 'text-warm-white', activeBorder: 'border-accent-gold' },
          { key: 'DRAFT', label: 'DRAFT', count: kpiMetrics.draft, color: 'text-zinc-400', activeBorder: 'border-zinc-400' },
          { key: 'AWAITING_APPROVAL', label: 'AWAITING APPROVAL', count: kpiMetrics.awaitingApproval, color: 'text-blue-400', activeBorder: 'border-blue-400' },
          { key: 'PARTIALLY_APPROVED', label: 'PARTIALLY APPROVED', count: kpiMetrics.partiallyApproved, color: 'text-amber-400', activeBorder: 'border-amber-400' },
          { key: 'APPROVED', label: 'APPROVED', count: kpiMetrics.approved, color: 'text-emerald-400', activeBorder: 'border-emerald-400' },
          { key: 'DECLINED', label: 'DECLINED', count: kpiMetrics.declined, color: 'text-red-400', activeBorder: 'border-red-400' },
          { key: 'EXPIRED', label: 'EXPIRED', count: kpiMetrics.expired, color: 'text-muted-dark', activeBorder: 'border-muted-dark' },
          { key: 'AUTHORIZED', label: 'AUTHORIZED WORK', count: kpiMetrics.authorized, color: 'text-accent-gold', activeBorder: 'border-accent-gold' },
        ].map((kpi) => {
          const isActive = kpiFilter === kpi.key;
          return (
            <button
              key={kpi.key}
              type="button"
              data-testid={`kpi-${kpi.key}`}
              onClick={() => handleKpiClick(kpi.key)}
              className={`p-3 rounded-xs border cursor-pointer transition-all bg-obsidian flex flex-col justify-between text-left min-h-[76px] ${
                isActive
                  ? `${kpi.activeBorder} ring-1 ${kpi.activeBorder.replace('border', 'ring')} shadow-md`
                  : 'border-graphite-border hover:border-graphite-border/90'
              }`}
            >
              <span className="text-[9px] uppercase tracking-wider text-muted font-bold block truncate">
                {kpi.label}
              </span>
              <span className={`text-xl font-bold ${kpi.color}`}>
                {kpi.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* 12. QUEUE SEARCH & FILTERS BAR                               */}
      {/* ============================================================ */}
      <div className="p-4 rounded-xs bg-obsidian border border-graphite-border space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="sm:col-span-4 relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Estimate ID, Job Card, Reg, Customer..."
              className="w-full pl-9 pr-3 py-2 bg-graphite border border-graphite-border rounded-xs text-xs font-mono text-warm-white placeholder:text-muted-dark focus:outline-none focus:border-accent-gold min-h-[40px]"
            />
          </div>

          {/* Filters */}
          <div className="sm:col-span-8 flex flex-wrap items-center gap-2 justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-graphite border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent / Awaiting</option>
              <option value="VIEWED">Customer Viewed</option>
              <option value="PARTIALLY_APPROVED">Partially Approved</option>
              <option value="APPROVED">Approved</option>
              <option value="DECLINED">Declined</option>
              <option value="CONVERTED_TO_WORK">Work Authorized</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-graphite border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
            >
              <option value="ALL">All Sources</option>
              <option value="INSPECTION">From DVI Inspection</option>
              <option value="MANUAL">Manual Workshop Scope</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-graphite border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
            >
              <option value="RECENTLY_UPDATED">Sort: Recently Updated</option>
              <option value="HIGHEST_VALUE">Sort: Highest Value</option>
              <option value="OLDEST_FIRST">Sort: Oldest First</option>
            </select>

            {(kpiFilter !== 'ALL' ||
              searchQuery ||
              statusFilter !== 'ALL' ||
              sourceFilter !== 'ALL' ||
              sortBy !== 'RECENTLY_UPDATED') && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-2 bg-graphite text-muted-dark hover:text-warm-white border border-graphite-border rounded-xs text-xs font-mono uppercase flex items-center gap-1 min-h-[40px] shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">RESET FILTERS</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 8. WORKSPACE LAYOUT: 65% QUEUE / 35% DOSSIER (DESKTOP)       */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ============================================================ */}
        {/* 11. LEFT ESTIMATE QUEUE (65% on LG)                         */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-muted px-1">
            <span>
              SHOWING <strong className="text-warm-white">{filteredEstimates.length}</strong> ESTIMATES
            </span>
            {kpiFilter !== 'ALL' && (
              <span className="text-accent-gold font-bold">
                Filtered by: {kpiFilter}
              </span>
            )}
          </div>

          {filteredEstimates.length === 0 ? (
            <div className="p-8 rounded-xs bg-graphite/20 border border-graphite-border text-center space-y-3">
              <Calculator className="w-8 h-8 text-muted mx-auto opacity-50" />
              <div className="text-sm font-bold text-warm-white uppercase">
                No Estimates Found
              </div>
              <p className="text-xs text-muted max-w-sm mx-auto">
                No commercial estimate records match the current filter criteria. Reset filters or create a new estimate.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 bg-graphite border border-graphite-border rounded-xs text-xs font-mono text-warm-white uppercase hover:border-accent-gold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredEstimates.map((est) => {
                const isSelected = activeEstimate?.id === est.id;
                const config = STATUS_CONFIG[est.status] || STATUS_CONFIG.DRAFT;
                const approvedCount = est.items.filter((i) => i.approval_status === 'APPROVED').length;
                const declinedCount = est.items.filter((i) => i.approval_status === 'DECLINED').length;

                return (
                  <div
                    key={est.id}
                    onClick={() => {
                      setSelectedEstimateId(est.id);
                      setMobileDossierOpen(true);
                    }}
                    className={`p-4 rounded-xs border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'border-accent-gold bg-obsidian ring-1 ring-accent-gold/50 shadow-md'
                        : 'border-graphite-border bg-graphite/30 hover:bg-graphite/60 hover:border-graphite-border/80'
                    }`}
                  >
                    {/* ROW 1: ESTIMATE ID, JOB CARD ID, STATUS */}
                    <div className="flex items-center justify-between gap-2 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-warm-white">
                          {est.estimate_number}
                        </span>
                        <span className="text-muted-dark">·</span>
                        <span className="text-muted text-[11px]">
                          {est.job_card_id || est.job_id}
                        </span>
                        {est.revision_number && est.revision_number > 1 && (
                          <span className="px-1.5 py-0.2 bg-zinc-800 text-[10px] text-muted rounded-xs">
                            Rev {est.revision_number}
                          </span>
                        )}
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider border ${config.badgeClass}`}
                      >
                        {config.label}
                      </span>
                    </div>

                    {/* ROW 2: VEHICLE MAKE + MODEL + YEAR, REGISTRATION */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-warm-white leading-snug">
                        {est.vehicle_summary}
                      </span>
                      {est.registration && (
                        <span className="font-mono text-xs text-accent-gold font-bold shrink-0">
                          {est.registration}
                        </span>
                      )}
                    </div>

                    {/* ROW 3: CUSTOMER & PHONE */}
                    <div className="text-xs text-muted flex items-center gap-2">
                      <span className="text-warm-white font-medium">
                        {est.customer_name}
                      </span>
                      {est.customer_phone && (
                        <>
                          <span className="text-muted-dark">·</span>
                          <span className="font-mono text-[11px] text-muted-dark">
                            {est.customer_phone}
                          </span>
                        </>
                      )}
                    </div>

                    {/* ROW 4: SOURCE (INSPECTION / RECOMMENDATIONS) */}
                    <div className="text-[11px] font-mono text-muted-dark flex items-center gap-2">
                      {est.inspection_id ? (
                        <span className="text-purple-400 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Origin: {est.inspection_id} ({est.items.length} items)
                        </span>
                      ) : (
                        <span className="text-muted">Source: Manual Scope Preparation</span>
                      )}
                    </div>

                    {/* ROW 5: ADVISOR */}
                    <div className="text-[11px] font-mono text-muted flex items-center justify-between pt-1 border-t border-graphite-border/40">
                      <span>Advisor: <strong className="text-warm-white">{est.advisor_name || 'Rohan Deshmukh'}</strong></span>
                      <span>Valid Until: {new Date(est.validity_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>

                    {/* ROW 6: COMMERCIAL SUMMARY */}
                    <div className="flex items-center justify-between font-mono text-xs pt-1">
                      <div className="flex items-center gap-2 text-muted text-[11px]">
                        <span>{est.items.length} line items</span>
                        {approvedCount > 0 && (
                          <span className="text-emerald-400 font-bold">
                            · {approvedCount} Approved
                          </span>
                        )}
                        {declinedCount > 0 && (
                          <span className="text-red-400">
                            · {declinedCount} Declined
                          </span>
                        )}
                      </div>

                      <span className="text-base font-bold text-warm-white font-mono">
                        ₹{est.total.toLocaleString()}
                      </span>
                    </div>

                    {/* ROW 7: CUSTOMER DECISION & PRIMARY ACTION */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-muted pt-1 border-t border-graphite-border/40">
                      <span className="capitalize">
                        Decision:{' '}
                        <strong
                          className={
                            est.status === 'APPROVED' || est.status === 'CONVERTED_TO_WORK'
                              ? 'text-emerald-400'
                              : est.status === 'PARTIALLY_APPROVED'
                              ? 'text-amber-400'
                              : est.status === 'DECLINED'
                              ? 'text-red-400'
                              : 'text-warm-white'
                          }
                        >
                          {est.status === 'SENT'
                            ? 'Awaiting customer review'
                            : est.status === 'VIEWED'
                            ? 'Customer viewed quote'
                            : est.status.replace('_', ' ')}
                        </strong>
                      </span>

                      <span className="text-accent-gold font-bold hover:underline">
                        OPEN ESTIMATE →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 13. RIGHT ESTIMATE DOSSIER (35% on LG / Full-screen Mobile)  */}
        {/* ============================================================ */}
        <div
          className={`lg:col-span-4 transition-all ${
            mobileDossierOpen
              ? 'fixed inset-0 z-50 bg-obsidian p-4 overflow-y-auto block lg:relative lg:inset-auto lg:p-0 lg:bg-transparent lg:z-auto'
              : 'hidden lg:block'
          }`}
        >
          {activeEstimate ? (
            <div className="p-5 rounded-xs bg-graphite/40 border border-graphite-border space-y-6">
              
              {/* Mobile Back Button */}
              <div className="flex lg:hidden items-center justify-between pb-3 border-b border-graphite-border">
                <button
                  onClick={() => setMobileDossierOpen(false)}
                  className="px-3 py-1.5 bg-graphite border border-graphite-border text-xs font-mono uppercase text-warm-white flex items-center gap-1.5 min-h-[44px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>BACK TO ESTIMATES</span>
                </button>
                <span className="font-mono text-xs font-bold text-accent-gold">
                  {activeEstimate.estimate_number}
                </span>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* 14. ESTIMATE HEADER                                          */}
              {/* ------------------------------------------------------------ */}
              <div className="space-y-3 pb-4 border-b border-graphite-border">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block font-bold">
                      ESTIMATE DOSSIER
                    </span>
                    <h2 className="text-xl font-mono font-bold text-warm-white">
                      {activeEstimate.estimate_number}
                    </h2>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider border ${
                      STATUS_CONFIG[activeEstimate.status]?.badgeClass
                    }`}
                  >
                    {STATUS_CONFIG[activeEstimate.status]?.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xs bg-obsidian border border-graphite-border">
                    <span className="text-[10px] text-muted uppercase block">Created</span>
                    <span className="text-warm-white font-bold">
                      {new Date(activeEstimate.created_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="p-2 rounded-xs bg-obsidian border border-graphite-border">
                    <span className="text-[10px] text-muted uppercase block">Valid Until</span>
                    <span className="text-warm-white font-bold">
                      {new Date(activeEstimate.validity_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* State-Aware Primary Actions */}
                <div className="space-y-2 pt-1">
                  {activeEstimate.status === 'DRAFT' && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSendEstimate}
                        className="flex-1 py-2.5 px-3 bg-accent-gold text-obsidian rounded-xs text-xs font-bold font-mono uppercase tracking-wider hover:bg-white transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>SEND TO CUSTOMER →</span>
                      </button>
                    </div>
                  )}

                  {(activeEstimate.status === 'SENT' ||
                    activeEstimate.status === 'VIEWED' ||
                    activeEstimate.status === 'APPROVED' ||
                    activeEstimate.status === 'PARTIALLY_APPROVED') && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onOpenQuoteToken(activeEstimate.public_token)}
                        className="flex-1 py-2.5 px-3 bg-graphite border border-accent-gold/50 text-accent-gold hover:bg-accent-gold hover:text-obsidian rounded-xs text-xs font-mono font-bold uppercase transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>OPEN CUSTOMER VIEW →</span>
                      </button>
                      <button
                        type="button"
                        id="btn-advisor-print-quote"
                        onClick={() => {
                          onOpenQuoteToken(activeEstimate.public_token);
                          setTimeout(() => window.print(), 300);
                        }}
                        className="py-2.5 px-3 bg-graphite border border-graphite-border hover:border-accent-gold text-muted hover:text-warm-white rounded-xs text-xs font-mono font-bold uppercase transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                        title="Print this estimate"
                      >
                        <Printer className="w-3.5 h-3.5 text-accent-gold" />
                        <span>PRINT</span>
                      </button>
                    </div>
                  )}

                  {/* If Approved or Partially Approved: Authorize Button */}
                  {(activeEstimate.status === 'APPROVED' ||
                    activeEstimate.status === 'PARTIALLY_APPROVED') && (
                    <button
                      onClick={() => setAuthorizeModalOpen(true)}
                      className="w-full py-2.5 px-3 bg-emerald-500 text-obsidian rounded-xs text-xs font-bold font-mono uppercase tracking-wider hover:bg-emerald-400 transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>AUTHORIZE APPROVED WORK →</span>
                    </button>
                  )}

                  {activeEstimate.status === 'CONVERTED_TO_WORK' && (
                    <button
                      onClick={() => {
                        if (onOpenJob) onOpenJob(activeEstimate.job_card_id || activeEstimate.job_id);
                        if (onNavigateModule) onNavigateModule('jobs');
                      }}
                      className="w-full py-2.5 px-3 bg-graphite border border-emerald-500 text-emerald-400 rounded-xs text-xs font-bold font-mono uppercase hover:bg-emerald-500 hover:text-obsidian transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>OPEN JOB CARD ({activeEstimate.job_card_id || activeEstimate.job_id}) →</span>
                    </button>
                  )}

                  {/* Create Revision Button for any finalized state */}
                  {activeEstimate.status !== 'DRAFT' &&
                    activeEstimate.status !== 'CONVERTED_TO_WORK' && (
                      <button
                        onClick={() => setRevisionModalOpen(true)}
                        className="w-full py-2 px-3 bg-graphite border border-graphite-border hover:border-muted text-muted hover:text-warm-white rounded-xs text-xs font-mono uppercase transition-colors flex items-center justify-center gap-1.5 min-h-[38px]"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>REVISE ESTIMATE</span>
                      </button>
                    )}
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* 15. TRACEABILITY PANEL (Lineage Breadcrumb)                  */}
              {/* ------------------------------------------------------------ */}
              <div className="p-3.5 rounded-xs bg-obsidian border border-graphite-border space-y-2 text-xs font-mono">
                <span className="text-[10px] uppercase text-muted-dark font-bold tracking-wider block">
                  CANONICAL LIFECYCLE LINEAGE
                </span>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  {activeEstimate.lead_id && (
                    <>
                      <button
                        onClick={() => onNavigateModule && onNavigateModule('leads')}
                        title={`Lead: ${leads.find(l => l.id === activeEstimate.lead_id)?.customer_name || 'Enquiry record'}`}
                        className="text-muted hover:text-accent-gold underline"
                      >
                        {activeEstimate.lead_id}
                      </button>
                      <span className="text-muted-dark">→</span>
                    </>
                  )}

                  {activeEstimate.appointment_id && (
                    <>
                      <button
                        onClick={() => onNavigateModule && onNavigateModule('appointments')}
                        title={`Appointment: ${appointments.find(a => a.id === activeEstimate.appointment_id)?.service_name || 'Booking'}`}
                        className="text-muted hover:text-accent-gold underline"
                      >
                        {activeEstimate.appointment_id}
                      </button>
                      <span className="text-muted-dark">→</span>
                    </>
                  )}

                  <button
                    onClick={() => {
                      if (onOpenJob) onOpenJob(activeEstimate.job_card_id || activeEstimate.job_id);
                      if (onNavigateModule) onNavigateModule('jobs');
                    }}
                    className="text-accent-gold font-bold hover:underline"
                  >
                    {activeEstimate.job_card_id || activeEstimate.job_id}
                  </button>

                  {activeEstimate.inspection_id && (
                    <>
                      <span className="text-muted-dark">→</span>
                      <button
                        onClick={() => onNavigateModule && onNavigateModule('inspections')}
                        title={activeInspection ? `${activeInspection.findings.length} findings recorded` : 'Digital Inspection'}
                        className="text-purple-400 font-bold hover:underline"
                      >
                        {activeEstimate.inspection_id}
                      </button>
                    </>
                  )}

                  <span className="text-muted-dark">→</span>
                  <span className="text-warm-white font-bold">
                    {activeEstimate.estimate_number}
                  </span>
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* 16. CUSTOMER & VEHICLE CONTEXT                              */}
              {/* ------------------------------------------------------------ */}
              <div className="p-4 rounded-xs bg-obsidian border border-graphite-border space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-graphite-border/50">
                  <span className="text-[10px] uppercase tracking-wider text-muted-dark font-bold">
                    VEHICLE & CUSTOMER
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (onOpenJob) onOpenJob(activeEstimate.job_card_id || activeEstimate.job_id);
                        if (onNavigateModule) onNavigateModule('jobs');
                      }}
                      className="text-[10px] text-accent-gold hover:underline uppercase"
                    >
                      OPEN JOB CARD →
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-sm font-bold text-warm-white block font-sans">
                    {activeEstimate.vehicle_summary}
                  </span>
                  <div className="flex items-center gap-2 text-muted">
                    <span className="text-accent-gold font-bold">
                      {activeEstimate.registration || activeJob?.registration || 'MH 02 ER 4500'}
                    </span>
                    <span>·</span>
                    <span>
                      {(activeEstimate.odometer || activeJob?.odometer)?.toLocaleString()} km
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-graphite-border/40 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-dark block text-[10px]">Customer</span>
                    <span className="text-warm-white font-medium">{activeEstimate.customer_name}</span>
                    <span className="text-muted block text-[10px]">{activeEstimate.customer_phone}</span>
                  </div>
                  <div>
                    <span className="text-muted-dark block text-[10px]">Service Advisor</span>
                    <span className="text-warm-white font-medium">{activeEstimate.advisor_name || 'Rohan Deshmukh'}</span>
                    <span className="text-muted block text-[10px]">Tech: {activeEstimate.technician_name || activeJob?.technician || 'Arjun Sharma'}</span>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* 17. WORK SCOPE (Grouped by Labour, Parts, Consumables)       */}
              {/* ------------------------------------------------------------ */}
              <div className="space-y-3 pb-4 border-b border-graphite-border">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted block font-bold">
                    ITEMIZED WORK SCOPE ({activeEstimate.items.length})
                  </span>
                  <button
                    onClick={() => setAddItemModalOpen(true)}
                    className="px-2 py-1 bg-graphite border border-accent-gold/40 text-accent-gold hover:bg-accent-gold hover:text-obsidian rounded-xs text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> + ADD LINE ITEM
                  </button>
                </div>

                {/* Grouped lists */}
                {(['Labour', 'Parts', 'Consumables'] as EstimateItemType[]).map((grp) => {
                  const grpItems = activeEstimate.items.filter((i) => i.type === grp);
                  if (grpItems.length === 0) return null;

                  return (
                    <div key={grp} className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase text-muted-dark pb-0.5 border-b border-graphite-border/40">
                        <span className="font-bold text-accent-gold">{grp}</span>
                        <span>{grpItems.length} items</span>
                      </div>

                      <div className="space-y-2">
                        {grpItems.map((item) => {
                          const isUnpriced = !item.is_price_configured || item.unit_price === 0;
                          return (
                            <div
                              key={item.id}
                              className="p-3 rounded-xs bg-obsidian border border-graphite-border space-y-2 font-mono text-xs"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="font-bold text-warm-white block font-sans text-xs">
                                    {item.description}
                                  </span>
                                  {item.source_recommendation && (
                                    <span className="text-[10px] text-purple-400 block mt-0.5">
                                      FROM INSPECTION: {item.source_recommendation}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-muted-dark block">
                                    {item.quantity} {item.unit || 'unit'} × ₹{item.unit_price.toLocaleString()}
                                  </span>
                                </div>

                                <div className="text-right shrink-0">
                                  {isUnpriced ? (
                                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-xs text-[9px] font-bold uppercase block">
                                      PRICE NOT CONFIGURED
                                    </span>
                                  ) : (
                                    <span className="font-bold text-warm-white text-xs block">
                                      ₹{item.line_total.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Approval Status Toggle on Dossier */}
                              <div className="flex items-center justify-between pt-1.5 border-t border-graphite-border/40 text-[10px]">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-muted-dark">Decision:</span>
                                  <button
                                    onClick={() => handleUpdateItemApproval(item.id, 'APPROVED')}
                                    className={`px-1.5 py-0.5 rounded-xs transition-colors ${
                                      item.approval_status === 'APPROVED'
                                        ? 'bg-emerald-500 text-obsidian font-bold'
                                        : 'bg-graphite text-muted hover:text-emerald-400'
                                    }`}
                                  >
                                    ✓ APPROVED
                                  </button>
                                  <button
                                    onClick={() => handleUpdateItemApproval(item.id, 'DECLINED')}
                                    className={`px-1.5 py-0.5 rounded-xs transition-colors ${
                                      item.approval_status === 'DECLINED'
                                        ? 'bg-red-500 text-white font-bold'
                                        : 'bg-graphite text-muted hover:text-red-400'
                                    }`}
                                  >
                                    × DECLINED
                                  </button>
                                </div>

                                <button
                                  onClick={() => handleRemoveLineItem(item.id)}
                                  className="text-muted-dark hover:text-red-400 p-0.5"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ------------------------------------------------------------ */}
              {/* 20. COMMERCIAL CALCULATION PANEL (Deterministic, No Fake Tax)*/}
              {/* ------------------------------------------------------------ */}
              <div className="p-4 rounded-xs bg-obsidian border border-graphite-border space-y-2 font-mono text-xs">
                <span className="text-[10px] uppercase text-muted-dark font-bold tracking-wider block">
                  COMMERCIAL CALCULATION
                </span>

                <div className="flex justify-between text-muted text-[11px]">
                  <span>Labour Subtotal</span>
                  <span className="text-warm-white">₹{activeLabourTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted text-[11px]">
                  <span>OEM Parts Subtotal</span>
                  <span className="text-warm-white">₹{activePartsTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted text-[11px]">
                  <span>Workshop Consumables</span>
                  <span className="text-warm-white">₹{activeConsumablesTotal.toLocaleString()}</span>
                </div>

                <div className="pt-2 border-t border-graphite-border flex justify-between items-center">
                  <span className="font-bold text-warm-white uppercase">Grand Total Scope</span>
                  <span className="text-base font-bold text-accent-gold">
                    ₹{activeGrandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* 21. CUSTOMER DECISION SUMMARY                                */}
              {/* ------------------------------------------------------------ */}
              <div className="p-3.5 rounded-xs bg-obsidian border border-graphite-border space-y-2 font-mono text-xs">
                <span className="text-[10px] uppercase text-muted-dark font-bold tracking-wider block">
                  CUSTOMER DECISION BREAKDOWN
                </span>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xs bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-muted-dark block text-[10px]">Approved Scope</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      ₹{(activeEstimate.approved_total || 0).toLocaleString()}
                    </span>
                    <span className="text-muted text-[10px] block">
                      {activeEstimate.items.filter((i) => i.approval_status === 'APPROVED').length} items approved
                    </span>
                  </div>

                  <div className="p-2 rounded-xs bg-red-500/10 border border-red-500/20">
                    <span className="text-muted-dark block text-[10px]">Declined Scope</span>
                    <span className="text-red-400 font-bold text-sm">
                      ₹{(activeEstimate.declined_total || 0).toLocaleString()}
                    </span>
                    <span className="text-muted text-[10px] block">
                      {activeEstimate.items.filter((i) => i.approval_status === 'DECLINED').length} items declined
                    </span>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* 24. INTERNAL NOTES VS CUSTOMER-FACING NOTES                  */}
              {/* ------------------------------------------------------------ */}
              <div className="space-y-3 text-xs font-mono">
                {/* Internal Staff Notes */}
                <div className="p-3 rounded-xs bg-obsidian border border-zinc-700/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 font-bold text-[10px] uppercase">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>INTERNAL STAFF NOTES (NOT VISIBLE TO CUSTOMER)</span>
                  </div>
                  <p className="text-muted text-[11px] leading-relaxed">
                    {activeEstimate.internal_notes || 'No internal remarks entered.'}
                  </p>
                </div>

                {/* Customer Facing Notes */}
                <div className="p-3 rounded-xs bg-obsidian border border-graphite-border space-y-1">
                  <span className="text-[10px] text-accent-gold font-bold uppercase block">
                    CUSTOMER-FACING NOTES
                  </span>
                  <p className="text-warm-white text-[11px] leading-relaxed">
                    {activeEstimate.customer_notes || 'Standard OEM replacement warranty applies.'}
                  </p>
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* 23. CUSTOMER COMMUNICATION (WhatsApp Manual Pre-filled link)  */}
              {/* ------------------------------------------------------------ */}
              <div className="p-3.5 rounded-xs bg-obsidian border border-graphite-border space-y-2 font-mono text-xs">
                <span className="text-[10px] uppercase text-muted-dark font-bold tracking-wider block">
                  CUSTOMER TRANSMISSION
                </span>
                <p className="text-muted text-[11px]">
                  Transmit digital quote link with pre-filled message (opens WhatsApp deep link).
                </p>

                <button
                  onClick={handleGenerateWhatsAppLink}
                  className="w-full py-2 px-3 bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xs text-xs font-mono uppercase font-bold flex items-center justify-center gap-1.5 min-h-[40px] transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>TRANSMIT VIA WHATSAPP (PRE-FILLED)</span>
                </button>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* 28. AUDIT TIMELINE                                           */}
              {/* ------------------------------------------------------------ */}
              <div className="space-y-2 pt-2 border-t border-graphite-border font-mono text-xs">
                <span className="text-[10px] uppercase text-muted block font-bold tracking-wider">
                  COMMERCIAL AUDIT TIMELINE
                </span>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(activeEstimate.timeline || []).map((tl) => (
                    <div
                      key={tl.id}
                      className="p-2.5 rounded-xs bg-obsidian border border-graphite-border space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-warm-white font-bold">{tl.event}</span>
                        <span className="text-muted-dark">
                          {new Date(tl.timestamp).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted block">{tl.actor}</span>
                      {tl.notes && (
                        <p className="text-[10px] text-muted-dark font-light">{tl.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 rounded-xs bg-graphite/20 border border-graphite-border text-center space-y-2">
              <Calculator className="w-8 h-8 text-muted mx-auto opacity-50" />
              <span className="text-xs font-mono text-muted uppercase block">
                Select an estimate to inspect dossier
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: + NEW ESTIMATE (From Inspection or Job Card)        */}
      {/* ============================================================ */}
      {newEstimateModalOpen && (
        <MobileFormSheet
          isOpen={newEstimateModalOpen}
          onClose={() => setNewEstimateModalOpen(false)}
          eyebrow="NEW ESTIMATE"
          title="INITIATE COMMERCIAL ESTIMATE"
          primaryActionLabel="Create Estimate →"
          onPrimaryAction={() => {
            const form = document.getElementById('new-estimate-form') as HTMLFormElement;
            if (form) form.requestSubmit();
          }}
          primaryActionVariant="gold"
          maxWidthClass="sm:max-w-lg"
        >
          <form id="new-estimate-form" onSubmit={handleCreateEstimateSubmit} className="space-y-4 font-mono text-xs">
            {/* Origin Selection */}
            <div className="space-y-1">
              <label className="text-muted uppercase block text-[10px]">Commercial Origin *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCreationOrigin('INSPECTION')}
                  className={`py-2 px-3 rounded-xs text-xs font-mono uppercase font-bold border transition-colors min-h-[44px] cursor-pointer ${
                    creationOrigin === 'INSPECTION'
                      ? 'bg-accent-gold text-obsidian border-accent-gold'
                      : 'bg-obsidian text-muted border-graphite-border'
                  }`}
                >
                  From Inspection
                </button>
                <button
                  type="button"
                  onClick={() => setCreationOrigin('JOB')}
                  className={`py-2 px-3 rounded-xs text-xs font-mono uppercase font-bold border transition-colors min-h-[44px] cursor-pointer ${
                    creationOrigin === 'JOB'
                      ? 'bg-accent-gold text-obsidian border-accent-gold'
                      : 'bg-obsidian text-muted border-graphite-border'
                  }`}
                >
                  Manual Scope
                </button>
              </div>
            </div>

            {/* Source Job Card */}
            <div className="space-y-1">
              <label className="text-muted uppercase block text-[10px]">Source Job Card *</label>
              <div className="relative">
                <select
                  value={selectedInspJobId}
                  onChange={(e) => setSelectedInspJobId(e.target.value)}
                  className="w-full appearance-none bg-obsidian border border-graphite-border rounded-xs px-3 py-2 pr-10 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.id} · {j.vehicle_summary} ({j.customer_name})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* If From Inspection: Select Findings */}
            {creationOrigin === 'INSPECTION' && (
              <div className="space-y-2 p-3 rounded-xs bg-obsidian border border-graphite-border">
                <span className="text-[10px] text-accent-gold uppercase block font-bold">
                  Select Inspection Recommendations to Transfer
                </span>

                {(() => {
                  const targetInsp = Object.values(inspections).find(
                    (i) => i.job_id === selectedInspJobId || i.id === selectedInspJobId
                  );
                  if (!targetInsp || !targetInsp.findings || targetInsp.findings.length === 0) {
                    return (
                      <p className="text-[11px] text-muted font-light">
                        No findings recorded on {selectedInspJobId} yet. Default draft lines will be initialized.
                      </p>
                    );
                  }

                  return (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {targetInsp.findings.map((f) => (
                        <label
                          key={f.id}
                          className="flex items-start gap-2 p-2.5 rounded-xs bg-graphite/40 border border-graphite-border/60 cursor-pointer hover:bg-graphite min-h-[44px]"
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(selectedFindingCheckboxes[f.id])}
                            onChange={(e) =>
                              setSelectedFindingCheckboxes({
                                ...selectedFindingCheckboxes,
                                [f.id]: e.target.checked,
                              })
                            }
                            className="mt-1 rounded-xs accent-accent-gold"
                          />
                          <div className="space-y-0.5">
                            <span className="text-warm-white font-medium block">
                              {f.recommendation || f.finding}
                            </span>
                            <span className="text-[10px] text-muted-dark block">
                              {f.category} ({f.component || 'Component'}) · Priority: {f.priority || 'NORMAL'}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Service Advisor */}
            <div className="space-y-1">
              <label className="text-muted uppercase block text-[10px]">Service Advisor *</label>
              <input
                type="text"
                required
                value={advisorInput}
                onChange={(e) => setAdvisorInput(e.target.value)}
                className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
              />
            </div>
          </form>
        </MobileFormSheet>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: + ADD LINE ITEM                                     */}
      {/* ============================================================ */}
      <MobileFormSheet
        isOpen={addItemModalOpen}
        onClose={() => setAddItemModalOpen(false)}
        title="+ Add Line Item"
        eyebrow="SCOPE SPECIFICATION"
        maxWidth="max-w-lg"
        footer={
          <div className="flex gap-2 w-full font-mono text-xs">
            <button
              type="button"
              onClick={() => setAddItemModalOpen(false)}
              className="flex-1 min-h-[44px] py-2.5 px-3 bg-graphite border border-graphite-border text-warm-white rounded-xs uppercase font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-line-item-form"
              className="flex-1 min-h-[44px] py-2.5 px-3 bg-accent-gold text-obsidian font-bold rounded-xs uppercase hover:bg-white"
            >
              Add Item
            </button>
          </div>
        }
      >
        <form id="add-line-item-form" onSubmit={handleCreateNewItem} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-muted uppercase block text-[10px] font-bold">Type *</label>
              <div className="relative">
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value as EstimateItemType)}
                  className="w-full min-h-[44px] bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white appearance-none pr-10 focus:border-accent-gold focus:outline-none"
                >
                  <option value="Labour">Labour</option>
                  <option value="Parts">Parts</option>
                  <option value="Consumables">Consumables</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-muted uppercase block text-[10px] font-bold">Category</label>
              <input
                type="text"
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                placeholder="e.g. Brakes / Suspension"
                className="w-full min-h-[44px] bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:border-accent-gold focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-muted uppercase block text-[10px] font-bold">Description *</label>
            <input
              type="text"
              required
              value={itemDesc}
              onChange={(e) => setItemDesc(e.target.value)}
              placeholder="e.g. Front Brake Pad Replacement"
              className="w-full min-h-[44px] bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:border-accent-gold focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-muted uppercase block text-[10px] font-bold">Qty *</label>
              <input
                type="number"
                min="1"
                required
                value={itemQty}
                onChange={(e) => setItemQty(Number(e.target.value))}
                className="w-full min-h-[44px] bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white text-center focus:border-accent-gold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-muted uppercase block text-[10px] font-bold">Unit</label>
              <input
                type="text"
                value={itemUnit}
                onChange={(e) => setItemUnit(e.target.value)}
                placeholder="job/set"
                className="w-full min-h-[44px] bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white text-center focus:border-accent-gold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-muted uppercase block text-[10px] font-bold">Rate (₹) *</label>
              <input
                type="number"
                required
                step="100"
                value={itemUnitPrice}
                onChange={(e) => setItemUnitPrice(Number(e.target.value))}
                className="w-full min-h-[44px] bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white text-right focus:border-accent-gold focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-muted uppercase block text-[10px] font-bold">Internal Note (Staff Only)</label>
            <input
              type="text"
              value={itemInternalNote}
              onChange={(e) => setItemInternalNote(e.target.value)}
              placeholder="Visible only to workshop staff"
              className="w-full min-h-[44px] bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:border-accent-gold focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="cust_vis"
              checked={itemCustomerVisible}
              onChange={(e) => setItemCustomerVisible(e.target.checked)}
              className="w-4 h-4 rounded-xs accent-accent-gold cursor-pointer"
            />
            <label htmlFor="cust_vis" className="text-muted text-xs cursor-pointer select-none">
              Customer Visible on Quote Portal
            </label>
          </div>
        </form>
      </MobileFormSheet>

      {/* ============================================================ */}
      {/* MODAL 3: AUTHORIZE APPROVED WORK CONFIRMATION                */}
      {/* ============================================================ */}
      {activeEstimate && (
        <MobileFormSheet
          isOpen={authorizeModalOpen}
          onClose={() => setAuthorizeModalOpen(false)}
          title="Transfer to Workshop Execution"
          eyebrow="AUTHORIZE APPROVED WORK"
          maxWidth="max-w-md"
          footer={
            <div className="flex gap-2 w-full font-mono text-xs">
              <button
                type="button"
                onClick={() => setAuthorizeModalOpen(false)}
                className="flex-1 min-h-[44px] py-2.5 px-3 bg-graphite border border-graphite-border text-warm-white rounded-xs uppercase font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAuthorization}
                className="flex-1 min-h-[44px] py-2.5 px-3 bg-emerald-500 text-obsidian font-bold rounded-xs uppercase hover:bg-emerald-400"
              >
                Authorize Work →
              </button>
            </div>
          }
        >
          <div className="space-y-4 font-mono text-xs">
            <p className="text-muted text-xs leading-relaxed">
              This action authorizes the customer-approved scope for physical workshop execution on Job Card{' '}
              <strong className="text-warm-white">{activeEstimate.job_card_id || activeEstimate.job_id}</strong>.
            </p>

            <div className="p-3.5 rounded-xs bg-obsidian border border-graphite-border space-y-2">
              <div className="flex justify-between text-muted text-xs">
                <span>Customer:</span>
                <span className="text-warm-white font-bold">{activeEstimate.customer_name}</span>
              </div>
              <div className="flex justify-between text-muted text-xs">
                <span>Vehicle:</span>
                <span className="text-warm-white font-bold">{activeEstimate.vehicle_summary}</span>
              </div>
              <div className="flex justify-between text-muted text-xs">
                <span>Approved Line Items:</span>
                <span className="text-emerald-400 font-bold">
                  {activeEstimate.items.filter((i) => i.approval_status === 'APPROVED').length} items
                </span>
              </div>
              <div className="flex justify-between text-muted pt-2 border-t border-graphite-border text-xs">
                <span>Authorized Value:</span>
                <span className="text-accent-gold font-bold text-sm">
                  ₹{(activeEstimate.approved_total || activeEstimate.total).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </MobileFormSheet>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: REVISE ESTIMATE REASON                              */}
      {/* ============================================================ */}
      {activeEstimate && (
        <MobileFormSheet
          isOpen={revisionModalOpen}
          onClose={() => setRevisionModalOpen(false)}
          title={`Create Revision ${(activeEstimate.revision_number || 1) + 1}`}
          eyebrow="COMMERCIAL REVISION"
          maxWidth="max-w-md"
          footer={
            <div className="flex gap-2 w-full font-mono text-xs">
              <button
                type="button"
                onClick={() => setRevisionModalOpen(false)}
                className="flex-1 min-h-[44px] py-2.5 px-3 bg-graphite border border-graphite-border text-warm-white rounded-xs uppercase font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="revision-form"
                className="flex-1 min-h-[44px] py-2.5 px-3 bg-accent-gold text-obsidian font-bold rounded-xs uppercase hover:bg-white"
              >
                Create Revision
              </button>
            </div>
          }
        >
          <form id="revision-form" onSubmit={handleSubmitRevision} className="space-y-4 font-mono text-xs">
            <p className="text-muted text-xs leading-relaxed">
              Creating a revision preserves prior audit history and unlocks the scope editor for adjustment.
            </p>

            <div className="space-y-1.5">
              <label className="text-muted uppercase block text-[10px] font-bold">Reason for Revision *</label>
              <textarea
                rows={3}
                required
                value={revisionReason}
                onChange={(e) => setRevisionReason(e.target.value)}
                placeholder="e.g. Customer requested removing rear brake discs; revised labour quotation."
                className="w-full bg-obsidian border border-graphite-border rounded-xs p-3 text-xs font-mono text-warm-white focus:border-accent-gold focus:outline-none"
              />
            </div>
          </form>
        </MobileFormSheet>
      )}
    </div>
  );
};
