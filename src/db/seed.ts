
// import { config } from "dotenv";
// config({ path: ".env.local" });

import { db, schema } from "./index";

async function seed() {
  // 1. Create a department
  const [dept] = await db
    .insert(schema.departments)
    .values({ name: "video editor" })
    .returning();

  // 2. Create a manager
  const [manager] = await db
    .insert(schema.employees)
    .values({
      fullName: "Abenezer",
      email: "abenezer@gmail.com",
      departmentId: dept.id,
      position: "Manager",
      status: "active",
    })
    .returning();

  // 3. Create an employee (this is who we'll assign tasks to later)
  const [employee] = await db
    .insert(schema.employees)
    .values({
      fullName: "root",
      email: "root@gmail.com",
      departmentId: dept.id,
      position: "ofies manager",
      telegramChatId: "123456789", // placeholder for now — real one comes in Step 5
      status: "active",
    })
    .returning();

  console.log("Seed complete:", { manager: manager.email, employee: employee.email });
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);


});
