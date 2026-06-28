// Mock account-security service for the Aswork hi-fi prototype.
//
// Companion to `password-policy.ts`: the real operations — verifying the
// current password, persisting a new one, validating a TOTP code — live in the
// backend. Here they are represented as latency-bearing promises so the
// live-preview reaches every real state (verifying spinners, "senha incorreta",
// "código inválido") with plausible timing. Production swaps these functions
// for the real endpoints; the calling UI does not change.

/**
 * The one secret the hi-fi treats as wrong, so the live-preview can actually
 * reach its error states. Type "000000" as the current password or the TOTP
 * code and the mock rejects it; anything else passes. Production resolves these
 * against the real credential store / authenticator, server-side.
 */
const REJECTED_SECRET = "000000"

/** Simulated round-trip latencies (ms), tuned to feel like a real request. */
const VERIFY_PASSWORD_LATENCY = 700
const VERIFY_TOTP_LATENCY = 1100

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Confirm the account's current password before allowing a change. Resolves
 * `true` when accepted, `false` when rejected.
 */
export async function verifyCurrentPassword(pw: string): Promise<boolean> {
  await delay(VERIFY_PASSWORD_LATENCY)
  return pw !== REJECTED_SECRET
}

/**
 * Persist the new password. The mock has nothing to store, so it resolves
 * immediately — production POSTs the new credential and the UI flips to its
 * "senha alterada" success state once this resolves.
 */
export async function submitNewPassword(newPw: string): Promise<void> {
  void newPw // production POSTs the new credential here.
  // No artificial delay: the change-password step has no loading affordance,
  // so the success state should land as soon as validation passes.
}

/**
 * Validate the 6-digit TOTP code while reconfiguring the authenticator app.
 * Resolves `true` when the code is accepted, `false` when invalid/expired.
 */
export async function verifyTotpCode(code: string): Promise<boolean> {
  await delay(VERIFY_TOTP_LATENCY)
  return code !== REJECTED_SECRET
}
