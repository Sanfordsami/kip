"use server";

import { supabase } from "@/lib/supabase";
import { authManager } from "@/actions/auth-helpers";

export async function getKpiTasks() {
  // ✅ Manager authentication
  await authManager();

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