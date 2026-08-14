import { supabaseAdmin } from "@/lib/supabase-admin";

export type UpdateStatusResult = { ok: true } | { ok: false; error: string };

const VALID_STATUSES = ["pending", "in_progress", "completed", "rejected"] as const;
type AssignmentStatus = (typeof VALID_STATUSES)[number];

/**
 * The single source of truth for "can this employee change this
 * assignment to this status?" — used by both the in-app dashboard
 * (via a server action) and the Telegram webhook (via a button tap),
 * so the two can never enforce different rules.
 */
export async function updateAssignmentStatusForEmployee(
  assignmentId: string,
  employeeId: string,
  status: string
): Promise<UpdateStatusResult> {
  if (!VALID_STATUSES.includes(status as AssignmentStatus)) {
    return { ok: false, error: "Invalid status value" };
  }

  const { data: assignment } = await supabaseAdmin
    .from("task_assignments")
    .select("employee_id")
    .eq("id", assignmentId)
    .maybeSingle();

  if (!assignment) {
    return { ok: false, error: "Assignment not found" };
  }

  if (assignment.employee_id !== employeeId) {
    return { ok: false, error: "You can only update your own assignments" };
  }

  const { error } = await supabaseAdmin
    .from("task_assignments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", assignmentId);

  if (error) {
    console.error("updateAssignmentStatusForEmployee failed:", error);
    return { ok: false, error: "Database update failed" };
  }

  return { ok: true };
}
