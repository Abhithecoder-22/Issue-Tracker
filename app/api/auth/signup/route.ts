import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { signupSchema } from "@/lib/validation"
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth"
import { uuid } from "@/lib/utils"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = signupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
  }
  const { email, password } = parsed.data
  const sql = getSql()

  const existing = await sql`select id from users where email = ${email}`
  const existingArray = Array.isArray(existing) ? existing : []
  if (existingArray.length) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 })
  }

  const id = uuid()
  const password_hash = await hashPassword(password)
  await sql`insert into users (id, email, password_hash, role) values (${id}, ${email}, ${password_hash}, 'user')`

  const token = await signToken({ sub: id, role: "user", email })
  await setSessionCookie(token)
  return NextResponse.json({ id, email, role: "user" }, { status: 201 })
}
