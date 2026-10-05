# TORQUE EXPERT — COMPREHENSIVE MOBILE PAGE INVENTORY

**Document Version:** 1.0  
**Phase:** Mobile-First Dedicated UI Engineering  
**Baseline Date:** October 2026  
**Design Standard:** Editorial Luxury Automotive · Dark Mode Obsidian/Graphite · Manrope Typography · Accent Gold `#D6A84F` · Viewports: `320px`, `360px`, `390px`, `414px`

---

## 1. Executive Summary & Inventory Scope

This inventory systematically catalogues every user-facing route, public marketing view, customer portal, and internal operational module in the Torque Expert codebase (`src/App.tsx`, `src/features/`).

### Routing Architecture Overview
Torque Expert implements a unified single-page architecture supporting both URL pathname deep-linking and state-driven routing:
- **Public Marketing Website**: `/` (`home`), `/?page=services` (`services`), `/?page=book` (`book`), `/?page=faqs` (`faqs`), `/?page=contact` (`contact`).
- **Customer Privacy Portals**: `/quote/:token` (`quote`), `/service-status/:token` (`status`).
- **Private Workshop B2B Presentation**: `/private/workshop-os` (`private-workshop-os`).
- **Workshop OS Dashboard**: `/dashboard` with 17 operational modules managed via `?module=<moduleName>`:
  1. `overview` (Control Center)
  2. `floor` (Workshop Floor)
  3. `leads` (Leads & Enquiries)
  4. `appointments` (Appointments Reception)
  5. `jobs` (Job Cards Workspace & Detail Drawer)
  6. `inspections` (Digital Inspections)
  7. `estimates` (Estimates & Approvals)
  8. `customers` (Customer Directory)
  9. `vehicles` (Vehicle Directory)
  10. `service-history` (Historical Passports)
  11. `reminders` (Retention & Follow-ups)
  12. `technicians` (Workforce & Capacity)
  13. `communications` (Customer Logs)
  14. `reports` (Financial & Operational Totals)
  15. `analytics` (Operational Intelligence & Funnels)
  16. `team` (Team & Permissions)
  17. `settings` (Workshop Configuration & Audit Trail)

---

## 2. Public Marketing Website

---

### Route 01: Public Homepage
- **Route / URL:** `/` or `/?page=home`
- **Page Name:** Homepage (`HeroChapter`, `SpecialistCareChapter`, `StandardChapter`, `ServicesChapter`, `ProcessChapter`, `VisibilityChapter`, `ServiceHistoryChapter`, `CampaignChapter`, `ClientExperienceChapter`, `ActionHubChapter`, `LocationChapter`, `FinalCtaChapter`, `Header`, `Footer`, `StickyMobileCTA`)
- **Page Purpose:** Primary brand showroom and conversion engine for German and luxury car owners. Educates on precision standards, builds credibility, presents services, and drives booking conversions through the dedicated Action Hub.
- **Current Desktop Layout:** 13-section vertical narrative with sticky editorial header, full-bleed hero with right-side photography, 2-column editorial stories, 6-card service grid, horizontal process timeline, customer visibility preview, customer reviews carousel, Action Hub form, location map/details, and editorial footer.
- **Primary User Goal:** Book a vehicle service or consultation with confidence.
- **Primary CTA:** `BOOK A SERVICE` (smooth scrolls down to `#action-hub`).
- **Secondary CTAs:**
  - `Explore Services` (scrolls down to `#services`)
  - `Check Service Options` / `Request This Service` (preselects service and scrolls to `#action-hub`)
  - `Track Service Status` (routes to `/service-status/track-bmw-jc2047`)
  - `WhatsApp Service Desk` (launches external WhatsApp chat)
- **Important Content:**
  - Value proposition headline: *"Precision Service. Expert Diagnosis."*
  - Specialist brand badges: BMW, Mercedes-Benz, Audi, Porsche.
  - Four pillars of Torque Expert standard (Factory tooling, certified technicians, transparent quotes, digital passport).
  - Curated service catalog (Periodic Service, Diagnostic Assessment, Brake Engineering, Suspension Overhaul, Transmission Service, Ceramic Coating).
  - 5-stage workshop lifecycle.
  - Customer review quotes.
  - Workshop operational hours and address in Andheri East, Mumbai.
- **Forms:**
  - Action Hub Form (`ActionHubChapter.tsx`): 4-step progressive service intake form (Vehicle selector, Service requirement, Symptoms text, Contact details).
- **Cards:**
  - 6 specialist service cards with hover image zoom and direct CTA.
  - 3 standard comparison cards.
  - 3 process stage cards.
  - 3 customer testimonial cards.
- **Tables:** None.
- **Drawers / Modals:**
  - Mobile Navigation Drawer (`#mobile-navigation-drawer`) triggered from header hamburger.
  - Smart Enquiry Modal (`SmartEnquiryModal.tsx`) available on non-home pages or direct deep triggers.
- **Navigation Requirements:**
  - Mobile header with brand logo, hamburger menu button (min 44px tap target).
  - Sticky mobile bottom CTA bar (`#mobile-sticky-cta-bar`) when not in drawer/modal.
  - Strict downward-only scrolling to `#action-hub`.
- **Mobile-Specific UX Considerations:**
  - At 320px, headline line breaks must be tuned to prevent awkward word truncation or overflow.
  - Hero image must retain automotive focus without pushing copy below 90vh viewport threshold.
  - Vehicle selector in Action Hub must use native mobile select or vertically stacked buttons for thumb precision.
  - Service selection cards in Action Hub must maintain 44px min touch target with clear selected states.
  - Bottom sticky CTA bar must have proper `pb-safe` padding for iOS home indicator bar.
- **Existing Dependencies:** `src/lib/demoStore.ts`, `src/data/demoData.ts`, `src/lib/utils.ts`.
- **Existing Functionality That Must Not Break:** Form submission to `saveLead()`, service preselection synchronization via CTA clicks, WhatsApp deep link generation, smooth scrolling to `#action-hub`.

---

### Route 02: Specialist Services Directory
- **Route / URL:** `/?page=services`
- **Page Name:** Services Page (`src/features/services/ServicesPage.tsx`)
- **Page Purpose:** In-depth catalog of all specialist engineering and detailing disciplines offered by Torque Expert.
- **Current Desktop Layout:** Editorial alternating story rows (12-column grid: 6-col high-res photography, 6-col technical specifications and bullet lists) for 6 core disciplines.
- **Primary User Goal:** Evaluate specific service procedures, inclusions, OEM part warranties, and labor guarantees.
- **Primary CTA:** `BOOK THIS SERVICE` (opens booking workflow with service preselected).
- **Secondary CTAs:**
  - `Enquire on WhatsApp` (opens WhatsApp link with service context)
  - `View Service Details` modal toggle
