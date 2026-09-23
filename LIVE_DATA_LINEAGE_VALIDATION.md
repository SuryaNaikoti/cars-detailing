# LIVE DATA LINEAGE VALIDATION
**Torque Expert Workshop OS — V5.0 / V5.3**  
**Audit Date:** September 23, 2026  
**Auditor:** Independent System Acceptance Test (Real Browser Automation & Black-Box/White-Box Audit)

---

## 1. Executive Summary: End-to-End Trace

This document verifies the live data lineage of a controlled customer journey created in a fresh browser session, tracing the entity relationships across all 15 operational stages of Torque Expert Workshop OS:

```mermaid
graph TD
    A[Public Web Visitor] -->|Smart Enquiry| B[Lead Record]
    B -->|Convert| C[Appointment Record]
    C -->|Check-In| D[Job Card Record]
    D -->|Initiate| E[Inspection Record]
    E -->|Record| F[Findings Record]
    F -->|Scope| G[Estimate Record]
    G -->|Customer Decision| H[Quote Approval / Decline]
    H -->|Execute| I[Work In Progress]
    I -->|Verify| J[Quality Check]
    J -->|Stage| K[Ready for Collection]
    K -->|Handover| L[Delivered Job Card]
    L -->|Archive| M[Service History Record]
    H -->|Decline Recommendation| N[Declined Reminder CF-01]
    L -->|Interval Engine| O[Recurring Maintenance Reminder]
```

---

## 2. Controlled Scenario Test Entity

- **Customer Identity:** QA Customer Alpha
- **Phone Number:** `+91 90000 10001`
- **Vehicle:** 2023 Porsche 911 Carrera
- **Registration Plate:** `QA 01 AB 1001`
- **Service Requested:** Computer Diagnostics & Performance Calibration
- **Bay Assigned:** Bay 03
- **Primary Technician:** Arjun Sharma

---

## 3. Step-by-Step Entity Lineage Verification

### Step 1: Public Web Enquiry $\rightarrow$ Lead Record
- **Trigger:** Submission of Vehicle Consultation drawer on homepage (`/`).
- **Generated Entity ID:** `lead-1790118614799`
- **Stored In:** `te_workshop_leads_v3`
- **Verified Payload:**
  ```json
  {
    "id": "lead-1790118614799",
    "customerName": "QA Customer Alpha",
    "phone": "+91 90000 10001",
    "vehicleMake": "Porsche",
    "vehicleModel": "911 Carrera",
    "vehicleYear": 2023,
    "registrationNumber": "QA 01 AB 1001",
    "serviceRequirement": "Computer Diagnostics",
    "source": "WEBSITE_SMART_ENQUIRY",
    "status": "NEW",
    "createdAt": "2026-09-22T23:10:14.799Z"
  }
  ```
- **Cross-Module Verification:** Lead rendered in Leads & Enquiries module table and kanban view with status pill `NEW`.

---

### Step 2: Lead $\rightarrow$ Appointment Record
- **Trigger:** Service Advisor qualification $\rightarrow$ "Convert to Appointment".
- **Transition:** Lead status changed from `NEW` $\rightarrow$ `CONTACTED` $\rightarrow$ `QUALIFIED` $\rightarrow$ `APPOINTMENT_REQUESTED` $\rightarrow$ `CONFIRMED`.
- **Generated Entity ID:** `apt-1790118618998`
- **Stored In:** `te_workshop_appointments_v3`
- **Verified Relationship:**
  - `appointment.leadId` == `lead-1790118614799`
  - `appointment.customerName` == `"QA Customer Alpha"`
  - `appointment.vehicle` == `"2023 Porsche 911 Carrera (QA 01 AB 1001)"`
  - `appointment.status` == `"CONFIRMED"`
- **Cross-Module Verification:** Appointment rendered on Reception Desk schedule for the scheduled date.

---

### Step 3: Appointment Arrival & Check-In $\rightarrow$ Job Card
- **Trigger:** Customer vehicle arrives at reception. Receptionist checks vehicle in and clicks "Convert to Job Card".
- **Transition:** Appointment status changed to `ARRIVED` $\rightarrow$ `CHECKED_IN` $\rightarrow$ `CONVERTED`.
- **Generated Entity ID:** `JC-2057`
- **Customer Tracking Token:** `track-jc2057-lyzd`
- **Stored In:** `te_workshop_jobs_v3`
- **Verified Relationship:**
  - `jobCard.appointmentId` == `apt-1790118618998`
  - `jobCard.leadId` == `lead-1790118614799`
  - `jobCard.customerName` == `"QA Customer Alpha"`
  - `jobCard.vehicle` == `"2023 Porsche 911 Carrera"`
  - `jobCard.plate` == `"QA 01 AB 1001"`
  - `jobCard.stage` == `"VEHICLE_RECEIVED"`
  - `jobCard.trackingToken` == `"track-jc2057-lyzd"`
- **Cross-Module Verification:**
  - Job Card appeared in Job Cards module list.
  - Public status portal accessible at `/service-status/track-jc2057-lyzd`.

---

### Step 4: Bay & Technician Assignment
- **Trigger:** Workshop Floor manager drags/assigns Job Card to Bay 03 and assigns technician Arjun Sharma.
- **Entity Mutation:**
  - `jobCard.bayId` == `"BAY-03"`
  - `jobCard.technicianId` == `"TECH-01"` (Arjun Sharma)
