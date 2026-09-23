# TORQUE EXPERT'S WORKSHOP OS V5.0
# CONSOLIDATED FINDINGS REGISTER (V5_CONSOLIDATED_FINDINGS.md)

**Generated Date**: September 22, 2026  
**Baseline**: System Architecture V4.0  
**Status**: Authoritative consolidated synthesis across all 9 audit documents.  

---

## 1. EXECUTIVE OVERVIEW

This register consolidates every finding from `SYSTEM_AUDIT_V5.md`, `ENTITY_LINEAGE_MATRIX.md`, `STATE_MACHINE_AUDIT.md`, `CROSS_MODULE_CONSEQUENCE_MATRIX.md`, `KPI_DEFINITION_REGISTER.md`, `PRODUCTION_ARCHITECTURE_GAP.md`, `PRODUCT_SCOPE_MATRIX.md`, `SALES_DEMO_AUDIT.md`, and `V5_REMEDIATION_ROADMAP.md`.

Duplicate mentions across documents have been unified into single canonical engineering items. Items already verified and fully functioning in the codebase are marked as **ALREADY SATISFIED**.

---

## 2. CONSOLIDATED FINDINGS TABLE

| Finding ID | Title & Summary | Source Audits | Affected Entities / Modules | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CF-01** | **Estimate Rejection Auto-Follow-Up**: When a customer declines scope on the Quote Portal, a high-priority follow-up reminder is not automatically spawned in the Reminders queue. | `CROSS_MODULE_CONSEQUENCE_MATRIX.md`, `V5_REMEDIATION_ROADMAP.md` | `EstimateRecord`, `ServiceReminder` / Quotes, Reminders | **P1** | **GAP** |
| **CF-02** | **Multi-Mechanic Bay Assignment**: The `JobCard` model only stores a single `technician` string, preventing secondary technicians from being assigned to complex overhauls. | `SYSTEM_AUDIT_V5.md`, `V5_REMEDIATION_ROADMAP.md` | `JobCard`, `TechnicianRecord` / Floor, Jobs, Technicians | **P2** | **PARTIAL** |
| **CF-03** | **Digital Handover Signature**: Vehicle delivery transition (`MOVE TO DELIVERED`) has a safety confirmation modal but lacks a digital signature canvas for the customer. | `PRODUCT_SCOPE_MATRIX.md`, `V5_REMEDIATION_ROADMAP.md` | `JobCard`, `ServiceHistory` / Jobs, Handover | **P2** | **GAP** |
| **CF-04** | **Printable Quote PDF Generation**: Customer Quote Portal provides digital approve/decline actions but lacks client/server-side formal PDF invoice/quote printout. | `PRODUCT_SCOPE_MATRIX.md`, `V5_REMEDIATION_ROADMAP.md` | `EstimateRecord` / Quotes, Estimates | **P2** | **GAP** |
| **CF-05** | **Relational PostgreSQL & RLS Persistence**: Local client-side browser `localStorage` lacks multi-user concurrent backend security, foreign key constraints, and server-side RBAC. | `PRODUCTION_ARCHITECTURE_GAP.md`, `V5_REMEDIATION_ROADMAP.md` | All Entities / Database, Storage, Auth | **P3** | **GAP (Future Architecture)** |
| **CF-06** | **Real-Time WebSocket Floor Sync**: State updates currently rely on browser reactive hooks and focus events rather than push-based WebSockets across multiple physical tablets. | `PRODUCTION_ARCHITECTURE_GAP.md`, `V5_REMEDIATION_ROADMAP.md` | `JobCard`, `TechnicianRecord` / Workshop Floor | **P3** | **GAP (Future Architecture)** |
| **CF-07** | **Official WhatsApp Business Cloud API**: WhatsApp communication uses pre-filled manual click-to-chat links (`https://wa.me/`) rather than an automated server webhook. | `SYSTEM_AUDIT_V5.md`, `PRODUCT_SCOPE_MATRIX.md` | Communications, Outbound Comms | **OUT OF SCOPE** | **OUT OF SCOPE** (Deliberate boundary) |
| **CF-08** | **Accounting / General Ledger / GST Billing**: No double-entry accounting or statutory GST filing system. | `PRODUCT_SCOPE_MATRIX.md`, `KPI_DEFINITION_REGISTER.md` | Finance, Accounting | **OUT OF SCOPE** | **OUT OF SCOPE** (Deliberate boundary) |
| **CF-09** | **OBD-II Hardware Direct Telemetry**: No Bluetooth/cellular hardware dongle connection to physical engine control units. | `PRODUCT_SCOPE_MATRIX.md` | Diagnostics, Telemetry | **OUT OF SCOPE** | **OUT OF SCOPE** (Deliberate boundary) |
| **CF-10** | **Canonical Entity Deduplication (Phone & Registration)**: Normalized deduplication on customer phone and vehicle registration during intake. | `ENTITY_LINEAGE_MATRIX.md`, `CROSS_MODULE_CONSEQUENCE_MATRIX.md` | `CustomerRecord`, `VehicleRecord` / Leads, Appts, Jobs | **P0** | **ALREADY SATISFIED** (Verified in `demoStore.ts:3703-3748`) |
| **CF-11** | **Itemized Mathematical Scope Calculation**: Total proposed, approved, and declined scopes equal item-line sums without arithmetic error. | `KPI_DEFINITION_REGISTER.md`, `SYSTEM_AUDIT_V5.md` | `EstimateRecord` / Estimates, Quotes | **P0** | **ALREADY SATISFIED** (Verified in `demoStore.ts:4255-4279`) |
| **CF-12** | **Customer Portal Privacy Isolation**: `getCustomerSafeJobView()` strips internal technician notes, staff margins, inventory details, and private notes. | `SYSTEM_AUDIT_V5.md`, `SALES_DEMO_AUDIT.md` | `CustomerSafeJob` / Service Status, Quotes | **P0** | **ALREADY SATISFIED** (Verified in `demoStore.ts:3360-3439`) |
| **CF-13** | **Consequential Action Safety on Handover**: Delivery handover protected behind explicit confirmation modal detailing operational consequences. | `STATE_MACHINE_AUDIT.md`, `SALES_DEMO_AUDIT.md` | `JobCard` / JobCardDetailView | **P0** | **ALREADY SATISFIED** (Verified in `JobCardDetailView.tsx:666`) |
| **CF-14** | **Deterministic Demo Data Reset**: Ability to reset all 11 storage keys to canonical seed data with confirmation modal. | `SALES_DEMO_AUDIT.md`, `SYSTEM_AUDIT_V5.md` | All Stores / SettingsView, demoStore | **P0** | **ALREADY SATISFIED** (Verified in `SettingsView.tsx:731`, `demoStore.ts:4895`) |
| **CF-15** | **Strict Non-Revenue Terminology**: Banning the terms "Revenue", "Profit", and "Margin" from operational estimate scope metrics. | `KPI_DEFINITION_REGISTER.md`, `SYSTEM_AUDIT_V5.md` | Reports, Analytics, Estimates | **P0** | **ALREADY SATISFIED** (Verified across src files) |
| **CF-16** | **Responsive Safety Down to 320px**: Zero horizontal overflow on all major pages (`scrollWidth === clientWidth`). | `SYSTEM_AUDIT_V5.md`, `SALES_DEMO_AUDIT.md` | All Modules / Responsive Viewports | **P0** | **ALREADY SATISFIED** (Verified in automated QA suites) |

