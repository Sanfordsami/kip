"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface SelectableEmployee {
  id: string;
  fullName: string;
  position: string;
  department?: { name: string } | null;
  status: "active" | "inactive";
}

interface EmployeeSelectorProps {
  employees: SelectableEmployee[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function EmployeeSelector({ employees, selectedIds, onChange }: EmployeeSelectorProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return employees;
    return employees.filter((e) => e.fullName.toLowerCase().includes(term));
  }, [employees, query]);

  function toggle(id: string, isActive: boolean) {
    if (!isActive) return;
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  }

  return (
    <div className="rounded-md border" style={{ borderColor: "var(--color-line)", background: "var(--color-surface)" }}>
      <div className="relative border-b p-2" style={{ borderColor: "var(--color-line)" }}>
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--color-muted)" }} />
        <Input placeholder="Search employees" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
      </div>
      <div className="max-h-64 overflow-y-auto p-1">
        {filtered.map((employee) => {
          const isActive = employee.status === "active";
          const checked = selectedIds.includes(employee.id);
          return (
            <label
              key={employee.id}
              className={cn("flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm", !isActive && "cursor-not-allowed opacity-50")}
              style={{ background: checked ? "var(--color-surface-2)" : "transparent", color: "var(--color-text)" }}
            >
              <Checkbox checked={checked} disabled={!isActive} onCheckedChange={() => toggle(employee.id, isActive)} />
              <div className="flex flex-col">
                <span className="font-medium">{employee.fullName}</span>
                <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                  {employee.position}{!isActive ? " · Inactive" : ""}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
