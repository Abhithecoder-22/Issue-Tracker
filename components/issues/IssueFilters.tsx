"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export function IssueFilters() {
  const router = useRouter()
  const sp = useSearchParams()
  const [q, setQ] = useState(sp.get("q") || "")
  const [status, setStatus] = useState(sp.get("status") || "all")

  useEffect(() => {
    setQ(sp.get("q") || "")
    setStatus(sp.get("status") || "all")
  }, [sp])

  function apply() {
    const params = new URLSearchParams(sp.toString())
    if (q) params.set("q", q)
    else params.delete("q")
    if (status) params.set("status", status)
    router.push(`/issues?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Search title/description"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-64"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={apply}>Apply</Button>
      </div>
    </div>
  )
}
