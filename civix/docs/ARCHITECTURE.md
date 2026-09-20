# Architecture

## Flow
```
Citizen phone
  photo + transcript + lat/lng
        |
        v
POST /api/reports (Next.js route handler)
  1. validate (Zod, size, MIME)
  2. upload image -> Supabase Storage
  3. classify (Gemini vision, JSON) -> validate -> fallback if needed
  4. dedupe: geo filter (100 m, same category) -> AI compare
  5a. no duplicate: insert ticket + report
  5b. duplicate: insert report, reports_count+1, recompute priority
  6. return { ticket, merged }
        |
        v
Supabase Postgres  <----  Admin UI (Kanban + Map) via GET /api/tickets
```

## Database (run in Supabase SQL editor)
```sql
create extension if not exists "pgcrypto";

create table tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_no text unique not null,                -- e.g. CVX-1042
  title text not null,
  formal_description text not null,
  category text not null check (category in
    ('roads','sanitation','electrical','water','public_spaces','other')),
  department text not null,
  severity text not null check (severity in ('low','medium','critical')),
  severity_reason text,
  priority_score int not null default 0,
  status text not null default 'open' check (status in
    ('open','in_review','in_progress','resolved')),
  lat double precision not null,
  lng double precision not null,
  address_hint text,
  image_url text,
  visual_signature text,
  ai_confidence real,
  reports_count int not null default 1,
  near_sensitive_site boolean not null default false,
  is_seed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references tickets(id) on delete cascade,
  reporter_label text not null,                  -- "Citizen #7", anonymous
  description text,
  image_url text,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz not null default now()
);

create index tickets_cat_status_idx on tickets (category, status);
create index tickets_geo_idx on tickets (lat, lng);
create index reports_ticket_idx on reports (ticket_id);

-- Hackathon shortcut: RLS off, all writes through server route handlers using the service role.
alter table tickets disable row level security;
alter table reports disable row level security;
```
Storage: create a **public** bucket named `civix-images`.

Ticket numbers: generate in code as `CVX-` + (1000 + count of tickets + 1).

## API contracts
### `POST /api/reports` (multipart/form-data)
Fields: `image` (file, jpeg/png/webp, <= 5 MB), `description` (string, <= 500), `lat`, `lng` (numbers).
```json
{ "ok": true, "merged": false,
  "data": { "id": "...", "ticket_no": "CVX-1043", "title": "...", "category": "roads",
            "department": "Roads & Infrastructure", "severity": "critical",
            "priority_score": 80, "reports_count": 1, "formal_description": "..." } }
```
If `is_civic_issue` is false: `{ "ok": false, "error": "not_civic_issue", "message": "..." }` with HTTP 422.

### `GET /api/tickets?status=&category=&severity=`
Returns `{ ok: true, data: Ticket[] }` sorted by `priority_score desc, created_at desc`.

### `PATCH /api/tickets/:id`
Body: `{ "status": "in_progress" }` (also optionally `category`). Returns the updated ticket.

## Priority score
```
base  = { low: 20, medium: 50, critical: 80 }[severity]
dupes = min(15, (reports_count - 1) * 5)
site  = near_sensitive_site ? 10 : 0     // school/hospital within 200 m
score = min(100, base + dupes + site)
```

## Key modules
| File | Responsibility |
|---|---|
| `lib/ai/client.ts` | Provider interface (Gemini default, Claude swappable) |
| `lib/ai/classify.ts` | Prompt, call, Zod validate, retry, fallback |
| `lib/ai/dedupe.ts` | Geo filter + AI comparison |
| `lib/priority.ts` | Score formula |
| `lib/geo.ts` | Haversine, bounding box |
| `lib/departments.ts` | Category to department and icon |
| `data/pois.ts` | Fictional schools/hospitals for the demo city |

## Deployment
Vercel (Next.js) + Supabase (free tier). Env vars set in the Vercel dashboard; server-only keys have no `NEXT_PUBLIC_` prefix.

## Known shortcuts (acceptable for hackathon)
No auth, RLS disabled, in-memory rate limit, text-only duplicate comparison, static POI list instead of a places API.
