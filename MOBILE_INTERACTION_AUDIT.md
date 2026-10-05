# TORQUE EXPERT — GLOBAL MOBILE INTERACTION & MODAL AUDIT

**Date:** October 2026  
**Phase:** Global Mobile Form, Modal, Dropdown & Overflow Remediation  
**Target Viewports Tested:** `320px`, `360px`, `390px`, `414px` (Mobile) and `1024px`, `1440px` (Desktop)  
**Core Problem Solved:** Desktop modals (`max-w-lg fixed inset-0 flex items-center justify-center p-4`) squeezed onto mobile viewports, multi-column form rows (`grid-cols-2`, `grid-cols-3`) crushing inputs and selects at 320px–390px, missing sticky mobile action bars, select chevron collisions, and inputs disappearing behind the screen edge.

---

## 1. Global Component Inventory & Status

| View / Module | Component / Modal Name | Current Desktop Pattern | Mobile Defect Identified | Target Mobile Pattern Implemented | Status |
|:---|:---|:---|:---|:---|:---:|
| **Appointments** | `New Appointment Modal` | Centered modal (`max-w-xl`) | Multi-column inputs crushed on 320px; submit buttons scrolled off screen; select chevrons overlapped option text | **MobileFormSheet**: Full-screen workflow on `<640px`, single-column stacked sections (Customer, Vehicle, Service, Schedule, Status), scrollable body with bottom clearance, sticky bottom action bar (`Cancel` + `Confirm & Create Appointment`) | **RESOLVED** |
| **Appointments** | `Confirm Appointment Modal` | Centered modal (`max-w-md`) | Cramped on 320px; action buttons unreachable on short viewports | **MobileFormSheet** with independent scroll and sticky action bar | **RESOLVED** |
| **Appointments** | `Reschedule Modal` | Centered modal (`max-w-md`) | Date/time wrapped into cramped controls | **MobileFormSheet** with stacked touch-friendly date/time controls | **RESOLVED** |
| **Appointments** | `Check-In Modal` | Centered modal (`max-w-md`) | Multi-column odometer & fuel rows clipped | **MobileFormSheet** with single-column inputs and touch targets | **RESOLVED** |
| **Appointments** | `Cancel Modal` | Centered modal (`max-w-md`) | Reason select and buttons cramped | **MobileFormSheet** with full-width native select and sticky action bar | **RESOLVED** |
| **Leads** | `Log Customer Enquiry` | Centered modal (`max-w-lg`) | Squeezed 2-col inputs; bottom buttons scrolled out of view | **MobileFormSheet** with stacked fields & sticky actions | **RESOLVED** |
| **Leads** | `Convert to Appointment` | Centered modal (`max-w-md`) | Cramped date/time picker; awkward wrapping | **MobileFormSheet** with full-width native controls | **RESOLVED** |
| **Leads** | `Mark Lost Modal` | Centered modal (`max-w-md`) | Select reason clipped on 320px; text overlapped | **MobileFormSheet** with custom chevron clearance (`pr-10`) | **RESOLVED** |
| **Leads** | `Schedule Follow-Up` | Centered modal (`max-w-md`) | Date and channel stacked poorly | **MobileFormSheet** with stacked controls | **RESOLVED** |
| **Job Cards** | `New Job Card Intake Wizard` | Centered modal (`max-w-2xl`) | 6-step multi-field modal unscrollable and overflowing on mobile | **MobileFormSheet**: Full-screen modal on `<640px` with persistent step bar, independent body scroll, and sticky action controls | **RESOLVED** |
| **Job Cards** | `Reassign Technician` | Centered modal (`max-w-md`) | Select chevron overlapped technician name | **MobileFormSheet** with stacked 48px selects | **RESOLVED** |
| **Job Cards** | `Reassign Workshop Bay` | Centered modal (`max-w-md`) | Bay picker cramped on 320px | **MobileFormSheet** with full-width native select | **RESOLVED** |
| **Job Cards** | `Hold Work Order` | Centered modal (`max-w-md`) | Action buttons squeezed against bottom | **MobileFormSheet** with sticky confirmation bar | **RESOLVED** |
| **Job Cards** | `Deliver Vehicle Handover` | Centered modal (`max-w-md`) | Odometer & fuel inputs wrapped awkwardly | **MobileFormSheet** with clean single-column inputs | **RESOLVED** |
| **Workshop Floor** | `Bay Assignment Modal` | Centered modal (`max-w-md`) | Squeezed job selection list | **MobileFormSheet** with full-width select and 44px tap buttons | **RESOLVED** |
| **Workshop Floor** | `Bay Reassignment Modal` | Centered modal (`max-w-md`) | Select text clipped | **MobileFormSheet** with custom chevron clearance | **RESOLVED** |
| **Workshop Floor** | `Technician Reassign Modal` | Centered modal (`max-w-md`) | Select chevron overlapped technician names | **MobileFormSheet** with single-column touch selects | **RESOLVED** |
| **Estimates** | `Initiate Commercial Estimate` | Centered modal (`max-w-md`) | Cramped inputs and button overflow | **MobileFormSheet** with single-column layout | **RESOLVED** |
| **Estimates** | `+ Add Line Item` | Centered modal (`max-w-md`) | 3-column qty/unit/rate row crushed on 320px; select clipped | **MobileFormSheet** with `grid-cols-1 sm:grid-cols-3` and sticky action bar | **RESOLVED** |
| **Estimates** | `Authorize Approved Work` | Centered modal (`max-w-md`) | Value breakdown and buttons clipped | **MobileFormSheet** with independent scroll | **RESOLVED** |
| **Estimates** | `Commercial Revision` | Centered modal (`max-w-md`) | Textarea and buttons squeezed | **MobileFormSheet** with sticky action bar | **RESOLVED** |
| **Inspections** | `New Inspection Docket` | Centered modal (`max-w-md`) | Job selection dropdown clipped | **MobileFormSheet** with full-width select | **RESOLVED** |
| **Inspections** | `Add Defect & Recommendation` | Centered modal (`max-w-lg`) | Multi-column condition/priority selects cramped | **MobileFormSheet** with stacked controls and sticky action bar | **RESOLVED** |
| **Inspections** | `Attach Photo Evidence` | Centered modal (`max-w-md`) | Inputs and action buttons cramped | **MobileFormSheet** with 44px min-height inputs | **RESOLVED** |
| **Inspections** | `Review Recommendations` | Centered modal (`max-w-xl`) | Long recommendation cards pushed action buttons off screen | **MobileFormSheet** with scrollable cards and sticky navigation button | **RESOLVED** |
| **Inspections** | `Customer View Preview` | Centered modal (`max-w-2xl`) | Heavy vehicle health report clipped on mobile | **MobileFormSheet** with responsive grid and full touch scrolling | **RESOLVED** |
| **Reminders** | `Schedule Service Follow-Up` | Centered modal (`max-w-md`) | Date and channel overlapped | **MobileFormSheet** with stacked single-column layout | **RESOLVED** |
| **Settings** | `Reset Demo Seed Data` | Centered modal (`max-w-md`) | Confirmation action buttons wrapped awkwardly | **MobileFormSheet** with stacked touch buttons on mobile | **RESOLVED** |

