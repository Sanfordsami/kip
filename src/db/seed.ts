import { config } from "dotenv";
config({ path: ".env.local" });

import { db, schema } from "./index";

async function seed() {
  // --- Departments ---
  const [sales, support, engineering] = await db
    .insert(schema.departments)
    .values([{ name: "Sales" }, { name: "Support" }, { name: "Engineering" }])
    .returning();

  // --- Manager (you) ---
  const [manager] = await db
    .insert(schema.employees)
    .values({
      fullName: "Samuel Aklilu",           // <-- replace with your real name
      email: "samuelakliluin27@example.com",          // <-- replace with your real email
      departmentId: sales.id,
      position: "Manager",
      telegramChatId: "5548296643",         // <-- your real, confirmed chat ID
      status: "active",
    })
    .returning();

  // --- Placeholder employees (no real Telegram yet) ---
  const [jane, mike, priya] = await db
    .insert(schema.employees)
    .values([
      {
        fullName: "dawi",
        email: "dawit@example.com",
        departmentId: support.id,
        position: "Support Agent",
        telegramChatId: null,
        status: "active",
      },
    
      {
        fullName: "Mike Johnson",
        email: "mike.johnson@example.com",
        departmentId: engineering.id,
        position: "Software Engineer",
        telegramChatId: null,
        status: "active",
      },
      {
        fullName: "Priya Patel",
        email: "priya.patel@example.com",
        departmentId: sales.id,
        position: "Sales Representative",
        telegramChatId: null,
        status: "active",
      },
    ])
    .returning();

  // --- KPI Tasks (real, no duplicates) ---
  await db.insert(schema.kpiTasks).values([
    {
      title: "Complete Monthly Sales Report",
      description: "Compile and submit the monthly sales performance report.",
      weight: 15,
      createdBy: manager.id,
    },
    {
      title: "edit the casopia content",
      description: "clear all the commentes and give themthe viral video",
      weight: 20,
      createdBy: manager.id,
    },
    {
      title: "creat content ",
      description: "creat content for adona spa",
      weight: 25,
      createdBy: manager.id,
    },
  ]);

  console.log("Seed complete:");
  console.log("Manager:", manager.fullName, "-", manager.email);
  console.log("Employees:", [jane, mike, priya].map((e) => e.fullName).join(", "));
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
