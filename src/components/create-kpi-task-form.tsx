"use client";

import { useState, useTransition } from "react";
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
      {formError && (
        <div className="flex items-start gap-2 rounded-md p-3 text-sm" style={{ background: "rgba(248,113,113,0.1)", color: "var(--color-signal-bad)" }}>
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{formError}</span>
        </div>
      )}
      {successMessage && (
        <div className="flex items-start gap-2 rounded-md p-3 text-sm" style={{ background: "rgba(52,211,153,0.1)", color: "var(--color-signal-good)" }}>
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><span>{successMessage}</span>
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

      <Button onClick={handleSubmit} disabled={isPending} className="mt-2">
        {isPending ? "Creating…" : "Create KPI Task"}
      </Button>
    </div>
  );
}
