# Civix Design System & Screen Specs

> Source of truth for all visual work. Based on the approved mockup at `docs/design/reference.png` (open it before building any screen).
> Precedence: this file overrides the visual direction in `.agent/rules/03-ui-ux.md` and any conflicting UI/route details in `PHASES.md`. Section 9 lists every conflict and how to resolve it.
> Hex values were read by eye from the mockup. Match the look, not the exact pixel value. Where this file is silent, match the mockup.

---

## 1. Design intent

**Feel:** trustworthy, calm, civic-tech. Clean government-grade product with warmth. Green stands for growth, cleanliness, and community.

**Principles**
1. **One primary action per screen**, always the solid green button.
2. **Photo first.** In the citizen flow, the photo and the AI result are the heroes.
3. **Status is never color alone.** Pair every color with a text label and an icon.
4. **Citizen screens are spacious and reassuring. Admin screens are dense but calm.**
5. **Spend boldness in one place: the merge moment** (section 5.4). Everything else stays quiet.
6. No decorative gradients beyond a soft `brand-50` wash behind the hero. No all-caps eyebrow labels. No dark mode.

---

## 2. Design tokens

### 2.1 Tailwind v4 theme (put in `src/app/globals.css`)
If the project has a `tailwind.config.ts` (v3), move the same values into `theme.extend`.

```css
@import "tailwindcss";

@theme {
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;

  --color-brand-50:  #EEF8F1;   /* tints, icon circles, ticket-ID box */
  --color-brand-100: #DCF0E3;
  --color-brand-200: #BBE1C9;
  --color-brand-300: #8CCBA5;
  --color-brand-400: #52AE7A;
  --color-brand-500: #2A9159;
  --color-brand-600: #1E8049;   /* accent headline text, icons, links (large text only) */
  --color-brand-700: #176B3D;   /* primary buttons, text on white */
  --color-brand-800: #135732;   /* button hover */
  --color-brand-900: #0F4527;
  --color-brand-950: #0A2A1B;   /* admin sidebar */

  --color-ink:     #0F1F17;     /* headings and primary text */
  --color-surface: #F6F9F7;     /* page background */

  --radius-card:    1rem;       /* 16px: cards, images */
  --radius-control: 0.75rem;    /* 12px: buttons, inputs, dropzone */

  --shadow-card:       0 1px 2px rgba(15,31,23,.04), 0 8px 24px rgba(15,31,23,.06);
  --shadow-card-hover: 0 2px 4px rgba(15,31,23,.06), 0 12px 32px rgba(15,31,23,.10);
}

body { background: var(--color-surface); color: var(--color-ink); }
```

### 2.2 Typography
Font: **Inter** via `next/font/google` (variable `--font-inter`). One family; hierarchy comes from weight and size.

| Role | Desktop | Mobile | Weight | Notes |
|---|---|---|---|---|
| Display (landing H1) | 56/60 | 40/44 | 800 | tracking -0.02em |
| Page title (H1) | 32/40 | 28/36 | 700 | |
| Section title (H2) | 24/32 | 20/28 | 700 | |
| Card title (H3) | 18/26 | 18/26 | 600 | |
| Body | 16/24 | 16/24 | 400 | admin dense text 14/20 |
| Caption / helper | 13/18 | 13/18 | 400 | `text-gray-500` |
| Stat number | 30/36 | 26/32 | 700 | `tabular-nums` |

Body line length under 80 characters. Sentence case everywhere.

### 2.3 Spacing and layout
- 4px base unit. Page gutters: 16 (mobile), 24 (tablet), 32 (desktop). Card padding 20-24. Gap between cards 16-24.
- Breakpoints: `sm` 640, `md` 768, `lg` 1024, `xl` 1280.
- Max widths: landing 1200, report and track 1000, admin main is fluid beside a 240px sidebar.

### 2.4 Severity and status tokens
One meaning per color. Use these everywhere (cards, table, map, charts).

