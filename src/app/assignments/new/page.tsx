import Link from "next/link";
import { redirect } from "next/navigation";
import { AssignmentForm } from "@/components/assignment-form";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { Button } from "@/components/ui/button";
import { getActiveEmployees } from "@/actions/query-actions";
import { getKpiTasks } from "@/actions/kpi-task-actions";
import { getSession } from "@/lib/session";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export default async function NewAssignmentPage() {
  const session = await getSession();

  if (!session || session.role !== "manager") {
    redirect("/login");
  }

  const manager = await db.query.employees.findFirst({
    where: eq(schema.employees.id, session.employeeId),
  });

  if (!manager) {
    redirect("/login");
  }

  const [employees, tasks] = await Promise.all([getActiveEmployees(), getKpiTasks()]);

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <AppHeader />
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-3xl font-semibold tracking-tight" style={{ color: "var(--color-text)" }}>
              Assign a KPI Task
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
              Select a KPI task and one or more employees below. Each assigned employee is notified
              instantly through the Telegram Bot, and every notification — sent or failed — is
              logged for review.
            </p>
          </div>
          <Link href="/assignments">
            <Button variant="outline">View History</Button>
          </Link>
        </div>
        <div className="kpi-card">
          <AssignmentForm employees={employees} tasks={tasks} currentManagerId={manager.id} />
        </div>
        <AppFooter />
      </div>
    </main>
  );
}
