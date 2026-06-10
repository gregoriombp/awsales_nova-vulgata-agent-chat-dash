// Single source of truth for the Aswork password policy.
//
// Inspired by NIST SP 800-63B-4 §3.1.1.2: length over composition. We allow
// passphrases (any character, including spaces) and do NOT impose complexity
// rules (uppercase / number / symbol), and we surface a breached-password
// check (HIBP) as product copy. The strength meter is advisory, never a gate.
//
// Product decisions (NOT literal mandates of the norm — documented so the copy
// doesn't oversell the standard):
//   - MIN length = 10. NIST recommends allowing short minimums (8 inside MFA,
//     15 for single-factor); 10 is an Aswork choice, open to revisit.
//   - MAX length = 64. NIST asks systems to ACCEPT *at least* 64 chars; it does
//     not require rejecting 65+. Capping at 64 is a local product decision to
//     bound cost/abuse, not a norm requirement.
//
// Hi-fi prototype note: the HIBP/breach check and real entropy scoring are
// represented in the UI only — the backend owns the actual checks. Swap
// `evaluatePassword` for zxcvbn later if real entropy scoring is desired.

export const PASSWORD_MIN_LENGTH = 10
export const PASSWORD_MAX_LENGTH = 64

/**
 * Tiny demo blocklist standing in for the backend HIBP/breach lookup. Lets the
 * hi-fi actually REACH the "leaked password" state the copy promises — these
 * exact strings (and a couple of classic offenders) are rejected on reset.
 * Production resolves this against the real breach corpus server-side.
 */
const LEAKED_PASSWORDS = new Set(
  [
    "password123!",
    "senha123456",
    "1234567890",
    "qwertyuiop",
    "iloveyou123",
    "admin123456",
  ].map((p) => p.toLowerCase()),
)

/** Whether `pw` is in the demo breach blocklist. Case-insensitive. */
export function isLeakedPassword(pw: string): boolean {
  return LEAKED_PASSWORDS.has(pw.toLowerCase())
}

export type PasswordStrength = {
  /** 0–4, length-led with a small variety bonus. Advisory only. */
  score: 0 | 1 | 2 | 3 | 4
  /** PT-BR label for the current score. */
  label: string
}

export type PasswordEvaluation = PasswordStrength & {
  length: number
  /** Meets the only hard requirement: length >= PASSWORD_MIN_LENGTH. */
  longEnough: boolean
  /** Distinct char classes present (lower/upper/digit/symbol). Bonus only. */
  classes: number
}

const STRENGTH_LABELS = [
  "muito curta",
  "fraca",
  "razoável",
  "forte",
  "excelente",
] as const

/**
 * Length-led strength heuristic (no external deps). NIST de-emphasizes
 * composition, so length dominates; character variety only nudges the score.
 */
export function evaluatePassword(pw: string): PasswordEvaluation {
  const length = pw.length
  const longEnough = length >= PASSWORD_MIN_LENGTH
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) =>
    re.test(pw)
  ).length

  let score: PasswordStrength["score"] = 0
  if (length >= 6) score = 1
  if (longEnough) score = 2
  if (length >= 14 || (longEnough && classes >= 3)) score = 3
  if (length >= 20 || (length >= 16 && classes >= 3)) score = 4
  // Never advertise "strong" before the minimum length is met.
  if (!longEnough && score > 1) score = 1

  return { length, longEnough, classes, score, label: STRENGTH_LABELS[score] }
}
