"use client";

import { format } from "date-fns";
import { PriorityBadge } from "@/components/priority-badge";
import { StatusBadge } from "@/components/status-badge";

export interface AssignmentCardData {
  id: string;
  taskTitle: string;
  employeeName?: string;
  assignedByName?: string;
  dueDate: Date;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "rejected";
  weight: number;
  notes?: string | null;
}

export function AssignmentCard({ data, actions }: { data: AssignmentCardData; actions?: React.ReactNode }) {
  const isOverdue = data.status !== "completed" && data.dueDate.getTime() < Date.now();

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{data.taskTitle}</h3>
        <StatusBadge status={data.status} />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
        {data.employeeName && <span>{data.employeeName}</span>}
        <PriorityBadge priority={data.priority} />
        <span className={isOverdue ? "font-medium text-red-600" : ""}>
          Due {format(data.dueDate, "MMM d, yyyy")}{isOverdue ? " (overdue)" : ""}
        </span>
        <span>Weight {data.weight}%</span>
      </div>

      {data.assignedByName && <p className="text-xs text-slate-500">Assigned by {data.assignedByName}</p>}
      {data.notes && <p className="text-sm text-slate-600">{data.notes}</p>}
      {actions && <div className="flex justify-end gap-2 pt-1">{actions}</div>}
    </div>
  );
}
