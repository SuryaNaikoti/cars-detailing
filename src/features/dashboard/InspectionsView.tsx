import React, { useState, useMemo, useEffect } from 'react';
import type {
  InspectionRecord,
  InspectionFinding,
  InspectionEvidence,
  InspectionCondition,
  InspectionStatus,
  FindingPriority,
  JobCard,
  EstimateRecord,
  TechnicianRecord,
} from '../../types';
import {
  DVI_CATEGORIES,
  generateDefaultDVIItems,
  addFindingToEstimate,
} from '../../lib/demoStore';
import {
  Search,
  Plus,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  X,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  ClipboardList,
  Calculator,
  AlertTriangle,
  AlertOctagon,
  HelpCircle,
  Camera,
  Share2,
  Save,
  Check,
  Lock,
} from 'lucide-react';

export interface InspectionsViewProps {
  inspections: Record<string, InspectionRecord>;
  jobs: JobCard[];
  estimates?: Record<string, EstimateRecord>;
  technicians?: TechnicianRecord[];
  onSaveInspection: (inspection: InspectionRecord) => void;
  onCreateInspection?: (jobId: string, technicianName?: string) => InspectionRecord | null;
  onOpenJob?: (jobId: string) => void;
  onNavigateModule?: (module: any) => void;
  onOpenCustomerView?: (token: string) => void;
}

// Canonical Condition display helper
const CONDITION_META: Record<
  InspectionCondition,
  { label: string; bg: string; text: string; border: string; icon: React.FC<{ className?: string }> }
> = {
  GOOD: {
    label: 'Good',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    icon: CheckCircle2,
  },
  ATTENTION: {
    label: 'Attention',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    icon: AlertTriangle,
  },
  CRITICAL: {
    label: 'Critical',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30',
    icon: AlertOctagon,
  },
  NOT_INSPECTED: {
    label: 'Not Inspected',
    bg: 'bg-graphite/60',
    text: 'text-muted',
    border: 'border-graphite-border',
    icon: HelpCircle,
  },
  NOT_APPLICABLE: {
    label: 'N/A',
    bg: 'bg-graphite/40',
    text: 'text-muted-dark',
    border: 'border-graphite-border',
    icon: Lock,
  },
};

const STATUS_DISPLAY_MAP: Record<InspectionStatus, string> = {
  DRAFT: 'Draft',
  IN_PROGRESS: 'Inspection In Progress',
  COMPLETED: 'Inspection Complete',
  CUSTOMER_SHARED: 'Shared With Customer',
  ARCHIVED: 'Archived',
};

const STATUS_BADGE_MAP: Record<InspectionStatus, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: 'bg-graphite/70', text: 'text-muted', border: 'border-graphite-border' },
  IN_PROGRESS: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  COMPLETED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  CUSTOMER_SHARED: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  ARCHIVED: { bg: 'bg-graphite/40', text: 'text-muted-dark', border: 'border-graphite-border' },
};

