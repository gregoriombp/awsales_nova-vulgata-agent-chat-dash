// ─────────────────────────────────────────────────────────────────────────
// Bombardier — Roadmap (bloco de ideias)
//
// NÃO é fonte da verdade nem planejamento oficial. São ideias soltas /
// "talvez faça" que podem virar trabalho ou ser ABANDONADAS. Agentes: não
// tratem isto como roadmap autoritativo e não decidam o que construir a
// partir daqui. O único uso esperado é PARQUEAR ideias (ex.: via /todo) —
// anexar um item no array `ROADMAP` abaixo, nada além disso.
// ─────────────────────────────────────────────────────────────────────────

export type RoadmapStatus = "idea" | "todo" | "in-progress" | "done" | "dropped"
export type RoadmapPriority = "low" | "medium" | "high"
export type RoadmapCategory =
  | "styleguide"
  | "icons"
  | "skills"
  | "tone-of-voice"
  | "infra"
  | "docs"

export type RoadmapItem = {
  /** Slug kebab-case estável. Serve de key e âncora. Nunca reusar. */
  id: string
  title: string
  /** Uma ou duas frases em pt-BR: o que é. */
  description: string
  status: RoadmapStatus
  priority: RoadmapPriority
  category: RoadmapCategory
  /** Tags livres opcionais pra agrupar/buscar depois. */
  tags?: string[]
  /** ISO `YYYY-MM-DD`. Timezone local — nunca parseado como UTC. */
  createdAt: string
  /** Anotação pessoal opcional. NÃO é instrução pra agente. */
  note?: string
}

export const ROADMAP: RoadmapItem[] = [
  {
    id: "audit-organize-styleguide",
    title: "Auditar e organizar o styleguide",
    description:
      "Tem componente duplicado e componente de controle repetido entre páginas; na hora de construir página nova o agente se confunde sobre qual usar.",
    status: "idea",
    priority: "high",
    category: "styleguide",
    createdAt: "2026-06-04",
    note:
      "Ideia: um doc/índice de onde cada componente mora (botões, tabelas, primitivos…) + categorias, pra acabar com a ambiguidade. Talvez atualizar as skills de criação de página depois.",
  },
  {
    id: "import-material-symbols-multi-size",
    title: "Mais ícones Material Symbols + múltiplos tamanhos",
    description:
      "Importar muito mais ícones do Material Symbols e disponibilizá-los em vários tamanhos, não só em um.",
    status: "idea",
    priority: "medium",
    category: "icons",
    createdAt: "2026-06-04",
    note:
      "O componente Icon já aceita size; falta ampliar o conjunto curado e documentar a escala de tamanhos na página de Iconografia.",
  },
  {
    id: "tone-of-voice-skill",
    title: "Skill de tom de voz da AwSales",
    description:
      "Criar uma skill que codifique o tom de voz da AwSales: sóbrio, enterprise, chique e tech — estilo Apple/ElevenLabs/Vercel, em pt-BR. Nada de startup.",
    status: "idea",
    priority: "low",
    category: "tone-of-voice",
    createdAt: "2026-06-04",
    note: "Saída: skill reutilizável pra orientar UX writing e copy de produto.",
  },
]
