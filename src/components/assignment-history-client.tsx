"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { SearchFilterPanel, type FilterState } from "@/components/search-filter-panel";
import { AssignmentCard } from "@/components/assignment-card";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { Button } from "@/components/ui/button";
import { getAssignmentHistory } from "@/actions/query-actions";
import { deleteAssignment } from "@/actions/assignment-actions";

type HistoryRow = Awaited<ReturnType<typeof getAssignmentHistory>>[number];

export function AssignmentHistoryClient({ initialRows }: { initialRows: HistoryRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [filters, setFilters] = useState<FilterState>({
    search: "", status: "all", priority: "all", sortBy: "assignedDate", sortOrder: "desc",
  });
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; taskTitle: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    startTransition(async () => {
      const result = await getAssignmentHistory(filters);
      setRows(result);
    });
  }, [filters]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteAssignment(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);
    if (result.success) {
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SearchFilterPanel value={filters} onChange={setFilters} />

      {isPending && <p className="text-sm" style={{ color: "var(--color-muted)" }}>Refreshing…</p>}

      {rows.length === 0 && !isPending && (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm" style={{ borderColor: "var(--color-line)", color: "var(--color-muted)" }}>
          No assignments match your filters.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {rows.map((row) => {
          const latestLog = [...row.telegramLogs].sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())[0];
          const lastFailed = latestLog?.status === "failed";

          return (
            <AssignmentCard
              key={row.id}
              data={{
                id: row.id,
                taskTitle: row.task.title,
                employeeName: row.employee.fullName,
                assignedByName: row.manager.fullName,
                dueDate: row.dueDate,
                priority: row.priority,
                status: row.status,
                weight: row.weight,
                notes: row.notes,
              }}
              actions={
                <div className="flex items-center gap-2">
                  {lastFailed && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-signal-bad)" }}>
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Telegram delivery failed: {latestLog?.error}
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteTarget({ id: row.id, taskTitle: row.task.title })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              }
            />
          );
        })}
      </div>

      <ConfirmationModal
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this assignment?"
        description={`This will permanently remove "${deleteTarget?.taskTitle}" and its notification history. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