- **Important Content:**
  - Service module tags (Module 01 - 06).
  - Technical procedure summaries, diagnostic tool specifications, component replacements list.
- **Forms:** None directly inline (triggers `SmartEnquiryModal` or routes to booking).
- **Cards:** 6 alternating narrative cards with technical specs.
- **Tables:** None.
- **Drawers / Modals:** `SmartEnquiryModal` when clicking Book Service.
- **Navigation Requirements:** Header back to home or other pages; footer links; sticky mobile CTA.
- **Mobile-Specific UX Considerations:**
  - Convert alternating desktop 2-column layout to clean vertically stacked cards: Image (16:9 ratio) -> Title & Module pill -> Description -> Key deliverables -> Action buttons.
  - Ensure image tap area does not interfere with vertical scroll gesture.
  - Touch targets for WhatsApp and Booking buttons must be at least 44px tall.
- **Existing Dependencies:** `APPROVED_SERVICES` from `demoData.ts`, `Button.tsx`.
- **Existing Functionality That Must Not Break:** `onOpenBooking(serviceSlug)` must correctly pass selected service to modal/intake.

---

### Route 03: Dedicated Service Booking
- **Route / URL:** `/?page=book`
- **Page Name:** Book Service Page (`src/features/booking/BookServicePage.tsx`)
- **Page Purpose:** Dedicated appointment booking interface allowing customers to schedule specific workshop visits, select dates, times, and vehicle profiles.
- **Current Desktop Layout:** Centered 3-column form container with vehicle selector dropdowns, service picker grid, date/time picker, contact inputs, and confirmation state.
- **Primary User Goal:** Secure a confirmed workshop bay arrival slot.
- **Primary CTA:** `CONFIRM APPOINTMENT` (submits appointment to store).
- **Secondary CTAs:** `Back to Overview`, `WhatsApp Service Desk`.
- **Important Content:** Booking advisory terms, cancellation flexibility, bay preparation notes.
- **Forms:** Comprehensive booking form (`make`, `model`, `year`, `service`, `date`, `time`, `name`, `phone`, `notes`).
- **Cards:** Success confirmation card with booking reference.
- **Tables:** None.
- **Drawers / Modals:** None.
- **Navigation Requirements:** Back navigation link at top, sticky mobile CTA hidden on booking page to avoid duplicate action buttons.
- **Mobile-Specific UX Considerations:**
  - Full-width inputs with 48px touch height and 16px font size to prevent mobile browser auto-zoom.
  - Date and time pickers using native mobile controls for seamless OS picker integration.
  - Thumb-friendly service selection chips.
- **Existing Dependencies:** `saveAppointment` in `demoStore.ts`, `CURATED_VEHICLE_OPTIONS`.
- **Existing Functionality That Must Not Break:** Creation of `AppointmentRecord` in store and state reset on completion.

---

### Route 04: Frequently Asked Questions
- **Route / URL:** `/?page=faqs`
- **Page Name:** FAQs Page (`src/features/faqs/FaqsPage.tsx`)
- **Page Purpose:** Address common customer concerns regarding warranty preservation, genuine parts, pricing estimates, turnaround times, and towing assistance.
- **Current Desktop Layout:** Category filter tabs on top, 2-column accordion lists for 12+ questions, sidebar quick-contact box.
- **Primary User Goal:** Find answers to technical and operational service policies.
- **Primary CTA:** `CONTACT WORKSHOP ADVISOR` / `WHATSAPP ENQUIRY`.
- **Secondary CTAs:** Individual accordion toggles.
- **Important Content:** Genuine parts guarantee, factory scan tool certifications, diagnostic fee policies.
- **Forms:** Quick enquiry form or direct links.
- **Cards:** Category cards and contact box.
- **Tables:** None.
- **Drawers / Modals:** None.
- **Navigation Requirements:** Header and Footer navigation.
- **Mobile-Specific UX Considerations:**
  - Accordion headers must be full-width tap targets (min 48px height) with prominent plus/minus or chevron icons.
  - Category tabs must be horizontally scrollable pill bars or clean stacked buttons without line-wrapping mess.
  - Active accordion answer text must have sufficient line height and contrast against Obsidian background.
- **Existing Dependencies:** `lucide-react` icons, `SectionHeader.tsx`.
- **Existing Functionality That Must Not Break:** Accordion expand/collapse states and category filtering.

---

### Route 05: Workshop Location & Contact
- **Route / URL:** `/?page=contact`
- **Page Name:** Contact & Location Page (`src/features/contact/ContactPage.tsx`)
- **Page Purpose:** Workshop location information, physical address, GPS directions, operating hours, direct phone lines, and emergency towing contacts.
- **Current Desktop Layout:** 2-column layout: Left column with address, opening times, direct phone, WhatsApp links; Right column with interactive contact/enquiry form and interactive Google Maps embed.
- **Primary User Goal:** Locate the workshop facility, check operating hours, or initiate direct contact.
- **Primary CTA:** `SEND MESSAGE` / `GET DIRECTIONS` (Google Maps deep link).
- **Secondary CTAs:** `Call Workshop` (`tel:`), `WhatsApp Service Desk`.
- **Important Content:** Physical address in Andheri East Mumbai, Mon-Sat hours, Sunday closed/emergency only notice.
- **Forms:** General contact form (name, email, phone, message).
- **Cards:** Contact cards (Direct Phone, Workshop Address, Emergency Towing).
- **Tables:** None.
- **Drawers / Modals:** None.
- **Navigation Requirements:** Header and Footer navigation.
- **Mobile-Specific UX Considerations:**
  - 1-tap `tel:` and Google Maps directions buttons optimized for thumbs.
  - Map iframe/container set to responsive aspect ratio with gesture touch-lock protection (prevent page scroll trapping).
  - Form inputs stacked vertically with inline error validation.
- **Existing Dependencies:** `demoStore.ts`, `generateWhatsAppLink`.
- **Existing Functionality That Must Not Break:** Lead creation from contact form, direct phone and map links.

---

## 3. Customer Privacy Portals

---

