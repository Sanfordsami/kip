"use client";

import { useState, useTransition } from "react";
import { AssignmentCard } from "@/components/assignment-card";
import { Button } from "@/components/ui/button";
import { updateAssignmentStatus } from "@/actions/assignment-actions";
import { getEmployeeAssignments } from "@/actions/query-actions";

type EmployeeRow = Awaited<ReturnType<typeof getEmployeeAssignments>>[number];

const NEXT_STATUS: Record<string, "in_progress" | "completed" | null> = {
  pending: "in_progress",
  in_progress: "completed",
  completed: null,
  rejected: null,
};

const NEXT_LABEL: Record<string, string> = {
  pending: "Start Task",
  in_progress: "Mark Complete",
};

export function EmployeeDashboardClient({ initialRows }: { initialRows: EmployeeRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function advance(assignmentId: string, status: "in_progress" | "completed" | "rejected") {
    startTransition(async () => {
      const result = await updateAssignmentStatus({ assignmentId, status });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setError(null);
      setRows((prev) => prev.map((r) => (r.id === assignmentId ? { ...r, status } : r)));
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-md border p-3 text-sm" style={{ borderColor: "var(--color-signal-bad)", color: "var(--color-signal-bad)" }}>
          {error}
        </p>
      )}

      {rows.length === 0 && (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm" style={{ borderColor: "var(--color-line)", color: "var(--color-muted)" }}>
          You have no KPI tasks assigned right now.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {rows.map((row) => {
          const next = NEXT_STATUS[row.status];
          return (
            <AssignmentCard
              key={row.id}
              data={{
                id: row.id,
                taskTitle: row.task.title,
                assignedByName: row.manager.fullName,
                dueDate: row.dueDate,
                priority: row.priority,
                status: row.status,
                weight: row.weight,
                notes: row.notes,
              }}
              actions={
                next ? (
                  <>
                    <Button size="sm" variant="outline" disabled={isPending} onClick={() => advance(row.id, "rejected")}>
                      Reject
                    </Button>
                    <Button size="sm" disabled={isPending} onClick={() => advance(row.id, next)}>
                      {NEXT_LABEL[row.status]}
                    </Button>
                  </>
                ) : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}
