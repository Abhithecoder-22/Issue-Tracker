"use client"

import { useSearchParams } from "next/navigation"
import { IssueFilters } from "@/components/issues/IssueFilters"
import { IssueForm } from "@/components/issues/IssueForm"
import { IssueList } from "@/components/issues/IssueList"

export default function IssuesPage() {
  const sp = useSearchParams()
  const page = sp.get("page") || "1"
  const status = sp.get("status") || "all"
  const q = sp.get("q") || ""
  const page_size = sp.get("page_size") || "10"
  const listKey = `/api/issues?status=${status}&page=${page}&page_size=${page_size}${q ? `&q=${encodeURIComponent(q)}` : ""}`

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-8">
            <header className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Issues</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Search, filter, create, and manage issues. Track bugs, feature requests, and improvements for your project.
              </p>
            </header>
            
            <div className="space-y-8">
              <IssueFilters />
              <IssueForm listKey={listKey} />
              <IssueList listKey={listKey} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
