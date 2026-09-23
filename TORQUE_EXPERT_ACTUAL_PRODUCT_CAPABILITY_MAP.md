# TORQUE EXPERT ACTUAL PRODUCT CAPABILITY MAP
**Torque Expert Workshop OS — V5.0 / V5.3**  
**Audit Date:** September 23, 2026  
**Auditor:** Independent System Acceptance Test (Real Browser Automation & Black-Box/White-Box Audit)

This capability map documents ONLY what was genuinely verified in the running application in the browser. It excludes aspirational marketing claims and distinguishes between fully implemented functionality, partial implementations, client-side simulations, and out-of-scope items.

---

## Capability Status Legend
- **IMPLEMENTED + VERIFIED:** Fully functional in UI, state management, and cross-module workflows. Verified in browser.
- **IMPLEMENTED + PARTIAL:** Feature works operationally, but relies on client-side simulation or has minor operational limits.
- **UI ONLY:** Visual interface exists, but actions do not persist or connect to underlying stores.
- **NOT IMPLEMENTED:** Planned feature not present in current release.
- **OUT OF SCOPE:** Intentionally excluded from current client OS scope.
- **KNOWN LIMITATION:** Intentional architectural constraint (e.g. browser localStorage).

---

## Detailed Domain Capability Mapping

### A. Public Customer Experience
| Feature / Capability | Operational Reality | Status |
|---|---|---|
| **14-Chapter Editorial Homepage** | Fully responsive from 320px to 1920px; renders brand pillars, services, testimonials, process, FAQ, and footer. | **IMPLEMENTED + VERIFIED** |
| **Interactive Vehicle Consultation** | 15+ automotive makes with dependent model lookups, manufacturing years, and 8 service packages. | **IMPLEMENTED + VERIFIED** |
| **Smart Enquiry Drawer** | Pre-fills vehicle & service; validates customer name & phone; submits directly into workshop intake. | **IMPLEMENTED + VERIFIED** |
| **Interactive Service Cards** | Clicking service card pre-selects service requirement in consultation drawer. | **IMPLEMENTED + VERIFIED** |
| **Customer Experience Testimonials** | Testimonial carousel renders real customer case studies with verifiable service references. | **IMPLEMENTED + VERIFIED** |
| **Location & Contact Actions** | Renders workshop address, interactive Google Maps link, phone call, and direct WhatsApp enquiry. | **IMPLEMENTED + VERIFIED** |

### B. Customer Intake & Reception
| Feature / Capability | Operational Reality | Status |
|---|---|---|
| **Lead Inbox & Status Machine** | Records `NEW`, `CONTACTED`, `QUALIFIED`, `LOST` with source attribution and search. | **IMPLEMENTED + VERIFIED** |
| **Appointment Scheduler** | Displays daily/weekly appointments; tracks `REQUESTED`, `CONFIRMED`, `ARRIVED`, `CANCELLED`. | **IMPLEMENTED + VERIFIED** |
| **Reception Check-In Flow** | Records arrival timestamp, odometer mileage, fuel level (1/4, 1/2, 3/4, Full), customer notes. | **IMPLEMENTED + VERIFIED** |
| **1-Click Job Card Conversion** | Converts checked-in appointment to active Job Card, generating secure tracking token. | **IMPLEMENTED + VERIFIED** |
| **Duplicate Intake Prevention** | Prevents multiple Job Cards from being generated from a single appointment. | **IMPLEMENTED + VERIFIED** |

### C. Workshop Operations & Floor Management
| Feature / Capability | Operational Reality | Status |
|---|---|---|
| **Visual Bay Allocation (Bays 01–06)** | Grid displays active vehicle, job card number, assigned technician, and current stage. | **IMPLEMENTED + VERIFIED** |
| **Bay Reassignment** | Moving Job Card updates bay occupancy immediately without page reload. | **IMPLEMENTED + VERIFIED** |
| **Unassigned Jobs Holding Shelf** | Clearly separates active jobs waiting for bay allocation from occupied bays. | **IMPLEMENTED + VERIFIED** |
| **Bay Release on Delivery** | Delivering a Job Card automatically frees the assigned bay to `EMPTY`. | **IMPLEMENTED + VERIFIED** |
| **Multi-Bay Capacity Warnings** | Prevents allocating more than 1 active vehicle to a single bay. | **IMPLEMENTED + VERIFIED** |

