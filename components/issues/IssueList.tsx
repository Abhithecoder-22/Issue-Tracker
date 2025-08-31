"use client"

import useSWR, { mutate as globalMutate } from "swr"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { apiGet, apiJson } from "@/lib/swr"

type IssueItem = {
  id: string
  title: string
  description: string
  status: "open" | "closed"
  creator_id: string
  creator_email: string
  created_at: string
  updated_at: string
}

export function IssueList({ listKey }: { listKey: string }) {
  const { data, error, isLoading } = useSWR(listKey, apiGet)

  async function toggleClose(id: string, to: "closed" | "open") {
    // optimistic update
    await globalMutate(
      listKey,
      (current: any) => {
        if (!current) return current
        return {
          ...current,
          items: current.items.map((it: IssueItem) => (it.id === id ? { ...it, status: to } : it)),
        }
      },
      false,
    )
    try {
      await apiJson(`/api/issues/${id}`, "PATCH", { status: to })
    } catch {
      // rollback
      await globalMutate(listKey)
    } finally {
      await globalMutate(listKey)
    }
  }

  if (isLoading) return <p>Loading...</p>
  if (error) return <p className="text-red-600">Failed to load issues</p>
  if (!data || !(data as any).items) return <p>No data available</p>

  const { items = [], total = 0, page = 1, page_size = 10, has_next = false } = data as any

  const params = new URLSearchParams(new URL(listKey, location.origin).search)
  const currentPage = Number(page) || 1
  const nextUrl = (() => {
    const p = new URLSearchParams(params)
    p.set("page", String(currentPage + 1))
    return `/issues?${p.toString()}`
  })()
  const prevUrl = (() => {
    const p = new URLSearchParams(params)
    p.set("page", String(Math.max(1, currentPage - 1)))
    return `/issues?${p.toString()}`
  })()

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {items.map((it: IssueItem) => (
          <li key={it.id} className="border rounded-md p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Link href={`/issues/${it.id}`} className="font-semibold underline">
                {it.title}
              </Link>
              <span
                className={`text-xs px-2 py-1 rounded ${it.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}
              >
                {it.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{it.description}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">By {it.creator_email}</p>
              <div className="flex gap-2">
                {it.status === "open" ? (
                  <Button size="sm" variant="secondary" onClick={() => toggleClose(it.id, "closed")}>
                    Close
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => toggleClose(it.id, "open")}>
                    Reopen
                  </Button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Total: {total}</p>
        <div className="flex gap-2">
          <Link
            href={prevUrl}
            aria-disabled={currentPage <= 1}
            className={`px-3 py-1 border rounded ${currentPage <= 1 ? "pointer-events-none opacity-50" : ""}`}
          >
            Prev
          </Link>
          <span className="text-sm">Page {currentPage}</span>
          <Link
            href={nextUrl}
            aria-disabled={!has_next}
            className={`px-3 py-1 border rounded ${!has_next ? "pointer-events-none opacity-50" : ""}`}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  )
}
