"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createEmployee } from "@/actions/employee-actions";
import { employeeSchema } from "@/lib/validations";

interface Department {
  id: string;
  name: string;
}

export function CreateEmployeeForm({ departments }: { departments: Department[] }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [departmentId, setDepartmentId] = useState<string>();
  const [position, setPosition] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const btnRef = useRef<HTMLButtonElement>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);

  // Position the popup next to the button whenever a new success message appears
  useEffect(() => {
    if (successMessage && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPopupPos({ top: rect.top + rect.height / 2, left: rect.right + 12 });
    }
  }, [successMessage]);

  // Auto-dismiss after a few seconds
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  function handleSubmit() {
    setFormError(null);
    setSuccessMessage(null);

    const parsed = employeeSchema.safeParse({
      fullName, email, departmentId, position, telegramChatId, password, status: "active",
    });

    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>);
      return;
    }
    setErrors({});

    startTransition(async () => {
      const result = await createEmployee(parsed.data);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      setSuccessMessage(`${fullName} was created successfully
        `);
      setFullName("");
      setEmail("");
      setDepartmentId(undefined);
      setPosition("");
      setTelegramChatId("");
      setPassword("");
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <style>{`
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateY(-50%) translateX(16px); }
          to { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
      `}</style>

      {formError && (
        <div className="flex items-start gap-2 rounded-md p-3 text-sm" style={{ background: "rgba(248,113,113,0.1)", color: "var(--color-signal-bad)" }}>
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{formError}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label>Full Name</Label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        {errors.fullName && <p className="text-xs" style={{ color: "var(--color-signal-bad)" }}>{errors.fullName[0]}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Email</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {errors.email && <p className="text-xs" style={{ color: "var(--color-signal-bad)" }}>{errors.email[0]}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Department</Label>
        <Select value={departmentId} onValueChange={setDepartmentId}>
          <SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger>
          <SelectContent>
            {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.departmentId && <p className="text-xs" style={{ color: "var(--color-signal-bad)" }}>{errors.departmentId[0]}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Position</Label>
        <Input value={position} onChange={(e) => setPosition(e.target.value)} />
        {errors.position && <p className="text-xs" style={{ color: "var(--color-signal-bad)" }}>{errors.position[0]}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Telegram Chat ID (optional, can add later)</Label>
        <Input value={telegramChatId} onChange={(e) => setTelegramChatId(e.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Password</Label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {errors.password && <p className="text-xs" style={{ color: "var(--color-signal-bad)" }}>{errors.password[0]}</p>}
      </div>

      <Button ref={btnRef} onClick={handleSubmit} disabled={isPending} className="mt-2 self-start">
        {isPending ? "Creating…" : "Create Employee"}
      </Button>





     {successMessage && popupPos && (
  <div
    key={successMessage}
    className="fixed z-50 flex items-center gap-2 rounded-md px-4 py-3 text-sm shadow-lg"
    style={{
      top: popupPos.top + 10, // Move 10px down
      left: typeof window !== "undefined" 
        ? Math.min(popupPos.left + 15, window.innerWidth - 360) // Move 15px right
        : popupPos.left + 15,
      transform: "translateY(-50%)",
      background: "var(--color-surface, #f4f4f5)",
      color: "var(--color-text, #3f3f46)",
      border: "1px solid var(--color-line, #e4e4e7)",
      animation: "slideInFromRight 0.25s ease-out forwards",
      maxWidth: "350px",
      minWidth: "280px",
      padding: "12px 16px",
      wordBreak: "break-word",
      lineHeight: "1.5",
      boxSizing: "border-box",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    }}
  >
    <CheckCircle2 className="h-5 w-5 shrink-0 flex-shrink-0" />
    <span style={{ whiteSpace: "normal", wordWrap: "break-word", flex: 1 }}>
      {successMessage}
    </span>
  </div>
)}








    </div>
  );
}