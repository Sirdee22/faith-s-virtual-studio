import { useSession } from "@tanstack/react-start/server";

export type AdminSession = { admin?: boolean; userId?: string; email?: string };

export function sessionConfig() {
  const password = process.env["ADMIN_SESSION_SECRET"];
  if (!password) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return {
    password,
    name: "faith-admin",
    maxAge: 60 * 60 * 24 * 7,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

export async function isAdmin(): Promise<boolean> {
  const session = await useSession<AdminSession>(sessionConfig());
  return session.data.admin === true;
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    throw new Response("Unauthorized", { status: 401 });
  }
}