### Route 06: Digital Customer Quote Portal
- **Route / URL:** `/quote/:token` or `/?page=quote&quoteToken=:token`
- **Page Name:** Customer Quote Viewer (`src/features/quotes/QuoteViewerPage.tsx`)
- **Page Purpose:** Secure, privacy-sanitized digital quote authorization interface for vehicle owners. Allows customers to review line-by-line mechanical scope, inspect parts/labor pricing, approve or decline individual recommendations, or authorize the complete estimate.
- **Current Desktop Layout:** 2-column layout: Left column contains vehicle summary card, status badge, scope item list with approval checkboxes/switches; Right column contains commercial breakdown summary card (parts total, labor total, taxes, grand total) and sticky authorization buttons.
- **Primary User Goal:** Review and digitally authorize/decline vehicle repairs without phone tag.
- **Primary CTA:** `APPROVE ALL WORK` or `CONFIRM SELECTED ITEMS`.
- **Secondary CTAs:**
  - `DECLINE ESTIMATE`
  - Item-level `Approve` / `Decline` action toggles
  - `Download / Print PDF Quote`
  - `Back`
- **Important Content:**
  - Vehicle identification (Year, Make, Model, License Plate, Odometer).
  - Strict customer-safe fields only (ZERO internal margins, wholesale costs, bay assignments, or internal technician notes).
  - Line items: Service name, scope description, parts required, labor units, line amount, recommended vs mandatory flags.
- **Forms:** Interactive authorization decisions (checkboxes/toggles for each line item).
- **Cards:**
  - Vehicle Summary Card
  - Scope Item Cards
  - Commercial Total Card
  - Confirmation / Decision Status Card
- **Tables:** Line item pricing table on desktop.
- **Drawers / Modals:** None.
- **Navigation Requirements:** Back button returning to previous view (dashboard or home).
- **Mobile-Specific UX Considerations:**
  - **Critical Mobile Pattern:** Desktop line-item table must transform into distinct stacked touch cards with prominent tap targets for `Approve` (green) and `Decline` (red/muted).
  - Sticky bottom action bar on mobile displaying the running authorized total and primary `CONFIRM DECISIONS` button.
  - Commercial summary card pinned above or accessible via sticky drawer.
  - Large, readable typography for financial totals (INR format).
- **Existing Dependencies:** `getCustomerSafeQuoteView()`, `recordEstimateDecisions()` in `demoStore.ts`.
- **Existing Functionality That Must Not Break:** Strict sanitization against internal notes/costs, individual item approval state management, multi-item authorization commit to store.

---

### Route 07: Live Service Status Tracker
- **Route / URL:** `/service-status/:token` or `/?page=status&jobToken=:token`
- **Page Name:** Customer Service Status Tracker (`src/features/status/ServiceStatusTrackerPage.tsx`)
- **Page Purpose:** Real-time, customer-facing progress tracker for active workshop jobs. Customers can inspect their vehicle's current stage (Intake, Diagnosis, Estimate Approval, Work in Progress, Quality Control, Ready for Delivery), technician inspection notes, photos, and live delivery timeline.
- **Current Desktop Layout:** Header with vehicle banner and status badge, horizontal 6-step progress stepper with completion icons, 2-column detailed breakdown (Left: Current stage summary & findings; Right: Advisor contact & vehicle details).
- **Primary User Goal:** Track live vehicle repair status without needing to call reception.
- **Primary CTA:** `CALL DEDICATED SERVICE ADVISOR` / `WHATSAPP UPDATE`.
- **Secondary CTAs:**
  - `Refresh Status`
  - `View Approved Estimate` (deep links to quote viewer if estimate exists)
  - `Return to Overview`
- **Important Content:**
  - Vehicle summary (Make, Model, Year, Plate).
  - Current status phase with timestamp and estimated completion time.
  - 6 lifecycle stages: Intake -> Inspection -> Estimate -> Repair -> Quality Control -> Ready.
  - Customer-safe findings summary and inspection photos.
  - Dedicated service advisor profile (Name, Direct Contact).
- **Forms:** None.
- **Cards:**
  - Vehicle Status Hero Card
  - Stage Timeline Card
  - Customer Findings & Media Card
  - Service Advisor Contact Card
- **Tables:** None.
- **Drawers / Modals:** None.
- **Navigation Requirements:** Back button, auto-polling or manual refresh button.
- **Mobile-Specific UX Considerations:**
  - Horizontal desktop stepper must convert into a clean vertical stepper on mobile with animated pulses for the active phase and completed checkmarks for prior phases.
  - Inspection photo gallery must support touch pinch/lightbox or full-width swiping.
  - 1-tap call and WhatsApp buttons sticky or anchored prominently for emergency customer contact.
- **Existing Dependencies:** `getCustomerSafeJobView()` in `demoStore.ts`.
- **Existing Functionality That Must Not Break:** Real-time data hydration, invalid token fallback screen, window focus auto-refresh.

---

## 4. Private Workshop B2B Presentation

---

### Route 08: Private Workshop OS Sales Showcase
- **Route / URL:** `/private/workshop-os`
- **Page Name:** Private Workshop OS Page (`src/features/private/PrivateWorkshopOsPage.tsx`)
- **Page Purpose:** Dedicated B2B sales presentation and feature showcase for prospective workshop owners, dealer partners, and franchise operators interested in licensing the Torque Expert Workshop OS.
- **Current Desktop Layout:** High-impact dark editorial landing page: Hero with interactive preview badges, 12 feature domain cards, interactive live workflow simulation, tiered pricing comparison cards, ROI calculator, FAQ accordion, and lead capture modal.
- **Primary User Goal:** Understand the business value and request a live private workshop demo.
- **Primary CTA:** `REQUEST PRIVATE DEMO` (opens `PrivateDemoModal`).
- **Secondary CTAs:** Section jump anchors, interactive ROI sliders, FAQ toggles.
- **Important Content:**
  - Automated robots `noindex, nofollow` meta tag management.
  - 12 core OS modules breakdown.
  - Operational metrics (leakage reduction, average repair order value growth, bay utilization).
  - Package tiers (Standard, Multi-Bay Pro, Enterprise Network).
- **Forms:** Private demo request form inside modal.
- **Cards:** 12 feature domain cards, 3 package tier cards, ROI calculator card.
- **Tables:** Feature comparison matrix table.
- **Drawers / Modals:** `PrivateDemoModal` (lead capture with custom interest preselection).
- **Navigation Requirements:** Custom standalone header or streamlined top navigation; deep anchor scrolling.
- **Mobile-Specific UX Considerations:**
  - Feature matrix table must convert to clean category accordions or horizontally scrollable cards with sticky feature labels.
  - ROI calculator sliders must have generous touch handles (min 44px) and numeric steppers.
  - Pricing cards stacked vertically with recommended tier highlighted.
  - Modal must occupy full viewport height on mobile to prevent virtual keyboard overflow.
- **Existing Dependencies:** `PrivateDemoModal.tsx`, `demoStore.ts`.
- **Existing Functionality That Must Not Break:** Dynamic meta tag cleanup on unmount, demo request submission.

