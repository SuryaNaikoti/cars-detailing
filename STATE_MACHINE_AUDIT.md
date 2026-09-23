# TORQUE EXPERT'S WORKSHOP OS V4.0
# STATE MACHINE & WORKFLOW TRANSITION AUDIT (STATE_MACHINE_AUDIT.md)

**Audit Date**: September 22, 2026  
**Subject**: State Machine Lifecycle Definitions, Prerequisites, Side Effects & Rollbacks  

---

### 1. LEAD LIFECYCLE STATE MACHINE

```
NEW ──> CONTACTED ──> QUALIFIED ──> FOLLOW_UP_DUE ──> APPOINTMENT_REQUESTED ──> APPOINTMENT_CONFIRMED ──> CONVERTED
  │         │             │                │                     │                       │
  └─────────┴─────────────┴────────────────┴─────────────────────┴───────────────────────┴───────────────> LOST
```

- **Valid Transitions**:
  - `NEW` $\rightarrow$ `CONTACTED` | `LOST`
  - `CONTACTED` $\rightarrow$ `QUALIFIED` | `FOLLOW_UP_DUE` | `LOST`
  - `QUALIFIED` $\rightarrow$ `APPOINTMENT_REQUESTED` | `APPOINTMENT_CONFIRMED` | `LOST`
  - `FOLLOW_UP_DUE` $\rightarrow$ `CONTACTED` | `QUALIFIED` | `LOST`
  - `APPOINTMENT_REQUESTED` $\rightarrow$ `APPOINTMENT_CONFIRMED` | `LOST`
  - `APPOINTMENT_CONFIRMED` $\rightarrow$ `CONVERTED` (via `convertLeadToAppointment`) | `LOST`
- **Prerequisites**:
  - Transition to `LOST` requires a mandatory `LostReason` (`PRICE`, `COMPETITOR`, `CUSTOMER_DECLINED`, etc.) and optional notes.
  - Transition to `CONVERTED` requires appointment creation with valid date and time slot.
- **Side Effects**:
  - Creates timestamped `LeadTimelineEvent`.
  - On `CONVERTED`, instantiates canonical `AppointmentRecord` and links `appointment_id`.
- **Customer Portal Consequence**: None (internal CRM pipeline only).

---

### 2. APPOINTMENT LIFECYCLE STATE MACHINE

```
REQUESTED ──> CONFIRMED ──> ARRIVED ──> CHECKED_IN ──> CONVERTED
    │             │           │             │
    └─────────────┴───────────┴─────────────┴────────> CANCELLED / NO_SHOW
```

- **Valid Transitions**:
  - `REQUESTED` $\rightarrow$ `CONFIRMED` | `CANCELLED`
  - `CONFIRMED` $\rightarrow$ `ARRIVED` | `CANCELLED` | `NO_SHOW`
  - `ARRIVED` $\rightarrow$ `CHECKED_IN` | `CANCELLED`
  - `CHECKED_IN` $\rightarrow$ `CONVERTED` (via `convertAppointmentToJobCard`)
- **Prerequisites**:
  - `CHECKED_IN` requires odometer reading and fuel level capture.
  - `CONVERTED` requires bay assignment and assigned technician.
- **Side Effects**:
  - On `ARRIVED`, captures `arrival_time`.
  - On `CHECKED_IN`, captures `check_in_time`, odometer, and fuel level.
  - On `CONVERTED`, creates active `JobCard`, registers on Workshop Floor reception queue.
- **Customer Portal Consequence**: Prepares vehicle record for customer tracking generation.

---

### 3. JOB CARD EXECUTION STATE MACHINE (CANONICAL MASTER)

```
VEHICLE_RECEIVED ──> INSPECTION_COMPLETED ──> ESTIMATE_SENT ──> ESTIMATE_APPROVED ──> WORK_IN_PROGRESS ──> QUALITY_CHECK ──> READY_FOR_COLLECTION ──> DELIVERED
       │                     │                      │                   │                     │                  │                     │
       └─────────────────────┴──────────────────────┴───────────────────┴─────────────────────┴──────────────────┴─────────────────────┴──> CANCELLED
```

- **Valid Transitions & Business Prerequisites**:
  1. `VEHICLE_RECEIVED`: Vehicle on site, intake checklist completed.
  2. `INSPECTION_COMPLETED`: Multi-point DVI completed by technician. Findings compiled.
  3. `ESTIMATE_SENT`: Commercial scope authored from findings and shared with customer.
  4. `ESTIMATE_APPROVED`: Customer confirms full or partial scope via digital Quote Portal.
  5. `WORK_IN_PROGRESS`: Parts verified, technician authorized, bay occupied.
  6. `QUALITY_CHECK`: Mechanical work finished, road-test and diagnostic verification underway.
  7. `READY_FOR_COLLECTION`: QC sign-off, detailing complete, vehicle parked in collection bay.
  8. `DELIVERED`: Handover signed, vehicle departed.
- **Side Effects**:
  - On `WORK_IN_PROGRESS`, sets technician status to `BUSY`.
  - On `DELIVERED`:
    - Sets `delivered_at` timestamp.
    - Clears bay occupancy.
    - Clears customer's `active_job_id`.
    - Updates customer's `last_service_date`.
    - Archives completed record into Service History.
    - Generates 6-month periodic maintenance reminder.
- **Customer Portal Consequence**:
  - Real-time milestone stepper advances for customer viewing via `/service-status/:token`.
  - On `DELIVERED`, tracker reflects vehicle collected and periodic service interval scheduled.

---

### 4. ESTIMATE LIFECYCLE STATE MACHINE

```
DRAFT ──> SENT ──> VIEWED ──> APPROVED / PARTIALLY_APPROVED ──> CONVERTED_TO_WORK
  │         │         │                 │
  └─────────┴─────────┴─────────────────┴───────────────────> DECLINED / EXPIRED
```

- **Valid Transitions**:
  - `DRAFT` $\rightarrow$ `SENT` | `CANCELLED`
  - `SENT` $\rightarrow$ `VIEWED` | `APPROVED` | `PARTIALLY_APPROVED` | `DECLINED`
  - `VIEWED` $\rightarrow$ `APPROVED` | `PARTIALLY_APPROVED` | `DECLINED`
  - `APPROVED` | `PARTIALLY_APPROVED` $\rightarrow$ `CONVERTED_TO_WORK` (via `authorizeApprovedEstimateWork`)
- **Rollback Behavior**:
  - Advisors can create an estimate revision (`createEstimateRevision`), which archives current scope and resets estimate status to `DRAFT` for adjustments.
- **Customer Portal Consequence**:
  - Customer interacts directly via `/quote/:token` to approve or decline individual line items.
  - Updates `approved_total` and `declined_total` dynamically.
