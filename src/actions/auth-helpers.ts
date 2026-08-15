

// "use server";

// import { requireManager, requireEmployee } from "@/lib/session";
// import type { SessionPayload } from "@/lib/session";

// export async function authManager(): Promise<SessionPayload> {
//   const session = await requireManager();
//   if (!session) {
//     throw new Error("Unauthorized: Manager access required");
//   }
//   return session;
// }

// export async function authEmployee(): Promise<SessionPayload> {
//   const session = await requireEmployee();
//   if (!session) {
//     throw new Error("Unauthorized: Employee access required");
//   }
//   return session;
// }