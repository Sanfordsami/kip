import { getPendingUsers, getDepartments } from "@/actions/query-actions";
import { ApproveUserForm } from "@/components/approve-user-form";

export default async function PendingUsersPage() {
  const [users, departments] = await Promise.all([getPendingUsers(), getDepartments()]);

  return (
    <main className="px-8 py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight" style={{ color: "var(--color-text)" }}>
          Pending Sign Ups
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          People who signed up and are waiting to be approved as employees.
        </p>
      </div>

      {users.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm" style={{ borderColor: "var(--color-line)", color: "var(--color-muted)" }}>
          No pending sign ups.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((user: any) => (
            <ApproveUserForm key={user.id} user={user} departments={departments} />
          ))}
        </div>
      )}
    </main>
  );
}
