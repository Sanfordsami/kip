import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { db, schema } from "./index";
import { createEmployee } from "@/actions/employee-actions";

async function run() {
  const dept = await db.query.departments.findFirst({
    where: eq(schema.departments.name, "Engineering"),
  });
  if (!dept) throw new Error("Engineering department not found — check your seed data.");

  const result = await createEmployee({
    fullName: "Abenezer",              // update with his real full name if you have it
    email: "abenezer@example.com",     // update with his real email if you have it
    departmentId: dept.id,
    position: "Support Agent",         // adjust to his real role
    telegramChatId: "790795320",       // his real, confirmed chat ID
    status: "active",
  });

  console.log("Result:", result);
  process.exit(0);
}

run();
