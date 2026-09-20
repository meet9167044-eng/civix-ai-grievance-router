// scripts/seed.ts — Seed script: delete is_seed rows and reinsert.
// Full implementation in Phase 8.
// Run with: npm run seed

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE env vars. Copy .env.example to .env.local and fill them in.");
  process.exit(1);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const supabase = createClient(url, key);

async function main() {
  console.log("Seed script — Phase 8 implementation pending.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
