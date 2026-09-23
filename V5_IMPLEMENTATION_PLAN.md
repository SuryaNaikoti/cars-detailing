# TORQUE EXPERT'S WORKSHOP OS V5.0
# CONSOLIDATED IMPLEMENTATION PLAN (V5_IMPLEMENTATION_PLAN.md)

**Generated Date**: September 22, 2026  
**Status**: Authoritative Planning Document — Implementation Prohibited Until Approved  

---

## 1. ENGINEERING PHASES OVERVIEW

Instead of rebuilding individual pages, remediation work is organized into 5 system-level phases:

- **PHASE 0: Baseline Safety & Regression Freeze**
- **PHASE 1: P0 Correctness & Data Integrity (Already Verified / Preserved)**
- **PHASE 2: P1 Workflow Integrity (CF-01: Auto-Follow-Up Generation on Scope Rejection)**
- **PHASE 3: P2 Operational Efficiency (CF-03: Handover Signature, CF-04: Printable Quote)**
- **PHASE 4: Sales Demo Polish & Verification**
- **PHASE 5: Final Comprehensive Workflow Regression**

---

## 2. DETAILED PHASE SPECIFICATIONS

### PHASE 0: Baseline Safety & Regression Freeze
- **Objective**: Ensure all existing test suites (`run_production_readiness_qa.js`, `run_cross_module_qa.js`, etc.) remain green before applying any planned changes.
- **Rules**: Zero code modifications permitted during planning.

---

### PHASE 1: P0 Correctness & Data Integrity
- **Status**: **ALREADY SATISFIED & VERIFIED**.
- **Verified Capabilities**:
  - Phone and registration deduplication in `convertAppointmentToJobCard()`.
  - Itemized mathematical integrity on digital estimates.
  - Customer portal data isolation via `getCustomerSafeJobView()`.
  - Consequential delivery confirmation modal in `JobCardDetailView.tsx`.
  - Safe demo reset mechanism via `resetDemoData()` in `SettingsView.tsx`.
  - Zero division-by-zero errors and strict non-revenue terminology across all reports.

---

### PHASE 2: P1 Core Workflow Integrity (Finding CF-01)
- **Task**: Auto-generate a `DECLINED_RECOMMENDATION` Service Reminder when a customer declines items on the Quote Portal.
- **Root Cause**: `recordEstimateDecisions()` in `src/lib/demoStore.ts` does not instantiate a reminder when items are declined.
- **Files Affected**:
  - `src/lib/demoStore.ts`: Update `recordEstimateDecisions()` to call `createServiceReminder()`.
- **Data Structures Affected**: `ServiceReminder`, `EstimateRecord`.
- **Modules Affected**: Quotes, Estimates, Reminders & Follow-Ups.
- **Regression Risks**: Duplicate reminders if customer toggles decisions multiple times.
- **Mitigation / Acceptance Criteria**:
  - Check if a reminder for the same estimate and finding already exists before adding.
  - Due date set to 7 days in future with priority `HIGH`.
  - Reason clearly states: `"Customer declined: [Item Description] (Scope: ₹[Amount])"`.

---

### PHASE 3: P2 Operational Improvements (CF-03 & CF-04)
- **Task 3.1 (CF-04)**: Printable Quotation / Browser Print Stylesheet.
  - **Objective**: Allow advisors and customers to click "Print / PDF" on digital quotes.
  - **Files Affected**: `src/features/quotes/QuoteViewerPage.tsx`, `src/features/dashboard/EstimatesView.tsx`.
  - **Acceptance Criteria**: Formats cleanly on A4 with workshop header, itemized lines, and totals.
- **Task 3.2 (CF-03)**: Customer Digital Handover Sign-off on Delivery.
  - **Objective**: Add an optional signature sign-off box inside the delivery confirmation modal.
  - **Files Affected**: `src/features/dashboard/JobCardDetailView.tsx`.
  - **Acceptance Criteria**: Saves signature status with advisor delivery notes.

---

### PHASE 4: Sales Demo Polish & Verification
- **Objective**: Verify that the 5–7 minute deterministic sales flow runs seamlessly with the new auto-follow-up capability.
- **Acceptance Criteria**:
  - Step 7 (Customer Quote Portal) declining detailing item immediately creates a visible follow-up card in Step 11 (Reminders & Follow-ups).

---

### PHASE 5: Final System Regression
- **Objective**: Run all automated test suites to certify 100% pass rate.
- **Suites**:
  1. `npm run build`
  2. `node tests/run_production_readiness_qa.js`
  3. `node tests/run_cross_module_qa.js`
  4. Workflow-based regression test suite.

---

## 3. FINAL DECISION MATRIX

| Finding / Task | Priority | Root Cause Location | V5 Required? | Future Migration? | Out of Scope? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CF-01: Auto-Reminder on Declined Scope** | **P1** | `recordEstimateDecisions()` in `demoStore.ts` | **YES** | No | No |
| **CF-02: Multi-Mechanic Bay Assignment** | **P2** | `JobCard.technician` scalar in `types/index.ts` | No (Known limit) | Yes (V5.1) | No |
| **CF-03: Handover Digital Signature** | **P2** | Delivery modal in `JobCardDetailView.tsx` | Recommended | No | No |
| **CF-04: Printable Quote CSS / Action** | **P2** | Print stylesheet in `QuoteViewerPage.tsx` | Recommended | No | No |
| **CF-05: Relational DB & Server Auth** | **P3** | `localStorage` architecture | No | **YES (Postgres / Supabase)** | No |
| **CF-06: WebSocket Real-Time Floor Sync** | **P3** | Client-only reactive hooks | No | **YES (Supabase CDC)** | No |
| **CF-07: WhatsApp Automated Bot API** | **OOS**| Deliberate human-in-the-loop design | No | No | **YES (Out of Scope)** |
| **CF-08: General Ledger / GST Billing** | **OOS**| Out of workshop operational scope | No | No | **YES (Out of Scope)** |
| **CF-09: OBD Hardware Direct Link** | **OOS**| Hardware interface outside web app | No | No | **YES (Out of Scope)** |
| **CF-10: Entity Deduplication** | **P0** | `demoStore.ts:3703-3748` | **ALREADY SATISFIED** | — | — |
| **CF-11: Scope Math Integrity** | **P0** | `demoStore.ts:4255-4279` | **ALREADY SATISFIED** | — | — |
| **CF-12: Customer Portal Privacy** | **P0** | `demoStore.ts:3360-3439` | **ALREADY SATISFIED** | — | — |
| **CF-13: Consequential Delivery Safety**| **P0** | `JobCardDetailView.tsx:666` | **ALREADY SATISFIED** | — | — |
| **CF-14: Deterministic Demo Reset** | **P0** | `SettingsView.tsx:731` | **ALREADY SATISFIED** | — | — |
| **CF-15: Non-Revenue Terminology** | **P0** | Global codebase copy | **ALREADY SATISFIED** | — | — |
| **CF-16: 320px Responsive Safety** | **P0** | CSS layout & responsive classes | **ALREADY SATISFIED** | — | — |
