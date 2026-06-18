import { SignJWT, jwtVerify } from "jose"

function getSecret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "fallback-dev-secret-change-in-production"
  )
}

export async function createSessionToken(username: string): Promise<string> {
  return new SignJWT({ auth: true, user: username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret())
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret())
    return true
  } catch {
    return false
  }
}
