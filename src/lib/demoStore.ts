import type {
  JobCard,
  JobCardStatus,
  CustomerRecord,
  VehicleRecord,
  LeadRecord,
  LeadStatus,
  LostReason,
  LeadTimelineEvent,
  AppointmentRecord,
  AppointmentStatus,
  AppointmentTimelineEvent,
  InspectionRecord,
  InspectionItem,
  InspectionFinding,
  InspectionCondition,
  EstimateRecord,
  EstimateItem,
  EstimateStatus,
  WorkItem,
  TechnicianRecord,
  ServiceReminder,
  CustomerSafeJob,
  TeamMemberRecord,
  WorkshopProfileConfig,
  SystemAuditEvent,
} from '../types';

const JOBS_KEY = 'te_workshop_jobs_v3';
const CUSTOMERS_KEY = 'te_workshop_customers_v3';
const VEHICLES_KEY = 'te_workshop_vehicles_v3';
const LEADS_KEY = 'te_workshop_leads_v3';
const APPOINTMENTS_KEY = 'te_workshop_appointments_v3';
const INSPECTIONS_KEY = 'te_workshop_inspections_v3';
const ESTIMATES_KEY = 'te_workshop_estimates_v3';
const TECHNICIANS_KEY = 'te_workshop_technicians_v3';
const REMINDERS_KEY = 'te_workshop_reminders_v3';

// Stage Human Readable Mapping
export const STAGE_DISPLAY_MAP: Record<JobCardStatus, string> = {
  VEHICLE_RECEIVED: 'Intake Received',
  INSPECTION_COMPLETED: 'Inspection Complete',
  ESTIMATE_SENT: 'Awaiting Approval',
  ESTIMATE_APPROVED: 'Approved',
  WORK_IN_PROGRESS: 'In Progress',
  QUALITY_CHECK: 'Quality Check',
  READY_FOR_COLLECTION: 'Ready for Collection',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

// Next step explanation for customer portal
export const STAGE_NEXT_STEP_MAP: Record<JobCardStatus, string> = {
  VEHICLE_RECEIVED: 'Initial physical health check and multi-point diagnostics.',
  INSPECTION_COMPLETED: 'Generating itemized digital estimate for approval.',
  ESTIMATE_SENT: 'Awaiting customer scope approval on digital estimate.',
  ESTIMATE_APPROVED: 'Technician assignment and parts allocation.',
  WORK_IN_PROGRESS: 'Comprehensive multi-point quality check and road test.',
  QUALITY_CHECK: 'Vehicle detailing, road test verification and collection preparation.',
  READY_FOR_COLLECTION: 'Customer handover and service documentation completion.',
  DELIVERED: 'Periodic service interval scheduled.',
  CANCELLED: 'Job card has been cancelled.',
};

export const STAGE_LATEST_UPDATE_MAP: Record<JobCardStatus, string> = {
  VEHICLE_RECEIVED: 'Vehicle logged into reception bay. Intake checklist initiated.',
  INSPECTION_COMPLETED: 'Technician completed electronic scan and mechanical inspection.',
  ESTIMATE_SENT: 'Itemized digital estimate generated and transmitted for customer review.',
  ESTIMATE_APPROVED: 'Customer approved scope of work. Workshop floor scheduled.',
  WORK_IN_PROGRESS: 'Technician has started the approved service and mechanical work in assigned bay.',
  QUALITY_CHECK: 'Service execution concluded. Diagnostic verification and road testing underway.',
  READY_FOR_COLLECTION: 'Vehicle fully tested, cleaned, and staged in collection area.',
  DELIVERED: 'Vehicle successfully handed over to owner.',
  CANCELLED: 'Job card cancelled and workshop execution halted.',
};

// Seed Technicians
const SEED_TECHNICIANS: TechnicianRecord[] = [
  {
    id: 'tech-1',
    name: 'Arjun Sharma',
    specialization: 'German Drivetrain & Diagnostics',
    active_jobs_count: 2,
    assigned_job_ids: ['JC-2047', 'JC-2049'],
    status: 'BUSY',
    phone: '+91 98765 11001',
  },
  {
    id: 'tech-2',
    name: 'Rahul Sen',
    specialization: 'Electronics & Suspension Systems',
    active_jobs_count: 1,
    assigned_job_ids: ['JC-2048'],
    status: 'BUSY',
    phone: '+91 98765 11002',
  },
  {
    id: 'tech-3',
    name: 'Vikram Singh',
    specialization: 'Periodic Maintenance & Brake Overhauls',
    active_jobs_count: 0,
    assigned_job_ids: [],
    status: 'AVAILABLE',
    phone: '+91 98765 11003',
  },
  {
    id: 'tech-4',
    name: 'Farhan Akhtar',
    specialization: 'AC & Thermal Management',
    active_jobs_count: 0,
    assigned_job_ids: [],
    status: 'ON_BREAK',
    phone: '+91 98765 11004',
  },
];

// Seed Customers
const SEED_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'cust-1',
    name: 'Rahul Mehta',
    phone: '+91 98765 43210',
    email: 'rahul.mehta@example.com',
    vehicle_count: 1,
    last_service_date: '2026-03-12',
    next_service_due: '2026-09-25',
    active_job_id: 'JC-2047',
    total_visits: 3,
    notes: 'Long-time customer. Prefers OEM Motul 8100 X-cess synthetic oil.',
    created_at: '2025-08-10T10:00:00Z',
    updated_at: '2026-09-19T09:00:00Z',
  },
  {
    id: 'cust-2',
    name: 'Ananya Deshmukh',
    phone: '+91 98111 22233',
    email: 'ananya.d@example.com',
    vehicle_count: 1,
    last_service_date: '2026-04-18',
    next_service_due: '2026-10-15',
    active_job_id: 'JC-2048',
    total_visits: 2,
    notes: 'Requested loaner car or fast-track collection if possible.',
    created_at: '2025-11-20T14:30:00Z',
    updated_at: '2026-09-19T10:00:00Z',
  },
  {
    id: 'cust-3',
    name: 'Vikramaditya Rao',
    phone: '+91 98222 33344',
    email: 'v.rao@example.com',
    vehicle_count: 1,
    last_service_date: '2026-01-14',
    next_service_due: '2026-07-14',
    active_job_id: null,
    total_visits: 5,
    notes: 'Track enthusiast. Frequent brake fluid renewal required.',
    created_at: '2024-06-15T09:00:00Z',
    updated_at: '2026-01-15T12:00:00Z',
  },
  {
    id: 'cust-4',
    name: 'Priyanka Sen',
    phone: '+91 98450 67890',
    email: 'priyanka.sen@example.com',
    vehicle_count: 1,
    last_service_date: '2026-09-20',
    next_service_due: '2027-03-20',
    active_job_id: null,
    total_visits: 2,
    notes: 'Prefers morning pickup. Sensitive to cabin smells.',
    created_at: '2025-05-12T11:00:00Z',
    updated_at: '2026-09-20T15:00:00Z',
  },
  {
    id: 'cust-5',
    name: 'Rajesh Singhal',
    phone: '+91 98330 77112',
    email: 'rajesh.singhal@example.com',
    vehicle_count: 1,
    last_service_date: '2025-11-04',
    next_service_due: '2026-05-04',
    active_job_id: 'JC-2051',
    total_visits: 3,
    notes: 'Reported high-speed steering vibration above 100 km/h.',
    created_at: '2025-01-20T08:30:00Z',
    updated_at: '2026-09-20T08:00:00Z',
  },
  {
    id: 'cust-6',
    name: 'Meera Nambiar',
    phone: '+91 98199 44332',
    email: 'meera.nambiar@example.com',
    vehicle_count: 1,
    last_service_date: '2026-09-19',
    next_service_due: '2027-03-19',
    active_job_id: null,
    total_visits: 4,
    notes: 'Suspension overhaul completed. Next periodic inspection due Mar 2027.',
    created_at: '2024-09-10T14:00:00Z',
    updated_at: '2026-09-19T14:30:00Z',
  },
];

// Seed Vehicles
const SEED_VEHICLES: VehicleRecord[] = [
  {
    id: 'veh-1',
    customer_id: 'cust-1',
    customer_name: 'Rahul Mehta',
    make: 'BMW',
    model: '5 Series (G30)',
    year: 2022,
    registration: 'MH 02 ER 4500',
    vin_masked: 'WBA530D***7841',
    odometer: 34250,
    last_service_date: '2026-03-12',
    next_service_due: '2026-09-25',
    active_job_id: 'JC-2047',
    created_at: '2025-08-10T10:15:00Z',
  },
  {
    id: 'veh-2',
    customer_id: 'cust-2',
    customer_name: 'Ananya Deshmukh',
    make: 'Mercedes-Benz',
    model: 'C-Class (W205)',
    year: 2021,
    registration: 'MH 01 DK 8812',
    vin_masked: 'WDD2050***4492',
    odometer: 42100,
    last_service_date: '2026-04-18',
    next_service_due: '2026-10-15',
    active_job_id: 'JC-2048',
    created_at: '2025-11-20T14:45:00Z',
  },
  {
    id: 'veh-3',
    customer_id: 'cust-3',
    customer_name: 'Vikramaditya Rao',
    make: 'Porsche',
    model: 'Macan GTS',
    year: 2023,
    registration: 'MH 04 BK 9000',
    vin_masked: 'WP1ZZZ9***1209',
    odometer: 21500,
    last_service_date: '2026-01-14',
    next_service_due: '2026-07-14',
    active_job_id: null,
    created_at: '2024-06-15T09:30:00Z',
  },
  {
    id: 'veh-4',
    customer_id: 'cust-4',
    customer_name: 'Priyanka Sen',
    make: 'Volvo',
    model: 'XC60',
    year: 2021,
    registration: 'MH 02 CZ 5510',
    vin_masked: 'YV4102***8819',
    odometer: 38900,
    last_service_date: '2026-09-20',
    next_service_due: '2027-03-20',
    active_job_id: null,
    created_at: '2025-05-12T11:15:00Z',
  },
  {
    id: 'veh-5',
    customer_id: 'cust-5',
    customer_name: 'Rajesh Singhal',
    make: 'Audi',
    model: 'A6 Matrix',
    year: 2022,
    registration: 'MH 02 BG 3311',
    vin_masked: 'WAUZZZ4G***9021',
    odometer: 45200,
    last_service_date: '2025-11-04',
    next_service_due: '2026-05-04',
    active_job_id: 'JC-2051',
    created_at: '2025-01-20T08:45:00Z',
  },
  {
    id: 'veh-6',
    customer_id: 'cust-6',
    customer_name: 'Meera Nambiar',
    make: 'BMW',
    model: '3 Series (G20)',
    year: 2020,
    registration: 'MH 02 EE 7721',
    vin_masked: 'WBA330I***6612',
    odometer: 51200,
    last_service_date: '2026-09-19',
    next_service_due: '2027-03-19',
    active_job_id: null,
    created_at: '2024-09-10T14:15:00Z',
  },
];