### D. Technician Operations & Workforce
| Feature / Capability | Operational Reality | Status |
|---|---|---|
| **Technician Roster & Dossiers** | Tracks master technicians, specialists, certifications, and operational status. | **IMPLEMENTED + VERIFIED** |
| **Live Workload Tracking** | Computes active jobs assigned per technician dynamically; updates upon assignment/delivery. | **IMPLEMENTED + VERIFIED** |
| **Technician Break States** | Allows setting technician status to `AVAILABLE` or `ON_BREAK`. | **IMPLEMENTED + VERIFIED** |
| **Technician Job Filtering** | Filter workshop floor and job queues by specific assigned technician. | **IMPLEMENTED + VERIFIED** |

### E. Digital Multi-Point Inspection
| Feature / Capability | Operational Reality | Status |
|---|---|---|
| **12-Category Inspection Protocol** | Engine, Transmission, Brakes, Suspension, Steering, Electrical, Exhaust, Cooling, Tires, Body, Interior, Safety. | **IMPLEMENTED + VERIFIED** |
| **Multi-Point Status Toggles** | Marks items as `NOT_INSPECTED`, `PASS`, `ATTENTION`, or `FAIL`. | **IMPLEMENTED + VERIFIED** |
| **Finding Documentation** | Records severity, defect description, photo reference, recommended corrective action. | **IMPLEMENTED + VERIFIED** |
| **Mandatory Inspection Guard** | Strictly blocks completing inspection if any category remains `NOT_INSPECTED`. | **IMPLEMENTED + VERIFIED** |
| **1-Click Scope Transfer** | "Add Finding to Estimate" button instantly generates estimate line item with category link. | **IMPLEMENTED + VERIFIED** |

### F. Estimation & Scope Calculation
| Feature / Capability | Operational Reality | Status |
|---|---|---|
| **Parts & Labor Line Builder** | Adds custom parts and labor hours with discrete price points and tax calculations. | **IMPLEMENTED + VERIFIED** |
| **Accurate Scope Terminology** | Correctly displays "Proposed Scope", "Approved Scope", and "Declined Scope" (no fabricated margin/revenue claims). | **IMPLEMENTED + VERIFIED** |
| **Estimate Versioning & Audit** | Logs estimate creation, scope changes, and transmission timestamps in Job Card timeline. | **IMPLEMENTED + VERIFIED** |
| **Estimate Status Progression** | Moves from `DRAFT` $\rightarrow$ `SENT` $\rightarrow$ `APPROVED` / `PARTIALLY_APPROVED` / `DECLINED`. | **IMPLEMENTED + VERIFIED** |

### G. Customer Quote & Approval Portal
| Feature / Capability | Operational Reality | Status |
|---|---|---|
| **Tokenized Quote Access** | Customer opens quote via secure token URL (`/quote/:token`) without workshop password. | **IMPLEMENTED + VERIFIED** |
| **Granular Line Approval** | Customer can approve or decline individual service recommendations with checkboxes. | **IMPLEMENTED + VERIFIED** |
| **Customer Note Attachment** | Customer can enter notes (e.g. reasons for declining) before submitting decision. | **IMPLEMENTED + VERIFIED** |
| **Strict Privacy Boundary** | Zero exposure of technician names, internal notes, wholesale costs, margins, or bay IDs. | **IMPLEMENTED + VERIFIED** |
| **CF-01 Decline Remediation** | Declining a recommendation automatically triggers an idempotent Service Reminder. | **IMPLEMENTED + VERIFIED** |

### H. Workshop Execution & Quality Control
| Feature / Capability | Operational Reality | Status |
|---|---|---|
| **8-Stage Operational Lifecycle** | `VEHICLE_RECEIVED` $\rightarrow$ `INSPECTION` $\rightarrow$ `ESTIMATE_SENT` $\rightarrow$ `CUSTOMER_APPROVED` $\rightarrow$ `WORK_IN_PROGRESS` $\rightarrow$ `QUALITY_CHECK` $\rightarrow$ `READY_FOR_COLLECTION` $\rightarrow$ `DELIVERED`. | **IMPLEMENTED + VERIFIED** |
| **Mandatory QC Checklist** | Pre-delivery quality checklist required before vehicle can be marked ready for collection. | **IMPLEMENTED + VERIFIED** |
| **Stage Progression Validation** | Blocks arbitrary status jumps; prevents moving backwards without explicit confirmation. | **IMPLEMENTED + VERIFIED** |
| **Operational Timeline Audit** | Chronological audit trail stamped with timestamp and active staff role for every stage transition. | **IMPLEMENTED + VERIFIED** |

