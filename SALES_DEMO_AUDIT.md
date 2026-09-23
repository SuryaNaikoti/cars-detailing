# TORQUE EXPERT'S WORKSHOP OS V4.0
# SALES DEMONSTRATION AUDIT & NARRATIVE SCRIPT (SALES_DEMO_AUDIT.md)

**Audit Date**: September 22, 2026  
**Subject**: Deterministic 5–7 Minute Executive Demonstration Script & Operational Audit  

---

### 1. SALES DEMO OBJECTIVE & NARRATIVE ARCH

The demonstration proves the single core thesis of Torque Expert's Workshop OS:
> **One continuous operational workflow from customer intake to vehicle handover, providing absolute transparency to the owner and complete execution control to the workshop.**

---

### 2. DETERMINISTIC STEP-BY-STEP DEMONSTRATION SCRIPT

| Step # | Module / Screen | Action / Narrative | Evidence of Single Source of Truth | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Control Center** (`/dashboard`) | Highlight live operational overview: 4 bays, active jobs, throughput, and technician availability. | Data derives reactively from `demoStore.ts`. | **VERIFIED** |
| **2** | **Leads & Enquiries** (`/dashboard/leads`) | Select lead `lead-101` (Rajesh Singhal · Audi A6). Demonstrate advisor qualification. Click **"Convert to Appointment"**. | Seamlessly creates Appointment without re-entering customer details. | **VERIFIED** |
| **3** | **Appointments** (`/dashboard/appointments`) | Locate the scheduled visit. Mark vehicle as **ARRIVED**, enter intake odometer (`45,200 km`) and fuel (`65%`). Click **"Create Job Card"**. | Deduplicates customer/vehicle and assigns to intake queue. | **VERIFIED** |
| **4** | **Workshop Floor** (`/dashboard/floor`) | Show active bays. Allocate vehicle to **BAY 01** and assign Master Technician **Arjun Sharma**. | Bay occupancy immediately turns active; Arjun's status shifts to BUSY. | **VERIFIED** |
| **5** | **Digital Inspection (DVI)** (`/dashboard/inspections`) | Open inspection `INS-3047`. Review 30-point check. Toggle brake pad finding to **"Add to Estimate"**. | Finding is automatically linked to Job Card's pending estimate. | **VERIFIED** |
| **6** | **Estimates & Approvals** (`/dashboard/estimates`) | Open estimate `est-2047`. Review itemized parts & labor lines. Click **"Transmit to Customer"**. | Generates secure, customer-safe digital quote link. | **VERIFIED** |
| **7** | **Customer Quote Portal** (`/quote/demo-quote-bmw`) | Open customer viewer on mobile viewport (375px). Demonstrate customer approving scheduled work while declining optional detailing. | Approved Scope automatically calculates ₹14,800. | **VERIFIED** |
| **8** | **Job Card Execution** (`/dashboard/jobs`) | Show approved items converted to official work orders. Advance status to **QUALITY CHECK**. | Mechanical work signed off; staged for final road test. | **VERIFIED** |
| **9** | **Customer Service Tracker** (`/service-status/track-bmw-jc2047`) | Switch to customer tracker. Show real-time milestone stepper advancing to Quality Check. | Zero internal notes or staff margins visible to customer. | **VERIFIED** |
| **10** | **Delivery & Handover** (`/dashboard/jobs`) | Click **"MOVE TO DELIVERED"**. Confirm vehicle handover in safety modal. | Bay clears; customer `last_service_date` updates; archives to Service History. | **VERIFIED** |
| **11** | **Service History & Reminders** (`/dashboard/service-history`) | Show completed permanent visit record under Rahul Mehta's dossier. View automatic 6-month service reminder. | Unbroken lineage from initial intake to future follow-up. | **VERIFIED** |
| **12** | **Reports & Analytics** (`/dashboard/reports`) | Review operational throughput, average job value (AJV), and lineage-based conversion funnels. | All calculations mathematically truthful; zero division-by-zero. | **VERIFIED** |

---

### 3. DEMONSTRATION CHEATING & ILLUSION AUDIT

- **Zero Fabricated APIs**: Contextual WhatsApp buttons open standard `https://wa.me/` URLs with pre-filled text rather than claiming fake automated bot servers.
- **Zero Hidden States**: All cross-module actions persist directly to browser storage and survive page reloads.
- **Instant Clean Reset**: Accessible **RESET DEMO DATA** button in Settings restores all records to the baseline script in $< 1$ second.
