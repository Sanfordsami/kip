import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getEmployeeAssignments } from "@/actions/query-actions";
import { EmployeeDashboardClient } from "@/components/employee-dashboard-client";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { supabase } from "@/lib/supabase";

export default async function EmployeeDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: employee } = await supabase
    .from("employees")
    .select("id, full_name")
    .eq("id", session.employeeId)
    .maybeSingle();

  if (!employee) {
    redirect("/login");
  }

  const rows = await getEmployeeAssignments(employee.id);

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <AppHeader />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight" style={{ color: "var(--color-text)" }}>
            My KPI Tasks
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
            Viewing as <strong style={{ color: "var(--color-text)" }}>{employee.full_name}</strong> — tasks sorted by nearest due date.
          </p>
        </div>
        <EmployeeDashboardClient initialRows={rows} />
        <AppFooter />
      </div>
    </main>
  );
}
