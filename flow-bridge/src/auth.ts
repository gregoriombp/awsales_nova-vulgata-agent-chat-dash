import type { NextFunction, Request, Response } from "express"

const TOKEN = process.env.BOMBARDIER_FLOW_TOKEN ?? ""

export function tokenConfigured(): boolean {
  return TOKEN.length > 0
}

/**
 * Token shared with the frontend via NEXT_PUBLIC_BOMBARDIER_FLOW_TOKEN.
 * Header: X-Flow-Token. Same shape as review-bridge.
 *
 * If no token is configured, every request is rejected — we never want the
 * bridge to run wide-open, even on LAN.
 */
export function requireToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!tokenConfigured()) {
    res.status(503).json({
      error: "no_token_configured",
      hint: "Defina BOMBARDIER_FLOW_TOKEN no .env do flow-bridge.",
    })
    return
  }

  const headerToken =
    typeof req.headers["x-flow-token"] === "string"
      ? req.headers["x-flow-token"]
      : Array.isArray(req.headers["x-flow-token"])
      ? req.headers["x-flow-token"][0]
      : ""

  const queryToken = typeof req.query.token === "string" ? req.query.token : ""

  const presented = headerToken || queryToken

  if (!presented || !timingSafeEqual(presented, TOKEN)) {
    res.status(401).json({ error: "invalid_token" })
    return
  }

  next()
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}
