import { getAssignmentHistory } from "@/actions/query-actions";
import { AssignmentHistoryClient } from "@/components/assignment-history-client";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";

export default async function AssignmentHistoryPage() {
  const rows = await getAssignmentHistory();

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <AppHeader />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight" style={{ color: "var(--color-text)" }}>
            Assignment History
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
            Search, filter, and sort every KPI task assignment across the team.
          </p>
        </div>
        <AssignmentHistoryClient initialRows={rows} />
        <AppFooter />
      </div>
    </main>
  );
}
