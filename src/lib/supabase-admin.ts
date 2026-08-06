import { createClient } from "@supabase/supabase-js";

// Uses the service role key — bypasses all security rules.
// Only import this in server-side code (server actions), never client components.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
