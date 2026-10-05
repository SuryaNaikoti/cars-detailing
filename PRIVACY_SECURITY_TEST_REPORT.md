# PRIVACY & SECURITY AUDIT REPORT
**Platform:** Torque Expert — Workshop Operating System  
**Audit Standard:** Client Data Boundary Integrity, Exposure Prevention & Privacy Hardening  

---

## 1. Executive Summary

This audit evaluated client-side customer data privacy, sensitive pricing exposure, internal operational notes boundaries, and token handling across both customer-facing portals (`/quote/:token` and `/service-status/:token`) as well as internal workshop modules.

- **Critical Security Breach:** None found (Zero severe customer PII leaks).
- **Internal Margins / Wholesale Cost Exposure:** **ZERO LEAKAGE (PASS)**.
- **Internal Technician Notes Exposure:** **ZERO LEAKAGE (PASS)**.
- **Architectural Security Classification:** **CLIENT-SIDE DEMO / PRE-PRODUCTION BOUNDARY**.

---

## 2. Customer Portal Privacy Verification

### A. Digital Quote Viewer (`/quote/:token`)
- **Privacy Attack 1: Wholesale / Cost Price Inspection**
  - *Method:* Script evaluated rendered DOM, component attributes, and React state for keywords `cost price`, `internal cost`, `dealer cost`, `markup`, `margin %`.
  - *Result:* **PASS**. Only customer-approved retail prices, parts taxes (GST), and authorized totals are rendered.
- **Privacy Attack 2: Internal Technician Notes**
  - *Method:* Checked whether diagnostic remarks intended strictly for workshop technicians (`private technician notes`, `workshop internal flags`) leaked into the customer proposal view.
  - *Result:* **PASS**. Only customer-facing recommendation explanations are displayed.
- **Privacy Attack 3: Cross-Customer Data Bleed**
  - *Method:* Evaluated quote for `est-2049` (Porsche Macan GTS) to ensure details from `est-2047` (BMW 5 Series) or unrelated vehicles are completely omitted.
  - *Result:* **PASS**. Total isolation between token-scoped estimates.

### B. Customer Service Status Tracker (`/service-status/:token`)
- **Privacy Attack 1: Assigned Technician Exposure**
  - *Method:* Tested whether technician names (e.g., `Arjun Sharma`, `Rahul Sen`) or personal technician phone numbers appeared in the customer tracker.
  - *Result:* **PASS**. Tracker strictly renders workshop operational status ("Diagnostics Complete", "In Preparation") without exposing individual technician staff identities.
- **Privacy Attack 2: Workshop Floor Bay Mapping**
  - *Method:* Checked whether physical bay allocations (`BAY 01`, `BAY 02`) appeared in customer view.
  - *Result:* **PASS**. Customer view displays clean stage milestones without exposing internal physical bay logistics.

---

## 3. Token Tampering & Negative Scenarios

| Attack Vector | Test URL | Expected System Reaction | Actual Observed Reaction | Status |
|---|---|---|---|---|
| Invalid Service Tracker Token | `/service-status/invalid-token-xyz` | Controlled "Unable to Locate Job" / 404 Error Screen | Dedicated clean Not Found state rendered with contact link | **PASS** |
| Invalid Quote Portal Token | `/quote/non-existent-token` | Controlled "Quote Expired or Not Found" Screen | Dedicated fallback screen with workshop phone CTA | **PASS** |
| Empty Token Query | `/service-status/` | Fallback to default or controlled prompt | Graceful handling | **PASS** |

---

## 4. Known Architectural Security Limitations

> [!WARNING]
> While client-side data filtering and sanitization are strictly implemented, the platform currently operates with **Client-Side Simulation**. In a true production deployment, the following backend security controls are mandatory:
> 1. **Server-Side Token Resolution:** Quotes and tracker data must be resolved by an authenticated serverless endpoint rather than relying on browser-level filtering of `localStorage`.
> 2. **PostgreSQL Row-Level Security (RLS):** Database queries must be scoped to the authenticated tenant and customer ID.
> 3. **Cryptographic Token Expiry:** Public tracking tokens should use signed JWTs with explicit TTLs (time-to-live).
