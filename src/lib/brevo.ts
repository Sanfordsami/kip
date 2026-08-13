export type BrevoSendResult = { ok: true } | { ok: false; error: string };

export async function sendBrevoEmail({
  to,
  subject,
  htmlBody,
}: {
  to: string;
  subject: string;
  htmlBody: string;
}): Promise<BrevoSendResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME ?? "Addis Reality KPI";

  if (!apiKey || !senderEmail) {
    return { ok: false, error: "Brevo API key or sender email is not configured" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: htmlBody,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      return { ok: false, error: payload.message ?? `Brevo API returned HTTP ${response.status}` };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error contacting Brevo" };
  }
}
