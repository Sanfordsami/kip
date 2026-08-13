import { getCampaigns } from "@/actions/campaign-actions";
import { CampaignForm } from "@/components/campaign-form";
import { format } from "date-fns";

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

  return (
    <main className="px-8 py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight" style={{ color: "var(--color-text)" }}>
          Campaigns
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          Send a message to a group of employees via email and/or Telegram.
        </p>
      </div>

      <div className="kpi-card mb-8">
        <CampaignForm />
      </div>

      <div className="kpi-card overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-line)" }}>
              {["Title", "Target Roles", "Channels", "Status", "Sent"].map((h) => (
                <th key={h} className="px-6 py-3 font-medium" style={{ color: "var(--color-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c: any) => (
              <tr key={c.id} style={{ borderBottom: "1px solid var(--color-line)" }}>
                <td className="px-6 py-4 font-medium" style={{ color: "var(--color-text)" }}>{c.title}</td>
                <td className="px-6 py-4" style={{ color: "var(--color-muted)" }}>{(c.target_roles ?? []).join(", ")}</td>
                <td className="px-6 py-4" style={{ color: "var(--color-muted)" }}>
                  {[c.send_email && "Email", c.send_telegram && "Telegram"].filter(Boolean).join(" + ")}
                </td>
                <td className="px-6 py-4 capitalize" style={{ color: "var(--color-muted)" }}>{c.status}</td>
                <td className="px-6 py-4" style={{ color: "var(--color-muted)" }}>
                  {c.sent_at ? format(new Date(c.sent_at), "MMM d, yyyy") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
