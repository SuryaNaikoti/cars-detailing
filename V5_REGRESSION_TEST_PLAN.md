# TORQUE EXPERT'S WORKSHOP OS V5.0
# WORKFLOW-BASED REGRESSION TEST PLAN (V5_REGRESSION_TEST_PLAN.md)

**Generated Date**: September 22, 2026  
**Subject**: End-to-End Workflow-Based Verification Strategy  

---

## 1. TEST STRATEGY PRINCIPLES

Tests are organized strictly around **operational business workflows** rather than individual pages. Every test validates that state transitions, data lineage, side effects, and customer privacy boundaries behave correctly across the entire operational chain.

---

## 2. 10 CORE OPERATIONAL WORKFLOW TEST SUITES

### WORKFLOW 1: Lead $\rightarrow$ Appointment $\rightarrow$ Job Card Conversion
- **Trace**: New enquiry intake $\rightarrow$ Qualification $\rightarrow$ Scheduled appointment $\rightarrow$ Arrival check-in with odometer/fuel $\rightarrow$ Conversion to Job Card.
- **Verification Criteria**:
  - Customer phone and vehicle registration are normalized and deduplicated.
  - Linked `lead_id` and `appointment_id` appear on the resulting `JobCard`.
  - Lead status moves to `CONVERTED`; Appointment moves to `CONVERTED`.

---

### WORKFLOW 2: Job Card $\rightarrow$ Bay & Technician Allocation
- **Trace**: Unassigned Job Card placed in bay $\rightarrow$ Technician assigned $\rightarrow$ Workload synced.
- **Verification Criteria**:
  - Bay occupancy updates immediately on Workshop Floor.
  - Assigned technician's active job count increments by 1.
  - Technician status transitions from `AVAILABLE` to `BUSY`.
  - Bay reassignment audit event is appended to job timeline.

---

### WORKFLOW 3: Job Card $\rightarrow$ Inspection $\rightarrow$ Findings $\rightarrow$ Estimate Scope
- **Trace**: Technician completes 30-point DVI $\rightarrow$ Records findings $\rightarrow$ Flags recommendation "Add to Estimate".
- **Verification Criteria**:
  - Job Card transitions to `INSPECTION_COMPLETED`.
  - Finding appends as a new line item in `EstimateRecord.items`.
  - Finding stores bidirectional `estimate_line_item_id`.
  - Total proposed scope value increases by the item line total.

---

### WORKFLOW 4: Estimate $\rightarrow$ Customer Decision $\rightarrow$ Approved Work
- **Trace**: Customer opens `/quote/:token` $\rightarrow$ Approves scheduled items while declining optional detailing $\rightarrow$ Submits decision.
- **Verification Criteria**:
  - Estimate status transitions to `PARTIALLY_APPROVED`.
  - `approved_total` and `declined_total` reflect exact item-line math.
  - **(CF-01)** High-priority follow-up reminder is automatically spawned for declined items.
  - Job Card approval status updates to `APPROVED`.

---

### WORKFLOW 5: Approved Work $\rightarrow$ Work In Progress $\rightarrow$ Quality Check
- **Trace**: Advisor authorizes work $\rightarrow$ Job moves to `WORK_IN_PROGRESS` $\rightarrow$ Technician finishes tasks $\rightarrow$ Job advances to `QUALITY_CHECK`.
- **Verification Criteria**:
  - Approved estimate items transfer into `JobCard.work_items`.
  - Customer status tracker milestone stepper highlights "Service In Progress".
  - Quality Check queue on Workshop Floor displays vehicle for road testing.

---

### WORKFLOW 6: Ready for Collection $\rightarrow$ Delivery Handover $\rightarrow$ Service History
- **Trace**: Vehicle staged in collection bay $\rightarrow$ Advisor confirms vehicle handover in delivery modal.
- **Verification Criteria**:
  - Consequential confirmation modal requires explicit advisor acknowledgment.
  - Bay occupancy is cleared and marked available.
  - Customer `active_job_id` is cleared; `last_service_date` is set to today.
  - Permanent archive record created in Service History.
  - Customer portal reflects "Vehicle Handover Complete".

---

### WORKFLOW 7: Service History $\rightarrow$ Reminder Follow-Up Cycle
- **Trace**: Delivery completion generates future periodic service reminder.
- **Verification Criteria**:
  - Reminder is linked to `customer_id` and `vehicle_id`.
  - Due date is scheduled 6 months in the future.
  - Contextual WhatsApp deep link contains pre-filled vehicle details and service due message.

---

### WORKFLOW 8: Customer-Facing Portal Privacy & Security
- **Trace**: Inspect network payloads and DOM of `/quote/:token` and `/service-status/:token`.
- **Verification Criteria**:
  - Zero internal technician comments, staff cost prices, or margins rendered.
  - Customer name display is masked (`Rahul M.`) on status portal.
  - Invalid tokens render a secure, styled `Service Tracking Not Found` screen.

---

### WORKFLOW 9: Deterministic Demo Reset
- **Trace**: User triggers "RESET DEMO DATA" in Settings with confirmation.
- **Verification Criteria**:
  - All 11 storage keys restore to canonical seed definitions.
  - View reloads cleanly without broken references.
  - No source files, migrations, or dev configurations are altered.

---

### WORKFLOW 10: Cross-Module State & KPI Consistency
- **Trace**: Inspect Reports and Analytics views across all date ranges.
- **Verification Criteria**:
  - Operational Throughput $= (\text{Jobs Delivered} / \text{Jobs Opened}) \times 100$.
  - Completion Rate and Approval Rate return `0%` on zero denominators.
  - Zero instances of "Revenue", "Profit", or "Actual Sales".
  - Delivered historical jobs are strictly excluded from overdue alert queues.
