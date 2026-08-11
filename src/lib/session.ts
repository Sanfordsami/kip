// import { createSupabaseServerClient } from "./supabase-server";
// import { supabase } from "./supabase";

// export interface SessionPayload {
//   employeeId: string;
//   role: "manager" | "employee";
// }

// export async function getSession(): Promise<SessionPayload | null> {
//   const supabaseServer = await createSupabaseServerClient();
//   const { data: { user } } = await supabaseServer.auth.getUser();

//   if (!user || !user.email) return null;

//   const { data: employee } = await supabase
//     .from("employees")
//     .select("id, role")
//     .eq("email", user.email)
//     .maybeSingle();

//   if (!employee) return null;

//   return { employeeId: employee.id, role: employee.role };
// }

// export async function destroySession() {
//   const supabaseServer = await createSupabaseServerClient();
//   await supabaseServer.auth.signOut();
// }




import { createSupabaseServerClient } from "./supabase-server";
import { supabase } from "./supabase";

export interface SessionPayload {
  employeeId: string;
  role: "manager" | "employee";
}

export async function getSession(): Promise<SessionPayload | null> {
  const supabaseServer = await createSupabaseServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();

  if (!user || !user.email) return null;

  const { data: employee } = await supabase
    .from("employees")
    .select("id, role")
    .eq("email", user.email)
    .maybeSingle();

  if (!employee) return null;

  return { employeeId: employee.id, role: employee.role };
}

export async function destroySession() {
  const supabaseServer = await createSupabaseServerClient();
  await supabaseServer.auth.signOut();
}

// ✅ Add these functions
export async function requireManager(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session || session.role !== "manager") return null;
  return session;
}

export async function requireEmployee(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session || session.role !== "employee") return null;
  return session;
}
