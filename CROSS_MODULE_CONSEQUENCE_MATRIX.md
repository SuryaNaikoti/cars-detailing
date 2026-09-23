# TORQUE EXPERT'S WORKSHOP OS V4.0
# CROSS-MODULE CONSEQUENCE MATRIX (CROSS_MODULE_CONSEQUENCE_MATRIX.md)

**Audit Date**: September 22, 2026  
**Subject**: Exhaustive Verification of Cascading State Changes Across Modules  

---

### CASCADING CONSEQUENCE TRACE TABLE

| Operational Trigger | Primary Record Changed | Secondary Records Updated | Affected Modules | Audit Event Logged | Customer Portal Effect | Verified in Code |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Convert Lead to Appointment** | `Lead.status = 'CONVERTED'` | Creates `AppointmentRecord` | Leads, Appointments, Control Center | `tl-lead-*`, `tl-apt-*` | None | `convertLeadToAppointment()` in `demoStore.ts:3554` |
| **Check-in Appointment** | `Appointment.status = 'CHECKED_IN'` | Records `check_in_time`, odo, fuel | Appointments | `tl-apt-*` | None | `updateAppointmentStatus()` in `demoStore.ts:3639` |
| **Convert Appointment to Job Card** | `Appointment.status = 'CONVERTED'` | Reuses/creates `CustomerRecord`, `VehicleRecord`; Creates `JobCard` | Appointments, Workshop Floor, Job Cards, Customers, Vehicles | `tl-apt-*`, `tl-job-*` | Registers public token for tracking | `convertAppointmentToJobCard()` in `demoStore.ts:3693` |
| **Reassign Workshop Bay** | `JobCard.bay = newBay` | None (Single Source of Truth) | Workshop Floor, Job Cards | `tl-*` (Bay Reassigned) | None (Internal allocation) | `reassignJobBay()` in `demoStore.ts:3112` |
| **Assign Technician** | `JobCard.technician = newTech` | `syncTechnicianWorkloads()` updates assigned list & BUSY/AVAILABLE status | Technicians, Job Cards, Workshop Floor | `tl-*` (Tech Assignment) | None (Technician phone/private info hidden) | `syncTechnicianWorkloads()` in `demoStore.ts:3142` |
| **Complete Inspection** | `Inspection.status = 'COMPLETED'` | `JobCard.status = 'INSPECTION_COMPLETED'` | Inspections, Job Cards, Workshop Floor | `tl-insp-*`, `tl-*` | Milestone: "Inspection Complete" | `completeInspection()` in `demoStore.ts:3910` |
| **Add Finding to Estimate** | `Finding.add_to_estimate = true` | `Estimate.items` appends new line item; `Finding.estimate_line_item_id` linked | Inspections, Estimates | `et-*` (Finding Added) | Scope added to customer quote viewer | `addFindingToEstimate()` in `demoStore.ts:4190` |
| **Customer Approves Quote** | `Estimate.status = 'APPROVED'` | `Estimate.approved_total` calculated; `JobCard.approval_status = 'APPROVED'` | Quote Portal, Estimates, Job Cards, Control Center | `et-*` (Customer Decision) | Quote shows authorized confirmation banner | `recordEstimateDecisions()` in `demoStore.ts:4246` |
| **Authorize Work Orders** | `Estimate.status = 'CONVERTED_TO_WORK'` | `JobCard.work_items` populated from approved line items; `JobCard.status = 'ESTIMATE_APPROVED'` | Estimates, Job Cards, Workshop Floor | `et-*` (Work Authorized), `tl-*` | Status: "Technician & parts scheduled" | `authorizeApprovedEstimateWork()` in `demoStore.ts:4342` |
| **Start Mechanical Work** | `JobCard.status = 'WORK_IN_PROGRESS'` | Technician workload flag active; Bay shows in-progress amber badge | Workshop Floor, Job Cards, Technicians, Analytics | `tl-*` (Work In Progress) | Milestone: "Service In Progress" | `updateJobStatus()` in `demoStore.ts:3072` |
| **Quality Check Pass** | `JobCard.status = 'QUALITY_CHECK'` | Added to Floor QC inspection queue | Workshop Floor, Job Cards | `tl-*` (QC Phase) | Milestone: "Quality Check Underway" | `updateJobStatus()` in `demoStore.ts:3072` |
| **Stage for Collection** | `JobCard.status = 'READY_FOR_COLLECTION'` | Vehicle removed from bay; added to Collection Staging queue | Workshop Floor, Job Cards, Reports | `tl-*` (Ready for Collection) | Milestone: "Vehicle Ready for Pickup" | `updateJobStatus()` in `demoStore.ts:3072` |
| **Vehicle Handover (Delivery)** | `JobCard.status = 'DELIVERED'` | `Customer.last_service_date` set; `Customer.active_job_id` cleared; Archival Service History entry recorded; Future Service Reminder generated | Job Cards, Workshop Floor, Service History, Customers, Reminders, Reports, Analytics | `tl-*` (Delivered) | Tracker: "Vehicle Collected. Handover Complete" | `updateJobStatus()` in `demoStore.ts:3072` & confirmed modal in `JobCardDetailView.tsx` |
