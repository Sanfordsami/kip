"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendTelegramMessage } from "@/lib/telegram";
import { sendBrevoEmail } from "@/lib/brevo";
import { authManager } from "@/lib/auth";
import type { ActionResult } from "@/actions/employee-actions";

export async function sendCampaign(campaignId: string): Promise<ActionResult> {
  await authManager();

  const { data: campaign } = await supabaseAdmin.from("campaigns").select("*").eq("id", campaignId).maybeSingle();
  if (!campaign) return { success: false, error: "Campaign not found" };

  await supabaseAdmin.from("campaigns").update({ status: "sending" }).eq("id", campaignId);

  const { data: recipients } = await supabaseAdmin
    .from("employees")
    .select("*")
    .in("role", campaign.target_roles)
    .eq("status", "active");

  if (!recipients || recipients.length === 0) {
    await supabaseAdmin.from("campaigns").update({ status: "failed" }).eq("id", campaignId);
    return { success: false, error: "No active employees match the selected roles" };
  }

  for (const employee of recipients) {
    if (campaign.send_email) {
      const result = await sendBrevoEmail({
        to: employee.email,
        subject: campaign.title,
        htmlBody: `<p>${campaign.body.replace(/\n/g, "<br/>")}</p>`,
      });
      await supabaseAdmin.from("campaign_logs").insert({
        campaign_id: campaignId,
        employee_id: employee.id,
        channel: "email",
        status: result.ok ? "sent" : "failed",
        error: result.ok ? null : result.error,
      });
    }

    if (campaign.send_telegram) {
      const result = employee.telegram_chat_id
        ? await sendTelegramMessage(employee.telegram_chat_id, `📢 ${campaign.title}\n\n${campaign.body}`)
        : { ok: false as const, error: "No Telegram Chat ID on file" };
      await supabaseAdmin.from("campaign_logs").insert({
        campaign_id: campaignId,
        employee_id: employee.id,
        channel: "telegram",
        status: result.ok ? "sent" : "failed",
        error: result.ok ? null : result.error,
      });
    }
  }

  await supabaseAdmin.from("campaigns").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", campaignId);

  revalidatePath("/admin/campaigns");
  return { success: true, data: undefined };
}