| Severity | Pill style | Map pin / chart |
|---|---|---|
| Low | `bg-green-50 text-green-700 ring-1 ring-green-200` | `#7FCB98` |
| Medium | `bg-amber-50 text-amber-700 ring-1 ring-amber-200` | `#FBBF24` |
| High | `bg-orange-50 text-orange-700 ring-1 ring-orange-200` | `#F97316` |
| Critical | `bg-red-600 text-white` (solid, the loudest pill) | `#EF4444` |

| Status | Pill style |
|---|---|
| Open | `bg-slate-100 text-slate-700` |
| In Review | `bg-blue-50 text-blue-700` |
| In Progress | `bg-brand-100 text-brand-800` |
| Resolved | `bg-brand-700 text-white` with a check icon |

Category chart colors (donut): Sanitation `#1E8049`, Roads `#2DB8A0`, Electrical `#7C5CE0`, Water `#3B82F6`, Others `#A7D7B8`.
Pills: `rounded-full px-2.5 py-0.5 text-xs font-semibold`, with a 12px icon or dot for non-color meaning.

Contrast: use `brand-700` (about 6.5:1 on white) for any normal-size text or button fill; `brand-600` only for large text and icons.

---

## 3. Global layout

**Public header** (landing, report, track): height 72, white, bottom border `gray-100`. Left: logo (lucide `Leaf` in `brand-600` + "Civix" wordmark, 700). Center: Home, How It Works, About, Contact (14px, `gray-700`, hover `brand-700`). Right: **Login** (outline button) and **Report Issue** (solid button).
- After a demo role is chosen: replace Login with an avatar circle (initials) plus a dropdown "Switch to Admin / Switch to Citizen".
- Mobile: logo left, hamburger right; nav and both buttons move into a slide-down sheet. "Report Issue" stays visible as a compact button next to the hamburger.

**Login (demo, no real auth):** clicking Login opens a small modal titled "Demo access" with two buttons, "Continue as citizen" and "Continue as admin". It stores the role in `localStorage`. Add the line "Demo mode: no account needed."

**Admin shell:** see 5.6.

---

## 4. Components

| Component | Spec |
|---|---|
| **Button primary** | `h-12 px-6 rounded-control bg-brand-700 text-white font-semibold hover:bg-brand-800 active:scale-[.98]`; icon 18px after label |
| **Button secondary (outline)** | white bg, `border border-brand-600 text-brand-700`, hover `bg-brand-50` |
| **Button tint** | `bg-brand-50 text-brand-700 border border-brand-100` (used for "Record Voice Instead") |
| **Button ghost** | text only, `text-gray-700 hover:bg-gray-100` |
| **Button sizes** | default h-12; compact h-10 (header, tables). Minimum tap height 44px on mobile |
| **Input / Select** | `h-12 rounded-control border border-gray-200 bg-white px-3.5`, left icon 18px `text-gray-400`, focus `ring-2 ring-brand-500 border-brand-500` |
| **Textarea** | same as input, min-h 132, character counter bottom-right (`112/500`, 12px `text-gray-400`) |
| **Dropzone** | `rounded-control border-2 border-dashed border-brand-200 bg-brand-50/40`, centered image icon + "Drag and drop an image here or click to upload"; hover `border-brand-400`; drag-over `bg-brand-100`. Helper below: "JPG, PNG up to 10MB" |
| **Photo thumbnail** | 96x96 (mobile 80), `rounded-[10px] object-cover`, circular white "X" remove button top-right |
| **Card** | `bg-white rounded-card shadow-card border border-black/5 p-5 md:p-6`. Hover lift only on clickable cards (`shadow-card-hover`, `-translate-y-0.5`) |
| **Feature tile** | 56px circle `bg-brand-50` with 26px `brand-600` icon; title 16/600 in `ink`; sub 14 in `brand-600` or `gray-500` |
| **Stepper** | 3 nodes, 36px circles, connected by a 2px line. Done: filled `brand-600` with check. Active: filled `brand-600` with number, label `brand-700` semibold. Upcoming: white, `border-gray-300`, number in `gray-400`. Labels centered below |
| **Timeline** | Vertical, 2px line `gray-200`. Done node: 24px `brand-600` filled with check. Current node: 24px `blue-600` filled with white dot, label `blue-700`. Upcoming node: hollow `gray-300`. Each item: title 15/600, timestamp 12 `gray-500`, description 14 `gray-600` |
| **Stat card** | white card; label 13 `gray-500`; value 30/700; delta line 12 with arrow (green when the change is good, red when bad; a rising Pending count is red) |
| **Donut chart** | SVG circles with `stroke-dasharray`, ring thickness about 28px, legend on the right with color square, label, and percent (right-aligned). No chart library |
| **Bar chart** | Flex row of 4 bars with `rounded-t-md`, colors from the severity table, labels below. Height from `count / max`. No chart library |
| **Table row** | 56px tall, columns: ticket ID (13/600), title (truncate), priority pill, time (right, `gray-500`). Row hover `bg-gray-50`; row click opens the drawer |
| **Sidebar** | see 5.6 |
| **Drawer** | right sheet, 440px desktop / full width mobile, white, `shadow-2xl`; header with ticket ID + close; sections: image, pills, description, details list (same rows as Track details), status select, "Reported by N" |
| **Map card** | `rounded-card overflow-hidden`; tiles: CARTO Positron (`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`) with attribution "© OpenStreetMap contributors © CARTO"; fallback to standard OSM tiles |
| **Map pin** | `divIcon` circle 16px, 2px white border, fill from the severity color; critical pins 20px |
| **Toast** | bottom-center, `bg-ink text-white rounded-control`, 3s |
| **Skeleton** | `bg-gray-200/70 rounded animate-pulse` blocks matching the final layout |
| **Empty state** | icon (`brand-300`), one line of what is missing, one action button |

