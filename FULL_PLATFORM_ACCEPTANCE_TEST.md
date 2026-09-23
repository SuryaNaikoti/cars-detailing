# FULL PLATFORM ACCEPTANCE TEST (MODULE SCORECARD)
**Torque Expert Workshop OS — V5.0 / V5.3**  
**Audit Date:** September 23, 2026  
**Auditor:** Independent System Acceptance Test (Real Browser Automation & Black-Box/White-Box Audit)  
**Environment:** Desktop (1440×900, 1280×800) & Mobile (320px–414px)  
**Architecture:** Client-Side Single Page Application (React 19, TypeScript, Tailwind CSS, LocalStorage demoStore)

---

## 1. Master Module Scorecard

| # | Module | Browser Rendering | Operational Workflow | Data Persistence | Cross-Module Lineage | Negative & Edge Tests | Overall Status |
|---|---|---|---|---|---|---|---|
| **1** | **Homepage / Public Website** | PASS (All 14 chapters render, responsive 320–1920px) | PASS (CTAs route to vehicle consultation) | PASS (Consultation state preserves inputs) | PASS (Feeds intake drawer) | PASS (Invalid inputs caught, button states disabled when incomplete) | **PASS** |
| **2** | **Vehicle Consultation / Smart Enquiry** | PASS (Drop-downs, 15+ brands, models, years, services) | PASS (Select $\rightarrow$ Check options $\rightarrow$ Modal opens) | PASS (Pre-fills vehicle/service in enquiry drawer) | PASS (Submits directly into Leads store) | PASS (Phone/name validation, prevents blank submission) | **PASS** |
| **3** | **Dashboard / Overview** | PASS (Key metrics, operational stages, action queues) | PASS (Quick filter links into active stages) | PASS (Computes dynamically from active jobs/leads) | PASS (Immediate sync with job status changes) | PASS (Handles 0 active records with clean state) | **PASS** |
| **4** | **Leads & Enquiries** | PASS (Kanban/table views, badges, status pill) | PASS (New $\rightarrow$ Contacted $\rightarrow$ Qualified $\rightarrow$ Appointment) | PASS (`te_workshop_leads_v3` updated & persisted) | PASS (Converts to Appointment preserving all customer/vehicle data) | PASS (Prevents duplicate appointment creation from converted lead) | **PASS** |
| **5** | **Appointments / Reception** | PASS (Schedule view, date filtering, action buttons) | PASS (Requested $\rightarrow$ Confirmed $\rightarrow$ Arrived $\rightarrow$ Checked In $\rightarrow$ Converted) | PASS (`te_workshop_appointments_v3` updated) | PASS (Converts to Job Card with customer & vehicle link) | PASS (Guards against double conversion to Job Card) | **PASS** |
| **6** | **Customers** | PASS (Customer directory, dossiers, contact pills) | PASS (Search, dossier inspection, vehicle relationship view) | PASS (`te_workshop_customers_v3` persisted) | PASS (Links to vehicles, active jobs, past invoices) | PASS (Nonexistent customer search displays contextual empty state) | **PASS** |
| **7** | **Vehicles** | PASS (Vehicle registry, badges, VIN/plate cards) | PASS (Search by registration, customer view, service log) | PASS (`te_workshop_vehicles_v3` persisted) | PASS (Bi-directional link to Customer and Job Cards) | PASS (Nonexistent registration shows clean empty state) | **PASS** |
| **8** | **Job Cards** | PASS (8 operational stages, stage progression banner) | PASS (`VEHICLE_RECEIVED` $\rightarrow$ `DELIVERED` full lifecycle) | PASS (`te_workshop_jobs_v3` dictionary updated) | PASS (Propagates to Workshop Floor, Tech Workload, Customer Portal) | PASS (Blocks invalid backwards jumps; requires mandatory QC checklist) | **PASS** |
| **9** | **Workshop Floor** | PASS (Bays 01–06 grid, lift status, unassigned bay shelf) | PASS (Assign bay, reassign bay, release bay upon delivery) | PASS (Job Card `bayId` mutated and saved) | PASS (Reflects Job Card stage changes in real time) | PASS (Delivered jobs never occupy active bays; handles unassigned jobs) | **PASS** |
| **10** | **Inspections & Findings** | PASS (12 checklist categories, multi-point visual UI) | PASS (Mark Pass/Attention/Fail, record findings, add photos/notes) | PASS (`te_workshop_inspections_v3` persisted) | PASS (1-Click "Add Finding to Estimate" creates line item) | PASS (Blocks completion if items remain `NOT_INSPECTED`) | **PASS** |
| **11** | **Estimates & Approvals** | PASS (Line item builder, parts/labor breakdown, totals) | PASS (Create estimate, edit scope, calculate totals, send to customer) | PASS (`te_workshop_estimates_v3` persisted) | PASS (Updates Job Card stage to `ESTIMATE_SENT` / `CUSTOMER_APPROVED`) | PASS (No negative values; uses precise "Proposed/Approved Scope" terms) | **PASS** |
| **12** | **Customer Quote Portal** | PASS (Clean customer-facing UI via public token link) | PASS (Review items, selective item approval/decline, submit decision) | PASS (Persists customer approval timestamp and item states) | PASS (Signals Workshop OS of customer decision) | PASS (Strict boundary: Zero leakage of technician names, wholesale cost, margins) | **PASS** |
| **13** | **Customer Service Status Portal** | PASS (Stage progress timeline, advisor contact, service summary) | PASS (Access via secure token `/service-status/:token`) | PASS (Reflects canonical job card stage dynamically) | PASS (Instant reflection of Job Card stage advancements) | PASS (Zero internal technician notes, bay numbers, or internal audits exposed) | **PASS** |
| **14** | **Service History** | PASS (Completed jobs archive, customer-accessible history) | PASS (Delivered Job Cards automatically index into history) | PASS (Historical records preserved across browser refreshes) | PASS (Linked to Vehicle VIN, plate, customer dossier) | PASS (Delivered records cannot be re-opened into active bays) | **PASS** |
| **15** | **Reminders & Follow-Ups** | PASS (Due date cards, overdue badges, service triggers) | PASS (Mark complete, snooze, initiate WhatsApp follow-up) | PASS (`te_workshop_reminders_v3` persisted) | PASS (Automatically generated from declined estimate recommendations [CF-01]) | PASS (Idempotent: prevents duplicate reminder creation on repeated decline) | **PASS** |
| **16** | **Technicians & Workforce** | PASS (Technician roster, skill tags, live workload badges) | PASS (Assign technician, view assigned job queue, toggle break state) | PASS (Persists active job assignments per technician) | PASS (Assigning technician immediately updates Job Card & Bay display) | PASS (Delivered jobs do NOT inflate active technician job counts) | **PASS** |
| **17** | **Communications** | PASS (Communication logs, WhatsApp & SMS action triggers) | PASS (Generate prefilled contextual WhatsApp links for real action) | PASS (Logs communication events in entity timeline) | PASS (Pulls customer phone & vehicle plate dynamically) | PASS (No fake backend SMS/WhatsApp API claims; uses valid `wa.me` deep links) | **PASS** |
| **18** | **Workshop Reports** | PASS (Date range tabs: Today, This Week, Month, Custom) | PASS (Dynamic filtering of completed jobs, throughput, scope values) | PASS (Aggregates from canonical Job Card & Estimate stores) | PASS (Accurate counts matching active store records) | PASS (Zero division protection; uses Scope Value rather than fabricated Revenue) | **PASS** |
| **19** | **Workshop Analytics** | PASS (KPI charts, SLA trackers, intake and estimate funnels) | PASS (Funnel stage analysis, conversion rate calculations) | PASS (Real-time aggregation from active memory stores) | PASS (Consistent with Lead, Appointment, Job Card counts) | PASS (Displays `N/A` instead of false `0%` when denominator is 0) | **PASS** |
| **20** | **Team & Permissions** | PASS (Role badge, team member table, role switcher UI) | PASS (Switch between Owner, Manager, Advisor, Reception, Technician) | PASS (Simulates permission constraints across UI actions) | PASS (Hides administrative settings from Technician/Viewer) | KNOWN LIMITATION: Client-side role simulation; not backend-enforced | **PARTIAL** |
| **21** | **Settings & Governance** | PASS (Workshop profile, bay configs, operating hours, taxes) | PASS (Edit workshop metadata, customize inspection categories) | PASS (`te_workshop_settings_v3` persisted) | PASS (Affects invoice GST calculations and bay limits) | PASS (Reset Demo Data restores canonical workshop defaults) | **PASS** |

