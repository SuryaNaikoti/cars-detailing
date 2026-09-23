# FULL PLATFORM DEFECT REGISTER
**Torque Expert Workshop OS — V5.0 / V5.3**  
**Audit Date:** September 23, 2026  
**Auditor:** Independent System Acceptance Test (Real Browser Automation & Black-Box/White-Box Audit)

---

## 1. Defect Classification Standard

- **P0 — Critical:** Blocks core lifecycle / corrupts data / privacy or security leak.
- **P1 — Major:** Core operational workflow is incomplete, broken, or contradictory.
- **P2 — Moderate:** Operational workflow functions but contains meaningful usability, synchronization, or visual consistency defects.
- **P3 — Minor:** Cosmetic, typography, or low-impact polish defects.
- **KNOWN LIMITATION:** Intentional architectural constraint of the client-side demo platform.
- **OUT OF SCOPE:** Explicitly planned for backend phase and not part of the standalone client OS.

---

## 2. Platform Defect Register Table

| ID | Severity | Module | Workflow | Steps to Reproduce | Expected Behavior | Actual Behavior | Impact | Classification | Recommended Fix |
|---|---|---|---|---|---|---|---|---|---|
| **DEF-01** | **P2** | Navigation / URL Routing | Direct Module Deep-Linking | Access `http://localhost:5173/?page=dashboard&module=workshop-floor` | Should navigate directly to Workshop Floor view | Defaults to overview dashboard because the canonical internal module ID is `floor` rather than `workshop-floor` | Minor friction if users or external bookmarks use intuitive module slugs | **P2 — Moderate** | Add an alias lookup in `DashboardLayout.tsx` mapping `workshop-floor` $\rightarrow$ `floor`, `reports-and-metrics` $\rightarrow$ `reports`. |
| **DEF-02** | **P2** | Multi-Tab Concurrency | Concurrent LocalStorage Sync | Open Workshop OS in two side-by-side browser tabs. Advance a Job Card stage in Tab 1. View Tab 2. | Tab 2 should update dynamically via storage event listener | Tab 2 only reflects state changes upon user interaction or manual page refresh | In a multi-user environment, two staff members on the same machine/browser could see out-of-date state until reload | **P2 — Moderate** | Attach `window.addEventListener('storage', ...)` in `demoStore.ts` to trigger React state re-sync across open browser tabs. |
| **DEF-03** | **P3** | Job Cards Module | Job Card Creation Modal | Open "New Job Card" modal at 1024×768 resolution | Modal should comfortably fit screen with internal scrolling | Modal footer CTA buttons slightly touch the viewport edge on smaller laptops | Usable, but requires slight vertical scrolling on 768px height displays | **P3 — Minor** | Add `max-h-[85vh] overflow-y-auto` to modal content body container. |
| **DEF-04** | **P3** | Reminders Module | Date Filter Selector | Open Reminders module, select "Custom Range", leave end date blank | Should prompt for end date or default to current date | Clears filter without explicit validation toast | Minor user experience polish; does not break system state | **P3 — Minor** | Add inline helper message: "Please select both start and end dates". |
| **DEF-05** | **P3** | Public Website | FAQ Accordion Keyboard Navigation | Tab through FAQ section on Homepage using `Tab` key and press `Enter` | Accordion should toggle expansion on `Enter` or `Space` keypress | Accordions respond primarily to pointer click events | Minor accessibility limitation for keyboard-only assistive technology users | **P3 — Minor** | Add `onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle()}` to accordion trigger button. |
| **LIM-01** | **LIMITATION** | Team & Permissions | Role Switching & Access Control | Switch role to "Technician" or "Reception" in header | Role switching should enforce strict cryptographic session boundaries | Role switching is client-side state simulation (`currentUserRole`); UI controls are hidden, but local data can be inspected in DevTools | Suitable for live demonstration; unsuitable for untrusted multi-tenant production | **KNOWN LIMITATION** | Implement Supabase / Node.js JWT authentication with PostgreSQL Row-Level Security (RLS). |
| **LIM-02** | **LIMITATION** | Communications Module | WhatsApp Messaging | Click "Send WhatsApp Update" on customer card | Would trigger WhatsApp Cloud API or Twilio business messaging | Opens native `wa.me/9190000xxxxx?text=...` deep link in new tab with prefilled message | Staff must click "Send" in WhatsApp Web; no automated server-side delivery receipts | **KNOWN LIMITATION** | Clarify in demo that this is staff-assisted 1-click WhatsApp deep-linking rather than a headless bot. |
| **LIM-03** | **LIMITATION** | Data Storage | Data Persistence Across Devices | Close browser, switch to a different laptop, open application | Database should sync across different physical machines | Data resides entirely in the local browser's `localStorage` | Data is isolated to the single device and browser instance | **KNOWN LIMITATION** | Migrate state layer from `localStorage` demoStore to cloud database (PostgreSQL/Supabase). |
| **OOS-01** | **OUT OF SCOPE** | Payment Processing | Invoice Payment Gateway | Deliver job and click "Collect Online Payment" | Process real credit card / UPI payment via Razorpay / Stripe gateway | Payment status is marked manually by staff ("Paid via Card / UPI / Cash") | Real bank settlement and gateway webhooks are not implemented | **OUT OF SCOPE** | Integrate Razorpay / Stripe checkout webhooks in production phase. |
| **OOS-02** | **OUT OF SCOPE** | Accounting & ERP Integration | Ledger & Tax Filing | View Workshop Reports | Generate Tally / QuickBooks export or direct GST portal e-way bill | Reports summarize scope values and estimated tax liability for internal management | No direct double-entry ledger or government tax portal synchronization | **OUT OF SCOPE** | Add export to CSV/Excel for Tally/QuickBooks in future enterprise roadmap. |

---

## 3. Defect Severity Summary
- **P0 (Critical):** 0
- **P1 (Major):** 0
- **P2 (Moderate):** 2 (Direct URL module alias lookup; multi-tab storage event synchronization)
- **P3 (Minor):** 3 (Small laptop modal padding; date filter validation helper; FAQ keyboard listener)
- **Known Limitations:** 3 (Simulated client-side auth; WhatsApp deep-link vs API bot; localStorage isolation)
- **Out of Scope:** 2 (Payment gateway webhooks; double-entry ERP accounting sync)

**Platform Health Verdict:** Zero P0 or P1 defects identified. The core customer and operational lifecycle functions without blockers, data loss, or state corruption.
