"use server";

import { supabase } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { loginSchema, type LoginInput } from "@/lib/validations";
import type { ActionResult } from "./employee-actions";


export async function login(input: LoginInput): Promise<ActionResult<{ role: "manager" | "employee" }>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const { email, password } = parsed.data;

  const supabaseServer = await createSupabaseServerClient();
  const { data, error } = await supabaseServer.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { success: false, error: "Invalid email or password" };
  }

  const { data: employee } = await supabase
    .from("employees")
    .select("role, status")
    .eq("email", email)
    .maybeSingle();

  if (!employee) {
    return { success: false, error: "No employee record found for this account" };
  }
  if (employee.status !== "active") {
    await supabaseServer.auth.signOut();
    return { success: false, error: "This account is inactive. Contact your manager." };
  }

  return { success: true, data: { role: employee.role } };
}

export async function logout(): Promise<void> {
  const supabaseServer = await createSupabaseServerClient();
  await supabaseServer.auth.signOut();
}
