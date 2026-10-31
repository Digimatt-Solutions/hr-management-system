# Brand color rollback — orange ⇄ lime

Current brand color: **lime green `#9ecc04`** = `hsl(74 96% 41%)`.
Previous brand color: **Kazini orange** (`hsl(24 90% 54%)` light / `hsl(25 95% 53%)` dark).

Everything brand-colored is driven by design tokens in `src/index.css`, so rolling
back is a token swap plus two class-name swaps. Nothing else needs touching.

## 1. Tokens — `src/index.css`

| Token | Now (lime) | Was (orange) |
| --- | --- | --- |
| `--primary` | `74 96% 41%` | `24 90% 54%` |
| `--primary-foreground` | `0 0% 7%` | `0 0% 100%` |
| `--primary-ink` | `76 88% 24%` | *(did not exist)* |
| `--accent` / `--accent-foreground` | `74 96% 41%` / `0 0% 7%` | `24 90% 54%` / `0 0% 100%` |
| `--ring` | `74 96% 41%` | `24 90% 54%` |
| `--chart-community` | `78 80% 30%` | `168 52% 34%` |
| `--sidebar-primary` / `-foreground` | `74 96% 41%` / `0 0% 7%` | `24 90% 54%` / `0 0% 100%` |
| `--sidebar-ring` | `74 96% 41%` | `24 90% 54%` |
| `--gradient-primary` | `hsl(74 96% 41%)` → `hsl(80 90% 27%)` | `hsl(24 90% 54%)` → `hsl(18 91% 48%)` |
| `--shadow-glow` | `0 0 20px hsl(74 96% 41% / 0.32)` | `0 0 20px hsl(25 95% 53% / 0.3)` |
| `.dark --primary` / `--accent` / `--ring` / `--sidebar-primary` | `76 92% 52%` | `25 95% 53%` |
| `.dark --primary-foreground` / `--accent-foreground` / `--sidebar-primary-foreground` | `0 0% 7%` | `0 0% 100%` |
| `.dark --primary-ink` | `76 92% 55%` | *(did not exist)* |

## 2. Class swaps — components (`src/**/*.tsx`)

`text-primary` → `text-primary-ink` and `border-primary` → `border-primary-ink`
(added so brand-colored text and thin outlines stay readable on white; the pure
`#9ecc04` fill is kept for buttons, chips, switches and focus rings).

Revert with:

```bash
perl -pi -e 's/\btext-primary-ink\b/text-primary/g; s/\bborder-primary-ink\b/border-primary/g' \
  $(rg -l --glob '*.tsx' 'text-primary-ink|border-primary-ink' src/)
```

Then remove the `ink: "hsl(var(--primary-ink))"` line from the `primary` block in
`tailwind.config.ts`.

## 3. Hardcoded values that were orange

- `src/pages/Clients.tsx` print sheet: `#f37021` → `#9ecc04` (header rule),
  `#567307` (brand label), membership chip `#cfe39a` / `#f7fce8` / `#4a5f07`.
  Orange originals: `#f37021`, `#f4c4a8`, `#fff7f1`, `#9a4315`.
- `src/pages/Clients.tsx` buttons: `bg-orange-600 text-white hover:bg-orange-700`
  → `bg-primary text-primary-foreground hover:bg-primary/90`.
- `src/pages/Clients.tsx` chips/rings: `bg-orange-50 text-orange-700`,
  `ring-orange-100`, `focus-visible:ring-orange-500`, avatar tint
  `bg-amber-100 text-amber-800` → `bg-primary/10 text-primary-ink`,
  `ring-primary-ink/15`, `focus-visible:ring-primary`, `bg-lime-100 text-lime-800`.
- `src/pages/Home.tsx`: `text-orange-400` / `text-orange-300` → `text-primary`;
  two `bg-primary` buttons changed from `text-white` to `text-primary-foreground`.
- `src/pages/Announcements.tsx`: the **high** priority badge moved from orange to
  yellow (`border-yellow-200 bg-yellow-50 text-yellow-700` + dark variants) so the
  low → normal → high → urgent severity ladder stays readable.

## 4. Not changed

- The Kazini logo artwork (`src/assets/kazini-logo.png`, `public/favicon.png`) is
  still the orange glossy wordmark — it is an image, not a theme color.
- Semantic status colors stay as they were: success green `142 76% 36%`,
  warning amber `38 92% 50%`, destructive red `0 84% 60%`.

## 5. Fastest rollback

`git` history holds the pre-change files, so reverting `src/index.css`,
`tailwind.config.ts`, `src/pages/Clients.tsx`, `src/pages/Home.tsx` and
`src/pages/Announcements.tsx` to the previous commit restores orange in one step.
