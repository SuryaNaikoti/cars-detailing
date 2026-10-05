# DEFECT REGISTER
**Platform:** Torque Expert — Workshop Operating System  
**Audit Standard:** Strict Observation | Zero Source Code Modifications  

---

### Defect Classification Severity Scale:
- **P0 — Blocker:** Platform unusable / severe data loss / critical privacy breach.
- **P1 — Critical:** Major core workflow broken with no workaround.
- **P2 — High:** Important business feature impaired or architectural inconsistency.
- **P3 — Medium:** Minor functional limitation, validation quirk, or UX friction.
- **P4 — Low / Cosmetic:** Visual polish issue or minor layout nuance.

---

| Defect ID | Title | Severity | Classification | Module | Description | Steps to Reproduce | Expected Result | Actual Result | Business Impact | Recommended Remediation |
|---|---|---|---|---|---|---|---|---|---|---|
| **DEF-01** | Multi-Tab Storage Event Synchronization Missing | **P2** | Known Limitation / Gap | Core Storage Layer | Changes saved to `localStorage` in Browser Tab A do not dispatch state update events to active components in Tab B without a manual page reload. | 1. Open `/dashboard?module=leads` in Tab A.<br>2. Open the same route in Tab B.<br>3. Create a lead in Tab A.<br>4. Observe Tab B. | Tab B receives `storage` event and refreshes local React state. | Tab B remains on old state until manually reloaded. | Concurrent advisors in multiple tabs may view stale records. | Attach a global `window.addEventListener('storage', ...)` listener inside `demoStore` to rehydrate React state hooks. |
| **DEF-02** | Role-Based Access Control is Client-Side Only | **P3** | Production Gap | Team & Permissions | Switching between Service Advisor, Workshop Manager, and Technician only alters client-side navigation visibility; direct URL parameters can access any view. | 1. Log in / select Advisor role.<br>2. Navigate to `?module=settings` directly via URL. | Route restricted or redirected with 403 Forbidden. | Settings view renders unrestricted. | Suitable for demonstration only; unacceptable for production multi-tenant environments. | Implement server-side JWT session validation with Supabase / PostgreSQL Row-Level Security (RLS). |
| **DEF-03** | WhatsApp Delivery Relies on Contextual Deep Links | **P3** | Known Limitation | Communications / Reminders | Clicking "WhatsApp" opens `https://wa.me/` client protocol rather than executing a background cloud webhook or automated messaging worker. | 1. Open Reminders view.<br>2. Click "WhatsApp" action on any overdue card. | Cloud API sends background templated WhatsApp message. | Browser triggers external WhatsApp Web / desktop application link. | Manual advisor action required for every communication. | Integrate Meta Cloud WhatsApp Business API with webhook delivery receipts for true automation. |
| **DEF-04** | Direct URL Reload on Dynamic Subroutes Requires SPA Fallback | **P4** | Cosmetic / Infrastructure | Routing | Reloading nested routes (e.g., `/private/workshop-os` or `/service-status/:token`) requires the Vite dev server rewrite or static hosting 404 rewrite to `index.html`. | 1. Navigate to `/service-status/track-bmw-jc2047`.<br>2. Perform hard refresh in certain static servers without rewrite rules. | SPA renders route smoothly. | May result in 404 unless web server rewrites to `index.html`. | Minor risk during static Nginx / S3 deployment if rewrite rules are omitted. | Configure proper `try_files $uri $uri/ /index.html;` in production deployment manifests. |
| **DEF-05** | Date Filtering in Reports Defaults to Lifetime Scope | **P4** | UX / Usability | Workshop Reports | When entering the Reports module, the initial view displays "All Time" metrics rather than standard month-to-date (MTD). | 1. Navigate to `/dashboard?module=reports`.<br>2. Inspect initial date filter toggle. | Default to "This Month" for daily operational focus. | Defaults to "All Time" aggregation. | Advisors must click "This Month" each time they seek current period figures. | Set initial date filter state to `'month'` in `ReportsView.tsx`. |
