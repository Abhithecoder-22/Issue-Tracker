"use client"

import type React from "react"

import { useState } from "react"
import { mutate as globalMutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/ui/loading"
import { apiJson } from "@/lib/swr"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

type Issue = {
  id: string
  title: string
  description: string
  status: "open" | "closed"
  creator_id: string
  created_at: string
  updated_at: string
}

export function IssueForm({ listKey }: { listKey: string }) {
  const { user, isLoading } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debug: Log the auth state
  console.log("Auth state:", { user, isLoading })

  if (isLoading) {
    return (
      <div className="border rounded-md p-4 flex items-center justify-center gap-2">
        <LoadingSpinner />
        <p>Loading authentication...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="border rounded-md p-4 flex flex-col gap-3">
        <h3 className="font-semibold">Create Issue</h3>
        <p className="text-muted-foreground">
          You need to be logged in to create issues.{" "}
          <Link href="/login" className="underline text-blue-600">
            Sign in
          </Link>{" "}
          or{" "}
          <Link href="/signup" className="underline text-blue-600">
            create an account
          </Link>
          .
        </p>
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const tempId = `temp-${Date.now()}`
    const optimisticItem: Issue = {
      id: tempId,
      title,
      description,
      status: "open",
      creator_id: "me",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    // optimistic add to list
    await globalMutate(
      listKey,
      async (current: any) => {
        if (!current) return current
        return {
          ...current,
          items: [optimisticItem, ...current.items],
          total: (current.total || 0) + 1,
        }
      },
      false,
    )

    try {
      const created = await apiJson<Issue>("/api/issues", "POST", { title, description })
      // replace temp with actual
      await globalMutate(
        listKey,
        (current: any) => {
          if (!current) return current
          return {
            ...current,
            items: current.items.map((it: Issue) => (it.id === tempId ? created : it)),
          }
        },
        false,
      )
      setTitle("")
      setDescription("")
    } catch (err: any) {
      setError("Failed to create issue")
      // rollback
      await globalMutate(
        listKey,
        (current: any) => {
          if (!current) return current
          return {
            ...current,
            items: current.items.filter((it: Issue) => it.id !== tempId),
            total: Math.max(0, (current.total || 1) - 1),
          }
        },
        false,
      )
    } finally {
      setLoading(false)
      await globalMutate(listKey) // revalidate
    }
  }

  return (
    <form onSubmit={onSubmit} className="border rounded-md p-4 flex flex-col gap-3">
      <h3 className="font-semibold">Create Issue</h3>
      <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} />
      <Textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit" disabled={loading} className="flex items-center gap-2">
        {loading ? (
          <>
            <LoadingSpinner />
            Creating...
          </>
        ) : (
          "Create Issue"
        )}
      </Button>
    </form>
  )
}
