// Curated registry of the agent skills a reviewer can reference inline with "/"
// in a Review Bridge comment. Single source of truth for the "/" autocomplete
// menu AND documentation of which skills each agent (see ./agents) may run.
//
// Intentionally a small, hand-picked subset of `.claude/skills/bombardier-*` —
// only the ones meaningful as a *live command* inside a comment. The full skill
// catalog lives on disk; this list is the product-facing surface.

export type ReviewSkillSlug =
  | "bombardier-review-bridge-solve"
  | "bombardier-ux-writing"
  | "bombardier-edit-bridge-solve"
  | "bombardier-review-bridge-germano-explore"
  | "bombardier-review-bridge-germano-audit"

export interface ReviewSkill {
  /** Exact skill name under `.claude/skills` — what "/" inserts into the text. */
  slug: ReviewSkillSlug
  /** Short human label for the picker row. */
  label: string
  /** Material Symbol glyph. */
  icon: string
  /** One-liner shown as the picker blurb. */
  blurb: string
  /** Agent that owns/runs this skill (see ./agents), or null if generic. */
  ownerId: "claude" | "germano" | null
  /** True when running it mutates the prototype (gated behind #now + Auto Construct). */
  acts: boolean
}

export const REVIEW_SKILLS: readonly ReviewSkill[] = [
  {
    slug: "bombardier-review-bridge-solve",
    label: "Resolver comentários",
    icon: "checklist",
    blurb: "Lê os comentários da página e implementa as correções, deixando cada um em revisão.",
    ownerId: "claude",
    acts: true,
  },
  {
    slug: "bombardier-ux-writing",
    label: "UX Writing",
    icon: "edit_note",
    blurb: "Revisa o texto da interface contra a voz do produto e aplica as reescritas.",
    ownerId: "claude",
    acts: true,
  },
  {
    slug: "bombardier-edit-bridge-solve",
    label: "Materializar edições",
    icon: "handyman",
    blurb: "Transforma as edições do Live Edit Mode em código real.",
    ownerId: "claude",
    acts: true,
  },
  {
    slug: "bombardier-review-bridge-germano-explore",
    label: "Germano · Explorar",
    icon: "travel_explore",
    blurb: "Patrulha a página, testa estados e pina sugestões de UI/UX.",
    ownerId: "germano",
    acts: true,
  },
  {
    slug: "bombardier-review-bridge-germano-audit",
    label: "Germano · Auditar revisão",
    icon: "rule",
    blurb: "Dá uma segunda opinião nos itens que já estão em revisão.",
    ownerId: "germano",
    acts: true,
  },
]

const BY_SLUG = new Map<string, ReviewSkill>(REVIEW_SKILLS.map((s) => [s.slug, s]))

export function getReviewSkill(slug: string): ReviewSkill | undefined {
  return BY_SLUG.get(slug)
}

export function isReviewSkillSlug(slug: string): slug is ReviewSkillSlug {
  return BY_SLUG.has(slug)
}
