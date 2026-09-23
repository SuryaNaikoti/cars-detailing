import type { ServiceItem, VehicleOption, OfferItem, FaqItem, ReviewItem, Quote, ServiceJob } from '../types';

export const APPROVED_SERVICES: ServiceItem[] = [
  {
    id: 'periodic-service',
    name: 'Periodic Service',
    slug: 'periodic-service',
    short_description: 'Scheduled manufacturer-specified maintenance, fluid renewal, and comprehensive safety checks.',
    description: 'Routine maintenance engineered precisely to manufacturer specifications for German & luxury marques. Includes synthetic oil replacement, OEM filters, brake inspections, and electronic reset.',
    typical_symptoms: ['Service indicator on cluster', 'Mileage interval reached', 'Annual inspection due'],
    inclusions: ['OEM oil & filter renewal', 'Comprehensive multi-point inspection', 'Brake wear & rotor assessment', 'Fluid top-ups & cluster service reset'],
    active: true,
    display_order: 1,
  },
  {
    id: 'computer-diagnostics',
    name: 'Computer Diagnostics',
    slug: 'computer-diagnostics',
    short_description: 'Factory-grade ECU scanning, diagnostic fault isolation, and module parameter verification.',
    description: 'Specialist electronic diagnostic assessment using dedicated German marque diagnostic interfaces. Accurate isolation of electrical faults, check engine warnings, transmission lag, and control module errors.',
    typical_symptoms: ['Check engine light', 'Drivetrain malfunction warning', 'Rough idle / unexpected limp mode'],
    inclusions: ['Full control unit scan (DME/DDE/ECU)', 'Diagnostic parameter logging & verification', 'Stored fault code clearance & analysis', 'Diagnostic evaluation report'],
    active: true,
    display_order: 2,
  },
  {
    id: 'mechanical-repairs',
    name: 'Repairs & Mechanical',
    slug: 'mechanical-repairs',
    short_description: 'Precision engine, transmission, steering, and air suspension mechanical repairs.',
    description: 'Complex mechanical interventions executed with strict adherence to workshop service manuals. From cooling system overhauls and turbochargers to dynamic suspension refurbishment.',
    typical_symptoms: ['Knocking or vibration over bumps', 'Coolant or oil leak traces', 'Loss of propulsion power'],
    inclusions: ['Detailed component inspection', 'OEM replacement hardware', 'Torque-spec precision fastening', 'Post-repair road testing & validation'],
    active: true,
    display_order: 3,
  },
  {
    id: 'electrical-systems',
    name: 'Electrical Systems',
    slug: 'electrical-systems',
    short_description: 'Advanced troubleshooting of comfort electronics, battery management, and wiring harnesses.',
    description: 'Meticulous investigation of automotive electrical systems, parasitical battery drains, alternator performance, lighting modules, and auxiliary electronics.',
    typical_symptoms: ['Battery discharging overnight', 'Window regulator or sunroof failure', 'Instrument cluster flickering'],
    inclusions: ['Parasitic draw testing', 'CAN-bus communication test', 'Wiring harness integrity check', 'Module coding and synchronization'],
    active: true,
    display_order: 4,
  },
  {
    id: 'ac-cooling',
    name: 'AC & Cooling Systems',
    slug: 'ac-cooling',
    short_description: 'Climate control system vacuum leak test, compressor overhaul, and cooling efficiency audit.',
    description: 'Specialized thermal management service. German high-performance engines operate at elevated temperatures; we ensure radiators, thermostats, water pumps, and air conditioning condensers perform flawlessly.',
    typical_symptoms: ['Weak cabin cooling in heat', 'Engine temperature gauge creeping high', 'Unusual noise when AC is engaged'],
    inclusions: ['Refrigerant pressure & purity check', 'Evaporator & condenser decontamination', 'Thermostat & water pump test', 'Cabin microfilter replacement'],
    active: true,
    display_order: 5,
  },
  {
    id: 'precision-detailing',
    name: 'Precision Detailing',
    slug: 'precision-detailing',
    short_description: 'Paint correction, hydrophobic ceramic protection, and interior leather restoration.',
    description: 'Bespoke aesthetic preservation for luxury vehicles. Multi-stage machine paint correction to eliminate swirl marks, followed by durable ceramic coatings and pH-balanced leather conditioning.',
    typical_symptoms: ['Swirl marks under direct sunlight', 'Dull paint gloss', 'Soiled or dry leather upholstery'],
    inclusions: ['Multi-stage paint decontamination', 'Dual-action machine swirl correction', 'Hydrophobic paint sealant / coating', 'Deep interior extraction & leather feed'],
    active: true,
    display_order: 6,
  },
];

