import { cn } from "@/lib/utils";

type Status = "pending" | "in_progress" | "completed" | "rejected";

const STATUS_CLASS: Record<Status, string> = {
  pending: "badge",
  in_progress: "badge badge-warn",
  completed: "badge badge-good",
  rejected: "badge badge-bad",
};

const STATUS_LABELS: Record<Status, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  rejected: "Rejected",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn(STATUS_CLASS[status])} style={status === "pending" ? { color: "var(--color-muted)", background: "rgba(138,147,179,0.12)" } : undefined}>
      {STATUS_LABELS[status]}
    </span>
  );
}
