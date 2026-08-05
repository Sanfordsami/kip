import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { Button } from "@/components/ui/button";
import { CreateKpiTaskForm } from "@/components/create-kpi-task-form";

export default async function NewKpiTaskPage() {
  const session = await getSession();
  if (!session || session.role !== "manager") {
    redirect("/login");
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <AppHeader />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight" style={{ color: "var(--color-text)" }}>
              Create KPI Task
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
              Add a new KPI task to the catalog. It becomes selectable when assigning tasks to employees.
            </p>
          </div>
          <Link href="/assignments"><Button variant="outline">Back</Button></Link>
        </div>
        <div className="kpi-card">
          <CreateKpiTaskForm managerId={session.employeeId} />
        </div>
        <AppFooter />
      </div>
    </main>
  );
}