// Seed Jobs (Canonical Object)
const SEED_JOBS: Record<string, JobCard> = {
  'JC-2047': {
    id: 'JC-2047',
    customer_id: 'cust-1',
    customer_name: 'Rahul Mehta',
    customer_phone: '+91 98765 43210',
    customer_email: 'rahul.mehta@example.com',
    vehicle_id: 'veh-1',
    vehicle_summary: '2022 BMW 5 Series (G30)',
    vehicle_make: 'BMW',
    vehicle_model: '5 Series (G30)',
    vehicle_year: 2022,
    registration: 'MH 02 ER 4500',
    vin_masked: 'WBA530D***7841',
    service_name: 'Computer Diagnostics + Periodic Service',
    customer_complaint: 'Check engine warning lamp illuminated on highway drive; slight hesitation under kickdown.',
    intake_notes: 'Valuables removed. Slight scuff mark on rear bumper corner noted during intake walkaround.',
    advisor: 'Rohan Deshmukh',
    technician: 'Arjun Sharma',
    bay: 'BAY 01',
    opened_at: '2026-09-19T08:30:00Z',
    promised_completion: '2026-09-19T18:00:00Z',
    odometer: 34250,
    fuel_level: '60%',
    status: 'WORK_IN_PROGRESS',
    priority: 'HIGH',
    estimate_total: 14500,
    approval_status: 'APPROVED',
    public_token: 'track-bmw-jc2047',
    lead_id: 'lead-101',
    appointment_id: 'apt-201',
    work_items: [
      { id: 'wi-1', description: 'Comprehensive Computer Diagnostics & Sensor Sweep', type: 'Labour', quantity: 1, unit: 'Job', estimated_amount: 2500, actual_amount: 2500, status: 'COMPLETED' },
      { id: 'wi-2', description: 'BMW LL-04 Fully Synthetic Engine Oil', type: 'Part', quantity: 6.5, unit: 'Litres', estimated_amount: 6500, actual_amount: 6500, status: 'IN_PROGRESS' },
      { id: 'wi-3', description: 'OEM Oil Filter Cartridge & Sump Washer', type: 'Part', quantity: 1, unit: 'Pc', estimated_amount: 1800, actual_amount: 1800, status: 'IN_PROGRESS' },
      { id: 'wi-4', description: 'Periodic Service Labour & Electronic Interval Reset', type: 'Labour', quantity: 1, unit: 'Job', estimated_amount: 2000, actual_amount: 2000, status: 'IN_PROGRESS' },
      { id: 'wi-5', description: 'Throttle Body Decarbonization & Clean', type: 'Labour', quantity: 1, unit: 'Job', estimated_amount: 1700, actual_amount: 1700, status: 'PENDING' },
    ],
    qc_checklist: [
      { id: 'qc-1', label: 'Customer complaint scope verified and addressed', result: 'PASS' },
      { id: 'qc-2', label: 'Diagnostic scan completed and warning lights verified', result: 'PASS' },
      { id: 'qc-3', label: 'Engine, coolant and brake fluid levels checked', result: 'NOT_APPLICABLE' },
      { id: 'qc-4', label: 'Road test completed and braking response verified', result: 'NOT_APPLICABLE' },
      { id: 'qc-5', label: 'Vehicle interior cleaned and final detailing completed', result: 'NOT_APPLICABLE' },
    ],
    work_notes: 'DME fault code 120408 (Charging pressure control deactivation) stored. Throttle body decarbonized and synthetic oil renew in progress.',
    timeline: [
      {
        id: 'tl-1',
        timestamp: '2026-09-19T08:30:00Z',
        status: 'VEHICLE_RECEIVED',
        event_label: 'Vehicle Received at Workshop Intake',
        actor: 'Rohan Deshmukh (Advisor)',
        customer_visible: true,
        notes: 'Vehicle arrived on schedule. Odometer & inventory checklist verified.',
      },
      {
        id: 'tl-2',
        timestamp: '2026-09-19T09:15:00Z',
        status: 'INSPECTION_COMPLETED',
        event_label: 'Digital Vehicle Inspection Completed',
        actor: 'Arjun Sharma (Technician)',
        customer_visible: true,
        notes: '60-point electronic scan and mechanical underbody inspection completed.',
      },
      {
        id: 'tl-3',
        timestamp: '2026-09-19T10:00:00Z',
        status: 'ESTIMATE_SENT',
        event_label: 'Itemized Estimate Transmitted to Customer',
        actor: 'Rohan Deshmukh (Advisor)',
        customer_visible: true,
        notes: 'Scope estimate sent via customer digital portal.',
      },
      {
        id: 'tl-4',
        timestamp: '2026-09-19T10:45:00Z',
        status: 'ESTIMATE_APPROVED',
        event_label: 'Estimate Approved by Customer',
        actor: 'Rahul Mehta (Customer)',
        customer_visible: true,
        notes: 'Customer reviewed and accepted the scope of work.',
      },
      {
        id: 'tl-5',
        timestamp: '2026-09-19T11:15:00Z',
        status: 'WORK_IN_PROGRESS',
        event_label: 'Service & Mechanical Work Commenced',
        actor: 'Arjun Sharma (Technician)',
        customer_visible: true,
        notes: 'Assigned to Bay 01. Diagnostic execution and maintenance in progress.',
      },
    ],
  },
  'JC-2048': {
    id: 'JC-2048',
    customer_id: 'cust-2',
    customer_name: 'Ananya Deshmukh',
    customer_phone: '+91 98111 22233',
    customer_email: 'ananya.d@example.com',
    vehicle_id: 'veh-2',
    vehicle_summary: '2021 Mercedes-Benz C-Class (W205)',
    vehicle_make: 'Mercedes-Benz',
    vehicle_model: 'C-Class (W205)',
    vehicle_year: 2021,
    registration: 'MH 01 DK 8812',
    vin_masked: 'WDD2050***4492',
    service_name: 'Brake Pad Renewal + Front Sensors',
    customer_complaint: 'Brake wear notification on dash; front parking sensor intermittent beeping.',
    intake_notes: 'Customer requested complimentary exterior wash.',
    advisor: 'Pooja Varma',
    technician: 'Rahul Sen',
    bay: 'BAY 02',
    opened_at: '2026-09-19T09:00:00Z',
    promised_completion: '2026-09-19T16:30:00Z',
    odometer: 42100,
    fuel_level: '45%',
    status: 'QUALITY_CHECK',
    priority: 'NORMAL',
    estimate_total: 18200,
    approval_status: 'APPROVED',
    public_token: 'track-merc-jc2048',
    appointment_id: 'apt-202',
    work_items: [
      { id: 'wi-m1', description: 'Mercedes-Benz OEM Front Brake Pad Set', type: 'Part', quantity: 1, unit: 'Set', estimated_amount: 12500, actual_amount: 12500, status: 'COMPLETED' },
      { id: 'wi-m2', description: 'Front Brake Wear Sensor Lead', type: 'Part', quantity: 1, unit: 'Pc', estimated_amount: 1500, actual_amount: 1500, status: 'COMPLETED' },
      { id: 'wi-m3', description: 'Brake Caliper Servicing & Replacement Labour', type: 'Labour', quantity: 1, unit: 'Job', estimated_amount: 2800, actual_amount: 2800, status: 'COMPLETED' },
      { id: 'wi-m4', description: 'Parking Sensor Ultrasonic Harness Re-alignment', type: 'Labour', quantity: 1, unit: 'Job', estimated_amount: 1400, actual_amount: 1400, status: 'COMPLETED' },
    ],
    qc_checklist: [
      { id: 'qc-m1', label: 'Brake pad retention clip and pin security verified', result: 'PASS' },
      { id: 'qc-m2', label: 'Brake fluid reservoir level & boiling point verified', result: 'PASS' },
      { id: 'qc-m3', label: 'Front parking sensor diagnostic scan: Zero faults', result: 'PASS' },
      { id: 'qc-m4', label: 'Road test 40-0 km/h deceleration bite test', result: 'PASS' },
      { id: 'qc-m5', label: 'Exterior complimentary wash & tyre shine', result: 'PASS' },
    ],
    work_notes: 'OEM front brake pads and wear sensors installed. Caliper slides greased. Final diagnostic recalibration underway.',
    timeline: [
      {
        id: 'tl-merc-1',
        timestamp: '2026-09-19T09:00:00Z',
        status: 'VEHICLE_RECEIVED',
        event_label: 'Vehicle Received at Workshop Intake',
        actor: 'Pooja Varma (Advisor)',
        customer_visible: true,
      },
      {
        id: 'tl-merc-2',
        timestamp: '2026-09-19T09:40:00Z',
        status: 'INSPECTION_COMPLETED',
        event_label: 'Digital Vehicle Inspection Completed',
        actor: 'Rahul Sen (Technician)',
        customer_visible: true,
      },
      {
        id: 'tl-merc-3',
        timestamp: '2026-09-19T10:10:00Z',
        status: 'ESTIMATE_APPROVED',
        event_label: 'Estimate Approved by Customer',
        actor: 'Ananya Deshmukh (Customer)',
        customer_visible: true,
      },
      {
        id: 'tl-merc-4',
        timestamp: '2026-09-19T11:00:00Z',
        status: 'WORK_IN_PROGRESS',
        event_label: 'Service & Mechanical Work Commenced',
        actor: 'Rahul Sen (Technician)',
        customer_visible: true,
      },
      {
        id: 'tl-merc-5',
        timestamp: '2026-09-19T14:30:00Z',
        status: 'QUALITY_CHECK',
        event_label: 'Quality Check & Road Test Underway',
        actor: 'Rahul Sen (Technician)',
        customer_visible: true,
      },
    ],
  },
  'JC-2049': {
    id: 'JC-2049',
    customer_id: 'cust-3',
    customer_name: 'Vikramaditya Rao',
    customer_phone: '+91 98222 33344',
    customer_email: 'v.rao@example.com',
    vehicle_id: 'veh-3',
    vehicle_summary: '2023 Porsche Macan GTS',
    vehicle_make: 'Porsche',
    vehicle_model: 'Macan GTS',
    vehicle_year: 2023,
    registration: 'MH 04 BK 9000',
    vin_masked: 'WP1ZZZ9***1209',
    service_name: 'Transmission Diagnostic & Flush',
    customer_complaint: 'Jerky downshift from 3rd to 2nd gear in sport mode; customer reports mild transmission whine when cold.',
    intake_notes: 'Vehicle inspected in pristine condition. PDK diagnostic log requested.',
    advisor: 'Rohan Deshmukh',
    technician: 'Arjun Sharma',
    bay: 'UNASSIGNED',
    opened_at: '2026-09-20T08:30:00Z',
    promised_completion: '2026-09-20T17:30:00Z',
    odometer: 21500,
    fuel_level: '75%',
    status: 'ESTIMATE_SENT',
    priority: 'URGENT',
    estimate_total: 28500,
    approval_status: 'PENDING',
    public_token: 'track-porsche-jc2049',
    lead_id: 'lead-103',
    appointment_id: 'apt-203',
    waiting_reason: 'WAITING FOR CUSTOMER APPROVAL',
    waiting_since: '2026-09-20T11:00:00Z',
    work_items: [
      { id: 'wi-p1', description: 'PDK Electronic Adaptation & Valve Body Diagnostic Scan', type: 'Labour', quantity: 1, unit: 'Job', estimated_amount: 4500, status: 'PENDING' },
      { id: 'wi-p2', description: 'Porsche Genuine Dual-Clutch Transmission Fluid (8L)', type: 'Part', quantity: 8, unit: 'Litres', estimated_amount: 16000, status: 'PENDING' },
      { id: 'wi-p3', description: 'OEM Transmission Sump Filter Pan Assembly', type: 'Part', quantity: 1, unit: 'Pc', estimated_amount: 8000, status: 'PENDING' },
    ],
    qc_checklist: [
      { id: 'qc-p1', label: 'Transmission fluid temperature calibration (40°C)', result: 'NOT_APPLICABLE' },
      { id: 'qc-p2', label: 'PDK shift adaptation drive routine completed', result: 'NOT_APPLICABLE' },
    ],
    work_notes: 'Inspection complete. Estimate EST-2026-2049 transmitted to customer via Quote Viewer portal. Awaiting owner sign-off.',
    timeline: [
      {
        id: 'tl-p-1',
        timestamp: '2026-09-20T08:30:00Z',
        status: 'VEHICLE_RECEIVED',
        event_label: 'Vehicle Received at Workshop Intake',
        actor: 'Rohan Deshmukh (Advisor)',
        customer_visible: true,
        notes: 'Transferred from checked-in appointment apt-203.',
      },
      {
        id: 'tl-p-2',
        timestamp: '2026-09-20T09:45:00Z',
        status: 'INSPECTION_COMPLETED',
        event_label: 'Digital Vehicle Inspection Completed',
        actor: 'Arjun Sharma (Technician)',
        customer_visible: true,
        notes: 'PDK diagnostic scan and mechanical inspection completed.',
      },
      {
        id: 'tl-p-3',
        timestamp: '2026-09-20T10:30:00Z',
        status: 'ESTIMATE_SENT',
        event_label: 'Itemized Estimate Transmitted to Customer',
        actor: 'Rohan Deshmukh (Advisor)',
        customer_visible: true,
        notes: 'Estimate sent via customer digital portal.',
      },
    ],
  },
  'JC-2050': {
    id: 'JC-2050',
    customer_id: 'cust-4',
    customer_name: 'Priyanka Sen',
    customer_phone: '+91 98450 67890',
    customer_email: 'priyanka.sen@example.com',
    vehicle_id: 'veh-4',
    vehicle_summary: '2021 Volvo XC60',
    vehicle_make: 'Volvo',
    vehicle_model: 'XC60',
    vehicle_year: 2021,
    registration: 'MH 02 CZ 5510',
    vin_masked: 'YV4102***8819',
    service_name: 'AC & Cooling Systems',
    customer_complaint: 'Intermittent cabin cooling and sour smell on blower fan startup.',
    intake_notes: 'Cabin air filter compartment heavily clogged.',
    advisor: 'Pooja Varma',
    technician: 'Farhan Akhtar',
    bay: 'UNASSIGNED',
    opened_at: '2026-09-20T09:15:00Z',
    promised_completion: '2026-09-20T16:00:00Z',
    odometer: 38900,
    fuel_level: '50%',
    status: 'DELIVERED',
    priority: 'NORMAL',
    estimate_total: 9800,
    approval_status: 'APPROVED',
    public_token: 'track-volvo-jc2050',
    lead_id: 'lead-102',
    delivered_at: '2026-09-20T15:00:00Z',
    delivery_notes: 'AC servicing fully verified and cabin odor eliminated. Vehicle handed over to Priyanka Sen.',
    work_items: [
      { id: 'wi-v1', description: 'HVAC Evaporator Core Ultrasonic Disinfection & Flush', type: 'Labour', quantity: 1, unit: 'Job', estimated_amount: 2800, actual_amount: 2800, status: 'COMPLETED' },
      { id: 'wi-v2', description: 'R134a AC Gas Evacuation, Leak Test & Re-gas', type: 'Consumable', quantity: 1, unit: 'Service', estimated_amount: 3500, actual_amount: 3500, status: 'COMPLETED' },
      { id: 'wi-v3', description: 'Volvo OEM Multi-Filter Cabin Anti-Allergen Element', type: 'Part', quantity: 1, unit: 'Pc', estimated_amount: 3500, actual_amount: 3500, status: 'COMPLETED' },
    ],
    qc_checklist: [
      { id: 'qc-v1', label: 'AC vent outlet temperature verified at 6.2°C', result: 'PASS' },
      { id: 'qc-v2', label: 'Blower fan vibration & odor check: Odor eliminated', result: 'PASS' },
      { id: 'qc-v3', label: 'Cooling system pressure decay test: Passed', result: 'PASS' },
      { id: 'qc-v4', label: 'Complimentary interior vacuum & wash completed', result: 'PASS' },
    ],
    work_notes: 'All work executed. Multi-point quality inspection passed. Vehicle delivered to owner.',
    timeline: [
      {
        id: 'tl-v-1',
        timestamp: '2026-09-20T09:15:00Z',
        status: 'VEHICLE_RECEIVED',
        event_label: 'Vehicle Received at Workshop Intake',
        actor: 'Pooja Varma (Advisor)',
        customer_visible: true,
      },
      {
        id: 'tl-v-2',
        timestamp: '2026-09-20T10:00:00Z',
        status: 'WORK_IN_PROGRESS',
        event_label: 'AC Servicing Commenced',
        actor: 'Farhan Akhtar (Technician)',
        customer_visible: true,
      },
      {
        id: 'tl-v-3',
        timestamp: '2026-09-20T13:45:00Z',
        status: 'QUALITY_CHECK',
        event_label: 'Quality Check & Vent Thermal Verification',
        actor: 'Farhan Akhtar (Technician)',
        customer_visible: true,
      },
      {
        id: 'tl-v-4',
        timestamp: '2026-09-20T14:30:00Z',
        status: 'READY_FOR_COLLECTION',
        event_label: 'Vehicle Staged for Customer Handover',
        actor: 'Pooja Varma (Advisor)',
        customer_visible: true,
        notes: 'Customer notified via SMS/WhatsApp.',
      },
      {
        id: 'tl-v-5',
        timestamp: '2026-09-20T15:00:00Z',
        status: 'DELIVERED',
        event_label: 'Vehicle Delivered to Customer',
        actor: 'Pooja Varma (Advisor)',
        customer_visible: true,
        notes: 'Vehicle handover complete. Customer departed.',
      },
    ],
  },
  'JC-2051': {
    id: 'JC-2051',
    customer_id: 'cust-5',
    customer_name: 'Rajesh Singhal',
    customer_phone: '+91 98330 77112',
    customer_email: 'rajesh.singhal@example.com',
    vehicle_id: 'veh-5',
    vehicle_summary: '2022 Audi A6 Matrix',
    vehicle_make: 'Audi',
    vehicle_model: 'A6 Matrix',
    vehicle_year: 2022,
    registration: 'MH 02 BG 3311',
    vin_masked: 'WAUZZZ4G***9021',
    service_name: 'Periodic Service',
    customer_complaint: '45,000 km routine factory scheduled maintenance. Vibration at highway speeds above 100 km/h.',
    intake_notes: 'Minor curb rash on front left alloy noted.',
    advisor: 'Rohan Deshmukh',
    technician: 'Unassigned',
    bay: 'UNASSIGNED',
    opened_at: '2026-09-20T08:00:00Z',
    promised_completion: '2026-09-20T18:30:00Z',
    odometer: 45200,
    fuel_level: '65%',
    status: 'VEHICLE_RECEIVED',
    priority: 'HIGH',
    estimate_total: 16800,
    approval_status: 'APPROVED',
    public_token: 'track-audi-jc2051',
    lead_id: 'lead-101',
    work_items: [
      { id: 'wi-a1', description: 'Audi Scheduled 45k Inspection & Electronic Reset', type: 'Labour', quantity: 1, unit: 'Job', estimated_amount: 2800, actual_amount: 2800, status: 'COMPLETED' },
      { id: 'wi-a2', description: 'Audi Castrol Edge Professional 5W-40 Synthetic (5.5L)', type: 'Part', quantity: 5.5, unit: 'Litres', estimated_amount: 6200, actual_amount: 6200, status: 'IN_PROGRESS' },
      { id: 'wi-a3', description: 'Audi OEM Engine Oil Filter & Seal Kit', type: 'Part', quantity: 1, unit: 'Kit', estimated_amount: 1900, actual_amount: 1900, status: 'IN_PROGRESS' },
      { id: 'wi-a4', description: '4-Wheel Dynamic High-Speed Road-Force Balancing', type: 'Labour', quantity: 4, unit: 'Wheel', estimated_amount: 2400, actual_amount: 2400, status: 'PENDING' },
      { id: 'wi-a5', description: 'Engine Air Intake Filter Element Replacement', type: 'Part', quantity: 1, unit: 'Pc', estimated_amount: 3500, actual_amount: 3500, status: 'PENDING' },
    ],
    qc_checklist: [
      { id: 'qc-a1', label: 'Engine oil level on MMI display verified', result: 'PASS' },
      { id: 'qc-a2', label: 'Wheel balancing weights certified to < 5g imbalance', result: 'NOT_APPLICABLE' },
      { id: 'qc-a3', label: 'Road test 100-120 km/h steering vibration test', result: 'NOT_APPLICABLE' },
    ],
    work_notes: 'Engine oil flushed and replaced. Currently balancing all 4 alloy wheels on road-force balancer.',
    timeline: [
      {
        id: 'tl-a-1',
        timestamp: '2026-09-20T08:00:00Z',
        status: 'VEHICLE_RECEIVED',
        event_label: 'Vehicle Received at Workshop Intake',
        actor: 'Rohan Deshmukh (Advisor)',
        customer_visible: true,
      },
      {
        id: 'tl-a-2',
        timestamp: '2026-09-20T09:00:00Z',
        status: 'INSPECTION_COMPLETED',
        event_label: 'Digital Vehicle Inspection Completed',
        actor: 'Arjun Sharma (Technician)',
        customer_visible: true,
      },
      {
        id: 'tl-a-3',
        timestamp: '2026-09-20T09:30:00Z',
        status: 'ESTIMATE_APPROVED',
        event_label: 'Estimate Approved by Customer',
        actor: 'Rajesh Singhal (Customer)',
        customer_visible: true,
      },
      {
        id: 'tl-a-4',
        timestamp: '2026-09-20T10:15:00Z',
        status: 'WORK_IN_PROGRESS',
        event_label: 'Mechanical Work Commenced',
        actor: 'Arjun Sharma (Technician)',
        customer_visible: true,
      },
    ],
  },
  'JC-2052': {
    id: 'JC-2052',
    customer_id: 'cust-6',
    customer_name: 'Meera Nambiar',
    customer_phone: '+91 98199 44332',
    customer_email: 'meera.nambiar@example.com',
    vehicle_id: 'veh-6',
    vehicle_summary: '2020 BMW 3 Series (G20)',
    vehicle_make: 'BMW',
    vehicle_model: '3 Series (G20)',
    vehicle_year: 2020,
    registration: 'MH 02 EE 7721',
    vin_masked: 'WBA330I***6612',
    service_name: 'Suspension Overhaul',
    customer_complaint: 'Front suspension squeak over speed breakers and harsh ride over expansion joints.',
    intake_notes: 'Control arm bushing tearing suspected.',
    advisor: 'Rohan Deshmukh',
    technician: 'Vikram Singh',
    bay: 'BAY 02',
    opened_at: '2026-09-18T10:00:00Z',
    promised_completion: '2026-09-19T14:00:00Z',
    odometer: 51200,
    fuel_level: '40%',
    status: 'DELIVERED',
    priority: 'NORMAL',
    estimate_total: 24500,
    approval_status: 'APPROVED',
    public_token: 'track-bmw-jc2052',
    delivered_at: '2026-09-19T14:30:00Z',
    delivery_notes: 'Customer test drove vehicle with service advisor Rohan Deshmukh. Suspension noise completely resolved. Handover signed.',
    work_items: [
      { id: 'wi-m-1', description: 'Front Lower Control Arm Bushing Pair Replacement', type: 'Part', quantity: 2, unit: 'Pc', estimated_amount: 14000, actual_amount: 14000, status: 'COMPLETED' },
      { id: 'wi-m-2', description: 'Front Stabilizer Link Rod Pair', type: 'Part', quantity: 2, unit: 'Pc', estimated_amount: 4500, actual_amount: 4500, status: 'COMPLETED' },
      { id: 'wi-m-3', description: 'Suspension Overhaul & 3D Wheel Alignment Labour', type: 'Labour', quantity: 1, unit: 'Job', estimated_amount: 6000, actual_amount: 6000, status: 'COMPLETED' },
    ],
    qc_checklist: [
      { id: 'qc-d1', label: 'Bushing pinch bolt torque to BMW factory angle spec', result: 'PASS' },
      { id: 'qc-d2', label: '3D laser alignment camber/toe within green tolerances', result: 'PASS' },
      { id: 'qc-d3', label: 'Speed breaker & uneven road noise road test', result: 'PASS' },
    ],
    work_notes: 'Service successfully delivered to owner. Eligible for Service History review.',
    timeline: [
      {
        id: 'tl-d-1',
        timestamp: '2026-09-18T10:00:00Z',
        status: 'VEHICLE_RECEIVED',
        event_label: 'Vehicle Received at Workshop Intake',
        actor: 'Rohan Deshmukh (Advisor)',
        customer_visible: true,
      },
      {
        id: 'tl-d-2',
        timestamp: '2026-09-18T11:30:00Z',
        status: 'INSPECTION_COMPLETED',
        event_label: 'Digital Vehicle Inspection Completed',
        actor: 'Vikram Singh (Technician)',
        customer_visible: true,
      },
      {
        id: 'tl-d-3',
        timestamp: '2026-09-18T14:00:00Z',
        status: 'ESTIMATE_APPROVED',
        event_label: 'Estimate Approved by Customer',
        actor: 'Meera Nambiar (Customer)',
        customer_visible: true,
      },
      {
        id: 'tl-d-4',
        timestamp: '2026-09-19T09:00:00Z',
        status: 'WORK_IN_PROGRESS',
        event_label: 'Suspension Overhaul Executed',
        actor: 'Vikram Singh (Technician)',
        customer_visible: true,
      },
      {
        id: 'tl-d-5',
        timestamp: '2026-09-19T12:30:00Z',
        status: 'QUALITY_CHECK',
        event_label: 'Quality Check & 3D Alignment Passed',
        actor: 'Vikram Singh (Technician)',
        customer_visible: true,
      },
      {
        id: 'tl-d-6',
        timestamp: '2026-09-19T13:30:00Z',
        status: 'READY_FOR_COLLECTION',
        event_label: 'Staged for Collection',
        actor: 'Rohan Deshmukh (Advisor)',
        customer_visible: true,
      },
      {
        id: 'tl-d-7',
        timestamp: '2026-09-19T14:30:00Z',
        status: 'DELIVERED',
        event_label: 'Vehicle Delivered to Customer',
        actor: 'Rohan Deshmukh (Advisor)',
        customer_visible: true,
        notes: 'Handover complete. Keys released to Meera Nambiar.',
      },
    ],
  },
  'JC-1984': {
    id: 'JC-1984',
    customer_id: 'cust-1',
    customer_name: 'Rahul Mehta',
    customer_phone: '+91 98765 43210',
    customer_email: 'rahul.mehta@example.com',
    vehicle_id: 'veh-1',
    vehicle_summary: '2022 BMW 5 Series (G30)',
    vehicle_make: 'BMW',
    vehicle_model: '5 Series (G30)',
    vehicle_year: 2022,
    registration: 'MH 02 ER 4500',
    vin_masked: 'WBA530D***7841',
    service_name: 'Periodic Service',
    customer_complaint: 'Routine 30,000 km oil service and filter replacement.',
    intake_notes: 'Vehicle arrived clean. No external body damage noted.',
    advisor: 'Rohan Deshmukh',
    technician: 'Arjun Sharma',
    bay: 'BAY 01',
    opened_at: '2026-03-12T09:00:00Z',
    promised_completion: '2026-03-12T17:00:00Z',
    odometer: 28900,
    fuel_level: '60%',
    status: 'DELIVERED',
    priority: 'NORMAL',
    estimate_total: 12800,
    approval_status: 'APPROVED',
    public_token: 'track-bmw-jc1984',
    delivered_at: '2026-03-12T16:45:00Z',
    delivery_notes: 'Periodic maintenance complete. Service indicator reset to 10,000 km.',
    work_items: [
      { id: 'wi-1984-1', description: 'BMW LL-04 Fully Synthetic Engine Oil Renew (6.5L)', type: 'Part', quantity: 6.5, unit: 'Litres', estimated_amount: 6500, actual_amount: 6500, status: 'COMPLETED' },
      { id: 'wi-1984-2', description: 'OEM Engine Oil Filter Cartridge', type: 'Part', quantity: 1, unit: 'Pc', estimated_amount: 1800, actual_amount: 1800, status: 'COMPLETED' },
      { id: 'wi-1984-3', description: 'Periodic Scheduled Service & Multipoint Health Inspection', type: 'Labour', quantity: 1, unit: 'Job', estimated_amount: 4500, actual_amount: 4500, status: 'COMPLETED' },
    ],
    qc_checklist: [
      { id: 'qc-1984-1', label: 'Engine oil level and filter housing seal integrity', result: 'PASS' },
      { id: 'qc-1984-2', label: 'Electronic CBS service reset in iDrive', result: 'PASS' },
    ],
    work_notes: 'Engine oil flushed and replaced. Digital service history updated on BMW portal.',
    timeline: [
      { id: 'tl-1984-1', timestamp: '2026-03-12T09:00:00Z', status: 'VEHICLE_RECEIVED', event_label: 'Vehicle Received at Workshop Intake', actor: 'Rohan Deshmukh (Advisor)', customer_visible: true },
      { id: 'tl-1984-2', timestamp: '2026-03-12T10:15:00Z', status: 'INSPECTION_COMPLETED', event_label: 'Digital Vehicle Inspection Completed', actor: 'Arjun Sharma (Technician)', customer_visible: true },
      { id: 'tl-1984-3', timestamp: '2026-03-12T11:00:00Z', status: 'ESTIMATE_APPROVED', event_label: 'Estimate Approved by Customer', actor: 'Rahul Mehta (Customer)', customer_visible: true },
      { id: 'tl-1984-4', timestamp: '2026-03-12T12:00:00Z', status: 'WORK_IN_PROGRESS', event_label: 'Service & Maintenance Commenced', actor: 'Arjun Sharma (Technician)', customer_visible: true },
      { id: 'tl-1984-5', timestamp: '2026-03-12T15:30:00Z', status: 'QUALITY_CHECK', event_label: 'Quality Check Completed', actor: 'Arjun Sharma (Technician)', customer_visible: true },
      { id: 'tl-1984-6', timestamp: '2026-03-12T16:00:00Z', status: 'READY_FOR_COLLECTION', event_label: 'Vehicle Staged for Customer', actor: 'Rohan Deshmukh (Advisor)', customer_visible: true },
      { id: 'tl-1984-7', timestamp: '2026-03-12T16:45:00Z', status: 'DELIVERED', event_label: 'Vehicle Delivered to Customer', actor: 'Rohan Deshmukh (Advisor)', customer_visible: true },
    ],
  },
  'JC-1742': {
    id: 'JC-1742',
    customer_id: 'cust-1',
    customer_name: 'Rahul Mehta',
    customer_phone: '+91 98765 43210',
    customer_email: 'rahul.mehta@example.com',
    vehicle_id: 'veh-1',
    vehicle_summary: '2022 BMW 5 Series (G30)',
    vehicle_make: 'BMW',
    vehicle_model: '5 Series (G30)',
    vehicle_year: 2022,
    registration: 'MH 02 ER 4500',
    vin_masked: 'WBA530D***7841',
    service_name: 'Brake Inspection + Front Pad Replacement',
    customer_complaint: 'Slight brake pulsation at highway exit ramps.',
    intake_notes: 'Front brake pads measured at 3mm remaining.',
    advisor: 'Rohan Deshmukh',
    technician: 'Arjun Sharma',
    bay: 'BAY 01',
    opened_at: '2025-09-15T09:30:00Z',
    promised_completion: '2025-09-15T18:00:00Z',
    odometer: 21400,
    fuel_level: '50%',
    status: 'DELIVERED',
    priority: 'HIGH',
    estimate_total: 18500,
    approval_status: 'APPROVED',
    public_token: 'track-bmw-jc1742',
    delivered_at: '2025-09-15T17:30:00Z',
    delivery_notes: 'Front brake pads renewed. Wear sensor replaced. Bedding-in drive completed.',
    work_items: [
      { id: 'wi-1742-1', description: 'BMW OEM Front Brake Pad Set (G30 M-Sport)', type: 'Part', quantity: 1, unit: 'Set', estimated_amount: 13500, actual_amount: 13500, status: 'COMPLETED' },
      { id: 'wi-1742-2', description: 'Front Brake Wear Sensor Wire Harness', type: 'Part', quantity: 1, unit: 'Pc', estimated_amount: 1800, actual_amount: 1800, status: 'COMPLETED' },
      { id: 'wi-1742-3', description: 'Brake Caliper Servicing, Slide Pin Lubrication & Pad Replacement Labour', type: 'Labour', quantity: 1, unit: 'Job', estimated_amount: 3200, actual_amount: 3200, status: 'COMPLETED' },
    ],
    qc_checklist: [
      { id: 'qc-1742-1', label: 'Brake caliper guide pin torque specification', result: 'PASS' },
      { id: 'qc-1742-2', label: 'Brake pedal travel and hydraulic bite verification', result: 'PASS' },
    ],
    work_notes: 'New pads installed. Caliper brackets cleaned. Road test verified zero pulsation.',
    timeline: [
      { id: 'tl-1742-1', timestamp: '2025-09-15T09:30:00Z', status: 'VEHICLE_RECEIVED', event_label: 'Vehicle Received at Workshop Intake', actor: 'Rohan Deshmukh (Advisor)', customer_visible: true },
      { id: 'tl-1742-2', timestamp: '2025-09-15T10:45:00Z', status: 'INSPECTION_COMPLETED', event_label: 'Digital Vehicle Inspection Completed', actor: 'Arjun Sharma (Technician)', customer_visible: true },
      { id: 'tl-1742-3', timestamp: '2025-09-15T11:30:00Z', status: 'ESTIMATE_APPROVED', event_label: 'Estimate Approved by Customer', actor: 'Rahul Mehta (Customer)', customer_visible: true },
      { id: 'tl-1742-4', timestamp: '2025-09-15T12:30:00Z', status: 'WORK_IN_PROGRESS', event_label: 'Brake Overhaul Commenced', actor: 'Arjun Sharma (Technician)', customer_visible: true },
      { id: 'tl-1742-5', timestamp: '2025-09-15T16:00:00Z', status: 'QUALITY_CHECK', event_label: 'Quality Check & Road Test Passed', actor: 'Arjun Sharma (Technician)', customer_visible: true },
      { id: 'tl-1742-6', timestamp: '2025-09-15T16:45:00Z', status: 'READY_FOR_COLLECTION', event_label: 'Staged for Collection', actor: 'Rohan Deshmukh (Advisor)', customer_visible: true },
      { id: 'tl-1742-7', timestamp: '2025-09-15T17:30:00Z', status: 'DELIVERED', event_label: 'Vehicle Delivered to Customer', actor: 'Rohan Deshmukh (Advisor)', customer_visible: true },
    ],
  },
};