export const InspectionsView: React.FC<InspectionsViewProps> = ({
  inspections,
  jobs,
  estimates = {},
  technicians = [],
  onSaveInspection,
  onCreateInspection,
  onOpenJob,
  onNavigateModule,
  onOpenCustomerView,
}) => {
  const inspectionList = useMemo(() => Object.values(inspections), [inspections]);

  // Selected Inspection ID
  const [selectedInspectionId, setSelectedInspectionId] = useState<string>(
    inspectionList[0]?.id || 'INS-3047'
  );

  // Mobile drawer state
  const [mobileDossierOpen, setMobileDossierOpen] = useState(false);

  // Active KPI Filter (Clickable with toggle-to-clear)
  const [kpiFilter, setKpiFilter] = useState<string>('ALL');

  // Search query & multi-dimension filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [techFilter, setTechFilter] = useState<string>('ALL');
  const [advisorFilter, setAdvisorFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [estimateStatusFilter, setEstimateStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('RECENTLY_UPDATED');

  // Modals
  const [newInspectionModalOpen, setNewInspectionModalOpen] = useState(false);
  const [addFindingModalOpen, setAddFindingModalOpen] = useState(false);
  const [attachEvidenceModalOpen, setAttachEvidenceModalOpen] = useState(false);
  const [reviewRecommendationsModalOpen, setReviewRecommendationsModalOpen] = useState(false);
  const [customerPreviewModalOpen, setCustomerPreviewModalOpen] = useState(false);

  // Finding modal form state
  const [targetCategory, setTargetCategory] = useState<string>('3. BRAKES');
  const [targetComponent, setTargetComponent] = useState<string>('Front Brake Pads & Rotors');
  const [targetCondition, setTargetCondition] = useState<InspectionCondition>('ATTENTION');
  const [targetFinding, setTargetFinding] = useState<string>('');
  const [targetRecommendation, setTargetRecommendation] = useState<string>('');
  const [targetPriority, setTargetPriority] = useState<FindingPriority>('HIGH');
  const [targetAddToEstimate, setTargetAddToEstimate] = useState<boolean>(true);
  const [targetPhotoUrl, setTargetPhotoUrl] = useState<string>('');
  const [targetCaption, setTargetCaption] = useState<string>('');

  // New Inspection Modal State
  const [newInspJobId, setNewInspJobId] = useState<string>(jobs[0]?.id || '');
  const [newInspTech, setNewInspTech] = useState<string>(jobs[0]?.technician || 'Arjun Sharma');

  // Active Inspection & Associated Job Card
  const activeInspection = useMemo(() => {
    return (
      inspectionList.find((i) => i.id === selectedInspectionId) ||
      inspectionList[0] ||
      null
    );
  }, [inspectionList, selectedInspectionId]);

  const activeJob = useMemo(() => {
    if (!activeInspection) return null;
    return jobs.find((j) => j.id === activeInspection.job_id) || null;
  }, [jobs, activeInspection]);

  const activeEstimate = useMemo(() => {
    if (!activeInspection) return null;
    return estimates[activeInspection.job_id] || null;
  }, [estimates, activeInspection]);

  // Operational KPI Calculations derived from actual inspections
  const kpiCounts = useMemo(() => {
    // Helper: is parent job active (not DELIVERED, not CANCELLED)
    const isParentJobActive = (jobId: string) => {
      const job = jobs.find((j) => j.id === jobId);
      if (!job) return true; // fallback if ad-hoc
      return job.status !== 'DELIVERED' && job.status !== 'CANCELLED';
    };

    // ACTIVE = DRAFT + IN_PROGRESS on active jobs (strictly excludes COMPLETED, CUSTOMER_SHARED, ARCHIVED, and DELIVERED jobs)
    const activeCount = inspectionList.filter(
      (i) => (i.status === 'DRAFT' || i.status === 'IN_PROGRESS') && isParentJobActive(i.job_card_id || i.job_id)
    ).length;

    const draft = inspectionList.filter(
      (i) => i.status === 'DRAFT' && isParentJobActive(i.job_card_id || i.job_id)
    ).length;

    const inProgress = inspectionList.filter(
      (i) => i.status === 'IN_PROGRESS' && isParentJobActive(i.job_card_id || i.job_id)
    ).length;

    const completed = inspectionList.filter(
      (i) => i.status === 'COMPLETED' && isParentJobActive(i.job_card_id || i.job_id)
    ).length;

    const sharedWithCustomer = inspectionList.filter(
      (i) => i.status === 'CUSTOMER_SHARED' && isParentJobActive(i.job_card_id || i.job_id)
    ).length;

    // FINDINGS REQUIRING ATTENTION = active inspection contains at least one finding whose condition/severity requires action (ATTENTION or CRITICAL)
    const findingsRequiringAttention = inspectionList
      .filter((i) => isParentJobActive(i.job_card_id || i.job_id) && i.status !== 'ARCHIVED')
      .reduce((acc, i) => {
        const critOrAtt = (i.findings || []).filter(
          (f) => f.condition === 'CRITICAL' || f.condition === 'ATTENTION'
        ).length;
        return acc + critOrAtt;
      }, 0);

    // REQUIRES ESTIMATE = inspection has one or more findings explicitly marked for estimate handoff AND not yet linked to an existing estimate line item
    const requiresEstimate = inspectionList
      .filter((i) => isParentJobActive(i.job_card_id || i.job_id) && i.status !== 'ARCHIVED')
      .filter((i) => {
        const unlinkedWork = (i.findings || []).some(
          (f) => f.add_to_estimate && !f.estimate_line_item_id && !f.estimate_id
        );
        const est = estimates[i.job_id];
        return unlinkedWork && (!est || est.status === 'DRAFT');
      }).length;

    return {
      totalActive: activeCount,
      draft,
      inProgress,
      completed,
      sharedWithCustomer,
      findingsRequiringAttention,
      requiresEstimate,
    };
  }, [inspectionList, estimates, jobs]);

  // Handle KPI Click (Toggle to clear)
  const handleKpiClick = (target: string) => {
    if (kpiFilter === target) {
      setKpiFilter('ALL');
    } else {
      setKpiFilter(target);
      setStatusFilter('ALL');
    }
  };

  // Filter & Sort Inspections Queue
  const filteredInspections = useMemo(() => {
    return inspectionList
      .filter((i) => {
        // KPI Filter
        if (kpiFilter === 'TOTAL_ACTIVE' && i.status !== 'DRAFT' && i.status !== 'IN_PROGRESS') return false;
        if (kpiFilter === 'DRAFT' && i.status !== 'DRAFT') return false;
        if (kpiFilter === 'IN_PROGRESS' && i.status !== 'IN_PROGRESS') return false;
        if (kpiFilter === 'COMPLETED' && i.status !== 'COMPLETED') return false;
        if (kpiFilter === 'SHARED' && i.status !== 'CUSTOMER_SHARED') return false;
        if (kpiFilter === 'ATTENTION') {
          const hasAtt = (i.findings || []).some(
            (f) => f.condition === 'CRITICAL' || f.condition === 'ATTENTION'
          );
          if (!hasAtt) return false;
        }
        if (kpiFilter === 'REQUIRES_ESTIMATE') {
          const unlinkedWork = (i.findings || []).some(
            (f) => f.add_to_estimate && !f.estimate_line_item_id && !f.estimate_id
          );
          const est = estimates[i.job_id];
          if (!unlinkedWork || (est && est.status !== 'DRAFT')) return false;
        }

        // Secondary status filter
        if (statusFilter !== 'ALL' && i.status !== statusFilter) return false;

        // Technician Filter
        if (techFilter !== 'ALL') {
          const tech = i.technician_name || i.inspector_name;
          if (tech !== techFilter) return false;
        }

        // Advisor Filter
        if (advisorFilter !== 'ALL') {
          if (i.advisor_name !== advisorFilter) return false;
        }

        // Severity Filter
        if (severityFilter !== 'ALL') {
          const hasSeverity = (i.findings || []).some((f) => f.condition === severityFilter);
          if (!hasSeverity) return false;
        }

        // Estimate Status Filter
        if (estimateStatusFilter !== 'ALL') {
          const est = estimates[i.job_id];
          const st = est ? est.status : 'NO_ESTIMATE';
          if (estimateStatusFilter === 'HAS_ESTIMATE' && !est) return false;
          if (estimateStatusFilter === 'NO_ESTIMATE' && est) return false;
          if (estimateStatusFilter !== 'HAS_ESTIMATE' && estimateStatusFilter !== 'NO_ESTIMATE' && st !== estimateStatusFilter) {
            return false;
          }
        }

        // Inspection Type Filter
        if (typeFilter !== 'ALL' && i.inspection_type !== typeFilter) return false;

        // Search Query (across ID, Job Card ID, Customer, Phone, Vehicle, Registration, Tech, Advisor)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchId = i.id.toLowerCase().includes(q);
          const matchJob = i.job_id.toLowerCase().includes(q);
          const matchCust = (i.customer_name || '').toLowerCase().includes(q);
          const matchPhone = (i.customer_phone || '').toLowerCase().includes(q);
          const matchVeh = (i.vehicle_summary || '').toLowerCase().includes(q);
          const matchReg = (i.registration || '').toLowerCase().includes(q);
          const matchTech = (i.technician_name || i.inspector_name || '').toLowerCase().includes(q);
          const matchAdv = (i.advisor_name || '').toLowerCase().includes(q);

          if (!matchId && !matchJob && !matchCust && !matchPhone && !matchVeh && !matchReg && !matchTech && !matchAdv) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'RECENTLY_UPDATED') {
          return new Date(b.updated_at || b.created_at || '').getTime() - new Date(a.updated_at || a.created_at || '').getTime();
        }
        if (sortBy === 'OLDEST_FIRST') {
          return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
        }
        if (sortBy === 'HIGHEST_SEVERITY') {
          const aCrit = (a.findings || []).filter((f) => f.condition === 'CRITICAL').length;
          const bCrit = (b.findings || []).filter((f) => f.condition === 'CRITICAL').length;
          if (bCrit !== aCrit) return bCrit - aCrit;
          const aAtt = (a.findings || []).filter((f) => f.condition === 'ATTENTION').length;
          const bAtt = (b.findings || []).filter((f) => f.condition === 'ATTENTION').length;
          return bAtt - aAtt;
        }
        if (sortBy === 'PROMISE_TIME') {
          const jobA = jobs.find((j) => j.id === a.job_id);
          const jobB = jobs.find((j) => j.id === b.job_id);
          if (jobA && jobB) {
            return new Date(jobA.promised_completion).getTime() - new Date(jobB.promised_completion).getTime();
          }
        }
        return 0;
      });
  }, [
    inspectionList,
    kpiFilter,
    statusFilter,
    techFilter,
    advisorFilter,
    severityFilter,
    estimateStatusFilter,
    typeFilter,
    searchQuery,
    sortBy,
    estimates,
    jobs,
  ]);

  // Reset all filters
  const handleResetFilters = () => {
    setKpiFilter('ALL');
    setSearchQuery('');
    setStatusFilter('ALL');
    setTechFilter('ALL');
    setAdvisorFilter('ALL');
    setSeverityFilter('ALL');
    setEstimateStatusFilter('ALL');
    setTypeFilter('ALL');
    setSortBy('RECENTLY_UPDATED');
  };

  // Condition summary counts for active inspection
  const activeItems = useMemo(() => {
    if (!activeInspection) return [];
    if (activeInspection.items && activeInspection.items.length > 0) {
      return activeInspection.items;
    }
    return generateDefaultDVIItems(activeInspection.id, 'NOT_INSPECTED');
  }, [activeInspection]);

  const conditionSummary = useMemo(() => {
    let critical = 0;
    let attention = 0;
    let good = 0;
    let notInspected = 0;
    let notApplicable = 0;

    activeItems.forEach((it) => {
      if (it.condition === 'CRITICAL') critical++;
      else if (it.condition === 'ATTENTION') attention++;
      else if (it.condition === 'GOOD') good++;
      else if (it.condition === 'NOT_INSPECTED') notInspected++;
      else if (it.condition === 'NOT_APPLICABLE') notApplicable++;
    });

    return { critical, attention, good, notInspected, notApplicable, total: activeItems.length };
  }, [activeItems]);

  // Inspection completion rule:
  // Must NOT allow COMPLETE INSPECTION unless every required item has a result (GOOD, ATTENTION, CRITICAL, N/A)
  // 'NOT_INSPECTED' items block completion.
  const canCompleteInspection = conditionSummary.notInspected === 0;

  // Handlers for active inspection item mutations
  const handleItemConditionChange = (itemId: string, newCondition: InspectionCondition) => {
    if (!activeInspection) return;

    const updatedItems = activeItems.map((it) => {
      if (it.id === itemId) {
        return {
          ...it,
          condition: newCondition,
          updated_at: new Date().toISOString(),
        };
      }
      return it;
    });

    const updatedInspection: InspectionRecord = {
      ...activeInspection,
      items: updatedItems,
      updated_at: new Date().toISOString(),
    };

    onSaveInspection(updatedInspection);
  };

  // State transitions
  const handleUpdateStatus = (newStatus: InspectionStatus) => {
    if (!activeInspection) return;

    const now = new Date().toISOString();
    const eventTimeline = [...(activeInspection.timeline || [])];

    let eventLabel = `Status changed to ${STATUS_DISPLAY_MAP[newStatus]}`;
    if (newStatus === 'IN_PROGRESS') {
      eventLabel = 'Inspection Started';
    } else if (newStatus === 'COMPLETED') {
      eventLabel = 'Inspection Completed';
    } else if (newStatus === 'CUSTOMER_SHARED') {
      eventLabel = 'Inspection Shared With Customer';
    }

    eventTimeline.push({
      id: 'tl-' + Date.now(),
      timestamp: now,
      actor: `${activeInspection.inspector_name || 'Advisor'}`,
      event: eventLabel,
      notes: `Operational lifecycle advanced to ${newStatus}.`,
    });

    const updated: InspectionRecord = {
      ...activeInspection,
      status: newStatus,
      started_at: newStatus === 'IN_PROGRESS' && !activeInspection.started_at ? now : activeInspection.started_at,
      completed_at: newStatus === 'COMPLETED' ? now : activeInspection.completed_at,
      shared_at: newStatus === 'CUSTOMER_SHARED' ? now : activeInspection.shared_at,
      timeline: eventTimeline,
      updated_at: now,
    };

    onSaveInspection(updated);
  };

  // Add Finding Submit
  const handleSaveFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInspection || !targetFinding.trim()) return;

    const now = new Date().toISOString();
    const findingId = 'find-' + Date.now();

    const newFinding: InspectionFinding = {
      id: findingId,
      category: targetCategory,
      component: targetComponent,
      condition: targetCondition,
      finding: targetFinding.trim(),
      recommendation: targetRecommendation.trim() || 'Technician inspection follow-up recommended.',
      priority: targetPriority,
      add_to_estimate: targetAddToEstimate,
      photo_url: targetPhotoUrl.trim() || undefined,
    };

    const newEvidenceList = [...(activeInspection.evidence || [])];
    if (targetPhotoUrl.trim()) {
      newEvidenceList.push({
        id: 'ev-' + Date.now(),
        inspection_id: activeInspection.id,
        finding_id: findingId,
        file_url: targetPhotoUrl.trim(),
        caption: targetCaption.trim() || `${targetComponent}: ${targetFinding.trim()}`,
        created_at: now,
        uploaded_by: activeInspection.inspector_name,
      });
    }

    // Also update corresponding item condition if present
    const updatedItems = activeItems.map((it) => {
      if (it.component.toLowerCase() === targetComponent.toLowerCase()) {
        return {
          ...it,
          condition: targetCondition,
          finding: targetFinding.trim(),
          recommendation: targetRecommendation.trim(),
          priority: targetPriority,
          add_to_estimate: targetAddToEstimate,
          updated_at: now,
        };
      }
      return it;
    });

    const timeline = [...(activeInspection.timeline || [])];
    timeline.push({
      id: 'tl-' + Date.now(),
      timestamp: now,
      actor: activeInspection.inspector_name || 'Technician',
      event: 'Finding Added',
      notes: `Recorded ${targetCondition} finding for ${targetComponent}.`,
    });

    const updated: InspectionRecord = {
      ...activeInspection,
      findings: [newFinding, ...(activeInspection.findings || [])],
      items: updatedItems,
      evidence: newEvidenceList,
      timeline: timeline,
      updated_at: now,
    };

    onSaveInspection(updated);

    // Reset form & close modal
    setTargetFinding('');
    setTargetRecommendation('');
    setTargetPhotoUrl('');
    setTargetCaption('');
    setAddFindingModalOpen(false);
  };

  // Toggle Finding Add to Estimate using canonical addFindingToEstimate
  const handleToggleAddToEstimate = (findingId: string) => {
    if (!activeInspection) return;
    const finding = (activeInspection.findings || []).find((f) => f.id === findingId);
    if (!finding) return;

    if (!finding.add_to_estimate) {
      // Connect finding to canonical estimate item
      const res = addFindingToEstimate(activeInspection.job_card_id || activeInspection.job_id, finding);
      if (res.success) {
        onSaveInspection({
          ...activeInspection,
          updated_at: new Date().toISOString(),
        });
      }
    } else {
      // Toggle flag
      const updatedFindings = (activeInspection.findings || []).map((f) => {
        if (f.id === findingId) {
          return {
            ...f,
            add_to_estimate: false,
          };
        }
        return f;
      });

      onSaveInspection({
        ...activeInspection,
        findings: updatedFindings,
        updated_at: new Date().toISOString(),
      });
    }
  };

  // Accordion state for 12 categories:
  // Dynamically prioritize categories containing CRITICAL, ATTENTION, or unresolved NOT_INSPECTED items
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!activeInspection) return;
    const initialOpen: Record<string, boolean> = {};
    DVI_CATEGORIES.forEach((cat) => {
      const catItems = activeItems.filter((i) => i.category === cat.name);
      const hasCritical = catItems.some((i) => i.condition === 'CRITICAL');
      const hasAttention = catItems.some((i) => i.condition === 'ATTENTION');
      const hasPending = catItems.some((i) => i.condition === 'NOT_INSPECTED');
      // If any item is critical, attention, or pending, open by default
      initialOpen[cat.name] = hasCritical || hasAttention || hasPending;
    });

    // If everything is GOOD or N/A across all categories, open the first category by default
    const anyOpen = Object.values(initialOpen).some(Boolean);
    if (!anyOpen && DVI_CATEGORIES[0]) {
      initialOpen[DVI_CATEGORIES[0].name] = true;
    }

    setOpenCategories(initialOpen);
  }, [activeInspection?.id]);

  const toggleCategory = (catName: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  // Quick-mark all items in a category
  const handleBulkMarkCategory = (catName: string, cond: InspectionCondition) => {
    if (!activeInspection) return;
    const updatedItems = activeItems.map((it) => {
      if (it.category === catName) {
        return {
          ...it,
          condition: cond,
          updated_at: new Date().toISOString(),
        };
      }
      return it;
    });

    onSaveInspection({
      ...activeInspection,
      items: updatedItems,
      updated_at: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-5">
      {/* ============================================================ */}
      {/* 5. PAGE HEADER                                              */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-graphite-border">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block font-semibold">
            WORKSHOP INSPECTION
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-warm-white">
            INSPECTIONS
          </h1>
          <p className="text-xs text-muted font-light mt-0.5 max-w-2xl">
            Document vehicle condition, record findings, and prepare verified recommendations for customer approval.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setNewInspectionModalOpen(true)}
            className="px-4 py-2.5 bg-accent-gold text-obsidian rounded-xs text-xs font-bold font-mono uppercase tracking-wider hover:bg-white transition-colors flex items-center gap-1.5 min-h-[44px] shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>NEW INSPECTION</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. OPERATIONAL KPI STRIP                                    */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {[
          { key: 'TOTAL_ACTIVE', testId: 'inspections-kpi-active', label: 'ACTIVE', count: kpiCounts.totalActive, color: 'text-warm-white', activeBorder: 'border-accent-gold' },
          { key: 'DRAFT', testId: 'inspections-kpi-draft', label: 'DRAFT', count: kpiCounts.draft, color: 'text-muted', activeBorder: 'border-white' },
          { key: 'IN_PROGRESS', testId: 'inspections-kpi-progress', label: 'IN PROGRESS', count: kpiCounts.inProgress, color: 'text-blue-400', activeBorder: 'border-blue-400' },
          { key: 'COMPLETED', testId: 'inspections-kpi-completed', label: 'COMPLETED', count: kpiCounts.completed, color: 'text-emerald-400', activeBorder: 'border-emerald-400' },
          { key: 'SHARED', testId: 'inspections-kpi-shared', label: 'SHARED WITH CUSTOMER', count: kpiCounts.sharedWithCustomer, color: 'text-purple-400', activeBorder: 'border-purple-400' },
          { key: 'ATTENTION', testId: 'inspections-kpi-attention', label: 'FINDINGS REQUIRING ATTENTION', count: kpiCounts.findingsRequiringAttention, color: 'text-amber-400', activeBorder: 'border-amber-400' },
          { key: 'REQUIRES_ESTIMATE', testId: 'inspections-kpi-estimate', label: 'REQUIRES ESTIMATE', count: kpiCounts.requiresEstimate, color: 'text-accent-gold', activeBorder: 'border-accent-gold' },
        ].map((kpi) => {
          const isActive = kpiFilter === kpi.key;
          return (
            <button
              key={kpi.key}
              data-testid={kpi.testId}
              onClick={() => handleKpiClick(kpi.key)}
              className={`p-3 rounded-xs text-left transition-all border ${
                isActive
                  ? `${kpi.activeBorder} bg-obsidian ring-1 ring-accent-gold/40`
                  : 'border-graphite-border bg-graphite/40 hover:border-graphite-border/80 hover:bg-graphite/70'
              } flex flex-col justify-between min-h-[72px]`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-dark leading-tight line-clamp-2">
                  {kpi.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse shrink-0 ml-1" />
                )}
              </div>
              <span className={`text-xl font-mono font-bold tracking-tight mt-1 ${kpi.color}`}>
                {kpi.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* 8. SEARCH & FILTERS BAR                                      */}
      {/* ============================================================ */}
      <div className="p-3 rounded-xs bg-graphite/40 border border-graphite-border space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Inspection ID, Job Card ID, Customer, Phone, Vehicle, Registration, Tech..."
              className="w-full bg-obsidian border border-graphite-border rounded-xs pl-9 pr-3 py-2 text-xs font-mono text-warm-white placeholder:text-muted-dark focus:outline-none focus:border-accent-gold min-h-[40px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-warm-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-obsidian border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CUSTOMER_SHARED">Shared with Customer</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            {technicians.length > 0 && (
              <select
                value={techFilter}
                onChange={(e) => setTechFilter(e.target.value)}
                className="bg-obsidian border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
              >
                <option value="ALL">All Technicians</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-obsidian border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Has Critical</option>
              <option value="ATTENTION">Has Attention</option>
              <option value="GOOD">All Good</option>
            </select>

            <select
              value={estimateStatusFilter}
              onChange={(e) => setEstimateStatusFilter(e.target.value)}
              className="bg-obsidian border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
            >
              <option value="ALL">All Estimate States</option>
              <option value="HAS_ESTIMATE">Has Estimate</option>
              <option value="NO_ESTIMATE">No Estimate</option>
              <option value="APPROVED">Estimate Approved</option>
              <option value="SENT">Estimate Sent</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-obsidian border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[40px]"
            >
              <option value="RECENTLY_UPDATED">Sort: Recently Updated</option>
              <option value="OLDEST_FIRST">Sort: Oldest First</option>
              <option value="HIGHEST_SEVERITY">Sort: Highest Severity</option>
              <option value="PROMISE_TIME">Sort: Vehicle Promise Time</option>
            </select>

            {(kpiFilter !== 'ALL' ||
              searchQuery ||
              statusFilter !== 'ALL' ||
              severityFilter !== 'ALL' ||
              estimateStatusFilter !== 'ALL' ||
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
      {/* 4. WORKSPACE LAYOUT: 65% QUEUE / 35% DOSSIER (DESKTOP)       */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ============================================================ */}
        {/* 7. LEFT QUEUE (65% on LG)                                   */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-muted px-1">
            <span>
              SHOWING <strong className="text-warm-white">{filteredInspections.length}</strong> INSPECTIONS
            </span>
            {kpiFilter !== 'ALL' && (
              <span className="text-accent-gold font-bold">
                Filtered by KPI: {kpiFilter}
              </span>
            )}
          </div>

          {filteredInspections.length === 0 ? (
            <div className="p-8 rounded-xs bg-graphite/20 border border-graphite-border text-center space-y-3">
              <ClipboardList className="w-8 h-8 text-muted mx-auto opacity-50" />
              <div className="text-sm font-bold text-warm-white uppercase">No Inspections Found</div>
              <p className="text-xs text-muted max-w-sm mx-auto">
                No inspection records match the current filter criteria. Reset filters or create a new inspection.
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
              {filteredInspections.map((insp) => {
                const isSelected = activeInspection?.id === insp.id;
                const job = jobs.find((j) => j.id === (insp.job_card_id || insp.job_id));
                const est = estimates[insp.job_id];
                const critCount = (insp.findings || []).filter((f) => f.condition === 'CRITICAL').length;
                const attCount = (insp.findings || []).filter((f) => f.condition === 'ATTENTION').length;
                const statusBadge = STATUS_BADGE_MAP[insp.status] || STATUS_BADGE_MAP.DRAFT;

                // Inherited lineage values: Never display placeholder if parent job has the authoritative info
                const vehicleSummary = insp.vehicle_summary || job?.vehicle_summary || 'Vehicle Unspecified';
                const regNumber = insp.registration || job?.registration || 'No Reg';
                const customerName = insp.customer_name || job?.customer_name || 'Customer N/A';
                const customerPhone = insp.customer_phone || job?.customer_phone;
                const techName = insp.technician_name || insp.inspector_name || job?.technician || 'Unassigned';
                const advisorName = insp.advisor_name || job?.advisor || 'Unassigned';
                const odo = insp.odometer || job?.odometer;

                return (
                  <div
                    key={insp.id}
                    data-testid={`inspection-card-${insp.id}`}
                    onClick={() => {
                      setSelectedInspectionId(insp.id);
                      setMobileDossierOpen(true);
                    }}
                    className={`p-4 rounded-xs border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'border-accent-gold bg-obsidian ring-1 ring-accent-gold/50 shadow-md'
                        : 'border-graphite-border bg-graphite/30 hover:bg-graphite/60 hover:border-graphite-border/80'
                    }`}
                  >
                    {/* ROW 1: Inspection ID, Job Card ID, Status */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-graphite-border/70 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-accent-gold tracking-wider">
                          {insp.id}
                        </span>
                        <span className="text-muted font-mono text-xs">·</span>
                        <span className="font-mono text-xs font-semibold text-warm-white bg-graphite px-2 py-0.5 rounded-xs border border-graphite-border">
                          {insp.job_card_id || insp.job_id}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-xs border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                      >
                        {STATUS_DISPLAY_MAP[insp.status] || insp.status}
                      </span>
                    </div>

                    {/* ROW 2: Vehicle Make + Model + Year & Registration */}
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <span className="font-bold text-warm-white text-sm">
                        {vehicleSummary}
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <span className="text-accent-gold font-bold">{regNumber}</span>
                        {odo ? (
                          <>
                            <span className="text-muted">·</span>
                            <span className="text-muted">{odo.toLocaleString()} km</span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    {/* ROW 3: Customer & Phone */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-warm-white font-medium">{customerName}</span>
                      {customerPhone && (
                        <>
                          <span className="text-muted font-mono text-[11px]">·</span>
                          <span className="text-muted-dark font-mono text-[11px]">{customerPhone}</span>
                        </>
                      )}
                    </div>

                    {/* ROW 4: Technician & Advisor */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-0.5">
                      <div className="text-muted truncate">
                        Tech: <strong className="text-warm-white font-semibold">{techName}</strong>
                      </div>
                      <div className="text-muted truncate text-right">
                        Advisor: <strong className="text-warm-white font-semibold">{advisorName}</strong>
                      </div>
                    </div>

                    {/* ROW 5: Inspection Timing (Intelligent Lifecycle Timestamps) */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-dark pt-1 border-t border-graphite-border/40">
                      {insp.status === 'DRAFT' && (
                        <span>
                          Created: {insp.created_at ? new Date(insp.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                        </span>
                      )}
                      {insp.status === 'IN_PROGRESS' && (
                        <span className="text-blue-400">
                          Started: {insp.started_at ? new Date(insp.started_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                        </span>
                      )}
                      {insp.status === 'COMPLETED' && (
                        <div className="flex items-center justify-between w-full">
                          <span>
                            Started: {insp.started_at ? new Date(insp.started_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </span>
                          <span className="text-emerald-400">
                            Completed: {insp.completed_at ? new Date(insp.completed_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </span>
                        </div>
                      )}
                      {insp.status === 'CUSTOMER_SHARED' && (
                        <div className="flex items-center justify-between w-full">
                          <span>
                            Completed: {insp.completed_at ? new Date(insp.completed_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </span>
                          <span className="text-purple-400">
                            Shared: {insp.shared_at ? new Date(insp.shared_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </span>
                        </div>
                      )}
                      {insp.status === 'ARCHIVED' && (
                        <div className="flex items-center justify-between w-full">
                          <span>
                            Completed: {insp.completed_at ? new Date(insp.completed_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </span>
                          <span className="text-muted">
                            Archived: {insp.archived_at ? new Date(insp.archived_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* ROW 6: Finding Summary */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-graphite-border/40">
                      <div className="flex gap-1.5 flex-wrap">
                        {critCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-xs bg-red-500/15 border border-red-500/30 text-red-400 font-mono text-[10px] font-bold">
                            {critCount} Critical
                          </span>
                        )}
                        {attCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-xs bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold">
                            {attCount} Attention
                          </span>
                        )}
                        {critCount === 0 && attCount === 0 && (
                          <span className="px-1.5 py-0.5 rounded-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                            All Good
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-mono text-muted-dark truncate max-w-[200px]">
                        {insp.summary || insp.notes || 'Intake assessment'}
                      </span>
                    </div>

                    {/* ROW 7: Estimate Status & OPEN INSPECTION CTA */}
                    <div className="pt-2 border-t border-graphite-border/60 flex items-center justify-between text-[11px] font-mono">
                      <div>
                        {est ? (
                          <span
                            className={`font-semibold ${
                              est.status === 'APPROVED' ? 'text-emerald-400' : 'text-accent-gold'
                            }`}
                          >
                            Estimate: {est.status} · ₹{est.total.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-dark text-[10px]">Estimate: Not created</span>
                        )}
                      </div>

                      <button className="text-accent-gold hover:underline font-bold flex items-center gap-1 shrink-0">
                        <span>OPEN INSPECTION</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 9. RIGHT DOSSIER (35% on LG / Full-screen drawer on Mobile)   */}
        {/* ============================================================ */}
        <div
          data-testid="inspection-dossier"
          className={`lg:col-span-4 transition-all ${
            mobileDossierOpen
              ? 'fixed inset-0 z-50 bg-obsidian p-4 overflow-y-auto block lg:relative lg:inset-auto lg:p-0 lg:bg-transparent lg:z-auto'
              : 'hidden lg:block'
          }`}
        >
          {activeInspection ? (
            <div className="p-5 rounded-xs bg-graphite/40 border border-graphite-border space-y-6">
              {/* Mobile Back Button */}
              <div className="flex lg:hidden items-center justify-between pb-3 border-b border-graphite-border">
                <button
                  onClick={() => setMobileDossierOpen(false)}
                  className="px-3 py-1.5 bg-graphite border border-graphite-border text-xs font-mono uppercase text-warm-white flex items-center gap-1.5 min-h-[44px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>BACK TO INSPECTIONS</span>
                </button>
                <span className="font-mono text-xs font-bold text-accent-gold">
                  {activeInspection.id}
                </span>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* 9.A HEADER                                                  */}
              {/* ------------------------------------------------------------ */}
              <div className="space-y-3 pb-4 border-b border-graphite-border">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block">
                      INSPECTION DOSSIER
                    </span>
                    <h2 className="text-xl font-mono font-bold text-warm-white">
                      {activeInspection.id}
                    </h2>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-xs border ${
                      (STATUS_BADGE_MAP[activeInspection.status] || STATUS_BADGE_MAP.DRAFT).bg
                    } ${
                      (STATUS_BADGE_MAP[activeInspection.status] || STATUS_BADGE_MAP.DRAFT).text
                    } ${
                      (STATUS_BADGE_MAP[activeInspection.status] || STATUS_BADGE_MAP.DRAFT).border
                    }`}
                  >
                    {STATUS_DISPLAY_MAP[activeInspection.status] || activeInspection.status}
                  </span>
                </div>

                {/* Primary Contextual Action depending on lifecycle */}
                <div className="pt-2">
                  {activeInspection.status === 'DRAFT' && (
                    <button
                      onClick={() => handleUpdateStatus('IN_PROGRESS')}
                      className="w-full py-2.5 px-3 bg-accent-gold text-obsidian rounded-xs text-xs font-bold font-mono uppercase hover:bg-white transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <ClipboardList className="w-4 h-4" />
                      <span>START INSPECTION →</span>
                    </button>
                  )}

                  {activeInspection.status === 'IN_PROGRESS' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            onSaveInspection({
                              ...activeInspection,
                              updated_at: new Date().toISOString(),
                            });
                          }}
                          className="flex-1 py-2 px-3 bg-graphite border border-graphite-border hover:border-accent-gold text-warm-white rounded-xs text-xs font-mono uppercase flex items-center justify-center gap-1.5 min-h-[44px]"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>SAVE PROGRESS</span>
                        </button>

                        <button
                          data-testid="btn-complete-inspection"
                          onClick={() => handleUpdateStatus('COMPLETED')}
                          disabled={!canCompleteInspection}
                          title={
                            !canCompleteInspection
                              ? `${conditionSummary.notInspected} inspection items still require a result.`
                              : undefined
                          }
                          className={`flex-1 py-2 px-3 rounded-xs text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5 min-h-[44px] ${
                            canCompleteInspection
                              ? 'bg-emerald-500 text-obsidian hover:bg-white'
                              : 'bg-graphite/50 text-muted-dark border border-graphite-border cursor-not-allowed opacity-60'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>COMPLETE INSPECTION</span>
                        </button>
                      </div>

                      {!canCompleteInspection && (
                        <p className="text-[11px] font-mono text-amber-400 bg-amber-500/10 p-2 rounded-xs border border-amber-500/30 text-center">
                          {conditionSummary.notInspected} inspection items still require a result before completion.
                        </p>
                      )}
                    </div>
                  )}

                  {activeInspection.status === 'COMPLETED' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus('CUSTOMER_SHARED')}
                        className="flex-1 py-2.5 px-3 bg-purple-500 text-white rounded-xs text-xs font-bold font-mono uppercase hover:bg-white hover:text-obsidian transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>SHARE WITH CUSTOMER →</span>
                      </button>

                      <button
                        onClick={() => setCustomerPreviewModalOpen(true)}
                        className="py-2.5 px-3 bg-graphite border border-graphite-border hover:border-accent-gold text-warm-white rounded-xs text-xs font-mono uppercase flex items-center justify-center gap-1 min-h-[44px]"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-accent-gold" />
                        <span className="hidden sm:inline">PREVIEW</span>
                      </button>
                    </div>
                  )}

                  {activeInspection.status === 'CUSTOMER_SHARED' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (activeJob?.public_token && onOpenCustomerView) {
                            onOpenCustomerView(activeJob.public_token);
                          } else {
                            setCustomerPreviewModalOpen(true);
                          }
                        }}
                        className="flex-1 py-2.5 px-3 bg-purple-500/20 border border-purple-500 text-purple-300 rounded-xs text-xs font-bold font-mono uppercase hover:bg-purple-500 hover:text-white transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>OPEN CUSTOMER VIEW →</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* 10.B VEHICLE / JOB CONTEXT                                   */}
              {/* ------------------------------------------------------------ */}
              <div className="space-y-3 pb-4 border-b border-graphite-border text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-muted block font-bold">
                    VEHICLE / JOB CONTEXT
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {onOpenJob && (
                      <button
                        onClick={() => onOpenJob(activeJob?.id || activeInspection.job_card_id || activeInspection.job_id)}
                        className="text-accent-gold hover:underline font-bold text-[11px] flex items-center gap-1"
                      >
                        <span>OPEN JOB CARD →</span>
                      </button>
                    )}
                    {onNavigateModule && (
                      <button
                        onClick={() => onNavigateModule('vehicles')}
                        className="text-muted hover:text-warm-white font-bold text-[11px] flex items-center gap-1"
                      >
                        <span>OPEN VEHICLE →</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-obsidian p-3 rounded-xs border border-graphite-border">
                  <div className="col-span-2 pb-1 border-b border-graphite-border/50">
                    <span className="text-[10px] text-muted-dark uppercase block">Vehicle & Registration</span>
                    <div className="flex items-baseline justify-between mt-0.5">
                      <span className="text-warm-white font-bold text-sm">
                        {activeInspection.vehicle_summary || activeJob?.vehicle_summary || 'Vehicle Unspecified'}
                      </span>
                      <span className="text-accent-gold font-bold">
                        {activeInspection.registration || activeJob?.registration || 'No Reg'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-dark uppercase block">Customer</span>
                    <span className="text-warm-white font-semibold">
                      {activeInspection.customer_name || activeJob?.customer_name || 'Customer N/A'}
                    </span>
                    {(activeInspection.customer_phone || activeJob?.customer_phone) && (
                      <span className="text-muted-dark text-[10px] block font-mono">
                        {activeInspection.customer_phone || activeJob?.customer_phone}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-dark uppercase block">Odometer / Fuel</span>
                    <span className="text-warm-white">
                      {(activeInspection.odometer || activeJob?.odometer || 0).toLocaleString()} km
                    </span>
                    <span className="text-muted text-[10px] ml-1.5 font-mono">
                      · Fuel: {activeInspection.fuel_level || activeJob?.fuel_level || 'N/A'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-dark uppercase block">Service Advisor</span>
                    <span className="text-warm-white font-medium">
                      {activeInspection.advisor_name || activeJob?.advisor || 'Unassigned'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-dark uppercase block">Lead Technician</span>
                    <span className="text-warm-white font-medium">
                      {activeInspection.technician_name || activeInspection.inspector_name || activeJob?.technician || 'Unassigned'}
                    </span>
                  </div>

                  {activeEstimate && (
                    <div className="col-span-2 pt-1.5 border-t border-graphite-border/50 flex items-center justify-between">
                      <span className="text-[10px] text-muted-dark uppercase block">Commercial Estimate</span>
                      <span
                        className={`font-mono text-xs font-bold ${
                          activeEstimate.status === 'APPROVED' ? 'text-emerald-400' : 'text-accent-gold'
                        }`}
                      >
                        {activeEstimate.estimate_number} ({activeEstimate.status}) · ₹{activeEstimate.total.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {activeJob?.customer_complaint && (
                  <div className="p-2.5 rounded-xs bg-obsidian border border-graphite-border space-y-1">
                    <span className="text-[10px] text-muted-dark uppercase block">Customer Complaint</span>
                    <p className="text-warm-white text-[11px] font-sans leading-relaxed">
                      {activeJob.customer_complaint}
                    </p>
                  </div>
                )}
              </div>

              {/* ------------------------------------------------------------ */}
              {/* 10.C CONDITION SUMMARY                                       */}
              {/* ------------------------------------------------------------ */}
              <div className="space-y-3 pb-4 border-b border-graphite-border">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted block font-bold">
                  CONDITION SUMMARY
                </span>

                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  <div className="p-2 rounded-xs bg-red-500/10 border border-red-500/30">
                    <span className="text-[10px] text-red-400 uppercase block font-bold">CRITICAL</span>
                    <span className="text-lg font-bold text-red-400">{conditionSummary.critical}</span>
                  </div>
                  <div className="p-2 rounded-xs bg-amber-500/10 border border-amber-500/30">
                    <span className="text-[10px] text-amber-400 uppercase block font-bold">ATTENTION</span>
                    <span className="text-lg font-bold text-amber-400">{conditionSummary.attention}</span>
                  </div>
                  <div className="p-2 rounded-xs bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-400 uppercase block font-bold">GOOD</span>
                    <span className="text-lg font-bold text-emerald-400">{conditionSummary.good}</span>
                  </div>
                  <div className="p-2 rounded-xs bg-graphite border border-graphite-border">
                    <span className="text-[10px] text-muted uppercase block font-bold">NOT INSP.</span>
                    <span className="text-lg font-bold text-muted">{conditionSummary.notInspected}</span>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* 10.D FINDINGS REQUIRING ACTION                               */}
              {/* ------------------------------------------------------------ */}
              <div className="space-y-3 pb-4 border-b border-graphite-border">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted block font-bold">
                    FINDINGS REQUIRING ACTION ({activeInspection.findings?.length || 0})
                  </span>
                  <button
                    onClick={() => setAddFindingModalOpen(true)}
                    className="px-2.5 py-1 bg-accent-gold text-obsidian rounded-xs text-[11px] font-bold font-mono uppercase hover:bg-white flex items-center gap-1 min-h-[32px]"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                    <span>ADD FINDING</span>
                  </button>
                </div>

                {(!activeInspection.findings || activeInspection.findings.length === 0) ? (
                  <p className="text-xs text-muted font-mono italic p-3 bg-obsidian rounded-xs border border-graphite-border">
                    No specific defects recorded. Vehicle checks are currently in standard tolerance.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {/* Show Critical and Attention findings first */}
                    {[...activeInspection.findings]
                      .sort((a, b) => {
                        const order: Record<string, number> = { CRITICAL: 1, ATTENTION: 2, GOOD: 3, NOT_INSPECTED: 4, NOT_APPLICABLE: 5 };
                        return (order[a.condition] || 99) - (order[b.condition] || 99);
                      })
                      .map((f) => {
                        const isCritical = f.condition === 'CRITICAL';
                        return (
                          <div
                            key={f.id}
                            className={`p-3 rounded-xs border text-xs space-y-2 ${
                              isCritical
                                ? 'bg-red-500/10 border-red-500/40'
                                : 'bg-obsidian border-graphite-border'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-warm-white text-xs">
                                {f.component || f.category}
                              </span>
                              <span
                                className={`text-[9px] font-mono px-2 py-0.5 rounded-xs uppercase font-bold ${
                                  isCritical
                                    ? 'bg-red-500/20 text-red-400'
                                    : f.condition === 'ATTENTION'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-emerald-500/20 text-emerald-400'
                                }`}
                              >
                                {f.condition} · {f.priority || 'NORMAL'}
                              </span>
                            </div>

                            <div className="space-y-1 text-xs">
                              <p className="text-muted">
                                <strong className="text-warm-white">Finding:</strong> {f.finding}
                              </p>
                              <p className="text-accent-gold">
                                <strong className="text-warm-white">Recommendation:</strong> {f.recommendation}
                              </p>
                            </div>

                            {f.photo_url && (
                              <div className="pt-1">
                                <img
                                  src={f.photo_url}
                                  alt={f.finding}
                                  className="w-full h-32 object-cover rounded-xs border border-graphite-border"
                                />
                              </div>
                            )}

                            {/* FINDING → ESTIMATE ACTION */}
                            <div className="pt-2 border-t border-graphite-border/50 flex items-center justify-between">
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-mono text-muted-dark block">
                                  {f.estimate_id ? `Linked to ${f.estimate_id}` : 'Price not configured'}
                                </span>
                              </div>

                              <button
                                data-testid="btn-add-to-estimate"
                                onClick={() => handleToggleAddToEstimate(f.id)}
                                className={`px-2.5 py-1 rounded-xs text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1 ${
                                  f.add_to_estimate
                                    ? 'bg-emerald-500 text-obsidian hover:bg-emerald-400'
                                    : 'bg-graphite text-muted hover:text-warm-white border border-graphite-border'
                                }`}
                              >
                                {f.add_to_estimate ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>ADDED TO ESTIMATE</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" />
                                    <span>ADD TO ESTIMATE</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* ------------------------------------------------------------ */}
              {/* 10.E RECOMMENDATIONS SUMMARY                                 */}
              {/* ------------------------------------------------------------ */}
              <div className="space-y-3 pb-4 border-b border-graphite-border font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-muted block font-bold">
                    RECOMMENDATIONS
                  </span>
                  <span className="text-accent-gold text-xs font-bold">
                    Selected: {(activeInspection.findings || []).filter((f) => f.add_to_estimate).length}
                  </span>
                </div>

                <div className="p-3 rounded-xs bg-obsidian border border-graphite-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted text-[11px]">Estimate Status:</span>
                    <span className="text-warm-white font-bold">
                      {activeEstimate ? `${activeEstimate.estimate_number}` : 'Price not configured'}
                    </span>
                  </div>

                  <button
                    onClick={() => setReviewRecommendationsModalOpen(true)}
                    className="w-full py-2 px-3 bg-graphite border border-accent-gold text-accent-gold hover:bg-accent-gold hover:text-obsidian rounded-xs text-xs font-mono font-bold uppercase transition-colors flex items-center justify-center gap-1.5 min-h-[40px] mt-1"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>{activeEstimate ? 'REVIEW ESTIMATE →' : 'REVIEW RECOMMENDATIONS →'}</span>
                  </button>
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* 10.F 12-CATEGORY DVI CHECKLIST                               */}
              {/* ------------------------------------------------------------ */}
              <div className="space-y-3 pb-4 border-b border-graphite-border">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted block font-bold">
                    DVI CHECKLIST (12 CATEGORIES · {activeItems.length} CHECKS)
                  </span>
                </div>

                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {DVI_CATEGORIES.map((cat) => {
                    const isOpen = openCategories[cat.name] || false;
                    const catItems = activeItems.filter((i) => i.category === cat.name);
                    const attentionCount = catItems.filter((i) => i.condition === 'ATTENTION').length;
                    const criticalCount = catItems.filter((i) => i.condition === 'CRITICAL').length;
                    const checkedCount = catItems.filter((i) => i.condition !== 'NOT_INSPECTED').length;
                    const totalCount = catItems.length;

                    return (
                      <div
                        key={cat.id}
                        className="rounded-xs border border-graphite-border bg-obsidian overflow-hidden"
                      >
                        {/* Accordion Header */}
                        <div
                          onClick={() => toggleCategory(cat.name)}
                          className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-graphite/40 transition-colors"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-warm-white">
                                {cat.name}
                              </span>
                              {criticalCount > 0 && (
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                              )}
                              {attentionCount > 0 && criticalCount === 0 && (
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-dark">
                              <span>{checkedCount} / {totalCount} checked</span>
                              {attentionCount > 0 && (
                                <span className="text-amber-400 font-bold">· {attentionCount} Attention</span>
                              )}
                              {criticalCount > 0 && (
                                <span className="text-red-400 font-bold">· {criticalCount} Critical</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <ChevronDown
                              className={`w-3.5 h-3.5 text-muted transition-transform ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </div>

                        {/* Accordion Body */}
                        {isOpen && (
                          <div className="p-3 border-t border-graphite-border bg-graphite/20 space-y-3">
                            {/* Bulk Mark Category Button */}
                            <div className="flex items-center justify-between text-[10px] font-mono text-muted pb-1 border-b border-graphite-border/50">
                              <span>Quick Mark Category:</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleBulkMarkCategory(cat.name, 'GOOD')}
                                  className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 rounded-xs"
                                >
                                  All Good
                                </button>
                                <button
                                  onClick={() => handleBulkMarkCategory(cat.name, 'NOT_APPLICABLE')}
                                  className="px-2 py-0.5 bg-graphite text-muted-dark hover:text-warm-white rounded-xs"
                                >
                                  N/A
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2.5">
                              {catItems.map((item) => {
                                const currentMeta = CONDITION_META[item.condition] || CONDITION_META.NOT_INSPECTED;
                                const Icon = currentMeta.icon;

                                return (
                                  <div
                                    key={item.id}
                                    className="p-2.5 rounded-xs bg-obsidian border border-graphite-border space-y-2"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-semibold text-warm-white">
                                        {item.component}
                                      </span>
                                      <span
                                        className={`text-[9px] font-mono px-2 py-0.5 rounded-xs border font-bold flex items-center gap-1 ${currentMeta.bg} ${currentMeta.text} ${currentMeta.border}`}
                                      >
                                        <Icon className="w-2.5 h-2.5" />
                                        <span>{currentMeta.label}</span>
                                      </span>
                                    </div>

                                    {/* Condition Select Buttons */}
                                    <div className="grid grid-cols-5 gap-1 pt-1 font-mono text-[10px]">
                                      {(['GOOD', 'ATTENTION', 'CRITICAL', 'NOT_INSPECTED', 'NOT_APPLICABLE'] as InspectionCondition[]).map(
                                        (cond) => {
                                          const isSelected = item.condition === cond;
                                          const meta = CONDITION_META[cond];
                                          return (
                                            <button
                                              key={cond}
                                              onClick={() => handleItemConditionChange(item.id, cond)}
                                              className={`py-1 px-1 rounded-xs uppercase text-center transition-all ${
                                                isSelected
                                                  ? `${meta.bg} ${meta.text} border ${meta.border} font-bold ring-1 ring-accent-gold/40`
                                                  : 'bg-graphite/40 text-muted hover:text-warm-white border border-graphite-border'
                                              }`}
                                            >
                                              {meta.label}
                                            </button>
                                          );
                                        }
                                      )}
                                    </div>

                                    {item.finding && (
                                      <div className="p-2 rounded-xs bg-graphite/40 text-[11px] space-y-0.5">
                                        <p className="text-muted">
                                          <strong>Finding:</strong> {item.finding}
                                        </p>
                                        {item.recommendation && (
                                          <p className="text-accent-gold">
                                            <strong>Rec:</strong> {item.recommendation}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* 13. EVIDENCE / PHOTOS                                        */}
              {/* ------------------------------------------------------------ */}
              <div className="space-y-3 pb-4 border-b border-graphite-border">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
                    ATTACHED EVIDENCE ({activeInspection.evidence?.length || 0})
                  </span>
                  <button
                    onClick={() => setAttachEvidenceModalOpen(true)}
                    className="text-accent-gold hover:underline font-mono text-xs font-bold flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>+ ATTACH PHOTO</span>
                  </button>
                </div>

                {(!activeInspection.evidence || activeInspection.evidence.length === 0) ? (
                  <p className="text-xs text-muted font-mono italic p-3 bg-obsidian rounded-xs border border-graphite-border">
                    No photo evidence attached. Use + ATTACH PHOTO to upload component photos.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {activeInspection.evidence.map((ev) => (
                      <div
                        key={ev.id}
                        className="rounded-xs border border-graphite-border bg-obsidian overflow-hidden space-y-1 p-1.5"
                      >
                        <img
                          src={ev.file_url}
                          alt={ev.caption || 'Evidence'}
                          className="w-full h-24 object-cover rounded-xs"
                        />
                        <p className="text-[10px] font-mono text-muted line-clamp-2 px-1">
                          {ev.caption || 'No caption'}
                        </p>
                        <span className="text-[9px] font-mono text-muted-dark block px-1">
                          {new Date(ev.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ------------------------------------------------------------ */}
              {/* 23. ACTIVITY TIMELINE                                        */}
              {/* ------------------------------------------------------------ */}
              <div className="space-y-3 pb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
                  AUDIT TIMELINE
                </span>

                <div className="space-y-2 border-l-2 border-graphite-border ml-2 pl-3">
                  {(activeInspection.timeline || []).map((ev) => (
                    <div key={ev.id} className="relative text-xs space-y-0.5">
                      <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-accent-gold" />
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="font-bold text-warm-white">{ev.event}</span>
                        <span className="text-muted-dark">
                          {new Date(ev.timestamp).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-muted">{ev.actor}</p>
                      {ev.notes && (
                        <p className="text-[11px] text-muted-dark font-sans">{ev.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xs bg-graphite/30 border border-graphite-border text-center space-y-3">
              <ClipboardList className="w-8 h-8 text-muted mx-auto opacity-50" />
              <div className="text-sm font-bold text-warm-white uppercase">No Inspection Selected</div>
              <p className="text-xs text-muted">Select an inspection from the queue to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL: + NEW INSPECTION FROM JOB CARD                        */}
      {/* ============================================================ */}
      {newInspectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-graphite border border-accent-gold/40 rounded-xs p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block">
                  NEW INSPECTION DOCKET
                </span>
                <h3 className="text-base font-bold text-warm-white uppercase">
                  Initiate Vehicle Assessment
                </h3>
              </div>
              <button
                onClick={() => setNewInspectionModalOpen(false)}
                className="text-muted hover:text-warm-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-muted uppercase block">Select Job Card *</label>
                <select
                  value={newInspJobId}
                  onChange={(e) => {
                    setNewInspJobId(e.target.value);
                    const j = jobs.find((item) => item.id === e.target.value);
                    if (j) setNewInspTech(j.technician);
                  }}
                  className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.id} · {j.vehicle_summary} ({j.registration})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-muted uppercase block">Assigned Lead Technician *</label>
                <input
                  type="text"
                  value={newInspTech}
                  onChange={(e) => setNewInspTech(e.target.value)}
                  className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                />
              </div>

              <p className="text-[11px] text-muted font-sans leading-relaxed">
                Initializes standard 12-point DVI structure connected directly to this Job Card. Traceability IDs for Lead and Appointment are automatically preserved.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setNewInspectionModalOpen(false)}
                className="flex-1 py-2.5 px-3 bg-graphite border border-graphite-border text-warm-white rounded-xs text-xs font-mono uppercase min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onCreateInspection) {
                    const created = onCreateInspection(newInspJobId, newInspTech);
                    if (created) setSelectedInspectionId(created.id);
                  }
                  setNewInspectionModalOpen(false);
                }}
                className="flex-1 py-2.5 px-3 bg-accent-gold text-obsidian rounded-xs text-xs font-bold font-mono uppercase hover:bg-white min-h-[44px]"
              >
                Create Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: 14. + ADD FINDING                                     */}
      {/* ============================================================ */}
      {addFindingModalOpen && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-graphite border border-accent-gold/40 rounded-xs p-6 max-w-lg w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block">
                  RECORD FINDING
                </span>
                <h3 className="text-base font-bold text-warm-white uppercase">
                  Add Defect & Recommendation
                </h3>
              </div>
              <button
                onClick={() => setAddFindingModalOpen(false)}
                className="text-muted hover:text-warm-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFinding} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted uppercase block">Category *</label>
                  <select
                    value={targetCategory}
                    onChange={(e) => {
                      setTargetCategory(e.target.value);
                      const cat = DVI_CATEGORIES.find((c) => c.name === e.target.value);
                      if (cat && cat.components[0]) setTargetComponent(cat.components[0]);
                    }}
                    className="w-full bg-obsidian border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                  >
                    {DVI_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted uppercase block">Component *</label>
                  <input
                    type="text"
                    value={targetComponent}
                    onChange={(e) => setTargetComponent(e.target.value)}
                    className="w-full bg-obsidian border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted uppercase block">Condition State *</label>
                  <select
                    value={targetCondition}
                    onChange={(e) => setTargetCondition(e.target.value as InspectionCondition)}
                    className="w-full bg-obsidian border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                  >
                    <option value="GOOD">Good</option>
                    <option value="ATTENTION">Attention</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="NOT_APPLICABLE">N/A</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted uppercase block">Priority *</label>
                  <select
                    value={targetPriority}
                    onChange={(e) => setTargetPriority(e.target.value as FindingPriority)}
                    className="w-full bg-obsidian border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted uppercase block">Technician Finding *</label>
                <textarea
                  rows={2}
                  required
                  value={targetFinding}
                  onChange={(e) => setTargetFinding(e.target.value)}
                  placeholder="e.g. Pad thickness appears reduced and replacement is recommended."
                  className="w-full bg-obsidian border border-graphite-border rounded-xs p-2.5 text-xs text-warm-white focus:outline-none focus:border-accent-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted uppercase block">Recommendation *</label>
                <input
                  type="text"
                  required
                  value={targetRecommendation}
                  onChange={(e) => setTargetRecommendation(e.target.value)}
                  placeholder="e.g. Replace front brake pads."
                  className="w-full bg-obsidian border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted uppercase block">Photo URL (Evidence Attachment)</label>
                <input
                  type="text"
                  value={targetPhotoUrl}
                  onChange={(e) => setTargetPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-obsidian border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                />
              </div>

              {targetPhotoUrl && (
                <div className="space-y-1">
                  <label className="text-muted uppercase block">Photo Caption</label>
                  <input
                    type="text"
                    value={targetCaption}
                    onChange={(e) => setTargetCaption(e.target.value)}
                    placeholder="e.g. Visible wear on inner pad."
                    className="w-full bg-obsidian border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-graphite-border/50">
                <input
                  type="checkbox"
                  id="add_est_check"
                  checked={targetAddToEstimate}
                  onChange={(e) => setTargetAddToEstimate(e.target.checked)}
                  className="w-4 h-4 rounded-xs text-accent-gold focus:ring-0"
                />
                <label htmlFor="add_est_check" className="text-xs text-warm-white cursor-pointer select-none">
                  Flag finding for customer estimate recommendation
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAddFindingModalOpen(false)}
                  className="flex-1 py-2.5 px-3 bg-graphite border border-graphite-border text-warm-white rounded-xs text-xs font-mono uppercase min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 bg-accent-gold text-obsidian rounded-xs text-xs font-bold font-mono uppercase hover:bg-white min-h-[44px]"
                >
                  Save Finding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ATTACH PHOTO EVIDENCE                                 */}
      {/* ============================================================ */}
      {attachEvidenceModalOpen && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-graphite border border-accent-gold/40 rounded-xs p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block">
                  ATTACH EVIDENCE
                </span>
                <h3 className="text-base font-bold text-warm-white uppercase">
                  Vehicle Inspection Photo
                </h3>
              </div>
              <button
                onClick={() => setAttachEvidenceModalOpen(false)}
                className="text-muted hover:text-warm-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-muted uppercase block">Photo URL *</label>
                <input
                  type="text"
                  id="evidence_url_input"
                  placeholder="https://..."
                  defaultValue="https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80"
                  className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted uppercase block">Caption *</label>
                <input
                  type="text"
                  id="evidence_caption_input"
                  placeholder="e.g. Brake pad wear indicator showing friction wear."
                  defaultValue="Brake pad friction wear inspection photo."
                  className="w-full bg-obsidian border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setAttachEvidenceModalOpen(false)}
                className="flex-1 py-2.5 px-3 bg-graphite border border-graphite-border text-warm-white rounded-xs text-xs font-mono uppercase min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const urlInput = (document.getElementById('evidence_url_input') as HTMLInputElement)?.value;
                  const capInput = (document.getElementById('evidence_caption_input') as HTMLInputElement)?.value;

                  if (urlInput && activeInspection) {
                    const newEvidence: InspectionEvidence = {
                      id: 'ev-' + Date.now(),
                      inspection_id: activeInspection.id,
                      file_url: urlInput,
                      caption: capInput,
                      created_at: new Date().toISOString(),
                      uploaded_by: activeInspection.inspector_name,
                    };

                    onSaveInspection({
                      ...activeInspection,
                      evidence: [newEvidence, ...(activeInspection.evidence || [])],
                      updated_at: new Date().toISOString(),
                    });
                  }
                  setAttachEvidenceModalOpen(false);
                }}
                className="flex-1 py-2.5 px-3 bg-accent-gold text-obsidian rounded-xs text-xs font-bold font-mono uppercase hover:bg-white min-h-[44px]"
              >
                Attach Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 16. BULK ESTIMATE HANDOFF MODAL                             */}
      {/* ============================================================ */}
      {reviewRecommendationsModalOpen && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-graphite border border-accent-gold/40 rounded-xs p-6 max-w-xl w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block">
                  RECOMMENDATIONS FOR ESTIMATE
                </span>
                <h3 className="text-base font-bold text-warm-white uppercase">
                  {(activeInspection?.findings || []).filter((f) => f.add_to_estimate).length} items selected
                </h3>
              </div>
              <button
                onClick={() => setReviewRecommendationsModalOpen(false)}
                className="text-muted hover:text-warm-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted">
                The following inspection findings have been flagged for customer recommended work. Pricing is not fabricated and will be priced within Estimates & Approvals.
              </p>

              <div className="space-y-2">
                {(activeInspection?.findings || [])
                  .filter((f) => f.add_to_estimate)
                  .map((f, idx) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-xs bg-obsidian border border-graphite-border text-xs flex items-center justify-between gap-3 font-mono"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-warm-white block">
                          {idx + 1}. {f.recommendation}
                        </span>
                        <span className="text-[11px] text-muted-dark">
                          Origin: {f.category} ({f.component}) · Priority: {f.priority || 'NORMAL'}
                        </span>
                      </div>
                      <span className="text-accent-gold text-[10px] uppercase font-bold shrink-0">
                        Price not yet configured
                      </span>
                    </div>
                  ))}

                {(!activeInspection?.findings ||
                  activeInspection.findings.filter((f) => f.add_to_estimate).length === 0) && (
                  <p className="text-xs text-muted-dark font-mono p-4 text-center bg-obsidian rounded-xs">
                    No findings are currently flagged for estimate creation.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-graphite-border">
              <button
                onClick={() => setReviewRecommendationsModalOpen(false)}
                className="flex-1 py-2.5 px-3 bg-graphite border border-graphite-border text-warm-white rounded-xs text-xs font-mono uppercase min-h-[44px]"
              >
                Close
              </button>

              <button
                onClick={() => {
                  setReviewRecommendationsModalOpen(false);
                  if (onNavigateModule) onNavigateModule('estimates');
                }}
                className="flex-1 py-2.5 px-3 bg-accent-gold text-obsidian rounded-xs text-xs font-bold font-mono uppercase hover:bg-white transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <Calculator className="w-4 h-4" />
                <span>CREATE / UPDATE ESTIMATE →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 17. CUSTOMER VIEW PREVIEW MODAL                              */}
      {/* ============================================================ */}
      {customerPreviewModalOpen && activeInspection && (
        <div className="fixed inset-0 z-50 bg-obsidian/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-obsidian border border-purple-500/40 rounded-xs p-6 max-w-2xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 block font-bold">
                  CUSTOMER VEHICLE HEALTH REPORT
                </span>
                <h3 className="text-lg font-bold text-warm-white">
                  {activeInspection.vehicle_summary} ({activeInspection.registration})
                </h3>
                <p className="text-xs text-muted">
                  Inspected on {new Date(activeInspection.completed_at || activeInspection.started_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => setCustomerPreviewModalOpen(false)}
                className="text-muted hover:text-warm-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer-Friendly Overall Condition */}
            <div className="p-4 rounded-xs bg-graphite/40 border border-graphite-border space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-accent-gold block font-bold">
                Vehicle Inspection Overview
              </span>
              <p className="text-xs text-warm-white leading-relaxed">
                Our technicians performed a complete 12-point health evaluation on your vehicle. Below is the summary of components in good condition, items requiring attention, and technician recommendations.
              </p>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xs">
                  <span className="text-[10px] text-emerald-400 uppercase block font-bold">Good Condition</span>
                  <span className="text-base font-bold text-emerald-400">{conditionSummary.good} Items</span>
                </div>
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xs">
                  <span className="text-[10px] text-amber-400 uppercase block font-bold">Needs Attention</span>
                  <span className="text-base font-bold text-amber-400">{conditionSummary.attention} Items</span>
                </div>
                <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-xs">
                  <span className="text-[10px] text-red-400 uppercase block font-bold">Critical Items</span>
                  <span className="text-base font-bold text-red-400">{conditionSummary.critical} Items</span>
                </div>
              </div>
            </div>

            {/* Customer Findings List */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-warm-white">
                Detailed Technician Observations
              </h4>

              <div className="space-y-2.5">
                {(activeInspection.findings || []).map((f) => {
                  const isCrit = f.condition === 'CRITICAL';
                  return (
                    <div
                      key={f.id}
                      className={`p-3.5 rounded-xs border text-xs space-y-2 ${
                        isCrit
                          ? 'bg-red-500/10 border-red-500/40 text-red-200'
                          : 'bg-graphite/30 border-graphite-border text-warm-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-warm-white">
                          {f.component || f.category}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-xs uppercase font-bold ${
                            isCrit
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {f.condition === 'CRITICAL' ? 'Immediate Attention Required' : 'Attention Recommended'}
                        </span>
                      </div>

                      <p className="text-xs text-muted leading-relaxed">
                        {f.finding}
                      </p>

                      <div className="p-2.5 rounded-xs bg-obsidian/60 border border-graphite-border text-xs">
                        <span className="text-[10px] font-mono uppercase text-accent-gold block font-bold">
                          Recommended Solution:
                        </span>
                        <p className="text-warm-white font-medium mt-0.5">
                          {f.recommendation}
                        </p>
                      </div>

                      {f.photo_url && (
                        <div className="pt-1">
                          <img
                            src={f.photo_url}
                            alt={f.finding}
                            className="w-full h-40 object-cover rounded-xs border border-graphite-border"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {(!activeInspection.findings || activeInspection.findings.length === 0) && (
                  <p className="text-xs text-muted font-mono p-4 bg-graphite/20 rounded-xs text-center">
                    All inspected components are functioning within normal operational parameters.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-graphite-border flex justify-end">
              <button
                onClick={() => setCustomerPreviewModalOpen(false)}
                className="px-4 py-2 bg-purple-500 text-white rounded-xs text-xs font-mono font-bold uppercase hover:bg-white hover:text-obsidian"
              >
                Close Customer View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
