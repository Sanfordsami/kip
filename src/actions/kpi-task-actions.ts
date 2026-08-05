"use server";

import { supabase } from "@/lib/supabase";
import { kpiTaskSchema } from "@/lib/validations";
import type { ActionResult } from "./employee-actions";

export async function createKpiTask(
  input: unknown,
  createdBy: string
): Promise<ActionResult<{ id: string }>> {
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
      created_by: createdBy,
    })
    .select("id")
    .single();

  if (error || !row) {
    console.error("createKpiTask failed:", error);
    return { success: false, error: "Database transaction failed while creating KPI task" };
  }

  return { success: true, data: { id: row.id } };
}

export async function getKpiTasks() {
  const { data, error } = await supabase
    .from("kpi_tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getKpiTasks failed:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    weight: row.weight,
    createdBy: row.created_by,
    createdAt: new Date(row.created_at),
  }));
}
