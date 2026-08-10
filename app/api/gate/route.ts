import { NextResponse } from 'next/server'

const COOKIE = 'proto_gate'

async function hash(value: string) {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function POST(request: Request) {
  const password = process.env.PREVIEW_PASSWORD
  if (!password) return NextResponse.json({ ok: true })

  const body = await request.json().catch(() => ({}))
  const attempt = typeof body.attempt === 'string' ? body.attempt : ''

  if (attempt !== password) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE, await hash(password), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return response
}