---
name: Scoped re-theme via CSS variable cascade
description: How to re-skin one part of an app (e.g. the authenticated shell) to a different visual design without affecting a marketing/landing page that shares the same shadcn/Tailwind CSS variable names and components.
---

When a redesign should apply only to some routes (e.g. dashboard/settings/admin/auth) but the app has a marketing/landing page sharing the same global `:root` tokens (`--background`, `--primary`, etc.) and some of the same shared components (`BrandMark`, `ImpactBadge`, `CurrencyPill`), don't touch the global `:root` tokens — the landing page reads them too and would silently re-skin along with everything else.

**Why:** CSS custom properties cascade normally, so overriding them inside a wrapper class (e.g. `.app-terminal { --background: #0a0a0a; ... }`) re-themes only the DOM subtree with that class, while `:root`-level consumers (landing page) keep the original values. This works for color tokens, radius tokens (if the theme derives `--radius-lg` etc. from a single `--radius`), and even custom utility classes (`gradient-primary`, `shadow-glow`) as long as those utilities reference `var(--...)` rather than hardcoding literal values — utilities with hardcoded values (e.g. a `.glass` backdrop-blur utility) need an explicit `.scope-class .utility-name { ... }` override instead.

**How to apply:** add a scope class in `styles.css` with all overridden tokens, apply the class only to the wrapper components used by the routes you're re-theming (e.g. the authenticated `AppShell` root div, and the standalone `/auth` page root div). For shared components also used outside the scope (e.g. `BrandMark` also rendered on the landing page), add an explicit `variant` prop instead of relying on CSS-only overrides when the design requires structural (not just color) differences — this avoids duplicating the component while keeping the out-of-scope usage pixel-identical.
