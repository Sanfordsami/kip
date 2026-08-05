"use client";

import { useState, useTransition } from "react";
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
      setSuccessMessage(`${fullName} was created successfully. They can log in with the password you set.`);
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
      {formError && (
        <div className="flex items-start gap-2 rounded-md p-3 text-sm" style={{ background: "rgba(248,113,113,0.1)", color: "var(--color-signal-bad)" }}>
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{formError}</span>
        </div>
      )}
      {successMessage && (
        <div className="flex items-start gap-2 rounded-md p-3 text-sm" style={{ background: "rgba(52,211,153,0.1)", color: "var(--color-signal-good)" }}>
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><span>{successMessage}</span>
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

      <Button onClick={handleSubmit} disabled={isPending} className="mt-2">
        {isPending ? "Creating…" : "Create Employee"}
      </Button>
    </div>
  );
}
