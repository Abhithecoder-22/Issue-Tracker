import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { loginSchema } from "@/lib/validation"
import { verifyPassword, signToken, setSessionCookie } from "@/lib/auth"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
  }
  const { email, password } = parsed.data
  const sql = getSql()

  const rows = await sql`
    select id, password_hash, role from users where email = ${email} limit 1`
  const rowsArray = Array.isArray(rows) ? rows : []
  if (!rowsArray.length) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }
  const user = rowsArray[0] as any
  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

  const token = await signToken({ sub: user.id, role: user.role, email })
  await setSessionCookie(token)
  return NextResponse.json({ id: user.id, email, role: user.role }, { status: 200 })
}
