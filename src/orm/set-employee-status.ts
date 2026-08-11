"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import type { ActionResult } from "@/actions/employee-actions";
// import { authManager } from "@/actions/auth-helpers";
import { authManager } from "@/lib/auth";

export async function setEmployeeStatus(
  employeeId: string,
  status: "active" | "inactive"
): Promise<ActionResult> {
  // ✅ Manager authentication
  await authManager();

  const { data: existing } = await supabase
    .from("employees")
    .select("id")
    .eq("id", employeeId)
    .maybeSingle();

  if (!existing) {
    return { success: false, error: "Employee not found" };
  }

  const { error } = await supabase
    .from("employees")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", employeeId);

  if (error) {
    console.error("setEmployeeStatus failed:", error);
    return { success: false, error: "Database transaction failed while updating employee status" };
  }

  revalidatePath("/assignments/new");
  return { success: true, data: undefined };
}