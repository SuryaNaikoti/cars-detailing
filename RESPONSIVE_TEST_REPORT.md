# RESPONSIVE TEST REPORT
**Platform:** Torque Expert — Workshop Operating System  
**Audit Standard:** Strict Viewport Emulation Across Mobile, Tablet, and Desktop Form Factors  

---

## 1. Viewport Test Matrix

Every major platform module (Public Homepage, Private Sales Landing, Control Center, Workshop Floor, Leads, Appointments, Job Cards, DVI Inspections, Estimates, Service History, Reminders, Technicians, Reports, Analytics, Customer Quote Portal, and Service Status Tracker) was audited across the following 9 canonical screen profiles:

| Screen Profile | Viewport Resolution | Device Category | Horizontal Overflow Check | Touch Target Usability | Drawer / Modal Usability | Status |
|---|---|---|---|---|---|---|
| Micro Mobile | `320 x 800` | iPhone SE (Compact) / Android Mini | `scrollWidth === clientWidth` (Zero overflow) | Good (Min 44px tap targets) | Fullscreen overlay drawers functional | **PASS** |
| Standard Mobile | `360 x 800` | Samsung Galaxy A-Series | Zero overflow | Excellent | Clean modal rendering | **PASS** |
| Modern iPhone | `390 x 844` | iPhone 12/13/14 Standard | Zero overflow | Excellent | Sticky mobile CTA functional | **PASS** |
| Large Mobile | `414 x 896` | iPhone 11 Pro Max / Plus | Zero overflow | Excellent | Responsive card grids adapt | **PASS** |
| Tablet Portrait | `768 x 1024` | iPad Mini / Air (Portrait) | Zero overflow | Excellent | Sidebar collapses into mobile trigger | **PASS** |
| Tablet Landscape | `1024 x 768` | iPad (Landscape) | Zero overflow | Excellent | 2-column operational layout active | **PASS** |
| Laptop / Notebook | `1280 x 800` | MacBook Air / 13" Ultrabook | Zero overflow | Excellent | Fixed sidebar navigation visible | **PASS** |
| Standard Desktop | `1440 x 900` | 24" Desktop Display | Zero overflow | Excellent | Full high-density layout | **PASS** |
| High-Res Desktop | `1920 x 1080` | Full HD 27" Monitor | Zero overflow | Excellent | Centered max-width containers | **PASS** |

---

## 2. In-Depth Responsive Findings

### 1. Mobile Drawer Architecture (320px–414px)
- **Behavior:** On viewports under 768px, complex operational sidebars (such as Technician Dossier, Service History Vehicle Timeline, and Job Card Detail Inspector) automatically transform into smooth full-screen bottom-to-top drawers with a dedicated top `BACK` action bar.
- **Verification:** Tested at `320px` and `375px`. Zero body horizontal scrolling was detected.

### 2. Table Layout Fluidity
- **Behavior:** Data-dense tables (Leads, Appointments, Service Visits) utilize horizontal swipe containers with visual fade boundaries on mobile, preventing page-level horizontal displacement.
- **Verification:** Verified in `LeadsView` and `JobCardsView` without breaking the fixed top header.

### 3. Public Sticky Mobile CTA
- **Behavior:** The public website features a fixed bottom action bar (`BOOK CONSULTATION` / `TALK TO SPECIALIST`) that automatically unmounts when the Smart Enquiry Modal is open, preventing visual stacking and touch-blocking artifacts.
- **Verification:** Passed across all 4 mobile viewports.
