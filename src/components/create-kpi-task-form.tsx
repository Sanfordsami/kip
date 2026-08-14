"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createKpiTask } from "@/actions/kpi-task-actions";
import { kpiTaskSchema } from "@/lib/validations";

export function CreateKpiTaskForm({ managerId }: { managerId: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("");

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const btnRef = useRef<HTMLButtonElement>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (successMessage && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPopupPos({ top: rect.top + rect.height / 2, left: rect.right + 12 });
    }
  }, [successMessage]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  function handleSubmit() {
    setFormError(null);
    setSuccessMessage(null);

    const parsed = kpiTaskSchema.safeParse({ title, description, weight: Number(weight) });
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>);
      return;
    }
    setErrors({});

    startTransition(async () => {
      const result = await createKpiTask(parsed.data);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      setSuccessMessage(`"${title}" was added to the KPI task catalog.`);
      setTitle("");
      setDescription("");
      setWeight("");
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <style>{`
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateY(-50%) translateX(16px); }
          to { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
      `}</style>

      {formError && (
        <div className="flex items-start gap-2 rounded-md p-3 text-sm" style={{ background: "rgba(248,113,113,0.1)", color: "var(--color-signal-bad)" }}>
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{formError}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        {errors.title && <p className="text-xs" style={{ color: "var(--color-signal-bad)" }}>{errors.title[0]}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Description (optional)</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Suggested Weight (%)</Label>
        <Input type="number" min={1} max={100} value={weight} onChange={(e) => setWeight(e.target.value)} />
        {errors.weight && <p className="text-xs" style={{ color: "var(--color-signal-bad)" }}>{errors.weight[0]}</p>}
      </div>

      <Button ref={btnRef} onClick={handleSubmit} disabled={isPending} className="mt-2 self-start">
        {isPending ? "Creating…" : "Create KPI Task"}
      </Button>

      {successMessage && popupPos && (
  <div
    key={successMessage}
    className="fixed z-50 flex items-center gap-2 rounded-md px-3 py-2 text-sm shadow-lg"
    style={{
      top: popupPos.top -5,
      // Position to the left of the button if it would go off-screen
      left: typeof window !== "undefined" 
        ? (popupPos.left + 500 > window.innerWidth 
            ? Math.max(20, popupPos.left - 320) // Position to the left
            : Math.min(popupPos.left + 15, window.innerWidth - 320)) // Position to the right
        : popupPos.left + 15,
      transform: "translateY(-50%)",
      background: "var(--color-surface, #f4f4f5)",
      color: "var(--color-text, #3f3f46)",
      border: "1px solid var(--color-line, #e4e4e7)",
      animation: "slideInFromRight 0.25s ease-out forwards",
      maxWidth: "320px",
      minWidth: "200px",
      padding: "10px 14px",
      wordBreak: "break-word",
      lineHeight: "1.5",
      boxSizing: "border-box",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    }}
  >
    <CheckCircle2 className="h-4 w-4 shrink-0 flex-shrink-0" />
    <span style={{ whiteSpace: "normal", wordWrap: "break-word", flex: 1 }}>
      {successMessage}
    </span>
  </div>
)}
      
    </div>
  );
}