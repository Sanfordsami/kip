import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { db, schema } from "./index";
import { createKpiTask } from "@/actions/kpi-task-actions";
import { createAssignments } from "@/actions/assignment-actions";

async function test() {
  const manager = await db.query.employees.findFirst({
    where: eq(schema.employees.position, "Manager"),
  });
  if (!manager) throw new Error("No manager found — run the seed script first.");

  const targetEmployee = await db.query.employees.findFirst({
    where: (fields, { ne }) => ne(fields.position, "Manager"),
  });
  if (!targetEmployee) throw new Error("No employee found — run the seed script first.");

  await db
    .update(schema.employees)
    .set({ telegramChatId: "5548296643" })
    .where(eq(schema.employees.id, targetEmployee.id));

  console.log(`Updated ${targetEmployee.fullName}'s Telegram Chat ID to your real one.`);

  const taskResult = await createKpiTask(
    { title: "Complete Monthly Sales Report", description: "Test task", weight: 15 },
    manager.id
  );
  if (!taskResult.success) throw new Error("Failed to create KPI task: " + taskResult.error);
  console.log("Created KPI task:", taskResult.data.id);

  const assignmentResult = await createAssignments({
    taskId: taskResult.data.id,
    employeeIds: [targetEmployee.id],
    assignedBy: manager.id,
    dueDate: new Date("2026-07-30").toISOString(),
    priority: "high",
    weight: 15,
    notes: "This is a test assignment.",
    allowDuplicate: true,
  });

  console.log("Assignment result:", assignmentResult);
  process.exit(0);
}

test().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});