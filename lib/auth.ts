import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"

const COOKIE_NAME = "session"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not set. Add it in Project Settings.")
  return new TextEncoder().encode(secret)
}

export type AuthToken = {
  sub: string
  role: "admin" | "user"
  email: string
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function signToken(payload: AuthToken) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret())
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
}

export async function getAuth(): Promise<AuthToken | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get(COOKIE_NAME)?.value
  if (!session) return null
  try {
    const { payload } = await jwtVerify(session, getJwtSecret())
    return {
      sub: String(payload.sub),
      role: payload.role as "admin" | "user",
      email: String(payload.email),
    }
  } catch {
    return null
  }
}

export async function requireAuth() {
  const auth = await getAuth()
  if (!auth) {
    const err = new Error("Unauthorized")
    ;(err as any).status = 401
    throw err
  }
  return auth
}

export function isAdmin(auth: AuthToken | null) {
  return auth?.role === "admin"
}
