# TORQUE EXPERT — CONTENT DENSITY, HIERARCHY & TYPOGRAPHY AUDIT

**Audit Date:** October 2026  
**Phase:** Global Content Density & Typography Refinement  
**Guiding Rule:** "LESS TEXT, MORE HIERARCHY, LARGER IMPORTANT INFORMATION, FASTER SCANNING, BETTER VISUAL CLARITY"

---

## 1. Executive Strategy & Typographic Hierarchy Scale

### Global Decision Rule
For every visible text element:
- *Does this text help the user understand, decide, or act?*
  - **YES:** Keep it.
  - **Useful but verbose:** Shorten it to 1–2 punchy sentences.
  - **Duplicates visible information:** Remove it.
  - **Internal / technical trivia:** Defer to detail view / collapse.
  - **No value:** Remove it completely.

### Typographic Hierarchy Standard
1. **Level 1 (Primary Dominant):** Page Titles, Hero Headlines, KPI Values (numbers), Vehicle Names (Year Make Model), Current Status Pills, Primary CTAs.
2. **Level 2 (Secondary Structural):** Section Titles, Sub-headings, Customer Name, Bay Identifier, Scope Deliverables.
3. **Level 3 (Tertiary Supporting):** Timestamps, Job Card IDs (`JC-2047`), Secondary Metadata, Helper Labels.
4. **Level 4 (Removed):** Multi-sentence paragraphs, repetitive microcopy, excessive marketing filler.

---

## 2. Page-by-Page Content Audit

### Priority 01: Public Homepage (`src/features/home/`)
- **Current Density:** High. Several chapters contain 3–4 sentence marketing paragraphs that slow down user comprehension before reaching the Action Hub.
- **Redundant Text Identified:**
  - `HeroChapter`: Subtitle has verbose explanation of modern service experience.
  - `SpecialistCareChapter`: Paragraph of 48 words detailing hardware calibration and fluid dynamics.
  - `StandardChapter`: Long 2-sentence explanatory paragraphs underneath each of the 4 pillar cards.
  - `ProcessChapter`: Long descriptions under each of the 7 stages.
  - `CampaignChapter`: Excessive explanatory caveat text around sample pricing.
  - `ClientExperienceChapter`: Verbose benefit paragraphs and long FAQ answers.
  - `ActionHubChapter`: Sub-header has unnecessary explanatory copy.
- **Text to Shorten / Remove:**
  - Hero: Shorten subhead to *"Specialist care for complex vehicles."*
  - Specialist Care: Replace 48-word paragraph with *"Expert servicing, diagnostics, and repairs without guesswork."*
  - Standard Chapter: Shorten pillar descriptions to 1 concise sentence:
    - *Digital Inspection:* "Clear findings and photo evidence."
    - *Itemized Estimates:* "Parts, labor, and costs itemized upfront."
    - *Customer Approval:* "You decide what work proceeds."
    - *Quality Control:* "Every job verified before handover."
  - Process Chapter: Keep stage titles bold and reduce step descriptions to 1 punchy line.
  - Action Hub: Reduce intro to *"Tell us what your vehicle needs."*
- **Typography Changes:**
  - Increase visual contrast of Primary Headlines and Vehicle Marque names.
  - Demote secondary supporting labels to `text-xs text-muted`.

---

### Priority 02: Overview Control Center (`src/features/dashboard/OverviewView.tsx`)
- **Current Density:** Moderate-High.
- **Redundant Text Identified:**
  - Subtitle under "Workshop Overview" is generic filler ("Current workshop status, active jobs, upcoming appointments...").
  - Attention items have long reason strings.
  - Bay cards have redundant equipment descriptions that duplicate the bay assignment.
- **Text to Shorten / Remove:**
  - Remove subtitle filler under "Workshop Overview".
  - Make KPI numbers `text-3xl font-black` (dominating the card).
  - Shorten attention item descriptions to entity + essential blocker.
  - Bay Cards: Highlight `BAY NUMBER`, `VEHICLE NAME` (bold), `STATUS PILL`, `TECHNICIAN`.

---

### Priority 03: Workshop Floor (`src/features/dashboard/WorkshopFloorView.tsx`)
- **Current Density:** High.
- **Redundant Text Identified:**
  - Long multi-sentence bay capability descriptions.
  - Redundant status explanation text.
- **Text to Shorten / Remove:**
  - Clean bay cards: `BAY NUMBER` -> `VEHICLE` -> `STATUS` -> `TECHNICIAN` -> `JOB ID` -> `[VIEW JOB]`.
  - Remove explanatory paragraphs about floor management.

---

### Priority 04: Job Cards Workspace (`src/features/dashboard/JobCardsView.tsx`)
- **Current Density:** High across table rows.
- **Redundant Text Identified:**
  - Verbose column data and repetitive status sentences.
- **Text to Shorten / Remove:**
  - Streamline overview table to essential columns: Job ID, Vehicle, Customer, Bay, Stage, Amount, Actions.
  - Promote Vehicle name and Stage Pill as dominant items.

---

### Priority 05: Leads & Enquiries (`src/features/dashboard/LeadsView.tsx`)
- **Current Density:** Moderate.
- **Redundant Text Identified:** Verbose follow-up notes in table view.
- **Text to Shorten / Remove:** Show Customer, Vehicle, Service Requested, Status, 1-click Convert / Call buttons.

---

### Priority 06: Appointments (`src/features/dashboard/AppointmentsView.tsx`)
- **Current Density:** Moderate.
- **Text to Shorten / Remove:** Prioritize Time Slot, Customer, Vehicle, Service, Status, Check-In CTA.

---

### Priority 07: Customers & Vehicles (`src/features/dashboard/CustomersView.tsx`, `VehiclesView.tsx`)
- **Current Density:** Moderate.
- **Text to Shorten / Remove:** Keep master list strictly scannable. Show Name, Phone, Active Vehicles, Last Visit. Move historical notes to detail views.

---

### Priority 08: Estimates & Approvals (`src/features/dashboard/EstimatesView.tsx`, `QuoteViewerPage.tsx`)
- **Current Density:** Moderate.
- **Text to Shorten / Remove:**
  - Promote Grand Total amount (`₹...`) with large bold font.
  - Ensure status pills (`APPROVED`, `PENDING`) are immediately scannable.

---

### Priority 09: Remaining Operational Modules & Portals
- **Inspections (`InspectionsView.tsx`):** Health ratings (`OK`, `ATTENTION`, `CRITICAL`) dominate over verbose inspection disclaimers.
- **Technicians (`TechniciansView.tsx`):** Technician Name, Status (`AVAILABLE`, `ON JOB`), and active job count dominate.
- **Reports & Analytics:** Metric counters and charts carry the message; eliminate introductory filler paragraphs.
