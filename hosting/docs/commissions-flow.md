Commissions Flow – Service Orders and Sales

Overview
- Products: Commission is defined per product (`product.commission`) and attributed to the sale operator.
- Services: Commission is defined per service item. The commission receiver should be the service executor (technician/mechanic) when selected; otherwise it falls back to the sale operator.

What Was Fixed
- Preserve service executor and commission when converting a Service Order to a Cashier Sale.
  - File: `src/app/pages/cashier/cashier-front/components/cashier-pdv/cashier-pdv.component.ts`
  - Change: for each `service.types` item, we now persist `executor` and `commission` in the sale payload.
- Include service commissions in cashier summaries and dashboards.
  - File: `src/app/pages/reports/components/modal/components/cashier/cashier.service.ts`
  - Change: sum service commissions into `totalCommission` and `balance.commission` (already included in costs).
- Attribute commissions in reports to the correct collaborator.
  - File: `src/app/pages/reports/components/modal/components/financial/financial.service.ts`
  - Synthetic report: aggregates by collaborator, assigning product commissions to the sale operator and service commissions to the service executor (fallback to operator). Accepts both `item.services` and `item.service.types` sources.
  - Analytical report: emits one record for product commission (operator) and one record per service executor with the service commission.

What Was Changed (Latest Round)
- Selector UX: technician remains selected after save/edit
  - File: `src/app/pages/services/serviceOrders/components/modal/components/register/register.component.html`
  - Changed the technician `<select>` to standalone `ngModel` so it keeps the selected value even when collaborators load asynchronously.
- Preserve executor/commission when (re)selecting services
  - File: `src/app/pages/registers/services/components/selector/selector.component.ts`
  - `selectServices(...)` now re-applies `executor` and `commission` from the OS to the selector items on edit.
- Technician editability rule (canEditExecutor)
  - File: `src/app/pages/services/serviceOrders/components/modal/components/register/register.component.ts`
  - Current rule: editable until index 2 (the first 3 steps: BUDGET, AUTORIZATION, PARTS). After that, the selector is disabled but shows the saved technician.
  - To change easily: update the comparison in `canEditExecutor()` (e.g., `currentIndex <= 3`) or make it configurable (e.g., read `SO_ExecutorMaxStageIndex` from localStorage and use that value, default 2).
- Commission reports simplified (focus on paying commission)
  - Removed Partial Revenue from commission reports to avoid confusion; kept only sale value/base and commissions.
  - Synthetic (Commissions): columns = Collaborator | Sale Value | Commission; footer shows totals of both.
  - Analytical (Commissions): shows per-line records with Origin (Product/Service), Sale Value, %, Commission. Footer shows total sales and total commission only.
  - Files:
    - View: `src/app/pages/reports/components/modal/components/financial/layer/layer.component.html`
    - Service: `src/app/pages/reports/components/modal/components/financial/financial.service.ts`
- Collaborator filter restored (synthetic & analytical)
  - UI: `src/app/pages/reports/components/modal/components/financial/financial.component.{ts,html}`
  - Sends `{ username, code, name }` to filter; service filters against `collaboratorId` (username or code) and `collaborator` (name). Totals recomputed after filter.

Behavioral Notes
- If a sale contains services executed by multiple collaborators, the commission totals are split per collaborator; sales total appears associated to each collaborator that received commission in that sale (this matches a commissions-centric view). If you prefer pro-rating sales totals, we can extend the implementation later.
- If a service has no `executor`, the commission is attributed to the sale operator.

Editing Window (Technician Selector)
- New OS: always editable.
- Existing OS: editable up to stage index 2 (the first 3 stages). After that, the selector is disabled (read-only value visible).
- To extend/shrink the window, adjust `canEditExecutor()` as indicated above.

Performance
- No new database reads were introduced in data paths. All changes compute from data already present in the sale documents.
- Commission aggregation remains O(n) over the sale items; no cross-document joins.

Related Data Fields
- Service Orders (`ServiceOrders`): `services[].executor`, `services[].commission` (type/value/enabled)
- Cashier Sales (`CashierSales`): `service.types[].executor`, `service.types[].commission`, `products[].commission`, `operator`

Validation Checklist
- Register/update a Service Order with services and selected executors.
- Convert/charge the Service Order in the PDV (Complete Payment).
- Confirm in `CashierSales` that service types have `executor` and `commission`.
- Open Financial > Commissions reports (Synthetic/Analytical): commissions appear under the correct collaborator.
- Use the Collaborator filter to pay commissions individually in both reports.

Changelog (summary)
- Add: executor/commission persisted to `CashierSales.service.types[]`.
- Fix: selector keeps technician after save/edit.
- Fix: OS services selector preserves executor/commission on edit.
- Change: commission reports show only Sale Value and Commission (no Partial Revenue), with Product/Service split in Analytical.
- Add: collaborator filter reinstated for both commission reports.