// Seed Leads
const SEED_LEADS: LeadRecord[] = [
  {
    id: 'lead-101',
    created_at: '2026-09-19T08:00:00Z',
    source: 'Website',
    customer_name: 'Devendra Patel',
    customer_phone: '+91 98900 12345',
    customer_email: 'dev.patel@example.com',
    vehicle_summary: '2023 Audi A6 45 TFSI',
    vehicle_make: 'Audi',
    vehicle_model: 'A6 45 TFSI',
    vehicle_year: 2023,
    registration: 'MH 02 BG 3311',
    service_requested: 'Computer Diagnostics',
    message: 'Check engine light came on yesterday morning. Throttle response feels sluggish when pulling out of junctions.',
    priority: 'HIGH',
    assigned_advisor: 'Rohan Deshmukh',
    next_action: 'Call customer to confirm inspection slot',
    status: 'NEW',
    next_follow_up_at: '2026-09-20T10:30:00+05:30',
    timeline: [
      {
        id: 'tl-lead-101-1',
        timestamp: '2026-09-19T08:00:00Z',
        actor: 'Customer (Online Intake)',
        event: 'Enquiry Received',
        notes: 'Submitted via Website diagnostic booking portal.',
      },
      {
        id: 'tl-lead-101-2',
        timestamp: '2026-09-19T08:15:00Z',
        actor: 'Rohan Deshmukh (Advisor)',
        event: 'Advisor Assigned',
        notes: 'Assigned to Rohan Deshmukh. Priority flagged as HIGH.',
      },
    ],
  },
  {
    id: 'lead-102',
    created_at: '2026-09-18T16:30:00Z',
    source: 'WhatsApp',
    customer_name: 'Sameer Kulkarni',
    customer_phone: '+91 98201 55443',
    vehicle_summary: '2020 BMW 3 Series (G20)',
    vehicle_make: 'BMW',
    vehicle_model: '3 Series (G20)',
    vehicle_year: 2020,
    registration: 'MH 02 EE 7721',
    service_requested: 'Periodic Service',
    message: 'Due for 40,000 km periodic service. Need quote for oil service, air filters and brake inspection.',
    priority: 'MEDIUM',
    assigned_advisor: 'Pooja Varma',
    next_action: 'Appointment requested for Saturday 11 AM',
    status: 'APPOINTMENT_REQUESTED',
    next_follow_up_at: null,
    timeline: [
      {
        id: 'tl-lead-102-1',
        timestamp: '2026-09-18T16:30:00Z',
        actor: 'Customer (WhatsApp)',
        event: 'Enquiry Received',
        notes: 'Consultation initiated via WhatsApp Business channel.',
      },
      {
        id: 'tl-lead-102-2',
        timestamp: '2026-09-18T16:45:00Z',
        actor: 'Pooja Varma (Advisor)',
        event: 'Customer Contacted',
        notes: 'Detailed 40k service scope shared. Customer requested Saturday 11 AM slot.',
      },
    ],
  },
  {
    id: 'lead-103',
    created_at: '2026-09-18T11:15:00Z',
    source: 'Direct Call',
    customer_name: 'Priyanka Sen',
    customer_phone: '+91 98450 67890',
    customer_email: 'priyanka.sen@example.com',
    vehicle_summary: '2021 Volvo XC60',
    vehicle_make: 'Volvo',
    vehicle_model: 'XC60',
    vehicle_year: 2021,
    registration: 'MH 02 CZ 5510',
    service_requested: 'AC & Cooling Systems',
    message: 'Air conditioning blowing warm air on the driver side after 20 minutes of driving.',
    priority: 'HIGH',
    assigned_advisor: 'Rohan Deshmukh',
    next_action: 'Appointment confirmed for Monday 10 AM (apt-204)',
    status: 'APPOINTMENT_CONFIRMED',
    next_follow_up_at: null,
    appointment_id: 'apt-204',
    job_card_id: 'JC-2050',
    timeline: [
      {
        id: 'tl-lead-103-1',
        timestamp: '2026-09-18T11:15:00Z',
        actor: 'Rohan Deshmukh (Advisor)',
        event: 'Direct Call Logged',
        notes: 'Customer called regarding intermittent AC cabin cooling.',
      },
      {
        id: 'tl-lead-103-2',
        timestamp: '2026-09-18T11:30:00Z',
        actor: 'Rohan Deshmukh (Advisor)',
        event: 'Appointment Confirmed',
        notes: 'Workshop appointment slot booked as apt-204.',
      },
    ],
  },
];

// Seed Appointments
const SEED_APPOINTMENTS: AppointmentRecord[] = [
  {
    id: 'apt-201',
    customer_name: 'Rahul Mehta',
    customer_phone: '+91 98765 43210',
    customer_email: 'rahul.mehta@example.com',
    vehicle_summary: '2022 BMW 5 Series (G30)',
    vehicle_make: 'BMW',
    vehicle_model: '5 Series (G30)',
    vehicle_year: 2022,
    registration_number: 'MH 02 ER 4500',
    service_name: 'Computer Diagnostics + Periodic Service',
    requested_date: '2026-09-19',
    requested_time: '08:30',
    status: 'CONVERTED',
    advisor: 'Rohan Deshmukh',
    source: 'Website',
    arrival_time: '2026-09-19T08:15:00Z',
    check_in_time: '2026-09-19T08:25:00Z',
    check_in_odometer: 34250,
    check_in_fuel: '60%',
    check_in_notes: 'Valuables removed. Slight scuff mark on rear bumper corner noted during intake walkaround.',
    job_card_id: 'JC-2047',
    notes: 'Converted to Job Card JC-2047 upon vehicle arrival and intake check-in.',
    created_at: '2026-09-18T10:00:00Z',
    timeline: [
      {
        id: 'tl-apt-201-1',
        timestamp: '2026-09-18T10:00:00Z',
        actor: 'Rohan Deshmukh (Advisor)',
        event: 'Appointment Confirmed',
        notes: 'Scheduled for 19 Sep at 08:30 AM.',
      },
      {
        id: 'tl-apt-201-2',
        timestamp: '2026-09-19T08:15:00Z',
        actor: 'Security / Reception',
        event: 'Customer Arrived',
        notes: 'Vehicle staged in Reception Bay.',
      },
      {
        id: 'tl-apt-201-3',
        timestamp: '2026-09-19T08:25:00Z',
        actor: 'Rohan Deshmukh (Advisor)',
        event: 'Vehicle Intake Completed',
        notes: 'Odometer 34,250 km, fuel 60%, walkaround logged.',
      },
      {
        id: 'tl-apt-201-4',
        timestamp: '2026-09-19T08:30:00Z',
        actor: 'Rohan Deshmukh (Advisor)',
        event: 'Job Card Issued',
        notes: 'Transferred to operational Job Card JC-2047.',
      },
    ],
  },
  {
    id: 'apt-202',
    customer_name: 'Ananya Deshmukh',
    customer_phone: '+91 98111 22233',
    customer_email: 'ananya.d@example.com',
    vehicle_summary: '2021 Mercedes-Benz C-Class (W205)',
    vehicle_make: 'Mercedes-Benz',
    vehicle_model: 'C-Class (W205)',
    vehicle_year: 2021,
    registration_number: 'MH 01 DK 8812',
    service_name: 'Brake Pad Renewal + Front Sensors',
    requested_date: '2026-09-19',
    requested_time: '09:00',
    status: 'ARRIVED',
    advisor: 'Pooja Varma',
    source: 'WhatsApp',
    arrival_time: '2026-09-19T08:50:00Z',
    notes: 'Customer arrived on site. Ready for vehicle intake and odometer verification.',
    created_at: '2026-09-18T11:30:00Z',
    timeline: [
      {
        id: 'tl-apt-202-1',
        timestamp: '2026-09-18T11:30:00Z',
        actor: 'Pooja Varma (Advisor)',
        event: 'Appointment Confirmed',
        notes: 'Booked via WhatsApp consultation.',
      },
      {
        id: 'tl-apt-202-2',
        timestamp: '2026-09-19T08:50:00Z',
        actor: 'Pooja Varma (Advisor)',
        event: 'Customer Arrived',
        notes: 'Customer on site. Staged for physical intake inspection.',
      },
    ],
  },
  {
    id: 'apt-203',
    customer_name: 'Karan Singhania',
    customer_phone: '+91 98700 99887',
    vehicle_summary: '2022 Porsche Cayenne',
    vehicle_make: 'Porsche',
    vehicle_model: 'Cayenne',
    vehicle_year: 2022,
    registration_number: 'MH 04 BK 9000',
    service_name: 'Periodic Service',
    requested_date: '2026-09-20',
    requested_time: '14:30',
    status: 'CONFIRMED',
    advisor: 'Rohan Deshmukh',
    source: 'Direct Call',
    notes: 'Customer confirmed arrival for afternoon intake slot. 40,000 km minor service.',
    created_at: '2026-09-18T15:00:00Z',
    timeline: [
      {
        id: 'tl-apt-203-1',
        timestamp: '2026-09-18T15:00:00Z',
        actor: 'Rohan Deshmukh (Advisor)',
        event: 'Appointment Booked',
        notes: 'Afternoon slot allocated.',
      },
    ],
  },
  {
    id: 'apt-204',
    customer_name: 'Priyanka Sen',
    customer_phone: '+91 98450 67890',
    customer_email: 'priyanka.sen@example.com',
    vehicle_summary: '2021 Volvo XC60',
    vehicle_make: 'Volvo',
    vehicle_model: 'XC60',
    vehicle_year: 2021,
    registration_number: 'MH 02 CZ 5510',
    service_name: 'AC & Cooling Systems',
    requested_date: '2026-09-20',
    requested_time: '10:00',
    status: 'REQUESTED',
    advisor: 'Pooja Varma',
    source: 'Website',
    lead_id: 'lead-103',
    notes: 'Awaiting bay slot assignment confirmation with customer. Air conditioning intermittent cooling.',
    created_at: '2026-09-19T07:45:00Z',
    timeline: [
      {
        id: 'tl-apt-204-1',
        timestamp: '2026-09-19T07:45:00Z',
        actor: 'System (Online Booking)',
        event: 'Slot Requested',
        notes: 'Requested 10:00 AM slot via web interface from Lead lead-103.',
      },
    ],
  },
];

// Standard 12 DVI Categories & Components
export interface DVICategoryConfig {
  id: string;
  name: string;
  components: string[];
}

export const DVI_CATEGORIES: DVICategoryConfig[] = [
  {
    id: 'ENGINE_MECHANICAL',
    name: '1. ENGINE & MECHANICAL',
    components: [
      'Engine Oil Level & Condition',
      'Auxiliary Drive Belts & Tensioner',
      'Engine Mountings & Bushings',
      'Valve Cover & Oil Gaskets',
    ],
  },
  {
    id: 'FLUIDS_COOLING',
    name: '2. FLUIDS & COOLING',
    components: [
      'Coolant Level & Radiator Core',
      'Brake Fluid Moisture & Level',
      'Power Steering Fluid',
      'Windshield Washer Fluid',
    ],
  },
  {
    id: 'BRAKES',
    name: '3. BRAKES',
    components: [
      'Front Brake Pads & Rotors',
      'Rear Brake Pads & Rotors',
      'Brake Hydraulic Lines & Calipers',
      'Electronic Parking Brake Operation',
    ],
  },
  {
    id: 'TYRES_WHEELS',
    name: '4. TYRES & WHEELS',
    components: [
      'Front Tyres Tread & Pressure',
      'Rear Tyres Tread & Pressure',
      'Wheel Rims & Fasteners',
      'Spare Wheel & Inflator Kit',
    ],
  },
  {
    id: 'SUSPENSION_STEERING',
    name: '5. SUSPENSION & STEERING',
    components: [
      'Front Control Arms & Bushings',
      'Shock Absorbers & Strut Mounts',
      'Tie Rod Ends & Steering Rack',
      'Stabilizer Bar Links & Bushings',
    ],
  },
  {
    id: 'ELECTRICAL',
    name: '6. ELECTRICAL',
    components: [
      '12V Battery Health & Terminals',
      'Alternator Charging Voltage',
      'Starter Motor Operation',
      'Horn & Fuse Box Inspection',
    ],
  },
  {
    id: 'LIGHTING',
    name: '7. LIGHTING',
    components: [
      'Headlights & High Beams',
      'Tail Lights & Brake Lights',
      'Turn Signals & Hazard Indicators',
      'Cabin & Instrument Illumination',
    ],
  },
  {
    id: 'AIR_CONDITIONING',
    name: '8. AIR CONDITIONING',
    components: [
      'AC Compressor & Belt Drive',
      'Cabin Microfilter Pollen State',
      'Blower Motor & Vent Actuators',
      'Condenser Core & Refrigerant Flow',
    ],
  },
  {
    id: 'EXTERIOR',
    name: '9. EXTERIOR',
    components: [
      'Windshield & Glass Panels',
      'Body Panels & Paint Condition',
      'Door Hinges & Weather Strips',
      'Underbody Splash Shields',
    ],
  },
  {
    id: 'INTERIOR',
    name: '10. INTERIOR',
    components: [
      'Seatbelts & Latch Mechanisms',
      'Power Windows & Switches',
      'Infotainment & Cluster Displays',
      'Pedal Covers & Floor Carpets',
    ],
  },
  {
    id: 'SAFETY',
    name: '11. SAFETY',
    components: [
      'SRS Airbag Warning Lamp Check',
      'First Aid Kit & Emergency Triangle',
      'Child Lock & ISOFIX Mounts',
      'Fire Extinguisher & Emergency Tool',
    ],
  },
  {
    id: 'ROAD_TEST',
    name: '12. ROAD TEST',
    components: [
      'Steering Wheel Centering & Alignment',
      'Transmission Shifting & Driveability',
      'Braking Stability & High Speed Pull',
      'NVH (Noise, Vibration, Harshness)',
    ],
  },
];

// Helper to generate a default set of standard DVI items for an inspection
export function generateDefaultDVIItems(
  inspectionId: string,
  initialCondition: InspectionCondition = 'NOT_INSPECTED'
): InspectionItem[] {
  const items: InspectionItem[] = [];
  DVI_CATEGORIES.forEach((cat) => {
    cat.components.forEach((comp, idx) => {
      items.push({
        id: `${inspectionId}-item-${cat.id.toLowerCase()}-${idx + 1}`,
        inspection_id: inspectionId,
        category: cat.name,
        component: comp,
        condition: initialCondition,
      });
    });
  });
  return items;
}

