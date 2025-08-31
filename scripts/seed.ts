import { config } from "dotenv"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto"

// Load environment variables from .env.local
config({ path: '.env.local' })

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL not set")
  const sql = neon(url)

  console.log("[seed] Ensuring admin user...")
  const adminEmail = "admin@example.com"
  const adminRows = await sql`select id from users where email = ${adminEmail} limit 1`
  let adminId: string
  if (adminRows.length) {
    adminId = adminRows[0].id
    console.log("[seed] Admin exists:", adminId)
  } else {
    const hash = await bcrypt.hash("Admin1234!", 10)
    adminId = randomUUID()
    await sql`insert into users (id, email, password_hash, role) values (${adminId}, ${adminEmail}, ${hash}, 'admin')`
    console.log("[seed] Created admin:", adminId, "password=Admin1234!")
  }

  console.log("[seed] Creating sample user...")
  const userEmail = "user@example.com"
  const userRows = await sql`select id from users where email = ${userEmail} limit 1`
  let userId: string
  if (userRows.length) {
    userId = userRows[0].id
  } else {
    const hash = await bcrypt.hash("User1234!", 10)
    userId = randomUUID()
    await sql`insert into users (id, email, password_hash, role) values (${userId}, ${userEmail}, ${hash}, 'user')`
    console.log("[seed] Created user:", userId, "password=User1234!")
  }

  console.log("[seed] Creating sample issues...")
  const issue1 = randomUUID()
  await sql`
    insert into issues (id, title, description, status, creator_id)
    values (${issue1}, 'Example open issue', 'This is an example open issue.', 'open', ${userId})
    on conflict (id) do nothing
  `
  const issue2 = randomUUID()
  await sql`
    insert into issues (id, title, description, status, creator_id)
    values (${issue2}, 'Closed issue', 'This issue is closed.', 'closed', ${adminId})
    on conflict (id) do nothing
  `

  console.log("[seed] Creating sample comments...")
  await sql`
    insert into comments (id, issue_id, author_id, body)
    values (${randomUUID()}, ${issue1}, ${userId}, 'First comment!'),
           (${randomUUID()}, ${issue1}, ${adminId}, 'Admin here, thanks for reporting.')
    on conflict (id) do nothing
  `

  console.log("[seed] Done.")
}

main().catch((e) => {
  console.error("[seed] Error:", e)
})
