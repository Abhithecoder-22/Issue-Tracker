import { config } from "dotenv"
import { neon } from "@neondatabase/serverless"
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

// Load environment variables from .env.local
config({ path: '.env.local' })

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  const sql = neon(url)
  const dir = join(process.cwd(), "scripts", "sql")
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
  for (const f of files) {
    const full = join(dir, f)
    const text = readFileSync(full, "utf8")
    console.log(`[migrate] applying ${f}`)
    await sql.unsafe(text)
  }
  console.log("[migrate] done")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
