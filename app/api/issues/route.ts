import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { issuesQuerySchema, issueCreateSchema } from "@/lib/validation"
import { requireAuth } from "@/lib/auth"
import { uuid } from "@/lib/utils"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const parsed = issuesQuerySchema.safeParse({
    status: searchParams.get("status") || undefined,
    page: searchParams.get("page") || undefined,
    page_size: searchParams.get("page_size") || undefined,
    q: searchParams.get("q") || undefined,
  })
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query", details: parsed.error.issues }, { status: 400 })
  }
  const { status = "all", page, page_size, q } = parsed.data
  const sql = getSql()

  try {
    let countQuery
    let dataQuery
    
    if (status !== "all" && q && q.trim()) {
      // Both status and search filters
      countQuery = sql`select count(*)::text as count from issues where status = ${status} and (title ILIKE ${`%${q}%`} OR description ILIKE ${`%${q}%`})`
      dataQuery = sql`
        select i.id, i.title, i.description, i.status, i.creator_id, i.created_at, i.updated_at,
               u.email as creator_email
          from issues i
          join users u on u.id = i.creator_id
         where i.status = ${status} and (i.title ILIKE ${`%${q}%`} OR i.description ILIKE ${`%${q}%`})
         order by i.created_at desc
         limit ${page_size} offset ${(page - 1) * page_size}
      `
    } else if (status !== "all") {
      // Status filter only
      countQuery = sql`select count(*)::text as count from issues where status = ${status}`
      dataQuery = sql`
        select i.id, i.title, i.description, i.status, i.creator_id, i.created_at, i.updated_at,
               u.email as creator_email
          from issues i
          join users u on u.id = i.creator_id
         where i.status = ${status}
         order by i.created_at desc
         limit ${page_size} offset ${(page - 1) * page_size}
      `
    } else if (q && q.trim()) {
      // Search filter only
      countQuery = sql`select count(*)::text as count from issues where title ILIKE ${`%${q}%`} OR description ILIKE ${`%${q}%`}`
      dataQuery = sql`
        select i.id, i.title, i.description, i.status, i.creator_id, i.created_at, i.updated_at,
               u.email as creator_email
          from issues i
          join users u on u.id = i.creator_id
         where i.title ILIKE ${`%${q}%`} OR i.description ILIKE ${`%${q}%`}
         order by i.created_at desc
         limit ${page_size} offset ${(page - 1) * page_size}
      `
    } else {
      // No filters
      countQuery = sql`select count(*)::text as count from issues`
      dataQuery = sql`
        select i.id, i.title, i.description, i.status, i.creator_id, i.created_at, i.updated_at,
               u.email as creator_email
          from issues i
          join users u on u.id = i.creator_id
         order by i.created_at desc
         limit ${page_size} offset ${(page - 1) * page_size}
      `
    }

    const countResult = await countQuery
    const countRows = Array.isArray(countResult) ? countResult : []
    const total = Number((countRows[0] as any)?.count || 0)
    
    const dataResult = await dataQuery
    const rows = Array.isArray(dataResult) ? dataResult : []

    return NextResponse.json({
      items: rows,
      total,
      page,
      page_size,
      has_next: (page - 1) * page_size + rows.length < total,
    })
  } catch (error) {
    console.error("Error fetching issues:", error)
    return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const auth = await requireAuth()
  const body = await req.json().catch(() => null)
  const parsed = issueCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
  }
  const { title, description } = parsed.data
  const sql = getSql()
  const id = uuid()
  const now = new Date()
  await sql`
    insert into issues (id, title, description, status, creator_id, created_at, updated_at)
    values (${id}, ${title}, ${description}, 'open', ${auth.sub}, ${now.toISOString()}, ${now.toISOString()})
  `
  return NextResponse.json(
    { id, title, description, status: "open", creator_id: auth.sub, created_at: now, updated_at: now },
    { status: 201 },
  )
}
