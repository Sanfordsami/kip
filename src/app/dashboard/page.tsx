

import { eq, ne } from "drizzle-orm";
import { getEmployeeAssignments } from "@/actions/query-actions";
import { EmployeeDashboardClient } from "@/components/employee-dashboard-client";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { db, schema } from "@/db";

export default async function EmployeeDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ employeeId?: string }>;
}) {
  const { employeeId } = await searchParams;

  const employee = employeeId
    ? await db.query.employees.findFirst({ where: eq(schema.employees.id, employeeId) })
    : await db.query.employees.findFirst({ where: ne(schema.employees.position, "Manager") });

  if (!employee) {
    return <p className="p-6" style={{ color: "var(--color-signal-bad)" }}>No employee found.</p>;
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
            Viewing as <strong style={{ color: "var(--color-text)" }}>{employee.fullName}</strong> — tasks sorted by nearest due date.
          </p>
        </div>
        <EmployeeDashboardClient initialRows={rows} />
        <AppFooter />
      </div>
    </main>
  );
}
