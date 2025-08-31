"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useSWRConfig } from "swr"

export default function NewIssuePage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { mutate } = useSWRConfig()

  async function submit() {
    setError(null)
    setLoading(true)
    const res = await fetch("/api/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(j?.error || "Failed to create")
      setLoading(false)
      return
    }
    // invalidate first page list
    mutate((key) => typeof key === "string" && key.startsWith("/api/issues?"))
    setLoading(false)
    router.push("/issues")
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-pretty">Create Issue</h1>
      <div className="mt-4 space-y-3">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea
          rows={8}
          placeholder="Describe the issue..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={submit} disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </main>
  )
}
