/**
 * Server-side env access.
 *
 * Each getter throws on first use rather than at import time, so a missing
 * Resend key breaks sending an email — not rendering the marketing site.
 */

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is not set — see .env.example`)
  }
  return value
}

export const serverEnv = {
  get betterAuthSecret() {
    return required('BETTER_AUTH_SECRET')
  },
  get resendApiKey() {
    return required('RESEND_API_KEY')
  },
  /** Mailbox that contact-form submissions are forwarded to. */
  get contactForwardEmail() {
    return required('CONTACT_FORWARD_EMAIL')
  },
  /** Sender identity the forwarded submission is sent from. */
  get contactFromEmail() {
    return required('CONTACT_FROM_EMAIL')
  },
  /**
   * Svix signing secret for the Resend inbound webhook (`whsec_...`), found
   * in the Resend dashboard next to the webhook. Used to verify that an
   * inbound POST genuinely came from Resend.
   */
  get resendWebhookSecret() {
    return required('RESEND_WEBHOOK_SECRET')
  },
  /** Mailbox that inbound emails are forwarded on to as they arrive. */
  get inboundForwardEmail() {
    return required('INBOUND_FORWARD_EMAIL')
  },
}

export const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export const isProduction = process.env.NODE_ENV === 'production'

/**
 * Sender identities an admin may reply from, e.g.
 *   `PandorLabs <info@pandorlabs.com>,Sales <sales@pandorlabs.com>`
 *
 * Replies are restricted to this list: the FROM address arrives from the
 * browser, so it is validated against these values before it reaches Resend.
 */
export function replyFromAddresses(): string[] {
  const raw = process.env.RESEND_FROM_ADDRESSES ?? ''
  const addresses = raw
    .split(',')
    .map((address) => address.trim())
    .filter(Boolean)

  if (addresses.length === 0) {
    throw new Error('RESEND_FROM_ADDRESSES is not set — see .env.example')
  }
  return addresses
}
