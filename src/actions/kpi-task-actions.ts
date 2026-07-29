"use server";

import { db, schema } from "@/db";
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
  try {
    const [row] = await db
      .insert(schema.kpiTasks)
      .values({
        title: parsed.data.title,
        description: parsed.data.description || null,
        weight: parsed.data.weight,
        createdBy,
      })
      .returning();

    return { success: true, data: { id: row.id } };
  } catch (err) {
    console.error("createKpiTask failed:", err);
    return { success: false, error: "Database transaction failed while creating KPI task" };
  }
}

export async function getKpiTasks() {
  return db.query.kpiTasks.findMany({
    orderBy: (fields, { desc }) => desc(fields.createdAt),
  });
}