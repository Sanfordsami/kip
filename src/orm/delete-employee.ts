"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import type { ActionResult } from "@/actions/employee-actions";
import { authManager } from "@/lib/auth";

export async function deleteEmployee(employeeId: string): Promise<ActionResult> {
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

  const { error } = await supabase.from("employees").delete().eq("id", employeeId);

  if (error) {
    console.error("deleteEmployee failed:", error);
    return { success: false, error: "Database transaction failed while deleting the employee" };
  }

  revalidatePath("/admin/employees");
  return { success: true, data: undefined };
}