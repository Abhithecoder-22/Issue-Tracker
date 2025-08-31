"use client"

import useSWR from "swr"
import { useParams } from "next/navigation"
import { apiGet } from "@/lib/swr"
import { CommentForm } from "@/components/issues/CommentForm"
import { LoadingPage } from "@/components/ui/loading"
import Link from "next/link"
import { ArrowLeft, Calendar, User } from "lucide-react"

type Issue = {
  id: string
  title: string
  description: string
  status: "open" | "closed"
  creator_id: string
  creator_email: string
  created_at: string
  updated_at: string
}

type Comment = {
  id: string
  body: string
  author_email: string
  created_at: string
}

export default function IssueDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: issue, error } = useSWR<Issue>(`/api/issues/${params.id}`, apiGet)
  const { data: comments } = useSWR<Comment[]>(`/api/issues/${params.id}/comments`, apiGet)

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600 mb-2">Failed to load issue</h1>
          <p className="text-gray-600 mb-4">Something went wrong while loading the issue details.</p>
          <Link 
            href="/issues" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to issues
          </Link>
        </div>
      </div>
    )
  }

  if (!issue) {
    return <LoadingPage />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link 
          href="/issues" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to issues
        </Link>

        {/* Issue header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{issue.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>Created by {issue.creator_email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(issue.created_at)}</span>
                </div>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                issue.status === "open" 
                  ? "bg-green-100 text-green-800 border border-green-200" 
                  : "bg-gray-100 text-gray-800 border border-gray-200"
              }`}
            >
              {issue.status.toUpperCase()}
            </span>
          </div>

          {/* Issue description */}
          <div className="prose prose-gray max-w-none">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
            </div>
          </div>
        </div>

        {/* Comments section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Comments ({comments?.length || 0})
          </h2>
          
          <CommentForm issueId={params.id} />
          
          {comments && comments.length > 0 ? (
            <div className="mt-6 space-y-4">
              {comments.map((comment: any) => (
                <div key={comment.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {comment.author_email?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {comment.author_email}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 text-center text-gray-500 py-8">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
