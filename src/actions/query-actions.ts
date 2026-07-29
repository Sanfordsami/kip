"use server";

import { asc, desc, eq, and, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";

export async function getActiveEmployees() {
  return db.query.employees.findMany({
    where: eq(schema.employees.status, "active"),
    with: { department: true },
    orderBy: asc(schema.employees.fullName),
  });
}

export interface AssignmentFilters {
  search?: string;
  status?: "all" | "pending" | "in_progress" | "completed" | "rejected";
  priority?: "all" | "low" | "medium" | "high" | "urgent";
  sortBy?: "assignedDate" | "dueDate" | "priority" | "status";
  sortOrder?: "asc" | "desc";
}

export async function getAssignmentHistory(filters: AssignmentFilters = {}) {
  const {
    search = "",
    status = "all",
    priority = "all",
    sortBy = "assignedDate",
    sortOrder = "desc",
  } = filters;

  const conditions: SQL[] = [];
  if (status !== "all") conditions.push(eq(schema.taskAssignments.status, status));
  if (priority !== "all") conditions.push(eq(schema.taskAssignments.priority, priority));

  const sortColumn = {
    assignedDate: schema.taskAssignments.assignedDate,
    dueDate: schema.taskAssignments.dueDate,
    priority: schema.taskAssignments.priority,
    status: schema.taskAssignments.status,
  }[sortBy];

  const orderFn = sortOrder === "asc" ? asc : desc;

  const rows = await db.query.taskAssignments.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: { task: true, employee: true, manager: true, telegramLogs: true },
    orderBy: orderFn(sortColumn),
  });

  if (!search.trim()) return rows;

  const term = search.trim().toLowerCase();
  return rows.filter(
    (row) =>
      row.employee.fullName.toLowerCase().includes(term) ||
      row.task.title.toLowerCase().includes(term)
  );
}
