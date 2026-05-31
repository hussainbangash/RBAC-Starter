"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { checkRateLimit } from "@/lib/security/rate-limit";

function getClientIp(requestHeaders: Headers) {
  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "local"
  );
}

export async function signInWithCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const requestHeaders = await headers();
  const clientIp = getClientIp(requestHeaders);
  const rateLimit = checkRateLimit(`login:${clientIp}:${email}`, 5, 60_000);

  if (!rateLimit.allowed) {
    redirect(
      `/login?error=RateLimited&retryAfter=${rateLimit.retryAfterSeconds}`
    );
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=CredentialsSignin");
    }

    throw error;
  }
}