// Seed Inspections
const SEED_INSPECTIONS: Record<string, InspectionRecord> = {
  'JC-2047': {
    id: 'INS-3047',
    job_id: 'JC-2047',
    job_card_id: 'JC-2047',
    appointment_id: 'apt-201',
    lead_id: 'lead-101',
    customer_id: 'cust-1',
    customer_name: 'Rahul Mehta',
    customer_phone: '+91 98765 43210',
    customer_email: 'rahul.mehta@example.com',
    vehicle_id: 'veh-1',
    vehicle_make: 'BMW',
    vehicle_model: '5 Series (G30)',
    vehicle_year: 2022,
    vehicle_summary: '2022 BMW 5 Series (G30)',
    registration: 'MH 02 ER 4500',
    technician_id: 'tech-1',
    technician_name: 'Arjun Sharma',
    advisor_id: 'adv-1',
    advisor_name: 'Rohan Deshmukh',
    inspection_type: 'Periodic Service + Computer Diagnostics',
    status: 'IN_PROGRESS',
    started_at: '2026-09-19T08:45:00Z',
    odometer: 34250,
    fuel_level: '60%',
    exterior_status: 'GOOD',
    interior_status: 'GOOD',
    engine_bay_status: 'ATTENTION',
    tyres_status: 'GOOD',
    brakes_status: 'ATTENTION',
    lights_status: 'GOOD',
    battery_status: 'ATTENTION',
    fluids_status: 'ATTENTION',
    visible_damage: 'Minor surface scuff on lower rear bumper RHS. Documented during check-in.',
    inspector_name: 'Arjun Sharma',
    notes: 'Electronic scan stored boost pressure harness fault. Front brake pad lining approaching recommended renewal limit.',
    summary: 'Vehicle structurally solid. 3 items require attention before scheduled monsoon highway driving.',
    created_at: '2026-09-19T08:30:00Z',
    updated_at: '2026-09-19T09:20:00Z',
    timeline: [
      {
        id: 'tl-ins-1',
        timestamp: '2026-09-19T08:30:00Z',
        actor: 'Rohan Deshmukh (Advisor)',
        event: 'Inspection Created',
        notes: 'Inspection docket opened from Job Card JC-2047.',
      },
      {
        id: 'tl-ins-2',
        timestamp: '2026-09-19T08:45:00Z',
        actor: 'Arjun Sharma (Technician)',
        event: 'Inspection Started',
        notes: 'Multi-point vehicle physical assessment initiated in BAY 01.',
      },
      {
        id: 'tl-ins-3',
        timestamp: '2026-09-19T09:05:00Z',
        actor: 'Arjun Sharma (Technician)',
        event: 'Finding Added',
        notes: 'Recorded ATTENTION condition on Front Brake Pads & Rotors.',
      },
      {
        id: 'tl-ins-4',
        timestamp: '2026-09-19T09:12:00Z',
        actor: 'Arjun Sharma (Technician)',
        event: 'Evidence Added',
        notes: 'Attached photo of inner pad friction material.',
      },
    ],
    evidence: [
      {
        id: 'ev-3047-1',
        inspection_id: 'INS-3047',
        finding_id: 'find-1',
        file_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
        caption: 'Front brake inner pad friction material measured at approx 3.2mm.',
        created_at: '2026-09-19T09:12:00Z',
        uploaded_by: 'Arjun Sharma (Technician)',
      },
      {
        id: 'ev-3047-2',
        inspection_id: 'INS-3047',
        finding_id: 'find-2',
        file_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
        caption: 'Cabin microfilter charcoal element partially saturated with dust particles.',
        created_at: '2026-09-19T09:15:00Z',
        uploaded_by: 'Arjun Sharma (Technician)',
      },
    ],
    findings: [
      {
        id: 'find-1',
        category: '3. BRAKES',
        component: 'Front Brake Pads & Rotors',
        condition: 'ATTENTION',
        finding: 'Pad thickness appears reduced to approx 3.2mm and replacement is recommended.',
        recommendation: 'Replace front brake pads with OEM BMW sensor set.',
        priority: 'HIGH',
        add_to_estimate: true,
        photo_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'find-2',
        category: '8. AIR CONDITIONING',
        component: 'Cabin Microfilter Pollen State',
        condition: 'ATTENTION',
        finding: 'Cabin microfilter charcoal element partially saturated with road debris.',
        recommendation: 'Replace activated carbon cabin filter pair.',
        priority: 'MEDIUM',
        add_to_estimate: true,
        photo_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'find-3',
        category: '6. ELECTRICAL',
        component: '12V Battery Health & Terminals',
        condition: 'ATTENTION',
        finding: 'State of Health test indicates 68% reserve capacity; negative terminal showing slight sulfate film.',
        recommendation: 'Clean terminal connections and schedule battery replacement before winter.',
        priority: 'LOW',
        add_to_estimate: false,
      },
    ],
    items: [
      {
        id: 'item-3047-1',
        inspection_id: 'INS-3047',
        category: '1. ENGINE & MECHANICAL',
        component: 'Engine Oil Level & Condition',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-2',
        inspection_id: 'INS-3047',
        category: '1. ENGINE & MECHANICAL',
        component: 'Auxiliary Drive Belts & Tensioner',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-3',
        inspection_id: 'INS-3047',
        category: '1. ENGINE & MECHANICAL',
        component: 'Engine Mountings & Bushings',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-4',
        inspection_id: 'INS-3047',
        category: '1. ENGINE & MECHANICAL',
        component: 'Valve Cover & Oil Gaskets',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-5',
        inspection_id: 'INS-3047',
        category: '2. FLUIDS & COOLING',
        component: 'Coolant Level & Radiator Core',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-6',
        inspection_id: 'INS-3047',
        category: '2. FLUIDS & COOLING',
        component: 'Brake Fluid Moisture & Level',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-7',
        inspection_id: 'INS-3047',
        category: '2. FLUIDS & COOLING',
        component: 'Power Steering Fluid',
        condition: 'NOT_APPLICABLE',
      },
      {
        id: 'item-3047-8',
        inspection_id: 'INS-3047',
        category: '2. FLUIDS & COOLING',
        component: 'Windshield Washer Fluid',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-9',
        inspection_id: 'INS-3047',
        category: '3. BRAKES',
        component: 'Front Brake Pads & Rotors',
        condition: 'ATTENTION',
        finding: 'Pad thickness appears reduced to approx 3.2mm and replacement is recommended.',
        recommendation: 'Replace front brake pads with OEM BMW sensor set.',
        priority: 'HIGH',
        add_to_estimate: true,
      },
      {
        id: 'item-3047-10',
        inspection_id: 'INS-3047',
        category: '3. BRAKES',
        component: 'Rear Brake Pads & Rotors',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-11',
        inspection_id: 'INS-3047',
        category: '3. BRAKES',
        component: 'Brake Hydraulic Lines & Calipers',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-12',
        inspection_id: 'INS-3047',
        category: '3. BRAKES',
        component: 'Electronic Parking Brake Operation',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-13',
        inspection_id: 'INS-3047',
        category: '4. TYRES & WHEELS',
        component: 'Front Tyres Tread & Pressure',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-14',
        inspection_id: 'INS-3047',
        category: '4. TYRES & WHEELS',
        component: 'Rear Tyres Tread & Pressure',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-15',
        inspection_id: 'INS-3047',
        category: '4. TYRES & WHEELS',
        component: 'Wheel Rims & Fasteners',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-16',
        inspection_id: 'INS-3047',
        category: '4. TYRES & WHEELS',
        component: 'Spare Wheel & Inflator Kit',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-17',
        inspection_id: 'INS-3047',
        category: '5. SUSPENSION & STEERING',
        component: 'Front Control Arms & Bushings',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-18',
        inspection_id: 'INS-3047',
        category: '5. SUSPENSION & STEERING',
        component: 'Shock Absorbers & Strut Mounts',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-19',
        inspection_id: 'INS-3047',
        category: '5. SUSPENSION & STEERING',
        component: 'Tie Rod Ends & Steering Rack',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-20',
        inspection_id: 'INS-3047',
        category: '5. SUSPENSION & STEERING',
        component: 'Stabilizer Bar Links & Bushings',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-21',
        inspection_id: 'INS-3047',
        category: '6. ELECTRICAL',
        component: '12V Battery Health & Terminals',
        condition: 'ATTENTION',
        finding: 'State of Health test indicates 68% reserve capacity; negative terminal showing slight sulfate film.',
        recommendation: 'Clean terminal connections and schedule battery replacement before winter.',
        priority: 'LOW',
        add_to_estimate: false,
      },
      {
        id: 'item-3047-22',
        inspection_id: 'INS-3047',
        category: '6. ELECTRICAL',
        component: 'Alternator Charging Voltage',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-23',
        inspection_id: 'INS-3047',
        category: '6. ELECTRICAL',
        component: 'Starter Motor Operation',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-24',
        inspection_id: 'INS-3047',
        category: '6. ELECTRICAL',
        component: 'Horn & Fuse Box Inspection',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-25',
        inspection_id: 'INS-3047',
        category: '7. LIGHTING',
        component: 'Headlights & High Beams',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-26',
        inspection_id: 'INS-3047',
        category: '7. LIGHTING',
        component: 'Tail Lights & Brake Lights',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-27',
        inspection_id: 'INS-3047',
        category: '7. LIGHTING',
        component: 'Turn Signals & Hazard Indicators',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-28',
        inspection_id: 'INS-3047',
        category: '7. LIGHTING',
        component: 'Cabin & Instrument Illumination',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-29',
        inspection_id: 'INS-3047',
        category: '8. AIR CONDITIONING',
        component: 'AC Compressor & Belt Drive',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-30',
        inspection_id: 'INS-3047',
        category: '8. AIR CONDITIONING',
        component: 'Cabin Microfilter Pollen State',
        condition: 'ATTENTION',
        finding: 'Cabin microfilter charcoal element partially saturated with road debris.',
        recommendation: 'Replace activated carbon cabin filter pair.',
        priority: 'MEDIUM',
        add_to_estimate: true,
      },
      {
        id: 'item-3047-31',
        inspection_id: 'INS-3047',
        category: '8. AIR CONDITIONING',
        component: 'Blower Motor & Vent Actuators',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-32',
        inspection_id: 'INS-3047',
        category: '8. AIR CONDITIONING',
        component: 'Condenser Core & Refrigerant Flow',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-33',
        inspection_id: 'INS-3047',
        category: '9. EXTERIOR',
        component: 'Windshield & Glass Panels',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-34',
        inspection_id: 'INS-3047',
        category: '9. EXTERIOR',
        component: 'Body Panels & Paint Condition',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-35',
        inspection_id: 'INS-3047',
        category: '9. EXTERIOR',
        component: 'Door Hinges & Weather Strips',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-36',
        inspection_id: 'INS-3047',
        category: '9. EXTERIOR',
        component: 'Underbody Splash Shields',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-37',
        inspection_id: 'INS-3047',
        category: '10. INTERIOR',
        component: 'Seatbelts & Latch Mechanisms',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-38',
        inspection_id: 'INS-3047',
        category: '10. INTERIOR',
        component: 'Power Windows & Switches',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-39',
        inspection_id: 'INS-3047',
        category: '10. INTERIOR',
        component: 'Infotainment & Cluster Displays',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-40',
        inspection_id: 'INS-3047',
        category: '10. INTERIOR',
        component: 'Pedal Covers & Floor Carpets',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-41',
        inspection_id: 'INS-3047',
        category: '11. SAFETY',
        component: 'SRS Airbag Warning Lamp Check',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-42',
        inspection_id: 'INS-3047',
        category: '11. SAFETY',
        component: 'First Aid Kit & Emergency Triangle',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-43',
        inspection_id: 'INS-3047',
        category: '11. SAFETY',
        component: 'Child Lock & ISOFIX Mounts',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-44',
        inspection_id: 'INS-3047',
        category: '11. SAFETY',
        component: 'Fire Extinguisher & Emergency Tool',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-45',
        inspection_id: 'INS-3047',
        category: '12. ROAD TEST',
        component: 'Steering Wheel Centering & Alignment',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-46',
        inspection_id: 'INS-3047',
        category: '12. ROAD TEST',
        component: 'Transmission Shifting & Driveability',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-47',
        inspection_id: 'INS-3047',
        category: '12. ROAD TEST',
        component: 'Braking Stability & High Speed Pull',
        condition: 'GOOD',
      },
      {
        id: 'item-3047-48',
        inspection_id: 'INS-3047',
        category: '12. ROAD TEST',
        component: 'NVH (Noise, Vibration, Harshness)',
        condition: 'GOOD',
      },
    ],
  },
  'JC-2048': {
    id: 'INS-3048',
    job_id: 'JC-2048',
    job_card_id: 'JC-2048',
    appointment_id: 'apt-202',
    lead_id: 'lead-102',
    customer_id: 'cust-2',
    customer_name: 'Ananya Deshmukh',
    customer_phone: '+91 98111 22233',
    customer_email: 'ananya.d@example.com',
    vehicle_id: 'veh-2',
    vehicle_make: 'Mercedes-Benz',
    vehicle_model: 'C-Class (W205)',
    vehicle_year: 2021,
    vehicle_summary: '2021 Mercedes-Benz C-Class (W205)',
    registration: 'MH 01 DK 8812',
    technician_id: 'tech-2',
    technician_name: 'Rahul Sen',
    advisor_id: 'adv-2',
    advisor_name: 'Pooja Varma',
    inspection_type: 'Brake Overhaul & Electronics',
    status: 'CUSTOMER_SHARED',
    started_at: '2026-09-19T09:00:00Z',
    completed_at: '2026-09-19T09:40:00Z',
    shared_at: '2026-09-19T09:50:00Z',
    odometer: 42100,
    fuel_level: '45%',
    exterior_status: 'GOOD',
    interior_status: 'GOOD',
    engine_bay_status: 'GOOD',
    tyres_status: 'GOOD',
    brakes_status: 'CRITICAL',
    lights_status: 'GOOD',
    battery_status: 'GOOD',
    fluids_status: 'GOOD',
    inspector_name: 'Rahul Sen',
    notes: 'Front brake friction material worn to 2.5mm minimum wear spec. Sensor contacted rotor.',
    summary: 'Critical brake pad wear identified during inspection. Ultrasonic sensor clip reattached.',
    created_at: '2026-09-19T08:50:00Z',
    updated_at: '2026-09-19T09:50:00Z',
    timeline: [
      {
        id: 'tl-ins-2048-1',
        timestamp: '2026-09-19T08:50:00Z',
        actor: 'Pooja Varma (Advisor)',
        event: 'Inspection Created',
      },
      {
        id: 'tl-ins-2048-2',
        timestamp: '2026-09-19T09:00:00Z',
        actor: 'Rahul Sen (Technician)',
        event: 'Inspection Started',
      },
      {
        id: 'tl-ins-2048-3',
        timestamp: '2026-09-19T09:20:00Z',
        actor: 'Rahul Sen (Technician)',
        event: 'Finding Added',
        notes: 'Critical brake pad wear recorded.',
      },
      {
        id: 'tl-ins-2048-4',
        timestamp: '2026-09-19T09:40:00Z',
        actor: 'Rahul Sen (Technician)',
        event: 'Inspection Completed',
        notes: 'All 48 check items completed.',
      },
      {
        id: 'tl-ins-2048-5',
        timestamp: '2026-09-19T09:50:00Z',
        actor: 'Pooja Varma (Advisor)',
        event: 'Inspection Shared With Customer',
        notes: 'DVI report link transmitted to customer via SMS/WhatsApp.',
      },
    ],
    evidence: [
      {
        id: 'ev-3048-1',
        inspection_id: 'INS-3048',
        finding_id: 'find-merc-1',
        file_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
        caption: 'Brake wear sensor contacted rotor face at 2.5mm remaining friction material.',
        created_at: '2026-09-19T09:25:00Z',
        uploaded_by: 'Rahul Sen (Technician)',
      },
    ],
    findings: [
      {
        id: 'find-merc-1',
        category: '3. BRAKES',
        component: 'Front Brake Pads & Rotors',
        condition: 'CRITICAL',
        finding: 'Front brake pads at minimum wear limit (approx 2.5mm remaining).',
        recommendation: 'Immediate replacement with Mercedes-Benz OEM brake pad set & new wear indicator.',
        priority: 'CRITICAL',
        add_to_estimate: true,
        photo_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'find-merc-2',
        category: '6. ELECTRICAL',
        component: 'Horn & Fuse Box Inspection',
        condition: 'ATTENTION',
        finding: 'Front parking sensor harness clip displaced causing intermittent vibration warning.',
        recommendation: 'Resecure ultrasonic sensor harness and clear stored sensor fault.',
        priority: 'MEDIUM',
        add_to_estimate: false,
      },
    ],
    items: generateDefaultDVIItems('INS-3048', 'GOOD'),
  },
  'JC-2049': {
    id: 'INS-3049',
    job_id: 'JC-2049',
    job_card_id: 'JC-2049',
    customer_id: 'cust-3',
    customer_name: 'Vikramaditya Rao',
    customer_phone: '+91 98222 33344',
    customer_email: 'v.rao@example.com',
    vehicle_id: 'veh-3',
    vehicle_make: 'Porsche',
    vehicle_model: 'Macan GTS',
    vehicle_year: 2023,
    vehicle_summary: '2023 Porsche Macan GTS',
    registration: 'MH 04 BK 9000',
    appointment_id: 'apt-203',
    lead_id: 'lead-103',
    technician_id: 'tech-1',
    technician_name: 'Arjun Sharma',
    advisor_id: 'adv-1',
    advisor_name: 'Rohan Deshmukh',
    inspection_type: 'High Performance Track Inspection',
    status: 'COMPLETED',
    started_at: '2026-09-20T09:00:00Z',
    completed_at: '2026-09-20T09:45:00Z',
    odometer: 21500,
    fuel_level: '55%',
    exterior_status: 'GOOD',
    interior_status: 'GOOD',
    engine_bay_status: 'GOOD',
    tyres_status: 'ATTENTION',
    brakes_status: 'CRITICAL',
    lights_status: 'GOOD',
    battery_status: 'GOOD',
    fluids_status: 'ATTENTION',
    inspector_name: 'Arjun Sharma',
    notes: 'Front brake rotor lip exceeds 2.2mm discard spec. High speed track pulsation observed.',
    summary: 'Rotor lip beyond tolerance. High temperature fluid replacement advised.',
    created_at: '2026-09-20T10:45:00Z',
    updated_at: '2026-09-20T11:45:00Z',
    timeline: [
      {
        id: 'tl-ins-3049-1',
        timestamp: '2026-09-20T10:45:00Z',
        actor: 'Rohan Deshmukh (Advisor)',
        event: 'Inspection Created',
      },
      {
        id: 'tl-ins-3049-2',
        timestamp: '2026-09-20T11:45:00Z',
        actor: 'Arjun Sharma (Technician)',
        event: 'Inspection Completed',
      },
    ],
    findings: [
      {
        id: 'find-p-1',
        category: '3. BRAKES',
        component: 'Front Brake Pads & Rotors',
        condition: 'CRITICAL',
        finding: 'Front 360mm drilled brake rotors heavily grooved with heat spotting.',
        recommendation: 'Replace front brake discs and flush system with Motul RBF 660 fluid.',
        priority: 'CRITICAL',
        add_to_estimate: true,
      },
    ],
    items: generateDefaultDVIItems('INS-3049', 'GOOD'),
  },
  'JC-2050': {
    id: 'INS-3050',
    job_id: 'JC-2050',
    job_card_id: 'JC-2050',
    customer_id: 'cust-4',
    customer_name: 'Priyanka Sen',
    customer_phone: '+91 98450 67890',
    customer_email: 'priyanka.sen@example.com',
    vehicle_id: 'veh-4',
    vehicle_make: 'Volvo',
    vehicle_model: 'XC60',
    vehicle_year: 2021,
    vehicle_summary: '2021 Volvo XC60',
    registration: 'MH 02 CZ 5510',
    lead_id: 'lead-102',
    technician_id: 'tech-4',
    technician_name: 'Farhan Akhtar',
    advisor_id: 'adv-2',
    advisor_name: 'Pooja Varma',
    inspection_type: 'HVAC & Climate System Diagnosis',
    status: 'COMPLETED',
    started_at: '2026-09-20T09:20:00Z',
    completed_at: '2026-09-20T09:50:00Z',
    odometer: 38900,
    fuel_level: '50%',
    exterior_status: 'GOOD',
    interior_status: 'GOOD',
    engine_bay_status: 'GOOD',
    tyres_status: 'GOOD',
    brakes_status: 'GOOD',
    lights_status: 'GOOD',
    battery_status: 'GOOD',
    fluids_status: 'GOOD',
    inspector_name: 'Farhan Akhtar',
    notes: 'Climate control driver-side blend door motor seized. Refrigerant static pressure normal.',
    summary: 'Right blend door servo motor seized. Replacement recommended.',
    created_at: '2026-09-19T10:00:00Z',
    updated_at: '2026-09-19T11:00:00Z',
    findings: [
      {
        id: 'find-v-1',
        category: '8. AIR CONDITIONING',
        component: 'Blower Motor & Vent Actuators',
        condition: 'ATTENTION',
        finding: 'Right side HVAC blend door potentiometer reporting open circuit fault.',
        recommendation: 'Replace right blend door servo motor and run climate recalibration.',
        priority: 'HIGH',
        add_to_estimate: true,
      },
    ],
    items: generateDefaultDVIItems('INS-3050', 'GOOD'),
  },
  'JC-2051': {
    id: 'INS-3051',
    job_id: 'JC-2051',
    job_card_id: 'JC-2051',
    customer_id: 'cust-5',
    customer_name: 'Rajesh Singhal',
    customer_phone: '+91 98330 77112',
    customer_email: 'rajesh.singhal@example.com',
    vehicle_id: 'veh-5',
    vehicle_make: 'Audi',
    vehicle_model: 'A6 Matrix',
    vehicle_year: 2022,
    vehicle_summary: '2022 Audi A6 Matrix',
    registration: 'MH 02 BG 3311',
    lead_id: 'lead-101',
    technician_id: undefined,
    technician_name: 'Unassigned',
    advisor_id: 'adv-1',
    advisor_name: 'Rohan Deshmukh',
    inspection_type: 'Periodic Service',
    status: 'DRAFT',
    odometer: 45200,
    fuel_level: '65%',
    exterior_status: 'GOOD',
    interior_status: 'GOOD',
    engine_bay_status: 'GOOD',
    tyres_status: 'ATTENTION',
    brakes_status: 'GOOD',
    lights_status: 'GOOD',
    battery_status: 'GOOD',
    fluids_status: 'GOOD',
    inspector_name: 'Unassigned',
    notes: 'Steering wheel vibration above 90 km/h due to lost front wheel balance weights.',
    summary: 'Draft inspection initiated. Dynamic wheel balancing required.',
    created_at: '2026-09-20T09:30:00Z',
    findings: [
      {
        id: 'find-a-1',
        category: '4. TYRES & WHEELS',
        component: 'Wheel Rims & Fasteners',
        condition: 'ATTENTION',
        finding: 'Front left wheel 40g dynamic imbalance measured on Hunter Road Force balancer.',
        recommendation: 'Dynamic balancing and radial force matching across all 4 wheels.',
        priority: 'MEDIUM',
        add_to_estimate: true,
      },
    ],
    items: generateDefaultDVIItems('INS-3051', 'NOT_INSPECTED'),
  },
  'JC-2052': {
    id: 'INS-3052',
    job_id: 'JC-2052',
    job_card_id: 'JC-2052',
    customer_id: 'cust-6',
    customer_name: 'Meera Nambiar',
    customer_phone: '+91 98199 44332',
    customer_email: 'meera.nambiar@example.com',
    vehicle_id: 'veh-6',
    vehicle_make: 'BMW',
    vehicle_model: '3 Series (G20)',
    vehicle_year: 2020,
    vehicle_summary: '2020 BMW 3 Series (G20)',
    registration: 'MH 02 EE 7721',
    technician_id: 'tech-4',
    technician_name: 'Vikram Singh',
    advisor_id: 'adv-1',
    advisor_name: 'Rohan Deshmukh',
    inspection_type: 'Chassis & Suspension Assessment',
    status: 'ARCHIVED',
    started_at: '2026-09-18T10:45:00Z',
    completed_at: '2026-09-18T11:30:00Z',
    archived_at: '2026-09-19T14:35:00Z',
    odometer: 51200,
    fuel_level: '40%',
    exterior_status: 'GOOD',
    interior_status: 'GOOD',
    engine_bay_status: 'GOOD',
    tyres_status: 'GOOD',
    brakes_status: 'GOOD',
    lights_status: 'GOOD',
    battery_status: 'GOOD',
    fluids_status: 'GOOD',
    inspector_name: 'Vikram Singh',
    notes: 'Front lower wishbone hydraulic bushings cracked with slight oil weeping.',
    summary: 'Archived inspection for historical suspension overhaul.',
    created_at: '2026-09-18T10:30:00Z',
    updated_at: '2026-09-18T11:30:00Z',
    findings: [
      {
        id: 'find-b-1',
        category: '5. SUSPENSION & STEERING',
        component: 'Front Control Arms & Bushings',
        condition: 'CRITICAL',
        finding: 'Hydro-bushing seal torn on front tension strut arms.',
        recommendation: 'Replace pair of front control arms and perform laser wheel alignment.',
        priority: 'CRITICAL',
        add_to_estimate: true,
      },
    ],
    items: generateDefaultDVIItems('INS-3052', 'GOOD'),
  },
};


