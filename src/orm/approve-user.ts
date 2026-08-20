"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import type { ActionResult } from "@/actions/employee-actions";
import { authManager } from "@/lib/auth";

interface ApproveUserInput {
  userId: string;
  departmentId: string;
  position: string;
  role: "manager" | "sales" | "support" | "engineering" | "marketing";
}

export async function approveUser(input: ApproveUserInput): Promise<ActionResult<{ id: string }>> {
  await authManager();

  const { data: pendingUser } = await supabase.from("users").select("*").eq("id", input.userId).maybeSingle();

  if (!pendingUser) {
    return { success: false, error: "Pending user not found" };
  }

  const { data: row, error } = await supabase
    .from("employees")
    .insert({
      full_name: pendingUser.full_name,
      email: pendingUser.email,
      department_id: input.departmentId,
      position: input.position,
      status: "active",
      role: input.role,
    })
    .select("id")
    .single();

  if (error || !row) {
    console.error("approveUser: failed to create employee:", JSON.stringify(error, null, 2));
    return { success: false, error: "Database transaction failed while creating employee" };
  }

  await supabase.from("users").delete().eq("id", input.userId);

  revalidatePath("/admin/employees");
  revalidatePath("/admin/pending");
  return { success: true, data: { id: row.id } };
}
