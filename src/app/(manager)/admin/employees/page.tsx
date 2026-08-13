import { getAllEmployees } from "@/actions/query-actions";
import { EmployeeTable } from "@/components/employee-table";

export default async function AdminEmployeesPage() {
  const employees = await getAllEmployees();

  return (
    <main className="px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight" style={{ color: "var(--color-text)" }}>
            Employees
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
            Manage team members and notification settings
          </p>
        </div>
      </div>
      <div className="kpi-card overflow-hidden p-0">
        <EmployeeTable employees={employees} />
      </div>
    </main>
  );
}