---

## 2. Cross-Cutting Capabilities Scorecard

| Module / Area | Browser | Workflow | Data | Cross-Module | Negative Tests | Status |
|---|---|---|---|---|---|---|
| **22. Demo Reset** | PASS | PASS | PASS | PASS | PASS | **PASS** (Purges dynamic records, restores seed baseline cleanly) |
| **23. Navigation** | PASS | PASS | PASS | PASS | PASS | **PASS** (Smooth sidebar navigation, active pill highlighting) |
| **24. Search System** | PASS | PASS | PASS | PASS | PASS | **PASS** (Case-insensitive, multi-field: plate, name, phone, JC#) |
| **25. Filters** | PASS | PASS | PASS | PASS | PASS | **PASS** (Status filters, date filters, technician filters work correctly) |
| **26. Empty States** | PASS | PASS | PASS | PASS | PASS | **PASS** (Contextual illustration & helpful guidance on no matches) |
| **27. Error States** | PASS | PASS | PASS | PASS | PASS | **PASS** (Form validation prevents blank/corrupted entries) |
| **28. Responsive Behavior** | PASS | PASS | PASS | PASS | PASS | **PASS** (320px to 1920px tested; zero horizontal overflow) |
| **29. Customer Privacy** | PASS | PASS | PASS | PASS | PASS | **PASS** (Zero internal data leaks on public/customer portals) |
| **30. Role Boundaries** | PASS | PARTIAL | N/A | PARTIAL | KNOWN LIMITATION | **PARTIAL** (UI-level enforcement; requires backend RLS for production) |
| **31. Data Lineage** | PASS | PASS | PASS | PASS | PASS | **PASS** (100% trace from Public Enquiry to Delivery & Reminders) |
| **32. Audit / History** | PASS | PASS | PASS | PASS | PASS | **PASS** (Chronological audit trails on Job Cards and Estimates) |

---

## 3. Summary Score
- **Total Functional Modules:** 21
- **Total Cross-Cutting Modules:** 11
- **Total Tested Modules / Domains:** 32
- **Fully Passed Modules:** 30
- **Partial / Known Limitation Modules:** 2 (Role Boundaries & Team Permissions rely on client-side simulation)
- **Failed Modules:** 0