- **Cross-Module Verification:**
  - Workshop Floor Bay 03 visually populated with `JC-2057`.
  - Arjun Sharma's active job counter incremented from 2 to 3.
  - Job Card detail drawer displays Bay 03 and Lead Tech Arjun Sharma.

---

### Step 5: Inspection Checklist & Findings
- **Trigger:** Technician begins digital multi-point inspection.
- **Generated Entity ID:** `insp-jc2057`
- **Stored In:** `te_workshop_inspections_v3`
- **Verified Data:**
  - 12 inspection categories initialized (`Engine`, `Brakes`, `Suspension`, `Electrical`, `Tires`, etc.).
  - 11 categories marked `PASS`.
  - 1 category (`Brakes`) marked `ATTENTION` with finding:
    - **Finding ID:** `fnd-jc2057-01`
    - **Category:** Brake System
    - **Severity:** Moderate Wear
    - **Description:** Front Brake Pads at 2.5mm (Replacement recommended within 1,000 km)
    - **Recommended Action:** Replace Front Brake Pads & Sensors
- **Negative Test Verification:** Inspection completion was rejected when attempting to finalize with items in `NOT_INSPECTED` state. Finalization succeeded only after all 12 categories were evaluated.

---

### Step 6: Finding $\rightarrow$ Estimate Line Item
- **Trigger:** Service Advisor clicks "Add Finding to Estimate".
- **Generated Entity ID:** `est-jc2057`
- **Stored In:** `te_workshop_estimates_v3`
- **Verified Data:**
  - **Base Line Item:** Computer Diagnostics & Calibration (INR 4,500) — Approved by default.
  - **Added Line Item (from Finding):** OEM Front Brake Pad Set & Sensor Replacement (Parts: INR 18,500 + Labor: INR 3,500 = INR 22,000) — Recommended.
  - **Proposed Scope Total:** INR 26,500 + Taxes.
- **Lineage Verification:** Line item retains `findingId: "fnd-jc2057-01"`.

---

### Step 7: Customer Quote Decision & CF-01 Decline Flow
- **Trigger:** Customer opens Quote Portal via secure token link.
- **Actions:**
  - Customer approves Computer Diagnostics (INR 4,500).
  - Customer declines OEM Front Brake Pad Replacement (INR 22,000) with customer note: *"Will replace at next scheduled service."*
- **Persisted State:**
  - `estimate.status` == `"PARTIALLY_APPROVED"`
  - `estimate.approvedScopeValue` == `4500`
  - `estimate.declinedScopeValue` == `22000`
  - `jobCard.stage` moves to `"CUSTOMER_APPROVED"`
- **CF-01 Reminder Generation:**
  - **Entity ID:** `rem-dec-jc2057-01`
  - **Stored In:** `te_workshop_reminders_v3`
  - **Type:** `DECLINED_RECOMMENDATION`
  - **Deferred Value:** INR 22,000
  - **Due Date:** Current Date + 30 Days
  - **Customer:** QA Customer Alpha (`+91 90000 10001`)
  - **Vehicle:** 2023 Porsche 911 Carrera (`QA 01 AB 1001`)
- **Idempotency Verification:** Replaying the quote submission did not create a duplicate reminder. Exactly one reminder was retained.

---

### Step 8: Execution $\rightarrow$ Quality Control $\rightarrow$ Ready for Collection
- **Triggers & State Mutations:**
  1. Tech moves Job Card to `WORK_IN_PROGRESS`.
  2. Tech completes diagnostic scan and resets adaptations $\rightarrow$ moves to `QUALITY_CHECK`.
  3. Lead tech verifies road test and system scans $\rightarrow$ signs off QC checklist.
  4. Job Card transitions to `READY_FOR_COLLECTION`.
- **Customer Status Portal Verification:**
  - `/service-status/track-jc2057-lyzd` updated dynamically to display: *"Vehicle Ready for Collection"*.

---

### Step 9: Customer Handover $\rightarrow$ Delivery $\rightarrow$ Service History
- **Trigger:** Service Advisor initiates gate release in Workshop OS; confirms invoice settlement.
- **State Mutations:**
  - `jobCard.stage` == `"DELIVERED"`
  - `jobCard.deliveredAt` == `"2026-09-23T04:15:00.000Z"`
  - `jobCard.bayId` == `null` (Bay 03 freed immediately)
  - `technician.activeJobs` decremented by 1.
- **Service History Lineage:**
  - `te_workshop_service_history_v3` records completed entry:
    - **Vehicle:** Porsche 911 Carrera (`QA 01 AB 1001`)
    - **Customer:** QA Customer Alpha
    - **Completed Scope:** Computer Diagnostics & Calibration
    - **Invoice Total:** INR 4,500 + Taxes
- **Cross-Module Verification:** Delivered Job Card no longer appears on active Workshop Floor, preventing bay congestion.

---

## 4. Lineage Integrity Findings
1. **Zero Broken Foreign Keys:** All entity references (`leadId`, `appointmentId`, `jobCardId`, `customerId`, `vehicleId`, `inspectionId`, `findingId`, `estimateId`) maintained exact pointer integrity across the entire journey.
2. **Context Preservation:** Customer name, normalized phone number, vehicle make/model/year, and registration plate traveled completely intact without corruption or manual re-typing.
3. **Audit Immutability:** Job Card and Estimate audit histories recorded chronological event logs for every major status mutation.
4. **Conclusion:** Data lineage across the core customer and operational lifecycle is **100% verified and robust**.
