// Single source of truth for the AwSales password policy.
//
// Follows NIST SP 800-63-4 §5.1.1.2: length over composition. We require a
// minimum length, allow passphrases (any character, including spaces), do NOT
// impose complexity rules (uppercase / number / symbol), and surface a
// breached-password warning (HIBP) as product copy. The strength meter is
// advisory feedback, never a gate.
//
// Hi-fi prototype note: the HIBP/breach check and real entropy scoring are
// represented in the UI only — the backend owns the actual checks. Swap
// `evaluatePassword` for zxcvbn later if real entropy scoring is desired.

export const PASSWORD_MIN_LENGTH = 10

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
