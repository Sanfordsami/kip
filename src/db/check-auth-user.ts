import { config } from "dotenv";
config({ path: ".env.local" });

import { supabaseAdmin } from "../lib/supabase-admin";

async function run() {
  const email = process.argv[2];
  if (!email) {
    console.log("Usage: npx tsx src/db/check-auth-user.ts someone@example.com");
    process.exit(1);
  }

  const { data, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.error("Error listing users:", error);
    process.exit(1);
  }

  const match = data.users.find((u) => u.email === email);
  console.log(match ? "FOUND:" : "NOT FOUND", match ?? "");
  process.exit(0);
}

run();