---

## 2. Reusable Mobile Architecture: `MobileFormSheet`

To eliminate repetitive one-off CSS patches and establish a unified, production-grade pattern across the entire application:

1. **`MobileFormSheet.tsx`**:
   - On `< 640px` (mobile): Full-screen viewport container (`fixed inset-0 z-50 bg-obsidian flex flex-col`).
   - On `>= 640px` (tablet/desktop): Floating modal (`sm:max-w-lg sm:rounded-xs sm:border sm:my-auto sm:max-h-[92vh]`).
   - **Fixed Header:** Sticky at the top, includes `[ ← / ✕ ]`, title, and eyebrow module tag.
   - **Scrollable Form Body:** `flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-28`, ensuring content scrolls independently without pushing action buttons off-screen.
   - **Sticky Action Bar:** Pinned to bottom (`sticky bottom-0 z-20 bg-obsidian/95 border-t border-graphite-border px-4 py-3 pb-safe flex gap-3`), ensuring primary and secondary actions are always within reach of the thumb regardless of form length.

2. **Mobile Form Field Rules:**
   - Single-column vertical stacking on `< 640px` (`grid grid-cols-1 sm:grid-cols-2` or `sm:grid-cols-3`).
   - Touch targets: Minimum 44px to 48px interactive height.
   - Selects: Custom styled with `appearance-none`, explicit right padding (`pr-10`) so chevrons never overlap selected text.
