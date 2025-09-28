Global Updates (Super Admin)

Overview
- Super Admin can publish update notes that appear to all tenants.
- A small banner appears under the app header with the latest note, including an optional "Limpar cache" action.
- Users can dismiss the banner; dismissal is tracked per-tenant in localStorage.

Files
- Service: `hosting/src/app/@shared/services/updates.service.ts`
  - `publish(update)`: creates or updates a document in `SystemUpdates` collection
  - `latest()`: returns the most recent enabled update
  - `list(limit)`: lists recent updates for admin review
  - `markSeen(id)` / `lastSeen()`: per-tenant storage of last viewed update

- Banner component: `hosting/src/app/@shared/components/updates-banner/*`
  - Injected in layout: `hosting/src/app/@theme/layout/layout.component.html`
  - Shows title, message, version (optional).
  - Buttons: "Limpar cache agora" (calls `Utilities.clearCache(true)`) and "Ok, entendi" (marks as seen)

- Super Admin UI: `hosting/src/app/admin/super-admin/super-admin.component.{ts,html}`
  - New tab: "Atualizações"
  - Form: title, message, version (optional), require cache clear (checkbox), enabled (checkbox)
  - List: last updates with basic metadata

Data Model (SystemUpdates)
- `_id`: string `upd_<timestamp>`
- `title`: string
- `message`: string (plain text)
- `requireCacheClear`: boolean (default true)
- `version`: string (optional, e.g., 2.5.0)
- `enabled`: boolean (default true)
- `createdAt`: Date
- `createdBy`: operator snapshot

Behavior Notes
- Banner only shows if the latest enabled update `_id` differs from `LastSeenUpdate_<tenantId>` in localStorage.
- Clearing cache via the banner reloads the app to pick new assets.

Security/Scope
- Updates are global by design (no owner filter) so all tenants see them.
- Publishing occurs from Super Admin panel only.

Maintenance
- To disable a note without deleting, uncheck "Ativo" and publish a new one; the banner will not show it.

