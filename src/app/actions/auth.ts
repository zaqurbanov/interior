"use server";

import { AuthError, type CredentialsSignin } from "next-auth";
import { signIn, signOut } from "@/auth";

export async function login(_prev: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: String(formData.get("callbackUrl") || "/admin"),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.type !== "CredentialsSignin") return "Sign-in failed. Check the database connection.";
      return (err as CredentialsSignin).code === "rate_limited"
        ? "Too many failed attempts. Please wait 15 minutes and try again."
        : "Invalid email or password.";
    }
    throw err; // re-throw redirects
  }
}

export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}
