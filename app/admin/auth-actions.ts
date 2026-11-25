"use server";

import { redirect } from "next/navigation";
import { destroyAdminSession, verifyAdminLogin, createAdminSession } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/admin/login?error=missing");
  }

  const result = await verifyAdminLogin(email, password);
  if (!result.ok) {
    redirect(`/admin/login?error=${result.reason}`);
  }

  await createAdminSession(result.admin.id);
  redirect("/admin");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}
