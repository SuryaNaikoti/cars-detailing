# TORQUE EXPERT'S WORKSHOP OS V5.0
# SYSTEM-LEVEL DEPENDENCY GRAPH (V5_DEPENDENCY_GRAPH.md)

**Generated Date**: September 22, 2026  
**Subject**: Root-Cause to Visible-Symptom Dependency Tracing  

---

## 1. CANONICAL SYSTEM DEPENDENCY TOPOLOGY

```
[Customer Record] + [Vehicle Record]
       │
       ▼
[Lead / Enquiry Record]
       │ (convertLeadToAppointment)
       ▼
[Appointment Record]
       │ (convertAppointmentToJobCard)
       ▼
[Job Card Master Record] ◄─────────────────────────────────┐
       │                                                   │
       ├──> [Floor Bay Occupancy]                          │
       │           │                                       │
       │           ▼                                       │
       │    Workshop Floor View                            │
       │                                                   │
       ├──> [Technician Assignment]                        │
       │           │                                       │
       │           ▼                                       │
       │    syncTechnicianWorkloads()                      │
       │           │                                       │
       │           ▼                                       │
       │    Technicians View & Busy Status                 │
       │                                                   │
       ├──> [Inspection Record]                            │
       │           │                                       │
       │           ▼                                       │
       │     Inspection Findings                           │
       │           │                                       │
       │           ▼                                       │
       ├──> [Estimate Record]                              │
       │           │                                       │
       │           ├──> Line Items (Scope Calculation)     │
       │           │           │                           │
       │           │           ▼                           │
       │           │    Customer Quote Portal              │
       │           │           │                           │
       │           │           ▼                           │
       │           │    Customer Decision (Approve/Decline)│
       │           │           │                           │
       │           ▼           ▼                           │
       │    (CF-01: Auto-Follow-Up) ──> [Reminders Queue]  │
       │           │                                       │
       │           ▼                                       │
       │    (authorizeApprovedEstimateWork)                │
       │           │                                       │
       │           ▼                                       │
       │    Job Card Work Items ───────────────────────────┘
       │           │
       │           ▼
       ├──> [Quality Check Verification]
       │           │
       │           ▼
       ├──> [Vehicle Delivery Handover] (CF-03: Digital Signature)
       │           │
       │           ├──> [Service History Archive]
       │           │
       │           └──> [Periodic Service Reminder]
       │
       ▼
[Customer Safe Projection (getCustomerSafeJobView)]
       │
       ▼
[Customer Service Status Portal]
```

---

## 2. ROOT-CAUSE VS. SYMPTOM REMEDIATION TRACE

### Trace 1: Estimate Decline $\rightarrow$ Follow-Up Generation (CF-01)
- **Visible Symptom**: After a customer declines scope on the Quote Portal, the Service Advisor does not see a reminder to follow up on the declined safety recommendation in the Reminders & Follow-ups dashboard.
- **Root Cause**: `recordEstimateDecisions()` in `src/lib/demoStore.ts` updates the estimate totals and syncs status to `JobCard`, but fails to call `createServiceReminder()`.
- **Dependency Flow**:
  ```
  Customer clicks "Decline" on Quote Portal
      ↓
  recordEstimateDecisions(token, decisions) [Root Cause Fix]
      ↓
  Estimate status = 'DECLINED' or 'PARTIALLY_APPROVED'
      ↓
  createServiceReminder({ reminder_type: 'DECLINED_RECOMMENDATION' })
      ↓
  te_workshop_reminders_v3 updated
      ↓
  RemindersView automatically displays high-priority follow-up card
      ↓
  Advisor sends WhatsApp follow-up via pre-filled link
  ```

---

### Trace 2: Technician Workload Synchronization
- **Visible Symptom**: Assigning a technician to a Job Card or marking a Job Card delivered must immediately update that technician's workload count and `BUSY`/`AVAILABLE` status.
- **Root Cause**: Handled centrally in `syncTechnicianWorkloads()`, ensuring that no separate counter exists.
- **Dependency Flow**:
  ```
  JobCard.technician updated OR JobCard.status updated
      ↓
  saveJob(job)
      ↓
  syncTechnicianWorkloads() [Single Source of Truth]
      ↓
  Technician active_jobs_count recalculates directly from active JobCards
      ↓
  TechniciansView & WorkshopFloor reflect exact capacity
  ```

---

### Trace 3: Vehicle Delivery $\rightarrow$ Multi-Module State Cascade
- **Visible Symptom**: Completing vehicle delivery must simultaneously clear the bay, update customer last service date, archive visit history, update customer portal, and schedule future service.
- **Root Cause**: Handled in `updateJobStatus(jobId, 'DELIVERED')` and protected by the delivery confirmation modal in `JobCardDetailView.tsx`.
- **Dependency Flow**:
  ```
  Advisor confirms delivery in modal
      ↓
  updateJobStatus(jobId, 'DELIVERED')
      ↓
  Customer.last_service_date set; Customer.active_job_id cleared
      ↓
  Bay cleared on Workshop Floor
      ↓
  Service History view displays completed dossier
      ↓
  Customer Portal reflects "Vehicle Handover Complete"
      ↓
  Automatic 6-month periodic maintenance reminder scheduled
  ```