---

## 5. Workshop OS Internal Dashboard Modules

All operational modules are accessed via `/dashboard` and managed within `src/features/dashboard/DashboardLayout.tsx` and `src/features/dashboard/DashboardPage.tsx`.

---

### Route 09: Module `overview` (Workshop Control Center)
- **Route / URL:** `/dashboard` or `/dashboard?module=overview`
- **Page Name:** Control Center Overview (`src/features/dashboard/OverviewView.tsx`)
- **Page Purpose:** Daily high-level operational cockpit for workshop owners and service managers. Delivers live KPI counters, active bay occupancy, pending customer approvals, urgent parts alerts, and recent enquiry intake.
- **Current Desktop Layout:**
  - Top: 6 actionable KPI summary cards.
  - Middle: 4 Workshop Bay status cards in a 4-column grid.
  - Bottom: 2-column split (Left: Urgent approval & parts blockers; Right: New incoming leads queue).
- **Primary User Goal:** Assess daily workshop workload, spot bottlenecks, and take immediate operational action.
- **Primary CTA:** `New Lead`, `New Appointment`, `New Job Card` (Quick Action bar).
- **Secondary CTAs:**
  - Clickable KPI cards that navigate directly to filtered modules (e.g., clicking *Awaiting Approval* opens `estimates`).
  - `View Job Card` on individual bay cards.
  - `Convert Lead` on incoming enquiries.
