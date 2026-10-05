# TORQUE EXPERT — MOBILE UX ARCHITECTURAL DECISIONS

**Document Version:** 1.0  
**Phase:** Dedicated Mobile-First Implementation  
**Visual Language:** Obsidian `#0A0A0A`, Graphite `#171717`, Warm White `#F5F5F2`, Accent Gold `#D6A84F`, Manrope Typography  

---

## 1. Core Mobile UX Philosophy

**"Mobile First ≠ Desktop Shrunk Down"**

Desktop interfaces rely on horizontal scanning, mouse hover states, dense tabular datasets, and multi-column peripheral information. When compressed onto a 320px–414px mobile screen, these patterns fail, creating unreadable micro-text, horizontal page blowout, and thumb fatigue.

Every view in Torque Expert is engineered with deliberate mobile adaptations:
1. **Vertical Narrative Hierarchy:** High-priority status and action items anchor the top; secondary context collapses gracefully or nests cleanly below.
2. **Table-to-Card Transformation:** Wide data tables are transformed into distinct stacked touch cards with prominent status badges and primary actions.
3. **Full-Screen Panels over Cramped Drawers:** Desktop right-hand side-drawers and modals expand to full-screen mobile sheets with fixed top control bars and sticky bottom primary actions.
4. **Thumb-Friendly Touch Targets:** All interactive buttons, chips, and input fields adhere to a strict minimum 44px tap target height with generous hit boxes.
5. **Zero Horizontal Overflow:** Page scrollbars are strictly vertical; inner horizontally scrollable elements (e.g. filter chips, data comparison containers) are explicitly contained with hidden scrollbars and visual peek indicators.

---

## 2. Page-by-Page UX Decisions Log

### Route 01: Public Homepage
- **Decision: Progressive Downward Scroll to Action Hub**
  - *Context:* Desktop users can see multiple calls to action. On mobile, users must not experience disorienting upward scrolling loops.
  - *Resolution:* All action buttons across Hero, Process, and Services smoothly scroll downward directly to `#action-hub` near the bottom.
- **Decision: Native Mobile Select for Marque & Model**
  - *Context:* Button grids for 6 vehicle marques consume excessive vertical screen real estate on a 320px–390px phone and cause awkward wrapping.
  - *Resolution:* On `< 640px`, the vehicle marque and model selectors switch to native mobile dropdowns (`<select>`), providing OS-level touch scrolling wheels, while retaining the custom editorial button grid on `>= 640px`.
- **Decision: Sticky Bottom Booking CTA with Safe Inset**
  - *Context:* Mobile users scrolling deep down the 13 editorial chapters need an immediate path to book without scrolling all the way back up.
  - *Resolution:* A persistent bottom bar (`#mobile-sticky-cta-bar`) anchors to the bottom with `pb-safe` for modern iOS navigation bars, automatically hiding when the user opens the mobile menu drawer or modal.

### Route 02: Specialist Services Directory
- **Decision: Stacked Card Storytelling**
  - *Context:* Alternating 12-column desktop layouts cause alternating visual confusion when squeezed on mobile.
  - *Resolution:* Mobile presents a clean, predictable sequence per service: 16:9 cinematic workshop photo -> Module pill & Title -> Technical summary -> Deliverables list -> Direct Booking & WhatsApp buttons.

### Route 06: Digital Customer Quote Portal
- **Decision: Table to Line-Item Authorization Cards**
  - *Context:* The desktop quote view presents a multi-column pricing and approval table that clips on narrow viewports.
  - *Resolution:* Each mechanical recommendation becomes an independent card featuring:
    - Service headline & description
    - Parts & labor itemization
    - High-contrast toggle buttons: `Approve` (emerald outline/fill) vs `Decline` (muted)
    - Sticky bottom bar showing authorized total and single-tap `CONFIRM AUTHORIZATION`.
- **Decision: Privacy Safeguard Retention**
  - *Context:* Mobile presentation must under no circumstances leak internal technician notes, wholesale costs, or workshop margins.
  - *Resolution:* All data passes through the audited `getCustomerSafeQuoteView()` DTO.

### Route 07: Live Service Status Tracker
- **Decision: Vertical Timeline Stepper**
  - *Context:* Horizontal 6-stage desktop stepper is unreadable on 320px screens.
  - *Resolution:* Transformed into a vertical chronological roadmap with active phase pulsing in Gold and completed phases checkmarked in Emerald.

### Route 09–25: Workshop OS Dashboard Modules
- **Decision: Unified Drawer Navigation & Action Bar**
  - *Context:* The desktop multi-column sidebar cannot remain persistent on mobile.
  - *Resolution:* Converted to an accessible slide-over drawer triggered by a 44px hamburger button in the top bar. Top bar remains sticky with quick module switching and user profile actions.
- **Decision: Operational Tables to Actionable Cards**
  - *Context:* Operational tables in Leads, Appointments, Job Cards, and Estimates have 6–8 columns that overflow horizontally.
  - *Resolution:* Replaced on `< 768px` viewports with high-density mobile cards highlighting customer name, vehicle license plate, active stage, and direct operational buttons (e.g. Call, WhatsApp, Advance Stage).
- **Decision: Full-Screen Job Card Detail Workspace**
  - *Context:* Desktop side-drawer leaves only 200px of visible background and feels suffocated on mobile.
  - *Resolution:* On mobile, opening a Job Card transitions into a dedicated full-screen view (`JobCardDetailView`) with a top back bar, sticky stage advance button, and swipeable tab navigation.

---

*(Additional decisions will be appended as subsequent phases are implemented and verified.)*
