"use client";

import { useState, useTransition, useEffect } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { approveUser } from "@/actions/employee-actions";

interface Department {
  id: string;
  name: string;
}

interface PendingUser {
  id: string;
  full_name: string;
  email: string;
}

const ROLES = ["sales", "support", "engineering", "marketing", "manager"];

export function ApproveUserForm({ user, departments }: { user: PendingUser; departments: Department[] }) {
  const [departmentId, setDepartmentId] = useState<string>();
  const [position, setPosition] = useState("");
  const [role, setRole] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Auto-dismiss popup after 3 seconds
  useEffect(() => {
    if (popupMessage) {
      const timer = setTimeout(() => {
        setPopupMessage(null);
        setSuccess(false); // Reset so form shows again
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [popupMessage]);

  function handleApprove() {
    setError(null);
    if (!departmentId || !position.trim() || !role) {
      setError("Please fill in department, position, and role");
      return;
    }

    startTransition(async () => {
      const result = await approveUser({
        userId: user.id,
        departmentId,
        position,
        role: role as "manager" | "sales" | "support" | "engineering" | "marketing",
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      setPopupMessage(`${user.full_name} approved and added as an employee.`);
    });
  }

  // If success, show only the popup (no inline message)
  if (success) {
    return (
      <>
        {/* Popup Notification - Bottom Right */}
        {popupMessage && (
          <div
            className="fixed z-50 flex items-center gap-2 rounded-md px-4 py-3 text-sm shadow-lg"
            style={{
              bottom: "20px",
              right: "20px",
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
            <CheckCircle2 className="h-5 w-5 shrink-0 flex-shrink-0" style={{ color: "var(--color-signal-good)" }} />
            <span style={{ whiteSpace: "normal", wordWrap: "break-word", flex: 1 }}>
              {popupMessage}
            </span>
          </div>
        )}
      </>
    );
  }

  // Main form render
  return (
    <>
      {/* Error Popup - Bottom Right */}
      {error && (
        <div
          className="fixed z-50 flex items-center gap-2 rounded-md px-4 py-3 text-sm shadow-lg"
          style={{
            bottom: "20px",
            right: "20px",
            background: "var(--color-surface, #f4f4f5)",
            color: "var(--color-text, #3f3f46)",
            border: "1px solid var(--color-line, #e4e4e7)",
            animation: "slideInFromRight 0.25s ease-out forwards",
            maxWidth: "350px",
            minWidth: "280px",
            padding: "12px 16px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          <AlertCircle className="h-5 w-5 shrink-0" style={{ color: "var(--color-signal-bad)" }} />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-lg border p-4" style={{ borderColor: "var(--color-line)" }}>
        <div>
          <p className="font-medium" style={{ color: "var(--color-text)" }}>{user.full_name}</p>
          <p className="text-xs" style={{ color: "var(--color-muted)" }}>{user.email}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Department</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Position</Label>
            <input
              className="flex h-10 w-full rounded-md border bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text)]"
              style={{ borderColor: "var(--color-line)" }}
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>
        </div>

        <Button size="sm" onClick={handleApprove} disabled={isPending} className="self-start">
          {isPending ? "Approving…" : "Approve as Employee"}
        </Button>
      </div>
    </>
  );
}