---

## 5. Screens

### 5.1 Landing `/`
Two-column hero on desktop; stacked on mobile (text first, image below).

- Pill badge: leaf/bolt icon + **"Tech for a Better Tomorrow"** (`bg-brand-50 text-brand-700 text-xs font-semibold rounded-full`).
- H1 (Display): "A Cleaner, Safer, Smarter Tomorrow" in `ink`, then "Starts With You." in `brand-600` on its own line.
- Paragraph (18/28, `gray-600`, max 52ch): "Civix helps you report civic issues in minutes. Upload a photo, add a brief description or voice note, and we'll route it to the right department using AI."
- Buttons: **Report an Issue →** (primary) and **See How It Works** with play icon (white, `border-gray-200`); the second scrolls to `#how-it-works`.
- Right: city photo, `rounded-[24px]`, about 5:4, with a soft `brand-50` shape behind it offset left. Floating white quote card overlapping the photo's left edge: "Real People / Real Issues / Real Change" in 700 italic 24/30, with a small curved arrow below. Hide the floating card under 640px.
- **Feature row** (4 tiles, one row on desktop, 2x2 on mobile): Quick Reporting / "Report in under a minute" (`Zap`); AI-Powered / "Automatic classification" (`Target`); Right Department / "Routed to the right team" (`Landmark`); Transparent / "Track progress in real time" (`ChartColumn`).
- **Quote strip:** full-width `bg-brand-50 rounded-card`, leaf icon + "Stronger Cities. Happier Communities." + "Civix", centered.
- **`#how-it-works`** (Tier B): three steps (a real sequence, so numbering is fine): "Snap and describe" (photo, voice or text) -> "AI sorts and routes" (category, severity, department) -> "Track it to resolved". Same tile style as the feature row.
- Footer (Tier C): logo, one line about the project, `#about` and `#contact` text, "Built for HACKDAY 1.0".

### 5.2 Report `/report` (3-step flow)
Layout: "Back" link (`ArrowLeft`), H1 "Report a Civic Issue", subtitle "Let us know what's going on. Our AI will analyze and route it to the right department.", then the stepper: **Add Details -> Review -> Submitted**.