// Seed Estimates
const SEED_ESTIMATES: Record<string, EstimateRecord> = {
  'JC-2047': {
    id: 'est-2047',
    estimate_number: 'EST-2026-2047',
    job_id: 'JC-2047',
    job_card_id: 'JC-2047',
    appointment_id: 'apt-201',
    lead_id: 'lead-101',
    inspection_id: 'INS-3047',
    customer_id: 'cust-1',
    customer_name: 'Rahul Mehta',
    customer_phone: '+91 98765 43210',
    customer_email: 'rahul.mehta@example.com',
    vehicle_id: 'veh-1',
    vehicle_make: 'BMW',
    vehicle_model: '5 Series (G30)',
    vehicle_year: 2022,
    vehicle_summary: '2022 BMW 5 Series (G30)',
    registration: 'MH 02 ER 4500',
    odometer: 34250,
    fuel_level: '60%',
    advisor_id: 'adv-1',
    advisor_name: 'Rohan Deshmukh',
    technician_id: 'tech-1',
    technician_name: 'Arjun Sharma',
    created_date: '2026-09-19',
    validity_date: '2026-10-03',
    labour_total: 4500,
    parts_total: 10000,
    subtotal: 14500,
    discount_total: 0,
    total: 14500,
    approved_total: 14500,
    declined_total: 0,
    revision_number: 1,
    revisions: [
      {
        revision_number: 1,
        timestamp: '2026-09-19T11:00:00Z',
        total: 14500,
        reason: 'Initial commercial scope compiled from INS-3047 recommendations.',
        created_by: 'Rohan Deshmukh (Advisor)',
        approved_total: 14500,
      },
    ],
    notes: 'Includes dedicated BMW ISTA diagnostic routine, OEM filter elements, and factory-spec synthetic oil.',
    internal_notes: 'Customer requested quick turnaround by 5 PM. Courtesy wash included as loyal customer.',
    customer_notes: 'All parts are genuine BMW OEM parts backed by a 12-month workshop guarantee.',
    status: 'APPROVED',
    public_token: 'demo-quote-bmw',
    items: [
      {
        id: 'item-1',
        estimate_id: 'est-2047',
        source_finding_id: 'find-3047-1',
        source_inspection_id: 'INS-3047',
        source_category: '3. BRAKES',
        source_component: 'Front Brake Pads & Rotors',
        source_recommendation: 'Replace front brake pads with OEM BMW sensor set.',
        source_priority: 'HIGH',
        description: 'Comprehensive Computer Diagnostics & Sensor Sweep',
        type: 'Labour',
        category: 'Diagnostic Labour',
        quantity: 1,
        unit: 'job',
        unit_price: 2500,
        discount: 0,
        line_total: 2500,
        is_price_configured: true,
        customer_visible: true,
        approval_status: 'APPROVED',
        display_order: 1,
        created_at: '2026-09-19T11:00:00Z',
      },
      {
        id: 'item-2',
        estimate_id: 'est-2047',
        description: 'BMW LL-04 Fully Synthetic Engine Oil (6.5 Litres)',
        type: 'Parts',
        category: 'Engine Oils & Lubricants',
        quantity: 1,
        unit: 'pack',
        unit_price: 6500,
        discount: 0,
        line_total: 6500,
        is_price_configured: true,
        customer_visible: true,
        approval_status: 'APPROVED',
        display_order: 2,
        created_at: '2026-09-19T11:00:00Z',
      },
      {
        id: 'item-3',
        estimate_id: 'est-2047',
        source_finding_id: 'find-3047-2',
        source_inspection_id: 'INS-3047',
        source_category: '8. AIR CONDITIONING',
        source_component: 'Cabin Microfilter Pollen State',
        source_recommendation: 'Replace activated carbon cabin filter pair.',
        source_priority: 'MEDIUM',
        description: 'OEM Oil Filter Cartridge & Sump Washer',
        type: 'Parts',
        category: 'Filtration',
        quantity: 1,
        unit: 'unit',
        unit_price: 1800,
        discount: 0,
        line_total: 1800,
        is_price_configured: true,
        customer_visible: true,
        approval_status: 'APPROVED',
        display_order: 3,
        created_at: '2026-09-19T11:00:00Z',
      },
      {
        id: 'item-4',
        estimate_id: 'est-2047',
        description: 'Periodic Service Labour & 60-Point Mechanical Reset',
        type: 'Labour',
        category: 'Mechanical Labour',
        quantity: 1,
        unit: 'job',
        unit_price: 2000,
        discount: 0,
        line_total: 2000,
        is_price_configured: true,
        customer_visible: true,
        approval_status: 'APPROVED',
        display_order: 4,
        created_at: '2026-09-19T11:00:00Z',
      },
      {
        id: 'item-5',
        estimate_id: 'est-2047',
        description: 'Electrical Contact Cleaner & Workshop Consumables',
        type: 'Consumables',
        category: 'Workshop Shop Supplies',
        quantity: 1,
        unit: 'lump',
        unit_price: 1700,
        discount: 0,
        line_total: 1700,
        is_price_configured: true,
        customer_visible: true,
        approval_status: 'APPROVED',
        display_order: 5,
        created_at: '2026-09-19T11:00:00Z',
      },
    ],
    timeline: [
      { id: 'et-47-1', timestamp: '2026-09-19T11:00:00Z', actor: 'Rohan Deshmukh (Advisor)', event: 'Estimate Created', notes: 'Generated from inspection INS-3047' },
      { id: 'et-47-2', timestamp: '2026-09-19T11:15:00Z', actor: 'Rohan Deshmukh (Advisor)', event: 'Estimate Sent to Customer', notes: 'Transmitted via digital link' },
      { id: 'et-47-3', timestamp: '2026-09-19T11:45:00Z', actor: 'Rahul Mehta (Customer)', event: 'Customer Viewed Estimate', notes: 'Opened in customer quote portal' },
      { id: 'et-47-4', timestamp: '2026-09-19T12:00:00Z', actor: 'Rahul Mehta (Customer)', event: 'Estimate Approved by Customer', notes: 'Authorized all 5 line items' },
    ],
  },
  'JC-2048': {
    id: 'est-2048',
    estimate_number: 'EST-2026-2048',
    job_id: 'JC-2048',
    job_card_id: 'JC-2048',
    appointment_id: 'apt-202',
    lead_id: 'lead-102',
    inspection_id: 'INS-3048',
    customer_id: 'cust-2',
    customer_name: 'Ananya Deshmukh',
    customer_phone: '+91 98111 22233',
    customer_email: 'ananya.d@example.com',
    vehicle_id: 'veh-2',
    vehicle_make: 'Mercedes-Benz',
    vehicle_model: 'C-Class (W205)',
    vehicle_year: 2021,
    vehicle_summary: '2021 Mercedes-Benz C-Class (W205)',
    registration: 'MH 01 DK 8812',
    odometer: 42100,
    fuel_level: '45%',
    advisor_id: 'adv-2',
    advisor_name: 'Pooja Varma',
    technician_id: 'tech-2',
    technician_name: 'Rahul Sen',
    created_date: '2026-09-19',
    validity_date: '2026-10-03',
    labour_total: 4200,
    parts_total: 14000,
    subtotal: 18200,
    discount_total: 0,
    total: 18200,
    approved_total: 16800,
    declined_total: 1400,
    revision_number: 1,
    revisions: [
      {
        revision_number: 1,
        timestamp: '2026-09-19T09:55:00Z',
        total: 18200,
        reason: 'Estimate drafted following INS-3048 DVI inspection.',
        created_by: 'Pooja Varma (Advisor)',
        approved_total: 16800,
      },
    ],
    notes: 'OEM front brake pad kit with electronic wear sensor and front ultrasonic sensor alignment.',
    internal_notes: 'Customer declined ultrasonic sensor realignment to stay within ₹17,000 budget.',
    customer_notes: 'Brake pads replaced using Daimler AG genuine parts.',
    status: 'PARTIALLY_APPROVED',
    public_token: 'demo-quote-merc',
    items: [
      {
        id: 'item-m1',
        estimate_id: 'est-2048',
        source_finding_id: 'find-merc-1',
        source_inspection_id: 'INS-3048',
        source_category: '3. BRAKES',
        source_component: 'Front Brake Pads & Rotors',
        source_recommendation: 'Immediate replacement with Mercedes-Benz OEM brake pad set & new wear indicator.',
        source_priority: 'CRITICAL',
        description: 'Mercedes-Benz OEM Front Brake Pad Set',
        type: 'Parts',
        category: 'Braking Components',
        quantity: 1,
        unit: 'set',
        unit_price: 12500,
        discount: 0,
        line_total: 12500,
        is_price_configured: true,
        customer_visible: true,
        approval_status: 'APPROVED',
        display_order: 1,
        created_at: '2026-09-19T09:55:00Z',
      },
      {
        id: 'item-m2',
        estimate_id: 'est-2048',
        description: 'Front Brake Wear Sensor Lead',
        type: 'Parts',
        category: 'Braking Electronics',
        quantity: 1,
        unit: 'unit',
        unit_price: 1500,
        discount: 0,
        line_total: 1500,
        is_price_configured: true,
        customer_visible: true,
        approval_status: 'APPROVED',
        display_order: 2,
        created_at: '2026-09-19T09:55:00Z',
      },
      {
        id: 'item-m3',
        estimate_id: 'est-2048',
        description: 'Brake Caliper Servicing & Replacement Labour',
        type: 'Labour',
        category: 'Mechanical Labour',
        quantity: 1,
        unit: 'job',
        unit_price: 2800,
        discount: 0,
        line_total: 2800,
        is_price_configured: true,
        customer_visible: true,
        approval_status: 'APPROVED',
        display_order: 3,
        created_at: '2026-09-19T09:55:00Z',
      },
      {
        id: 'item-m4',
        estimate_id: 'est-2048',
        source_finding_id: 'find-merc-2',
        source_inspection_id: 'INS-3048',
        source_category: '6. ELECTRICAL',
        source_component: 'Horn & Fuse Box Inspection',
        source_recommendation: 'Resecure ultrasonic sensor harness and clear stored sensor fault.',
        source_priority: 'MEDIUM',
        description: 'Ultrasonic Parking Sensor Harness Calibration',
        type: 'Labour',
        category: 'Electrical Labour',
        quantity: 1,
        unit: 'job',
        unit_price: 1400,
        discount: 0,
        line_total: 1400,
        is_price_configured: true,
        customer_visible: true,
        approval_status: 'DECLINED',
        display_order: 4,
        created_at: '2026-09-19T09:55:00Z',
      },
    ],
    timeline: [
      { id: 'et-48-1', timestamp: '2026-09-19T09:55:00Z', actor: 'Pooja Varma (Advisor)', event: 'Estimate Created', notes: 'Generated from inspection INS-3048' },
      { id: 'et-48-2', timestamp: '2026-09-19T10:05:00Z', actor: 'Pooja Varma (Advisor)', event: 'Estimate Sent to Customer', notes: 'Transmitted via digital quote link' },
      { id: 'et-48-3', timestamp: '2026-09-19T10:20:00Z', actor: 'Ananya Deshmukh (Customer)', event: 'Customer Viewed Estimate', notes: 'Accessed on mobile viewport' },
      { id: 'et-48-4', timestamp: '2026-09-19T10:28:00Z', actor: 'Ananya Deshmukh (Customer)', event: 'Partial Approval Recorded', notes: 'Approved 3 items, declined sensor calibration' },
    ],
  },
  'JC-2049': {
    id: 'est-2049',
    estimate_number: 'EST-2026-2049',
    job_id: 'JC-2049',
    job_card_id: 'JC-2049',
    appointment_id: 'apt-203',
    lead_id: 'lead-103',
    inspection_id: 'INS-3049',
    customer_id: 'cust-3',
    customer_name: 'Vikramaditya Rao',
    customer_phone: '+91 98222 33344',
    customer_email: 'v.rao@example.com',
    vehicle_id: 'veh-3',
    vehicle_make: 'Porsche',
    vehicle_model: 'Macan GTS',
    vehicle_year: 2023,
    vehicle_summary: '2023 Porsche Macan GTS',
    registration: 'MH 04 BK 9000',
    odometer: 21500,
    fuel_level: '55%',
    advisor_id: 'adv-1',
    advisor_name: 'Rohan Deshmukh',
    technician_id: 'tech-1',
    technician_name: 'Arjun Sharma',
    created_date: '2026-09-20',
    validity_date: '2026-10-04',
    labour_total: 8000,
    parts_total: 34000,
    subtotal: 42000,
    discount_total: 0,
    total: 42000,
    approved_total: 0,
    declined_total: 0,
    revision_number: 1,
    revisions: [
      {
        revision_number: 1,
        timestamp: '2026-09-20T10:00:00Z',
        total: 42000,
        reason: 'High-performance brake overhaul specification for track usage.',
        created_by: 'Rohan Deshmukh (Advisor)',
      },
    ],
    notes: 'Porsche OEM front & rear ventilated brake rotor set and motorsport dot 5.1 high temp brake fluid.',
    internal_notes: 'Track-day event scheduled next month. Ensure Motul RBF 660 fresh sealed batch is used.',
    customer_notes: 'Includes precision dial-indicator rotor runout check to ensure < 0.03mm tolerance.',
    status: 'SENT',
    public_token: 'demo-quote-porsche',
    items: [
      {
        id: 'item-p1',
        estimate_id: 'est-2049',
        source_finding_id: 'find-p-1',
        source_inspection_id: 'INS-3049',
        source_category: '3. BRAKES',
        source_component: 'Front Brake Pads & Rotors',
        source_recommendation: 'Replace front brake discs and flush system with Motul RBF 660 fluid.',
        source_priority: 'CRITICAL',
        description: 'Porsche OEM 360mm Front Brake Disc Rotor Pair',
        type: 'Parts',
        category: 'High Performance Brakes',
        quantity: 2,
        unit: 'disc',
        unit_price: 13500,
        discount: 0,
        line_total: 27000,
        is_price_configured: true,
        customer_visible: true,
        approval_status: 'PENDING',
        display_order: 1,
        created_at: '2026-09-20T10:00:00Z',
      },
      {
        id: 'item-p2',
        estimate_id: 'est-2049',
        description: 'Motul RBF 660 Factory Line Racing Brake Fluid Flush',
        type: 'Parts',
        category: 'Hydraulic Fluid',
        quantity: 2,
        unit: 'bottle',
        unit_price: 3500,
        discount: 0,
        line_total: 7000,
        is_price_configured: true,
        customer_visible: true,
        approval_status: 'PENDING',
        display_order: 2,
        created_at: '2026-09-20T10:00:00Z',
      },
      {
        id: 'item-p3',
        estimate_id: 'est-2049',
        description: 'High-Performance Brake System Overhaul Labour',
        type: 'Labour',
        category: 'Track-Spec Labour',
        quantity: 1,
        unit: 'job',
        unit_price: 8000,
        discount: 0,
        line_total: 8000,
        is_price_configured: true,
        customer_visible: true,
        approval_status: 'PENDING',
        display_order: 3,
        created_at: '2026-09-20T10:00:00Z',
      },
    ],
    timeline: [
      { id: 'et-49-1', timestamp: '2026-09-20T10:00:00Z', actor: 'Rohan Deshmukh (Advisor)', event: 'Estimate Created', notes: 'Generated from inspection INS-3049' },
      { id: 'et-49-2', timestamp: '2026-09-20T10:15:00Z', actor: 'Rohan Deshmukh (Advisor)', event: 'Estimate Sent to Customer', notes: 'Link shared via SMS/WhatsApp' },
    ],
  },
  'JC-2050': {
    id: 'est-2050',
    estimate_number: 'EST-2026-2050',
    job_id: 'JC-2050',
    job_card_id: 'JC-2050',
    lead_id: 'lead-102',
    inspection_id: 'INS-3050',
    customer_id: 'cust-4',
    customer_name: 'Priyanka Sen',
    customer_phone: '+91 98450 67890',
    customer_email: 'priyanka.sen@example.com',
    vehicle_id: 'veh-4',
    vehicle_make: 'Volvo',
    vehicle_model: 'XC60',
    vehicle_year: 2021,
    vehicle_summary: '2021 Volvo XC60',
    registration: 'MH 02 CZ 5510',
    odometer: 38900,
    fuel_level: '70%',
    advisor_id: 'adv-2',
    advisor_name: 'Pooja Varma',
    technician_id: 'tech-3',
    technician_name: 'Farhan Akhtar',
    created_date: '2026-09-19',
    validity_date: '2026-10-03',
    labour_total: 5500,
    parts_total: 13000,
    subtotal: 18500,
    discount_total: 0,
    total: 18500,
    approved_total: 18500,
    declined_total: 0,
    revision_number: 1,
    revisions: [
      {
        revision_number: 1,
        timestamp: '2026-09-19T11:20:00Z',
        total: 18500,
        reason: 'HVAC blend door actuator replacement scope.',
        created_by: 'Pooja Varma (Advisor)',
        approved_total: 18500,
      },
    ],
    notes: 'HVAC blend door actuator OEM and complete R1234yf refrigerant evacuation and recharge.',
    internal_notes: 'Actuator requires dashboard lower fascia removal. Assigned to Master Tech Farhan.',
    customer_notes: 'Includes full air conditioning temperature differential test before and after.',
    status: 'CONVERTED_TO_WORK',
    authorized_at: '2026-09-19T14:00:00Z',
    public_token: 'demo-quote-volvo',
    items: [
      {
        id: 'item-v1',
        estimate_id: 'est-2050',
        source_finding_id: 'find-v-1',
        source_inspection_id: 'INS-3050',
        source_category: '8. AIR CONDITIONING',
        source_component: 'Blower Motor & Vent Actuators',
        source_recommendation: 'Replace right blend door servo motor and run climate recalibration.',
        source_priority: 'HIGH',
        description: 'Volvo Dual-Zone HVAC Blend Door Servo Actuator',
        type: 'Parts',
        category: 'Climate Control',
        quantity: 1,
        unit: 'actuator',
        unit_price: 8500,
        discount: 0,
        line_total: 8500,
        is_price_configured: true,
        customer_visible: true,
        approval_status: 'APPROVED',
        display_order: 1,
        created_at: '2026-09-19T11:20:00Z',
      },
      {
        id: 'item-v2',
        estimate_id: 'est-2050',
        description: 'R1234yf Eco-Refrigerant Gas & PAG Synthetic Compressor Oil',
        type: 'Consumables',
        category: 'HVAC Consumables',
        quantity: 1,
        unit: 'recharge',
        unit_price: 4500,
        discount: 0,
        line_total: 4500,
        is_price_configured: true,
        customer_visible: true,
        approval_status: 'APPROVED',
        display_order: 2,
        created_at: '2026-09-19T11:20:00Z',
      },
      {
        id: 'item-v3',
        estimate_id: 'est-2050',
        description: 'Dashboard Lower Console Disassembly & Actuator Calibration Labour',
        type: 'Labour',
        category: 'Mechanical & Calibration Labour',
        quantity: 1,
        unit: 'job',
        unit_price: 5500,
        discount: 0,
        line_total: 5500,
        is_price_configured: true,
        customer_visible: true,
        approval_status: 'APPROVED',
        display_order: 3,
        created_at: '2026-09-19T11:20:00Z',
      },
    ],
    timeline: [
      { id: 'et-50-1', timestamp: '2026-09-19T11:20:00Z', actor: 'Pooja Varma (Advisor)', event: 'Estimate Created', notes: 'Compiled from INS-3050' },
      { id: 'et-50-2', timestamp: '2026-09-19T12:00:00Z', actor: 'Pooja Varma (Advisor)', event: 'Estimate Sent to Customer', notes: 'Sent to Priyanka Sen' },
      { id: 'et-50-3', timestamp: '2026-09-19T13:30:00Z', actor: 'Priyanka Sen (Customer)', event: 'Estimate Approved', notes: 'Approved via customer portal' },
      { id: 'et-50-4', timestamp: '2026-09-19T14:00:00Z', actor: 'Pooja Varma (Advisor)', event: 'Approved Work Authorized', notes: 'Scope transferred to JC-2050 for workshop execution' },
    ],
  },
  'JC-2051': {
    id: 'est-2051',
    estimate_number: 'EST-2026-2051',
    job_id: 'JC-2051',
    job_card_id: 'JC-2051',
    lead_id: 'lead-101',
    inspection_id: 'INS-3051',
    customer_id: 'cust-5',
    customer_name: 'Rajesh Singhal',
    customer_phone: '+91 98330 77112',
    customer_email: 'rajesh.singhal@example.com',
    vehicle_id: 'veh-5',
    vehicle_make: 'Audi',
    vehicle_model: 'A6 Matrix',
    vehicle_year: 2022,
    vehicle_summary: '2022 Audi A6 Matrix',
    registration: 'MH 02 BG 3311',
    odometer: 45200,
    fuel_level: '65%',
    advisor_id: 'adv-1',
    advisor_name: 'Rohan Deshmukh',
    technician_id: 'tech-1',
    technician_name: 'Arjun Sharma',
    created_date: '2026-09-20',
    validity_date: '2026-10-04',
    labour_total: 4800,
    parts_total: 11400,
    subtotal: 16200,
    discount_total: 0,
    total: 16200,
    approved_total: 0,
    declined_total: 0,
    revision_number: 1,
    revisions: [
      {
        revision_number: 1,
        timestamp: '2026-09-20T11:00:00Z',
        total: 16200,
        reason: 'Draft estimate awaiting final parts pricing check.',
        created_by: 'Rohan Deshmukh (Advisor)',
      },
    ],
    notes: 'Audi OEM spark plug set, synthetic 0W-20 engine oil, and Hunter Road Force wheel balancing.',
    internal_notes: 'Check availability of Audi 508.00 spec oil drum.',
    customer_notes: 'High-speed vibration troubleshooting and periodic spark ignition refresh.',
    status: 'DRAFT',
    public_token: 'demo-quote-audi',
    items: [
      {
        id: 'item-a1',
        estimate_id: 'est-2051',
        description: 'Audi OEM High Performance Laser Platinum Spark Plug Set (x4)',
        type: 'Parts',
        category: 'Ignition Systems',
        quantity: 4,
        unit: 'plug',
        unit_price: 1600,
        discount: 0,
        line_total: 6400,
        is_price_configured: true,
        customer_visible: true,
        approval_status: 'PENDING',
        display_order: 1,
        created_at: '2026-09-20T11:00:00Z',
      },
      {
        id: 'item-a2',
        estimate_id: 'est-2051',
        description: 'Motul Specific 508.00 0W-20 LongLife Synthetic Oil (5.5L)',
        type: 'Parts',
        category: 'Engine Oils',
        quantity: 1,
        unit: 'can',
        unit_price: 5000,
        discount: 0,
        line_total: 5000,
        is_price_configured: true,
        customer_visible: true,
        approval_status: 'PENDING',
        display_order: 2,
        created_at: '2026-09-20T11:00:00Z',
      },
      {
        id: 'item-a3',
        estimate_id: 'est-2051',
        source_finding_id: 'find-a-1',
        source_inspection_id: 'INS-3051',
        source_category: '4. TYRES & WHEELS',
        source_component: 'Wheel Rims & Fasteners',
        source_recommendation: 'Dynamic balancing and radial force matching across all 4 wheels.',
        source_priority: 'MEDIUM',
        description: 'Hunter Road Force 4-Wheel High Speed Dynamic Balancing & Calibration',
        type: 'Labour',
        category: 'Wheel Alignment & Balancing',
        quantity: 1,
        unit: 'service',
        unit_price: 4800,
        discount: 0,
        line_total: 4800,
        is_price_configured: true,
        customer_visible: true,
        approval_status: 'PENDING',
        display_order: 3,
        created_at: '2026-09-20T11:00:00Z',
      },
    ],
    timeline: [
      { id: 'et-51-1', timestamp: '2026-09-20T11:00:00Z', actor: 'Rohan Deshmukh (Advisor)', event: 'Estimate Draft Created', notes: 'Draft compiled' },
    ],
  },
  'JC-2052': {
    id: 'est-2052',
    estimate_number: 'EST-2026-2052',
    job_id: 'JC-2052',
    job_card_id: 'JC-2052',
    inspection_id: 'INS-3052',
    customer_id: 'cust-6',
    customer_name: 'Meera Nambiar',
    customer_phone: '+91 98199 44332',
    customer_email: 'meera.nambiar@example.com',
    vehicle_id: 'veh-6',
    vehicle_make: 'BMW',
    vehicle_model: '3 Series (G20)',
    vehicle_year: 2020,
    vehicle_summary: '2020 BMW 3 Series (G20)',
    registration: 'MH 02 EE 7721',
    odometer: 51200,
    fuel_level: '40%',
    advisor_id: 'adv-1',
    advisor_name: 'Rohan Deshmukh',
    technician_id: 'tech-4',
    technician_name: 'Vikram Singh',
    created_date: '2026-09-18',
    validity_date: '2026-10-02',
    labour_total: 6000,
    parts_total: 18500,
    subtotal: 24500,
    discount_total: 0,
    total: 24500,
    approved_total: 0,
    declined_total: 24500,
    revision_number: 1,
    revisions: [
      {
        revision_number: 1,
        timestamp: '2026-09-18T12:00:00Z',
        total: 24500,
        reason: 'Front suspension control arms renewal.',
        created_by: 'Rohan Deshmukh (Advisor)',
        approved_total: 0,
      },
    ],
    notes: 'BMW suspension overhaul and 3D laser alignment.',
    internal_notes: 'Customer opted to defer suspension overhaul to next service cycle.',
    customer_notes: 'Suspension wishbone hydro-bushing overhaul.',
    status: 'DECLINED',
    public_token: 'demo-quote-bmw3',
    items: [
      {
        id: 'item-b1',
        estimate_id: 'est-2052',
        source_finding_id: 'find-b-1',
        source_inspection_id: 'INS-3052',
        source_category: '5. SUSPENSION & STEERING',
        source_component: 'Front Control Arms & Bushings',
        source_recommendation: 'Replace pair of front control arms and perform laser wheel alignment.',
        source_priority: 'CRITICAL',
        description: 'Front Lower Control Arm Bushing Pair Replacement',
        type: 'Parts',
        category: 'Suspension Components',
        quantity: 2,
        unit: 'arm',
        unit_price: 7000,
        discount: 0,
        line_total: 14000,
        is_price_configured: true,
        customer_visible: true,
        approval_status: 'DECLINED',
        display_order: 1,
        created_at: '2026-09-18T12:00:00Z',
      },
      {
        id: 'item-b2',
        estimate_id: 'est-2052',
        description: 'Front Stabilizer Link Rod Pair',
        type: 'Parts',
        category: 'Suspension Hardware',
        quantity: 2,
        unit: 'pair',
        unit_price: 2250,
        discount: 0,
        line_total: 4500,
        is_price_configured: true,
        customer_visible: true,
        approval_status: 'DECLINED',
        display_order: 2,
        created_at: '2026-09-18T12:00:00Z',
      },
      {
        id: 'item-b3',
        estimate_id: 'est-2052',
        description: 'Suspension Overhaul & 3D Wheel Alignment Labour',
        type: 'Labour',
        category: 'Chassis Alignment Labour',
        quantity: 1,
        unit: 'job',
        unit_price: 6000,
        discount: 0,
        line_total: 6000,
        is_price_configured: true,
        customer_visible: true,
        approval_status: 'DECLINED',
        display_order: 3,
        created_at: '2026-09-18T12:00:00Z',
      },
    ],
    timeline: [
      { id: 'et-52-1', timestamp: '2026-09-18T12:00:00Z', actor: 'Rohan Deshmukh (Advisor)', event: 'Estimate Created', notes: 'Created from INS-3052' },
      { id: 'et-52-2', timestamp: '2026-09-18T12:30:00Z', actor: 'Rohan Deshmukh (Advisor)', event: 'Estimate Sent to Customer', notes: 'Sent to Meera Nambiar' },
      { id: 'et-52-3', timestamp: '2026-09-18T14:10:00Z', actor: 'Meera Nambiar (Customer)', event: 'Estimate Declined', notes: 'Customer opted to defer suspension work' },
    ],
  },
};

