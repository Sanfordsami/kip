

import { relations } from "drizzle-orm";

import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";

// ---------- Enums (fixed sets of allowed values) ----------

export const employeeStatusEnum = pgEnum("employee_status", ["active", "inactive"]);
export const employeeRoleEnum = pgEnum("employee_role", ["manager", "employee"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high", "urgent"]);
export const assignmentStatusEnum = pgEnum("assignment_status", [
  "pending",
  "in_progress",
  "completed",
  "rejected",
]);
export const telegramLogStatusEnum = pgEnum("telegram_log_status", ["sent", "failed"]);

// ---------- Departments ----------

export const departments = pgTable("departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------- Employees ----------

export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  departmentId: uuid("department_id").references(() => departments.id),
  position: varchar("position", { length: 120 }).notNull(),
  telegramChatId: varchar("telegram_chat_id", { length: 64 }),
  status: employeeStatusEnum("status").notNull().default("active"),
  role: employeeRoleEnum("role").notNull().default("employee"),
  passwordHash: varchar("password_hash", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------- KPI Tasks (the catalog) ----------

export const kpiTasks = pgTable("kpi_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  weight: integer("weight").notNull(),
  createdBy: uuid("created_by").references(() => employees.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------- Task Assignments (a KPI task assigned to one employee) ----------

export const taskAssignments = pgTable("task_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id").notNull().references(() => kpiTasks.id, { onDelete: "cascade" }),
  employeeId: uuid("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  assignedBy: uuid("assigned_by").notNull().references(() => employees.id),
  assignedDate: timestamp("assigned_date", { withTimezone: true }).defaultNow().notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
  priority: priorityEnum("priority").notNull().default("medium"),
  weight: integer("weight").notNull(),
  status: assignmentStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  allowDuplicate: boolean("allow_duplicate").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------- Telegram Logs (every notification attempt, success or failure) ----------

export const telegramLogs = pgTable("telegram_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  assignmentId: uuid("assignment_id").notNull().references(() => taskAssignments.id, { onDelete: "cascade" }),
  chatId: varchar("chat_id", { length: 64 }),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
  status: telegramLogStatusEnum("status").notNull(),
  error: text("error"),
});

export const departmentsRelations = relations(departments, ({ many }) => ({
  employees: many(employees),
}));

export const employeesRelations = relations(employees, ({ one }) => ({
  department: one(departments, {
    fields: [employees.departmentId],
    references: [departments.id],
  }),
}));
export const kpiTasksRelations = relations(kpiTasks, ({ many }) => ({
  assignments: many(taskAssignments),
}));

export const taskAssignmentsRelations = relations(taskAssignments, ({ one, many }) => ({
  task: one(kpiTasks, {
    fields: [taskAssignments.taskId],
    references: [kpiTasks.id],
  }),
  employee: one(employees, {
    fields: [taskAssignments.employeeId],
    references: [employees.id],
    relationName: "employeeAssignments",
  }),
  manager: one(employees, {
    fields: [taskAssignments.assignedBy],
    references: [employees.id],
    relationName: "managerAssignments",
  }),
  telegramLogs: many(telegramLogs),
}));

export const telegramLogsRelations = relations(telegramLogs, ({ one }) => ({
  assignment: one(taskAssignments, {
    fields: [telegramLogs.assignmentId],
    references: [taskAssignments.id],
  }),
}));
