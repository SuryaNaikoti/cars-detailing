# FULL MODULE TEST MATRIX
**Platform:** Torque Expert — Workshop Operating System  
**Test Standard:** Real Browser Interactions & Cross-Module State Verification  

| Module # | Module Area | Tested URL / Subroute | Operational Status | UI / Browser | Data Propagation | Responsive (320px–1920px) | Critical Issues |
|---|---|---|---|---|---|---|---|
| 01 | Public Homepage (14 Chapters) | `http://localhost:5173/` | **PASS** | PASS | PASS | PASS | None |
| 02 | Public Services Page | `http://localhost:5173/?page=services` | **PASS** | PASS | PASS | PASS | None |
| 03 | Public Book Service Page | `http://localhost:5173/?page=book` | **PASS** | PASS | PASS | PASS | None |
| 04 | Public FAQs Page | `http://localhost:5173/?page=faqs` | **PASS** | PASS | PASS | PASS | None |
| 05 | Public Contact Page | `http://localhost:5173/?page=contact` | **PASS** | PASS | PASS | PASS | None |
| 06 | Private Workshop OS Sales Page | `http://localhost:5173/private/workshop-os` | **PASS** | PASS | PASS | PASS | Verified unlinked from public navigation |
| 07 | Control Center Overview | `http://localhost:5173/dashboard?module=overview` | **PASS** | PASS | PASS | PASS | None |
| 08 | Workshop Floor (Bayside Operations) | `http://localhost:5173/dashboard?module=floor` | **PASS** | PASS | PASS | PASS | None |
| 09 | Leads & Enquiries | `http://localhost:5173/dashboard?module=leads` | **PASS** | PASS | PASS | PASS | None |
| 10 | Appointments & Intake Desk | `http://localhost:5173/dashboard?module=appointments` | **PASS** | PASS | PASS | PASS | None |
| 11 | Job Cards (Master Execution) | `http://localhost:5173/dashboard?module=jobs` | **PASS** | PASS | PASS | PASS | None |
| 12 | Digital Vehicle Inspections (DVI) | `http://localhost:5173/dashboard?module=inspections` | **PASS** | PASS | PASS | PASS | None |
| 13 | Estimates & Customer Approvals | `http://localhost:5173/dashboard?module=estimates` | **PASS** | PASS | PASS | PASS | None |
| 14 | Customers Directory | `http://localhost:5173/dashboard?module=customers` | **PASS** | PASS | PASS | PASS | None |
| 15 | Vehicles Directory | `http://localhost:5173/dashboard?module=vehicles` | **PASS** | PASS | PASS | PASS | None |
| 16 | Service History & Lifecycle Records | `http://localhost:5173/dashboard?module=service-history` | **PASS** | PASS | PASS | PASS | None |
| 17 | Reminders & Follow-Ups (Retention) | `http://localhost:5173/dashboard?module=reminders` | **PASS** | PASS | PASS | PASS | None |
| 18 | Technicians & Workforce | `http://localhost:5173/dashboard?module=technicians` | **PASS** | PASS | PASS | PASS | None |
| 19 | Communications Log & WhatsApp | `http://localhost:5173/dashboard?module=communications` | **PASS** | PASS | PASS | PASS | Client-side WhatsApp deep link |
| 20 | Workshop Reports (Financial Scope) | `http://localhost:5173/dashboard?module=reports` | **PASS** | PASS | PASS | PASS | None (Scope terminology strictly used) |
| 21 | Workshop Executive Analytics | `http://localhost:5173/dashboard?module=analytics` | **PASS** | PASS | PASS | PASS | None |
| 22 | Team & Permissions Workspace | `http://localhost:5173/dashboard?module=team` | **PASS** | PASS | PASS | PASS | Client-side role simulation |
| 23 | Workshop Settings & Governance | `http://localhost:5173/dashboard?module=settings` | **PASS** | PASS | PASS | PASS | None |
| 24 | Customer Quote Portal | `http://localhost:5173/quote/:token` | **PASS** | PASS | PASS | PASS | Zero internal note/margin leaks |
| 25 | Customer Service Status Tracker | `http://localhost:5173/service-status/:token` | **PASS** | PASS | PASS | PASS | Zero internal note/technician leaks |
| 26 | Demo Data Reset & Seeding Engine | `Settings -> Reset Demo Data` | **PASS** | PASS | PASS | PASS | Restores all 6 canonical Job Cards |
