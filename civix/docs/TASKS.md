# Task Checklist (HACKDAY 1.0: 9:00 AM to 5:00 PM)

Commit after every checked item. Cut order if behind: drag-and-drop, filters, voice, clustering.

## Phase 0: Setup (9:00-10:00)
- [ ] Create GitHub repo (public), add these md files
- [ ] Create Supabase project, run SQL from `ARCHITECTURE.md`, create `civix-images` bucket
- [ ] Get Gemini API key, add to `.env.local`
- [ ] Run `/scaffold`
- [ ] Choose demo city center and set `NEXT_PUBLIC_DEFAULT_LAT/LNG`

## Phase 1: Core pipeline (10:00-1:00)
- [ ] Citizen page: photo capture + image compression
- [ ] Geolocation + manual pin fallback
- [ ] Run `/build-classifier` and test with 4 images
- [ ] Result card UI (category, department, severity, formal text)
- [ ] Run `/build-duplicate-detection`
- [ ] Verify merge: same pothole twice gives `reports_count: 2`
- [ ] Deploy early (`/deploy`) so problems show up before the end of the day

## Phase 2: Admin and polish features (1:00-3:00)
- [ ] `GET /api/tickets` + Kanban board sorted by priority
- [ ] Ticket drawer + status change (`PATCH`)
- [ ] Map view with severity-colored pins
- [ ] Voice input (Web Speech API) with text fallback
- [ ] Run `/seed-data`
- [ ] Citizen/Admin toggle in header

## Phase 3: Polish and test (3:00-4:15)
- [ ] Responsive check at 390px, 768px, 1280px
- [ ] Loading, empty, and error states everywhere
- [ ] Test with 5 real photos on a real phone
- [ ] Rehearse `DEMO_SCRIPT.md` twice on the deployed URL
- [ ] Optional: filters, drag-and-drop, marker clustering

## Phase 4: Submit (4:15-5:00)
- [ ] Run `/submit`
- [ ] README complete with URLs and screenshots
- [ ] 5-slide PPT from `PPT_OUTLINE.md`
- [ ] Submission form filled at 5:00 PM sharp

## Quick API test
```bash
curl -X POST http://localhost:3000/api/reports \
  -F "image=@./test/pothole.jpg" -F "description=Big pothole near the bus stop" \
  -F "lat=12.9716" -F "lng=77.5946"
```

## Known shortcuts
(add here as you take them)
