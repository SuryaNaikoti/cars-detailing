# PRODUCTION GAP REPORT
**Platform:** Torque Expert — Workshop Operating System  
**Current Architecture:** Client-Side Single Page Application (React 19 + TypeScript + Vite + localStorage demoStore)  
**Target Architecture:** Multi-Tenant Enterprise Automotive SaaS Platform  

---

## 1. Architectural Gap Analysis

While the current platform delivers extraordinary visual fidelity, realistic operational logic, and end-to-end data consistency across all workshop modules, it remains architecturally situated as a **Pre-Production Demo / Front-End Prototype**.

The following 11 architectural requirements represent the gap between the current state and enterprise multi-tenant production:

| Production Gap # | Architecture Area | Current Implementation | Production Requirement | Remediation Effort |
|---|---|---|---|---|
| **GAP-01** | Persistent Database | Local storage (`localStorage`) within client browser | Managed PostgreSQL / Supabase with schema migrations (Prisma / Drizzle) | High (Database migration & API endpoints) |
| **GAP-02** | Multi-Tenancy Isolation | Single workshop profile hardcoded in demo store | Tenant ID column partitioning with strict Row-Level Security (RLS) policies | High (Multi-tenant data isolation) |
| **GAP-03** | Server-Side Authentication | Simulated dropdown role switcher (Advisor, Manager, Tech) | Cryptographic Auth (Supabase Auth / NextAuth / OAuth2) with secure HTTP-only cookies | Medium |
| **GAP-04** | Role-Based Access Control (RBAC) | Client-side route and component filtering | Server-side API middleware authorization enforcing permissions per role | Medium |
| **GAP-05** | Real-Time Synchronization | In-memory store updates within the same browser tab | Real-time WebSockets / Supabase Realtime for instant bay & technician updates across tablets | Medium |
| **GAP-06** | Cloud Storage & Media Pipeline | Base64 strings or placeholder image URLs | S3 / Cloudflare R2 bucket with secure pre-signed URLs for vehicle inspection photos | Medium |
| **GAP-07** | Automated WhatsApp Business Integration | Client-side `wa.me` deep links requiring manual clicking | Meta Cloud WhatsApp Business API with templated messages and delivery webhooks | Medium |
| **GAP-08** | Multi-Tab Storage Sync | No `storage` event broadcast listener | Storage event listener or BroadcastChannel API for instant cross-tab coherence | Low |
| **GAP-09** | Financial Audit Log & Immutability | Audit logs held in demo store array | Append-only immutable ledger database table for tax invoices and payment reconciliations | Medium |
| **GAP-10** | Automated Backup & Disaster Recovery | Browser manual reset | Automated daily point-in-time PostgreSQL backups and disaster failover | Handled via Cloud Provider |
| **GAP-11** | Production CDN & Caching Headers | Vite local development bundle | Production CDN (Cloudflare / AWS CloudFront) with aggressive asset caching and HTTP/3 | Handled via Cloud Provider |

---

## 2. Production Transition Roadmap

1. **Phase 1: Backend Scaffolding & API Layer**
   - Connect Supabase / PostgreSQL instance.
   - Establish relational tables: `tenants`, `users`, `customers`, `vehicles`, `leads`, `appointments`, `job_cards`, `inspections`, `estimates`, `reminders`, `technicians`.
2. **Phase 2: Authentication & Authorization**
   - Replace simulated user profile switcher with Supabase Auth.
   - Attach RLS policies matching tenant IDs.
3. **Phase 3: Real-Time Floor Balancing**
   - Wire Supabase Realtime subscriptions to the Workshop Floor bay cards so service advisors and bay mechanics see job state updates live on workshop tablets.
4. **Phase 4: WhatsApp Cloud API & Webhooks**
   - Replace manual `wa.me` links with background automated messaging upon status transitions (`READY_FOR_COLLECTION`, `ESTIMATE_SENT`).
