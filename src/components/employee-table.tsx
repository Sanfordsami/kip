"use client";

import { useState, useTransition } from "react";
import { setEmployeeStatus } from "@/actions/employee-actions";

interface EmployeeRow {
  id: string;
  fullName: string;
  email: string;
  status: "active" | "inactive";
  role: "manager" | "employee";
  telegramChatId: string | null;
  department: { name: string } | null;
}

export function EmployeeTable({ employees }: { employees: EmployeeRow[] }) {
  const [rows, setRows] = useState(employees);
  const [isPending, startTransition] = useTransition();

  function toggleStatus(id: string, current: "active" | "inactive") {
    const next = current === "active" ? "inactive" : "active";
    startTransition(async () => {
      const result = await setEmployeeStatus(id, next);
      if (result.success) {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
      }
    });
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr style={{ borderBottom: "1px solid var(--color-line)" }}>
          {["Name", "Email", "Department", "Status", "Role", "Telegram ID"].map((h) => (
            <th key={h} className="px-6 py-3 font-medium" style={{ color: "var(--color-muted)" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((employee) => (
          <tr key={employee.id} style={{ borderBottom: "1px solid var(--color-line)" }}>
            <td className="px-6 py-4 font-medium" style={{ color: "var(--color-text)" }}>{employee.fullName}</td>
            <td className="px-6 py-4" style={{ color: "var(--color-muted)" }}>{employee.email}</td>
            <td className="px-6 py-4" style={{ color: "var(--color-muted)" }}>{employee.department?.name ?? "—"}</td>
            <td className="px-6 py-4">
              <button
                onClick={() => toggleStatus(employee.id, employee.status)}
                disabled={isPending}
                className="badge"
                style={
                  employee.status === "active"
                    ? { color: "var(--color-signal-good)", background: "rgba(52,211,153,0.12)" }
                    : { color: "var(--color-muted)", background: "rgba(138,147,179,0.12)" }
                }
              >
                {employee.status === "active" ? "Active" : "Inactive"}
              </button>
            </td>
            <td className="px-6 py-4 capitalize" style={{ color: "var(--color-muted)" }}>{employee.role}</td>
            <td className="px-6 py-4" style={{ color: "var(--color-muted)" }}>{employee.telegramChatId ?? "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
