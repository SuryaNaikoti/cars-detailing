# TORQUE EXPERT'S WORKSHOP OS V4.0
# PRODUCT SCOPE MATRIX (PRODUCT_SCOPE_MATRIX.md)

**Audit Date**: September 22, 2026  
**Subject**: Functional Scope Classification & Boundary Enforcement  

---

### 1. SCOPE CLASSIFICATION LEGEND

- 🟢 **GREEN (REQUIRED & IMPLEMENTED)**: Core capabilities essential for workshop operations that are fully built, tested, and verified.
- 🟡 **YELLOW (USEFUL FUTURE EXTENSIONS)**: Practical operational enhancements suitable for post-V4 production milestones.
- 🔴 **RED (INTENTIONALLY OUT OF SCOPE)**: External enterprise functions (ERP, Accounting, Hardware OBD, WhatsApp Bots) explicitly excluded to maintain core product focus.

---

### 2. COMPREHENSIVE FUNCTIONAL SCOPE AUDIT

| Functional Area | Scope Status | Operational Boundary & Justification |
| :--- | :--- | :--- |
| **Lead & Enquiry Management** | 🟢 **GREEN** | Full intake, qualification, and appointment handoff implemented. |
| **Appointment Scheduling & Reception** | 🟢 **GREEN** | Multi-bay slotting, arrival logging, odometer/fuel intake implemented. |
| **Job Card Operations** | 🟢 **GREEN** | Full 8-stage lifecycle, work item execution, customer complaint logging. |
| **Digital Vehicle Inspections (DVI)** | 🟢 **GREEN** | 30-point luxury checklist, photo observations, finding triage. |
| **Estimates & Work Authorization** | 🟢 **GREEN** | Itemized scope calculation, revisions, partial approvals, work conversion. |
| **Customer Quote Portal** | 🟢 **GREEN** | Standalone responsive viewer (`/quote/:token`) with item approval/rejection. |
| **Customer Service Status Portal** | 🟢 **GREEN** | Privacy-sanitized milestone tracker (`/service-status/:token`). |
| **Workshop Floor & Bay Management** | 🟢 **GREEN** | 4 active service bays, occupancy tracking, technician assignment. |
| **Service History Archive** | 🟢 **GREEN** | Immutable historical visit records, multi-visit chronological timelines. |
| **Service Reminders & Follow-Ups** | 🟢 **GREEN** | Scheduled maintenance alerts, overdue queues, pre-filled WhatsApp links. |
| **Workshop Reports & Analytics** | 🟢 **GREEN** | Throughput, scope values, lineage-based conversion funnels. |
| **Staff Directory & Permissions** | 🟢 **GREEN** | 6 staff roles, 18x6 capability permission matrix, audit logs. |
| **Workshop Profile & Settings** | 🟢 **GREEN** | 7-day operating schedule, canonical services pricing, demo data reset. |
| **Customer PDF Quote Export** | 🟡 **YELLOW** | Client-side or server-side printable PDF generation for quotes. |
| **Technician Digital Signature** | 🟡 **YELLOW** | Technician sign-off canvas on completed DVI checklists. |
| **Customer Handover Signature** | 🟡 **YELLOW** | Digital signature capture upon vehicle collection/delivery. |
| **Multi-Branch Workshop Management** | 🟡 **YELLOW** | Centralized console managing multiple physical workshop facilities. |
| **Accounting & General Ledger** | 🔴 **RED** | **Out of Scope**: Double-entry bookkeeping belongs in dedicated ERP software (e.g. Tally, QuickBooks, Zoho Books). |
| **GST Tax Invoicing & Filing** | 🔴 **RED** | **Out of Scope**: Workshop OS governs operational scope authorization, not statutory tax compliance. |
| **Payment Gateway & Cash Drawer** | 🔴 **RED** | **Out of Scope**: POS card swipe and payment processing handled by dedicated merchant terminals. |
| **Warehouse Inventory & Stock-Keeping**| 🔴 **RED** | **Out of Scope**: Comprehensive spare parts warehouse management is outside core repair workflow. |
| **Purchasing & Supplier POs** | 🔴 **RED** | **Out of Scope**: Procurement workflows belong in supply chain software. |
| **Staff Payroll & HR** | 🔴 **RED** | **Out of Scope**: HR and salary processing outside workshop execution boundary. |
| **OBD-II Hardware Telemetry** | 🔴 **RED** | **Out of Scope**: Direct Bluetooth/cellular vehicle hardware tracking is outside software scope. |
| **AI Predictive Fault Diagnostics** | 🔴 **RED** | **Out of Scope**: Replaced by certified technician physical inspection findings. |
| **Automated WhatsApp Bots / Spammers** | 🔴 **RED** | **Out of Scope**: Direct agent-triggered contextual deep links preserve authentic human customer service. |
| **Native iOS / Android Apps** | 🔴 **RED** | **Out of Scope**: Highly responsive PWA/web app functions flawlessly across all mobile viewports down to 320px. |
