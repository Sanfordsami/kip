"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, PlusCircle, Users, UserPlus, ClipboardList, FilePlus, Flag } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

const NAV_ITEMS = [
  { label: "Assignment History", href: "/assignments", icon: FileText },
  { label: "New Assignment", href: "/assignments/new", icon: PlusCircle },
  { label: "Employees", href: "/admin/employees", icon: Users },
  { label: "Add Employee", href: "/employees/new", icon: UserPlus },
  { label: "KPI Tasks", href: "/admin/tasks", icon: ClipboardList },
  { label: "Add KPI Task", href: "/tasks/new", icon: FilePlus },
  { label: "Campaigns", href: "/admin/campaigns", icon: Flag },
];

export function AdminSidebar({ managerName }: { managerName: string }) {
  const pathname = usePathname();

  return (
    <aside
      className="flex w-64 shrink-0 flex-col px-4 py-6"
      style={{ borderRight: "1px solid var(--color-line)", background: "var(--color-surface)" }}
    >
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="brand-mark">AR</div>
        <div className="flex flex-col">
          <span className="brand-name">Addis <span className="brand-name-accent">Reality</span></span>
          <span className="font-mono-data text-[10px]" style={{ color: "var(--color-muted)" }}>
            KPI MANAGEMENT SYSTEM
          </span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
              style={{
                background: isActive ? "var(--color-brand-600)" : "transparent",
                color: isActive ? "white" : "var(--color-text)",
              }}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 flex flex-col gap-3 pt-4" style={{ borderTop: "1px solid var(--color-line)" }}>
        <div className="flex items-center gap-3 px-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ background: "var(--color-brand-500)" }}
          >
            {managerName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{managerName}</span>
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>Manager</span>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
