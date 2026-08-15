"use client";

import { useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
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
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  const sendButtonRef = useRef<HTMLButtonElement>(null);

  function toggleRole(role: string) {
    setTargetRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  }

  function handleCreateAndSend() {
    setError(null);
    setSuccess(null);

    const rect = sendButtonRef.current?.getBoundingClientRect();
    if (rect) {
      setPopupPos({ top: rect.top, left: rect.right });
    }

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

      setTimeout(() => setSuccess(null), 4000);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="flex items-start gap-2 rounded-md p-3 text-sm" style={{ background: "rgba(248,113,113,0.1)", color: "var(--color-signal-bad)" }}>
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
        </div>
      )}

      {success && popupPos && typeof document !== "undefined" && createPortal(
        <div
          key={success}
          className="fixed z-50 flex items-center gap-2 rounded-md px-4 py-3 text-sm shadow-lg"
          style={{
            top: popupPos.top + 10,
            left: typeof window !== "undefined"
              ? Math.min(popupPos.left + 15, window.innerWidth - 360)
              : popupPos.left + 15,
            transform: "translateY(-50%)",
            background: "var(--color-surface, #f4f4f5)",
            color: "var(--color-text, #3f3f46)",
            border: "1px solid var(--color-line, #e4e4e7)",
            animation: "slideInFromRight 0.25s ease-out forwards",
            maxWidth: "350px",
            minWidth: "280px",
            padding: "12px 16px",
            wordBreak: "break-word",
            lineHeight: "1.5",
            boxSizing: "border-box",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 flex-shrink-0" style={{ color: "var(--color-signal-good)" }} />
          <span style={{ whiteSpace: "normal", wordWrap: "break-word", flex: 1 }}>
            {success}
          </span>
        </div>,
        document.body
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

      <Button ref={sendButtonRef} onClick={handleCreateAndSend} disabled={isPending} className="mt-2">
        {isPending ? "Sending…" : "Create & Send Campaign"}
      </Button>
    </div>
  );
}
