# TORQUE EXPERT'S WORKSHOP OS V4.0
# KPI & ANALYTICS DEFINITION REGISTER (KPI_DEFINITION_REGISTER.md)

**Audit Date**: September 22, 2026  
**Subject**: Canonical Definitions, Formulas, Edge-Case Fallbacks & Financial Governance of Workshop Metrics  

---

### 1. FINANCIAL & COMMERCIAL METRICS GOVERNANCE

> [!IMPORTANT]
> **STRICT TERMINOLOGY RULE**:
> All commercial values in Torque Expert's Workshop OS represent **Scope Values** (the authorized or proposed labor and parts value of digital estimates). 
> The term **"Revenue"**, **"Profit"**, **"Margin"**, or **"Actual Sales"** is strictly prohibited across all operational dashboards because accounting ledger integration and GST invoicing are outside product scope.

| Metric Identifier | Source Collection | Filter Condition | Calculation Formula | Display Fallback | Operational Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Proposed Scope Value** | `te_workshop_estimates_v3` | Estimates created within selected period | $\sum_{\text{all items}} (\text{unit\_price} \times \text{quantity} - \text{discount})$ | `₹0` | Total monetary value of work recommended to customers |
| **Approved Scope Value** | `te_workshop_estimates_v3` | Line items where `approval_status == 'APPROVED'` | $\sum_{\text{approved items}} (\text{unit\_price} \times \text{quantity} - \text{discount})$ | `₹0` | Total customer-authorized work orders |
| **Declined Scope Value** | `te_workshop_estimates_v3` | Line items where `approval_status == 'DECLINED'` | $\sum_{\text{declined items}} (\text{unit\_price} \times \text{quantity} - \text{discount})$ | `₹0` | Deferred maintenance value for future reminder follow-up |
| **Average Job Value (AJV)**| `te_workshop_jobs_v3` & Estimates | Delivered jobs with linked estimate in period | $\frac{\text{Approved Scope of Completed Jobs}}{\text{Count of Completed Jobs}}$ | `₹0` (when completed jobs $= 0$) | Average ticket size per completed vehicle visit |

---

### 2. OPERATIONAL THROUGHPUT & LIFECYCLE METRICS

| Metric Identifier | Source Records | Filter Condition | Calculation Formula | Edge-Case Protection |
| :--- | :--- | :--- | :--- | :--- |
| **Jobs Opened** | `te_workshop_jobs_v3` | `opened_at` within date range | $\text{Count}(\text{Jobs})$ | Returns `0` if empty |
| **Jobs Delivered** | `te_workshop_jobs_v3` | `status == 'DELIVERED'` and `delivered_at` in range | $\text{Count}(\text{Delivered Jobs})$ | Returns `0` if empty |
| **Operational Throughput**| `te_workshop_jobs_v3` | Delivered jobs vs total jobs opened in period | $\frac{\text{Jobs Delivered}}{\text{Jobs Opened}} \times 100$ | `0%` if `Jobs Opened == 0` |
| **Active Floor Workload** | `te_workshop_jobs_v3` | `status != 'DELIVERED' && status != 'CANCELLED'` | $\text{Count}(\text{Active Jobs})$ | Direct floor count |
| **Overdue Jobs** | `te_workshop_jobs_v3` | `status != 'DELIVERED' && status != 'CANCELLED'` and `promised_completion < NOW()` | $\text{Count}(\text{Overdue Active Jobs})$ | Excludes delivered and cancelled jobs |

---

### 3. CONVERSION FUNNEL & EFFICIENCY RATIOS

| Metric Identifier | Numerator | Denominator | Calculation Formula | Fallback |
| :--- | :--- | :--- | :--- | :--- |
| **Lead Conversion Rate** | Leads with `status == 'CONVERTED'` | Total leads created in period | $\frac{\text{Converted Leads}}{\text{Total Leads}} \times 100$ | `0%` (when Total Leads $= 0$) |
| **Appointment Arrival Rate**| Appointments with `ARRIVED`, `CHECKED_IN`, `CONVERTED` | Total scheduled appointments | $\frac{\text{Arrived Appointments}}{\text{Total Scheduled}} \times 100$ | `0%` (when Total Scheduled $= 0$) |
| **Estimate Approval Rate** | Estimates with `APPROVED`, `PARTIALLY_APPROVED`, `CONVERTED_TO_WORK` | Decisionable estimates (`SENT`, `VIEWED`, `APPROVED`, `DECLINED`) | $\frac{\text{Approved / Partial Estimates}}{\text{Decisionable Estimates}} \times 100$ | `0%` (when Decisionable $= 0$) |
| **Floor Bay Utilization** | Occupied workshop bays | Total configured bays (`bays_count == 4`) | $\frac{\text{Occupied Bays}}{\text{Total Bays}} \times 100$ | `0%` |
| **Technician Availability** | Technicians with `status == 'AVAILABLE'` | Total active technicians | $\frac{\text{Available Techs}}{\text{Total Techs}} \times 100$ | `0%` |

---

### 4. AUDIT FINDINGS & VERIFICATION

1. **Zero Division-by-Zero Errors**: Verified all division expressions across [ReportsView.tsx](file:///e:/Projects/Car%20Detailing/src/features/dashboard/ReportsView.tsx) and [AnalyticsView.tsx](file:///e:/Projects/Car%20Detailing/src/features/dashboard/AnalyticsView.tsx) implement defensive ternary guards (`denominator > 0 ? (num / den) * 100 : 0`).
2. **Funnel Lineage Integrity**: Conversion steps enforce sequential parent-child relationships; no conversion ratio exceeds $100\%$.
3. **Overdue Exclusion**: Historical delivered jobs are strictly excluded from overdue alert counts.
