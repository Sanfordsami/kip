"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { employeeSchema } from "@/lib/validations";
import type { ActionResult } from "@/actions/employee-actions";
import { authManager } from "@/actions/auth-helpers";

type CreateEmployeeInput = {
  fullName: string;
  email: string;
  departmentId: string;
  position: string;
  telegramChatId?: string;
  status: "active" | "inactive";
  password: string;
};

export async function createEmployee(
  input: CreateEmployeeInput
): Promise<ActionResult<{ id: string }>> {
  // ✅ Manager authentication
  await authManager();

  const parsed = employeeSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { data: existing } = await supabase
    .from("employees")
    .select("id")
    .eq("email", parsed.data.email)
    .maybeSingle();

  if (existing) {
    return { success: false, error: "An employee with this email already exists" };
  }

  const { data: row, error } = await supabase
    .from("employees")
    .insert({
      full_name: parsed.data.fullName,
      email: parsed.data.email,
      department_id: parsed.data.departmentId,
      position: parsed.data.position,
      telegram_chat_id: parsed.data.telegramChatId || null,
      status: parsed.data.status,
      role: "employee",
    })
    .select("id")
    .single();

  if (error || !row) {
    console.error("createEmployee failed:", error);
    return { success: false, error: "Database transaction failed while creating employee" };
  }

  const { error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { employeeId: row.id, fullName: parsed.data.fullName },
  });

  if (authError) {
    console.error("createEmployee: failed to create auth account:", authError);
    return { success: false, error: `Employee saved, but login account failed: ${authError.message}` };
  }

  revalidatePath("/assignments/new");
  revalidatePath("/employees/new");
  return { success: true, data: { id: row.id } };
}