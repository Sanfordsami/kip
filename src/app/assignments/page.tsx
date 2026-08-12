import Link from "next/link";
import { getAssignmentHistory } from "@/actions/query-actions";
import { AssignmentHistoryClient } from "@/components/assignment-history-client";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";


export default async function AssignmentHistoryPage() {
  const session = await getSession();
    if (!session || session.role !== "manager") {
      redirect("/login");
    }

  const rows = await getAssignmentHistory();


  return (
    <main className="min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <AppHeader />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight" style={{ color: "var(--color-text)" }}>
              Assignment History
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
              Search, filter, and sort every KPI task assignment across the team.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/employees/new">
              <Button variant="outline">+ Add Employee</Button>
            </Link>
            <Link href="/tasks/new">
              <Button variant="outline">+ Add KPI Task</Button>
            </Link>
            <Link href="/assignments/new">
              <Button>+ New Assignment</Button>
            </Link>
          </div>
        </div>
        <AssignmentHistoryClient initialRows={rows} />
        <AppFooter />
      </div>
    </main>
  );
}