export const CURATED_VEHICLE_OPTIONS: VehicleOption[] = [
  {
    make: 'BMW',
    models: ['3 Series (G20/F30)', '5 Series (G30/F10)', '7 Series (G11/G70)', 'X3 / X5', 'M Performance Models'],
    years: [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015],
  },
  {
    make: 'Mercedes-Benz',
    models: ['A-Class / CLA', 'C-Class (W205/W206)', 'E-Class (W213)', 'S-Class (W222/W223)', 'GLC / GLE'],
    years: [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015],
  },
  {
    make: 'Audi',
    models: ['A4 / A5', 'A6 / A7', 'A8 L', 'Q3 / Q5 / Q7', 'RS / S Performance'],
    years: [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015],
  },
  {
    make: 'Porsche',
    models: ['Macan', 'Cayenne', 'Panamera', '911 Carrera', '718 Cayman/Boxster'],
    years: [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016],
  },
  {
    make: 'Volvo',
    models: ['XC40', 'XC60', 'XC90', 'S60 / S90'],
    years: [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017],
  },
  {
    make: 'Land Rover',
    models: ['Range Rover Evoque', 'Range Rover Velar', 'Range Rover Sport', 'Defender', 'Discovery'],
    years: [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017],
  },
];

export const SAMPLE_OFFER: OfferItem = {
  id: 'sample-luxury-inspection',
  title: 'Comprehensive Luxury Health Check & Periodic Care',
  price_label: '₹14,999',
  description: 'Illustrative promotion for demonstration purposes. Replace with verified workshop terms before launch.',
  inclusions: [
    '60-Point German Marque Mechanical & Electronic Inspection',
    'Full ECU Diagnostic Fault Scan & Report',
    'Brake System, Fluid & Suspension Geometry Check',
    'Cabin AC Performance Audit & Disinfection Treatment',
    'Engine Compartment Detail & Complimentary Wash',
  ],
  terms: 'Sample concept pricing. Valid for 4-cylinder and 6-cylinder petrol/diesel luxury vehicles. Appointment required.',
  is_sample: true,
};

export const APPROVED_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Workshop & Parts',
    question: 'Do you use genuine OEM parts for German and luxury vehicles?',
    answer: 'Yes. All replacement filters, fluids, suspension arms, brake components, and electronic modules are sourced either directly as OEM (Original Equipment Manufacturer) or authorized tier-1 equivalents matching factory specifications.',
  },
  {
    id: 'faq-2',
    category: 'Diagnostics',
    question: 'How does your computer diagnostics process work?',
    answer: 'We utilize dedicated manufacturer-specific diagnostic software rather than generic OBD scanners. This allows deep-level interrogation of vehicle control units, real-time live data capture, and definitive diagnosis without guesswork.',
  },
  {
    id: 'faq-3',
    category: 'Booking & Timing',
    question: 'Is an online booking request confirmed immediately?',
    answer: 'Online submissions are treated as requested preferences. Our service advisor reviews workshop bay capacity, contacts you promptly to confirm parts availability, and schedules the exact arrival time.',
  },
  {
    id: 'faq-4',
    category: 'Estimates & Quotes',
    question: 'Will I receive an itemized estimate before work begins?',
    answer: 'Always. Once physical inspection is concluded, you receive a digital, itemized quotation detailing parts, labor, and recommended priorities. Work proceeds only upon your explicit authorization.',
  },
  {
    id: 'faq-5',
    category: 'Service Tracking',
    question: 'Can I track my vehicle’s progress while in the workshop?',
    answer: 'Yes. Every active job is tracked through our 5-stage workshop lifecycle: Vehicle Received, Inspection Completed, Service In Progress, Quality Check, and Ready for Collection.',
  },
];

