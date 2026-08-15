"use client";

import { useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { EmployeeSelector, type SelectableEmployee } from "@/components/employee-selector";
import { KpiSelector, type SelectableKpiTask } from "@/components/kpi-selector";
import { DatePicker } from "@/components/date-picker";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { createAssignments } from "@/actions/assignment-actions";
import { assignmentSchema } from "@/lib/validations";

interface AssignmentFormProps {
  employees: SelectableEmployee[];
  tasks: SelectableKpiTask[];
  currentManagerId: string;
}

type Priority = "low" | "medium" | "high" | "urgent";

export function AssignmentForm({ employees, tasks, currentManagerId }: AssignmentFormProps) {
  const [taskId, setTaskId] = useState<string>();
  const [employeeIds, setEmployeeIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState<Date>();
  const [weight, setWeight] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [allowDuplicate, setAllowDuplicate] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const selectedTask = tasks.find((t) => t.id === taskId);

  function validateAndOpenConfirm() {
    setFormError(null);
    setSuccessMessage(null);

    const rect = submitButtonRef.current?.getBoundingClientRect();
    if (rect) {
      setPopupPos({ top: rect.top, left: rect.right });
    }

    const result = assignmentSchema.safeParse({
      taskId,
      employeeIds,
      dueDate: dueDate?.toISOString() ?? "",
      priority,
      weight: Number(weight),
      notes,
      allowDuplicate,
    });

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors as Record<string, string[]>);
      return;
    }

    setErrors({});
    setConfirmOpen(true);
  }

  function handleConfirm() {
    startTransition(async () => {
      const result = await createAssignments({
        taskId: taskId!, employeeIds,
        dueDate: dueDate?.toISOString() ?? "", priority, weight: Number(weight), notes, allowDuplicate,
      });

      if (!result.success) {
        setFormError(result.error);
        setConfirmOpen(false);
        return;
      }

      setConfirmOpen(false);
      console.log("DEBUG popupPos:", popupPos); setSuccessMessage(`Assigned to ${employeeIds.length} employee(s). Telegram notifications sent.`); console.log("DEBUG successMessage set");

      // Auto-dismiss after a few seconds, like a typical toast.
      setTimeout(() => setSuccessMessage(null), 4000);
    });
  }

  return (
    <div className="flex max-w-2xl flex-col gap-7">
      {formError && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {successMessage && popupPos && typeof document !== "undefined" && createPortal(
        <div
          key={successMessage}
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
            {successMessage}
          </span>
        </div>,
        document.body
      )}

      <div className="flex flex-col gap-2">
        <Label>KPI Task</Label>
        <KpiSelector tasks={tasks} value={taskId} onChange={setTaskId} />
        {errors.taskId && <p className="text-xs text-red-600">{errors.taskId[0]}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Employee(s)</Label>
        <EmployeeSelector employees={employees} selectedIds={employeeIds} onChange={setEmployeeIds} />
        {errors.employeeIds && <p className="text-xs text-red-600">{errors.employeeIds[0]}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Due Date</Label>
          <DatePicker value={dueDate} onChange={setDueDate} />
          {errors.dueDate && <p className="text-xs text-red-600">{errors.dueDate[0]}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Weight (%)</Label>
        <Input type="number" min={1} max={100} placeholder={selectedTask ? `Suggested: ${selectedTask.weight}` : "1-100"} value={weight} onChange={(e) => setWeight(e.target.value)} />
        {errors.weight && <p className="text-xs text-red-600">{errors.weight[0]}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Notes (optional)</Label>
        <Textarea placeholder="Any additional context…" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <Checkbox checked={allowDuplicate} onCheckedChange={(c) => setAllowDuplicate(c === true)} />
        Allow duplicate assignment of this KPI task to the same employee
      </label>

      <div className="flex justify-end">
        <Button ref={submitButtonRef} onClick={validateAndOpenConfirm} disabled={isPending}>
          Submit Assignment
        </Button>
      </div>

      <ConfirmationModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm KPI assignment"
        description={`This will assign "${selectedTask?.title ?? ""}" to ${employeeIds.length} employee(s) and send a Telegram notification to each. Continue?`}
        confirmLabel="Assign & Notify"
        onConfirm={handleConfirm}
        isLoading={isPending}
      />
    </div>
  );
}
