"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/ui/loading"
import { apiJson } from "@/lib/swr"
import { mutate } from "swr"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export function CommentForm({ issueId }: { issueId: string }) {
  const { user, isLoading } = useAuth()
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4 flex items-center justify-center gap-2">
        <LoadingSpinner />
        <span>Loading...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <p className="text-gray-600 mb-3">
          You need to be logged in to post comments.
        </p>
        <div className="flex gap-2">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">
              Create account
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    
    setLoading(true)
    setError(null)
    try {
      await apiJson(`/api/issues/${issueId}/comments`, "POST", { body: body.trim() })
      setBody("")
      await mutate(`/api/issues/${issueId}/comments`)
    } catch (e) {
      setError("Failed to post comment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Add a comment</h3>
      <form onSubmit={onSubmit} className="space-y-3">
        <Textarea
          placeholder="Write your comment here..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          disabled={loading}
          rows={3}
          className="resize-none"
        />
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading || !body.trim()}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                Posting...
              </>
            ) : (
              "Post Comment"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