**Step 1: Add details** (2x2 card grid on desktop, single column on mobile):
```
┌───────────────────────────┐ ┌─────────────────────────────────────┐
│ 1. Upload a Photo *       │ │ 2. Describe the Issue *             │
│ [ dropzone ]  [thumb  x ] │ │ [ textarea                  112/500]│
│ JPG, PNG up to 10MB       │ │ [mic Record Voice Instead] or       │
│                           │ │ [pin Use My Current Location]       │
└───────────────────────────┘ └─────────────────────────────────────┘
┌───────────────────────────┐ ┌─────────────────────────────────────┐
│ 3. Location *             │ │ 4. Category (Optional)              │
│ [pin  address text  (+)]  │ │ [ Auto-detect (AI will classify) v ]│
│ Adjust pin (map, collapsible) │                                     │
└───────────────────────────┘ └─────────────────────────────────────┘
[                          Next  ->                                    ]
```
- Card titles use the numbered labels (these are form parts in order). Required fields show a red `*`.
- Under the photo card, one privacy line (12px `gray-500`): "Please avoid capturing people's faces or vehicle plates."
- "Use My Current Location" and the crosshair (`LocateFixed`) inside the location input both run geolocation, then fill the input by reverse geocoding (Nominatim, client-side, with a fallback of "Lat, Lng" text). "Adjust pin" expands a small Leaflet map with a draggable marker.
- Category select options: Auto-detect (AI will classify), Roads, Sanitation, Electrical, Water, Parks & Public Spaces, Other. Sent to the API as `category_hint`; the AI result is authoritative and admins can change it.
- "Record Voice Instead" appends the transcript into the textarea (Web Speech API). While recording: button turns red-tinted with a pulsing dot and the label "Listening... tap to stop". Unsupported browser: hide the button.
- **Next** is disabled until photo, description (at least 10 characters), and location exist. On mobile it is a sticky bottom bar with safe-area padding.
- Client compresses the photo to about 1280px and JPEG 0.8 before upload, so the "up to 10MB" limit applies to the original file.

**Step 2: Review**
Read-only summary card: photo (large, rounded), description, location text, category choice ("Auto-detect" if unset). Buttons: **Back** (secondary) and **Submit report** (primary). Helper: "Our AI will analyze your photo after you submit."
**Submitting state:** primary button becomes a spinner; below the summary show rotating status text every 1.5s: "Uploading photo...", "Analyzing the issue...", "Checking for nearby reports..." (indicative only, not real progress). Disable all inputs.

**Step 3: Submitted:** see 5.3 / 5.4.

**Errors (inline, under the field, `text-red-600 text-sm`):**
- No photo: "Add a photo so we can see the issue."
- Not a civic issue (HTTP 422, shown as a banner above the summary): "This photo doesn't show a public issue. Retake it or choose another photo."
- Location denied: "Location is off. Drag the pin to where the issue is."
- Network: "Couldn't send your report. Check your connection and try again." with a **Try again** button.

### 5.3 Submitted (step 3, same route)
Centered card, max-w 480, on the `surface` background.
1. 72px circle `bg-brand-700` with white check (scale-in animation, once).
2. H2 "Your report has been submitted!", then "Thank you for making your city better." in `gray-600`.
3. **Ticket ID box:** `bg-brand-50 rounded-control p-4`, small label "Ticket ID", value `CVX-2026-1042` (20/700 `brand-700`), copy icon button on the right (toast "Ticket ID copied").
4. Detail rows with icons: Submitted on (`Calendar`), Location (`MapPin`), Category (`Tag`) with "Sanitation (Auto-detected)", and Priority as a severity pill.
5. **View Ticket ->** (secondary, full width) linking to `/track/[ticketNo]`. Under it: "Track your report anytime from your dashboard." (12px `gray-500`) and a text link "Report another issue".
If the AI fell back: Category shows "Needs review" with helper "We couldn't classify this automatically. A staff member will review it."

