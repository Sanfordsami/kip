"use server";

import { supabase } from "@/lib/supabase";
import { kpiTaskSchema, type KpiTaskInput } from "@/lib/validations";
import type { ActionResult } from "@/actions/employee-actions";
// import { authManager } from "@/actions/auth-helpers";

import { authManager } from "@/lib/auth";

export async function createKpiTask(
    
  input: KpiTaskInput 
): Promise<ActionResult<{ id: string }>> {

  // ✅ Get authenticated manager from session
  const session = await authManager();
  
  const parsed = kpiTaskSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { data: row, error } = await supabase
    .from("kpi_tasks")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description || null,
      weight: parsed.data.weight,
      created_by: session.employeeId, // ✅ Use session
    })
    .select("id")
    .single();

  if (error || !row) {
    console.error("createKpiTask failed:", error);
    return { success: false, error: "Database transaction failed while creating KPI task" };
  }

  return { success: true, data: { id: row.id } };
}