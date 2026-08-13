import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "manager") {
    redirect("/login");
  }

  const { data: manager } = await supabase
    .from("employees")
    .select("full_name")
    .eq("id", session.employeeId)
    .maybeSingle();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar managerName={manager?.full_name ?? "Manager"} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