### I. Customer Service Status Portal
| Feature / Capability | Operational Reality | Status |
|---|---|---|
| **Public Tracking Portal** | Dedicated tracking link (`/service-status/:token`) displays active stage timeline. | **IMPLEMENTED + VERIFIED** |
| **Service Progress Representation** | Visual progress bar maps current Job Card stage into clear customer language. | **IMPLEMENTED + VERIFIED** |
| **Direct Advisor Contact** | Renders assigned service advisor's name and direct contact action. | **IMPLEMENTED + VERIFIED** |
| **Zero Data Leakage** | Verified 0 leaks of internal technician notes, cost breakdowns, or other customers. | **IMPLEMENTED + VERIFIED** |

### J. Vehicle Handover & Service History
| Feature / Capability | Operational Reality | Status |
|---|---|---|
| **Delivery Confirmation Modal** | Requires advisor confirmation of vehicle handover and gate release. | **IMPLEMENTED + VERIFIED** |
| **Automated Resource Release** | Delivery frees bay and technician workload immediately upon completion. | **IMPLEMENTED + VERIFIED** |
| **Permanent Service History Archive** | Delivered jobs automatically index into searchable Vehicle Service History database. | **IMPLEMENTED + VERIFIED** |
| **Historical Invoice Breakdown** | Past records preserve exact lines, parts replaced, total scope, and odometer reading. | **IMPLEMENTED + VERIFIED** |

### K. Reminders & Retention Management
| Feature / Capability | Operational Reality | Status |
|---|---|---|
| **Service Reminder Dashboard** | Categorizes reminders by `OVERDUE`, `DUE_SOON`, and `FUTURE`. | **IMPLEMENTED + VERIFIED** |
| **Declined Recommendation Triggers** | Automatically creates follow-ups for customer-declined estimate items (CF-01). | **IMPLEMENTED + VERIFIED** |
| **1-Click WhatsApp Follow-Up** | Generates prefilled `wa.me` contextual deep link with customer name and deferred service. | **IMPLEMENTED + VERIFIED** |
| **Reminder Lifecycle** | Reminders can be marked `COMPLETED` or `SNOOZED`; completed reminders leave active queue. | **IMPLEMENTED + VERIFIED** |

### L. Reporting & Analytics
| Feature / Capability | Operational Reality | Status |
|---|---|---|
| **Date Range Presets** | Filters by Today, Yesterday, This Week, Last Week, This Month, Last 30 Days, Custom Range. | **IMPLEMENTED + VERIFIED** |
| **Operational KPIs** | Jobs Opened, Completed, Delivered, Ready, Overdue SLA, Estimates Created, Approved Scope. | **IMPLEMENTED + VERIFIED** |
| **Division-by-Zero Safety** | Displays `N/A` instead of false `0%` when denominator is zero. | **IMPLEMENTED + VERIFIED** |
| **Intake & Estimate Funnels** | Visual funnel analysis of lead-to-job conversion and quote-to-approval rate. | **IMPLEMENTED + VERIFIED** |

### M. Governance, Team & Data Persistence
| Feature / Capability | Operational Reality | Status |
|---|---|---|
| **Role-Based UI Simulation** | Role switcher toggles Owner, Manager, Advisor, Reception, Tech, Viewer views. | **IMPLEMENTED + PARTIAL** (Client simulation) |
| **Workshop Settings** | Configures workshop profile, operating hours, GST rate, and bay names. | **IMPLEMENTED + VERIFIED** |
| **Reset Demo Data Action** | Restores clean canonical seed data across all modules with 1 click. | **IMPLEMENTED + VERIFIED** |
| **Browser Storage Persistence** | State stored in `localStorage` via `demoStore.ts`; survives page reloads. | **KNOWN LIMITATION** (Demo storage) |
| **Multi-User Backend / RLS** | Server-side PostgreSQL database with authenticated multi-user concurrency. | **OUT OF SCOPE** (Current demo phase) |
| **Online Payment Gateway** | Automated Razorpay/Stripe checkout webhook capture. | **OUT OF SCOPE** (Planned future phase) |