// Seed Reminders
const SEED_REMINDERS: ServiceReminder[] = [
  {
    id: 'rem-bmw-rahul',
    customer_name: 'Rahul Mehta',
    customer_phone: '+91 98765 43210',
    vehicle_summary: '2022 BMW 5 Series (G30)',
    registration: 'MH 02 ER 4500',
    last_service_date: '2026-09-18',
    recommended_service: 'Scheduled service interval',
    due_date: '2026-09-25',
    status: 'DUE',
    reminder_type: 'SERVICE_DUE',
    priority: 'HIGH',
    reason: 'Scheduled service interval',
    advisor: 'Rohan Deshmukh',
    vehicle_id: 'veh-1',
    customer_id: 'cust-1',
    job_card_id: 'JC-1984',
    notes: 'CBS alert indicated brake pads and microfilter renewal milestone.',
  },
  {
    id: 'rem-merc-ananya',
    customer_name: 'Ananya Deshmukh',
    customer_phone: '+91 98111 22233',
    vehicle_summary: '2021 Mercedes-Benz C-Class (W205)',
    registration: 'MH 01 DK 8812',
    last_service_date: '2026-04-18',
    recommended_service: 'Front parking sensor replacement',
    due_date: '2026-09-22',
    status: 'DUE',
    reminder_type: 'DECLINED_RECOMMENDATION',
    priority: 'HIGH',
    reason: 'Deferred during EST-2026-2048',
    advisor: 'Pooja Varma',
    source_estimate_id: 'est-2048',
    source_estimate_number: 'EST-2026-2048',
    source_finding_id: 'find-merc-2',
    source_recommendation: 'Front ultrasonic parking sensor replacement & harness calibration',
    vehicle_id: 'veh-2',
    customer_id: 'cust-2',
    job_card_id: 'JC-2048',
    notes: 'Customer deferred parking sensor calibration during brake repair. Follow up within 48 hours.',
  },
  {
    id: 'rem-meera-due-today',
    customer_name: 'Meera Nambiar',
    customer_phone: '+91 98199 44332',
    vehicle_summary: '2020 BMW 3 Series (G20)',
    registration: 'MH 02 EE 7721',
    last_service_date: '2026-09-19',
    recommended_service: 'Post-Suspension Alignment 48-Hour Road Check',
    due_date: '2026-09-21',
    status: 'DUE',
    reminder_type: 'SERVICE_DUE',
    priority: 'NORMAL',
    reason: 'Post-overhaul check-in milestone',
    advisor: 'Rohan Deshmukh',
    vehicle_id: 'veh-6',
    customer_id: 'cust-6',
    job_card_id: 'JC-2052',
    notes: 'Verify 3D steering centering and suspension bushing settling.',
  },
  {
    id: 'rem-1',
    customer_name: 'Vikramaditya Rao',
    customer_phone: '+91 98222 33344',
    vehicle_summary: '2023 Porsche Macan GTS',
    registration: 'MH 04 BK 9000',
    last_service_date: '2026-01-14',
    recommended_service: 'Annual Brake Fluid & Cabin Care',
    due_date: '2026-09-15',
    status: 'OVERDUE',
    reminder_type: 'SERVICE_DUE',
    priority: 'HIGH',
    reason: 'Interval due by calendar month. Recommended track-spec fluid refresh.',
    advisor: 'Vikram Malhotra',
    vehicle_id: 'veh-3',
    customer_id: 'cust-3',
    notes: 'Track enthusiast. Frequent high-temperature fluid refresh required.',
  },
  {
    id: 'rem-2',
    customer_name: 'Rajesh Khanna',
    customer_phone: '+91 98333 44556',
    vehicle_summary: '2020 Audi Q7 3.0 TDI',
    registration: 'MH 02 DF 1120',
    last_service_date: '2025-09-10',
    recommended_service: 'Comprehensive Major Service & Transmission Fluid',
    due_date: '2026-09-10',
    status: 'OVERDUE',
    reminder_type: 'SERVICE_DUE',
    priority: 'HIGH',
    reason: 'Last serviced 12 months ago at 58,000 km.',
    advisor: 'Rohan Deshmukh',
    notes: 'Overdue by 11 days. ZF transmission 60k km fluid drain and fill recommended.',
  },
  {
    id: 'rem-3',
    customer_name: 'Neha Kapoor',
    customer_phone: '+91 98444 55667',
    vehicle_summary: '2022 BMW X3 xDrive20d',
    registration: 'MH 03 CN 7701',
    last_service_date: '2026-04-05',
    recommended_service: 'Periodic Maintenance & Filter Inspection',
    due_date: '2026-10-05',
    status: 'UPCOMING',
    reminder_type: 'SEASONAL_CHECK',
    priority: 'NORMAL',
    reason: '6-month seasonal checkup milestone',
    advisor: 'Pooja Varma',
    notes: 'Seasonal pre-winter fluid check and intake filter check.',
  },
  {
    id: 'rem-priyanka-completed',
    customer_name: 'Priyanka Sen',
    customer_phone: '+91 98450 67890',
    vehicle_summary: '2021 Volvo XC60',
    registration: 'MH 02 CZ 5510',
    last_service_date: '2026-02-10',
    recommended_service: 'Coolant Flush & Thermostat Inspection',
    due_date: '2026-09-12',
    status: 'COMPLETED',
    reminder_type: 'SERVICE_DUE',
    priority: 'NORMAL',
    reason: 'Periodic cooling system maintenance',
    advisor: 'Rohan Deshmukh',
    completed_at: '2026-09-14T11:00:00Z',
    vehicle_id: 'veh-4',
    customer_id: 'cust-4',
    notes: 'Customer contacted on WhatsApp, brought car in and coolant service completed.',
  },
];

// Helper to safely access localStorage with fallback
function loadFromStorage<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore storage parse errors
  }
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Storage quota or restriction
  }
}

// ============================================================
// CANONICAL DATA ACCESSORS
// ============================================================

export function getJobs(): Record<string, JobCard> {
  return loadFromStorage<Record<string, JobCard>>(JOBS_KEY, SEED_JOBS);
}

export function getJobById(id: string): JobCard | null {
  const jobs = getJobs();
  return jobs[id] || null;
}

export function getJobByToken(token: string): JobCard | null {
  const jobs = getJobs();
  const found = Object.values(jobs).find(
    (j) => j.public_token === token || j.id === token
  );
  return found || null;
}

export function saveJob(job: JobCard): void {
  const jobs = getJobs();
  jobs[job.id] = job;
  saveToStorage(JOBS_KEY, jobs);
}

// Canonical Job Status Transition
export function updateJobStatus(
  jobId: string,
  newStatus: JobCardStatus,
  actor: string = 'Staff',
  note?: string,
  deliveryOptions?: {
    signature?: string;
    signoffName?: string;
    deliveryNotes?: string;
  }
): { success: boolean; job?: JobCard; error?: string } {
  const job = getJobById(jobId);
  if (!job) return { success: false, error: 'Job not found' };

  // Validate logical progression
  job.status = newStatus;
  
  // If moving to delivered, ensure approval state or add reminder
  if (newStatus === 'DELIVERED') {
    job.delivered_at = new Date().toISOString();
    if (deliveryOptions?.signature) {
      job.customer_signature = deliveryOptions.signature;
      job.handover_signoff_name = deliveryOptions.signoffName || job.customer_name;
      job.handover_signoff_at = new Date().toISOString();
    }
    if (deliveryOptions?.deliveryNotes) {
      job.delivery_notes = deliveryOptions.deliveryNotes;
    }

    // Ensure customer active job is cleared or completed
    const customers = getCustomers();
    if (customers[job.customer_id]) {
      customers[job.customer_id].last_service_date = new Date().toISOString().split('T')[0];
      customers[job.customer_id].active_job_id = null;
      saveCustomer(customers[job.customer_id]);
    }
  }

  // Append canonical timeline event
  const newEvent = {
    id: 'tl-' + Date.now(),
    timestamp: new Date().toISOString(),
    status: newStatus,
    event_label: STAGE_DISPLAY_MAP[newStatus] || newStatus,
    actor: actor,
    customer_visible: true,
    notes: note,
  };
  job.timeline.push(newEvent);

  saveJob(job);
  return { success: true, job };
}

// Canonical Workshop Floor Bay Reassignment
export function reassignJobBay(
  jobId: string,
  newBay: string,
  reason?: string,
  actor: string = 'Rohan Deshmukh (Advisor)'
): { success: boolean; job?: JobCard; error?: string } {
  const job = getJobById(jobId);
  if (!job) return { success: false, error: 'Job not found' };

  const previousBay = job.bay || 'UNASSIGNED';
  job.bay = newBay;

  // Append timeline event for audit trail
  const event = {
    id: 'tl-' + Date.now(),
    timestamp: new Date().toISOString(),
    status: job.status,
    event_label: `Bay Reassigned from ${previousBay} to ${newBay}`,
    actor,
    customer_visible: false,
    notes: reason ? `Reason: ${reason}` : `Operational transfer to ${newBay}`,
  };
  job.timeline = job.timeline || [];
  job.timeline.push(event);

  saveJob(job);
  return { success: true, job };
}

// Canonical technician assignment and workload synchronization
export function syncTechnicianWorkloads(): TechnicianRecord[] {
  try {
    const allJobs = Object.values(getJobs());
    const rawTechnicians = loadFromStorage<TechnicianRecord[]>(
      TECHNICIANS_KEY,
      SEED_TECHNICIANS
    );
    
    // Active jobs definition: status !== 'DELIVERED' && status !== 'CANCELLED'
    const activeJobs = allJobs.filter(
      (j) => j.status !== 'DELIVERED' && j.status !== 'CANCELLED'
    );

    const updatedTechs = rawTechnicians.map((tech) => {
      const techFirstName = tech.name.toLowerCase().split(' ')[0];
      const techJobs = activeJobs.filter((j) => {
        if (!j.technician || j.technician.toLowerCase() === 'unassigned') return false;
        const jTech = j.technician.toLowerCase().trim();
        return jTech === tech.name.toLowerCase().trim() || jTech.includes(techFirstName) || jTech === tech.id.toLowerCase();
      });
      const assignedIds = techJobs.map((j) => j.id);
      
      // Preserve ON_BREAK unless explicitly changed; otherwise active jobs > 0 maps to BUSY, 0 maps to AVAILABLE
      let status = tech.status;
      if (status !== 'ON_BREAK') {
        status = techJobs.length > 0 ? 'BUSY' : 'AVAILABLE';
      }

      return {
        ...tech,
        active_jobs_count: techJobs.length,
        assigned_job_ids: assignedIds,
        status,
      };
    });

    saveToStorage(TECHNICIANS_KEY, updatedTechs);
    return updatedTechs;
  } catch (e) {
    console.error('Failed to sync technician workloads:', e);
    return SEED_TECHNICIANS;
  }
}

// Canonical assign technician to job function
export function assignTechnicianToJob(
  jobId: string,
  technicianIdOrName: string,
  reason?: string,
  actor: string = 'Rohan Deshmukh (Advisor)'
): { success: boolean; job?: JobCard; error?: string } {
  // 1. Find Job Card
  const job = getJobById(jobId);
  // 2. Verify Job Card exists
  if (!job) {
    return { success: false, error: `Job Card ${jobId} not found` };
  }

  // 3. Verify Job Card is active
  if (job.status === 'DELIVERED' || job.status === 'CANCELLED') {
    return { success: false, error: `Job Card ${jobId} is not active (status: ${job.status})` };
  }

  // 4. Resolve the technician
  const currentTechs = getTechnicians();
  let targetTech = currentTechs.find(
    (t) => t.id.toLowerCase() === technicianIdOrName.toLowerCase() || t.name.toLowerCase() === technicianIdOrName.toLowerCase()
  );

  if (!targetTech) {
    // If not exact match, try matching by first name
    const inputFirst = technicianIdOrName.toLowerCase().split(' ')[0];
    targetTech = currentTechs.find((t) => t.name.toLowerCase().split(' ')[0] === inputFirst);
  }

  const resolvedTechName = targetTech ? targetTech.name : technicianIdOrName.trim();
  const previousTech = job.technician || 'Unassigned';

  // Idempotency: if already assigned to this exact technician, return success without duplicating timeline
  if (previousTech.toLowerCase().trim() === resolvedTechName.toLowerCase().trim()) {
    syncTechnicianWorkloads();
    return { success: true, job };
  }

  // 5 & 6 & 7. Update Job Card's canonical technician assignment
  job.technician = resolvedTechName;

  // 10. Append an audit timeline event
  const event = {
    id: 'tl-' + Date.now(),
    timestamp: new Date().toISOString(),
    status: job.status,
    event_label: `Technician Reassigned from ${previousTech} to ${resolvedTechName}`,
    actor,
    customer_visible: false,
    notes: reason ? `Reason: ${reason}` : `Assigned lead specialist: ${resolvedTechName}`,
  };
  job.timeline = job.timeline || [];
  job.timeline.push(event);

  // 11. Persist updated Job Card
  saveJob(job);

  // 8 & 9 & 12. Update technician workload from canonical active Job Cards & persist collection
  syncTechnicianWorkloads();

  return { success: true, job };
}

// Canonical Workshop Floor Technician Reassignment (delegates to canonical assignTechnicianToJob)
export function reassignJobTechnician(
  jobId: string,
  newTechnician: string,
  reason?: string,
  actor: string = 'Rohan Deshmukh (Advisor)'
): { success: boolean; job?: JobCard; error?: string } {
  return assignTechnicianToJob(jobId, newTechnician, reason, actor);
}


export function createCustomerPortalToken(jobId: string): string {
  const job = getJobById(jobId);
  if (!job) return '';
  if (!job.public_token) {
    job.public_token = 'track-' + jobId.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Math.random().toString(36).substring(2, 8);
    saveJob(job);
  }
  return job.public_token;
}

// Add Manual Historical Service Record (Clearly marked as manual historical entry)
export function addManualHistoricalRecord(params: {
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleId: string;
  vehicleSummary: string;
  registration: string;
  serviceName: string;
  serviceDate: string;
  odometer: number;
  serviceValue: number;
  technician: string;
  advisor: string;
  notes?: string;
  externalRef?: string;
}): JobCard {
  const jobs = getJobs();
  const count = Object.keys(jobs).length;
  const newId = params.externalRef?.trim() ? params.externalRef.trim() : `HIST-${2020 + count}`;
  const token = `track-hist-${Math.random().toString(36).substring(2, 8)}`;

  const newRecord: JobCard = {
    id: newId,
    customer_id: params.customerId,
    customer_name: params.customerName,
    customer_phone: params.customerPhone,
    vehicle_id: params.vehicleId,
    vehicle_summary: params.vehicleSummary,
    registration: params.registration,
    service_name: params.serviceName,
    customer_complaint: params.notes || 'Historical service record manually imported into workshop archives.',
    intake_notes: 'Manual entry from physical workshop ledger or prior DMS invoice.',
    advisor: params.advisor,
    technician: params.technician,
    bay: 'COMPLETED ARCHIVE',
    opened_at: new Date(params.serviceDate).toISOString(),
    promised_completion: new Date(params.serviceDate).toISOString(),
    delivered_at: new Date(params.serviceDate).toISOString(),
    odometer: params.odometer,
    fuel_level: 'N/A',
    status: 'DELIVERED',
    priority: 'NORMAL',
    estimate_total: params.serviceValue,
    approval_status: 'APPROVED',
    public_token: token,
    is_manual_history: true,
    manual_source: 'MANUAL ENTRY',
    origin: 'MANUAL_ENTRY',
    work_notes: params.notes,
    work_items: [
      {
        id: `mwi-${Date.now()}-1`,
        description: params.serviceName,
        type: 'Labour',
        quantity: 1,
        unit: 'Job',
        estimated_amount: params.serviceValue,
        actual_amount: params.serviceValue,
        status: 'COMPLETED',
      },
    ],
    timeline: [
      {
        id: `mtl-${Date.now()}-1`,
        timestamp: new Date(params.serviceDate).toISOString(),
        status: 'DELIVERED',
        event_label: 'Manual Historical Service Record Archived',
        actor: `${params.advisor} (Manual Entry)`,
        customer_visible: true,
        notes: params.notes || 'Recorded from historical archives.',
      },
    ],
  };

  saveJob(newRecord);
  return newRecord;
}

// ============================================================
// CUSTOMER-SAFE DATA LAYER (Privacy Isolation)
// ============================================================

export function getCustomerSafeJobView(token: string): CustomerSafeJob | null {
  if (!token || typeof token !== 'string' || token.trim() === '') return null;
  
  // Also check backward compatibility token like 'demo-job-mercedes'
  let job = getJobByToken(token);
  if (!job && token === 'demo-job-mercedes') {
    job = getJobById('JC-2048');
  }

  if (!job) return null;

  // Mask customer display name for privacy (e.g. Rahul M.)
  const nameParts = job.customer_name.trim().split(' ');
  const displayName =
    nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
      : nameParts[0];

  const stages: JobCardStatus[] = [
    'VEHICLE_RECEIVED',
    'INSPECTION_COMPLETED',
    'ESTIMATE_APPROVED',
    'WORK_IN_PROGRESS',
    'QUALITY_CHECK',
    'READY_FOR_COLLECTION',
    'DELIVERED',
  ];

  const currentIdx = stages.indexOf(job.status);

  // Map to customer safe timeline
  const customerTimeline = stages.map((st, idx) => {
    // Find matching timeline record for timestamp if present
    const event = [...job!.timeline].reverse().find((e) => e.status === st);
    return {
      timestamp: event
        ? new Date(event.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : '',
      label: STAGE_DISPLAY_MAP[st] || st,
      completed: currentIdx > idx || job!.status === 'DELIVERED',
      current: currentIdx === idx && job!.status !== 'DELIVERED',
    };
  });

  const latestUpdate =
    STAGE_LATEST_UPDATE_MAP[job.status] ||
    'Service processing on workshop schedule.';
  const nextStep =
    STAGE_NEXT_STEP_MAP[job.status] ||
    'Progress update will follow upon current phase completion.';

  const estimateState: 'Pending Review' | 'Approved' | 'Declined' =
    job.approval_status === 'APPROVED'
      ? 'Approved'
      : job.approval_status === 'DECLINED'
      ? 'Declined'
      : 'Pending Review';

  // Construct contextual WhatsApp deep link
  const waMsg = encodeURIComponent(
    `Hi Torque Expert's, I need an update on my ${job.vehicle_summary} service.\n\nJob: ${job.id}\nCurrent stage: ${STAGE_DISPLAY_MAP[job.status]}\n\nCould you please confirm the expected completion time?`
  );
  const waUrl = `https://wa.me/919876543210?text=${waMsg}`;

  return {
    job_id: job.id,
    customer_display_name: displayName,
    vehicle: job.vehicle_summary,
    registration: job.registration,
    service: job.service_name,
    odometer: job.odometer,
    status: job.status,
    status_label: STAGE_DISPLAY_MAP[job.status] || job.status,
    latest_update: latestUpdate,
    next_step: nextStep,
    estimate_approved_state: estimateState,
    last_updated:
      job.timeline.length > 0
        ? job.timeline[job.timeline.length - 1].timestamp
        : job.opened_at,
    timeline: customerTimeline,
    workshop_phone: '+91 98765 43210',
    whatsapp_prefilled_url: waUrl,
  };
}

// ============================================================
// CUSTOMERS & VEHICLES
// ============================================================

export function getCustomers(): Record<string, CustomerRecord> {
  const list = loadFromStorage<CustomerRecord[]>(CUSTOMERS_KEY, SEED_CUSTOMERS);
  const recordMap: Record<string, CustomerRecord> = {};
  list.forEach((c) => {
    recordMap[c.id] = c;
  });
  return recordMap;
}

export function getCustomerById(id: string): CustomerRecord | null {
  const customers = getCustomers();
  return customers[id] || null;
}

export function saveCustomer(customer: CustomerRecord): void {
  const current = Object.values(getCustomers());
  const idx = current.findIndex((c) => c.id === customer.id);
  if (idx >= 0) {
    current[idx] = customer;
  } else {
    current.push(customer);
  }
  saveToStorage(CUSTOMERS_KEY, current);
}

export function getVehicles(): Record<string, VehicleRecord> {
  const list = loadFromStorage<VehicleRecord[]>(VEHICLES_KEY, SEED_VEHICLES);
  const recordMap: Record<string, VehicleRecord> = {};
  list.forEach((v) => {
    recordMap[v.id] = v;
  });
  return recordMap;
}

export function getVehicleById(id: string): VehicleRecord | null {
  const vehicles = getVehicles();
  return vehicles[id] || null;
}

export function saveVehicle(vehicle: VehicleRecord): void {
  const current = Object.values(getVehicles());
  const idx = current.findIndex((v) => v.id === vehicle.id);
  if (idx >= 0) {
    current[idx] = vehicle;
  } else {
    current.push(vehicle);
  }
  saveToStorage(VEHICLES_KEY, current);
}

// ============================================================
// LEADS & APPOINTMENTS
// ============================================================

export function getLeads(): LeadRecord[] {
  return loadFromStorage<LeadRecord[]>(LEADS_KEY, SEED_LEADS);
}

export function getLeadById(id: string): LeadRecord | null {
  const leads = getLeads();
  return leads.find((l) => l.id === id) || null;
}

export function saveLead(lead: LeadRecord): void {
  const current = getLeads();
  const idx = current.findIndex((l) => l.id === lead.id);
  if (idx >= 0) {
    current[idx] = lead;
  } else {
    current.unshift(lead);
  }
  saveToStorage(LEADS_KEY, current);
}

export function updateLeadStatus(
  id: string,
  status: LeadStatus,
  actor: string = 'Rohan Deshmukh (Advisor)',
  notes?: string,
  lostReason?: LostReason
): { success: boolean; lead?: LeadRecord; error?: string } {
  const current = getLeads();
  const lead = current.find((l) => l.id === id);
  if (!lead) return { success: false, error: 'Lead not found' };

  lead.status = status;
  if (status === 'LOST' && lostReason) {
    lead.lost_reason = lostReason;
    if (notes) lead.lost_notes = notes;
  }
  if (status === 'CONTACTED') {
    lead.last_contacted_at = new Date().toISOString();
  }

  // Append timeline event
  const timelineEvent: LeadTimelineEvent = {
    id: 'tl-lead-' + Date.now(),
    timestamp: new Date().toISOString(),
    actor,
    event: `Status Updated to ${status}`,
    notes: notes || (status === 'LOST' && lostReason ? `Reason: ${lostReason}` : undefined),
  };
  lead.timeline = lead.timeline || [];
  lead.timeline.unshift(timelineEvent);

  saveToStorage(LEADS_KEY, current);
  return { success: true, lead };
}

export function convertLeadToAppointment(
  leadId: string,
  date: string,
  time: string,
  advisor: string = 'Rohan Deshmukh'
): AppointmentRecord | null {
  const leads = getLeads();
  const lead = leads.find((l) => l.id === leadId);
  if (!lead) return null;

  const apptId = 'apt-' + Date.now();
  const newAppt: AppointmentRecord = {
    id: apptId,
    customer_name: lead.customer_name,
    customer_phone: lead.customer_phone,
    customer_email: lead.customer_email,
    vehicle_summary: lead.vehicle_summary,
    vehicle_make: lead.vehicle_make,
    vehicle_model: lead.vehicle_model,
    vehicle_year: lead.vehicle_year,
    registration_number: lead.registration,
    service_name: lead.service_requested,
    requested_date: date || new Date().toISOString().split('T')[0],
    requested_time: time || '10:00',
    status: 'CONFIRMED',
    advisor: advisor || lead.assigned_advisor || 'Rohan Deshmukh',
    source: lead.source,
    notes: `Converted from Lead ${lead.id}: ${lead.message}`,
    created_at: new Date().toISOString(),
    lead_id: lead.id,
    timeline: [
      {
        id: 'tl-apt-' + Date.now(),
        timestamp: new Date().toISOString(),
        actor: advisor || lead.assigned_advisor || 'Rohan Deshmukh',
        event: 'Appointment Created from Lead',
        notes: `Converted from Lead ${lead.id}. Scheduled for ${date} at ${time}.`,
      },
    ],
  };

  lead.status = 'CONVERTED';
  lead.appointment_id = apptId;
  lead.next_follow_up_at = null;
  lead.next_action = `Appointment scheduled for ${newAppt.requested_date} at ${newAppt.requested_time} (${newAppt.id})`;
  
  const leadTimelineEvent: LeadTimelineEvent = {
    id: 'tl-lead-' + Date.now(),
    timestamp: new Date().toISOString(),
    actor: advisor || lead.assigned_advisor || 'Rohan Deshmukh',
    event: 'Converted to Appointment',
    notes: `Scheduled appointment ${apptId} for ${date} at ${time}.`,
  };
  lead.timeline = lead.timeline || [];
  lead.timeline.unshift(leadTimelineEvent);

  saveToStorage(LEADS_KEY, leads);
  saveAppointment(newAppt);

  return newAppt;
}

export function getAppointments(): AppointmentRecord[] {
  return loadFromStorage<AppointmentRecord[]>(
    APPOINTMENTS_KEY,
    SEED_APPOINTMENTS
  );
}

export function getAppointmentById(id: string): AppointmentRecord | null {
  const appts = getAppointments();
  return appts.find((a) => a.id === id) || null;
}

export function saveAppointment(appt: AppointmentRecord): void {
  const current = getAppointments();
  const idx = current.findIndex((a) => a.id === appt.id);
  if (idx >= 0) {
    current[idx] = appt;
  } else {
    current.unshift(appt);
  }
  saveToStorage(APPOINTMENTS_KEY, current);
}

export function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  actor: string = 'Rohan Deshmukh (Advisor)',
  notes?: string
): { success: boolean; appointment?: AppointmentRecord; error?: string } {
  const current = getAppointments();
  const appt = current.find((a) => a.id === id);
  if (!appt) return { success: false, error: 'Appointment not found' };

  appt.status = status;
  if (status === 'ARRIVED') {
    appt.arrival_time = new Date().toISOString();
  } else if (status === 'CHECKED_IN') {
    appt.check_in_time = new Date().toISOString();
  }

  const timelineEvent: AppointmentTimelineEvent = {
    id: 'tl-apt-' + Date.now(),
    timestamp: new Date().toISOString(),
    actor,
    event: `Status Updated to ${status}`,
    notes,
  };
  appt.timeline = appt.timeline || [];
  appt.timeline.unshift(timelineEvent);

  saveToStorage(APPOINTMENTS_KEY, current);
  return { success: true, appointment: appt };
}

