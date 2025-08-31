import { config } from "dotenv"
import { neon } from "@neondatabase/serverless"

// Load environment variables from .env.local
config({ path: '.env.local' })

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL not set")
  const sql = neon(url)

  console.log("[init-db] Creating tables if not exist...")
  
  // Create users table
  await sql`
    create table if not exists users (
      id text primary key,
      email text not null unique,
      password_hash text not null,
      role text not null check (role in ('admin','user')),
      created_at timestamptz not null default now()
    )
  `

  // Create issues table
  await sql`
    create table if not exists issues (
      id text primary key,
      title text not null,
      description text not null,
      status text not null check (status in ('open','closed')) default 'open',
      creator_id text not null references users(id) on delete cascade,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `

  // Create comments table
  await sql`
    create table if not exists comments (
      id text primary key,
      issue_id text not null references issues(id) on delete cascade,
      author_id text not null references users(id) on delete cascade,
      body text not null,
      created_at timestamptz not null default now()
    )
  `

  // Create indexes
  await sql`create index if not exists idx_issues_status on issues(status)`
  await sql`create index if not exists idx_issues_title on issues(title)`

  console.log("[init-db] Done.")
}

main().catch((e) => {
  console.error("[init-db] Error:", e)
})