- **Important Content:**
  - 6 Key Performance Indicators (Vehicles Today, Active Jobs, Awaiting Approval, Waiting for Parts, Ready for Collection, Today's Enquiries).
  - 4 Workshop Bays (Bay 01 - 04) with vehicle, technician, job number, and status.
  - Priority action lists (Urgent approvals, parts shortages).
- **Forms:** Quick Action dropdown / dialogs.
- **Cards:** 6 KPI cards, 4 Bay cards, Lead queue cards, Action item cards.
- **Tables:** None on Overview.
- **Drawers / Modals:** Global new lead / new job dialogs.
- **Navigation Requirements:** Sidebar navigation on desktop, slide-out drawer on mobile.
- **Mobile-Specific UX Considerations:**
  - **Hierarchy Reorganization:**
    1. Critical Attention Banner (urgent blockers, parts delays).
    2. 2x3 or single-column high-contrast KPI cards.
    3. Vertically stacked Workshop Bay cards with current vehicle and status pill.
    4. Actionable Enquiry Queue.
  - Quick action floating or sticky button on mobile for 1-tap record creation.
- **Existing Dependencies:** `jobs`, `appointments`, `leads`, `reminders` from `demoStore.ts`.
- **Existing Functionality That Must Not Break:** Module jump callbacks, quick action modal triggers, job selection navigation.

---

### Route 10: Module `floor` (Workshop Floor & Bay Management)
- **Route / URL:** `/dashboard?module=floor`
- **Page Name:** Workshop Floor View (`src/features/dashboard/WorkshopFloorView.tsx`)
- **Page Purpose:** Tactical visual management of physical workshop bays, technician allocations, job durations, and bay turnaround efficiency.
- **Current Desktop Layout:** Bay summary stats banner, 4-column bay card layout with vehicle specs, technician assignees, stage badges, action buttons, and an unassigned staging queue at the bottom.
- **Primary User Goal:** Manage physical vehicle flow through bays 01–04 and prevent idle bay capacity.
- **Primary CTA:** `Assign Vehicle to Bay` / `Change Bay Allocation`.
- **Secondary CTAs:** `Open Job Card`, `Customer Status View`, `Update Stage`.
- **Important Content:** Bay equipment specs, active vehicle in bay, assigned technician, active job status, bay notes.
- **Forms:** Bay assignment select dropdowns.
- **Cards:** 4 detailed Bay Cards, Staging Queue cards.
- **Tables:** Staging queue table on desktop.
- **Drawers / Modals:** Job reassignment dialog.
- **Navigation Requirements:** Module switcher, job detail opener.
- **Mobile-Specific UX Considerations:**
  - Stack bays vertically with clear bay status headers (e.g., "BAY 01 — OCCUPIED" vs "BAY 04 — READY").
  - Convert the bottom staging table into swipeable or stacked cards.
  - Large tap targets for quick technician assignment and stage progression.
- **Existing Dependencies:** `saveJob()`, `technicians`, `jobs`.
- **Existing Functionality That Must Not Break:** Drag/select bay reassignment, live status progression.

---

### Route 11: Module `leads` (Leads & Enquiries)
- **Route / URL:** `/dashboard?module=leads`
- **Page Name:** Leads & Enquiries View (`src/features/dashboard/LeadsView.tsx`)
- **Page Purpose:** Intake pipeline for web enquiries, WhatsApp chats, phone calls, and walk-in prospects. Tracks enquiry qualification, vehicle interest, and conversion into confirmed appointments.
- **Current Desktop Layout:** Pipeline stage tabs (All, New, Contacted, Converted, Lost), search and source filters, data table of all leads with customer info, vehicle, concern, assigned advisor, and action buttons.
- **Primary User Goal:** Qualify incoming leads and convert them into service appointments.
- **Primary CTA:** `+ New Lead` and `Convert to Appointment`.
- **Secondary CTAs:** `Call Customer`, `WhatsApp Customer`, `Mark as Lost`, `Open Customer Record`.
- **Important Content:** Customer name, phone, vehicle summary, preferred service, notes, lead source, status pill.
- **Forms:** New Lead entry modal/drawer.
- **Cards:** Mobile lead cards.
- **Tables:** Desktop leads data table.
- **Drawers / Modals:** New Lead Drawer, Convert to Appointment Drawer.
- **Navigation Requirements:** Dashboard nav, module transitions to `appointments` and `customers`.
- **Mobile-Specific UX Considerations:**
  - **Table to Card Conversion:** Transform desktop table rows into rich mobile lead cards with quick communication actions (Call, WhatsApp, Convert) prominently visible.
  - Filter tabs in a horizontally scrollable chip bar.
  - Full-screen mobile bottom sheet for new lead entry and conversion modals.
- **Existing Dependencies:** `getLeads()`, `updateLeadStatus()`, `convertLeadToAppointment()`.
- **Existing Functionality That Must Not Break:** Conversion workflow passing customer and vehicle details directly into appointments store.

---

### Route 12: Module `appointments` (Reception & Scheduling)
- **Route / URL:** `/dashboard?module=appointments`
- **Page Name:** Appointments View (`src/features/dashboard/AppointmentsView.tsx`)
- **Page Purpose:** Front-desk reception calendar and daily arrival schedule. Handles check-ins, time-slot management, customer symptoms logging, and direct conversion into active workshop Job Cards upon vehicle drop-off.
- **Current Desktop Layout:** Calendar date navigator, status filter pills, appointment stats banner, detailed data table with arrival time, customer, vehicle, requested service, advisor, and conversion action.
- **Primary User Goal:** Check in arriving vehicles and generate active workshop Job Cards with zero data re-entry.
- **Primary CTA:** `+ New Appointment` and `Check In & Create Job Card`.
- **Secondary CTAs:** `Reschedule`, `Cancel Appointment`, `View Customer Record`.
- **Important Content:** Appointment date/time, customer contact, vehicle details, requested scope, intake notes.
- **Forms:** Create / Edit Appointment modal.
- **Cards:** Mobile appointment cards.
- **Tables:** Desktop appointments table.
- **Drawers / Modals:** New Appointment modal, Check-In modal.
- **Navigation Requirements:** Quick navigation to `jobs` module upon check-in.
- **Mobile-Specific UX Considerations:**
  - Date navigator optimized for touch (swipe left/right between days or clean mobile date picker).
  - Stacked appointment cards arranged chronologically by time slot.
  - High-visibility `CHECK IN & CREATE JOB CARD` button on cards scheduled for today.
- **Existing Dependencies:** `convertAppointmentToJobCard()`, `saveAppointment()`.
- **Existing Functionality That Must Not Break:** Job card generation with automated VIN/customer binding.

---

### Route 13: Module `jobs` (Job Cards Workspace & Detail View)
- **Route / URL:** `/dashboard?module=jobs` or `/dashboard?module=jobs&jobId=:id`
- **Page Name:** Job Cards View & Detail View (`src/features/dashboard/JobCardsView.tsx`, `JobCardDetailView.tsx`)
- **Page Purpose:** Central operational workspace of Torque Expert. Coordinates vehicle lifecycle from intake to delivery: bay assignment, technician work, estimate links, inspection reports, customer approval status, and final invoicing.
- **Current Desktop Layout:**
  - Master view: Status filter tabs, search bar, tabular list of active job cards with vehicle, customer, bay, stage, and actions.
  - Detail view / Drawer: Multi-tab workspace (Summary, Inspection, Estimate, Work Progress, Quality Check, Delivery).
- **Primary User Goal:** Manage and advance vehicle repair jobs through their full workshop lifecycle.
- **Primary CTA:** `+ Create Job Card` and `Advance to Next Stage` (e.g. `Approve Estimate`, `Start Work`, `Complete QC`).
- **Secondary CTAs:**
  - `Open Customer Status View`
  - `Open Quote Token`
  - `Assign Technician / Bay`
  - `Add Job Note`
- **Important Content:** Job card number (`JC-2047`), vehicle profile, customer profile, current bay, assigned technician, approval status, labor/parts costs, odometer.
- **Forms:** Create Job Card form, Stage update dialog, Technician assignment select.
- **Cards:** Mobile job summary cards.
- **Tables:** Desktop job cards table.
- **Drawers / Modals:** Comprehensive Job Card Detail Drawer (`JobCardDetailView.tsx`).
- **Navigation Requirements:** Deep link support via `?jobId=:id`, customer portal cross-navigation.
- **Mobile-Specific UX Considerations:**
  - Master list: Compact, scannable job cards displaying vehicle plate, current stage pill, assigned technician, and bay.
  - Detail view: Must open as a dedicated full-screen mobile panel rather than a cramped right-side slide-over drawer.
  - Sticky bottom action bar in Detail view showing the current stage and single-tap `Advance Stage` button.
  - Tab navigation in Detail view (Summary / Inspection / Estimate / Progress / QC) presented as a swipeable tab bar.
- **Existing Dependencies:** `getJobs()`, `saveJob()`, `JobCardDetailView.tsx`.
- **Existing Functionality That Must Not Break:** Stage machine transitions, estimate synchronization, inspection linking, customer token generation.

---

### Route 14: Module `inspections` (Digital Vehicle Inspections)
- **Route / URL:** `/dashboard?module=inspections`
- **Page Name:** Digital Inspections View (`src/features/dashboard/InspectionsView.tsx`)
- **Page Purpose:** Multi-point electronic vehicle inspection (EVI) workspace. Technicians log component health (Green/Yellow/Red), attach findings, photograph wear patterns, and recommend repairs that feed directly into commercial estimates.
- **Current Desktop Layout:** Inspection summary statistics, inspection checklist matrix (Engine, Brakes, Suspension, Electrical, Body, Fluids), photo upload previews, and finding severity filters.
- **Primary User Goal:** Record inspection findings and generate actionable repair recommendations.
- **Primary CTA:** `+ Start New Inspection` and `Push Findings to Estimate`.
- **Secondary CTAs:** `Take/Upload Photo`, `Set Severity (OK / Attention / Immediate)`, `Print Inspection Report`.
- **Important Content:** 40-point inspection items, severity levels, technician notes, customer-safe summaries, photographic evidence.
- **Forms:** Point-by-point inspection form with radio buttons/switches and note fields.
- **Cards:** Component category cards with health status indicators.
- **Tables:** Inspection findings summary table.
- **Drawers / Modals:** Create Inspection dialog.
- **Navigation Requirements:** Jump to `jobs` and `estimates`.
- **Mobile-Specific UX Considerations:**
  - Technicians use phones/tablets in the bay: Touch targets for status buttons (`OK` Green, `Attention` Amber, `Critical` Red) must be large (min 48px height) with unmistakable tactile visual feedback.
  - Camera/photo attachment button prominently placed beside each inspection item.
  - Collapsible category accordions so technician can focus on one system at a time (e.g. Brakes first, then Suspension).
- **Existing Dependencies:** `getInspections()`, `saveInspection()`, `createInspectionFromJobCard()`.
- **Existing Functionality That Must Not Break:** Seamless conversion of critical/attention findings into estimate line items.

---

### Route 15: Module `estimates` (Estimates & Commercial Approvals)
- **Route / URL:** `/dashboard?module=estimates`
- **Page Name:** Estimates & Approvals View (`src/features/dashboard/EstimatesView.tsx`)
- **Page Purpose:** Authoritative commercial quoting workspace. Service advisors build line-item estimates (parts, labor, consumables, taxes), configure customer markups, send quotes via SMS/WhatsApp, track digital customer approvals, and convert authorized items into work orders.
- **Current Desktop Layout:** Commercial KPIs (Total Estimated, Approved Value, Approval Rate), split view with estimate list on left and line-item calculation builder on right (parts catalog search, labor rate calculation, margins).
- **Primary User Goal:** Create accurate quotes, transmit to customers, and track approval status.
- **Primary CTA:** `+ Create Estimate` and `Send Quote to Customer`.
- **Secondary CTAs:** `Open Digital Quote Portal`, `Convert Approved Items to Work`, `Duplicate Estimate`, `Apply Discount`.
- **Important Content:** Estimate ID, Job Card reference, customer contact, line items with part numbers, quantities, labor hours, tax percentages, approval state per line.
- **Forms:** Line item adder form, customer message customization.
- **Cards:** Commercial summary cards, approval status cards.
- **Tables:** Detailed line item financial table.
- **Drawers / Modals:** New Estimate Drawer, Send Quote Modal.
- **Navigation Requirements:** Link to `/quote/:token`, link to `jobs`.
- **Mobile-Specific UX Considerations:**
  - Convert line item financial table into stacked cards showing: Scope name -> Parts + Labor subtotals -> Customer approval switch.
  - Sticky bottom bar displaying Grand Total (INR) and `Send Quote` / `Convert to Work` CTA.
  - Clear visual separation between internal workshop costs (hidden from customer) and customer-facing quoted totals.
- **Existing Dependencies:** `getEstimates()`, `saveEstimate()`, `getCustomerSafeQuoteView()`.
- **Existing Functionality That Must Not Break:** Customer quote token link generation, real-time approval synchronization with public quote portal.

---

### Route 16: Module `customers` (Customer Directory)
- **Route / URL:** `/dashboard?module=customers`
- **Page Name:** Customer Directory View (`src/features/dashboard/CustomersView.tsx`)
- **Page Purpose:** Master CRM registry of all vehicle owners. Tracks customer profiles, contact numbers, email addresses, active vehicles, lifetime spend, visit frequency, and linked service history.
- **Current Desktop Layout:** Search and filter bar, customer count banner, comprehensive data table (Name, Phone, Email, Registered Vehicles, Lifetime Spend, Last Visit Date, Actions).
- **Primary User Goal:** Look up customer details and view their historical vehicle relationship.
- **Primary CTA:** `+ Add Customer` and `Book Appointment`.
- **Secondary CTAs:** `Call Customer`, `Send WhatsApp`, `View Linked Vehicles`, `Open Service History`.
- **Important Content:** Customer ID, full name, phone number, email, address, total vehicles owned, VIP / loyalty status.
- **Forms:** Create / Edit Customer form.
- **Cards:** Mobile customer profile cards.
- **Tables:** Desktop customers table.
- **Drawers / Modals:** Customer Detail / Edit Drawer.
- **Navigation Requirements:** Filter linked vehicles in `vehicles` view or linked jobs in `jobs` view.
- **Mobile-Specific UX Considerations:**
  - Table rows converted into customer cards with 1-tap `Call` and `WhatsApp` quick-dial actions.
  - Expandable vehicle badges showing which cars belong to this customer.
  - Full-screen customer creation modal with phone number formatting.
- **Existing Dependencies:** `getCustomers()`, `jobs`.
- **Existing Functionality That Must Not Break:** Cross-filtering to jobs and vehicles without breaking state.

---

### Route 17: Module `vehicles` (Vehicle Directory)
- **Route / URL:** `/dashboard?module=vehicles`
- **Page Name:** Vehicle Directory View (`src/features/dashboard/VehiclesView.tsx`)
- **Page Purpose:** Registry of all vehicles serviced by Torque Expert. Tracks VINs, registration numbers, engine codes, transmission types, model years, and links to all past Job Cards.
- **Current Desktop Layout:** Vehicle search bar (filter by plate or model), statistics cards, master table with Registration, Make & Model, Year, VIN, Owner, Mileage, Status, and Action buttons.
- **Primary User Goal:** Locate vehicle technical specifications and open its full repair history.
- **Primary CTA:** `+ Register Vehicle` and `Create Job Card`.
- **Secondary CTAs:** `View Digital Passport`, `View Past Invoices`, `Edit Vehicle Details`.
- **Important Content:** Registration number (e.g. `MH 02 CP 4088`), Make, Model, Year, VIN, Engine Code, Owner Name, Current Workshop Status.
- **Forms:** Vehicle Registration modal.
- **Cards:** Mobile vehicle spec cards.
- **Tables:** Desktop vehicles table.
- **Drawers / Modals:** Vehicle Details Drawer.
- **Navigation Requirements:** Links to `customers`, `jobs`, and `service-history`.
- **Mobile-Specific UX Considerations:**
  - Vehicle cards formatted with high-contrast license plate badge at the top.
  - Quick action to initiate a new job card for that specific vehicle.
  - Fast search input with clear button for quick registration number lookup.
- **Existing Dependencies:** `getVehicles()`, `jobs`.
- **Existing Functionality That Must Not Break:** Vehicle registration validation and owner linkage.

---

### Route 18: Module `service-history` (Historical Passports)
- **Route / URL:** `/dashboard?module=service-history`
- **Page Name:** Service History View (`src/features/dashboard/ServiceHistoryView.tsx`)
- **Page Purpose:** Digital maintenance passport and historical record repository. Displays chronological timeline of all completed jobs, past inspection findings, parts replaced, invoices paid, and technician sign-offs.
- **Current Desktop Layout:** Vehicle selector filter, search input, chronological vertical timeline on left paired with detailed historical invoice and inspection preview on right.
- **Primary User Goal:** Verify past repairs, check warranty on previous parts, and maintain vehicle provenance.
- **Primary CTA:** `Print Service Passport` / `Export History PDF`.
- **Secondary CTAs:** `View Job Card`, `View Invoice`, `Filter by Date / Service Type`.
- **Important Content:** Job completion dates, recorded odometers, parts replaced with serial numbers, technician notes, total paid.
- **Forms:** Filter / search bar.
- **Cards:** Historical milestone cards.
- **Tables:** Historical line items table.
- **Drawers / Modals:** Historical Job Detail viewer.
- **Navigation Requirements:** Cross-link back to vehicle and customer profiles.
- **Mobile-Specific UX Considerations:**
  - Clean vertical chronological feed with date and mileage pills.
  - Collapsible repair details under each visit milestone.
  - Touch-friendly PDF export / share trigger.
- **Existing Dependencies:** `jobs`, `vehicles`, `customers`, `inspections`.
- **Existing Functionality That Must Not Break:** Timeline order and historical invoice reconciliation.

---

### Route 19: Module `reminders` (Retention & Follow-ups)
- **Route / URL:** `/dashboard?module=reminders`
- **Page Name:** Reminders & Follow-ups View (`src/features/dashboard/RemindersView.tsx`)
- **Page Purpose:** Customer retention and preventative maintenance engine. Surfaces upcoming periodic services, recommended repairs declined in previous visits, insurance renewals, and warranty check-ins.
- **Current Desktop Layout:** Reminder status tabs (Due Soon, Overdue, Sent, Completed), retention metrics bar, table of reminders with customer, vehicle, due service, due date, contact channel, and 1-click dispatch action.
- **Primary User Goal:** Re-engage past customers and convert pending maintenance into new appointments.
- **Primary CTA:** `Send Reminder via WhatsApp / SMS` and `Book Service`.
- **Secondary CTAs:** `Mark as Completed`, `Snooze Reminder`, `Dismiss`.
- **Important Content:** Reminder type, vehicle plate, customer phone, recommended scope, overdue days counter.
- **Forms:** Custom reminder dispatch dialog.
- **Cards:** Mobile reminder action cards.
- **Tables:** Desktop reminders table.
- **Drawers / Modals:** New Reminder modal.
- **Navigation Requirements:** Converts reminder into `appointment` or `lead`.
- **Mobile-Specific UX Considerations:**
  - Urgency indicators (Overdue in red, Due this week in amber).
  - 1-tap WhatsApp reminder dispatcher with pre-filled professional template message.
  - Mobile swipe-to-complete or clean action buttons.
- **Existing Dependencies:** `getReminders()`, `updateReminderStatus()`.
- **Existing Functionality That Must Not Break:** Reminder state update to `SENT` or `COMPLETED`.

---

### Route 20: Module `technicians` (Workforce & Capacity)
- **Route / URL:** `/dashboard?module=technicians`
- **Page Name:** Technicians & Workforce View (`src/features/dashboard/TechniciansView.tsx`)
- **Page Purpose:** Workshop workforce management, bay allocations, technician skill specializations (e.g. Master Diagnostic, Electrical, Engine Rebuild), active workload, and efficiency tracking.
- **Current Desktop Layout:** Workforce capacity banner, technician cards grid (Photo/avatar, name, role, certifications, active jobs assigned, bay assignment, efficiency rating), and technician task assignment panel.
- **Primary User Goal:** Monitor technician workload and assign jobs according to skill certifications.
- **Primary CTA:** `+ Add Technician` and `Assign Job to Technician`.
- **Secondary CTAs:** `Update Technician Status (Available / On Job / On Break)`, `View Assigned Jobs`.
- **Important Content:** Technician name, specialization badges, active job cards, efficiency score, current bay.
- **Forms:** Add / Edit Technician modal.
- **Cards:** Technician profile cards with live job meters.
- **Tables:** Assigned jobs sub-table.
- **Drawers / Modals:** Technician detail modal.
- **Navigation Requirements:** Deep links to assigned jobs in `jobs` module.
- **Mobile-Specific UX Considerations:**
  - Vertically stacked technician cards with active workload progress bar.
  - Quick toggle for technician availability status.
  - Tap card to expand assigned vehicle list.
- **Existing Dependencies:** `getTechnicians()`, `jobs`.
- **Existing Functionality That Must Not Break:** Workload calculation and job reassignment.

---

### Route 21: Module `communications` (Customer Logs)
- **Route / URL:** `/dashboard?module=communications`
- **Page Name:** Communications View (`src/features/dashboard/CommunicationsView.tsx`)
- **Page Purpose:** Unified timeline of all automated and manual customer touchpoints (Booking confirmations, inspection photo dispatches, quote links, approval receipts, delivery notifications).
- **Current Desktop Layout:** Communication filter bar (WhatsApp, SMS, Email, System Calls), chronologically ordered message log table with timestamp, recipient, vehicle, message snippet, delivery status, and external portal link.
- **Primary User Goal:** Verify customer communications and confirm delivery of quotes/tracking links.
- **Primary CTA:** `Send Custom Message` and `Resend Link`.
- **Secondary CTAs:** `Open Tracking Token`, `Open Quote Token`, `Filter by Customer`.
- **Important Content:** Message timestamps, communication channel badges, recipient phone, delivery status (Delivered, Read, Failed).
- **Forms:** Compose message modal.
- **Cards:** Mobile communication cards.
- **Tables:** Desktop communication log table.
- **Drawers / Modals:** Message detail drawer.
- **Navigation Requirements:** Direct link to customer quote and status portals.
- **Mobile-Specific UX Considerations:**
  - Message cards styled like mobile chat bubbles or clear audit logs with channel icons (WhatsApp green, SMS blue).
  - Quick `Resend` button for failed or unread customer notices.
- **Existing Dependencies:** `jobs`, `demoStore.ts`.
- **Existing Functionality That Must Not Break:** Direct opening of customer tracking/quote tokens.

---

### Route 22: Module `reports` (Operational Facts & Totals)
- **Route / URL:** `/dashboard?module=reports`
- **Page Name:** Reports View (`src/features/dashboard/ReportsView.tsx`)
- **Page Purpose:** Historical operational summaries and financial period totals (Daily, Weekly, Monthly). Tracks gross revenue, parts vs labor sales, tax collected, average ticket size, and vehicle volume.
- **Current Desktop Layout:** Date range picker, period summary KPI cards, revenue breakdown chart, service volume bar graphs, and exportable financial statement table.
- **Primary User Goal:** Review workshop financial performance and download period reports.
- **Primary CTA:** `Export Report (CSV / Excel / PDF)`.
- **Secondary CTAs:** `Change Date Range (Today / This Week / This Month / Custom)`.
- **Important Content:** Gross revenue, parts revenue, labor revenue, invoice counts, average repair order (ARO), tax breakdown.
- **Forms:** Date range filter form.
- **Cards:** Metric summary cards.
- **Tables:** Detailed financial period breakdown table.
- **Drawers / Modals:** Export options modal.
- **Navigation Requirements:** Dashboard navigation.
- **Mobile-Specific UX Considerations:**
  - Financial summary cards stacked vertically with clear typography.
  - Charts made responsive with touch tooltips and horizontally scrollable axes if needed.
  - Data table converted into expandable period summary cards or contained in a horizontally scrollable container with fixed category headers.
- **Existing Dependencies:** `jobs`, `estimates`, `demoStore.ts`.
- **Existing Functionality That Must Not Break:** Canonical data calculation across all completed jobs.

---

### Route 23: Module `analytics` (Operational Intelligence & Funnels)
- **Route / URL:** `/dashboard?module=analytics`
- **Page Name:** Operational Analytics View (`src/features/dashboard/AnalyticsView.tsx`)
- **Page Purpose:** Advanced operational intelligence and conversion analytics. Analyzes lead-to-appointment funnel conversion rates, estimate approval velocity, bay cycle times, and repeat visit frequency.
- **Current Desktop Layout:** Conversion funnel visualization (Leads -> Appointments -> Job Cards -> Approved Estimates -> Invoiced), bay utilization rate gauge, technician productivity charts, and action queue recommendations.
- **Primary User Goal:** Identify conversion leakage and improve workshop throughput.
- **Primary CTA:** `View Action Queue` (jumps to bottlenecks).
- **Secondary CTAs:** `Filter by Advisor`, `Filter by Marque`.
- **Important Content:** Conversion percentages at each stage, average cycle time per bay, top service categories by revenue, customer retention rates.
- **Forms:** Metric filter toggles.
- **Cards:** Funnel stage cards, bottleneck alert cards.
- **Tables:** Performance breakdown tables.
- **Drawers / Modals:** None.
- **Navigation Requirements:** Deep links into `leads`, `estimates`, and `jobs`.
- **Mobile-Specific UX Considerations:**
  - Funnel stages presented as a vertical stepped hierarchy with conversion drop-off percentages clearly labeled.
  - High-impact insight callout cards placed at the top.
  - Compact responsive metric gauges.
- **Existing Dependencies:** `jobs`, `leads`, `appointments`, `estimates`.
- **Existing Functionality That Must Not Break:** Real-time computation of funnel stages from demo store state.

---

### Route 24: Module `team` (Team & Permissions)
- **Route / URL:** `/dashboard?module=team`
- **Page Name:** Team & Permissions View (`src/features/dashboard/TeamView.tsx`)
- **Page Purpose:** Staff user accounts and role-based access control (RBAC). Manages workshop roles (Service Advisor, Master Technician, Workshop Manager, Cashier, Owner) and permissions for financial data access, estimate discounts, and system overrides.
- **Current Desktop Layout:** Staff overview metrics, role permission matrix table, staff directory table with Name, Role, Email, Status, Last Active, and Edit controls.
- **Primary User Goal:** Manage staff user accounts and protect sensitive workshop financial data.
- **Primary CTA:** `+ Invite Team Member`.
- **Secondary CTAs:** `Change Role`, `Deactivate Account`, `Reset Password`.
- **Important Content:** Team member names, roles, permission checkboxes (View Margins, Edit Estimates, Approve QC, View Reports), active status.
- **Forms:** Add / Edit Team Member modal.
- **Cards:** Mobile staff profile cards.
- **Tables:** Role permissions matrix table and staff directory table.
- **Drawers / Modals:** Team Member Edit modal.
- **Navigation Requirements:** Dashboard navigation.
- **Mobile-Specific UX Considerations:**
  - Convert staff directory table into clean team member cards with role badges and edit actions.
  - Role permissions matrix displayed as clean role-by-role cards with expandable toggle lists rather than a wide unreadable table.
  - Mobile modal for inviting/editing team members with full thumb-reach controls.
- **Existing Dependencies:** `getTeamMembers()`, `saveTeamMember()`.
- **Existing Functionality That Must Not Break:** User creation and role persistence.

---

### Route 25: Module `settings` (Workshop Settings & Governance)
- **Route / URL:** `/dashboard?module=settings`
- **Page Name:** Settings & Governance View (`src/features/dashboard/SettingsView.tsx`)
- **Page Purpose:** Workshop business configuration, tax rules, standard labor rates, brand profile, operating hours, and immutable system audit trail.
- **Current Desktop Layout:** Settings navigation tabs (Workshop Profile, Tax & Invoicing, Labor Rates, Notification Templates, System Audit Log), form inputs for company details, and audit events table.
- **Primary User Goal:** Configure workshop business details and audit system actions.
- **Primary CTA:** `Save Changes` (updates workshop profile).
- **Secondary CTAs:** `Export Audit Log`, `Reset Demo Data to Factory Baseline`.
- **Important Content:** Workshop legal name, GSTIN, address, default labor rate per hour, GST rate, audit event stream (Actor, Action, Timestamp, IP).
- **Forms:** Workshop Profile Form, Tax Rate Form, Labor Rate Form.
- **Cards:** Settings category cards.
- **Tables:** System Audit Trail table.
- **Drawers / Modals:** Reset Confirmation dialog.
- **Navigation Requirements:** Dashboard navigation.
- **Mobile-Specific UX Considerations:**
  - Vertical tab selector or accordion for settings categories.
  - Form fields with clear labels and touch-friendly save buttons.
  - Audit trail table transformed into a chronological log card stream.
- **Existing Dependencies:** `getWorkshopProfile()`, `saveWorkshopProfile()`, `getSystemAuditEvents()`, `resetDemoStore()`.
- **Existing Functionality That Must Not Break:** Workshop profile persistence and factory demo reset.

---

## 6. Global Modals & Reusable Components

---

### Global Component 01: Smart Enquiry Modal
- **Component:** `src/components/shared/SmartEnquiryModal.tsx`
- **Purpose:** Contextual service enquiry and vehicle consultation popup invoked from multiple public pages and headers.
- **Mobile Considerations:**
  - Full-screen takeover on viewports `<= 414px`.
  - Fixed header with prominent close button (`X`) and clear step indicator.
  - Scrollable content area with `overscroll-behavior: contain`.
  - Sticky bottom submit button above mobile keyboard.

### Global Component 02: Mobile Header & Drawer
- **Component:** `src/components/layout/Header.tsx`
- **Purpose:** Primary public site navigation.
- **Mobile Considerations:**
  - Hamburger toggle with `min-h-[44px] min-w-[44px]` touch target.
  - Full-width slide-out drawer with backdrop blur.
  - Automatically closes on route change and unlocks body scroll.
  - Distinct `Book a Service` CTA at bottom of drawer.

### Global Component 03: Sticky Mobile CTA Bar
- **Component:** `src/components/layout/StickyMobileCTA.tsx`
- **Purpose:** High-conversion persistent bottom booking bar for public pages.
- **Mobile Considerations:**
  - Automatically hides when modals or navigation drawers are open.
  - Includes safe-area inset padding (`pb-safe`) for iPhone home bars.
  - Triggers direct smooth scroll to `#action-hub` on homepage.

---

## 7. Inventory Verification & Next Steps

This inventory covers **25 distinct views and routes** currently active in the Torque Expert codebase. No routes have been invented or omitted.

**Proceeding immediately to:**
1. Creation of `MOBILE_IMPLEMENTATION_STATUS.md`
2. Creation of `MOBILE_UX_DECISIONS.md`
3. Phase 1: Dedicated Mobile Implementation and Testing of **Homepage (Route 01)** across `320px`, `360px`, `390px`, `414px`.