### 5.4 The merge moment (the one bold element)
When the API returns `merged: true`, insert a banner at the top of the Submitted card, above the check circle's text:
- Container: `bg-brand-50 border border-brand-200 rounded-card p-4`, `Users` icon in a 40px `brand-700` circle.
- Title (16/700): "This issue was already reported nearby."
- Body: "We added your report to it, so it gets attention faster."
- Right side: large count chip "Reported by **2** people" (the number animates from N-1 to N once, 600ms) and a priority delta chip: "Priority 60 -> 70" with an up arrow, using `previous_priority_score` from the API.
- The Ticket ID box shows the **existing** ticket's ID.
- Also play a single soft pulse ring on the count chip. No confetti, no sound.
Non-merged tickets show no banner. This is the demo's climax, so make sure it is visible without scrolling on a 390px screen.

### 5.5 Track `/track/[ticketNo]` (Tier B)
Header: "Back", H1 "Track Your Report", subtitle "Here's the latest update on your ticket."
Two columns on desktop (about 60/40), stacked on mobile (details first, then timeline).
```
┌────────────────────────────────────┐ ┌────────────────────────┐
│ [thumb] CVX-2026-1042  [In Progress]│ │ Details                │
│ Garbage has not been collected...  │ │ Category   Sanitation  │
│                                    │ │ Priority   [High]      │
│ (v) Submitted                      │ │ Location   Dhanmondi 27│
│ (v) AI Analysis Complete           │ │ Department Sanitation  │
│     Category: Sanitation           │ │ Reported   Sep 20, 2026│
│     Severity: High                 │ │ [ map thumbnail + pin ]│
│     Routed to: Sanitation Dept.    │ │ Reported by N people   │
│ (v) Assigned                       │ └────────────────────────┘
│ (o) In Progress   <- current, blue │
│ ( ) Resolved      <- upcoming      │
└────────────────────────────────────┘
```
Timeline is derived from ticket status and `status_history`:
- Submitted: `created_at`. "Your report has been received."
- AI Analysis Complete: `created_at`. Shows category, severity, routed department.
- Assigned: first time status is `in_review` or later. "Your report has been assigned to a field officer."
- In Progress: status `in_progress`. "There has been activity on this ticket."
- Resolved: status `resolved`. Upcoming text: "We'll notify you once it's resolved." (Do not promise notifications that do not exist: use "Check back here for updates.")
Auto-refresh every 15 seconds. Unknown ticket: empty state "We couldn't find that ticket. Check the ID and try again."

### 5.6 Admin shell (`/admin/*`)
- **Sidebar** (240px, `bg-brand-950`, white text): logo (white leaf + "Civix") at top. Items (icon + label, 44px tall, `rounded-lg`): **Dashboard**, **All Tickets**, **Map View** are live. **Analytics**, **Departments**, **Users**, **Settings** are visible but disabled (`text-white/40`, small "Soon" badge). Active item: `bg-white/10 text-white`; inactive `text-white/70 hover:bg-white/5`.
- **Top bar** (white, 64px): left empty or page breadcrumb; right: bell icon (static, no badge), then avatar + "Admin" and "Municipal Portal" (12px `gray-500`).
- Below `lg`: sidebar becomes an off-canvas drawer opened by a hamburger in the top bar.
- Main area: `bg-surface`, padding 24, page title (H1 24/32 admin size) with a one-line subtitle.

### 5.7 Admin Dashboard `/admin`
Title "Admin Dashboard", subtitle "Overview of civic reports and their status."
```
[Total Tickets] [Pending] [In Progress] [Resolved]           (4 stat cards)
[ Tickets by Category (donut + legend) ] [ Priority Distribution (bars) ]
[ Recent Tickets (table, View All ->)  ] [ Live Map (mini, View Map ->) ]
```
- Stats come from real rows. Pending = open + in review. Delta = last 7 days vs the 7 days before; hide the delta if the earlier period is zero.
- Priority Distribution bars: Low, Medium, High, Critical.
- Recent Tickets: newest 5, columns per the table-row spec. "View All ->" goes to `/admin/tickets`.
- Live Map: read-only mini map, severity-colored pins, "View Map ->" goes to `/admin/map`.
- Grid: 4 columns (stats), then 2 columns; on `md` 2x2 stats; on mobile everything single column, tables become stacked cards (ID + pill on the first line, title on the second).
- Seed 40-60 tickets so the charts look populated. Never hard-code fake totals.

