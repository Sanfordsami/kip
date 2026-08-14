"use server";

import { revalidatePath } from "next/cache";
import { assignmentStatusSchema } from "@/lib/validations";
import { updateAssignmentStatusForEmployee } from "@/lib/assignment-status";
import type { ActionResult } from "@/actions/employee-actions";
import { authEmployee } from "@/lib/auth";

type UpdateAssignmentStatusInput = { assignmentId: string; status: string };

export async function updateAssignmentStatus(
  input: UpdateAssignmentStatusInput
): Promise<ActionResult> {
  const session = await authEmployee();

  const parsed = assignmentStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const result = await updateAssignmentStatusForEmployee(
    parsed.data.assignmentId,
    session.employeeId,
    parsed.data.status
  );

  if (!result.ok) {
    return { success: false, error: result.error };
  }

  revalidatePath("/assignments");
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}
