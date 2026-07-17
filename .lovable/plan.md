# EventPulse — Build Plan

A premium dark-mode fintech SaaS that will later notify traders of high-impact economic events. This phase ships architecture, DB schema, and UI only — no FMP API calls, no email scheduler.

## Stack
- TanStack Start (React + TS, already scaffolded)
- Tailwind v4 with a custom dark fintech design system (oklch tokens in `src/styles.css`)
- Lovable Cloud (Supabase) for DB + Auth
- shadcn/ui components, lucide-react icons, sonner toasts, framer-motion for subtle motion

## Design system
- Dark by default: deep near-black background, elevated card surface, cyan/emerald accent, warning amber, danger red — all as semantic tokens.
- Typography: Space Grotesk (display) + Inter (body), loaded via `<link>` in `__root.tsx`.
- Rounded-2xl cards, subtle gradients on hero + KPI cards, soft glow shadows, generous spacing.
- Reusable primitives: `PageHeader`, `StatCard`, `EmptyState`, `Skeleton` variants, `ImpactBadge`, `CurrencyPill`, `SectionCard`.

## Routes (file-based, TanStack)
Public
- `/` — Landing: Hero, Features, How it Works, Pricing (Free/Pro placeholder), FAQ, Footer, CTA to `/auth`.
- `/auth` — Login + Register tabs, "Forgot password" link, email verification notice.
- `/reset-password` — set new password (required companion to forgot flow).

Authenticated (under `_authenticated/`, integration-managed gate)
- `/dashboard` — Welcome card, Upcoming Events (empty state), Notification Status, Subscription Summary, Recent Notifications (empty state).
- `/settings` — Currencies (8 checkboxes), Impact Levels, Notification Times, Email, Save button (persists to `subscriptions`).
- `/admin` — Admin-only (checked via `has_role`): Event Management (list/create/edit stub), Notification Logs, User List, System Status. Non-admins get a 403 view.

## Database (migration)
All in `public` schema, RLS on, explicit GRANTs, all timestamps `timestamptz`.

- `profiles` — `id uuid pk references auth.users on delete cascade`, `email text`, `created_at`. Auto-created via `handle_new_user` trigger on `auth.users`.
- `subscriptions` — `id uuid pk`, `user_id uuid unique references auth.users`, `currencies text[]`, `impact_levels text[]`, `notification_times int[]` (hours before), `email text`, `created_at`, `updated_at`. Upsert on save.
- `events` — `id uuid pk`, `title`, `currency`, `impact` (enum: low/medium/high), `forecast`, `previous`, `actual`, `event_time timestamptz`, `country`, `created_at`. Public SELECT to `authenticated`; INSERT/UPDATE/DELETE admin-only.
- `notification_logs` — `id uuid pk`, `user_id`, `event_id`, `notification_type text`, `sent_at`. User can SELECT own; admin sees all.
- `app_role` enum (`admin`, `user`) + `user_roles` table + `has_role(uuid, app_role)` SECURITY DEFINER function (per security rules — roles NEVER on profiles).

RLS pattern: user rows scoped to `auth.uid()`; admin overrides via `has_role(auth.uid(), 'admin')`.

## Server functions (prepared, no external calls yet)
In `src/lib/*.functions.ts`:
- `getMySubscription`, `upsertMySubscription`
- `getUpcomingEvents` (reads `events` table — empty until seeded)
- `getMyNotificationLogs`
- Admin: `adminListUsers`, `adminListEvents`, `adminUpsertEvent`, `adminListLogs`, `adminSystemStatus` — all `.middleware([requireSupabaseAuth])` + `has_role` check inside handler.

## Component structure
```
src/
  components/
    landing/ (Hero, Features, HowItWorks, Pricing, FAQ, Footer, Nav)
    dashboard/ (WelcomeCard, UpcomingEvents, NotificationStatus, SubscriptionSummary, RecentNotifications)
    settings/ (CurrencyPicker, ImpactPicker, NotificationTimesPicker, EmailField)
    admin/ (EventsTable, LogsTable, UsersTable, SystemStatus)
    ui/ (shadcn + shared: PageHeader, StatCard, EmptyState, ImpactBadge, CurrencyPill, AppShell, AppSidebar)
  lib/ (server fns + client helpers)
  routes/ (as above)
```

## Out of scope this phase
- FMP API polling / ingestion
- Email sending / cron scheduler
- Stripe billing (Pricing is visual placeholder only)

## Sitemap/robots
Added at end per template convention (public routes only: `/`, `/auth`).

Proceeding to enable Lovable Cloud, then implement.