### 5.8 Admin All Tickets `/admin/tickets` (Kanban, our differentiator)
Title "All Tickets", subtitle "Sorted by priority. Duplicates are merged."
- Four columns: Open, In Review, In Progress, Resolved. Column header: status name + count pill; 3px top border in the status color. Column background `bg-gray-100/60 rounded-card p-3`. Horizontal scroll on small screens with snap.
- **Ticket card:** priority score in a 40px rounded square (`bg` from severity, number 16/700) at left; title (14/600, 2 lines max); severity pill; category icon + label; `Users` "Reported by N" (highlight in `brand-700` when N > 1); relative age. Sorted by `priority_score` desc.
- Filter chips above the board: All, Roads, Sanitation, Electrical, Water, Other, plus a severity dropdown (Tier B).
- Click a card: open the drawer (section 4). Status change moves the card optimistically and shows a toast "Moved to In Progress".
- Polling every 10s so a live merge appears during the demo, with the updated card briefly showing a `brand-100` highlight (1.5s).
- Empty column: "No tickets here yet."

### 5.9 Admin Map `/admin/map` (Tier B)
Full-height map card with the severity legend (Low, Medium, High, Critical) top-right. Popup: title, severity pill, "Reported by N", **Open ticket** button (opens the drawer). Optional clustering.

---

## 6. Copy rules
- Sentence case; plain verbs; active voice. Buttons say what happens: "Submit report", "View Ticket", "Try again".
- Keep the same word for the same thing: **report** (what a citizen sends), **ticket** (what the city tracks). Do not say "complaint" or "grievance" in the UI.
- Errors say what happened and how to fix it. They do not apologize.
- Never claim features that do not exist (no "we'll email you", no "field officer" as a real person; the timeline text is generic).

---

## 7. Motion and accessibility
**Motion:** 150-200ms ease-out for hover, focus, and press. Only responsive motion plus these moments: the success check scale-in (once), the merge count-up and pulse (once), the new-ticket highlight on the board, skeleton shimmer, and stepper progress transition. No scroll-triggered entrances. Wrap all of it in `@media (prefers-reduced-motion: reduce)` to disable.

**Accessibility**
- Visible focus ring on every interactive element (`ring-2 ring-brand-500 ring-offset-2`).
- Tap targets at least 44px on mobile. Inputs have real `<label>`s. Icons that carry meaning have text labels or `aria-label`.
- Severity and status always show text plus icon or dot.
- Images have meaningful `alt` (user photos: "Photo of the reported issue"). The map has a text list alternative on the admin ticket table.
- Announce submit results and toasts with `aria-live="polite"`.
- Test at 390px, 768px, and 1280px.

---

## 8. Assets and icons
- **Logo:** lucide `Leaf` (filled `brand-600`) + "Civix" wordmark (Inter 700, 26px on the header). Favicon: the leaf on `brand-700`.
- **Hero photo:** `public/hero-city.jpg`, a royalty-free (Unsplash or Pexels) city street with trees, at least 1400px wide, served with `next/image`, alt "Tree-lined city street with tall buildings". If unavailable, use a `brand-100` block with an SVG skyline.
- **Avatar:** initials circle (`bg-brand-100 text-brand-800`). No stock faces.
- **Icons (lucide-react):** `Leaf, Zap, Target, Landmark, ChartColumn (or BarChart3), Play, ArrowRight, ArrowLeft, ImagePlus, Mic, MapPin, LocateFixed, Copy, Check, CircleCheck, Calendar, Tag, Users, Bell, LayoutDashboard, Ticket, Map, ChartPie, Building2, Settings, Menu, X, Construction, Trash2, Droplets, Trees, CircleHelp, Sparkles`. Verify each name exists in the installed lucide-react version; substitute the nearest icon if not.

---

## 9. Reconciliation with the rest of the plan (agent applies in Phase 1)

