# TORQUE EXPERT'S WORKSHOP OS V4.0
# V5 REMEDIATION & PRODUCTION ROADMAP (V5_REMEDIATION_ROADMAP.md)

**Audit Date**: September 22, 2026  
**Subject**: Prioritized Engineering Roadmap for Enterprise Hardening (V5)  

---

### 1. ROADMAP PRIORITIZATION FRAMEWORK

- **P0 (CORRECTNESS / DATA INTEGRITY / SECURITY)**: Essential requirements to ensure zero data loss, strict tenant isolation, and cryptographic security.
- **P1 (CRITICAL WORKFLOW GAPS)**: Operational requirements to handle multi-advisor concurrency and edge-case exceptions.
- **P2 (OPERATIONAL IMPROVEMENTS)**: Quality-of-life enhancements for workshop personnel.
- **P3 (FUTURE EXTENSIONS)**: Post-launch feature additions.

---

### 2. DETAILED ACTION ITEMS

#### Priority P0 — Correctness, Data Integrity & Security
1. **Relational Database Migration (PostgreSQL / Supabase)**:
   - Transition `demoStore.ts` client persistence to a transactional relational database schema matching normalized interfaces in `types/index.ts`.
   - Enforce database-level foreign key constraints (`ON DELETE RESTRICT`) to permanently prevent orphan records.
2. **Server-Side Authentication & Row-Level Security (RLS)**:
   - Implement JWT-based authentication for workshop personnel.
   - Enforce database RLS policies matching the 18x6 capability matrix in `TeamView.tsx`.
3. **Cryptographically Signed Customer Portal Tokens**:
   - Upgrade customer tokens (`track-bmw-jc2047`, `demo-quote-bmw`) to HMAC-SHA256 signed tokens with short expiration times and rate-limiting.
4. **Append-Only System Audit Database Table**:
   - Implement database triggers logging every state mutation (`actor_id`, `record_id`, `before_state`, `after_state`, `timestamp`).

---

#### Priority P1 — Critical Workflow Gaps
1. **Multi-User Real-Time Floor Synchronization**:
   - Integrate WebSocket / PostgreSQL CDC channels so bay reassignments and status advances immediately reflect across all workshop screens without page reloads.
2. **Dedicated Media Object Storage for Inspection Photos**:
   - Replace static URL assets with presigned multipart uploads to S3 / Cloudflare R2 object storage.
3. **Formal Estimate Rejection Follow-Up Queue**:
   - When a customer declines scope items on the Quote Portal, automatically route a high-priority follow-up card into the Service Advisor's Reminders queue.

---

#### Priority P2 — Operational Improvements
1. **Printable / Downloadable PDF Quotations**:
   - Add clean server-side PDF generation formatted on official Torque Expert workshop letterhead.
2. **Customer Digital Handover Signature**:
   - Capture signature on delivery screen prior to archiving to Service History.
3. **Multi-Technician Bay Allocations**:
   - Allow secondary helper technicians to be assigned to complex mechanical overhauls alongside the lead master technician.

---

#### Priority P3 — Future Enterprise Extensions
1. **WhatsApp Cloud API Webhook Integration**:
   - Add automated WhatsApp status notifications alongside the existing manual contextual click-to-chat links.
2. **Multi-Branch Workshop Network Console**:
   - Allow enterprise multi-location workshop owners to toggle between facilities from a unified management console.
