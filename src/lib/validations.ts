import { z } from "zod";

export const employeeSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(160, "Full name is too long"),
  email: z.string().trim().email("Enter a valid email address"),
  departmentId: z.string().uuid("Select a valid department"),
  position: z.string().trim().min(2, "Position is required").max(120),
  telegramChatId: z
    .string()
    .trim()
    .regex(/^-?\d+$/, "Telegram Chat ID must be numeric")
    .optional()
    .or(z.literal("")),
  status: z.enum(["active", "inactive"]).default("active"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;

export const kpiTaskSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  weight: z
    .number({ error: "Weight must be a number" })
    .int("Weight must be a whole number")
    .min(1, "Weight must be at least 1")
    .max(100, "Weight cannot exceed 100"),
});

export type KpiTaskInput = z.infer<typeof kpiTaskSchema>;


export const assignmentSchema = z.object({
  taskId: z.string().uuid("Select a KPI task"),
  employeeIds: z.array(z.string().uuid()).min(1, "Select at least one employee"),
 
  dueDate: z
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), "Enter a valid due date")
    .refine((val) => new Date(val).getTime() > Date.now() - 86400000, "Due date cannot be in the past"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  weight: z.number().int().min(1, "Weight must be at least 1").max(100, "Weight cannot exceed 100"),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  allowDuplicate: z.boolean().default(false),
});

export type AssignmentInput = z.infer<typeof assignmentSchema>;
export const assignmentStatusSchema = z.object({
  assignmentId: z.string().uuid(),
  status: z.enum(["pending", "in_progress", "completed", "rejected"]),
});

// export const loginSchema = z.object({
//   email: z.string().trim().email("Enter a valid email address"),
//   password: z.string().min(1, "Password is required"),
// });
// In your validations file
export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Add this export
export type LoginInput = z.infer<typeof loginSchema>;