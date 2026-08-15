"use client";

import { useState, useTransition } from "react";
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
  const [isPending, startTransition] = useTransition();

  const selectedTask = tasks.find((t) => t.id === taskId);

  function validateAndOpenConfirm() {
    setFormError(null);
    setSuccessMessage(null);

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
      setSuccessMessage(`Assigned to ${employeeIds.length} employee(s). Telegram notifications sent.`);
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
      {successMessage && (
        <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
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
        <Button onClick={validateAndOpenConfirm} disabled={isPending}>
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
