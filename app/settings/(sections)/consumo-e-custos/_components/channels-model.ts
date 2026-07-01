import type { AwChannelId } from "@/components/ui/AwChannelIcon";

/* ----------------------------------------------------------------------------
 * Canal como dimensão de gasto (pedido do Greg, cmt-f014416f + Notion).
 *
 * Os canais são os já mockados no sistema (AwChannelId): WhatsApp, Instagram e
 * Messenger. Cada categoria de serviço tem uma fração do gasto por canal
 * (somam 1) — WhatsApp domina, como no produto real. Telefone/Outros não são
 * canal-dependentes e ficam fora do fator.
 *
 * Paleta própria por token, SEM azul/roxo (semântica reservada de pagador):
 * emerald = WhatsApp, pink = Instagram, teal = Messenger.
 * ------------------------------------------------------------------------- */

export type SpendChannel = Extract<AwChannelId, "whatsapp" | "instagram" | "messenger">;

export const SPEND_CHANNELS: { id: SpendChannel; label: string; colorVar: string }[] = [
  { id: "whatsapp", label: "WhatsApp", colorVar: "var(--aw-emerald-500)" },
  { id: "instagram", label: "Instagram", colorVar: "var(--aw-pink-500)" },
  { id: "messenger", label: "Messenger", colorVar: "var(--aw-teal-500)" },
];

export const ALL_CHANNELS: SpendChannel[] = SPEND_CHANNELS.map((c) => c.id);

/** Fração do gasto de cada CATEGORIA do gráfico por canal (somam 1). */
const CATEGORY_CHANNEL_SPLIT: Record<string, Record<SpendChannel, number>> = {
  "disparos-mkt": { whatsapp: 0.78, instagram: 0.14, messenger: 0.08 },
  "disparos-util": { whatsapp: 0.84, instagram: 0.1, messenger: 0.06 },
  mensagens: { whatsapp: 0.7, instagram: 0.19, messenger: 0.11 },
  leads: { whatsapp: 0.66, instagram: 0.24, messenger: 0.1 },
  tokens: { whatsapp: 0.72, instagram: 0.17, messenger: 0.11 },
};

const DEFAULT_SPLIT: Record<SpendChannel, number> = {
  whatsapp: 0.72,
  instagram: 0.17,
  messenger: 0.11,
};

/** Linhas do detalhamento → categoria com split (mesmo mapa do explorer). */
const ROW_TO_CATEGORY: Record<string, string> = {
  "disp-mkt": "disparos-mkt",
  "disp-util": "disparos-util",
  msgs: "mensagens",
  leads: "leads",
  "tok-k": "tokens",
  "tok-b": "tokens",
  "tok-s": "tokens",
};

/** Jitter determinístico por agente (±6%) sobre o split default — cada agente
 *  tem um perfil de canal levemente próprio, estável entre renders. */
function agentSplit(agentId: string): Record<SpendChannel, number> {
  let h = 0;
  for (let i = 0; i < agentId.length; i++) h = (h * 31 + agentId.charCodeAt(i)) % 1000;
  const tilt = (h / 1000 - 0.5) * 0.12; // −0.06 .. +0.06
  const whatsapp = Math.min(0.9, Math.max(0.5, DEFAULT_SPLIT.whatsapp + tilt));
  const rest = 1 - whatsapp;
  const igShare = DEFAULT_SPLIT.instagram / (DEFAULT_SPLIT.instagram + DEFAULT_SPLIT.messenger);
  return {
    whatsapp,
    instagram: rest * igShare,
    messenger: rest * (1 - igShare),
  };
}

function shareOf(split: Record<SpendChannel, number>, channels: Set<SpendChannel>): number {
  let s = 0;
  channels.forEach((c) => {
    s += split[c] ?? 0;
  });
  return Math.min(1, s);
}

/** Fator (0..1) aplicado ao TOTAL de uma linha do detalhamento quando o filtro
 *  de canal está ativo. Linhas sem categoria de canal (telefone, outros) não
 *  são canal-dependentes → fator 1. */
export function rowChannelFactor(rowId: string, channels: Set<SpendChannel>): number {
  if (channels.size >= ALL_CHANNELS.length) return 1;
  const cat = ROW_TO_CATEGORY[rowId];
  if (!cat) return 1;
  return shareOf(CATEGORY_CHANNEL_SPLIT[cat] ?? DEFAULT_SPLIT, channels);
}

/** Fator por AGENTE (lente Agente) — perfil de canal próprio e estável. */
export function agentChannelFactor(agentId: string, channels: Set<SpendChannel>): number {
  if (channels.size >= ALL_CHANNELS.length) return 1;
  return shareOf(agentSplit(agentId), channels);
}

/** Quebra um conjunto de totais por categoria em totais POR CANAL — alimenta o
 *  widget "Gasto por canal". Categorias sem split entram no perfil default. */
export function channelBreakdown(
  catTotals: { id: string; total: number }[],
): { id: SpendChannel; label: string; colorVar: string; total: number; share: number }[] {
  const sums: Record<SpendChannel, number> = { whatsapp: 0, instagram: 0, messenger: 0 };
  catTotals.forEach(({ id, total }) => {
    const split = CATEGORY_CHANNEL_SPLIT[id] ?? DEFAULT_SPLIT;
    ALL_CHANNELS.forEach((c) => {
      sums[c] += total * (split[c] ?? 0);
    });
  });
  const grand = ALL_CHANNELS.reduce((s, c) => s + sums[c], 0) || 1;
  return SPEND_CHANNELS.map((c) => ({
    ...c,
    total: Math.round(sums[c.id] * 100) / 100,
    share: (sums[c.id] / grand) * 100,
  }));
}
