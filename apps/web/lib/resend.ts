import { Resend } from 'resend'

import { serverEnv } from './env'

let client: Resend | null = null

/** Lazily constructed so a missing API key fails on send, not on import. */
export function resend(): Resend {
  if (!client) {
    client = new Resend(serverEnv.resendApiKey)
  }
  return client
}

/** Minimal HTML escaping — submissions are attacker-controlled text. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
