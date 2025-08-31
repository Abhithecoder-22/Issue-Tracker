import { neon } from "@neondatabase/serverless"

let _sql: ReturnType<typeof neon> | null = null

export function getSql() {
  if (!_sql) {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw new Error("DATABASE_URL is not set. Add it in Project Settings or via the Neon integration.")
    }
    _sql = neon(url)
  }
  return _sql
}
