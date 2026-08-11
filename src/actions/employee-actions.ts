"use server";

// import { revalidatePath } from "next/cache";
// import { supabase } from "@/lib/supabase";
// import { supabaseAdmin } from "@/lib/supabase-admin";
// import { employeeSchema } from "@/lib/validations";
import { createEmployee as createEmployeeFn } from "@/orm/create-employee";
import { setEmployeeStatus as setEmployeeStatusFn } from "@/orm/set-employee-status";

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };



export const createEmployee = createEmployeeFn;
export const setEmployeeStatus = setEmployeeStatusFn;



// export async function createEmployee(input: unknown): Promise<ActionResult<{ id: string }>> {
//   const parsed = employeeSchema.safeParse(input);

//   if (!parsed.success) {
//     return {
//       success: false,
//       error: "Validation failed",
//       fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
//     };
//   }

//   const { data: existing } = await supabase
//     .from("employees")
//     .select("id")
//     .eq("email", parsed.data.email)
//     .maybeSingle();

//   if (existing) {
//     return { success: false, error: "An employee with this email already exists" };
//   }

//   const { data: row, error } = await supabase
//     .from("employees")
//     .insert({
//       full_name: parsed.data.fullName,
//       email: parsed.data.email,
//       department_id: parsed.data.departmentId,
//       position: parsed.data.position,
//       telegram_chat_id: parsed.data.telegramChatId || null,
//       status: parsed.data.status,
//       role: "employee",
//     })
//     .select("id")
//     .single();

//   if (error || !row) {
//     console.error("createEmployee failed:", error);
//     return { success: false, error: "Database transaction failed while creating employee" };
//   }

//   const { error: authError } = await supabaseAdmin.auth.admin.createUser({
//     email: parsed.data.email,
//     password: parsed.data.password,
//     email_confirm: true,
//     user_metadata: { employeeId: row.id, fullName: parsed.data.fullName },
//   });

//   if (authError) {
//     console.error("createEmployee: failed to create auth account:", authError);
//     return { success: false, error: `Employee saved, but login account failed: ${authError.message}` };
//   }

//   revalidatePath("/assignments/new");
//   revalidatePath("/employees/new");
//   return { success: true, data: { id: row.id } };
// }

// export async function setEmployeeStatus(
//   employeeId: string,
//   status: "active" | "inactive"
// ): Promise<ActionResult> {
//   const { data: existing } = await supabase
//     .from("employees")
//     .select("id")
//     .eq("id", employeeId)
//     .maybeSingle();

//   if (!existing) {
//     return { success: false, error: "Employee not found" };
//   }

//   const { error } = await supabase
//     .from("employees")
//     .update({ status, updated_at: new Date().toISOString() })
//     .eq("id", employeeId);

//   if (error) {
//     console.error("setEmployeeStatus failed:", error);
//     return { success: false, error: "Database transaction failed while updating employee status" };
//   }

//   revalidatePath("/assignments/new");
//   return { success: true, data: undefined };
// }
