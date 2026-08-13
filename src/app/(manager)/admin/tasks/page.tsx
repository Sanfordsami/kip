import { getKpiTasks } from "@/actions/kpi-task-actions";
import { format } from "date-fns";

export default async function AdminTasksPage() {
  const tasks = await getKpiTasks();

  return (
    <main className="px-8 py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight" style={{ color: "var(--color-text)" }}>
          KPI Tasks
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          Every task in the catalog, selectable when assigning work.
        </p>
      </div>
      <div className="kpi-card overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-line)" }}>
              {["Title", "Weight", "Created"].map((h) => (
                <th key={h} className="px-6 py-3 font-medium" style={{ color: "var(--color-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} style={{ borderBottom: "1px solid var(--color-line)" }}>
                <td className="px-6 py-4 font-medium" style={{ color: "var(--color-text)" }}>{task.title}</td>
                <td className="px-6 py-4" style={{ color: "var(--color-muted)" }}>{task.weight}%</td>
                <td className="px-6 py-4" style={{ color: "var(--color-muted)" }}>{format(task.createdAt, "MMM d, yyyy")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
