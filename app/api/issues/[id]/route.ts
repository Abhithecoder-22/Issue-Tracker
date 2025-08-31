import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { issueUpdateSchema } from "@/lib/validation"
import { requireAuth, isAdmin } from "@/lib/auth"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const rows = await sql`
    select i.*, u.email as creator_email from issues i
      join users u on u.id = i.creator_id
     where i.id = ${params.id}
     limit 1`
  const rowsArray = Array.isArray(rows) ? rows : []
  if (!rowsArray.length) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(rowsArray[0])
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  const sql = getSql()
  const issueRows = await sql`select creator_id from issues where id = ${params.id} limit 1`
  if (!Array.isArray(issueRows) || !issueRows.length) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const ownerId = (issueRows[0] as any).creator_id
  if (!(isAdmin(auth) || ownerId === auth.sub)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = issueUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
  }

  const fields = parsed.data
  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  const now = new Date().toISOString()
  
  // Handle different field combinations
  if (fields.title && fields.description && fields.status) {
    await sql`update issues set title = ${fields.title}, description = ${fields.description}, status = ${fields.status}, updated_at = ${now} where id = ${params.id}`
  } else if (fields.title && fields.description) {
    await sql`update issues set title = ${fields.title}, description = ${fields.description}, updated_at = ${now} where id = ${params.id}`
  } else if (fields.title && fields.status) {
    await sql`update issues set title = ${fields.title}, status = ${fields.status}, updated_at = ${now} where id = ${params.id}`
  } else if (fields.description && fields.status) {
    await sql`update issues set description = ${fields.description}, status = ${fields.status}, updated_at = ${now} where id = ${params.id}`
  } else if (fields.title) {
    await sql`update issues set title = ${fields.title}, updated_at = ${now} where id = ${params.id}`
  } else if (fields.description) {
    await sql`update issues set description = ${fields.description}, updated_at = ${now} where id = ${params.id}`
  } else if (fields.status) {
    await sql`update issues set status = ${fields.status}, updated_at = ${now} where id = ${params.id}`
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  const sql = getSql()
  const issueRows = await sql`select creator_id from issues where id = ${params.id} limit 1`
  const issueRowsArray = Array.isArray(issueRows) ? issueRows : []
  if (!issueRowsArray.length) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const ownerId = (issueRowsArray[0] as any).creator_id
  if (!(isAdmin(auth) || ownerId === auth.sub)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  await sql`delete from issues where id = ${params.id}`
  return NextResponse.json({ ok: true }, { status: 200 })
}
