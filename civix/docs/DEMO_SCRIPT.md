# Demo Script (about 2 minutes)

## Prep
- Deployed URL open on a phone (Citizen) and a laptop (Admin).
- Two pothole photos of the SAME pothole, taken from slightly different angles, plus one garbage photo. Saved in the phone gallery.
- Demo location: `<lat, lng>`. Nothing seeded within 150 m except optionally one pre-seeded pothole ticket.
- Browser location permission already granted. Backup: manual pin.

## Beats
1. **Hook (10 s):** "Every city portal has the same pothole reported 40 times and the wrong department gets half of them. Civix fixes triage."
2. **Report (30 s):** On the phone, tap photo, speak "Big pothole near the bus stop, cars are swerving", submit. Show the analyzing state.
3. **Result (15 s):** Point to category Roads, department, severity Critical, and the formal ticket text.
4. **The win (25 s):** Switch to the "second citizen" (second photo). Submit. Result says **Merged: now reported by 2 people**, priority score went up.
5. **Admin (25 s):** Laptop, Admin view. Kanban sorted by priority; the merged ticket is near the top. Open drawer, change status to In Review. Switch to Map and show pins.
6. **Scam-proof the edge (10 s):** Submit a selfie. "Not a civic issue" message. Shows guardrails.
7. **Close (10 s):** "Same pipeline works for any city. Next: SMS intake and real department SLAs."

## Fallback plan
- If AI is slow: narrate the loading state, pre-open a previously merged ticket.
- If location fails: use the manual pin.
- If merge does not fire: open the seeded multi-report ticket and explain the logic.
