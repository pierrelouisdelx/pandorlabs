/**
 * Per-source accent colours.
 *
 * Source pages are themed with the brand's own colour rather than the product
 * category's. Two constraints shape everything here:
 *
 *  1. The canvas is `--color-primary` (#010a22), so a brand's literal hex is
 *     often unusable for text — LinkedIn blue (#0A66C2) lands around 3.4:1.
 *     Every token set therefore carries a lightened `text` variant alongside
 *     the true `base`, and small text and icons use `text` while solid fills
 *     use `base`.
 *  2. Tailwind's default palette is wiped by `--color-*: initial` in
 *     globals.css, so an arbitrary brand hex can never be a utility class.
 *     These tokens are consumed as inline styles and CSS custom properties,
 *     which sidesteps that entirely.
 */

export interface AccentTokens {
  /** The brand's actual colour. Solid fills, dots, glows. */
  base: string
  /** Lightened for legibility on the dark canvas. Text, icons, gradients. */
  text: string
  /** Gradient partner for `text`, used on the clipped headline spans. */
  textDeep: string
  /** Ambient glow behind heroes and CTAs. */
  glow: string
  /** Faint wash for radial section backgrounds. */
  tint: string
  /** Icon well / chip background. */
  well: string
  /** Hover border colour. */
  border: string
  /** Readable foreground when `base` is used as a solid background. */
  on: string
}

function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ]
}

function toHex([r, g, b]: [number, number, number]): string {
  const part = (n: number) =>
    Math.round(Math.max(0, Math.min(255, n)))
      .toString(16)
      .padStart(2, '0')
  return `#${part(r)}${part(g)}${part(b)}`
}

export function rgba(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Mix toward white (positive) or black (negative amount). */
function shift(hex: string, amount: number): string {
  const [r, g, b] = parseHex(hex)
  const target = amount >= 0 ? 255 : 0
  const t = Math.abs(amount)
  return toHex([
    r + (target - r) * t,
    g + (target - g) * t,
    b + (target - b) * t,
  ])
}

/** WCAG relative luminance, used to pick a readable foreground. */
function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Build the full token set from a single brand hex.
 *
 * Dark brand colours get lightened hard for text; already-light ones (the
 * monochrome luxury houses read as ivory and stone here) are left alone, since
 * pushing them further would wash them out to plain white.
 */
export function accentTokens(hex: string): AccentTokens {
  const lum = luminance(hex)

  // Below ~0.35 luminance the raw hex is too dark to read as body-adjacent
  // text on #010a22. Scale the lift by how dark it actually is.
  const lift = lum > 0.5 ? 0 : lum > 0.35 ? 0.12 : 0.34
  const text = shift(hex, lift)

  return {
    base: hex,
    text,
    textDeep: shift(text, -0.18),
    glow: rgba(hex, 0.15),
    tint: rgba(hex, 0.1),
    well: rgba(hex, 0.12),
    border: rgba(hex, 0.4),
    // #010a22 is the page canvas; use it wherever the accent is light enough.
    on: lum > 0.45 ? '#010a22' : '#ffffff',
  }
}

/** `linear-gradient` matching the clipped-text treatment on product pages. */
export function accentTextGradient(tokens: AccentTokens): string {
  return `linear-gradient(to left, ${tokens.text}, ${tokens.textDeep})`
}
