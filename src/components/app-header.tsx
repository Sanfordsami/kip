import { LogoutButton } from "@/components/logout-button";

export function AppHeader() {
  return (
    <header className="mb-6 flex items-center justify-between gap-3 border-b pb-6" style={{ borderColor: "var(--color-line)" }}>
      <div className="flex items-center gap-3">
        <div className="brand-mark">AR</div>
        <div className="flex flex-col">
          <span className="brand-name">
            Addis <span className="brand-name-accent">Reality</span>
          </span>
          <span className="font-mono-data text-xs" style={{ color: "var(--color-muted)" }}>
            KPI MANAGEMENT SYSTEM
          </span>
        </div>
      </div>
      <LogoutButton />
    </header>
  );
}
