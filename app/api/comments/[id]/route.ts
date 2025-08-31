import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { requireAuth, isAdmin } from "@/lib/auth"

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  const sql = getSql()
  const rows = await sql`select author_id from comments where id = ${params.id} limit 1`
  const rowsArray = Array.isArray(rows) ? rows : []
  if (!rowsArray.length) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const ownerId = (rowsArray[0] as any).author_id
  if (!(isAdmin(auth) || ownerId === auth.sub)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  await sql`delete from comments where id = ${params.id}`
  return NextResponse.json({ ok: true })
}
