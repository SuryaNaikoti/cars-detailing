# TORQUE EXPERT'S WORKSHOP OS V4.0
# PRODUCTION ARCHITECTURE GAP ANALYSIS (PRODUCTION_ARCHITECTURE_GAP.md)

**Audit Date**: September 22, 2026  
**Subject**: Architectural Delta Between Current Prototype & Multi-Tenant Enterprise Backend  

---

### 1. ARCHITECTURAL OVERVIEW

The current version of Torque Expert's Workshop OS operates on an in-browser reactive state model (`demoStore.ts`) backed by `localStorage`. While this provides deterministic behavior, sub-millisecond local responses, and complete offline capability for demos, transitioning to an enterprise multi-tenant workshop deployment requires transitioning to a tiered client-server architecture.

```
CURRENT DEMO ARCHITECTURE:
React Components ──> demoStore.ts ──> localStorage (Single Browser Session)

TARGET PRODUCTION ARCHITECTURE (V5):
React UI (Client) ──> App Service / Repository Layer ──> REST / WebSocket API ──> PostgreSQL / Supabase (RLS)
```

---

### 2. ARCHITECTURAL DELTA BY SYSTEM COMPONENT

| Component / Layer | Current Demo Baseline | Enterprise Production Requirement | Technical Migration Path |
| :--- | :--- | :--- | :--- |
| **Data Storage** | Browser `localStorage` (synchronous JSON stringification) | PostgreSQL 16+ with relational schemas, foreign keys, and indexes | Define Supabase / Prisma schema matching `types/index.ts` domain models. |
| **Concurrency & Collaboration** | Single tab; multi-tab updates require manual reload or window focus | Real-time bi-directional synchronization (WebSockets / Supabase Realtime) | Subscribe floor bays, job cards, and quotes to Postgres CDC (Change Data Capture) channels. |
| **Authentication & Identity** | Simulated role switcher (`TEAM-1` to `TEAM-6`) in UI state | Secure JWT-based identity (e.g. Supabase Auth, OAuth2, Session Cookies) | Enforce authenticated session tokens and HTTP-only cookies. |
| **Authorization & Permissions** | UI-rendered 18x6 permission matrix (`canView`, `canEdit`) | Row-Level Security (RLS) policies and backend API middleware | Implement database RLS policies matching `RoleCapability` matrix. |
| **Audit Logging** | In-memory timeline derivation across records (`getSystemAuditEvents`) | Append-only database table (`system_audit_logs`) with trigger-based tracking | Set up immutable PostgreSQL audit trigger capturing `actor_id`, `record_id`, `diff`. |
| **Customer Portals** | Token-based query parameters reading shared client storage | Isolated public API endpoints with short-lived cryptographically signed tokens | Generate HMAC-SHA256 signed tokens with expiration and rate limiting. |
| **Asset Storage (DVI Photos)** | Unsplash luxury vehicle URLs embedded in seed records | S3 / Cloudflare R2 object storage with CDN signed upload URLs | Direct multipart presigned upload from technician camera to object store. |
| **Communications** | Client-side `https://wa.me/` deep links with prefilled message | WhatsApp Business Cloud API webhooks with delivery status receipts | Meta WhatsApp Business API integration with automated webhooks. |

---

### 3. DATA SCHEMA READINESS

The TypeScript domain interfaces in [`src/types/index.ts`](file:///e:/Projects/Car%20Detailing/src/types/index.ts) are already normalized:
- Foreign keys (`customer_id`, `vehicle_id`, `job_card_id`, `estimate_id`, `appointment_id`, `lead_id`) are explicitly mapped.
- Entity primary keys use clean string identifiers.
- Timelines and audit notes use ISO-8601 UTC timestamps.

Transitioning to relational tables will require zero conceptual restructuring of the business domain.
