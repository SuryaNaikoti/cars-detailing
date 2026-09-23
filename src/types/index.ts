// Strict domain entities adhering to Workshop OS Architecture V3.0

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'FOLLOW_UP_DUE'
  | 'APPOINTMENT_REQUESTED'
  | 'APPOINTMENT_CONFIRMED'
  | 'CONVERTED'
  | 'LOST';

export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type LeadSource =
  | 'Website'
  | 'WhatsApp'
  | 'Direct Call'
  | 'Walk-In'
  | 'Instagram'
  | 'Google'
  | 'Referral'
  | 'Other';

export type LostReason =
  | 'CUSTOMER_DECLINED'
  | 'PRICE'
  | 'NO_RESPONSE'
  | 'CHANGED_MIND'
  | 'OUT_OF_SCOPE'
  | 'COMPETITOR'
  | 'LOCATION'
  | 'TIMING'
  | 'OTHER';

export interface LeadTimelineEvent {
  id: string;
  timestamp: string;
  actor: string;
  event: string;
  notes?: string;
}

export interface AppointmentTimelineEvent {
  id: string;
  timestamp: string;
  actor: string;
  event: string;
  notes?: string;
}

export type AppointmentStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'ARRIVED'
  | 'CHECKED_IN'
  | 'CONVERTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type JobCardStatus =
  | 'VEHICLE_RECEIVED'
  | 'INSPECTION_COMPLETED'
  | 'ESTIMATE_SENT'
  | 'ESTIMATE_APPROVED'
  | 'WORK_IN_PROGRESS'
  | 'QUALITY_CHECK'
  | 'READY_FOR_COLLECTION'
  | 'DELIVERED'
  | 'CANCELLED';

// Canonical 5-state Inspection Lifecycle
export type InspectionStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CUSTOMER_SHARED'
  | 'ARCHIVED';

// Canonical Item Condition States
export type InspectionCondition =
  | 'GOOD'
  | 'ATTENTION'
  | 'CRITICAL'
  | 'NOT_INSPECTED'
  | 'NOT_APPLICABLE';

export type FindingPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type EstimateStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'PARTIALLY_APPROVED'
  | 'APPROVED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'CONVERTED_TO_WORK';

export type TechnicianStatus = 'AVAILABLE' | 'BUSY' | 'ON_BREAK' | 'OFFLINE';

export type ReminderStatus =
  | 'UPCOMING'
  | 'DUE'
  | 'OVERDUE'
  | 'CONTACTED'
  | 'COMPLETED';

export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description?: string;
  typical_symptoms?: string[];
  inclusions?: string[];
  active: boolean;
  display_order: number;
}

