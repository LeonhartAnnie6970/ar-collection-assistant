import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

function getSecret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "fallback-dev-secret-change-in-production"
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === "/login") return NextResponse.next()

  const token = request.cookies.get("ar_auth")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    await jwtVerify(token, getSecret())
    return NextResponse.next()
  } catch {
    const res = NextResponse.redirect(new URL("/login", request.url))
    res.cookies.delete("ar_auth")
    return res
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/export).*)"],
}
