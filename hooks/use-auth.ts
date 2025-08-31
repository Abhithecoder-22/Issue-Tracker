"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((r) => r.json())

export function useAuth() {
  const { data, isLoading, mutate } = useSWR("/api/auth/me", fetcher)
  return { user: data?.user ?? null, isLoading, refresh: () => mutate() }
}
