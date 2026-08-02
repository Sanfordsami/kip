"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { loginSchema } from "@/lib/validations";
import { createSession, destroySession } from "@/lib/session";
import type { ActionResult } from "./employee-actions";

export async function login(input: unknown): Promise<ActionResult<{ role: "manager" | "employee" }>> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email, password } = parsed.data;

  const employee = await db.query.employees.findFirst({
    where: eq(schema.employees.email, email),
  });

  if (!employee || !employee.passwordHash) {
    return { success: false, error: "Invalid email or password" };
  }

  if (employee.status !== "active") {
    return { success: false, error: "This account is inactive. Contact your manager." };
  }

  const passwordMatches = await bcrypt.compare(password, employee.passwordHash);
  if (!passwordMatches) {
    return { success: false, error: "Invalid email or password" };
  }

  await createSession({ employeeId: employee.id, role: employee.role });

  return { success: true, data: { role: employee.role } };
}

export async function logout(): Promise<void> {
  await destroySession();
}
