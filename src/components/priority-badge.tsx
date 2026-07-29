type Priority = "low" | "medium" | "high" | "urgent";

const PRIORITY_STYLES: Record<Priority, { bg: string; color: string }> = {
  low: { bg: "rgba(138, 147, 179, 0.15)", color: "var(--color-muted)" },
  medium: { bg: "rgba(91, 99, 224, 0.18)", color: "var(--color-brand-400)" },
  high: { bg: "rgba(251, 191, 36, 0.15)", color: "var(--color-signal-warn)" },
  urgent: { bg: "rgba(248, 113, 113, 0.15)", color: "var(--color-signal-bad)" },
};

const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const style = PRIORITY_STYLES[priority];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
