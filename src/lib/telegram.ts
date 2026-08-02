
import { format } from "date-fns";

const TELEGRAM_API_BASE = "https://api.telegram.org";

export type TelegramSendResult =
  | { ok: true; messageId: number }
  | { ok: false; error: string };


interface AssignmentNotificationData {
  employeeFirstName: string;
  taskTitle: string;
  priority: string;
  dueDate: Date;
  weight: number;
  assignedByName: string;
}

export function buildAssignmentMessage(data: AssignmentNotificationData): string {
  const priorityLabel = data.priority.charAt(0).toUpperCase() + data.priority.slice(1);

  return [
    "📌 New KPI Assignment",
    "",
    `Hello ${data.employeeFirstName},`,
    "You have been assigned a new KPI task.",
    "",
    `Task: ${data.taskTitle}`,
    `Priority: ${priorityLabel}`,
    `Due Date: ${format(data.dueDate, "MMMM d, yyyy")}`,
    `Weight: ${data.weight}%`,
    `Assigned By: ${data.assignedByName}`,
    "",
    "Please log into the KPI system for more details.",
  ].join("\n");
}




export async function sendTelegramMessage(
  chatId: string,
  message: string
): Promise<TelegramSendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return { ok: false, error: "TELEGRAM_BOT_TOKEN is not configured" };
  }

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    const payload = await response.json();

    if (!response.ok || !payload.ok) {
      return {
        ok: false,
        error: payload.description ?? `Telegram API returned HTTP ${response.status}`,
      };
    }

    return { ok: true, messageId: payload.result.message_id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error contacting Telegram API";
    return { ok: false, error: message };
  }
}