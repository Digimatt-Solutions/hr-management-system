# Digimatt branding refresh

## What will change

- Upload the supplied Digimatt logo through the project asset pipeline and use it as the centered brand mark above the authentication form.
- Add a refined bordered white form panel with restrained shadow and spacing on the authentication page.
- Remove the existing PeopleHub badge and label from the top-left of the authentication photo while retaining the photo and supporting message.
- Replace the sidebar’s text-only PeopleHub heading with the Digimatt logo, including a compact logo treatment when the sidebar is collapsed.
- Change the sidebar from black to a light neutral gray treatment while preserving orange active states, readable contrast, and existing navigation behavior.
- Create a square favicon from the supplied logo and update the page icon.

## Technical details

- Keep all authentication, routing, mobile navigation, and role behavior unchanged.
- Store the main logo as a hosted asset pointer; keep only the required square favicon in the public folder.
- Use the existing semantic color tokens so the sidebar remains theme-compatible.
- Verify compilation and inspect the authentication page at desktop and mobile sizes.
