import Link from "next/link"

export default function HomePage() {
  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-pretty">Issue Tracker</h1>
      <p className="text-muted-foreground mt-2">Track issues, comments, and manage status.</p>
      <div className="mt-6">
        <Link className="underline" href="/issues">
          Go to Issues
        </Link>
      </div>
    </main>
  )
}