export function updateAppointment(
  updated: AppointmentRecord,
  actor: string = 'Rohan Deshmukh (Advisor)',
  eventLabel?: string
): void {
  const current = getAppointments();
  const idx = current.findIndex((a) => a.id === updated.id);
  if (idx >= 0) {
    if (eventLabel) {
      updated.timeline = updated.timeline || [];
      updated.timeline.unshift({
        id: 'tl-apt-' + Date.now(),
        timestamp: new Date().toISOString(),
        actor,
        event: eventLabel,
      });
    }
    current[idx] = updated;
    saveToStorage(APPOINTMENTS_KEY, current);
  }
}

// Convert Appointment into Job Card (Canonical Lineage & Deduplication)
export function convertAppointmentToJobCard(
  apptId: string,
  bay: string = 'BAY 03',
  technician: string = 'Arjun Sharma',
  actor: string = 'Rohan Deshmukh (Advisor)'
): JobCard | null {
  const appts = getAppointments();
  const appt = appts.find((a) => a.id === apptId);
  if (!appt) return null;

  // 1. Resolve or link canonical customer (Deduplication)
  const customers = getCustomers();
  const cleanApptPhone = appt.customer_phone.replace(/[^0-9]/g, '');
  let matchedCustomer = Object.values(customers).find(
    (c) => c.phone.replace(/[^0-9]/g, '') === cleanApptPhone || c.name.toLowerCase() === appt.customer_name.toLowerCase()
  );

  let customerId = matchedCustomer ? matchedCustomer.id : `cust-${Date.now().toString().slice(-4)}`;
  if (!matchedCustomer) {
    const newCust: CustomerRecord = {
      id: customerId,
      name: appt.customer_name,
      phone: appt.customer_phone,
      email: appt.customer_email || '',
      vehicle_count: 1,
      total_visits: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveCustomer(newCust);
  }

  // 2. Resolve or link canonical vehicle (Deduplication)
  const vehicles = getVehicles();
  const reg = appt.registration_number || ('MH 02 AP ' + Math.floor(1000 + Math.random() * 9000));
  let matchedVehicle = Object.values(vehicles).find(
    (v) => (v.registration && v.registration.toLowerCase() === reg.toLowerCase()) ||
           (v.customer_id === customerId && v.make.toLowerCase() === (appt.vehicle_make || '').toLowerCase())
  );

  let vehicleId = matchedVehicle ? matchedVehicle.id : `veh-${Date.now().toString().slice(-4)}`;
  if (!matchedVehicle) {
    const newVeh: VehicleRecord = {
      id: vehicleId,
      customer_id: customerId,
      customer_name: appt.customer_name,
      make: appt.vehicle_make || appt.vehicle_summary.split(' ')[0] || 'Luxury',
      model: appt.vehicle_model || appt.vehicle_summary || 'Marque',
      year: appt.vehicle_year || new Date().getFullYear(),
      registration: reg,
      vin_masked: 'VIN' + Math.random().toString(36).substring(2, 8).toUpperCase() + '***',
      odometer: appt.check_in_odometer || 35000,
      created_at: new Date().toISOString(),
    };
    saveVehicle(newVeh);
  }

  // 3. Generate clean sequential job ID
  const jobs = getJobs();
  const count = Object.keys(jobs).length;
  const newJobId = `JC-${2049 + count}`;
  const token = `track-jc${2049 + count}-${Math.random().toString(36).substring(2, 6)}`;

  // 4. Mark appointment converted & link job card ID
  appt.status = 'CONVERTED';
  appt.job_card_id = newJobId;
  const apptTimelineEvent: AppointmentTimelineEvent = {
    id: 'tl-apt-' + Date.now(),
    timestamp: new Date().toISOString(),
    actor,
    event: 'Converted to Job Card',
    notes: `Transferred to Job Card ${newJobId}. Staged for workshop execution in ${bay}.`,
  };
  appt.timeline = appt.timeline || [];
  appt.timeline.unshift(apptTimelineEvent);
  saveToStorage(APPOINTMENTS_KEY, appts);

  // 5. If this appointment originated from a lead, also link lead to job_card_id
  if (appt.lead_id) {
    const leads = getLeads();
    const lead = leads.find((l) => l.id === appt.lead_id);
    if (lead) {
      lead.job_card_id = newJobId;
      lead.status = 'CONVERTED';
      lead.timeline = lead.timeline || [];
      lead.timeline.unshift({
        id: 'tl-lead-' + Date.now(),
        timestamp: new Date().toISOString(),
        actor,
        event: 'Job Card Created',
        notes: `Operational execution commenced via Job Card ${newJobId}.`,
      });
      saveToStorage(LEADS_KEY, leads);
    }
  }

  const odo = appt.check_in_odometer || 35000;
  const fuel = appt.check_in_fuel || '50%';
  const complaint = appt.check_in_notes || appt.notes || 'Routine intake assessment.';
  const intakeSummary = `Vehicle received from checked-in appointment ${appt.id}${
    appt.lead_id ? ` (originating from Lead ${appt.lead_id})` : ''
  }.`;

  const newJob: JobCard = {
    id: newJobId,
    customer_id: customerId,
    customer_name: appt.customer_name,
    customer_phone: appt.customer_phone,
    customer_email: appt.customer_email,
    vehicle_id: vehicleId,
    vehicle_summary: appt.vehicle_summary,
    vehicle_make: appt.vehicle_make,
    vehicle_model: appt.vehicle_model,
    vehicle_year: appt.vehicle_year,
    registration: reg,
    service_name: appt.service_name,
    customer_complaint: complaint,
    intake_notes: intakeSummary,
    advisor: appt.advisor || 'Rohan Deshmukh',
    technician: technician,
    bay: bay,
    opened_at: new Date().toISOString(),
    promised_completion: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    odometer: odo,
    fuel_level: fuel,
    status: 'VEHICLE_RECEIVED',
    priority: 'NORMAL',
    estimate_total: 0,
    approval_status: 'PENDING',
    public_token: token,
    appointment_id: appt.id,
    lead_id: appt.lead_id,
    timeline: [
      {
        id: 'tl-' + Date.now(),
        timestamp: new Date().toISOString(),
        status: 'VEHICLE_RECEIVED',
        event_label: 'Vehicle Received at Workshop Intake',
        actor: appt.advisor || 'Rohan Deshmukh',
        customer_visible: true,
        notes: 'Created from appointment ' + appt.id,
      },
    ],
  };

  saveJob(newJob);
  return newJob;
}

// ============================================================
// INSPECTIONS & ESTIMATES
// ============================================================

export function getInspections(): Record<string, InspectionRecord> {
  return loadFromStorage<Record<string, InspectionRecord>>(
    INSPECTIONS_KEY,
    SEED_INSPECTIONS
  );
}

export function getInspectionByJobId(jobId: string): InspectionRecord | null {
  const inspections = getInspections();
  return inspections[jobId] || null;
}

export function createInspectionFromJobCard(
  job: JobCard,
  technicianName?: string
): InspectionRecord {
  const inspections = getInspections();
  const existing = inspections[job.id];
  if (existing) return existing;

  const count = Object.keys(inspections).length;
  const newInspId = `INS-${3050 + count}`;
  const now = new Date().toISOString();

  const newInspection: InspectionRecord = {
    id: newInspId,
    job_id: job.id,
    job_card_id: job.id,
    appointment_id: job.appointment_id,
    lead_id: job.lead_id,
    customer_id: job.customer_id,
    customer_name: job.customer_name,
    customer_phone: job.customer_phone,
    customer_email: job.customer_email,
    vehicle_id: job.vehicle_id,
    vehicle_make: job.vehicle_make,
    vehicle_model: job.vehicle_model,
    vehicle_year: job.vehicle_year,
    vehicle_summary: job.vehicle_summary,
    registration: job.registration,
    technician_name: technicianName || job.technician,
    advisor_name: job.advisor,
    inspection_type: job.service_name || 'Multi-Point Vehicle Inspection',
    status: 'DRAFT',
    odometer: job.odometer,
    fuel_level: job.fuel_level,
    exterior_status: 'GOOD',
    interior_status: 'GOOD',
    engine_bay_status: 'GOOD',
    tyres_status: 'GOOD',
    brakes_status: 'GOOD',
    lights_status: 'GOOD',
    battery_status: 'GOOD',
    fluids_status: 'GOOD',
    inspector_name: technicianName || job.technician,
    findings: [],
    items: generateDefaultDVIItems(newInspId, 'NOT_INSPECTED'),
    evidence: [],
    timeline: [
      {
        id: 'tl-' + Date.now(),
        timestamp: now,
        actor: `${job.advisor} (Advisor)`,
        event: 'Inspection Created',
        notes: `Created from Job Card ${job.id}.`,
      },
    ],
    created_at: now,
    updated_at: now,
  };

  inspections[job.id] = newInspection;
  saveToStorage(INSPECTIONS_KEY, inspections);
  return newInspection;
}

export function saveInspection(inspection: InspectionRecord): void {
  const inspections = getInspections();
  inspection.updated_at = new Date().toISOString();
  inspections[inspection.job_id] = inspection;
  saveToStorage(INSPECTIONS_KEY, inspections);

  // If inspection was completed, auto-advance job if at VEHICLE_RECEIVED
  if (inspection.status === 'COMPLETED' || inspection.status === 'CUSTOMER_SHARED') {
    const job = getJobById(inspection.job_id);
    if (job && job.status === 'VEHICLE_RECEIVED') {
      updateJobStatus(
        job.id,
        'INSPECTION_COMPLETED',
        inspection.inspector_name,
        'Digital vehicle inspection completed with findings.'
      );
    }
  }
}

export function getEstimates(): Record<string, EstimateRecord> {
  return loadFromStorage<Record<string, EstimateRecord>>(
    ESTIMATES_KEY,
    SEED_ESTIMATES
  );
}

export function getEstimateByJobId(jobId: string): EstimateRecord | null {
  const estimates = getEstimates();
  return estimates[jobId] || null;
}

export function getEstimateByToken(token: string): EstimateRecord | null {
  const estimates = getEstimates();
  const found = Object.values(estimates).find(
    (e) => e.public_token === token || e.estimate_number === token || e.id === token
  );
  return found || null;
}

export function saveEstimate(estimate: EstimateRecord): void {
  const estimates = getEstimates();
  estimates[estimate.job_id] = estimate;
  saveToStorage(ESTIMATES_KEY, estimates);

  // Sync estimate total to JobCard
  const job = getJobById(estimate.job_id);
  if (job) {
    job.estimate_total = estimate.total;
    if (estimate.status === 'APPROVED' || estimate.status === 'CONVERTED_TO_WORK') {
      job.approval_status = 'APPROVED';
    } else if (estimate.status === 'PARTIALLY_APPROVED') {
      job.approval_status = 'APPROVED';
    } else if (estimate.status === 'DECLINED') {
      job.approval_status = 'DECLINED';
    }
    saveJob(job);
  }
}

// Create Estimate from Inspection recommendations
export function createEstimateFromInspection(
  inspection: InspectionRecord,
  selectedFindingIds: string[],
  advisorName: string = 'Rohan Deshmukh'
): EstimateRecord {
  const existingJob = getJobById(inspection.job_card_id || inspection.job_id);
  const estNumber = `EST-2026-${(inspection.job_card_id || inspection.job_id).replace('JC-', '')}`;
  const token = `quote-${(inspection.job_card_id || inspection.job_id).toLowerCase()}-${Math.random().toString(36).substring(2, 6)}`;

  const selectedFindings = (inspection.findings || []).filter((f) =>
    selectedFindingIds.includes(f.id)
  );

  const items: EstimateItem[] = selectedFindings.map((f, idx) => ({
    id: `item-${Date.now()}-${idx}`,
    estimate_id: `est-${inspection.job_id}`,
    source_finding_id: f.id,
    source_inspection_id: inspection.id,
    source_category: f.category,
    source_component: f.component,
    source_recommendation: f.recommendation,
    source_priority: f.priority,
    description: f.recommendation || f.finding,
    type: 'Labour',
    category: f.category || 'Mechanical Labour',
    quantity: 1,
    unit: 'job',
    unit_price: 0,
    discount: 0,
    line_total: 0,
    is_price_configured: false, // Unpriced from DVI
    customer_visible: true,
    approval_status: 'PENDING',
    internal_note: `Origin: ${f.category} (${f.component || 'Component'}). Priority: ${f.priority || 'NORMAL'}.`,
    customer_note: f.finding,
    display_order: idx + 1,
    created_at: new Date().toISOString(),
  }));

  const newEstimate: EstimateRecord = {
    id: `est-${inspection.job_id}`,
    estimate_number: estNumber,
    job_id: inspection.job_card_id || inspection.job_id,
    job_card_id: inspection.job_card_id || inspection.job_id,
    appointment_id: inspection.appointment_id || existingJob?.appointment_id,
    lead_id: inspection.lead_id || existingJob?.lead_id,
    inspection_id: inspection.id,
    customer_id: inspection.customer_id || existingJob?.customer_id,
    customer_name: inspection.customer_name || existingJob?.customer_name || 'Valued Customer',
    customer_phone: inspection.customer_phone || existingJob?.customer_phone || '',
    customer_email: inspection.customer_email || existingJob?.customer_email,
    vehicle_id: inspection.vehicle_id || existingJob?.vehicle_id,
    vehicle_make: inspection.vehicle_make || existingJob?.vehicle_make,
    vehicle_model: inspection.vehicle_model || existingJob?.vehicle_model,
    vehicle_year: inspection.vehicle_year || existingJob?.vehicle_year,
    vehicle_summary: inspection.vehicle_summary || existingJob?.vehicle_summary || 'Vehicle Unspecified',
    registration: inspection.registration || existingJob?.registration,
    odometer: inspection.odometer || existingJob?.odometer,
    fuel_level: inspection.fuel_level || existingJob?.fuel_level,
    advisor_name: advisorName,
    technician_name: inspection.technician_name || existingJob?.technician || 'Arjun Sharma',
    created_date: new Date().toISOString().split('T')[0],
    validity_date: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
    labour_total: 0,
    parts_total: 0,
    subtotal: 0,
    discount_total: 0,
    total: 0,
    approved_total: 0,
    declined_total: 0,
    revision_number: 1,
    revisions: [
      {
        revision_number: 1,
        timestamp: new Date().toISOString(),
        total: 0,
        reason: `Initial estimate created from ${selectedFindings.length} recommendations in ${inspection.id}.`,
        created_by: advisorName,
      },
    ],
    notes: 'Itemized scope compiled directly from inspection recommendations. Pricing requires configuration prior to customer transmission.',
    internal_notes: `Inherited ${selectedFindings.length} findings from ${inspection.id}. Requires labour and parts pricing assignment.`,
    customer_notes: 'Recommended vehicle maintenance scope identified during digital vehicle inspection.',
    status: 'DRAFT',
    public_token: token,
    items,
    timeline: [
      {
        id: `et-${Date.now()}-1`,
        timestamp: new Date().toISOString(),
        actor: `${advisorName} (Advisor)`,
        event: 'Estimate Created from Inspection',
        notes: `Inherited ${selectedFindings.length} recommendations from ${inspection.id}.`,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  saveEstimate(newEstimate);
  return newEstimate;
}

// Create Manual Estimate from Job Card
export function createEstimateFromJobCard(
  job: JobCard,
  advisorName: string = 'Rohan Deshmukh'
): EstimateRecord {
  const estNumber = `EST-2026-${job.id.replace('JC-', '')}`;
  const token = `quote-${job.id.toLowerCase()}-${Math.random().toString(36).substring(2, 6)}`;

  const newEstimate: EstimateRecord = {
    id: `est-${job.id}`,
    estimate_number: estNumber,
    job_id: job.id,
    job_card_id: job.id,
    appointment_id: job.appointment_id,
    lead_id: job.lead_id,
    customer_id: job.customer_id,
    customer_name: job.customer_name,
    customer_phone: job.customer_phone,
    customer_email: job.customer_email,
    vehicle_id: job.vehicle_id,
    vehicle_make: job.vehicle_make,
    vehicle_model: job.vehicle_model,
    vehicle_year: job.vehicle_year,
    vehicle_summary: job.vehicle_summary,
    registration: job.registration,
    odometer: job.odometer,
    fuel_level: job.fuel_level,
    advisor_name: advisorName,
    technician_name: job.technician,
    created_date: new Date().toISOString().split('T')[0],
    validity_date: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
    labour_total: 0,
    parts_total: 0,
    subtotal: 0,
    discount_total: 0,
    total: 0,
    approved_total: 0,
    declined_total: 0,
    revision_number: 1,
    revisions: [
      {
        revision_number: 1,
        timestamp: new Date().toISOString(),
        total: 0,
        reason: 'Manual workshop estimate created.',
        created_by: advisorName,
      },
    ],
    notes: 'Workshop repair estimate prepared for customer authorization.',
    internal_notes: `Manual estimate initiated for Job Card ${job.id}.`,
    customer_notes: 'Scope of work prepared by Torque Expert service advisor.',
    status: 'DRAFT',
    public_token: token,
    items: [],
    timeline: [
      {
        id: `et-${Date.now()}-1`,
        timestamp: new Date().toISOString(),
        actor: `${advisorName} (Advisor)`,
        event: 'Manual Estimate Drafted',
        notes: `Created for Job Card ${job.id}`,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  saveEstimate(newEstimate);
  return newEstimate;
}

// Convert an individual Inspection Finding into a canonical Estimate Item (with duplicate protection)
export function addFindingToEstimate(
  jobId: string,
  finding: InspectionFinding,
  actor: string = 'Rohan Deshmukh (Advisor)'
): { success: boolean; estimate: EstimateRecord; item: EstimateItem; alreadyExists: boolean } {
  let estimate = getEstimateByJobId(jobId);
  const now = new Date().toISOString();

  // 1. If estimate does not exist yet, initialize it
  if (!estimate) {
    const job = getJobById(jobId);
    if (!job) throw new Error(`Parent Job Card ${jobId} not found`);
    estimate = createEstimateFromJobCard(job, actor);
  }

  // 2. Check if this finding is already converted into this estimate
  const existingItem = estimate.items.find(
    (it) => it.source_finding_id === finding.id || (finding.id && it.id === finding.estimate_line_item_id)
  );

  if (existingItem) {
    // Already linked, prevent duplicates
    finding.add_to_estimate = true;
    finding.estimate_id = estimate.id;
    finding.estimate_line_item_id = existingItem.id;
    return { success: true, estimate, item: existingItem, alreadyExists: true };
  }

  // 3. Create new EstimateItem from Finding
  const newItemId = `item-f-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const newItem: EstimateItem = {
    id: newItemId,
    estimate_id: estimate.id,
    source_finding_id: finding.id,
    source_inspection_id: (finding as any).inspection_id || `INS-${jobId.replace('JC-', '')}`,
    source_category: finding.category,
    source_component: finding.component,
    source_recommendation: finding.recommendation,
    source_priority: finding.priority || 'HIGH',
    description: finding.recommendation || finding.finding,
    type: 'Labour',
    category: finding.category || 'Mechanical Labour',
    quantity: 1,
    unit: 'job',
    unit_price: 0,
    discount: 0,
    line_total: 0,
    is_price_configured: false,
    customer_visible: true,
    approval_status: 'PENDING',
    internal_note: `Generated from Finding ${finding.id} (${finding.category} - ${finding.component || 'Component'}). Condition: ${finding.condition}.`,
    customer_note: finding.finding,
    display_order: estimate.items.length + 1,
    created_at: now,
  };

  estimate.items.push(newItem);
  estimate.timeline = estimate.timeline || [];
  estimate.timeline.push({
    id: `et-${Date.now()}`,
    timestamp: now,
    actor,
    event: 'Finding Added to Scope',
    notes: `Added recommendation "${finding.recommendation || finding.finding}" from inspection finding ${finding.id}.`,
  });

  saveEstimate(estimate);

  // 4. Update the finding linkage properties
  finding.add_to_estimate = true;
  finding.estimate_id = estimate.id;
  finding.estimate_line_item_id = newItemId;

  // Persist updated inspection
  const inspections = getInspections();
  const insp = inspections[jobId];
  if (insp && insp.findings) {
    const fIdx = insp.findings.findIndex((f) => f.id === finding.id);
    if (fIdx >= 0) {
      insp.findings[fIdx] = { ...insp.findings[fIdx], ...finding };
      saveInspection(insp);
    }
  }

  return { success: true, estimate, item: newItem, alreadyExists: false };
}

// Customer Partial / Full Item Decisions on Quote Portal
export function recordEstimateDecisions(
  token: string,
  decisions: Record<string, 'APPROVED' | 'DECLINED'>,
  customerNotes?: string
): { success: boolean; estimate?: EstimateRecord } {
  const estimate = getEstimateByToken(token);
  if (!estimate) return { success: false };

  // Update line items
  let anyApproved = false;
  let anyDeclined = false;
  let anyPending = false;
  let approvedSum = 0;
  let declinedSum = 0;

  const updatedItems = estimate.items.map((item) => {
    const decision = decisions[item.id];
    const finalApproval = decision || item.approval_status || 'PENDING';

    if (finalApproval === 'APPROVED') {
      anyApproved = true;
      approvedSum += item.line_total;
    } else if (finalApproval === 'DECLINED') {
      anyDeclined = true;
      declinedSum += item.line_total;
    } else {
      anyPending = true;
    }

    return {
      ...item,
      approval_status: finalApproval,
    };
  });

  // Derive new overall estimate status
  let newStatus: EstimateStatus = estimate.status;
  if (anyApproved && !anyDeclined && !anyPending) {
    newStatus = 'APPROVED';
  } else if (!anyApproved && anyDeclined && !anyPending) {
    newStatus = 'DECLINED';
  } else if (anyApproved && (anyDeclined || anyPending)) {
    newStatus = 'PARTIALLY_APPROVED';
  } else if (anyDeclined && anyPending) {
    newStatus = 'VIEWED';
  }

  estimate.items = updatedItems;
  estimate.status = newStatus;
  estimate.approved_total = approvedSum;
  estimate.declined_total = declinedSum;
  if (customerNotes) estimate.customer_notes = customerNotes;
  estimate.updated_at = new Date().toISOString();

  // Log timeline event
  estimate.timeline = estimate.timeline || [];
  estimate.timeline.push({
    id: `et-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: `${estimate.customer_name} (Customer)`,
    event:
      newStatus === 'APPROVED'
        ? 'Estimate Fully Approved by Customer'
        : newStatus === 'PARTIALLY_APPROVED'
        ? 'Customer Partially Approved Scope'
        : 'Customer Declined Estimate',
    notes: `Approved value: ₹${approvedSum.toLocaleString()}, Declined value: ₹${declinedSum.toLocaleString()}`,
  });

  saveEstimate(estimate);

  // Sync to Job Card
  const job = getJobById(estimate.job_id);
  if (job) {
    if (newStatus === 'APPROVED' || newStatus === 'PARTIALLY_APPROVED') {
      job.approval_status = 'APPROVED';
      if (job.status === 'ESTIMATE_SENT' || job.status === 'INSPECTION_COMPLETED') {
        updateJobStatus(
          job.id,
          'ESTIMATE_APPROVED',
          job.customer_name + ' (Customer)',
          `Customer approved scope on estimate ${estimate.estimate_number}`
        );
      } else {
        saveJob(job);
      }
    } else if (newStatus === 'DECLINED') {
      job.approval_status = 'DECLINED';
      saveJob(job);
    }
  }

  // CF-01: Auto-generate Follow-Up Reminder for Customer-Declined Estimate Scope
  const declinedItems = updatedItems.filter((i) => i.approval_status === 'DECLINED');
  if (declinedItems.length > 0) {
    const existingReminders = getReminders();
    // Deterministic deduplication: check if active reminder already exists for this source estimate
    const alreadyExists = existingReminders.some(
      (r) =>
        r.reminder_type === 'DECLINED_RECOMMENDATION' &&
        (r.source_estimate_id === estimate.id || r.source_estimate_number === estimate.estimate_number) &&
        r.status !== 'COMPLETED'
    );

    if (!alreadyExists) {
      const declinedSummaries = declinedItems.map((i) => i.description).join('; ');
      const dueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      createServiceReminder({
        customer_name: estimate.customer_name,
        customer_phone: estimate.customer_phone,
        vehicle_summary: estimate.vehicle_summary,
        registration: estimate.registration || (job ? job.registration : 'REG-UNSPECIFIED'),
        last_service_date: estimate.created_date || new Date().toISOString().split('T')[0],
        recommended_service: `Deferred: ${declinedItems[0].description}${declinedItems.length > 1 ? ` (+${declinedItems.length - 1} more)` : ''}`,
        due_date: dueDate,
        reminder_type: 'DECLINED_RECOMMENDATION',
        priority: 'HIGH',
        reason: `Deferred during ${estimate.estimate_number}`,
        advisor: estimate.advisor_name || (job ? job.advisor : 'Rohan Deshmukh'),
        source_estimate_id: estimate.id,
        source_estimate_number: estimate.estimate_number,
        source_finding_id: declinedItems[0].source_recommendation,
        source_recommendation: declinedSummaries,
        vehicle_id: estimate.vehicle_id || (job ? job.vehicle_id : undefined),
        customer_id: estimate.customer_id || (job ? job.customer_id : undefined),
        job_card_id: estimate.job_id,
        notes: `Customer deferred ${declinedItems.length} recommended scope item(s) on ${estimate.estimate_number} (Deferred Scope Value: ₹${declinedSum.toLocaleString('en-IN')}). Items: ${declinedSummaries}. Follow up with customer.`,
      });
    }
  }

  return { success: true, estimate };
}

// Authorize Approved Work $\rightarrow$ Transfers into Job Card Authorized Work Items
export function authorizeApprovedEstimateWork(
  estimateId: string,
  actor: string = 'Rohan Deshmukh (Advisor)'
): { success: boolean; estimate?: EstimateRecord; job?: JobCard } {
  const estimates = getEstimates();
  const estimate = Object.values(estimates).find((e) => e.id === estimateId || e.job_id === estimateId);
  if (!estimate) return { success: false };

  const job = getJobById(estimate.job_id);
  if (!job) return { success: false };

  const approvedItems = estimate.items.filter((i) => i.approval_status === 'APPROVED');
  if (approvedItems.length === 0) {
    return { success: false };
  }

  // Update estimate status to CONVERTED_TO_WORK
  estimate.status = 'CONVERTED_TO_WORK';
  estimate.authorized_at = new Date().toISOString();
  estimate.updated_at = new Date().toISOString();

  estimate.timeline = estimate.timeline || [];
  estimate.timeline.push({
    id: `et-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor,
    event: 'Approved Work Authorized for Workshop Execution',
    notes: `${approvedItems.length} approved line items transferred into Job Card ${job.id} work items.`,
  });
  saveEstimate(estimate);

  // Transfer approved items into JobCard.work_items
  const existingWorkItems = job.work_items || [];
  const newWorkItems: WorkItem[] = approvedItems.map((item, idx) => ({
    id: `wi-${Date.now()}-${idx}`,
    description: item.description,
    type: item.type === 'Labour' ? 'Labour' : item.type === 'Parts' ? 'Part' : 'Consumable',
    quantity: item.quantity,
    unit: item.unit || 'unit',
    estimated_amount: item.line_total,
    status: 'APPROVED',
  }));

  // Append new authorized items without duplication
  job.work_items = [...existingWorkItems, ...newWorkItems];
  job.approval_status = 'APPROVED';
  job.estimate_total = estimate.approved_total || estimate.total;

  // If job is waiting for approval or at inspection completed, advance to WORK_IN_PROGRESS or ESTIMATE_APPROVED
  if (job.status === 'ESTIMATE_SENT' || job.status === 'INSPECTION_COMPLETED') {
    updateJobStatus(
      job.id,
      'ESTIMATE_APPROVED',
      actor,
      `Work authorized from estimate ${estimate.estimate_number}. Staged for workshop execution.`
    );
  } else {
    saveJob(job);
  }

  return { success: true, estimate, job };
}

// Create Estimate Revision
export function createEstimateRevision(
  estimateId: string,
  reason: string,
  actor: string = 'Rohan Deshmukh (Advisor)'
): EstimateRecord | null {
  const estimates = getEstimates();
  const estimate = Object.values(estimates).find((e) => e.id === estimateId || e.job_id === estimateId);
  if (!estimate) return null;

  const currentRev = estimate.revision_number || 1;
  const nextRev = currentRev + 1;

  estimate.revisions = estimate.revisions || [];
  estimate.revisions.push({
    revision_number: nextRev,
    timestamp: new Date().toISOString(),
    total: estimate.total,
    reason,
    created_by: actor,
    approved_total: estimate.approved_total,
  });

  estimate.revision_number = nextRev;
  estimate.status = 'DRAFT'; // Returns to draft for modification
  estimate.updated_at = new Date().toISOString();

  estimate.timeline = estimate.timeline || [];
  estimate.timeline.push({
    id: `et-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor,
    event: `Revision ${nextRev} Created`,
    notes: reason,
  });

  saveEstimate(estimate);
  return estimate;
}

// Customer Approval on Quote Portal (Backward compatible wrapper)
export function approveEstimate(
  token: string,
  customerNotes?: string
): { success: boolean; estimate?: EstimateRecord } {
  const estimate = getEstimateByToken(token);
  if (!estimate) return { success: false };

  // Approve all items
  const decisions: Record<string, 'APPROVED'> = {};
  for (const item of estimate.items) {
    decisions[item.id] = 'APPROVED';
  }

  return recordEstimateDecisions(token, decisions, customerNotes);
}

export function declineEstimate(
  token: string,
  customerNotes?: string
): { success: boolean; estimate?: EstimateRecord } {
  const estimate = getEstimateByToken(token);
  if (!estimate) return { success: false };

  // Decline all items
  const decisions: Record<string, 'DECLINED'> = {};
  for (const item of estimate.items) {
    decisions[item.id] = 'DECLINED';
  }

  return recordEstimateDecisions(token, decisions, customerNotes);
}

// ============================================================
// TECHNICIANS & REMINDERS
// ============================================================

export function getTechnicians(): TechnicianRecord[] {
  return syncTechnicianWorkloads();
}

export function saveTechnician(tech: TechnicianRecord): void {
  const current = getTechnicians();
  const idx = current.findIndex((t) => t.id === tech.id);
  if (idx >= 0) {
    current[idx] = tech;
  } else {
    current.push(tech);
  }
  saveToStorage(TECHNICIANS_KEY, current);
}

export function getReminders(): ServiceReminder[] {
  return loadFromStorage<ServiceReminder[]>(REMINDERS_KEY, SEED_REMINDERS);
}

export function createServiceReminder(params: {
  customer_name: string;
  customer_phone: string;
  vehicle_summary: string;
  registration: string;
  last_service_date: string;
  recommended_service: string;
  due_date: string;
  notes?: string;
  vehicle_id?: string;
  customer_id?: string;
  job_card_id?: string;
  reminder_type?: any;
  priority?: any;
  reason?: string;
  advisor?: string;
  source_estimate_id?: string;
  source_estimate_number?: string;
  source_finding_id?: string;
  source_recommendation?: string;
}): ServiceReminder {
  const current = getReminders();
  const newReminder: ServiceReminder = {
    id: `rem-${Date.now()}`,
    customer_name: params.customer_name,
    customer_phone: params.customer_phone,
    vehicle_summary: params.vehicle_summary,
    registration: params.registration,
    last_service_date: params.last_service_date,
    recommended_service: params.recommended_service,
    due_date: params.due_date,
    status: 'UPCOMING',
    notes: params.notes || 'Created from Service History milestone',
    vehicle_id: params.vehicle_id,
    customer_id: params.customer_id,
    job_card_id: params.job_card_id,
    reminder_type: params.reminder_type || 'SERVICE_DUE',
    priority: params.priority || 'NORMAL',
    reason: params.reason || params.recommended_service,
    advisor: params.advisor || 'Rohan Deshmukh',
    source_estimate_id: params.source_estimate_id,
    source_estimate_number: params.source_estimate_number,
    source_finding_id: params.source_finding_id,
    source_recommendation: params.source_recommendation,
  };
  current.unshift(newReminder);
  saveToStorage(REMINDERS_KEY, current);
  return newReminder;
}

export function saveReminder(reminder: ServiceReminder): void {
  const current = getReminders();
  const idx = current.findIndex((r) => r.id === reminder.id);
  if (idx >= 0) {
    current[idx] = reminder;
  } else {
    current.unshift(reminder);
  }
  saveToStorage(REMINDERS_KEY, current);
}

export function updateReminderStatus(id: string, status: any): void {
  const current = getReminders();
  const rem = current.find((r) => r.id === id);
  if (rem) {
    rem.status = status;
    saveToStorage(REMINDERS_KEY, current);
  }
}

// ============================================================
// BACKWARD COMPATIBILITY ADAPTERS
// ============================================================

export function getStoredQuotes(): Record<string, any> {
  const estimates = getEstimates();
  const res: Record<string, any> = {};
  Object.values(estimates).forEach((e) => {
    res[e.public_token] = {
      id: e.id,
      quote_number: e.estimate_number,
      customer_name: e.customer_name,
      customer_phone: e.customer_phone,
      vehicle_summary: e.vehicle_summary,
      status: e.status === 'APPROVED' ? 'approved' : e.status === 'DECLINED' ? 'declined' : 'sent',
      items: e.items.map((i) => ({
        id: i.id,
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unit_price,
        line_total: i.line_total,
        display_order: i.display_order,
      })),
      subtotal: e.subtotal,
      total: e.total,
      notes: e.notes,
      public_token: e.public_token,
      expires_at: e.validity_date,
      created_at: e.created_date,
    };
  });
  return res;
}

export function getStoredQuoteByToken(token: string): any | null {
  const quotes = getStoredQuotes();
  return quotes[token] || null;
}

export function saveQuote(quote: any): void {
  const estimates = getEstimates();
  const found = Object.values(estimates).find((e) => e.public_token === quote.public_token);
  if (found) {
    if (quote.status === 'approved' || quote.status === 'approval_requested') {
      approveEstimate(quote.public_token, quote.notes);
    } else if (quote.status === 'declined') {
      declineEstimate(quote.public_token, quote.notes);
    }
  }
}

export function getStoredJobs(): Record<string, any> {
  const jobs = getJobs();
  const res: Record<string, any> = {};
  Object.values(jobs).forEach((j) => {
    res[j.public_token] = {
      id: j.id,
      job_number: j.id,
      customer_name: j.customer_name,
      vehicle_summary: j.vehicle_summary,
      current_status: j.status.toLowerCase(),
      status_updated_at: j.timeline[j.timeline.length - 1]?.timestamp || j.opened_at,
      customer_notes: j.work_notes || j.customer_complaint,
      public_token: j.public_token,
      history: j.timeline.map((t) => ({
        from_status: null,
        to_status: t.status.toLowerCase(),
        timestamp: t.timestamp,
        note: t.event_label,
      })),
    };
  });
  return res;
}

export function getStoredJobByToken(token: string): any | null {
  const jobs = getStoredJobs();
  return jobs[token] || null;
}

// ============================================================
// SYSTEM V4.0: TEAM MEMBERS, WORKSHOP PROFILE & AUDIT LOGS
// ============================================================

const TEAM_MEMBERS_KEY = 'te_workshop_team_members_v4';
const WORKSHOP_PROFILE_KEY = 'te_workshop_profile_v4';

export const SEED_TEAM_MEMBERS: TeamMemberRecord[] = [
  {
    id: 'team-1',
    name: 'Rohan Deshmukh',
    email: 'rohan.deshmukh@torqueexperts.in',
    phone: '+91 98765 22001',
    role: 'SERVICE_ADVISOR',
    role_display: 'Service Advisor',
    specialization: 'German Marques Specialist & Customer Relations',
    status: 'ACTIVE',
    access_level: 'Operational Staff (Intake, Estimations, Handover)',
    last_active: '2026-09-21T19:40:00Z',
    created_at: '2024-01-15T09:00:00Z',
  },
  {
    id: 'team-2',
    name: 'Pooja Varma',
    email: 'pooja.varma@torqueexperts.in',
    phone: '+91 98765 22002',
    role: 'SERVICE_ADVISOR',
    role_display: 'Service Advisor',
    specialization: 'Customer Intake & Digital Estimations Specialist',
    status: 'ACTIVE',
    access_level: 'Operational Staff (Intake, Estimations, Handover)',
    last_active: '2026-09-21T18:15:00Z',
    created_at: '2024-03-01T09:00:00Z',
  },
  {
    id: 'team-3',
    name: 'Arjun Sharma',
    email: 'arjun.sharma@torqueexperts.in',
    phone: '+91 98765 11001',
    role: 'TECHNICIAN',
    role_display: 'Technician',
    specialization: 'German Drivetrain & Diagnostics',
    technician_id: 'tech-1',
    status: 'ACTIVE',
    assigned_job_ids: ['JC-2047', 'JC-2049'],
    access_level: 'Technical Execution (Inspections, Work Items, QC)',
    last_active: '2026-09-21T19:10:00Z',
    created_at: '2023-11-10T09:00:00Z',
  },
  {
    id: 'team-4',
    name: 'Rahul Sen',
    email: 'rahul.sen@torqueexperts.in',
    phone: '+91 98765 11002',
    role: 'TECHNICIAN',
    role_display: 'Technician',
    specialization: 'Electronics & Suspension Systems',
    technician_id: 'tech-2',
    status: 'ACTIVE',
    assigned_job_ids: ['JC-2048'],
    access_level: 'Technical Execution (Inspections, Work Items, QC)',
    last_active: '2026-09-21T17:45:00Z',
    created_at: '2024-02-20T09:00:00Z',
  },
  {
    id: 'team-5',
    name: 'Vikram Singh',
    email: 'vikram.singh@torqueexperts.in',
    phone: '+91 98765 11003',
    role: 'TECHNICIAN',
    role_display: 'Technician',
    specialization: 'Periodic Maintenance & Brake Overhauls',
    technician_id: 'tech-3',
    status: 'ACTIVE',
    assigned_job_ids: [],
    access_level: 'Technical Execution (Inspections, Work Items, QC)',
    last_active: '2026-09-21T16:30:00Z',
    created_at: '2024-04-12T09:00:00Z',
  },
  {
    id: 'team-6',
    name: 'Farhan Akhtar',
    email: 'farhan.akhtar@torqueexperts.in',
    phone: '+91 98765 11004',
    role: 'TECHNICIAN',
    role_display: 'Technician',
    specialization: 'AC & Thermal Management',
    technician_id: 'tech-4',
    status: 'ACTIVE',
    assigned_job_ids: [],
    access_level: 'Technical Execution (Inspections, Work Items, QC)',
    last_active: '2026-09-21T15:20:00Z',
    created_at: '2024-05-18T09:00:00Z',
  },
];

export const SEED_WORKSHOP_PROFILE: WorkshopProfileConfig = {
  name: "Torque Expert's Workshop",
  business_address: 'Plot 42, Central Auto Hub, Phase II, Industrial Estate, Mumbai 400072',
  phone: '+91 98765 43210',
  email: 'service@torqueexperts.in',
  default_currency: 'INR (₹)',
  timezone: 'Asia/Kolkata (IST +05:30)',
  bays_count: 4,
  operating_hours: [
    { day: 'Monday', status: 'OPEN', open_time: '08:00', close_time: '20:00' },
    { day: 'Tuesday', status: 'OPEN', open_time: '08:00', close_time: '20:00' },
    { day: 'Wednesday', status: 'OPEN', open_time: '08:00', close_time: '20:00' },
    { day: 'Thursday', status: 'OPEN', open_time: '08:00', close_time: '20:00' },
    { day: 'Friday', status: 'OPEN', open_time: '08:00', close_time: '20:00' },
    { day: 'Saturday', status: 'OPEN', open_time: '08:00', close_time: '20:00' },
    { day: 'Sunday', status: 'CLOSED', open_time: '08:00', close_time: '20:00' },
  ],
};

export function getTeamMembers(): TeamMemberRecord[] {
  return loadFromStorage<TeamMemberRecord[]>(TEAM_MEMBERS_KEY, SEED_TEAM_MEMBERS);
}

export function saveTeamMember(member: TeamMemberRecord): void {
  const members = getTeamMembers();
  const index = members.findIndex((m) => m.id === member.id);
  if (index >= 0) {
    members[index] = member;
  } else {
    members.unshift(member);
  }
  saveToStorage(TEAM_MEMBERS_KEY, members);
}

export function getWorkshopProfile(): WorkshopProfileConfig {
  return loadFromStorage<WorkshopProfileConfig>(WORKSHOP_PROFILE_KEY, SEED_WORKSHOP_PROFILE);
}

export function saveWorkshopProfile(profile: WorkshopProfileConfig): void {
  saveToStorage(WORKSHOP_PROFILE_KEY, profile);
}

export function getSystemAuditEvents(): SystemAuditEvent[] {
  const events: SystemAuditEvent[] = [];

  // 1. From Job Cards timeline
  const jobs = getJobs();
  Object.values(jobs).forEach((j) => {
    (j.timeline || []).forEach((t) => {
      events.push({
        id: `aud-job-${t.id}`,
        timestamp: t.timestamp,
        actor: t.actor || 'System',
        role: t.actor?.includes('Advisor')
          ? 'SERVICE_ADVISOR'
          : t.actor?.includes('Tech')
          ? 'TECHNICIAN'
          : t.actor?.includes('Customer')
          ? 'CUSTOMER'
          : 'STAFF',
        module: 'JOBS',
        action: t.event_label,
        record_id: j.id,
        change_summary: `${j.registration} (${j.vehicle_summary}) · Status: ${t.status}${t.notes ? ` · Note: ${t.notes}` : ''}`,
      });
    });
  });

  // 2. From Estimates timeline
  const estimates = getEstimates();
  Object.values(estimates).forEach((e) => {
    (e.timeline || []).forEach((t) => {
      events.push({
        id: `aud-est-${t.id}`,
        timestamp: t.timestamp,
        actor: t.actor || 'System',
        role: t.actor?.includes('Advisor')
          ? 'SERVICE_ADVISOR'
          : t.actor?.includes('Customer')
          ? 'CUSTOMER'
          : 'STAFF',
        module: 'ESTIMATES',
        action: t.event,
        record_id: e.estimate_number || e.id,
        change_summary: `${e.registration || e.vehicle_summary} · Total: ₹${e.total.toLocaleString('en-IN')}${t.notes ? ` · Note: ${t.notes}` : ''}`,
      });
    });
  });

  // 3. From Inspections timeline
  const inspections = getInspections();
  Object.values(inspections).forEach((insp) => {
    (insp.timeline || []).forEach((t) => {
      events.push({
        id: `aud-insp-${t.id}`,
        timestamp: t.timestamp,
        actor: t.actor || insp.inspector_name || 'Inspector',
        role: 'TECHNICIAN',
        module: 'INSPECTIONS',
        action: t.event,
        record_id: insp.id,
        change_summary: `${insp.registration || insp.vehicle_summary} · Findings: ${insp.findings.length}${t.notes ? ` · Note: ${t.notes}` : ''}`,
      });
    });
  });

  // 4. From Leads timeline
  const leads = getLeads();
  leads.forEach((l) => {
    (l.timeline || []).forEach((t) => {
      events.push({
        id: `aud-lead-${t.id}`,
        timestamp: t.timestamp,
        actor: t.actor || 'Online Intake',
        role: t.actor?.includes('Advisor') ? 'SERVICE_ADVISOR' : 'RECEPTION',
        module: 'LEADS',
        action: t.event,
        record_id: l.id,
        change_summary: `${l.customer_name} (${l.vehicle_summary}) · Source: ${l.source}${t.notes ? ` · Note: ${t.notes}` : ''}`,
      });
    });
  });

  // 5. From Appointments timeline
  const appointments = getAppointments();
  appointments.forEach((a) => {
    (a.timeline || []).forEach((t) => {
      events.push({
        id: `aud-appt-${t.id}`,
        timestamp: t.timestamp,
        actor: t.actor || 'Reception',
        role: t.actor?.includes('Advisor') ? 'SERVICE_ADVISOR' : 'RECEPTION',
        module: 'APPOINTMENTS',
        action: t.event,
        record_id: a.id,
        change_summary: `${a.customer_name} (${a.vehicle_summary}) · Slot: ${a.requested_date} ${a.requested_time}${t.notes ? ` · Note: ${t.notes}` : ''}`,
      });
    });
  });

  // Sort descending by timestamp
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Resets all demo store keys in localStorage back to canonical seed states.
 * Safely restores demo data without modifying source files or server configuration.
 */
export function resetDemoData(): void {
  saveToStorage(JOBS_KEY, SEED_JOBS);
  saveToStorage(CUSTOMERS_KEY, SEED_CUSTOMERS);
  saveToStorage(VEHICLES_KEY, SEED_VEHICLES);
  saveToStorage(LEADS_KEY, SEED_LEADS);
  saveToStorage(APPOINTMENTS_KEY, SEED_APPOINTMENTS);
  saveToStorage(INSPECTIONS_KEY, SEED_INSPECTIONS);
  saveToStorage(ESTIMATES_KEY, SEED_ESTIMATES);
  saveToStorage(TECHNICIANS_KEY, SEED_TECHNICIANS);
  saveToStorage(REMINDERS_KEY, SEED_REMINDERS);
  saveToStorage(TEAM_MEMBERS_KEY, SEED_TEAM_MEMBERS);
  saveToStorage(WORKSHOP_PROFILE_KEY, SEED_WORKSHOP_PROFILE);
}

