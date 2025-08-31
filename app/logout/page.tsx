"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()
  useEffect(() => {
    fetch("/api/auth/logout", { method: "POST" }).finally(() => router.push("/"))
  }, [router])
  return <main className="max-w-sm mx-auto p-6">Signing out...</main>
}
