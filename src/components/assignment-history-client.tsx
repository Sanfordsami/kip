"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertTriangle } from "lucide-react";
import { SearchFilterPanel, type FilterState } from "@/components/search-filter-panel";
import { AssignmentCard } from "@/components/assignment-card";
import { getAssignmentHistory } from "@/actions/query-actions";

type HistoryRow = Awaited<ReturnType<typeof getAssignmentHistory>>[number];

export function AssignmentHistoryClient({ initialRows }: { initialRows: HistoryRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    priority: "all",
    sortBy: "assignedDate",
    sortOrder: "desc",
  });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await getAssignmentHistory(filters);
      setRows(result);
    });
  }, [filters]);

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
                lastFailed ? (
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-signal-bad)" }}>
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Telegram delivery failed: {latestLog?.error}
                  </span>
                ) : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}
