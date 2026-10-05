import React, { useState, useMemo, useRef } from 'react';
import type {
  JobCard,
  JobCardStatus,
  JobPriority,
  AppointmentRecord,
  InspectionRecord,
  EstimateRecord,
  TechnicianRecord,
} from '../../types';
import {
  STAGE_DISPLAY_MAP,
  updateJobStatus,
  createCustomerPortalToken,
  assignTechnicianToJob,
  reassignJobBay,
  syncTechnicianWorkloads,
  getTechnicians,
  getCustomers,
  getVehicles,
} from '../../lib/demoStore';
import {
  Search,
  Plus,
  ChevronLeft,
  X,
  Clock,
  Car,
  Phone,
  Mail,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Wrench,
  ClipboardList,
  Calculator,
  ShieldCheck,
  Truck,
  Check,
  AlertTriangle,
  Copy,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { MobileFormSheet } from '../../components/ui/MobileFormSheet';

export interface JobCardsViewProps {
  jobs: JobCard[];
  appointments?: AppointmentRecord[];
  inspections?: Record<string, InspectionRecord>;
  estimates?: Record<string, EstimateRecord>;
  onOpenJob?: (id: string) => void;
  onSaveNewJob: (job: JobCard) => void;
  onUpdateJob?: (job: JobCard) => void;
  onNavigateModule?: (module: any) => void;
  onOpenCustomerView?: (token: string) => void;
  onOpenQuoteToken?: (token: string) => void;
  selectedJobId?: string | null;
  onSelectJobId?: (id: string | null) => void;
}

const ADVISORS = ['Rohan Deshmukh', 'Pooja Varma', 'Vikram Malhotra'];
const STANDARD_BAYS = ['BAY 01', 'BAY 02', 'BAY 03', 'BAY 04'];
const PRIORITIES: JobPriority[] = ['URGENT', 'HIGH', 'NORMAL', 'LOW'];

// Standard QC check template
const DEFAULT_QC_CHECKS = [
  'Customer complaint scope verified and addressed',
  'Diagnostic scan completed and warning lights verified',
  'Engine, coolant and brake fluid levels checked',
  'Wheel fasteners checked and torque verified',
  'Road test completed and braking response verified',
  'Vehicle interior cleaned and final detailing completed',
  'Customer belongings and trunk inventory intact',
];

// Operational semantic status label mapper
export function getSemanticStatusLabel(status: JobCardStatus): string {
  switch (status) {
    case 'WORK_IN_PROGRESS':
      return 'WORK IN PROGRESS';
    case 'QUALITY_CHECK':
      return 'QUALITY CHECK';
    case 'ESTIMATE_SENT':
      return 'AWAITING CUSTOMER APPROVAL';
    case 'ESTIMATE_APPROVED':
      return 'ESTIMATE APPROVED';
    case 'VEHICLE_RECEIVED':
      return 'VEHICLE RECEIVED';
    case 'INSPECTION_COMPLETED':
      return 'INSPECTION COMPLETED';
    case 'READY_FOR_COLLECTION':
      return 'READY FOR COLLECTION';
    case 'DELIVERED':
      return 'DELIVERED';
    case 'CANCELLED':
      return 'CANCELLED';
    default:
      return (status as string).replace(/_/g, ' ');
  }
}

// 8-stage canonical workflow pipeline definition
const WORKFLOW_STAGES = [
  { key: 'VEHICLE_RECEIVED', label: '1. VEHICLE RECEIVED', step: 1 },
  { key: 'INSPECTION_COMPLETED', label: '2. INSPECTION', step: 2 },
  { key: 'ESTIMATE_SENT', label: '3. ESTIMATE DRAFTED', step: 3 },
  { key: 'ESTIMATE_APPROVED', label: '4. CUSTOMER APPROVAL', step: 4 },
  { key: 'WORK_IN_PROGRESS', label: '5. WORK IN PROGRESS', step: 5 },
  { key: 'QUALITY_CHECK', label: '6. QUALITY CHECK', step: 6 },
  { key: 'READY_FOR_COLLECTION', label: '7. READY FOR COLLECTION', step: 7 },
  { key: 'DELIVERED', label: '8. DELIVERED', step: 8 },
];

function getStageStepNumber(status: JobCardStatus): number {
  switch (status) {
    case 'VEHICLE_RECEIVED':
      return 1;
    case 'INSPECTION_COMPLETED':
      return 2;
    case 'ESTIMATE_SENT':
      return 3;
    case 'ESTIMATE_APPROVED':
      return 4;
    case 'WORK_IN_PROGRESS':
      return 5;
    case 'QUALITY_CHECK':
      return 6;
    case 'READY_FOR_COLLECTION':
      return 7;
    case 'DELIVERED':
      return 8;
    case 'CANCELLED':
      return 0;
    default:
      return 1;
  }
}

export const JobCardsView: React.FC<JobCardsViewProps> = ({
  jobs,
  appointments: _appointments = [],
  inspections = {},
  estimates = {},
  onOpenJob,
  onSaveNewJob,
  onUpdateJob,
  onNavigateModule,
  onOpenCustomerView,
  onOpenQuoteToken,
  selectedJobId: externalSelectedJobId,
  onSelectJobId,
}) => {
  // Master active check: DELIVERED and CANCELLED jobs are excluded from active work
  const isActiveJob = (job: JobCard) => job.status !== 'DELIVERED' && job.status !== 'CANCELLED';

  // Internal selection if not externally controlled
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    jobs.find(isActiveJob)?.id || jobs[0]?.id || null
  );
  const activeJobId = externalSelectedJobId !== undefined ? externalSelectedJobId : internalSelectedId;

  const setActiveJobId = (id: string | null) => {
    if (onSelectJobId) {
      onSelectJobId(id);
    } else {
      setInternalSelectedId(id);
    }
    if (id && onOpenJob) {
      onOpenJob(id);
    }
  };

  // Mobile detail drawer toggle (< 1024px)
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [kpiFilter, setKpiFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [technicianFilter, setTechnicianFilter] = useState<string>('ALL');
  const [bayFilter, setBayFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'PROMISED' | 'ID_DESC' | 'PRIORITY' | 'CUSTOMER' | 'VEHICLE' | 'STATUS' | 'LATEST_ACTIVITY'>('PROMISED');

  // Interactive Action Notice Toast
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Dynamic lists from store
  const availableTechnicians = useMemo(() => {
    try {
      const stored = getTechnicians();
      if (stored && stored.length > 0) return stored;
    } catch {
      // fallback
    }
    return [
      { id: 'tech-1', name: 'Arjun Sharma', specialization: 'Master Diagnostic Tech', status: 'BUSY', active_jobs_count: 1, assigned_job_ids: ['JC-2047'], phone: '+91 98201 22334' },
      { id: 'tech-2', name: 'Rahul Sen', specialization: 'Senior Mechanical Tech', status: 'AVAILABLE', active_jobs_count: 1, assigned_job_ids: ['JC-2048'], phone: '+91 98201 33445' },
      { id: 'tech-3', name: 'Farhan Akhtar', specialization: 'Electrical Specialist', status: 'AVAILABLE', active_jobs_count: 0, assigned_job_ids: [], phone: '+91 98201 44556' },
      { id: 'tech-4', name: 'Vikram Singh', specialization: 'Transmission Tech', status: 'AVAILABLE', active_jobs_count: 0, assigned_job_ids: [], phone: '+91 98201 55667' },
    ] as TechnicianRecord[];
  }, []);

  const availableCustomers = useMemo(() => {
    try {
      return Object.values(getCustomers());
    } catch {
      return [];
    }
  }, []);

  const availableVehicles = useMemo(() => {
    try {
      return Object.values(getVehicles());
    } catch {
      return [];
    }
  }, []);

  // 6-Step New Job Card Modal State
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [customerMode, setCustomerMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [custName, setCustName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [vehicleMode, setVehicleMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [vehicleSummary, setVehicleSummary] = useState('');
  const [reg, setReg] = useState('');
  const [vin, setVin] = useState('');
  const [odometer, setOdometer] = useState<number | ''>(32000);
  const [fuelLevel, setFuelLevel] = useState('60%');

  const [service, setService] = useState('Periodic Service + Diagnostics');
  const [complaint, setComplaint] = useState('');
  const [priority, setPriority] = useState<JobPriority>('NORMAL');

  const [advisor, setAdvisor] = useState('Rohan Deshmukh');
  const [technician, setTechnician] = useState('Arjun Sharma');
  const [bay, setBay] = useState('BAY 01');

  const [promisedHours, setPromisedHours] = useState(6);
  const [customPromisedDate, setCustomPromisedDate] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  // Reassignment Modals
  const [reassignTechModalOpen, setReassignTechModalOpen] = useState(false);
  const [targetTechSelection, setTargetTechSelection] = useState('');
  const [techReassignReason, setTechReassignReason] = useState('');

  const [reassignBayModalOpen, setReassignBayModalOpen] = useState(false);
  const [targetBaySelection, setTargetBaySelection] = useState('');
  const [bayReassignReason, setBayReassignReason] = useState('');

  // Hold / Pause Modal
  const [waitingModalOpen, setWaitingModalOpen] = useState(false);
  const [waitingReasonInput, setWaitingReasonInput] = useState('WAITING FOR PARTS');
  const [waitingCustomNote, setWaitingCustomNote] = useState('');

  // Delivery Handover Modal
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [deliveryHandoverNotes, setDeliveryHandoverNotes] = useState('');
  const [deliveryAdvisorSign, setDeliveryAdvisorSign] = useState('Rohan Deshmukh');
  const [customerSignoffName, setCustomerSignoffName] = useState('');
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Copy tracking feedback
  const [copiedLink, setCopiedLink] = useState(false);

  // Helper to determine if a job is overdue (must be active and promised timestamp deterministically elapsed)
  const isOverdue = (job: JobCard) => {
    if (!isActiveJob(job)) return false;
    if (!job.promised_completion) return false;
    try {
      const promised = new Date(job.promised_completion).getTime();
      return !isNaN(promised) && promised < Date.now();
    } catch {
      return false;
    }
  };

  // Operational KPIs derived strictly from canonical job cards state
  const kpiMetrics = useMemo(() => {
    const active = jobs.filter(isActiveJob);
    const vehiclesInWorkshop = active.filter(
      (j) => j.bay && j.bay !== 'UNASSIGNED' && j.bay !== 'COMPLETED ARCHIVE'
    );
    const awaitingApproval = active.filter(
      (j) => j.status === 'ESTIMATE_SENT' || (j.approval_status === 'PENDING' && j.status !== 'VEHICLE_RECEIVED')
    );
    const inProgress = active.filter((j) => j.status === 'WORK_IN_PROGRESS');
    const qualityCheck = active.filter((j) => j.status === 'QUALITY_CHECK');
    const readyForCollection = active.filter((j) => j.status === 'READY_FOR_COLLECTION');
    const unassigned = active.filter(
      (j) => !j.technician || j.technician.toLowerCase() === 'unassigned'
    );

    // Deterministic overdue calculation
    const determinableOverdue = active.filter(isOverdue);

    return {
      active: active.length,
      vehiclesInWorkshop: vehiclesInWorkshop.length,
      awaitingApproval: awaitingApproval.length,
      inProgress: inProgress.length,
      qualityCheck: qualityCheck.length,
      readyForCollection: readyForCollection.length,
      unassigned: unassigned.length,
      overdue: determinableOverdue.length,
    };
  }, [jobs]);

  // Handle KPI Strip Click with Toggle-to-Clear
  const handleKpiClick = (targetKpi: string) => {
    if (kpiFilter === targetKpi) {
      setKpiFilter('ALL');
    } else {
      setKpiFilter(targetKpi);
      setStatusFilter('ALL');
    }
  };

  // Filtered Job Cards Queue
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((j) => {
        // By default, the active operating queue excludes DELIVERED and CANCELLED jobs unless explicitly selected in the status filter
        if (statusFilter === 'ALL' && kpiFilter === 'ALL') {
          if (!isActiveJob(j)) return false;
        }

        // KPI Strip filter
        if (kpiFilter === 'ACTIVE' && !isActiveJob(j)) return false;
        if (kpiFilter === 'VEHICLES_IN_WORKSHOP') {
          if (!isActiveJob(j) || !j.bay || j.bay === 'UNASSIGNED' || j.bay === 'COMPLETED ARCHIVE') {
            return false;
          }
        }
        if (kpiFilter === 'AWAITING_APPROVAL') {
          const isAwaiting =
            isActiveJob(j) &&
            (j.status === 'ESTIMATE_SENT' ||
              (j.approval_status === 'PENDING' && j.status !== 'VEHICLE_RECEIVED'));
          if (!isAwaiting) return false;
        }
        if (kpiFilter === 'IN_PROGRESS' && (!isActiveJob(j) || j.status !== 'WORK_IN_PROGRESS')) return false;
        if (kpiFilter === 'QUALITY_CHECK' && (!isActiveJob(j) || j.status !== 'QUALITY_CHECK')) return false;
        if (kpiFilter === 'READY_FOR_COLLECTION' && (!isActiveJob(j) || j.status !== 'READY_FOR_COLLECTION')) return false;
        if (kpiFilter === 'UNASSIGNED') {
          if (!isActiveJob(j) || (j.technician && j.technician.toLowerCase() !== 'unassigned')) return false;
        }
        if (kpiFilter === 'OVERDUE' && !isOverdue(j)) return false;

        // Secondary status filter
        if (statusFilter !== 'ALL' && j.status !== statusFilter) return false;

        // Technician filter
        if (technicianFilter !== 'ALL') {
          if (technicianFilter === 'UNASSIGNED') {
            if (j.technician && j.technician.toLowerCase() !== 'unassigned') return false;
          } else if (j.technician !== technicianFilter) {
            return false;
          }
        }

        // Bay filter
        if (bayFilter !== 'ALL') {
          if (bayFilter === 'UNASSIGNED') {
            if (j.bay && j.bay !== 'UNASSIGNED') return false;
          } else if (j.bay !== bayFilter) {
            return false;
          }
        }

        // Priority filter
        if (priorityFilter !== 'ALL' && (j.priority || 'NORMAL') !== priorityFilter) return false;

        // Search match: Job Card ID, customer name, customer phone, registration number, vehicle make, vehicle model, technician, advisor, service name
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchId = j.id.toLowerCase().includes(q);
          const matchCust = j.customer_name.toLowerCase().includes(q);
          const matchPhone = j.customer_phone.toLowerCase().includes(q);
          const matchVeh = j.vehicle_summary.toLowerCase().includes(q);
          const matchReg = j.registration.toLowerCase().includes(q);
          const matchSvc = j.service_name.toLowerCase().includes(q);
          const matchTech = j.technician ? j.technician.toLowerCase().includes(q) : false;
          const matchAdv = j.advisor ? j.advisor.toLowerCase().includes(q) : false;

          if (!matchId && !matchCust && !matchPhone && !matchVeh && !matchReg && !matchSvc && !matchTech && !matchAdv) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'PROMISED') {
          return new Date(a.promised_completion).getTime() - new Date(b.promised_completion).getTime();
        }
        if (sortBy === 'ID_DESC') {
          return b.id.localeCompare(a.id);
        }
        if (sortBy === 'CUSTOMER') {
          return a.customer_name.localeCompare(b.customer_name);
        }
        if (sortBy === 'VEHICLE') {
          return a.vehicle_summary.localeCompare(b.vehicle_summary);
        }
        if (sortBy === 'STATUS') {
          return a.status.localeCompare(b.status);
        }
        if (sortBy === 'LATEST_ACTIVITY') {
          const timeA = a.timeline && a.timeline.length > 0 ? new Date(a.timeline[a.timeline.length - 1].timestamp).getTime() : 0;
          const timeB = b.timeline && b.timeline.length > 0 ? new Date(b.timeline[b.timeline.length - 1].timestamp).getTime() : 0;
          return timeB - timeA;
        }
        if (sortBy === 'PRIORITY') {
          const priorityWeight: Record<JobPriority, number> = {
            URGENT: 4,
            HIGH: 3,
            NORMAL: 2,
            LOW: 1,
          };
          const pa = priorityWeight[a.priority || 'NORMAL'] || 2;
          const pb = priorityWeight[b.priority || 'NORMAL'] || 2;
          return pb - pa;
        }
        return 0;
      });
  }, [
    jobs,
    kpiFilter,
    statusFilter,
    technicianFilter,
    bayFilter,
    priorityFilter,
    search,
    sortBy,
  ]);

  // Active Job Card Dossier Record
  const activeJob = useMemo(() => {
    if (!activeJobId) return filteredJobs[0] || jobs[0] || null;
    return jobs.find((j) => j.id === activeJobId) || filteredJobs[0] || jobs[0] || null;
  }, [jobs, activeJobId, filteredJobs]);

  // Associated inspection & estimate records for active job
  const activeInspection = activeJob ? inspections[activeJob.id] || null : null;
  const activeEstimate = activeJob ? estimates[activeJob.id] || null : null;

  // Secondary Contextual Queues (Exceptions & Action Stages)
  const secondaryQueues = useMemo(() => {
    const active = jobs.filter(isActiveJob);
    return {
      unassignedTech: active.filter(
        (j) => !j.technician || j.technician.toLowerCase() === 'unassigned'
      ),
      awaitingBay: active.filter((j) => !j.bay || j.bay === 'UNASSIGNED'),
      awaitingApproval: active.filter(
        (j) => j.status === 'ESTIMATE_SENT' || (j.approval_status === 'PENDING' && j.status !== 'VEHICLE_RECEIVED')
      ),
      qualityCheck: active.filter((j) => j.status === 'QUALITY_CHECK'),
      readyForCollection: active.filter((j) => j.status === 'READY_FOR_COLLECTION'),
    };
  }, [jobs]);

  // Handle Customer Selection in Step 1
  const handleSelectExistingCustomer = (cId: string) => {
    setSelectedCustomerId(cId);
    const c = availableCustomers.find((item) => item.id === cId);
    if (c) {
      setCustName(c.name);
      setPhone(c.phone);
      setEmail(c.email || '');
    }
  };

  // Handle Vehicle Selection in Step 2
  const handleSelectExistingVehicle = (vId: string) => {
    setSelectedVehicleId(vId);
    const v = availableVehicles.find((item) => item.id === vId);
    if (v) {
      setVehicleSummary(`${v.year} ${v.make} ${v.model}`);
      setReg(v.registration);
      setVin(v.vin_masked || '');
      setOdometer(v.odometer || 32000);
    }
  };

  // 6-Step Job Card Creation Submit
  const handleCreateJobCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !phone.trim() || !vehicleSummary.trim() || !reg.trim()) {
      showNotice('Please complete required customer and vehicle fields.');
      return;
    }

    const nextNumber = 2053 + jobs.length;
    const newId = `JC-${nextNumber}`;
    const token = `track-jc${nextNumber}-${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    let promisedIso: string;
    if (customPromisedDate) {
      promisedIso = new Date(customPromisedDate).toISOString();
    } else {
      promisedIso = new Date(Date.now() + promisedHours * 3600 * 1000).toISOString();
    }

    const newJob: JobCard = {
      id: newId,
      customer_id: selectedCustomerId || 'cust-' + Date.now(),
      customer_name: custName.trim(),
      customer_phone: phone.trim(),
      customer_email: email.trim() || undefined,
      vehicle_id: selectedVehicleId || 'veh-' + Date.now(),
      vehicle_summary: vehicleSummary.trim(),
      registration: reg.trim().toUpperCase(),
      vin_masked: vin.trim() || undefined,
      service_name: service.trim(),
      customer_complaint: complaint.trim() || 'Scheduled vehicle maintenance and technical inspection.',
      intake_notes: internalNotes.trim() || `Intake accepted by advisor ${advisor}.`,
      advisor: advisor,
      technician: technician,
      bay: bay,
      opened_at: nowIso,
      promised_completion: promisedIso,
      odometer: typeof odometer === 'number' ? odometer : 32000,
      fuel_level: fuelLevel,
      status: 'VEHICLE_RECEIVED',
      priority: priority,
      estimate_total: 0,
      approval_status: 'PENDING',
      public_token: token,
      work_items: [
        {
          id: 'wi-init-1',
          description: service,
          type: 'Labour',
          quantity: 1,
          unit: 'Job',
          estimated_amount: 3500,
          status: 'PENDING',
        },
      ],
      qc_checklist: DEFAULT_QC_CHECKS.map((chk, idx) => ({
        id: `qc-${idx + 1}`,
        label: chk,
        result: 'NOT_APPLICABLE',
      })),
      timeline: [
        {
          id: 'tl-' + Date.now(),
          timestamp: nowIso,
          status: 'VEHICLE_RECEIVED',
          event_label: 'Vehicle Received & Job Card Issued',
          actor: `${advisor} (Advisor)`,
          customer_visible: true,
          notes: `Operational intake completed. Assigned to ${technician} at ${bay}.`,
        },
      ],
    };

    onSaveNewJob(newJob);

    // If technician assigned, synchronize technician workload
    if (technician && technician.toLowerCase() !== 'unassigned') {
      assignTechnicianToJob(
        newId,
        technician,
        'Initial intake assignment',
        `${advisor} (Advisor)`
      );
    }

    setNewModalOpen(false);
    setWizardStep(1);
    setActiveJobId(newId);
    showNotice(`Job Card ${newId} created successfully.`);
  };

  // State Transitions helper
  const handleTransitionState = (targetStatus: JobCardStatus, noteMsg?: string) => {
    if (!activeJob) return;

    // Gate: Quality check moving to READY_FOR_COLLECTION requires all applicable items passed
    if (activeJob.status === 'QUALITY_CHECK' && targetStatus === 'READY_FOR_COLLECTION') {
      const checklist = activeJob.qc_checklist || [];
      const hasFails = checklist.some((c) => c.result === 'FAIL');
      const pendingChecks = checklist.filter((c) => c.result === 'NOT_APPLICABLE');
      if (hasFails) {
        showNotice('Cannot move to Ready for Collection: QC contains failed inspection items.');
        return;
      }
      if (pendingChecks.length === checklist.length) {
        showNotice('Please complete QC checklist pass/fail verifications first.');
        return;
      }
    }

    const res = updateJobStatus(
      activeJob.id,
      targetStatus,
      `${activeJob.advisor || 'Rohan Deshmukh'} (Advisor)`,
      noteMsg || `Stage updated to ${STAGE_DISPLAY_MAP[targetStatus]}`
    );

    if (res.success && res.job) {
      if (onUpdateJob) onUpdateJob(res.job);
      showNotice(`Job Card ${activeJob.id} moved to ${getSemanticStatusLabel(targetStatus)}.`);
    }
  };

  // Reassign Technician Submit using canonical assignTechnicianToJob
  const handleReassignTechSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob || !targetTechSelection) return;

    const res = assignTechnicianToJob(
      activeJob.id,
      targetTechSelection,
      techReassignReason || 'Reassigned via Job Card console',
      `${activeJob.advisor || 'Rohan Deshmukh'} (Advisor)`
    );

    if (res.success && res.job) {
      syncTechnicianWorkloads();
      if (onUpdateJob) onUpdateJob(res.job);
      setReassignTechModalOpen(false);
      setTechReassignReason('');
      showNotice(`Technician for ${activeJob.id} updated to ${res.job.technician}.`);
    } else {
      showNotice(res.error || 'Technician assignment failed.');
    }
  };

  // Reassign Bay Submit using canonical reassignJobBay
  const handleReassignBaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob || !targetBaySelection) return;

    const res = reassignJobBay(
      activeJob.id,
      targetBaySelection,
      bayReassignReason || 'Reassigned via Job Card console',
      `${activeJob.advisor || 'Rohan Deshmukh'} (Advisor)`
    );

    if (res.success && res.job) {
      if (onUpdateJob) onUpdateJob(res.job);
      setReassignBayModalOpen(false);
      setBayReassignReason('');
      showNotice(`Bay for ${activeJob.id} updated to ${res.job.bay}.`);
    } else {
      showNotice(res.error || 'Bay assignment failed.');
    }
  };

  // Pause / Waiting submit
  const handleWaitingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob) return;

    const fullReason = waitingCustomNote.trim()
      ? `${waitingReasonInput}: ${waitingCustomNote.trim()}`
      : waitingReasonInput;

    const updated: JobCard = {
      ...activeJob,
      waiting_reason: fullReason,
      waiting_since: new Date().toISOString(),
      timeline: [
        ...activeJob.timeline,
        {
          id: 'tl-' + Date.now(),
          timestamp: new Date().toISOString(),
          status: activeJob.status,
          event_label: 'Execution Paused — Waiting State',
          actor: `${activeJob.advisor} (Advisor)`,
          customer_visible: true,
          notes: `Execution paused: ${fullReason}`,
        },
      ],
    };

    if (onUpdateJob) onUpdateJob(updated);
    setWaitingModalOpen(false);
    showNotice(`Job ${activeJob.id} placed on hold: ${fullReason}`);
  };

  // Resume from waiting
  const handleResumeWork = () => {
    if (!activeJob) return;
    const updated: JobCard = {
      ...activeJob,
      waiting_reason: undefined,
      waiting_since: undefined,
      timeline: [
        ...activeJob.timeline,
        {
          id: 'tl-' + Date.now(),
          timestamp: new Date().toISOString(),
          status: activeJob.status,
          event_label: 'Workshop Execution Resumed',
          actor: `${activeJob.technician || 'Technician'} (Technician)`,
          customer_visible: true,
          notes: 'Waiting condition cleared. Commenced active service operations.',
        },
      ],
    };

    if (onUpdateJob) onUpdateJob(updated);
    showNotice(`Waiting state cleared for ${activeJob.id}. Resumed active work.`);
  };

  // Handover & Delivery Submit
  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob) return;

    let signatureBase64: string | undefined = undefined;
    if (signatureCanvasRef.current && hasDrawnSignature) {
      try {
        signatureBase64 = signatureCanvasRef.current.toDataURL('image/png');
      } catch (err) {
        console.error('Failed to export canvas signature', err);
      }
    }

    const nowIso = new Date().toISOString();
    const updated: JobCard = {
      ...activeJob,
      status: 'DELIVERED',
      delivered_at: nowIso,
      customer_signature: signatureBase64,
      handover_signoff_name: customerSignoffName.trim() || (signatureBase64 ? activeJob.customer_name : undefined),
      handover_signoff_at: signatureBase64 ? nowIso : undefined,
      delivery_notes: deliveryHandoverNotes.trim() || 'Vehicle handed over in clean and road-tested condition.',
      timeline: [
        ...activeJob.timeline,
        {
          id: 'tl-' + Date.now(),
          timestamp: nowIso,
          status: 'DELIVERED',
          event_label: 'Vehicle Handed Over & Released to Owner',
          actor: `${deliveryAdvisorSign} (Advisor)`,
          customer_visible: true,
          notes: deliveryHandoverNotes.trim() || 'Service handover signed. Keys released.',
        },
      ],
    };

    if (onUpdateJob) onUpdateJob(updated);
    setDeliveryModalOpen(false);
    showNotice(`Job Card ${activeJob.id} successfully marked as DELIVERED.`);
  };

  // Copy tracking link helper
  const handleCopyLink = () => {
    if (!activeJob) return;
    const token = activeJob.public_token || createCustomerPortalToken(activeJob.id);
    const trackingUrl = `${window.location.origin}/?page=status&jobToken=${token}`;
    navigator.clipboard.writeText(trackingUrl).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Semantic Status Badge Helper
  const renderSemanticBadge = (st: JobCardStatus, isWaiting?: boolean) => {
    if (st === 'ESTIMATE_SENT') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
          <Calculator className="w-2.5 h-2.5" />
          AWAITING CUSTOMER APPROVAL
        </span>
      );
    }
    if (isWaiting) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/40">
          <AlertTriangle className="w-2.5 h-2.5" />
          ON HOLD / PAUSED
        </span>
      );
    }
    switch (st) {
      case 'VEHICLE_RECEIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-2.5 h-2.5" />
            VEHICLE RECEIVED
          </span>
        );
      case 'INSPECTION_COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <ClipboardList className="w-2.5 h-2.5" />
            INSPECTION COMPLETED
          </span>
        );
      case 'ESTIMATE_APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-2.5 h-2.5" />
            ESTIMATE APPROVED
          </span>
        );
      case 'WORK_IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/40">
            <Wrench className="w-2.5 h-2.5" />
            WORK IN PROGRESS
          </span>
        );
      case 'QUALITY_CHECK':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            <ShieldCheck className="w-2.5 h-2.5" />
            QUALITY CHECK
          </span>
        );
      case 'READY_FOR_COLLECTION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <Check className="w-2.5 h-2.5" />
            READY FOR COLLECTION
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-graphite text-muted border border-graphite-border">
            <Truck className="w-2.5 h-2.5" />
            DELIVERED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/30">
            <X className="w-2.5 h-2.5" />
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-graphite text-muted">
            {st}
          </span>
        );
    }
  };

  // Priority Badge UI helper
  const renderPriorityBadge = (p?: JobPriority) => {
    switch (p) {
      case 'URGENT':
        return (
          <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-mono font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
            URGENT
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-mono font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
            HIGH
          </span>
        );
      case 'LOW':
        return (
          <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-mono text-muted-dark uppercase bg-graphite border border-graphite-border">
            LOW
          </span>
        );
      case 'NORMAL':
      default:
        return (
          <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-mono text-muted uppercase bg-graphite/60 border border-graphite-border">
            NORMAL
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-4 right-4 z-50 bg-obsidian border border-accent-gold/50 text-warm-white text-xs px-4 py-2.5 rounded-xs shadow-xl flex items-center gap-2 font-mono animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-graphite-border">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-accent-gold block">
            WORKSHOP OPERATIONS
          </span>
          <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tight text-warm-white mt-0.5">
            JOB CARDS
          </h1>
          <p className="text-xs text-muted font-light mt-1 max-w-2xl">
            Central service records for vehicle intake, inspection, approval, execution and delivery.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setWizardStep(1);
              setNewModalOpen(true);
            }}
            data-testid="new-job-card"
            id="btn-new-job-card"
            className="px-4 py-2.5 bg-accent-gold text-obsidian rounded-xs text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors inline-flex items-center gap-2 shadow-sm min-h-[44px]"
          >
            <Plus className="w-4 h-4 text-obsidian stroke-[2.5]" />
            <span>+ NEW JOB CARD</span>
          </button>
        </div>
      </div>

      {/* 2. OPERATIONAL KPI STRIP (8 Canonical Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {/* KPI 1: TOTAL ACTIVE JOBS */}
        <button
          onClick={() => handleKpiClick('ACTIVE')}
          data-testid="jobs-kpi-active"
          className={`p-3 rounded-xs border text-left transition-all min-h-[64px] ${
            kpiFilter === 'ACTIVE'
              ? 'bg-graphite border-accent-gold ring-1 ring-accent-gold/40'
              : 'bg-graphite/40 border-graphite-border hover:border-graphite-border/80'
          }`}
        >
          <span className="text-[9px] font-mono uppercase block truncate text-muted">
            TOTAL ACTIVE JOBS
          </span>
          <span className="text-xl font-black text-warm-white font-mono mt-0.5 block">
            {kpiMetrics.active}
          </span>
          <span className="text-[9px] text-muted-dark font-mono block truncate">Non-Delivered</span>
        </button>

        {/* KPI 2: VEHICLES IN WORKSHOP */}
        <button
          onClick={() => handleKpiClick('VEHICLES_IN_WORKSHOP')}
          className={`p-3 rounded-xs border text-left transition-all min-h-[64px] ${
            kpiFilter === 'VEHICLES_IN_WORKSHOP'
              ? 'bg-graphite border-accent-gold ring-1 ring-accent-gold/40'
              : 'bg-graphite/40 border-graphite-border hover:border-graphite-border/80'
          }`}
        >
          <span className="text-[9px] font-mono uppercase block truncate text-muted">
            VEHICLES IN WORKSHOP
          </span>
          <span className="text-xl font-black text-warm-white font-mono mt-0.5 block">
            {kpiMetrics.vehiclesInWorkshop}
          </span>
          <span className="text-[9px] text-muted-dark font-mono block truncate">Assigned Bay</span>
        </button>

        {/* KPI 3: AWAITING APPROVAL */}
        <button
          onClick={() => handleKpiClick('AWAITING_APPROVAL')}
          data-testid="jobs-kpi-approval"
          className={`p-3 rounded-xs border text-left transition-all min-h-[64px] ${
            kpiFilter === 'AWAITING_APPROVAL'
              ? 'bg-graphite border-accent-gold ring-1 ring-accent-gold/40'
              : 'bg-graphite/40 border-graphite-border hover:border-graphite-border/80'
          }`}
        >
          <span className="text-[9px] font-mono uppercase block truncate text-amber-400">
            AWAITING APPROVAL
          </span>
          <span className="text-xl font-black text-amber-300 font-mono mt-0.5 block">
            {kpiMetrics.awaitingApproval}
          </span>
          <span className="text-[9px] text-muted-dark font-mono block truncate">Estimate Scope</span>
        </button>

        {/* KPI 4: WORK IN PROGRESS */}
        <button
          onClick={() => handleKpiClick('IN_PROGRESS')}
          data-testid="jobs-kpi-progress"
          className={`p-3 rounded-xs border text-left transition-all min-h-[64px] ${
            kpiFilter === 'IN_PROGRESS'
              ? 'bg-graphite border-accent-gold ring-1 ring-accent-gold/40'
              : 'bg-graphite/40 border-graphite-border hover:border-graphite-border/80'
          }`}
        >
          <span className="text-[9px] font-mono uppercase block truncate text-blue-400">
            WORK IN PROGRESS
          </span>
          <span className="text-xl font-black text-warm-white font-mono mt-0.5 block">
            {kpiMetrics.inProgress}
          </span>
          <span className="text-[9px] text-muted-dark font-mono block truncate">Active Wrench</span>
        </button>

        {/* KPI 5: QUALITY CHECK */}
        <button
          onClick={() => handleKpiClick('QUALITY_CHECK')}
          data-testid="jobs-kpi-qc"
          className={`p-3 rounded-xs border text-left transition-all min-h-[64px] ${
            kpiFilter === 'QUALITY_CHECK'
              ? 'bg-graphite border-accent-gold ring-1 ring-accent-gold/40'
              : 'bg-graphite/40 border-graphite-border hover:border-graphite-border/80'
          }`}
        >
          <span className="text-[9px] font-mono uppercase block truncate text-indigo-400">
            QUALITY CHECK
          </span>
          <span className="text-xl font-black text-warm-white font-mono mt-0.5 block">
            {kpiMetrics.qualityCheck}
          </span>
          <span className="text-[9px] text-muted-dark font-mono block truncate">QC Audit</span>
        </button>

        {/* KPI 6: READY FOR COLLECTION */}
        <button
          onClick={() => handleKpiClick('READY_FOR_COLLECTION')}
          className={`p-3 rounded-xs border text-left transition-all min-h-[64px] ${
            kpiFilter === 'READY_FOR_COLLECTION'
              ? 'bg-graphite border-accent-gold ring-1 ring-accent-gold/40'
              : 'bg-graphite/40 border-graphite-border hover:border-graphite-border/80'
          }`}
        >
          <span className="text-[9px] font-mono uppercase block truncate text-emerald-400">
            READY FOR COLLECTION
          </span>
          <span className="text-xl font-black text-warm-white font-mono mt-0.5 block">
            {kpiMetrics.readyForCollection}
          </span>
          <span className="text-[9px] text-muted-dark font-mono block truncate">Pickup Staged</span>
        </button>

        {/* KPI 7: UNASSIGNED */}
        <button
          onClick={() => handleKpiClick('UNASSIGNED')}
          data-testid="jobs-kpi-unassigned"
          className={`p-3 rounded-xs border text-left transition-all min-h-[64px] ${
            kpiFilter === 'UNASSIGNED'
              ? 'bg-graphite border-accent-gold ring-1 ring-accent-gold/40'
              : kpiMetrics.unassigned > 0
              ? 'bg-amber-500/10 border-amber-500/40 hover:border-amber-500/70'
              : 'bg-graphite/40 border-graphite-border hover:border-graphite-border/80'
          }`}
        >
          <span
            className={`text-[9px] font-mono uppercase block truncate ${
              kpiMetrics.unassigned > 0 ? 'text-amber-400 font-bold' : 'text-muted'
            }`}
          >
            UNASSIGNED
          </span>
          <span className="text-xl font-black text-warm-white font-mono mt-0.5 block">
            {kpiMetrics.unassigned}
          </span>
          <span className="text-[9px] text-muted-dark font-mono block truncate">No Lead Tech</span>
        </button>

        {/* KPI 8: OVERDUE */}
        <button
          onClick={() => handleKpiClick('OVERDUE')}
          className={`p-3 rounded-xs border text-left transition-all min-h-[64px] ${
            kpiFilter === 'OVERDUE'
              ? 'bg-graphite border-accent-gold ring-1 ring-accent-gold/40'
              : kpiMetrics.overdue > 0
              ? 'bg-red-500/10 border-red-500/40 hover:border-red-500/70'
              : 'bg-graphite/40 border-graphite-border hover:border-graphite-border/80'
          }`}
        >
          <span
            className={`text-[9px] font-mono uppercase block truncate ${
              kpiMetrics.overdue > 0 ? 'text-red-400 font-bold' : 'text-muted'
            }`}
          >
            OVERDUE
          </span>
          <span className="text-xl font-black font-mono mt-0.5 block text-warm-white">
            {kpiMetrics.overdue}
          </span>
          <span className="text-[9px] text-muted-dark font-mono block truncate">Promised Elapsed</span>
        </button>
      </div>

      {/* 3. SEARCH & COMPACT OPERATIONAL FILTERS */}
      <div className="bg-graphite/30 border border-graphite-border rounded-xs p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-muted flex items-center gap-2 flex-wrap">
            <span>
              Queue: <strong className="text-warm-white">{filteredJobs.length}</strong> records in view
            </span>
            {kpiFilter !== 'ALL' && (
              <span className="px-2 py-0.5 bg-accent-gold/15 text-accent-gold rounded-xs border border-accent-gold/30 uppercase text-[10px]">
                Filter: {kpiFilter.replace(/_/g, ' ')}
              </span>
            )}
            {(kpiFilter !== 'ALL' ||
              statusFilter !== 'ALL' ||
              technicianFilter !== 'ALL' ||
              bayFilter !== 'ALL' ||
              priorityFilter !== 'ALL' ||
              search) && (
              <button
                onClick={() => {
                  setKpiFilter('ALL');
                  setStatusFilter('ALL');
                  setTechnicianFilter('ALL');
                  setBayFilter('ALL');
                  setPriorityFilter('ALL');
                  setSearch('');
                }}
                className="text-accent-gold hover:underline inline-flex items-center gap-1 font-bold ml-1 min-h-[30px]"
              >
                <RotateCcw className="w-3 h-3" /> Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-dark uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-obsidian border border-graphite-border rounded-xs px-2.5 py-1.5 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[36px]"
            >
              <option value="PROMISED">Promised Delivery</option>
              <option value="ID_DESC">Job ID</option>
              <option value="VEHICLE">Vehicle</option>
              <option value="CUSTOMER">Customer</option>
              <option value="PRIORITY">Priority / Urgency</option>
              <option value="STATUS">Status</option>
              <option value="LATEST_ACTIVITY">Latest Activity</option>
            </select>
          </div>
        </div>

        {/* Search Field & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 border-t border-graphite-border/70">
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Job ID, Registration, Customer, Vehicle, Technician..."
              className="w-full bg-obsidian border border-graphite-border rounded-xs pl-8 pr-3 py-2 text-xs text-warm-white placeholder:text-muted-dark focus:outline-none focus:border-accent-gold min-h-[44px]"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setKpiFilter('ALL');
              }}
              className="w-full bg-obsidian border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
            >
              <option value="ALL">All Statuses</option>
              <option value="VEHICLE_RECEIVED">Vehicle Received</option>
              <option value="INSPECTION_COMPLETED">Inspection</option>
              <option value="ESTIMATE_SENT">Awaiting Customer Approval</option>
              <option value="ESTIMATE_APPROVED">Estimate Approved</option>
              <option value="WORK_IN_PROGRESS">Work In Progress</option>
              <option value="QUALITY_CHECK">Quality Check</option>
              <option value="READY_FOR_COLLECTION">Ready for Collection</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <select
              value={technicianFilter}
              onChange={(e) => setTechnicianFilter(e.target.value)}
              className="w-full bg-obsidian border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
            >
              <option value="ALL">All Technicians</option>
              {availableTechnicians.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
              <option value="UNASSIGNED">Unassigned</option>
            </select>
          </div>

          <div>
            <select
              value={bayFilter}
              onChange={(e) => setBayFilter(e.target.value)}
              className="w-full bg-obsidian border border-graphite-border rounded-xs px-2.5 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[44px]"
            >
              <option value="ALL">All Bays</option>
              {STANDARD_BAYS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
              <option value="UNASSIGNED">Unassigned</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. WORKSPACE: ~65% MAIN QUEUE + ~35% STICKY DOSSIER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Main Job Card Queue (~65%) */}
        <div className="lg:col-span-7 space-y-3">
          {filteredJobs.length === 0 ? (
            <div className="p-12 text-center rounded-xs bg-obsidian border border-graphite-border space-y-3">
              <Car className="w-8 h-8 text-muted-dark mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-mono text-warm-white uppercase font-bold">
                  No Job Cards in Current View
                </p>
                <p className="text-[11px] text-muted-dark">
                  No records match your active search or filter criteria.
                </p>
              </div>
              <button
                onClick={() => {
                  setKpiFilter('ALL');
                  setStatusFilter('ALL');
                  setTechnicianFilter('ALL');
                  setBayFilter('ALL');
                  setPriorityFilter('ALL');
                  setSearch('');
                }}
                className="px-3 py-1.5 bg-graphite border border-graphite-border text-xs font-mono text-accent-gold rounded-xs hover:bg-graphite/70 min-h-[44px]"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isSelected = activeJob?.id === job.id;
              const overdue = isOverdue(job);
              const promisedDate = new Date(job.promised_completion);
              const promisedTimeStr = !isNaN(promisedDate.getTime())
                ? promisedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'NOT RECORDED';

              const lastEvent = job.timeline && job.timeline.length > 0
                ? job.timeline[job.timeline.length - 1]
                : null;

              const isTechUnassigned = !job.technician || job.technician.toLowerCase() === 'unassigned';
              const isBayUnassigned = !job.bay || job.bay === 'UNASSIGNED';

              return (
                <div
                  key={job.id}
                  data-testid={`job-row-${job.id}`}
                  onClick={() => {
                    setActiveJobId(job.id);
                    setMobileDetailOpen(true);
                  }}
                  className={`p-3.5 sm:p-4 rounded-xs border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-graphite/85 border-accent-gold shadow-md ring-1 ring-accent-gold/30'
                      : 'bg-graphite/35 border-graphite-border hover:border-accent-gold/40 hover:bg-graphite/50'
                  }`}
                >
                  {/* Top Bar: JOB ID, Priority, Status Badge, Overdue */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-graphite-border/70 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-accent-gold">
                        {job.id}
                      </span>
                      {renderPriorityBadge(job.priority)}
                      {overdue && (
                        <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-mono font-black uppercase bg-red-500/20 text-red-400 border border-red-500/40">
                          OVERDUE
                        </span>
                      )}
                    </div>

                    <div>{renderSemanticBadge(job.status, Boolean(job.waiting_reason))}</div>
                  </div>

                  {/* Vehicle, Customer, Registration */}
                  <div className="pt-2.5 pb-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-sm font-bold text-warm-white truncate">
                        {job.vehicle_summary}
                      </h3>
                      <span className="font-mono text-xs font-bold text-accent-gold/90 shrink-0">
                        {job.registration}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted font-mono mt-1 flex-wrap">
                      <span>
                        Customer: <strong className="text-warm-white font-medium">{job.customer_name}</strong>
                      </span>
                      <span>·</span>
                      <span className="text-muted">{job.customer_phone}</span>
                      <span>·</span>
                      <span className="text-muted-dark truncate">{job.service_name}</span>
                    </div>
                  </div>

                  {/* Operational Allocation & Actions */}
                  <div className="pt-2 border-t border-graphite-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-3 text-muted-dark flex-wrap">
                      <span>
                        TECH:{' '}
                        <span
                          className={
                            isTechUnassigned
                              ? 'text-amber-400 font-bold'
                              : 'text-warm-white'
                          }
                        >
                          {isTechUnassigned ? 'UNASSIGNED' : job.technician}
                        </span>
                      </span>
                      <span>·</span>
                      <span>
                        BAY:{' '}
                        <span
                          className={
                            isBayUnassigned
                              ? 'text-amber-400 font-bold'
                              : 'text-accent-gold'
                          }
                        >
                          {job.bay || 'UNASSIGNED'}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 justify-between sm:justify-end">
                      <div className="flex items-center gap-1">
                        <Clock className={`w-3 h-3 ${overdue ? 'text-red-400' : 'text-muted-dark'}`} />
                        <span className={`text-[11px] font-bold ${overdue ? 'text-red-400' : 'text-warm-white'}`}>
                          PROMISED: {promisedTimeStr}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveJobId(job.id);
                            setMobileDetailOpen(true);
                          }}
                          className="px-2 py-1 bg-graphite border border-graphite-border text-[10px] font-mono font-bold uppercase text-accent-gold hover:bg-graphite/80 rounded-xs min-h-[32px]"
                        >
                          OPEN JOB CARD
                        </button>
                        {onNavigateModule && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateModule('vehicles');
                            }}
                            className="px-2 py-1 bg-graphite/50 border border-graphite-border text-[10px] font-mono uppercase text-muted hover:text-warm-white rounded-xs min-h-[32px]"
                          >
                            VIEW VEHICLE
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Last Activity Stamp */}
                  {lastEvent && (
                    <div className="pt-1.5 mt-1.5 border-t border-graphite-border/30 text-[10px] font-mono text-muted-dark flex items-center justify-between">
                      <span className="truncate">
                        Activity: {lastEvent.event_label}
                      </span>
                      <span className="shrink-0 ml-2">
                        {new Date(lastEvent.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* 5. SECONDARY OPERATIONAL EXCEPTION QUEUES */}
          <div className="pt-6 space-y-4 border-t border-graphite-border/80">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-accent-gold block">
                  ACTION STAGES & EXCEPTIONS
                </span>
                <h3 className="text-sm font-bold uppercase text-warm-white">
                  Secondary Operational Queues
                </h3>
              </div>
              <span className="text-[10px] font-mono text-muted">
                Contextual views of canonical records
              </span>
            </div>

            {/* SECTION 1: REQUIRES TECHNICIAN ALLOCATION */}
            <div
              data-testid="unassigned-technician-queue"
              className="p-3.5 rounded-xs bg-obsidian border border-graphite-border space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  REQUIRES TECHNICIAN ALLOCATION ({secondaryQueues.unassignedTech.length})
                </span>
                <span className="text-[10px] font-mono text-muted-dark">Active jobs without lead tech</span>
              </div>

              {secondaryQueues.unassignedTech.length === 0 ? (
                <p className="text-xs font-mono text-muted-dark italic py-1">
                  ✓ All active Job Cards have assigned technicians.
                </p>
              ) : (
                <div className="space-y-2">
                  {secondaryQueues.unassignedTech.map((job) => (
                    <div
                      key={job.id}
                      className="p-2.5 rounded-xs bg-graphite/40 border border-graphite-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-accent-gold">{job.id}</strong>
                          <span className="text-warm-white font-sans font-medium">
                            {job.vehicle_summary} ({job.registration})
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-dark mt-0.5">
                          Stage: {getSemanticStatusLabel(job.status)} · Bay: {job.bay || 'UNASSIGNED'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setActiveJobId(job.id);
                            setTargetTechSelection('');
                            setReassignTechModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-accent-gold text-obsidian font-bold rounded-xs text-[10px] uppercase hover:bg-white min-h-[44px]"
                        >
                          ASSIGN TECHNICIAN
                        </button>
                        <button
                          onClick={() => {
                            setActiveJobId(job.id);
                            setMobileDetailOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-graphite border border-graphite-border text-warm-white rounded-xs text-[10px] uppercase hover:border-accent-gold min-h-[44px]"
                        >
                          OPEN
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 2: AWAITING BAY ALLOCATION */}
            <div
              data-testid="awaiting-bay-queue"
              className="p-3.5 rounded-xs bg-obsidian border border-graphite-border space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  AWAITING BAY ALLOCATION ({secondaryQueues.awaitingBay.length})
                </span>
                <span className="text-[10px] font-mono text-muted-dark">Active jobs without bay assignment</span>
              </div>

              {secondaryQueues.awaitingBay.length === 0 ? (
                <p className="text-xs font-mono text-muted-dark italic py-1">
                  ✓ All active Job Cards have assigned workshop bays.
                </p>
              ) : (
                <div className="space-y-2">
                  {secondaryQueues.awaitingBay.map((job) => (
                    <div
                      key={job.id}
                      className="p-2.5 rounded-xs bg-graphite/40 border border-graphite-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-accent-gold">{job.id}</strong>
                          <span className="text-warm-white font-sans font-medium">
                            {job.vehicle_summary} ({job.registration})
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-dark mt-0.5">
                          Tech: {job.technician || 'UNASSIGNED'} · Stage: {getSemanticStatusLabel(job.status)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setActiveJobId(job.id);
                            setTargetBaySelection('BAY 01');
                            setReassignBayModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-accent-gold text-obsidian font-bold rounded-xs text-[10px] uppercase hover:bg-white min-h-[44px]"
                        >
                          ASSIGN BAY
                        </button>
                        <button
                          onClick={() => {
                            setActiveJobId(job.id);
                            setMobileDetailOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-graphite border border-graphite-border text-warm-white rounded-xs text-[10px] uppercase hover:border-accent-gold min-h-[44px]"
                        >
                          OPEN
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 3: AWAITING CUSTOMER APPROVAL */}
            <div
              data-testid="approval-queue"
              className="p-3.5 rounded-xs bg-obsidian border border-graphite-border space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-amber-300 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5" />
                  AWAITING CUSTOMER APPROVAL ({secondaryQueues.awaitingApproval.length})
                </span>
                <span className="text-[10px] font-mono text-muted-dark">Estimate sent / pending sign-off</span>
              </div>

              {secondaryQueues.awaitingApproval.length === 0 ? (
                <p className="text-xs font-mono text-muted-dark italic py-1">
                  ✓ No jobs awaiting customer estimate approval.
                </p>
              ) : (
                <div className="space-y-2">
                  {secondaryQueues.awaitingApproval.map((job) => (
                    <div
                      key={job.id}
                      className="p-2.5 rounded-xs bg-graphite/40 border border-graphite-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-accent-gold">{job.id}</strong>
                          <span className="text-warm-white font-sans font-medium">
                            {job.vehicle_summary}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-dark mt-0.5">
                          Owner: {job.customer_name} ({job.customer_phone}) · Tech: {job.technician || 'UNASSIGNED'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {onNavigateModule && (
                          <button
                            onClick={() => onNavigateModule('estimates')}
                            className="px-2.5 py-1.5 bg-graphite border border-graphite-border text-warm-white rounded-xs text-[10px] uppercase hover:border-accent-gold min-h-[44px]"
                          >
                            OPEN ESTIMATE
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActiveJobId(job.id);
                            setMobileDetailOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-accent-gold text-obsidian font-bold rounded-xs text-[10px] uppercase hover:bg-white min-h-[44px]"
                        >
                          VIEW DOSSIER
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 4: QUALITY CHECK QUEUE */}
            <div
              data-testid="qc-queue"
              className="p-3.5 rounded-xs bg-obsidian border border-graphite-border space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-indigo-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  QUALITY CHECK QUEUE ({secondaryQueues.qualityCheck.length})
                </span>
                <span className="text-[10px] font-mono text-muted-dark">WIP completed, awaiting QC sign-off</span>
              </div>

              {secondaryQueues.qualityCheck.length === 0 ? (
                <p className="text-xs font-mono text-muted-dark italic py-1">
                  ✓ No vehicles currently in quality check staging.
                </p>
              ) : (
                <div className="space-y-2">
                  {secondaryQueues.qualityCheck.map((job) => (
                    <div
                      key={job.id}
                      className="p-2.5 rounded-xs bg-graphite/40 border border-graphite-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-accent-gold">{job.id}</strong>
                          <span className="text-warm-white font-sans font-medium">
                            {job.vehicle_summary} ({job.registration})
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-dark mt-0.5">
                          Tech: {job.technician} · Bay: {job.bay}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setActiveJobId(job.id);
                            setMobileDetailOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-xs text-[10px] font-bold uppercase hover:bg-indigo-500/30 min-h-[44px]"
                        >
                          AUDIT QC CHECKLIST
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 5: READY FOR COLLECTION */}
            <div className="p-3.5 rounded-xs bg-obsidian border border-graphite-border space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  READY FOR COLLECTION ({secondaryQueues.readyForCollection.length})
                </span>
                <span className="text-[10px] font-mono text-muted-dark">Excludes delivered vehicles</span>
              </div>

              {secondaryQueues.readyForCollection.length === 0 ? (
                <p className="text-xs font-mono text-muted-dark italic py-1">
                  ✓ No vehicles currently staged for collection.
                </p>
              ) : (
                <div className="space-y-2">
                  {secondaryQueues.readyForCollection.map((job) => (
                    <div
                      key={job.id}
                      className="p-2.5 rounded-xs bg-graphite/40 border border-graphite-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-accent-gold">{job.id}</strong>
                          <span className="text-warm-white font-sans font-medium">
                            {job.vehicle_summary}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-dark mt-0.5">
                          Customer: {job.customer_name} ({job.customer_phone})
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveJobId(job.id);
                          setDeliveryHandoverNotes(
                            `Customer ${job.customer_name} verified vehicle with advisor ${job.advisor}. Keys released.`
                          );
                          setDeliveryAdvisorSign(job.advisor);
                          setDeliveryModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-emerald-500 text-obsidian font-bold rounded-xs text-[10px] uppercase hover:bg-white min-h-[44px]"
                      >
                        HANDOVER & DELIVER
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Selected Job Card Dossier (~35%) */}
        <div
          data-testid="job-dossier"
          className={`lg:col-span-5 bg-graphite/45 border border-graphite-border rounded-xs p-4 sm:p-5 space-y-5 lg:sticky lg:top-4 max-h-[calc(100vh-6rem)] overflow-y-auto ${
            mobileDetailOpen
              ? 'fixed inset-0 z-40 bg-obsidian p-6 overflow-y-auto lg:static lg:bg-graphite/45 lg:p-5'
              : 'hidden lg:block'
          }`}
        >
          {/* Mobile Back Button (< 1024px) */}
          <div className="lg:hidden flex items-center justify-between pb-3 border-b border-graphite-border">
            <button
              onClick={() => setMobileDetailOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-accent-gold font-bold min-h-[44px]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>BACK TO QUEUE</span>
            </button>
            <span className="text-xs font-mono text-muted-dark">OPERATING DOSSIER</span>
          </div>

          {!activeJob ? (
            <div className="p-8 text-center text-muted font-mono text-xs">
              Select a Job Card from the queue to view its operational master record.
            </div>
          ) : (
            <>
              {/* DOSSIER HEADER */}
              <div className="space-y-2 pb-3 border-b border-graphite-border">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-muted-dark uppercase tracking-widest block">
                      JOB CARD
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <h2 className="text-xl font-black font-mono text-warm-white">{activeJob.id}</h2>
                      {renderPriorityBadge(activeJob.priority)}
                    </div>
                  </div>
                  <div>{renderSemanticBadge(activeJob.status, Boolean(activeJob.waiting_reason))}</div>
                </div>

                <p className="text-xs font-bold text-warm-white">
                  Vehicle: {activeJob.vehicle_summary}
                </p>

                {/* Promised Completion & Status */}
                <div className="flex items-center justify-between text-xs font-mono bg-obsidian/70 p-2.5 rounded-xs border border-graphite-border">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-accent-gold" />
                    <span className="text-muted text-[11px]">Promised Delivery:</span>
                    <strong className="text-warm-white">
                      {activeJob.promised_completion
                        ? `${new Date(activeJob.promised_completion).toLocaleDateString([], {
                            day: '2-digit',
                            month: 'short',
                          })} ${new Date(activeJob.promised_completion).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`
                        : 'NOT RECORDED'}
                    </strong>
                  </div>
                  {isOverdue(activeJob) && (
                    <span className="text-[10px] text-red-400 font-bold uppercase animate-pulse">
                      OVERDUE
                    </span>
                  )}
                </div>
              </div>

              {/* CONTEXT-SENSITIVE DOSSIER ACTION BAR */}
              <div className="p-3 rounded-xs bg-obsidian border border-accent-gold/40 space-y-2">
                <span className="text-[10px] font-mono text-muted-dark uppercase tracking-wider block">
                  Primary Execution Action
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  {activeJob.status === 'VEHICLE_RECEIVED' && (
                    <>
                      <button
                        onClick={() => {
                          handleTransitionState('INSPECTION_COMPLETED', 'Initial inspection completed.');
                          if (onNavigateModule) onNavigateModule('inspections');
                        }}
                        className="flex-1 py-2.5 px-3 bg-accent-gold text-obsidian rounded-xs text-xs font-bold font-mono uppercase hover:bg-white transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                      >
                        <ClipboardList className="w-4 h-4" />
                        <span>START INSPECTION</span>
                      </button>
                      <button
                        onClick={() => {
                          setTargetTechSelection('');
                          setReassignTechModalOpen(true);
                        }}
                        className="py-2.5 px-3 bg-graphite border border-graphite-border text-warm-white rounded-xs text-xs font-mono uppercase hover:border-accent-gold min-h-[44px]"
                      >
                        <span>ASSIGN TECHNICIAN</span>
                      </button>
                    </>
                  )}

                  {activeJob.status === 'INSPECTION_COMPLETED' && (
                    <button
                      onClick={() => {
                        handleTransitionState('ESTIMATE_SENT', 'Estimate drafted and awaiting customer approval.');
                        if (onNavigateModule) onNavigateModule('estimates');
                      }}
                      className="flex-1 py-2.5 px-3 bg-accent-gold text-obsidian rounded-xs text-xs font-bold font-mono uppercase hover:bg-white transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <Calculator className="w-4 h-4" />
                      <span>GENERATE ESTIMATE →</span>
                    </button>
                  )}

                  {activeJob.status === 'ESTIMATE_SENT' && (
                    <div className="w-full space-y-2">
                      <div className="p-2.5 rounded-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-between">
                        <span>AWAITING CUSTOMER APPROVAL</span>
                        <strong className="text-accent-gold">
                          ₹{activeJob.estimate_total.toLocaleString()}
                        </strong>
                      </div>
                      <div className="flex gap-2">
                        {onNavigateModule && (
                          <button
                            onClick={() => onNavigateModule('estimates')}
                            className="flex-1 py-2 px-3 bg-graphite border border-graphite-border hover:border-accent-gold text-warm-white rounded-xs text-xs font-mono uppercase flex items-center justify-center gap-1 min-h-[44px]"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-accent-gold" />
                            <span>OPEN ESTIMATE</span>
                          </button>
                        )}
                        {activeEstimate?.public_token && onOpenQuoteToken && (
                          <button
                            onClick={() => onOpenQuoteToken(activeEstimate.public_token)}
                            className="flex-1 py-2 px-3 bg-graphite border border-graphite-border hover:border-accent-gold text-warm-white rounded-xs text-xs font-mono uppercase flex items-center justify-center gap-1 min-h-[44px]"
                          >
                            <span>VIEW CUSTOMER QUOTE</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleTransitionState('ESTIMATE_APPROVED', 'Customer approved quote scope.')}
                          className="flex-1 py-2 px-3 bg-emerald-500 text-obsidian font-bold rounded-xs text-xs font-mono uppercase hover:bg-white flex items-center justify-center gap-1 min-h-[44px]"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>RECORD APPROVAL</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {activeJob.status === 'ESTIMATE_APPROVED' && (
                    <button
                      onClick={() => handleTransitionState('WORK_IN_PROGRESS', 'Execution commenced by workshop team.')}
                      className="flex-1 py-2.5 px-3 bg-accent-gold text-obsidian rounded-xs text-xs font-bold font-mono uppercase hover:bg-white transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>START WORK EXECUTION →</span>
                    </button>
                  )}

                  {activeJob.status === 'WORK_IN_PROGRESS' && (
                    <div className="flex items-center gap-2 w-full flex-wrap">
                      {activeJob.waiting_reason ? (
                        <button
                          onClick={handleResumeWork}
                          className="flex-1 py-2.5 px-3 bg-emerald-500 text-obsidian font-bold rounded-xs text-xs font-mono uppercase hover:bg-white flex items-center justify-center gap-1.5 min-h-[44px]"
                        >
                          <Check className="w-4 h-4" />
                          <span>RESUME WORK</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setWaitingReasonInput('WAITING FOR PARTS');
                            setWaitingCustomNote('');
                            setWaitingModalOpen(true);
                          }}
                          className="py-2.5 px-3 bg-graphite border border-graphite-border text-amber-400 font-mono text-xs uppercase hover:border-amber-400 flex items-center justify-center gap-1 min-h-[44px]"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>HOLD / PAUSE</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleTransitionState('QUALITY_CHECK', 'Moved to quality audit inspection.')}
                        className="flex-1 py-2.5 px-3 bg-accent-gold text-obsidian rounded-xs text-xs font-bold font-mono uppercase hover:bg-white flex items-center justify-center gap-1.5 min-h-[44px]"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>MOVE TO QUALITY CHECK →</span>
                      </button>
                    </div>
                  )}

                  {activeJob.status === 'QUALITY_CHECK' && (
                    <button
                      onClick={() => handleTransitionState('READY_FOR_COLLECTION', 'Passed quality check. Vehicle staged.')}
                      className="flex-1 py-2.5 px-3 bg-accent-gold text-obsidian rounded-xs text-xs font-bold font-mono uppercase hover:bg-white transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>COMPLETE QUALITY CHECK →</span>
                    </button>
                  )}

                  {activeJob.status === 'READY_FOR_COLLECTION' && (
                    <div className="flex items-center gap-2 w-full flex-wrap">
                      <button
                        onClick={() => {
                          setDeliveryHandoverNotes(
                            `Customer ${activeJob.customer_name} verified vehicle work with advisor ${activeJob.advisor}. All keys & belongings handed over.`
                          );
                          setDeliveryAdvisorSign(activeJob.advisor);
                          setDeliveryModalOpen(true);
                        }}
                        className="flex-1 py-2.5 px-3 bg-emerald-500 text-obsidian rounded-xs text-xs font-bold font-mono uppercase hover:bg-white transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                      >
                        <Truck className="w-4 h-4" />
                        <span>DELIVER VEHICLE (HANDOVER)</span>
                      </button>
                      {activeJob.public_token && onOpenCustomerView && (
                        <button
                          onClick={() => onOpenCustomerView(activeJob.public_token)}
                          className="py-2.5 px-3 bg-graphite border border-graphite-border text-warm-white font-mono text-xs uppercase hover:border-accent-gold min-h-[44px]"
                        >
                          CUSTOMER TRACKING
                        </button>
                      )}
                    </div>
                  )}

                  {activeJob.status === 'DELIVERED' && (
                    <div className="w-full space-y-2">
                      <div className="text-center py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                        ✓ VEHICLE DELIVERED ({activeJob.delivered_at ? new Date(activeJob.delivered_at).toLocaleDateString() : 'RECORDED'})
                      </div>
                      {activeJob.customer_signature && (
                        <div className="p-3 bg-graphite/40 border border-graphite-border rounded-xs space-y-1.5 font-mono text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase text-accent-gold font-bold">
                              CUSTOMER HANDOVER SIGN-OFF
                            </span>
                            <span className="text-[10px] text-muted-dark">Verified</span>
                          </div>
                          <p className="text-warm-white">
                            Signed by: <strong className="text-white">{activeJob.handover_signoff_name || activeJob.customer_name}</strong>
                          </p>
                          <div className="bg-obsidian border border-graphite-border p-2 rounded-xs inline-block">
                            <img
                              src={activeJob.customer_signature}
                              alt="Customer Signature"
                              className="h-10 max-w-[200px] object-contain invert"
                            />
                          </div>
                        </div>
                      )}
                      {onNavigateModule && (
                        <button
                          onClick={() => onNavigateModule('history')}
                          className="w-full py-2 bg-graphite border border-graphite-border hover:border-accent-gold text-warm-white text-xs font-mono uppercase min-h-[44px]"
                        >
                          VIEW SERVICE HISTORY →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* DOSSIER — VEHICLE & CUSTOMER */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-graphite-border/70">
                  <span className="text-[10px] font-mono uppercase text-muted-dark">
                    VEHICLE & CUSTOMER PROFILE
                  </span>
                  <div className="flex items-center gap-2">
                    {onNavigateModule && (
                      <>
                        <button
                          onClick={() => onNavigateModule('customers')}
                          className="text-[10px] font-mono text-accent-gold hover:underline inline-flex items-center gap-0.5"
                        >
                          VIEW CUSTOMER <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                        <span>·</span>
                        <button
                          onClick={() => onNavigateModule('vehicles')}
                          className="text-[10px] font-mono text-accent-gold hover:underline inline-flex items-center gap-0.5"
                        >
                          VIEW VEHICLE <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Customer card */}
                <div className="p-3 rounded-xs bg-graphite/30 border border-graphite-border space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-warm-white font-sans text-sm">{activeJob.customer_name}</span>
                    <span className="text-[10px] text-muted-dark">ID: {activeJob.customer_id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted">
                    <Phone className="w-3 h-3 text-accent-gold" />
                    <span>{activeJob.customer_phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-dark">
                    <Mail className="w-3 h-3" />
                    <span>{activeJob.customer_email || 'NOT RECORDED'}</span>
                  </div>
                </div>

                {/* Vehicle card */}
                <div className="p-3 rounded-xs bg-graphite/30 border border-graphite-border space-y-2 font-mono text-xs">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-warm-white font-sans text-sm">{activeJob.vehicle_summary}</span>
                    <span className="font-black text-accent-gold">{activeJob.registration}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-graphite-border/60 text-[11px]">
                    <div>
                      <span className="text-[9px] text-muted-dark block">Odometer</span>
                      <span className="text-warm-white">
                        {typeof activeJob.odometer === 'number'
                          ? `${activeJob.odometer.toLocaleString()} km`
                          : 'NOT RECORDED'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-dark block">Fuel Level</span>
                      <span className="text-warm-white">{activeJob.fuel_level || 'NOT RECORDED'}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[9px] text-muted-dark block">VIN</span>
                      <span className="text-warm-white truncate block">
                        {activeJob.vin_masked || 'NOT RECORDED'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DOSSIER — WORKSHOP ASSIGNMENT */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-graphite-border/70">
                  <span className="text-[10px] font-mono uppercase text-muted-dark">
                    WORKSHOP ASSIGNMENT
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setTargetTechSelection(activeJob.technician || '');
                        setTechReassignReason('');
                        setReassignTechModalOpen(true);
                      }}
                      className="text-[10px] font-mono text-accent-gold hover:underline font-bold"
                    >
                      REASSIGN TECH
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => {
                        setTargetBaySelection(activeJob.bay || 'BAY 01');
                        setBayReassignReason('');
                        setReassignBayModalOpen(true);
                      }}
                      className="text-[10px] font-mono text-accent-gold hover:underline font-bold"
                    >
                      REASSIGN BAY
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-graphite/30 p-2.5 rounded-xs border border-graphite-border text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-muted-dark block">TECHNICIAN</span>
                    <span
                      data-testid="job-dossier-technician"
                      className={`font-semibold ${
                        !activeJob.technician || activeJob.technician.toLowerCase() === 'unassigned'
                          ? 'text-amber-400 font-bold'
                          : 'text-warm-white'
                      }`}
                    >
                      {activeJob.technician || 'Unassigned'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-dark block">BAY</span>
                    <span
                      data-testid="job-dossier-bay"
                      className={`font-black ${
                        !activeJob.bay || activeJob.bay === 'UNASSIGNED'
                          ? 'text-amber-400'
                          : 'text-accent-gold'
                      }`}
                    >
                      {activeJob.bay || 'UNASSIGNED'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-dark block">SERVICE ADVISOR</span>
                    <span className="font-semibold text-warm-white">{activeJob.advisor}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-dark block">PRIORITY</span>
                    <span>{renderPriorityBadge(activeJob.priority)}</span>
                  </div>
                </div>
              </div>

              {/* DOSSIER — SERVICE INFORMATION */}
              <div className="space-y-2 text-xs">
                <div className="pb-1 border-b border-graphite-border/70">
                  <span className="text-[10px] font-mono uppercase text-muted-dark">
                    SERVICE INFORMATION
                  </span>
                </div>
                <div className="p-3 rounded-xs bg-obsidian border border-graphite-border space-y-2 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-accent-gold uppercase font-bold block">
                      ACTIVE SERVICE
                    </span>
                    <p className="text-warm-white font-sans font-medium mt-0.5">
                      {activeJob.service_name}
                    </p>
                  </div>
                  <div className="pt-1.5 border-t border-graphite-border/60">
                    <span className="text-[10px] text-muted-dark uppercase block">
                      Customer Concern
                    </span>
                    <p className="text-warm-white italic mt-0.5">
                      "{activeJob.customer_complaint || 'NOT RECORDED'}"
                    </p>
                  </div>
                  <div className="pt-1.5 border-t border-graphite-border/60 grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-[9px] text-muted-dark block">Inspection</span>
                      <span className="text-warm-white">
                        {activeInspection ? activeInspection.status : 'INSPECTION NOT STARTED'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-dark block">Estimate</span>
                      <span className="text-warm-white">
                        {activeEstimate ? activeEstimate.status : (activeJob.status === 'ESTIMATE_SENT' ? 'ESTIMATE SENT' : 'NOT RECORDED')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-dark block">Approval</span>
                      <span className="text-warm-white">
                        {activeJob.status === 'ESTIMATE_SENT'
                          ? 'AWAITING CUSTOMER APPROVAL'
                          : activeJob.approval_status || 'NOT RECORDED'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DOSSIER — WORKFLOW PROGRESS (8 STAGES) */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-graphite-border/70">
                  <span className="text-[10px] font-mono uppercase text-muted-dark">
                    WORKFLOW PIPELINE PROGRESS
                  </span>
                  <span className="text-[10px] font-mono text-accent-gold">
                    Stage {getStageStepNumber(activeJob.status)} of 8
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-xs">
                  {WORKFLOW_STAGES.map((stage) => {
                    const currentStep = getStageStepNumber(activeJob.status);
                    const isCompleted = currentStep > stage.step;
                    const isCurrent = currentStep === stage.step;

                    return (
                      <div
                        key={stage.key}
                        className={`p-2 rounded-xs border flex items-center justify-between ${
                          isCurrent
                            ? 'bg-accent-gold/15 border-accent-gold text-accent-gold font-bold'
                            : isCompleted
                            ? 'bg-graphite/40 border-graphite-border text-warm-white'
                            : 'bg-obsidian/40 border-graphite-border/40 text-muted-dark'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : isCurrent ? (
                            <ArrowRight className="w-3.5 h-3.5 text-accent-gold shrink-0 animate-pulse" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-graphite-border inline-block shrink-0" />
                          )}
                          <span className="text-[11px]">{stage.label}</span>
                        </div>
                        <span className="text-[9px] uppercase">
                          {isCurrent ? 'ACTIVE STAGE' : isCompleted ? 'COMPLETED' : 'PENDING'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DOSSIER — ESTIMATE / APPROVAL INTEGRATION */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-graphite-border/70">
                  <span className="text-[10px] font-mono uppercase text-muted-dark">
                    ESTIMATE & COMMERCIAL APPROVAL
                  </span>
                  {activeJob.estimate_total > 0 && (
                    <strong className="text-accent-gold font-mono">
                      ₹{activeJob.estimate_total.toLocaleString()}
                    </strong>
                  )}
                </div>

                <div className="p-3 rounded-xs bg-obsidian border border-graphite-border space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-dark">Estimate ID:</span>
                    <span className="text-warm-white">{activeEstimate?.id || (activeJob.status === 'ESTIMATE_SENT' ? 'EST-PENDING' : 'NOT RECORDED')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-dark">Approval Status:</span>
                    <span
                      className={`font-bold ${
                        activeJob.status === 'ESTIMATE_SENT'
                          ? 'text-amber-400'
                          : activeJob.approval_status === 'APPROVED'
                          ? 'text-emerald-400'
                          : 'text-muted'
                      }`}
                    >
                      {activeJob.status === 'ESTIMATE_SENT'
                        ? 'AWAITING CUSTOMER APPROVAL'
                        : activeJob.approval_status || 'NOT RECORDED'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-graphite-border/60 flex gap-2">
                    {onNavigateModule && (
                      <button
                        onClick={() => onNavigateModule('estimates')}
                        className="flex-1 py-1.5 bg-graphite border border-graphite-border hover:border-accent-gold text-warm-white text-[10px] uppercase rounded-xs min-h-[44px]"
                      >
                        OPEN ESTIMATE
                      </button>
                    )}
                    {activeEstimate?.public_token && onOpenQuoteToken && (
                      <button
                        onClick={() => onOpenQuoteToken(activeEstimate.public_token)}
                        className="flex-1 py-1.5 bg-graphite border border-graphite-border hover:border-accent-gold text-warm-white text-[10px] uppercase rounded-xs min-h-[44px]"
                      >
                        VIEW CUSTOMER QUOTE
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* DOSSIER — INSPECTION INTEGRATION */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-graphite-border/70">
                  <span className="text-[10px] font-mono uppercase text-muted-dark">
                    MULTI-POINT INSPECTION
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {activeInspection ? activeInspection.status : 'INSPECTION NOT STARTED'}
                  </span>
                </div>

                <div className="p-3 rounded-xs bg-obsidian border border-graphite-border space-y-2 font-mono text-xs">
                  {activeInspection ? (
                    <>
                      <div className="flex justify-between text-muted-dark">
                        <span>Inspection ID:</span>
                        <span className="text-warm-white">{activeInspection.id}</span>
                      </div>
                      <div className="flex justify-between text-muted-dark">
                        <span>Inspector Tech:</span>
                        <span className="text-warm-white">{activeInspection.technician_name || 'Technician'}</span>
                      </div>
                      <div className="flex justify-between text-muted-dark">
                        <span>Findings Logged:</span>
                        <span className="text-warm-white">{activeInspection.findings.length} findings</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-[11px] text-muted-dark italic">
                      No formal digital inspection has been conducted yet for this Job Card.
                    </p>
                  )}

                  {onNavigateModule && (
                    <button
                      onClick={() => onNavigateModule('inspections')}
                      className="w-full py-1.5 bg-graphite border border-graphite-border hover:border-accent-gold text-warm-white text-[10px] uppercase rounded-xs min-h-[44px]"
                    >
                      {activeInspection ? 'OPEN INSPECTION' : 'START INSPECTION'}
                    </button>
                  )}
                </div>
              </div>

              {/* DOSSIER — CUSTOMER SERVICE-STATUS TRACKING */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-graphite-border/70">
                  <span className="text-[10px] font-mono uppercase text-muted-dark">
                    CUSTOMER TRACKING PORTAL
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 py-2 px-3 bg-graphite border border-graphite-border hover:border-accent-gold text-warm-white rounded-xs text-xs font-mono uppercase flex items-center justify-center gap-1.5 min-h-[44px]"
                  >
                    <Copy className="w-3.5 h-3.5 text-accent-gold" />
                    <span>{copiedLink ? 'COPIED LINK' : 'COPY LINK'}</span>
                  </button>

                  {onOpenCustomerView && activeJob.public_token && (
                    <button
                      onClick={() => onOpenCustomerView(activeJob.public_token)}
                      className="py-2 px-3 bg-accent-gold text-obsidian font-bold rounded-xs text-xs font-mono uppercase hover:bg-white flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>OPEN CUSTOMER TRACKING PORTAL</span>
                    </button>
                  )}
                </div>
              </div>

              {/* DOSSIER — OPERATIONAL AUDIT TIMELINE */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-graphite-border/70">
                  <span className="text-[10px] font-mono uppercase text-muted-dark">
                    RECENT OPERATIONAL EVENTS
                  </span>
                  <span className="text-[10px] font-mono text-muted">
                    {activeJob.timeline.length} Events
                  </span>
                </div>

                <div className="space-y-2 relative pl-3 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-px before:bg-graphite-border">
                  {activeJob.timeline.slice(-5).map((event) => (
                    <div key={event.id} className="relative pl-3 space-y-0.5 text-[11px] font-mono">
                      <span className="absolute -left-[9px] top-1.5 w-2 h-2 rounded-full bg-accent-gold ring-2 ring-obsidian" />
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="font-bold text-warm-white">{event.event_label}</span>
                        <span className="text-[9px] text-muted-dark">
                          {new Date(event.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted">Actor: {event.actor}</p>
                      {event.notes && <p className="text-[10px] text-muted-dark">{event.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6-STEP NEW JOB CARD WIZARD MODAL */}
      {/* ============================================================ */}
      {/* ============================================================ */}
      {/* 6-STEP NEW JOB CARD WIZARD MODAL */}
      {/* ============================================================ */}
      {newModalOpen && (
        <MobileFormSheet
          isOpen={newModalOpen}
          onClose={() => setNewModalOpen(false)}
          eyebrow="WORKSHOP OPERATIONS · INTAKE WIZARD"
          title={`Step ${wizardStep} of 6: ${
            wizardStep === 1 ? 'Customer' :
            wizardStep === 2 ? 'Vehicle' :
            wizardStep === 3 ? 'Service Request' :
            wizardStep === 4 ? 'Workshop Assignment' :
            wizardStep === 5 ? 'Promised Delivery' : 'Review & Create'
          }`}
          hideFooter
          maxWidthClass="sm:max-w-xl"
        >
          <form
            id="jobcard-wizard-form"
            onSubmit={handleCreateJobCardSubmit}
            className="space-y-4"
          >
            {/* Step 1: CUSTOMER */}
            {wizardStep === 1 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 p-1 bg-graphite/40 border border-graphite-border rounded-xs">
                  <button
                    type="button"
                    onClick={() => setCustomerMode('EXISTING')}
                    className={`py-2 text-xs font-mono font-bold uppercase rounded-xs min-h-[44px] cursor-pointer ${
                      customerMode === 'EXISTING' ? 'bg-accent-gold text-obsidian' : 'text-muted hover:text-warm-white'
                    }`}
                  >
                    Existing Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerMode('NEW')}
                    className={`py-2 text-xs font-mono font-bold uppercase rounded-xs min-h-[44px] cursor-pointer ${
                      customerMode === 'NEW' ? 'bg-accent-gold text-obsidian' : 'text-muted hover:text-warm-white'
                    }`}
                  >
                    New Customer
                  </button>
                </div>

                {customerMode === 'EXISTING' ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted-dark uppercase block">
                      Select Customer *
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => handleSelectExistingCustomer(e.target.value)}
                        className="w-full appearance-none bg-graphite border border-graphite-border rounded-xs px-3 py-2 pr-10 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                      >
                        <option value="">-- Choose from registered customers --</option>
                        {availableCustomers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.phone})
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {selectedCustomerId && (
                      <div className="p-3 bg-obsidian rounded-xs border border-graphite-border text-xs font-mono">
                        <p className="text-warm-white font-bold">{custName}</p>
                        <p className="text-muted">{phone}</p>
                        {email && <p className="text-muted-dark">{email}</p>}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                        Customer Full Name *
                      </label>
                      <input
                        type="text"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        placeholder="e.g. Sameer Verma"
                        className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98201 12345"
                        className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="sameer@example.com"
                        className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: VEHICLE */}
            {wizardStep === 2 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 p-1 bg-graphite/40 border border-graphite-border rounded-xs">
                  <button
                    type="button"
                    onClick={() => setVehicleMode('EXISTING')}
                    className={`py-2 text-xs font-mono font-bold uppercase rounded-xs min-h-[44px] cursor-pointer ${
                      vehicleMode === 'EXISTING' ? 'bg-accent-gold text-obsidian' : 'text-muted hover:text-warm-white'
                    }`}
                  >
                    Existing Vehicle
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleMode('NEW')}
                    className={`py-2 text-xs font-mono font-bold uppercase rounded-xs min-h-[44px] cursor-pointer ${
                      vehicleMode === 'NEW' ? 'bg-accent-gold text-obsidian' : 'text-muted hover:text-warm-white'
                    }`}
                  >
                    New Vehicle
                  </button>
                </div>

                {vehicleMode === 'EXISTING' ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted-dark uppercase block">
                      Select Vehicle *
                    </label>
                    <div className="relative">
                      <select
                        value={selectedVehicleId}
                        onChange={(e) => handleSelectExistingVehicle(e.target.value)}
                        className="w-full appearance-none bg-graphite border border-graphite-border rounded-xs px-3 py-2 pr-10 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                      >
                        <option value="">-- Choose from garage vehicles --</option>
                        {availableVehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.year} {v.make} {v.model} ({v.registration})
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {selectedVehicleId && (
                      <div className="p-3 bg-obsidian rounded-xs border border-graphite-border text-xs font-mono space-y-1">
                        <p className="text-warm-white font-bold">{vehicleSummary}</p>
                        <p className="text-accent-gold">{reg}</p>
                        <p className="text-muted-dark">Odo: {odometer} km</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                        Vehicle Summary (Year Make Model) *
                      </label>
                      <input
                        type="text"
                        value={vehicleSummary}
                        onChange={(e) => setVehicleSummary(e.target.value)}
                        placeholder="e.g. 2023 Porsche Panamera 4S"
                        className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                        Registration Number *
                      </label>
                      <input
                        type="text"
                        value={reg}
                        onChange={(e) => setReg(e.target.value)}
                        placeholder="e.g. MH 02 FG 7788"
                        className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono uppercase text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                          Odometer (km)
                        </label>
                        <input
                          type="number"
                          value={odometer}
                          onChange={(e) => setOdometer(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                          Fuel Level
                        </label>
                        <div className="relative">
                          <select
                            value={fuelLevel}
                            onChange={(e) => setFuelLevel(e.target.value)}
                            className="w-full appearance-none bg-graphite border border-graphite-border rounded-xs px-3 py-2 pr-10 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                          >
                            <option value="25%">25% (1/4 Tank)</option>
                            <option value="50%">50% (1/2 Tank)</option>
                            <option value="75%">75% (3/4 Tank)</option>
                            <option value="100%">100% (Full)</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: SERVICE REQUEST */}
            {wizardStep === 3 && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                    Service Package / Requested Work *
                  </label>
                  <input
                    type="text"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                    Customer Reported Concern / Symptoms *
                  </label>
                  <textarea
                    rows={3}
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    placeholder="Describe specific symptoms or requests..."
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[70px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                    Operational Priority
                  </label>
                  <div className="relative">
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as JobPriority)}
                      className="w-full appearance-none bg-graphite border border-graphite-border rounded-xs px-3 py-2 pr-10 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p}
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
              </div>
            )}

            {/* Step 4: WORKSHOP ASSIGNMENT */}
            {wizardStep === 4 && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                    Assigned Lead Technician
                  </label>
                  <div className="relative">
                    <select
                      value={technician}
                      onChange={(e) => setTechnician(e.target.value)}
                      className="w-full appearance-none bg-graphite border border-graphite-border rounded-xs px-3 py-2 pr-10 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                    >
                      {availableTechnicians.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name} — {t.specialization}
                        </option>
                      ))}
                      <option value="Unassigned">Unassigned</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                    Workshop Bay
                  </label>
                  <div className="relative">
                    <select
                      value={bay}
                      onChange={(e) => setBay(e.target.value)}
                      className="w-full appearance-none bg-graphite border border-graphite-border rounded-xs px-3 py-2 pr-10 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                    >
                      {STANDARD_BAYS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                      <option value="UNASSIGNED">UNASSIGNED</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                    Service Advisor
                  </label>
                  <div className="relative">
                    <select
                      value={advisor}
                      onChange={(e) => setAdvisor(e.target.value)}
                      className="w-full appearance-none bg-graphite border border-graphite-border rounded-xs px-3 py-2 pr-10 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                    >
                      {ADVISORS.map((a) => (
                        <option key={a} value={a}>
                          {a}
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
              </div>
            )}

            {/* Step 5: PROMISED DELIVERY */}
            {wizardStep === 5 && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                    Turnaround Duration (Hours)
                  </label>
                  <div className="relative">
                    <select
                      value={promisedHours}
                      onChange={(e) => setPromisedHours(Number(e.target.value))}
                      className="w-full appearance-none bg-graphite border border-graphite-border rounded-xs px-3 py-2 pr-10 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                    >
                      <option value={4}>4 Hours (Fast Track)</option>
                      <option value={6}>6 Hours (Standard Service)</option>
                      <option value={8}>8 Hours (Full Day)</option>
                      <option value={24}>24 Hours (Next Day)</option>
                      <option value={48}>48 Hours (Major Overhaul)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                    Or Specific Delivery Date/Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={customPromisedDate}
                    onChange={(e) => setCustomPromisedDate(e.target.value)}
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs font-mono text-warm-white focus:outline-none focus:border-accent-gold min-h-[46px]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                    Intake & Handover Observations
                  </label>
                  <textarea
                    rows={2}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Valuables inventory, preliminary exterior observations..."
                    className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white focus:outline-none focus:border-accent-gold min-h-[64px]"
                  />
                </div>
              </div>
            )}

            {/* Step 6: REVIEW & CREATE */}
            {wizardStep === 6 && (
              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 bg-graphite/40 border border-graphite-border rounded-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted">Customer:</span>
                    <strong className="text-warm-white">{custName} ({phone})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Vehicle:</span>
                    <strong className="text-warm-white">{vehicleSummary}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Registration:</span>
                    <strong className="text-accent-gold">{reg}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Service:</span>
                    <span className="text-warm-white">{service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Technician:</span>
                    <span className="text-warm-white">{technician}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Bay:</span>
                    <span className="text-accent-gold">{bay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Priority:</span>
                    <span className="text-warm-white">{priority}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Wizard Navigation Sticky-Safe Action Row */}
            <div className="pt-4 border-t border-graphite-border flex items-center justify-between gap-2">
              {wizardStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(wizardStep - 1)}
                  className="px-4 py-2 bg-graphite border border-graphite-border text-warm-white text-xs font-mono uppercase min-h-[46px] cursor-pointer"
                >
                  ← Previous
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="px-4 py-2 bg-graphite text-muted text-xs font-mono uppercase min-h-[46px] cursor-pointer"
                >
                  Cancel
                </button>
              )}

              {wizardStep < 6 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (wizardStep === 1 && (!custName || !phone)) {
                      showNotice('Please enter customer name and phone.');
                      return;
                    }
                    if (wizardStep === 2 && (!vehicleSummary || !reg)) {
                      showNotice('Please enter vehicle details and registration.');
                      return;
                    }
                    setWizardStep(wizardStep + 1);
                  }}
                  className="px-5 py-2 bg-accent-gold text-obsidian font-bold text-xs font-mono uppercase hover:bg-white min-h-[46px] cursor-pointer"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent-gold text-obsidian font-bold text-xs font-mono uppercase hover:bg-white min-h-[46px] cursor-pointer"
                >
                  CREATE JOB CARD
                </button>
              )}
            </div>
          </form>
        </MobileFormSheet>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: REASSIGN TECHNICIAN MODAL */}
      {/* ============================================================ */}
      {reassignTechModalOpen && activeJob && (
        <MobileFormSheet
          isOpen={reassignTechModalOpen}
          onClose={() => setReassignTechModalOpen(false)}
          eyebrow="WORKSHOP FLOOR DISPATCH"
          title={`REASSIGN TECHNICIAN · ${activeJob.id}`}
          primaryActionLabel="Save Assignment"
          onPrimaryAction={() => {
            const form = document.getElementById('reassign-tech-form') as HTMLFormElement;
            if (form) form.requestSubmit();
          }}
          primaryActionVariant="gold"
          maxWidthClass="sm:max-w-md"
        >
          <form
            id="reassign-tech-form"
            onSubmit={handleReassignTechSubmit}
            className="space-y-4 text-xs font-mono"
          >
            <div>
              <label className="text-[10px] text-muted-dark uppercase block mb-1">
                Select Technician *
              </label>
              <div className="relative">
                <select
                  value={targetTechSelection}
                  onChange={(e) => setTargetTechSelection(e.target.value)}
                  className="w-full appearance-none bg-graphite border border-graphite-border rounded-xs px-3 py-2 pr-10 text-xs text-warm-white font-mono min-h-[46px]"
                  required
                >
                  <option value="">-- Choose technician --</option>
                  {availableTechnicians.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.status})
                    </option>
                  ))}
                  <option value="Unassigned">Unassigned</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-muted-dark uppercase block mb-1">
                Reassignment Reason (Optional)
              </label>
              <input
                type="text"
                value={techReassignReason}
                onChange={(e) => setTechReassignReason(e.target.value)}
                placeholder="e.g. Diagnostic workload balancing"
                className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white min-h-[46px]"
              />
            </div>
          </form>
        </MobileFormSheet>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: REASSIGN BAY MODAL */}
      {/* ============================================================ */}
      {reassignBayModalOpen && activeJob && (
        <MobileFormSheet
          isOpen={reassignBayModalOpen}
          onClose={() => setReassignBayModalOpen(false)}
          eyebrow="BAY SCHEDULING"
          title={`REASSIGN WORKSHOP BAY · ${activeJob.id}`}
          primaryActionLabel="Save Bay"
          onPrimaryAction={() => {
            const form = document.getElementById('reassign-bay-form') as HTMLFormElement;
            if (form) form.requestSubmit();
          }}
          primaryActionVariant="gold"
          maxWidthClass="sm:max-w-md"
        >
          <form
            id="reassign-bay-form"
            onSubmit={handleReassignBaySubmit}
            className="space-y-4 text-xs font-mono"
          >
            <div>
              <label className="text-[10px] text-muted-dark uppercase block mb-1">
                Select Workshop Bay *
              </label>
              <div className="relative">
                <select
                  value={targetBaySelection}
                  onChange={(e) => setTargetBaySelection(e.target.value)}
                  className="w-full appearance-none bg-graphite border border-graphite-border rounded-xs px-3 py-2 pr-10 text-xs text-warm-white font-mono min-h-[46px]"
                  required
                >
                  <option value="BAY 01">BAY 01 (General Service)</option>
                  <option value="BAY 02">BAY 02 (Diagnostics)</option>
                  <option value="BAY 03">BAY 03 (Quick Service)</option>
                  <option value="BAY 04">BAY 04 (Heavy Mechanical)</option>
                  <option value="UNASSIGNED">UNASSIGNED (Hold / Staging)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-muted-dark uppercase block mb-1">
                Reassignment Reason (Optional)
              </label>
              <input
                type="text"
                value={bayReassignReason}
                onChange={(e) => setBayReassignReason(e.target.value)}
                placeholder="e.g. Lift equipment allocation"
                className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white min-h-[46px]"
              />
            </div>
          </form>
        </MobileFormSheet>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: PAUSE / WAITING REASON MODAL */}
      {/* ============================================================ */}
      {waitingModalOpen && activeJob && (
        <MobileFormSheet
          isOpen={waitingModalOpen}
          onClose={() => setWaitingModalOpen(false)}
          eyebrow="JOB STATUS OVERRIDE"
          title="PLACE JOB ON HOLD"
          primaryActionLabel="Confirm Hold"
          onPrimaryAction={() => {
            const form = document.getElementById('waiting-job-form') as HTMLFormElement;
            if (form) form.requestSubmit();
          }}
          primaryActionVariant="gold"
          maxWidthClass="sm:max-w-md"
        >
          <form
            id="waiting-job-form"
            onSubmit={handleWaitingSubmit}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                Hold Reason Category *
              </label>
              <div className="relative">
                <select
                  value={waitingReasonInput}
                  onChange={(e) => setWaitingReasonInput(e.target.value)}
                  className="w-full appearance-none bg-graphite border border-graphite-border rounded-xs px-3 py-2 pr-10 text-xs text-warm-white font-mono min-h-[46px]"
                >
                  <option value="WAITING FOR PARTS">WAITING FOR PARTS</option>
                  <option value="WAITING FOR CUSTOMER APPROVAL">WAITING FOR CUSTOMER APPROVAL</option>
                  <option value="WAITING FOR TECHNICIAN">WAITING FOR TECHNICIAN</option>
                  <option value="WORKSHOP HOLD">WORKSHOP HOLD</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                Notes / Part Reference
              </label>
              <textarea
                rows={2}
                value={waitingCustomNote}
                onChange={(e) => setWaitingCustomNote(e.target.value)}
                placeholder="e.g. Awaiting DHL express delivery of brake disc rotors..."
                className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white font-mono min-h-[64px]"
              />
            </div>
          </form>
        </MobileFormSheet>
      )}

      {/* ============================================================ */}
      {/* MODAL 5: DELIVERY HANDOVER MODAL */}
      {/* ============================================================ */}
      {deliveryModalOpen && activeJob && (
        <MobileFormSheet
          isOpen={deliveryModalOpen}
          onClose={() => setDeliveryModalOpen(false)}
          eyebrow="VEHICLE HANDOVER"
          title={`DELIVER JOB ${activeJob.id}`}
          primaryActionLabel="Confirm Delivery"
          onPrimaryAction={() => {
            const form = document.getElementById('delivery-handover-form') as HTMLFormElement;
            if (form) form.requestSubmit();
          }}
          primaryActionVariant="emerald"
          maxWidthClass="sm:max-w-md"
        >
          <form
            id="delivery-handover-form"
            onSubmit={handleDeliverySubmit}
            className="space-y-4 text-xs font-mono"
          >
            <div className="p-3 bg-graphite/40 border border-graphite-border rounded-xs space-y-1">
              <div className="flex justify-between text-muted">
                <span>Customer:</span>
                <strong className="text-warm-white">{activeJob.customer_name}</strong>
              </div>
              <div className="flex justify-between text-muted">
                <span>Vehicle:</span>
                <span className="text-warm-white">{activeJob.vehicle_summary}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Registration:</span>
                <strong className="text-accent-gold">{activeJob.registration}</strong>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                Delivering Service Advisor *
              </label>
              <div className="relative">
                <select
                  value={deliveryAdvisorSign}
                  onChange={(e) => setDeliveryAdvisorSign(e.target.value)}
                  className="w-full appearance-none bg-graphite border border-graphite-border rounded-xs px-3 py-2 pr-10 text-xs text-warm-white font-mono min-h-[46px]"
                >
                  {ADVISORS.map((a) => (
                    <option key={a} value={a}>
                      {a}
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

            <div>
              <label className="text-[10px] font-mono text-muted-dark uppercase block mb-1">
                Handover Notes *
              </label>
              <textarea
                rows={2}
                required
                value={deliveryHandoverNotes}
                onChange={(e) => setDeliveryHandoverNotes(e.target.value)}
                className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white min-h-[64px]"
              />
            </div>

            {/* CF-03: Optional Customer Handover Sign-off */}
            <div className="pt-2 border-t border-graphite-border/70 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono text-accent-gold uppercase font-bold tracking-wider">
                  Customer Handover Sign-Off (Optional)
                </label>
                <span className="text-[9px] font-mono text-muted-dark">Operational Acknowledgement</span>
              </div>
              
              <div>
                <input
                  type="text"
                  placeholder={`Signee Name (Default: ${activeJob.customer_name})`}
                  value={customerSignoffName}
                  onChange={(e) => setCustomerSignoffName(e.target.value)}
                  className="w-full bg-graphite border border-graphite-border rounded-xs px-3 py-2 text-xs text-warm-white font-mono placeholder:text-muted-dark min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-muted-dark font-mono">
                  <span>Draw Signature Below:</span>
                  {hasDrawnSignature && (
                    <button
                      type="button"
                      onClick={() => {
                        const canvas = signatureCanvasRef.current;
                        if (canvas) {
                          const ctx = canvas.getContext('2d');
                          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
                        }
                        setHasDrawnSignature(false);
                      }}
                      className="text-amber-400 hover:text-white underline"
                    >
                      Clear Canvas
                    </button>
                  )}
                </div>
                <div className="relative border border-graphite-border rounded-xs bg-[#111] overflow-hidden">
                  <canvas
                    ref={signatureCanvasRef}
                    width={380}
                    height={90}
                    className="w-full h-[90px] block cursor-crosshair touch-none"
                    onMouseDown={(e) => {
                      const canvas = signatureCanvasRef.current;
                      if (!canvas) return;
                      const ctx = canvas.getContext('2d');
                      if (!ctx) return;
                      setIsDrawing(true);
                      setHasDrawnSignature(true);
                      const rect = canvas.getBoundingClientRect();
                      const scaleX = canvas.width / rect.width;
                      const scaleY = canvas.height / rect.height;
                      ctx.beginPath();
                      ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
                    }}
                    onMouseMove={(e) => {
                      if (!isDrawing) return;
                      const canvas = signatureCanvasRef.current;
                      if (!canvas) return;
                      const ctx = canvas.getContext('2d');
                      if (!ctx) return;
                      const rect = canvas.getBoundingClientRect();
                      const scaleX = canvas.width / rect.width;
                      const scaleY = canvas.height / rect.height;
                      ctx.strokeStyle = '#D4AF37';
                      ctx.lineWidth = 2.5;
                      ctx.lineCap = 'round';
                      ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
                      ctx.stroke();
                    }}
                    onMouseUp={() => setIsDrawing(false)}
                    onMouseLeave={() => setIsDrawing(false)}
                    onTouchStart={(e) => {
                      const canvas = signatureCanvasRef.current;
                      if (!canvas || !e.touches[0]) return;
                      const ctx = canvas.getContext('2d');
                      if (!ctx) return;
                      setIsDrawing(true);
                      setHasDrawnSignature(true);
                      const rect = canvas.getBoundingClientRect();
                      const scaleX = canvas.width / rect.width;
                      const scaleY = canvas.height / rect.height;
                      ctx.beginPath();
                      ctx.moveTo((e.touches[0].clientX - rect.left) * scaleX, (e.touches[0].clientY - rect.top) * scaleY);
                    }}
                    onTouchMove={(e) => {
                      if (!isDrawing || !e.touches[0]) return;
                      const canvas = signatureCanvasRef.current;
                      if (!canvas) return;
                      const ctx = canvas.getContext('2d');
                      if (!ctx) return;
                      const rect = canvas.getBoundingClientRect();
                      const scaleX = canvas.width / rect.width;
                      const scaleY = canvas.height / rect.height;
                      ctx.strokeStyle = '#D4AF37';
                      ctx.lineWidth = 2.5;
                      ctx.lineCap = 'round';
                      ctx.lineTo((e.touches[0].clientX - rect.left) * scaleX, (e.touches[0].clientY - rect.top) * scaleY);
                      ctx.stroke();
                    }}
                    onTouchEnd={() => setIsDrawing(false)}
                  />
                  {!hasDrawnSignature && (
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-dark/50 pointer-events-none font-mono">
                      (Optional: Click & drag to sign)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </form>
        </MobileFormSheet>
      )}
    </div>
  );
};
