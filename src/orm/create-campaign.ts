"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { authManager } from "@/lib/auth";
import type { ActionResult } from "@/actions/employee-actions";
import { CreateCampaignInput } from "@/lib/validations";

export async function createCampaign(input: CreateCampaignInput): Promise<ActionResult<{ id: string }>> {
  const session = await authManager();

  if (!input.title.trim() || !input.body.trim()) {
    return { success: false, error: "Title and message body are required" };
  }
  if (input.targetRoles.length === 0) {
    return { success: false, error: "Select at least one target role" };
  }
  if (!input.sendEmail && !input.sendTelegram) {
    return { success: false, error: "Select at least one channel (email or Telegram)" };
  }

  const { data: row, error } = await supabaseAdmin
    .from("campaigns")
    .insert({
      title: input.title,
      body: input.body,
      target_roles: input.targetRoles,
      send_email: input.sendEmail,
      send_telegram: input.sendTelegram,
      created_by: session.employeeId,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !row) {
    console.error("createCampaign failed:", error);
    return { success: false, error: "Database transaction failed while creating campaign" };
  }

  revalidatePath("/admin/campaigns");
  return { success: true, data: { id: row.id } };
}