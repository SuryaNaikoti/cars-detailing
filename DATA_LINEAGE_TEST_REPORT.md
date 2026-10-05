# DATA LINEAGE TEST REPORT
**Platform:** Torque Expert — Workshop Operating System  
**Audit Scope:** End-to-End Entity Lineage, Referential Integrity & Deduplication  

---

## 1. Traceability Lifecycle Chain

The complete lifecycle was audited across all canonical and dynamically created test entities:

```
[Public Website Enquiry]
       ↓ (Generates unique lead ID)
[Workshop OS Lead Record]
       ↓ (Normalizes customer phone & registration; deduplicates against CRM)
[Customer Entity] + [Vehicle Asset Record]
       ↓ (Appointment scheduling)
[Service Appointment Record]
       ↓ (Arrival marking & physical intake checklist)
[Workshop Job Card Record]
       ↓ (Generates public tracking token & links customer + vehicle)
[Digital Vehicle Inspection (DVI)]
       ↓ (Findings categorized with severity & recommendations)
[Commercial Estimate]
       ↓ (Line-item parts + labour breakdown; generates public quote token)
[Customer Decision on Quote Portal]
       ↓ (Approved items update Job Card scope; Declined items trigger CF-01 auto-reminder)
[Workshop Floor Execution]
       ↓ (Bay allocation & Technician workload balancing)
[Quality Check & QC Queue]
       ↓ (Final road test & supervisor verification)
[Handover & Delivery Modal]
       ↓ (Frees bays & workloads)
[Service History Archival]
       ↓ (Chronological log & multi-visit vehicle timeline)
[Retention Service Reminders]
```

---

## 2. Live Lineage Execution Verification

### Test Case: Autonomous Intake & Lifecycle Trace
- **Customer:** QA Customer Alpha
- **Phone:** `+91 90000 10001`
- **Vehicle:** 2023 Porsche 911 Carrera (Registration: `QA 01 AB 1001`)
- **Reported Issue:** Unexplained boost lag under acceleration. Intermittent CEL.

#### Entity Record Links Discovered:
1. **Lead Record:** `lead-1791196858490`
   - *Status:* `NEW` → `QUALIFIED` → `CONVERTED`
   - *Customer Association:* `QA Customer Alpha`
2. **Appointment Record:** `apt-1791196862476`
   - *Status:* `CONFIRMED` → `ARRIVED`
   - *Lead Foreign Key:* `lead-1791196858490`
3. **Job Card Record:** `JC-2057`
   - *Status:* `VEHICLE_RECEIVED` → `WORK_IN_PROGRESS`
   - *Appointment Foreign Key:* `apt-1791196862476`
   - *Public Status Token:* `track-jc2057-2fr8`
   - *Technician Assigned:* Arjun Sharma
   - *Bay Assigned:* BAY 03
4. **Customer Service Status Portal:**
   - *Route:* `/service-status/track-jc2057-2fr8`
   - *State:* Successfully loaded vehicle marque, model, intake status, and stage progress.
   - *Privacy:* Zero technician names or internal cost figures leaked.

---

## 3. Referential Integrity & Deduplication Audit

| Integrity Metric | Audit Method | Canonical Count | Orphaned / Dangling Records | Integrity Status |
|---|---|---|---|---|
| Customer Records | Phone normalization & exact match | 6 records | 0 | **PASS (100%)** |
| Vehicle Records | Registration normalization (capitalization & spacing) | 6 records | 0 | **PASS (100%)** |
| Job Cards Lineage | Verified `customer_name` and `vehicle_model` links | 8 records | 0 | **PASS (100%)** |
| Estimates Lineage | Verified `job_card_id` and line-item sums | 6 records | 0 | **PASS (100%)** |
| Inspections Lineage | Verified `job_id` association | 6 records | 0 | **PASS (100%)** |
| Reminders Lineage | Verified `vehicle_id` and customer links | 7 records (seed) | 0 | **PASS (100%)** |

### Key Deduplication Findings:
- Submitting an enquiry for existing customer **Rahul Mehta** (`+91 98765 43210`) with registration `MH 02 ER 4500` correctly matches and reuses `cust-1` and `veh-1`, preventing dirty duplicate entries in the CRM directory.
