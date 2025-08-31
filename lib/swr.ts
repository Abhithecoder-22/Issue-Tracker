export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiJson<T>(url: string, method: "POST" | "PATCH" | "DELETE", data?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: data ? JSON.stringify(data) : undefined,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
