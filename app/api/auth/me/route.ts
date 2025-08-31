import { NextResponse } from "next/server"
import { getAuth } from "@/lib/auth"

export async function GET() {
  const auth = await getAuth()
  if (!auth) return NextResponse.json({ user: null }, { status: 200 })
  return NextResponse.json({ user: auth }, { status: 200 })
}
