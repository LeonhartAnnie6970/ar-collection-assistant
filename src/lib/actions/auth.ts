"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createSessionToken } from "@/lib/auth"

export async function login(_prev: unknown, formData: FormData) {
  const username = (formData.get("username") as string ?? "").trim()
  const password = (formData.get("password") as string ?? "").trim()

  const validUsername = process.env.APP_USERNAME ?? "admin"
  const validPassword = process.env.APP_PASSWORD ?? "password"

  if (!username || !password) {
    return { error: "Username dan password wajib diisi" }
  }

  if (username !== validUsername || password !== validPassword) {
    return { error: "Username atau password salah" }
  }

  const token = await createSessionToken(username)
  const cookieStore = await cookies()

  cookieStore.set("ar_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8,
    path: "/",
  })

  redirect("/")
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("ar_auth")
  redirect("/login")
}
