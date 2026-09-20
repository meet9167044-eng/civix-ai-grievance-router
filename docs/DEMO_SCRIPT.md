# Civix: Live Demonstration Script

Follow these steps for a live judge presentation or evaluation demo:

### Step 1: Citizen Submission (The Triage Moment)
1. Open the live app: `https://civix-ai-grievance-router-gdw9.vercel.app/`
2. Click **"Report an Issue"** (`/report`).
3. Upload a photo of a road pothole or infrastructure issue.
4. Speak or type: *"Deep pothole in the middle lane causing vehicles to brake suddenly."*
5. Notice the location pin automatically placed or draggable to your current coordinates.
6. Click **"Next"** → Review your report summary.
7. Click **"Submit Report"** → Watch the multi-step AI analysis:
   - *Uploading image...*
   - *Running vision analysis...*
   - *Checking for nearby duplicates...*
   - *Routing to department...*
8. Result card appears:
   - Badge: **"New ticket created"**
   - Ticket Number: `CVX-XXXX`
   - Department: `Roads & Infrastructure`
   - Severity: `Critical` or `Medium`
   - Priority Score calculated (e.g. 70/100).

---

### Step 2: The Winning Duplicate Merge Moment
1. Click **"Report Another Issue"**.
2. Upload the same or a very similar pothole image.
3. Keep the location pin within 50–100m of the first report.
4. Type a short description: *"Big crater on road."*
5. Click **"Next"** → **"Submit Report"**.
6. Observe the green banner on the Result Card:
   - **"Merged with an existing report. Now reported by 2 people."**
   - The ticket number is identical to the first report.
   - Priority score automatically increased by +5 points!

---

### Step 3: Admin Kanban Command Center
1. Toggle to **Admin Mode** in the header or navigate to `/admin`.
2. Notice the real-time KPI metrics at top: Open, In Review, In Progress, Resolved counts.
3. Find your ticket at the top of the **"Open"** column (sorted by highest priority).
4. Click the ticket card to open the **Inspection Drawer**:
   - Inspect the captured photo, AI work-order description, location, and reporter counts.
   - Change the status dropdown from `Open` to `In Progress`.
   - The card instantly slides to the `In Progress` column with an optimistic UI transition and persists to the database.

---

### Step 4: Geospatial Map View
1. On the Admin console, switch from the **Board** tab to the **Map** tab.
2. View the full geographic spread of municipal tickets across the city.
3. Pins are color-coded by severity:
   - Red: Critical
   - Orange: High
   - Yellow/Amber: Medium
   - Green: Low
4. Numbers inside pin badges indicate clustered multi-reporter counts.
5. Click on any pin to open a popup with ticket details and click **"Inspect Ticket"** to open its drawer directly from the map.
