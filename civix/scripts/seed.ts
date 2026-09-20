// scripts/seed.ts — Idempotent seed script for Civix demo tickets
// Run with: npm run seed

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { SEED_TICKETS } from "../src/data/seed";

// Auto-load .env.local if present
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("❌ Missing SUPABASE env vars. Ensure .env.local exists with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

async function main() {
  console.log(`🌱 Starting Civix seed into Supabase: ${url}`);

  // 1. Delete existing seed tickets (cascades to reports)
  console.log("🧹 Deleting existing seed records (where is_seed = true)...");
  const { error: delErr } = await supabase
    .from("tickets")
    .delete()
    .eq("is_seed", true);

  if (delErr) {
    console.error("⚠️ Error deleting old seed tickets:", delErr.message);
  } else {
    console.log("✅ Previous seed tickets cleared.");
  }

  // 2. Insert new seed tickets
  console.log(`📦 Inserting ${SEED_TICKETS.length} curated civic tickets...`);

  for (const t of SEED_TICKETS) {
    const createdAt = new Date(Date.now() - t.daysAgo * 86400000).toISOString();
    
    const { data: ticket, error: ticketErr } = await supabase
      .from("tickets")
      .insert({
        ticket_no: t.ticket_no,
        title: t.title,
        formal_description: t.formal_description,
        category: t.category,
        department: t.department,
        severity: t.severity,
        severity_reason: t.severity_reason,
        priority_score: t.priority_score,
        status: t.status,
        lat: t.lat,
        lng: t.lng,
        image_url: t.image_url,
        visual_signature: t.visual_signature,
        ai_confidence: t.ai_confidence,
        reports_count: t.reports_count,
        near_sensitive_site: t.near_sensitive_site,
        is_seed: true,
        created_at: createdAt,
        updated_at: createdAt,
      })
      .select("id, ticket_no")
      .single();

    if (ticketErr || !ticket) {
      console.error(`❌ Failed to insert ${t.ticket_no}:`, ticketErr?.message);
      continue;
    }

    // Insert associated report rows
    const reportsToInsert = [];
    for (let i = 1; i <= t.reports_count; i++) {
      reportsToInsert.push({
        ticket_id: ticket.id,
        reporter_label: `Citizen #${i}`,
        description: i === 1 ? t.formal_description : "Confirmed issue observed at this location.",
        image_url: t.image_url,
        lat: t.lat + (Math.random() - 0.5) * 0.0001,
        lng: t.lng + (Math.random() - 0.5) * 0.0001,
        created_at: new Date(new Date(createdAt).getTime() + i * 1800000).toISOString(),
      });
    }

    const { error: repErr } = await supabase.from("reports").insert(reportsToInsert);
    if (repErr) {
      console.warn(`⚠️ Warning: could not insert reports for ${ticket.ticket_no}:`, repErr.message);
    }
  }

  console.log("🎉 Seeding complete! Verify tickets at /admin and /admin (Map view).");
}

main().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
