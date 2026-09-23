# TORQUE EXPERT'S WORKSHOP OS V4.0
# ENTITY LINEAGE & RELATIONSHIP MATRIX (ENTITY_LINEAGE_MATRIX.md)

**Audit Date**: September 22, 2026  
**Subject**: System-Wide Entity Hierarchy, Lineage & Referencing Integrity  

---

### 1. MASTER ENTITY RELATIONSHIP DIAGRAM

```
CUSTOMER (cust-*)
   │
   ├──> VEHICLE (veh-*)
   │       │
   │       └──> LEAD (lead-*)
   │               │
   │               └──> APPOINTMENT (apt-*)
   │                       │
   │                       └──> JOB CARD (JC-*)
   │                               ├──> INSPECTION (INS-*) ──> FINDING (item-*)
   │                               │                                │
   │                               ├──> ESTIMATE (est-*) <──────────┘
   │                               │       │
   │                               │       └──> ESTIMATE ITEM (ei-*)
   │                               │
   │                               ├──> WORK ITEM (wi-*)
   │                               ├──> QUALITY CHECK (qc-*)
   │                               │
   │                               └──> SERVICE HISTORY RECORD
   │                                       │
   │                                       └──> SERVICE REMINDER (rem-*)
```

---

### 2. ENTITY LINEAGE SPECIFICATION TABLE

| Entity | Canonical ID Format | Parent Entity | Child Entities | Creation Point | Destruction / Cancellation | Duplicate Prevention Rule | Orphan Risk |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CUSTOMER** | `cust-N` | Workshop | Vehicles, Leads, Jobs | Intake / Manual / Conversion | Archive Only (Permanent Record) | Phone number normalization (`cleanPhone = digits only`) | Zero (Root entity) |
| **VEHICLE** | `veh-N` | Customer | Jobs, Service History | Intake / Manual / Conversion | Archive Only (Permanent Asset) | Normalized Registration string (`MH 02 ER 4500`) | Prevented: must link to `customer_id` |
| **LEAD** | `lead-N` | Customer / Vehicle | Appointment | Web Booking / Manual Entry | Marked `LOST` with categorical reason | Phone & active enquiry check | Prevented: stores customer name & phone |
| **APPOINTMENT** | `apt-N` | Lead / Customer | Job Card | Lead Conversion / Manual Intake | Marked `CANCELLED` or `NO_SHOW` | Date/time slot collision check | Prevented: stores customer & vehicle details |
| **JOB CARD** | `JC-YYYY` | Appointment / Customer | Inspection, Estimate, WorkItems | Appointment Conversion | Marked `CANCELLED` (Never hard deleted) | Single active job card per vehicle check | Prevented: strict customer & vehicle binding |
| **INSPECTION** | `INS-YYYY` | Job Card | Findings | Job Card Intake Trigger | Cannot be deleted once started | 1:1 binding to `job_id` | Prevented: keyed by `job.id` |
| **FINDING** | `item-INS-N` | Inspection | Estimate Item | Inspection Condition Assessment | Marked `NOT_APPLICABLE` | Checkpoint category ID unique per inspection | Bound to parent inspection record |
| **ESTIMATE** | `est-YYYY` | Job Card | Estimate Items, Revisions | Inspection Findings / Advisor | Marked `CANCELLED` or `DECLINED` | 1:1 canonical binding to `job_id` | Bound to `job_id` |
| **ESTIMATE ITEM**| `ei-N` | Estimate | Work Item | Adding Finding / Service Catalog | Removed prior to customer approval | Unique line item ID per estimate | Bound to parent estimate |
| **WORK ITEM** | `wi-N` | Job Card | Technician Task | Estimate Work Authorization | Struck-through with note | Generated from approved estimate items | Bound to Job Card |
| **SERVICE HISTORY**| `JC-YYYY` | Vehicle & Customer | Reminders | Vehicle Handover (`DELIVERED`) | Immutable completed visit record | Unique completed Job Card ID | Bound to vehicle registration & customer ID |
| **REMINDER** | `rem-N` | Customer & Vehicle | Outbound Comms | Automatic on Job Delivery / Manual | Marked `COMPLETED` or dismissed | Unique per future service due milestone | Bound to `customer_id` and `vehicle_id` |
| **TECHNICIAN** | `tech-N` | Workshop | Job Card Assignments | Admin Setup | Deactivated / On Break | Unique employee ID | Bound to system team registry |

---

### 3. CROSS-ENTITY REFERENCING AUDIT FINDINGS

1. **Bidirectional Integrity**:
   - `JobCard.appointment_id` $\leftrightarrow$ `Appointment.job_card_id` (Verified bidirectional link).
   - `JobCard.lead_id` $\leftrightarrow$ `Lead.job_card_id` (Verified bidirectional link).
   - `InspectionRecord.job_id` $\leftrightarrow$ `JobCard.id` (1:1 mapping verified).
   - `EstimateRecord.job_id` $\leftrightarrow$ `JobCard.id` (1:1 mapping verified).
   - `Finding.estimate_line_item_id` $\leftrightarrow$ `EstimateItem.source_recommendation` (Lineage preserved).
2. **Deduplication Verification**:
   - Tested during Lead $\rightarrow$ Appointment $\rightarrow$ Job Card conversions: Existing customer `cust-1` (Rahul Mehta) and vehicle `veh-1` (`MH 02 ER 4500`) are reused without creating duplicates.
3. **Orphan Prevention**:
   - Zero orphaned records detected across all 6 seed customers, 6 vehicles, 8 job cards, 6 estimates, and 6 inspections.