export interface VehicleOption {
  make: string;
  models: string[];
  years: number[];
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  vehicle_count: number;
  last_service_date?: string;
  next_service_due?: string;
  active_job_id?: string | null;
  total_visits: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Backward compatibility alias
export type Customer = CustomerRecord;

export interface VehicleRecord {
  id: string;
  customer_id: string;
  customer_name: string;
  make: string;
  model: string;
  year: number;
  registration: string;
  vin_masked: string;
  odometer: number;
  last_service_date?: string;
  next_service_due?: string;
  active_job_id?: string | null;
  created_at: string;
}

// Backward compatibility alias
export type Vehicle = VehicleRecord;

export interface LeadRecord {
  id: string;
  created_at: string;
  source: LeadSource;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  vehicle_summary: string;
  registration?: string;
  service_requested: string;
  message: string;
  priority: LeadPriority;
  assigned_advisor: string;
  next_action: string;
  status: LeadStatus;
  next_follow_up_at?: string | null;
  last_contacted_at?: string | null;
  notes?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  service_name?: string;
  issue?: string;
  preferred_date?: string;
  preferred_time?: string;
  appointment_id?: string;
  job_card_id?: string;
  lost_reason?: LostReason;
  lost_notes?: string;
  timeline?: LeadTimelineEvent[];
}

// Backward compatibility alias
export type Lead = LeadRecord;

export interface AppointmentRecord {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  vehicle_summary: string;
  service_name: string;
  requested_date: string;
  requested_time: string;
  status: AppointmentStatus;
  advisor: string;
  notes?: string;
  created_at: string;
  lead_id?: string;
  job_card_id?: string;
  source?: LeadSource;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  registration_number?: string;
  arrival_time?: string;
  check_in_time?: string;
  check_in_odometer?: number;
  check_in_fuel?: string;
  check_in_notes?: string;
  cancellation_reason?: string;
  timeline?: AppointmentTimelineEvent[];
}

// Backward compatibility alias
export type Booking = AppointmentRecord;
export type BookingStatus = 'requested' | 'contacted' | 'confirmed' | 'completed' | 'cancelled';

export interface InspectionEvidence {
  id: string;
  inspection_id: string;
  finding_id?: string;
  file_url: string;
  caption?: string;
  created_at: string;
  uploaded_by?: string;
}

export interface InspectionItem {
  id: string;
  inspection_id: string;
  category: string;
  component: string;
  condition: InspectionCondition;
  finding?: string;
  recommendation?: string;
  priority?: FindingPriority;
  technician_id?: string;
  technician_name?: string;
  evidence?: InspectionEvidence[];
  add_to_estimate?: boolean;
  estimate_line_item_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InspectionTimelineEvent {
  id: string;
  timestamp: string;
  actor: string;
  event: string;
  notes?: string;
}

export interface InspectionFinding {
  id: string;
  category: string;
  condition: InspectionCondition;
  finding: string;
  recommendation: string;
  priority?: FindingPriority;
  component?: string;
  photo_url?: string;
  evidence?: InspectionEvidence[];
  add_to_estimate?: boolean;
  estimate_id?: string;
  estimate_line_item_id?: string;
}

export interface InspectionRecord {
  id: string;
  job_id: string;
  job_card_id?: string; // Canonical alias
  appointment_id?: string;
  lead_id?: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  vehicle_id?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_summary?: string;
  registration?: string;
  technician_id?: string;
  technician_name?: string;
  advisor_id?: string;
  advisor_name?: string;
  inspection_type?: string;
  status: InspectionStatus;
  started_at?: string;
  completed_at?: string;
  shared_at?: string;
  archived_at?: string;
  summary?: string;
  created_at?: string;
  updated_at?: string;
  odometer: number;
  fuel_level: string; // e.g. "65%" or "3/4"
  exterior_status: InspectionCondition;
  interior_status: InspectionCondition;
  engine_bay_status: InspectionCondition;
  tyres_status: InspectionCondition;
  brakes_status: InspectionCondition;
  lights_status: InspectionCondition;
  battery_status: InspectionCondition;
  fluids_status: InspectionCondition;
  visible_damage?: string;
  items?: InspectionItem[];
  findings: InspectionFinding[];
  evidence?: InspectionEvidence[];
  timeline?: InspectionTimelineEvent[];
  notes?: string;
  inspector_name: string;
}

export type EstimateItemType = 'Labour' | 'Parts' | 'Consumables';
export type EstimateApprovalStatus = 'PENDING' | 'APPROVED' | 'DECLINED';

export interface EstimateItem {
  id: string;
  estimate_id?: string;
  source_finding_id?: string;
  source_inspection_id?: string;
  source_category?: string;
  source_component?: string;
  source_recommendation?: string;
  source_priority?: FindingPriority;
  description: string;
  type: EstimateItemType;
  category?: string;
  quantity: number;
  unit?: string;
  unit_price: number;
  discount?: number;
  line_total: number;
  is_price_configured?: boolean;
  customer_visible?: boolean;
  approval_status?: EstimateApprovalStatus;
  internal_note?: string;
  customer_note?: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface EstimateRevision {
  revision_number: number;
  timestamp: string;
  total: number;
  reason: string;
  created_by: string;
  approved_total?: number;
}

export interface EstimateTimelineEvent {
  id: string;
  timestamp: string;
  actor: string;
  event: string;
  notes?: string;
}

export interface EstimateRecord {
  id: string;
  estimate_number: string;
  job_id: string;
  job_card_id?: string;
  appointment_id?: string;
  lead_id?: string;
  inspection_id?: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  vehicle_id?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_summary: string;
  registration?: string;
  odometer?: number;
  fuel_level?: string;
  advisor_id?: string;
  advisor_name?: string;
  technician_id?: string;
  technician_name?: string;
  created_date: string;
  validity_date: string;
  labour_total: number;
  parts_total: number;
  subtotal: number;
  discount_total?: number;
  total: number;
  approved_total?: number;
  declined_total?: number;
  revision_number?: number;
  revisions?: EstimateRevision[];
  notes?: string;
  internal_notes?: string;
  customer_notes?: string;
  status: EstimateStatus;
  items: EstimateItem[];
  public_token: string;
  timeline?: EstimateTimelineEvent[];
  authorized_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Backward compatibility alias
export type Quote = EstimateRecord;
export type QuoteItem = EstimateItem;
export type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'approval_requested' | 'approved' | 'declined' | 'expired';

export interface JobTimelineEvent {
  id: string;
  timestamp: string;
  status: JobCardStatus;
  event_label: string;
  actor: string;
  customer_visible: boolean;
  notes?: string;
}

export type JobPriority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';

export type WorkItemType = 'Labour' | 'Part' | 'Consumable' | 'Other';
export type WorkItemStatus = 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REMOVED';

export interface WorkItem {
  id: string;
  description: string;
  type: WorkItemType;
  quantity: number;
  unit: string;
  estimated_amount: number;
  actual_amount?: number;
  status: WorkItemStatus;
}

export type QCCheckResult = 'PASS' | 'FAIL' | 'NOT_APPLICABLE';

export interface QCCheckItem {
  id: string;
  label: string;
  result: QCCheckResult;
  notes?: string;
}

export interface DiagnosticFinding {
  id: string;
  finding: string;
  severity: 'GOOD' | 'ATTENTION' | 'CRITICAL';
  notes?: string;
}

export interface JobCard {
  id: string; // e.g. "JC-2047"
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  vehicle_id: string;
  vehicle_summary: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  registration: string;
  vin_masked?: string;
  service_name: string;
  customer_complaint: string;
  intake_notes?: string;
  advisor: string;
  technician: string;
  bay: string;
  opened_at: string;
  promised_completion: string;
  odometer: number;
  fuel_level: string;
  status: JobCardStatus;
  priority?: JobPriority;
  estimate_total: number;
  approval_status: 'PENDING' | 'APPROVED' | 'DECLINED';
  public_token: string; // Opaque token for customer tracking
  timeline: JobTimelineEvent[];
  work_notes?: string;
  lead_id?: string;
  appointment_id?: string;
  waiting_reason?: string;
  waiting_since?: string;
  work_items?: WorkItem[];
  qc_checklist?: QCCheckItem[];
  diagnostic_findings?: DiagnosticFinding[];
  delivery_notes?: string;
  delivered_at?: string;
  customer_signature?: string; // Base64 data URL or vector string from handover sign-off
  handover_signoff_name?: string;
  handover_signoff_at?: string;
  is_manual_history?: boolean;
  manual_source?: string;
  origin?: 'CANONICAL' | 'MANUAL_ENTRY';
}

// Backward compatibility alias
export type ServiceJob = {
  id: string;
  job_number: string;
  customer_name: string;
  vehicle_summary: string;
  current_status: any;
  status_updated_at: string;
  customer_notes?: string;
  public_token: string;
  history: any[];
};

export type TeamRole =
  | 'OWNER_ADMIN'
  | 'WORKSHOP_MANAGER'
  | 'SERVICE_ADVISOR'
  | 'RECEPTION'
  | 'TECHNICIAN'
  | 'VIEWER';

export interface TeamMemberRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: TeamRole;
  role_display: string;
  specialization?: string;
  technician_id?: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  assigned_job_ids?: string[];
  last_active?: string;
  access_level: string;
  created_at: string;
}

export interface OperatingHoursDay {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  status: 'OPEN' | 'CLOSED';
  open_time: string;
  close_time: string;
}

export interface WorkshopProfileConfig {
  name: string;
  business_address: string;
  phone: string;
  email: string;
  default_currency: string;
  timezone: string;
  operating_hours: OperatingHoursDay[];
  bays_count: number;
}

export interface SystemAuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  module: 'JOBS' | 'ESTIMATES' | 'INSPECTIONS' | 'LEADS' | 'APPOINTMENTS' | 'TEAM' | 'SETTINGS';
  action: string;
  record_id: string;
  change_summary: string;
}

export interface TechnicianRecord {
  id: string;
  name: string;
  specialization: string;
  active_jobs_count: number;
  assigned_job_ids: string[];
  status: TechnicianStatus;
  phone: string;
}

export type ReminderType =
  | 'SERVICE_DUE'
  | 'DECLINED_RECOMMENDATION'
  | 'SEASONAL_CHECK'
  | 'GENERAL_FOLLOW_UP';

export type ReminderPriority = 'HIGH' | 'NORMAL' | 'LOW';

export interface ServiceReminder {
  id: string;
  customer_name: string;
  customer_phone: string;
  vehicle_summary: string;
  registration: string;
  last_service_date: string;
  recommended_service: string;
  due_date: string;
  status: ReminderStatus;
  notes?: string;
  vehicle_id?: string;
  customer_id?: string;
  job_card_id?: string;
  reminder_type?: ReminderType;
  priority?: ReminderPriority;
  reason?: string;
  advisor?: string;
  source_estimate_id?: string;
  source_estimate_number?: string;
  source_finding_id?: string;
  source_recommendation?: string;
  completed_at?: string;
  contacted_at?: string;
}

export interface CustomerSafeJob {
  job_id: string;
  customer_display_name: string;
  vehicle: string;
  registration: string;
  service: string;
  odometer: number;
  status: JobCardStatus;
  status_label: string;
  latest_update: string;
  next_step: string;
  estimate_approved_state: 'Pending Review' | 'Approved' | 'Declined';
  last_updated: string;
  timeline: {
    timestamp: string;
    label: string;
    completed: boolean;
    current: boolean;
  }[];
  workshop_phone: string;
  whatsapp_prefilled_url: string;
}

export interface ReviewItem {
  id: string;
  name: string;
  vehicle: string;
  content: string;
  rating: number;
  source: string;
  is_sample: boolean;
}

export interface OfferItem {
  id: string;
  title: string;
  price_label: string;
  description: string;
  inclusions: string[];
  terms: string;
  is_sample: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}
