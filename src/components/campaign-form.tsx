"use client";

import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { createCampaign, sendCampaign } from "@/actions/campaign-actions";

const ROLES = ["manager", "sales", "support", "engineering", "marketing"];

export function CampaignForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [sendEmail, setSendEmail] = useState(false);
  const [sendTelegram, setSendTelegram] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleRole(role: string) {
    setTargetRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  }

  function handleCreateAndSend() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const createResult = await createCampaign({ title, body, targetRoles, sendEmail, sendTelegram });
      if (!createResult.success) {
        setError(createResult.error);
        return;
      }
      const sendResult = await sendCampaign(createResult.data.id);
      if (!sendResult.success) {
        setError(sendResult.error);
        return;
      }
      setSuccess("Campaign sent! Check the list below for delivery status.");
      setTitle("");
      setBody("");
      setTargetRoles([]);
      setSendEmail(false);
      setSendTelegram(false);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="flex items-start gap-2 rounded-md p-3 text-sm" style={{ background: "rgba(248,113,113,0.1)", color: "var(--color-signal-bad)" }}>
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 rounded-md p-3 text-sm" style={{ background: "rgba(52,211,153,0.1)", color: "var(--color-signal-good)" }}>
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><span>{success}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Q1 review starts Monday" />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Message</Label>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Target Roles</Label>
        <div className="flex flex-wrap gap-4">
          {ROLES.map((role) => (
            <label key={role} className="flex items-center gap-2 text-sm capitalize" style={{ color: "var(--color-text)" }}>
              <Checkbox checked={targetRoles.includes(role)} onCheckedChange={() => toggleRole(role)} />
              {role}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Channels</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text)" }}>
            <Checkbox checked={sendEmail} onCheckedChange={(c) => setSendEmail(c === true)} />
            Email
          </label>
          <label className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text)" }}>
            <Checkbox checked={sendTelegram} onCheckedChange={(c) => setSendTelegram(c === true)} />
            Telegram
          </label>
        </div>
      </div>

      <Button onClick={handleCreateAndSend} disabled={isPending} className="mt-2">
        {isPending ? "Sending…" : "Create & Send Campaign"}
      </Button>
    </div>
  );
}
