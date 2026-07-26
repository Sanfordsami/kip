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
});

export type EmployeeInput = z.infer<typeof employeeSchema>;

export const kpiTaskSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  weight: z
    .number({ invalid_type_error: "Weight must be a number" })
    .int("Weight must be a whole number")
    .min(1, "Weight must be at least 1")
    .max(100, "Weight cannot exceed 100"),
});

export type KpiTaskInput = z.infer<typeof kpiTaskSchema>;