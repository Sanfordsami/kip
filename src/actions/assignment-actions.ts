

"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import { assignmentSchema, assignmentStatusSchema } from "@/lib/validations";
import { buildAssignmentMessage, sendTelegramMessage } from "@/lib/telegram";
import type { ActionResult } from "./employee-actions";

export async function createAssignments(
  input: unknown
): Promise<ActionResult<{ assignmentIds: string[] }>> {


  // STEP 1: Validate shape

  const parsed = assignmentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const { taskId, employeeIds, assignedBy, dueDate, priority, weight, notes, allowDuplicate } = parsed.data;

  // STEP 2: Confirm the task exists
  
  const task = await db.query.kpiTasks.findFirst({ where: eq(schema.kpiTasks.id, taskId) });
  if (!task) return { success: false, error: "KPI task not found" };

  // Confirm the manager exists
  const manager = await db.query.employees.findFirst({ where: eq(schema.employees.id, assignedBy) });
  if (!manager) return { success: false, error: "Assigning manager could not be identified" };

  // STEP 3: Confirm employees exist and are active
  const employeesToAssign = await db.query.employees.findMany({
    where: (fields, { inArray }) => inArray(fields.id, employeeIds),
  });
  const foundIds = new Set(employeesToAssign.map((e) => e.id));
  if (employeeIds.some((id) => !foundIds.has(id))) {
    return { success: false, error: "One or more employees could not be found" };
  }
  const inactive = employeesToAssign.filter((e) => e.status !== "active");
  if (inactive.length > 0) {
    return { success: false, error: `Cannot assign to inactive employees: ${inactive.map((e) => e.fullName).join(", ")}` };
  }

  // STEP 4: Duplicate check
  if (!allowDuplicate) {
    const existing = await db.query.taskAssignments.findMany({
      where: (fields, { inArray, and }) => and(eq(fields.taskId, taskId), inArray(fields.employeeId, employeeIds)),
    });
    if (existing.length > 0) {
      return { success: false, error: "One or more employees already have this KPI task assigned" };
    }
  }

  // STEP 5: Save assignments
  const dueDateObj = new Date(dueDate);
  let inserted;
  try {
    inserted = await db
      .insert(schema.taskAssignments)
      .values(
        employeesToAssign.map((employee) => ({
          taskId,
          employeeId: employee.id,
          assignedBy,
          dueDate: dueDateObj,
          priority,
          weight,
          notes: notes || null,
          allowDuplicate,
          status: "pending" as const,
        }))
      )
      .returning();
  } catch (err) {
    console.error("Assignment insert failed:", err);
    return { success: false, error: "Database transaction failed while saving the assignment" };
  }

  // STEP 6: Send Telegram notifications + log every attempt
  for (const assignment of inserted) {
    const employee = employeesToAssign.find((e) => e.id === assignment.employeeId)!;
    const message = buildAssignmentMessage({
      employeeFirstName: employee.fullName.split(" ")[0],
      taskTitle: task.title,
      priority: assignment.priority,
      dueDate: assignment.dueDate,
      weight: assignment.weight,
      assignedByName: manager.fullName,
    });

    const result = employee.telegramChatId
      ? await sendTelegramMessage(employee.telegramChatId, message)
      : { ok: false as const, error: "Employee has no Telegram Chat ID on file" };

    await db.insert(schema.telegramLogs).values({
      assignmentId: assignment.id,
      chatId: employee.telegramChatId ?? null,
      message,
      status: result.ok ? "sent" : "failed",
      error: result.ok ? null : result.error,
    });
  }

  revalidatePath("/assignments");
  revalidatePath("/dashboard");

  return { success: true, data: { assignmentIds: inserted.map((a) => a.id) } };
}
export async function updateAssignmentStatus(input: unknown): Promise<ActionResult> {
  const parsed = assignmentStatusSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { assignmentId, status } = parsed.data;

  const existing = await db.query.taskAssignments.findFirst({
    where: eq(schema.taskAssignments.id, assignmentId),
  });

  if (!existing) {
    return { success: false, error: "Assignment not found" };
  }

  try {
    await db
      .update(schema.taskAssignments)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.taskAssignments.id, assignmentId));

    return { success: true, data: undefined };
  } catch (err) {
    console.error("updateAssignmentStatus failed:", err);
    return { success: false, error: "Database transaction failed while updating status" };
  }
}
