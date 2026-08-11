"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { assignmentSchema } from "@/lib/validations";
import { buildAssignmentMessage, sendTelegramMessage } from "@/lib/telegram";
import type { ActionResult } from "@/actions/employee-actions";
import { authManager } from "@/actions/auth-helpers";

type CreateAssignmentsInput = {
  taskId: string;
  employeeIds: string[];
  assignedBy: string;
  dueDate: string;
  priority: string;
  weight: number;
  notes?: string;
  allowDuplicate: boolean;
};

export async function createAssignments(
  input: CreateAssignmentsInput
): Promise<ActionResult<{ assignmentIds: string[] }>> {
  // ✅ Manager authentication
  await authManager();

  const parsed = assignmentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const { taskId, employeeIds, assignedBy, dueDate, priority, weight, notes, allowDuplicate } = parsed.data;

  const { data: task } = await supabase.from("kpi_tasks").select("*").eq("id", taskId).maybeSingle();
  if (!task) return { success: false, error: "KPI task not found" };

  const { data: manager } = await supabase.from("employees").select("*").eq("id", assignedBy).maybeSingle();
  if (!manager) return { success: false, error: "Assigning manager could not be identified" };

  const { data: employeesToAssign } = await supabase.from("employees").select("*").in("id", employeeIds);
  if (!employeesToAssign || employeesToAssign.length !== employeeIds.length) {
    return { success: false, error: "One or more employees could not be found" };
  }

  const inactive = employeesToAssign.filter((e) => e.status !== "active");
  if (inactive.length > 0) {
    return { success: false, error: `Cannot assign to inactive employees: ${inactive.map((e) => e.full_name).join(", ")}` };
  }

  if (!allowDuplicate) {
    const { data: existing } = await supabase
      .from("task_assignments")
      .select("employee_id")
      .eq("task_id", taskId)
      .in("employee_id", employeeIds);
    if (existing && existing.length > 0) {
      return { success: false, error: "One or more employees already have this KPI task assigned" };
    }
  }

  const dueDateObj = new Date(dueDate);

  const { data: inserted, error: insertError } = await supabase
    .from("task_assignments")
    .insert(
      employeesToAssign.map((employee) => ({
        task_id: taskId,
        employee_id: employee.id,
        assigned_by: assignedBy,
        due_date: dueDateObj.toISOString(),
        priority,
        weight,
        notes: notes || null,
        allow_duplicate: allowDuplicate,
        status: "pending",
      }))
    )
    .select("*");

  if (insertError || !inserted) {
    console.error("Assignment insert failed:", JSON.stringify(insertError, null, 2));
    return { success: false, error: "Database transaction failed while saving the assignment" };
  }

  for (const assignment of inserted) {
    const employee = employeesToAssign.find((e) => e.id === assignment.employee_id)!;
    const message = buildAssignmentMessage({
      employeeFirstName: employee.full_name.split(" ")[0],
      taskTitle: task.title,
      priority: assignment.priority,
      dueDate: new Date(assignment.due_date),
      weight: assignment.weight,
      assignedByName: manager.full_name,
    });

    const result = employee.telegram_chat_id
      ? await sendTelegramMessage(employee.telegram_chat_id, message)
      : { ok: false as const, error: "Employee has no Telegram Chat ID on file" };

    await supabase.from("telegram_logs").insert({
      assignment_id: assignment.id,
      chat_id: employee.telegram_chat_id ?? null,
      message,
      status: result.ok ? "sent" : "failed",
      error: result.ok ? null : result.error,
    });
  }

  revalidatePath("/assignments");
  revalidatePath("/dashboard");

  return { success: true, data: { assignmentIds: inserted.map((a) => a.id) } };
}