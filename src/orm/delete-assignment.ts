"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import type { ActionResult } from "@/actions/employee-actions";
// import { authManager } from "@/actions/auth-helpers";
import { authManager } from "@/lib/auth";

export async function deleteAssignment(assignmentId: string): Promise<ActionResult> {
  // ✅ Manager authentication
  await authManager();

  const { data: existing } = await supabase
    .from("task_assignments")
    .select("id")
    .eq("id", assignmentId)
    .maybeSingle();

  if (!existing) {
    return { success: false, error: "Assignment not found" };
  }

  const { error } = await supabase.from("task_assignments").delete().eq("id", assignmentId);

  if (error) {
    console.error("deleteAssignment failed:", error);
    return { success: false, error: "Database transaction failed while deleting the assignment" };
  }

  revalidatePath("/assignments");
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}