---

## 3. DETAILED DEFECT DOSSIERS (FOR REMEDIATION CANDIDATES)

### Finding CF-01: Auto-Generation of Follow-Up Reminders on Estimate Rejection
- **Source Audits**: `CROSS_MODULE_CONSEQUENCE_MATRIX.md`, `V5_REMEDIATION_ROADMAP.md`
- **Business Impact**: When a customer declines recommended safety or maintenance items on the Quote Portal, the advisor must manually remember to follow up with the customer.
- **Technical Impact**: `recordEstimateDecisions()` in `demoStore.ts` updates `EstimateRecord.declined_total` and sets status to `DECLINED` or `PARTIALLY_APPROVED`, but does not invoke `createServiceReminder()`.
- **Affected Entities & Modules**: `EstimateRecord`, `ServiceReminder` / `EstimatesView`, `RemindersView`, Quote Portal.
- **Current Implementation**: Estimate decisions persist to `te_workshop_estimates_v3` and sync status to `JobCard`. Reminders are unaffected.
- **Required Change**: In `recordEstimateDecisions()`, if `declinedSum > 0` or status is `DECLINED`/`PARTIALLY_APPROVED`, automatically generate a `ServiceReminder` of type `DECLINED_RECOMMENDATION` linked to the estimate and finding.
- **Priority**: **P1 (Core Workflow Integrity)**.

