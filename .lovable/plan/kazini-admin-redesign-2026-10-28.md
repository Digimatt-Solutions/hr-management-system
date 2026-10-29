# Kazini Admin redesign

## Outcome

Transform the existing HR app into Kazini Admin without duplicating working modules. Add a polished, one-page Kazini Shared public website and connect its registration form to secure admin client management.

## 1. Public website and registration

- Make `/` the public homepage for visitors and signed-in users; keep admin sign-in at `/auth` and the dashboard at `/dashboard`.
- Use the supplied Kazini logo, matching favicon, and app-specific page metadata.
- Follow the template’s strong full-width photograph, organized navigation, clear section hierarchy, and professional footer. Use orange accents with charcoal, white, and a complementary chart color rather than copying the template’s blue palette.
- Include About, workspace/membership options, registration, and contact sections on one page. Use supplied contact details; do not invent prices, opening hours, testimonials, or business statistics.
- A prominent registration button opens a mobile-friendly, scrollable popup with the logo centered at the top and grouped form sections.
- Capture every document field: full name, phone, email, residential address; company, industry, optional role, website, Facebook, LinkedIn and other social handles; membership checkboxes (Daily, Weekly, Monthly, Dedicated Desk, Meeting room), working-hours checkboxes (Morning, Afternoon, Evening, Flexible), coworking date, special requirements; emergency contact name, relationship and phone; comments, signature and signature date. Use a typed signature with explicit confirmation rather than claiming a legally certified digital signature.
- Show field-level validation, submitting state, failure feedback and a clear confirmation after successful storage. Include a privacy acknowledgement and service-message notice.

## 2. Client Management

- Add one admin-only Clients module with search, filters, pagination, full biodata view, create/edit, and confirmed deletion.
- Public submission uses a validated server action. Visitors cannot list or read client records; admin data access is enforced server-side and through database access rules.
- Save registration timestamps and source. Refresh records after mutations; never display hardcoded client samples.

## 3. Admin shell and dashboard

- Rebrand existing navigation, sign-in and page headings as Kazini Admin; retain working HR routes and their role protections.
- Reuse existing statistics components and chart library for total clients, recent registrations, employee totals and department totals.
- Add registration trends with labelled Date and Registrations axes, membership distribution, employee distribution by department, and recent clients. Charts use actual records with genuine loading, error and empty states.
- Top-right account menu shows the saved profile display name and image, with Profile Settings, Home and Logout.

## 4. Profile, employees and departments

- Extend existing account settings to validate and save display names and upload/remove profile photos. Read profile values consistently in the navbar rather than substituting employee names.
- Use private photo storage with owner-scoped uploads and authorized access.
- Complete existing employee create/view/edit/status-management flows; retain employee detail tabs and existing HR workflows.
- Extend the existing Departments module with edit and confirmed delete, prevent destructive deletion when records depend on a department, and refresh department selection after changes.
- Review affected access rules so non-admin users cannot alter privileged employee fields. Preserve intentional manager/staff workflows.
- Existing database records remain intact; do not delete prior staff or reference data without a separate request.

## 5. Airtouch SMS in Announcements

- Reuse Fundi Plug’s admin-authenticated sending workflow within the existing Announcements module, not a duplicate messaging module.
- Production Airtouch service messages only. Audience choices: all clients, recently registered clients using a date range, or selected individual clients.
- Resolve recipients from stored client records on the server; normalize phone numbers, remove duplicates, reject invalid messages and require a send confirmation with recipient count.
- Preserve announcements CRUD. Add broadcast history and accurate sent/failed/skipped outcomes; distinguish provider acceptance from confirmed delivery.
- Credentials/configuration remain a prerequisite: actual endpoint, username, password and ISSN/approved sender identity have not been supplied. Request them securely before implementing provider calls. Never reuse Fundi Plug credentials or invent values, and never send test SMS to real clients without explicit approval.
- Check whether Airtouch can use a custom secure connection; otherwise use securely stored project secrets matching its established authentication requirements.

## Technical approach

- Keep React, Vite, TypeScript, existing routing, auth, shadcn components and semantic design tokens. No new application server or framework migration.
- Add only the client/broadcast data structures and profile photo field required for these features; use managed migrations with explicit grants and row-level access controls.
- Validate public submissions and SMS on the server as well as in forms. Signed-in submission ownership comes from the validated session; deliberate guest submissions have no account owner.
- Record structural conventions in `AGENTS.md`; keep reusable form/validation logic shared instead of duplicating it.
- Reuse existing imagery where suitable. The supplied website template is reference material, not an embedded webpage. Any illustrative workspace imagery must not be presented as a verified photograph of Kazini’s premises.

## Verification

- Add focused tests for biodata validation, membership/hour options, phone normalization, admin access and SMS audience selection.
- Verify public registration saves, then sign in as an authorized admin and read/edit that same record through Clients.
- Verify saved profile names/photos in the navbar, employee and department CRUD, and database-driven dashboard updates.
- Check desktop and mobile layout, popup scrolling, loading/empty/error feedback, and existing HR navigation.
- Live SMS verification waits for provider setup and explicit approval for a designated test recipient; report that limitation separately if unavailable.

## Credit control

Reuse existing modules, controls and integrations; avoid additional dependencies, decorative complexity, duplicate pages and fabricated data. Implement the connected core systematically, with SMS gated only by missing provider details.
