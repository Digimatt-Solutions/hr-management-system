# Architecture rules

- Retain React/Vite and the existing HR routes; extend existing modules rather than duplicating them so established workflows remain available.
- Public client submissions go through the validated submit-client function; client records are readable and mutable only by administrators to protect visitor biodata.
- Keep client validation contracts aligned in src/lib/clients.ts and the edge function shared schema; both runtimes validate the same fields.
- Use profiles as the account display-name and photo source, independent of employee employment names, so account settings appear consistently.
- Use private owner-scoped profile photo storage and signed image URLs so uploads do not become public documents.
- Provider credentials stay server-side; SMS recipient audiences are resolved from client IDs on the server, never arbitrary browser-supplied phone lists.
- Module visibility is persisted in module_visibility and applied through ModuleContext to navigation and protected pages; Settings is always recoverable and visibility never replaces database authorization.
