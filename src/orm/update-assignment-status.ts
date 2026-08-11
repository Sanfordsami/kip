"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { assignmentStatusSchema } from "@/lib/validations";
import type { ActionResult } from "@/actions/employee-actions";
import { authEmployee } from "@/actions/auth-helpers";

type UpdateAssignmentStatusInput = {
  assignmentId: string;
  status: string;
};

export async function updateAssignmentStatus(
  input: UpdateAssignmentStatusInput
): Promise<ActionResult> {
  // ✅ Employee authentication
  const session = await authEmployee();

  const parsed = assignmentStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const { assignmentId, status } = parsed.data;

  // Verify the assignment belongs to this employee
  const { data: assignment } = await supabase
    .from("task_assignments")
    .select("employee_id")
    .eq("id", assignmentId)
    .maybeSingle();

  if (!assignment) {
    return { success: false, error: "Assignment not found" };
  }

  // Employee can only update their own assignments
  if (assignment.employee_id !== session.employeeId) {
    return { success: false, error: "You can only update your own assignments" };
  }

  const { error } = await supabase
    .from("task_assignments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", assignmentId);

  if (error) {
    console.error("updateAssignmentStatus failed:", error);
    return { success: false, error: "Database transaction failed while updating status" };
  }

  revalidatePath("/assignments");
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}