import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, hashSessionToken } from "@/lib/sessionToken";

const SESSION_COOKIE = "sturdy_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

type LoginAttempt = { count: number; resetAt: number };
const loginAttempts = new Map<string, LoginAttempt>();

export type AdminUser = {
  id: number;
  email: string;
};

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.SESSION_COOKIE_SECURE === "true",
    path: "/",
    expires,
  };
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  const tokenHash = hashSessionToken(token);
  const now = new Date().toISOString();
  const row = db
    .prepare(
      `SELECT admins.id AS id, admins.email AS email, admin_sessions.expires_at AS expires_at
       FROM admin_sessions
       JOIN admins ON admins.id = admin_sessions.admin_id
       WHERE admin_sessions.token_hash = ?`,
    )
    .get(tokenHash);

  if (!row) return null;

  const expiresAt = typeof row.expires_at === "string" ? row.expires_at : "";
  if (expiresAt <= now) {
    db.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").run(tokenHash);
    return null;
  }

  const id = Number(row.id);
  const email = typeof row.email === "string" ? row.email : "";
  if (!id || !email) return null;
  return { id, email };
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function createAdminSession(adminId: number) {
  const db = getDb();
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_TTL_MS);

  db.prepare("DELETE FROM admin_sessions WHERE expires_at <= ?").run(now.toISOString());
  db.prepare(
    "INSERT INTO admin_sessions (token_hash, admin_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
  ).run(tokenHash, adminId, now.toISOString(), expires.toISOString());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, cookieOptions(expires));
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    getDb()
      .prepare("DELETE FROM admin_sessions WHERE token_hash = ?")
      .run(hashSessionToken(token));
  }
  cookieStore.delete(SESSION_COOKIE);
}

export type LoginResult =
  | { ok: true; admin: AdminUser }
  | { ok: false; reason: "invalid" | "rate_limited" };

export async function verifyAdminLogin(email: string, password: string): Promise<LoginResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const now = Date.now();
  const attempt = loginAttempts.get(normalizedEmail);

  if (attempt && attempt.resetAt > now && attempt.count >= MAX_LOGIN_ATTEMPTS) {
    return { ok: false, reason: "rate_limited" };
  }

  const row = getDb()
    .prepare("SELECT id, email, password_hash FROM admins WHERE email = ?")
    .get(normalizedEmail);

  const valid =
    row &&
    typeof row.password_hash === "string" &&
    verifyPassword(password, row.password_hash);
  const id = row ? Number(row.id) : 0;
  const storedEmail = row && typeof row.email === "string" ? row.email : "";

  if (!valid || !id) {
    if (!attempt || attempt.resetAt <= now) {
      loginAttempts.set(normalizedEmail, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    } else {
      loginAttempts.set(normalizedEmail, { ...attempt, count: attempt.count + 1 });
    }
    return { ok: false, reason: "invalid" };
  }

  loginAttempts.delete(normalizedEmail);
  return { ok: true, admin: { id, email: storedEmail } };
}
