"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import { employeeSchema } from "@/lib/validations";

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createEmployee(input: unknown): Promise<ActionResult<{ id: string }>> {
  // 1. Validate the incoming data against our Zod schema
  const parsed = employeeSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // 2. Business rule: no duplicate emails
  const existing = await db.query.employees.findFirst({
    where: eq(schema.employees.email, parsed.data.email),
  });

  if (existing) {
    return { success: false, error: "An employee with this email already exists" };
  }

  // 3. Insert the employee
  try {
    const [row] = await db
      .insert(schema.employees)
      .values({
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        departmentId: parsed.data.departmentId,
        position: parsed.data.position,
        telegramChatId: parsed.data.telegramChatId || null,
        status: parsed.data.status,
      })
      .returning();

    revalidatePath("/assignments/new");
    return { success: true, data: { id: row.id } };
  } catch (err) {
    console.error("createEmployee failed:", err);
    return { success: false, error: "Database transaction failed while creating employee" };
  }
}