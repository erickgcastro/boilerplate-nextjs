"use server";
import { AUTH_COOKIES } from "@/lib/constants/cookies";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIES.REFRESH);
  cookieStore.delete(AUTH_COOKIES.ACCESS);
  cookieStore.delete(AUTH_COOKIES.IMPERSONATION);
  redirect("/login");
}
