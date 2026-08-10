'use client'

import { useState } from 'react'

export default function Gate() {
  const [attempt, setAttempt] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit() {
    setBusy(true)
    setError(false)
    const res = await fetch('/api/gate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attempt }),
    })
    if (res.ok) {
      window.location.reload()
    } else {
      setError(true)
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
      <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-stone-900">
          This prototype is private
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Enter the password you were given to continue.
        </p>

        <input
          type="password"
          value={attempt}
          autoFocus
          onChange={(e) => setAttempt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
          className="mt-6 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-500"
          placeholder="Password"
        />

        {error && (
          <p className="mt-2 text-sm text-red-600">
            That password didn&apos;t work.
          </p>
        )}

        <button
          onClick={submit}
          disabled={busy || attempt.length === 0}
          className="mt-4 w-full rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {busy ? 'Checking' : 'Continue'}
        </button>
      </div>
    </main>
  )
}