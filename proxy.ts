import { NextRequest, NextResponse } from 'next/server'

const COOKIE = 'proto_gate'

async function hash(value: string) {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export default async function proxy(request: NextRequest) {
  const password = process.env.PREVIEW_PASSWORD

  // No password set means no gate. Local dev stays frictionless.
  if (!password) return NextResponse.next()

  const expected = await hash(password)
  const provided = request.cookies.get(COOKIE)?.value

  if (provided === expected) return NextResponse.next()

  // Rewrite, not redirect: the visitor's URL stays intact, so after they
  // unlock they land on the exact link you sent them.
  const url = request.nextUrl.clone()
  url.pathname = '/gate'
  url.search = ''
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!gate|api/gate|_next/static|_next/image|favicon.ico).*)'],
}