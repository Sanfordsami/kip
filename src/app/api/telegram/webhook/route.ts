import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { answerCallbackQuery } from "@/lib/telegram";
import { updateAssignmentStatusForEmployee } from "@/lib/assignment-status";


export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const update = await request.json();
  console.log("TELEGRAM UPDATE:", JSON.stringify(update)); //

  const callback = update?.callback_query;

  // Not a button tap (e.g. a plain text message) — nothing to do here.
  if (!callback) {
    return NextResponse.json({ ok: true });
  }

  const callbackQueryId: string = callback.id;
  const chatId: string = String(callback.from?.id ?? "");
  const data: string = callback.data ?? "";

  // Expected format: "status:<value>:<assignmentId>"
  const parts = data.split(":");
  if (parts.length !== 3 || parts[0] !== "status") {
    await answerCallbackQuery(callbackQueryId, "Unrecognized action.", false);
    return NextResponse.json({ ok: true });
  }

  const [, status, assignmentId] = parts;

  // Match the Telegram sender to a real employee via their stored chat ID.
  const { data: employee } = await supabaseAdmin
    .from("employees")
    .select("id, full_name")
    .eq("telegram_chat_id", chatId)
    .maybeSingle();

  if (!employee) {
    await answerCallbackQuery(callbackQueryId, "We couldn't match your Telegram account to an employee.", true);
    return NextResponse.json({ ok: true });
  }

  // Same shared function the in-app dashboard uses — identical rules,
  // including "you can only update your own assignments".
  const result = await updateAssignmentStatusForEmployee(assignmentId, employee.id, status);

  if (!result.ok) {
    await answerCallbackQuery(callbackQueryId, `Update failed: ${result.error}`, true);
    return NextResponse.json({ ok: true });
  }

  const statusLabel = status.replace("_", " ");
  await answerCallbackQuery(callbackQueryId, `Status updated to "${statusLabel}".`, false);

  // Telegram requires 200 regardless of outcome, or it will keep retrying.
  return NextResponse.json({ ok: true });
}
