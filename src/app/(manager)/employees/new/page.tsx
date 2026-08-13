import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDepartments } from "@/actions/query-actions";
import { AppFooter } from "@/components/app-footer";
import { Button } from "@/components/ui/button";
import { CreateEmployeeForm } from "@/components/create-employee-form";

export default async function NewEmployeePage() {
  const session = await getSession();
  if (!session || session.role !== "manager") {
    redirect("/login");
  }

  const departments = await getDepartments();

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight" style={{ color: "var(--color-text)" }}>
              Add New Employee
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
              Create a new employee account so they can log in and receive KPI assignments.
            </p>
          </div>
          <Link href="/assignments"><Button variant="outline">Back</Button></Link>
        </div>
        <div className="kpi-card">
          <CreateEmployeeForm departments={departments} />
        </div>
        <AppFooter />
      </div>
    </main>
  );
}