| Item | Old plan | New (this file) |
|---|---|---|
| Accent color | `blue-600` in `03-ui-ux.md` | Brand green tokens (section 2). Update that rule file's visual direction to point here |
| Severity levels | low / medium / critical | **low / medium / high / critical**. Update: Zod enum, SQL `check`, AI prompt (see below), `BASE = {low:20, medium:40, high:60, critical:80}` in the priority formula, seed mix, and pills |
| Severity definitions | critical = immediate danger | **critical** = immediate danger to life or safety; **high** = serious health, safety, or service problem affecting many people (for example, uncollected garbage for days near a market); **medium** = real degradation, no danger; **low** = cosmetic |
| Ticket number | `CVX-1043` | `CVX-{year}-{1000 + count + 1}`, e.g. `CVX-2026-1042` |
| Routes | `/admin` with Board/Map tabs | `/admin` Dashboard, `/admin/tickets` Kanban, `/admin/map`, plus `/track/[ticketNo]` |
| Report flow | single form | 3-step flow (Add Details, Review, Submitted) |
| Role toggle | header switch | Login button opens the "Demo access" modal; avatar dropdown to switch role |
| Charts | not planned | Hand-built SVG/CSS donut and bars (no new dependency) |
| Fonts | unspecified | Inter via `next/font/google` |

**Database additions** (run in the Supabase SQL editor; add to the schema in Phase 4):
```sql
alter table tickets add column if not exists address_text text;
alter table tickets add column if not exists status_history jsonb not null default '[]';
-- status_history item shape: {"status":"in_review","at":"2026-09-20T10:30:00Z"}
```
- On ticket creation, set `status_history` to `[{"status":"open","at":<now>}]`. On every status `PATCH`, append an entry.

**API additions**
- `POST /api/reports` accepts optional `category_hint` and `address_text`; when `merged: true`, the response also includes `previous_priority_score`.
- Ticket lookup by ticket number for the Track page: `GET /api/tickets/by-no/[ticketNo]`.
- Dashboard stats are computed client-side from `GET /api/tickets`. No stats endpoint needed.

---

## 10. Build order and scope tiers

The mockup is bigger than the original plan, so protect the demo path first.

| Tier | What | Where in `PHASES.md` |
|---|---|---|
| **A: must ship** | Tokens + header + Login modal + landing (hero, feature row, quote strip); 3-step report flow; Submitted card + **merge banner**; admin shell; **Kanban at `/admin/tickets`** + drawer; Dashboard with stat cards + Recent Tickets | Phases 1, 2, 4, 5, 7 |
| **B: if on schedule** | Track page; donut + priority bars; Live Map card and `/admin/map`; filter chips; How It Works section | Phases 7-8 |
| **C: only if ahead** | Footer, About/Contact anchors, count-up polish, disabled sidebar item polish | Phase 9 |

Order inside the phases: tokens and header (Phase 1) -> landing (Phase 1) -> report flow (Phase 2) -> Submitted + merge banner (Phases 4-5) -> admin shell + Kanban (Phase 7) -> dashboard (Phase 7-8) -> Track and map (Phase 8).
If a phase runs long, cut from Tier B first, then Tier C. Never cut the merge banner or the Kanban.

---

## 11. Design QA checklist (run in Phase 9)
- [ ] Every screen matches the mockup's layout and green palette at 1280px; the report and success screens also match at 390px.
- [ ] Only tokens from section 2 are used (no stray hex values in components, no `blue-600` accent).
- [ ] Severity and status pills are consistent across card, table, drawer, map, and charts.
- [ ] The merge banner is visible without scrolling on a 390px screen and shows the correct count and priority change.
- [ ] Loading, empty, and error states exist for the report flow, board, dashboard, and track page.
- [ ] Focus rings are visible; keyboard can complete the whole report flow.
- [ ] `prefers-reduced-motion` disables all non-essential animation.
- [ ] Lighthouse mobile accessibility score of 90 or higher on `/` and `/report`.
- [ ] No lorem ipsum, no fake totals, no claims of unbuilt features.
