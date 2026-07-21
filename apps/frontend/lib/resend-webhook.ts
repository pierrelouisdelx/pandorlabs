import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Resend signs webhooks with Svix. Verification here is done by hand rather
 * than pulling in the `svix` package: the scheme is a single HMAC-SHA256 and a
 * timestamp-tolerance check, so the dependency would earn its keep only if we
 * needed more of Svix's surface.
 *
 * Reference: https://docs.svix.com/receiving/verifying-payloads/how-manual
 */

/** How far the `svix-timestamp` may drift before we reject as a replay. */
const TOLERANCE_SECONDS = 5 * 60

export type SvixHeaders = {
  id: string | null
  timestamp: string | null
  signature: string | null
}

/**
 * Verify a Svix-signed payload.
 *
 * @param secret  The `whsec_...` signing secret.
 * @param body    The raw, unparsed request body — signing is over the exact bytes.
 * @param headers The `svix-id` / `svix-timestamp` / `svix-signature` headers.
 * @param nowSeconds Current unix time in seconds (injectable for testing).
 */
export function verifySvixSignature(
  secret: string,
  body: string,
  headers: SvixHeaders,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): boolean {
  const { id, timestamp, signature } = headers
  if (!id || !timestamp || !signature) return false

  const sentAt = Number(timestamp)
  if (!Number.isFinite(sentAt)) return false
  if (Math.abs(nowSeconds - sentAt) > TOLERANCE_SECONDS) return false

  // Secret is `whsec_<base64>`; the HMAC key is the decoded base64 portion.
  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
  const signedContent = `${id}.${timestamp}.${body}`
  const expected = createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64')

  // The header is a space-separated list of `version,signature` pairs, e.g.
  // `v1,g0h... v1a,bd2...`. A match on any v1 signature is a pass.
  return signature.split(' ').some((entry) => {
    const [version, sig] = entry.split(',')
    if (version !== 'v1' || !sig) return false
    return safeEqual(sig, expected)
  })
}

/** Constant-time string compare that never throws on length mismatch. */
function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  if (bufferA.length !== bufferB.length) return false
  return timingSafeEqual(bufferA, bufferB)
}

/**
 * Split an address header into a display name and a bare email.
 *   `"Ada Lovelace" <ada@x.com>` -> { name: 'Ada Lovelace', email: 'ada@x.com' }
 *   `ada@x.com`                  -> { name: null,           email: 'ada@x.com' }
 */
export function parseAddress(raw: string): {
  name: string | null
  email: string
} {
  const match = raw.match(/^\s*(.*?)\s*<([^>]+)>\s*$/)
  if (match) {
    const name = match[1].replace(/^"|"$/g, '').trim()
    return { name: name || null, email: match[2].trim() }
  }
  return { name: null, email: raw.trim() }
}
