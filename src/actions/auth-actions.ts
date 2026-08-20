"use server";

import { supabase } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { loginSchema, type LoginInput } from "@/lib/validations";
import type { ActionResult } from "./employee-actions";

type Role = "manager" | "sales" | "support" | "engineering" | "marketing";

export async function login(input: LoginInput): Promise<ActionResult<{ role: Role }>> {
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
  return { success: true, data: { role: employee.role as Role } };
}

export async function logout(): Promise<void> {
  const supabaseServer = await createSupabaseServerClient();
  await supabaseServer.auth.signOut();
}

interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
}

export async function signUp(input: SignUpInput): Promise<ActionResult> {
  if (!input.fullName.trim() || !input.email.trim() || input.password.length < 6) {
    return { success: false, error: "Please fill in all fields (password must be at least 6 characters)" };
  }

  const { data: existingUser } = await supabase.from("users").select("id").eq("email", input.email).maybeSingle();
  const { data: existingEmployee } = await supabase.from("employees").select("id").eq("email", input.email).maybeSingle();

  if (existingUser || existingEmployee) {
    return { success: false, error: "An account with this email already exists" };
  }

  const { supabaseAdmin } = await import("@/lib/supabase-admin");
  const { error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { fullName: input.fullName },
  });

  if (authError) {
    console.error("signUp: failed to create auth account:", authError);
    return { success: false, error: `Sign up failed: ${authError.message}` };
  }

  const { error: dbError } = await supabase
    .from("users")
    .insert({ full_name: input.fullName, email: input.email });

  if (dbError) {
    console.error("signUp: failed to create users row:", JSON.stringify(dbError, null, 2));
    return { success: false, error: `Account created, but registration record failed: ${dbError.message}` };
  }

  return { success: true, data: undefined };
}
