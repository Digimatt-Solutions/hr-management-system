# Authentication, navigation, and responsive UI upgrade

## What will change

- Rebuild the public authentication page as a polished split screen: the supplied workplace photo on the left and a focused form on the right.
- Add accessible **Login** and **Sign Up** tabs, clear labels, useful field icons, password visibility controls, validation, loading/error states, and a required agreement linking to Privacy Policy and Terms & Conditions pages.
- Keep PeopleHub HR branding while applying the strongest Fundi Plug patterns: segmented tabs, restrained form container, strong orange action buttons, clear typography, consistent spacing, and mobile-first behavior.
- Update the application palette to orange (`#f37020`), white, and black through semantic theme tokens so existing screens inherit the brand consistently.
- Add the authenticated user's name and avatar initials to the header with a dropdown for **Profile**, **Profile Settings**, and **Logout**.
- Add a fixed mobile bottom bar for the most-used sections and retain a hamburger control for the complete navigation drawer. The drawer will close after mobile navigation and the page will reserve space for the bottom bar.
- Refine shared layout spacing and overflow behavior across desktop, tablet, and mobile without rewriting working HR pages.

## Admin setup security

- Keep the existing role value internally for compatibility, but present it as **Super Admin**.
- Harden first-admin assignment in the database with a transaction-level lock so concurrent sign-ups cannot create multiple Super Admins.
- Keep setup availability derived from the database: setup is available only when no Super Admin role exists, unavailable immediately after creation, and available again only after that account and its cascading role record are deleted.
- Keep the setup page check, but treat it only as presentation; the database trigger remains the authority even if someone bypasses the page or calls authentication directly.
- Improve the setup screen to clearly explain its one-time status and redirect safely when setup is closed.

## Routing and compatibility

- Preserve `BrowserRouter`, all current protected/public route wrappers, nested employee routes, redirects, and refresh behavior.
- Add public policy routes without changing existing route meanings.
- Reuse the current sidebar, sheet, dropdown, buttons, fields, authentication context, and role infrastructure.

## Technical details

- Upload the supplied photo through the project asset pipeline and reference its hosted asset pointer.
- Add client-side form schemas and input limits while retaining backend authentication validation.
- Update the existing new-user database trigger rather than adding a separate user store or alternative authentication path.
- Verify compilation, database security behavior, desktop/mobile rendering, tab switching, drawer behavior, dropdown dismissal, route navigation, and absence of overlap at representative viewport sizes.
