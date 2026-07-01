import { NextRequest, NextResponse } from "next/server";
import { getAgentSettings, listComments } from "../_store";
import { parseReviewCommand } from "@/lib/bombardier-review/commandParse";
import { getReviewAgent } from "@/lib/bombardier-review/agents";
import { getReviewSkill } from "@/lib/bombardier-review/skills";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The actionable queue for the /loop dispatcher: open, user-authored comments
// that mention an agent the user has ENABLED in the Bombardier dot, gated by the
// double-lock (act needs autoConstruct ON *and* #now; otherwise respond if
// liveResponse is ON). Encodes the gate ONCE, server-side, reusing the same
// parser the composer/chips use — so the dispatcher skill just executes the work.

type DispatchMode = "respond" | "act";

interface DispatchItem {
  commentId: string;
  url: string;
  agentId: string;
  agentName: string;
  mode: DispatchMode;
  text: string;
  skills: { slug: string; label: string; acts: boolean }[];
  createdAt: number;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url") ?? undefined;
  const settings = await getAgentSettings();
  const open = await listComments({ status: "open", url });

  const items: DispatchItem[] = [];
  for (const c of open) {
    // No self-loop: agent-authored pins (e.g. Germano's suggestions, which often
    // say "manda o @Claude fazer") never auto-trigger another agent. Only the
    // user's own directives dispatch.
    if (getReviewAgent(c.authorId)) continue;

    const replies = c.replies ?? [];

    // The user's natural flow is to describe the change in the pin and then FIRE
    // it with a "@Claude #now" REPLY — so the mention/directive usually lives in
    // a reply, not in c.text. Parse the whole USER stream (the body + every
    // user-authored reply) and merge: mentions/skills are the union, `act` is
    // true if any user message carries "#now". Agent replies are never command
    // sources (that would let agents drive each other).
    const userSources = [
      { text: c.text, at: c.createdAt },
      ...replies
        .filter((r) => r.authorKind === "user")
        .map((r) => ({ text: r.text, at: r.createdAt })),
    ];
    const latestUserAt = userSources.reduce((mx, u) => Math.max(mx, u.at), 0);

    const mentions: string[] = [];
    const skills: string[] = [];
    let act = false;
    for (const u of userSources) {
      const p = parseReviewCommand(u.text);
      if (p.act) act = true;
      for (const id of p.mentions) if (!mentions.includes(id)) mentions.push(id);
      for (const sk of p.skills) if (!skills.includes(sk)) skills.push(sk);
    }
    if (mentions.length === 0) continue;

    for (const agentId of mentions) {
      const agent = getReviewAgent(agentId);
      if (!agent) continue;
      const s = settings[agentId] ?? { liveResponse: false, autoConstruct: false };

      // Double gate.
      let mode: DispatchMode | null = null;
      if (act && s.autoConstruct) mode = "act";
      else if (s.liveResponse) mode = "respond";
      if (!mode) continue;

      // Idempotency, timeline-aware: the agent is "done" only if it has replied
      // AFTER the user's most recent message. This keeps it from re-running a
      // comment it already answered, while still re-opening the item when the
      // user follows up with a fresh "@Claude #now" reply (a re-prompt).
      const latestAgentReplyAt = replies
        .filter((r) => r.authorKind === "agent" && r.authorId === agentId)
        .reduce((mx, r) => Math.max(mx, r.createdAt), -Infinity);
      if (latestAgentReplyAt > latestUserAt) continue;

      items.push({
        commentId: c.id,
        url: c.url,
        agentId,
        agentName: agent.name,
        mode,
        text: c.text,
        skills: skills.map((slug) => {
          const sk = getReviewSkill(slug);
          return { slug, label: sk?.label ?? slug, acts: sk?.acts ?? false };
        }),
        createdAt: c.createdAt,
      });
    }
  }

  items.sort((a, b) => a.createdAt - b.createdAt); // FIFO — oldest first
  return NextResponse.json({ items, settings });
}
