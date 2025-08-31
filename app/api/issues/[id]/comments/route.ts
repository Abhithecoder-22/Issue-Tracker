import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { commentCreateSchema } from "@/lib/validation"
import { uuid } from "@/lib/utils"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const rows = await sql`
    select c.id, c.body, c.created_at, u.email as author_email, u.id as author_id
      from comments c
      join users u on u.id = c.author_id
     where c.issue_id = ${params.id}
     order by c.created_at asc`
  const rowsArray = Array.isArray(rows) ? rows : []
  return NextResponse.json(rowsArray)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  const body = await req.json().catch(() => null)
  const parsed = commentCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
  }
  const sql = getSql()
  const exists = await sql`select 1 from issues where id = ${params.id} limit 1`
  const existsArray = Array.isArray(exists) ? exists : []
  if (!existsArray.length) return NextResponse.json({ error: "Issue not found" }, { status: 404 })

  const id = uuid()
  const now = new Date().toISOString()
  await sql`
    insert into comments (id, issue_id, author_id, body, created_at)
    values (${id}, ${params.id}, ${auth.sub}, ${parsed.data.body}, ${now})
  `
  return NextResponse.json(
    { id, issue_id: params.id, author_id: auth.sub, body: parsed.data.body, created_at: now },
    { status: 201 },
  )
}
