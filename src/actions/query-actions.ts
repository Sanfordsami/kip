"use server";

import { supabase } from "@/lib/supabase";
import type { RawEmployee, RawDepartment, RawTaskAssignment, RawEmployeeAssignment } from "@/lib/supabase-types";
import { getSession } from "@/lib/session"; 

export async function getActiveEmployees() {
  const { data, error } = await supabase
    .from("employees")
    .select("*, department:departments(id, name)")
    .eq("status", "active")
    .order("full_name", { ascending: true });

  if (error) {
    console.error("getActiveEmployees failed:", error);
    return [];
  }

  return (data ?? []).map((row: RawEmployee & { department: RawDepartment | null }) => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    position: row.position,
    status: row.status,
    department: row.department,
  }));
}

export interface AssignmentFilters {
  search?: string;
  status?: "all" | "pending" | "in_progress" | "completed" | "rejected";
  priority?: "all" | "low" | "medium" | "high" | "urgent";
  sortBy?: "assignedDate" | "dueDate" | "priority" | "status";
  sortOrder?: "asc" | "desc";
}

const SORT_COLUMN_MAP: Record<string, string> = {
  assignedDate: "assigned_date",
  dueDate: "due_date",
  priority: "priority",
  status: "status",
};

export async function getAssignmentHistory(filters: AssignmentFilters = {}) {

  const session = await getSession();
  if (!session || session.role !== "manager") {
    console.error("Unauthorized: getAssignmentHistory requires manager role");
    return []; // Or throw an error
  }

  const {
    search = "",
    status = "all",
    priority = "all",
    sortBy = "assignedDate",
    sortOrder = "desc",
  } = filters;

  let query = supabase
    .from("task_assignments")
    .select(
      `*,
      task:kpi_tasks(id, title),
      employee:employees!task_assignments_employee_id_employees_id_fk(id, full_name),
      manager:employees!task_assignments_assigned_by_employees_id_fk(id, full_name),
      telegram_logs(id, chat_id, status, error, sent_at)`
    );

  if (status !== "all") query = query.eq("status", status);
  if (priority !== "all") query = query.eq("priority", priority);

  query = query.order(SORT_COLUMN_MAP[sortBy], { ascending: sortOrder === "asc" });

  const { data, error } = await query;

  if (error) {
    console.error("getAssignmentHistory failed:", JSON.stringify(error, null, 2));
    return [];
  }

  const rows = (data ?? []).map((row: RawTaskAssignment) => ({
    id: row.id,
    dueDate: new Date(row.due_date),
    priority: row.priority,
    weight: row.weight,
    status: row.status,
    notes: row.notes,
    task: { title: row.task.title },
    employee: { fullName: row.employee.full_name },
    manager: { fullName: row.manager.full_name },
    telegramLogs: (row.telegram_logs ?? []).map((log) => ({
      id: log.id,
      chatId: log.chat_id,
      status: log.status,
      error: log.error,
      sentAt: new Date(log.sent_at),
    })),
  }));

  if (!search.trim()) return rows;

  const term = search.trim().toLowerCase();
  return rows.filter(
    (row) =>
      row.employee.fullName.toLowerCase().includes(term) ||
      row.task.title.toLowerCase().includes(term)
  );
}

export async function getEmployeeAssignments(employeeId: string) {
  const { data, error } = await supabase
    .from("task_assignments")
    .select(`*, task:kpi_tasks(id, title), manager:employees!task_assignments_assigned_by_employees_id_fk(id, full_name)`)
    .eq("employee_id", employeeId)
    .order("due_date", { ascending: true });

  if (error) {
    console.error("getEmployeeAssignments failed:", error);
    return [];
  }

  return (data ?? []).map((row: RawEmployeeAssignment) => ({
    id: row.id,
    dueDate: new Date(row.due_date),
    priority: row.priority,
    weight: row.weight,
    status: row.status,
    notes: row.notes,
    task: { title: row.task.title },
    manager: { fullName: row.manager.full_name },
  }));
}

export async function getDepartments() {
  const { data, error } = await supabase.from("departments").select("*").order("name", { ascending: true });

  if (error) {
    console.error("getDepartments failed:", error);
    return [];
  }

  return data ?? [];
}

export async function getAllEmployees() {
  const { data, error } = await supabase
    .from("employees")
    .select("id, full_name, email, status, role, telegram_chat_id, department:departments(name)")
    .order("full_name", { ascending: true });

  if (error) {
    console.error("getAllEmployees failed:", error);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    status: row.status,
    role: row.role,
    telegramChatId: row.telegram_chat_id,
    department: row.department,
  }));
}