export const SAMPLE_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    name: 'Vikramaditya Rao',
    vehicle: 'BMW 530d M-Sport',
    content: 'The level of diagnostic clarity was exceptional. A recurring drivetrain warning that two other workshops misdiagnosed was isolated and solved within hours. Transparent communication throughout.',
    rating: 5,
    source: 'Verified Customer Feedback (Sample)',
    is_sample: true,
  },
  {
    id: 'rev-2',
    name: 'Ananya Deshmukh',
    vehicle: 'Mercedes-Benz E-Class',
    content: 'Periodic maintenance was handled with absolute precision. OEM filters, transparent quotation before starting, and the car was returned immaculately detailed. Highly recommended for German car owners.',
    rating: 5,
    source: 'Verified Customer Feedback (Sample)',
    is_sample: true,
  },
  {
    id: 'rev-3',
    name: 'Karan Singhania',
    vehicle: 'Porsche Macan',
    content: 'Rare to find technicians who genuinely understand high-performance suspension and thermal systems. The digital status updates kept me informed every step of the way.',
    rating: 5,
    source: 'Verified Customer Feedback (Sample)',
    is_sample: true,
  },
];

export const DEMO_QUOTES: Record<string, Quote> = {
  'demo-quote-bmw': {
    id: 'quote-001',
    estimate_number: 'TE-Q-2026-089',
    job_id: 'JC-2047',
    customer_name: 'Rahul Mehta',
    customer_phone: '+91 98765 43210',
    vehicle_summary: '2022 BMW 5 Series (G30)',
    created_date: '2026-09-18',
    validity_date: '2026-10-01',
    labour_total: 1500,
    parts_total: 5500,
    status: 'VIEWED',
    items: [
      { id: '1', description: 'Comprehensive Computer Diagnostic & Fault Scan', type: 'Labour', quantity: 1, unit_price: 1500, line_total: 1500, display_order: 1 },
      { id: '2', description: 'Synthetic Engine Oil & OEM Filter Service', type: 'Parts', quantity: 1, unit_price: 4500, line_total: 4500, display_order: 2 },
      { id: '3', description: 'Consumables, Cleaner & Electrical Contact Spray', type: 'Consumables', quantity: 1, unit_price: 1000, line_total: 1000, display_order: 3 },
    ],
    subtotal: 7000,
    total: 7000,
    notes: 'Illustrative sample quotation. Parts subject to physical inspection verification.',
    public_token: 'demo-quote-bmw',
  },
};

export const DEMO_SERVICE_JOBS: Record<string, ServiceJob> = {
  'demo-job-mercedes': {
    id: 'job-001',
    job_number: 'TE-JOB-4412',
    customer_name: 'Rahul Mehta',
    vehicle_summary: '2021 Mercedes-Benz C-Class (W205)',
    current_status: 'service_in_progress',
    status_updated_at: '2026-09-18T14:30:00Z',
    customer_notes: 'Brake pad renewal and front sensor recalibration currently underway in Bay 2.',
    public_token: 'demo-job-mercedes',
    history: [
      { from_status: null, to_status: 'vehicle_received', timestamp: '2026-09-18T09:15:00Z', note: 'Vehicle received at workshop intake' },
      { from_status: 'vehicle_received', to_status: 'inspection_completed', timestamp: '2026-09-18T11:30:00Z', note: 'Initial diagnostic scan and physical health check finished' },
      { from_status: 'inspection_completed', to_status: 'service_in_progress', timestamp: '2026-09-18T14:30:00Z', note: 'Approved mechanical repairs commenced' },
    ],
  },
};
