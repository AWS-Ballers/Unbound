"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";

export async function signInWithCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/auth/signin?error=${encodeURIComponent(error.type)}`);
    }
    throw error;
  }
}

export async function signInWithGitHub() {
  await signIn("github", { redirectTo: "/dashboard" });
}