---

### Finding CF-02: Multi-Mechanic Bay Assignment
- **Source Audits**: `SYSTEM_AUDIT_V5.md`, `V5_REMEDIATION_ROADMAP.md`
- **Business Impact**: Major engine/gearbox overhauls frequently require a lead technician plus an assistant junior technician. Currently, only one technician can be assigned.
- **Technical Impact**: `JobCard.technician` is a scalar string (`string`), and `syncTechnicianWorkloads()` filters jobs matching only that single name.
- **Affected Entities & Modules**: `JobCard`, `TechnicianRecord` / `WorkshopFloorView`, `JobCardsView`, `TechniciansView`.
- **Current Implementation**: Singular `technician: string` (e.g. `'Arjun Sharma'`).
- **Required Change**: Introduce optional `assistant_technicians?: string[]` on `JobCard` and update `syncTechnicianWorkloads()` to account for assistant assignments.
- **Priority**: **P2 (Operational Improvement)**.

---

### Finding CF-03: Digital Handover Signature
- **Source Audits**: `PRODUCT_SCOPE_MATRIX.md`, `V5_REMEDIATION_ROADMAP.md`
- **Business Impact**: Workshops require written or digital customer sign-off upon vehicle collection to confirm satisfaction and release vehicle.
- **Technical Impact**: Delivery modal in `JobCardDetailView.tsx` records advisor actor string and notes, but lacks a base64 signature canvas.
- **Affected Entities & Modules**: `JobCard`, `ServiceHistory` / `JobCardDetailView`.
- **Current Implementation**: Delivery confirmation button invokes `executeStatusAdvance('DELIVERED')` with advisor note.
- **Required Change**: Add an optional HTML5 signature canvas in the delivery modal that captures `customer_signature_data_url` onto the Job Card and Service History entry.
- **Priority**: **P2 (Operational UX / Efficiency)**.

---

### Finding CF-04: Printable Quote PDF Generation
- **Source Audits**: `PRODUCT_SCOPE_MATRIX.md`, `V5_REMEDIATION_ROADMAP.md`
- **Business Impact**: Corporate clients and traditional vehicle owners frequently request a formal printable PDF quotation with workshop header.
- **Technical Impact**: The Quote Portal only supports interactive on-screen approval.
- **Affected Entities & Modules**: `EstimateRecord` / `QuoteViewerPage.tsx`, `EstimatesView.tsx`.
- **Current Implementation**: On-screen responsive HTML view.
- **Required Change**: Add a CSS `@media print` style sheet or `window.print()` trigger with print-optimized letterhead formatting.
- **Priority**: **P2 (Operational UX / Efficiency)**.

---

## 4. V5 IMPLEMENTATION BOUNDARY

1. **What MUST be fixed for V5?**
   - **CF-01 (P1)**: Auto-generate reminder on declined estimate scope (closes the loop between Quote rejection and Advisor CRM follow-up).
2. **What SHOULD be fixed if low effort?**
   - **CF-04 (P2)**: Print-optimized CSS / print button for estimates and quotes.
   - **CF-03 (P2)**: Digital customer signature capture on delivery confirmation.
3. **What can safely remain as a known limitation in V4/V5 demo?**
   - **CF-02 (P2)**: Single technician assignment per job card (works cleanly for all current seed records and bays).
4. **What belongs to the future Supabase/backend migration?**
   - **CF-05 (P3)**: PostgreSQL database, Row-Level Security, foreign keys, server-side JWT auth.
   - **CF-06 (P3)**: WebSocket real-time push synchronization across multiple tablet hardware devices.
5. **What is intentionally OUT OF SCOPE?**
   - **CF-07**: WhatsApp automated bot spamming (preserving authentic advisor click-to-chat).
   - **CF-08**: Accounting, general ledger, GST tax filings, card swipe terminals.
   - **CF-09**: Physical OBD hardware telemetry.
