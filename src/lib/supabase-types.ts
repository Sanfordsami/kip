// Lightweight types describing the raw (snake_case) shape of rows
// as they come back directly from the Supabase client, before we
// map them into our app's camelCase conventions.

export interface RawEmployee {
  id: string;
  full_name: string;
  email: string;
  department_id: string | null;
  position: string;
  telegram_chat_id: string | null;
  status: "active" | "inactive";
  role: "manager" | "employee";
  created_at: string;
  updated_at: string;
}

export interface RawDepartment {
  id: string;
  name: string;
}

export interface RawTaskAssignment {
  id: string;
  due_date: string;
  priority: "low" | "medium" | "high" | "urgent";
  weight: number;
  status: "pending" | "in_progress" | "completed" | "rejected";
  notes: string | null;
  task: { id: string; title: string };
  employee: { id: string; full_name: string };
  manager: { id: string; full_name: string };
  telegram_logs: RawTelegramLog[];
}

export interface RawTelegramLog {
  id: string;
  chat_id: string | null;
  status: "sent" | "failed";
  error: string | null;
  sent_at: string;
}

export interface RawEmployeeAssignment {
  id: string;
  due_date: string;
  priority: "low" | "medium" | "high" | "urgent";
  weight: number;
  status: "pending" | "in_progress" | "completed" | "rejected";
  notes: string | null;
  task: { id: string; title: string };
  manager: { id: string; full_name: string };
}
