"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import type { ActionResult } from "@/actions/employee-actions";
import { requireManager } from "@/lib/session";

export async function deleteAssignment(assignmentId: string): Promise<ActionResult> {
  // ✅ Manager authentication
  const session = await requireManager();
  if (!session) {
    return { success: false, error: "Unauthorized: Manager access required" };
  }

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