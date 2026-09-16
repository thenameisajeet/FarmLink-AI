# FarmLink AI — SIH 26033

Direct agri marketplace prototype: Farmer / Vendor / Consumer portals.
Pure HTML/CSS/JS. No frameworks, no build step — open any `.html` file directly or serve the folder.

## How to run
```
cd frontend
python3 -m http.server 5500
```
Then open:
- Farmer:   http://localhost:5500/farmer/index.html
- Vendor:   http://localhost:5500/vendor.html
- Consumer: http://localhost:5500/consumer.html

## Structure
```
frontend/
  shared/base.css     ← design system (variables, components) used by all 3 portals
  shared/shared.js     ← theme toggle, toast, mobile menu, localStorage helpers
  farmer/
    index.html          dashboard
    sell-crop.html       listing form (writes to localStorage)
    marketplace.html     buyer requirements + connect flow
    listings.html        CRUD on your listings (pause/delete)
    orders.html          order status + accept action
    demand-forecast.html AI forecast (demo data, clearly labeled)
    route-optimizer.html route breakdown + re-optimize button
    logistics.html       shipment tracker
    payments.html        transactions + withdraw
    support.html         FAQ + contact form
    js/app.js            nav rendering, EN/HI/MR translation system, sell modal
    style.css            farmer-specific tweaks
  vendor.html           single-page vendor command center (section-switching)
  consumer.html         single-page consumer storefront (working cart + checkout)
backend/                empty — future phase
```

## What's actually functional right now (Phase 1-2 complete)
- **Navigation**: every sidebar item works and highlights the active page, on every farmer page.
- **Theme**: dark/light toggle, persists via localStorage (`farmlink-theme`), independent per browser.
- **Language**: farmer portal has a real EN/Hindi/Marathi translation system (`farmlink-language` key) —
  numbers, prices, and proper nouns are preserved, only UI chrome translates. Vendor/consumer have a
  placeholder language button (not yet wired to full translation — flagged as next step, not pretended done).
- **Sell Crop**: form writes a real listing object to `localStorage` (`farmlink-listings`), shows up
  immediately in My Listings and the dashboard.
- **My Listings**: pause / resume / delete actually mutate stored data.
- **Buyer Marketplace**: View Requirement + Connect With Buyer are real interactions (stored in
  `farmlink-connections`) — not yet a real backend call.
- **Orders**: Accept action moves an order from "needs action" to "in transit".
- **Consumer cart**: add-to-cart, quantity adjustment, checkout — all real client-side state, persists
  across refresh, creates an order record.
- **Vendor**: procurement requests, supplier contact, inventory view — same pattern, all localStorage-backed.

## What's still mock / demo (Phase 3+, not yet real)
- All "AI" cards (demand forecast, selling opportunity, route optimizer %) show **demo values**, not a
  trained model or live pipeline. They're labeled as demo forecast in-app.
- No backend/API, no database, no auth — everything currently lives in browser localStorage per-device.
- Vendor/consumer language toggle is a placeholder (EN/HI/MR button cycles + toasts, doesn't translate content yet).

## Next logical steps (in priority order, per project plan)
1. Wire vendor + consumer full translation (reuse the farmer i18n pattern).
2. Stand up `backend/` (auth, listings, orders as real endpoints).
3. Replace localStorage reads/writes with API calls, same function names so front-end barely changes.
4. Real demand-forecast model behind `/api/forecast`.


