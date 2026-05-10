/** Prototype-only persistence for the tools page. Mirrors the shape of
 *  integrationsStore. Holds three pieces of state:
 *    1. Native tools the user has explicitly disabled (default = all on).
 *    2. Custom integrations — user-defined HTTP connections (Gourmet
 *       API, internal services, etc.) that own credentials and base URL.
 *    3. Custom tools — individual actions that live inside a custom
 *       integration and inherit its credential.
 *
 *  Native and custom integrations share the same shape on the listing
 *  page (one card per integration, with tools inside) — this store
 *  models that. Replace with the backend store when the real API lands. */

import type { ToolKind } from "./toolsCatalog";

export type CustomToolMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type CustomAuthType = "none" | "bearer" | "basic" | "apiKey";

/** A user-defined connection to an HTTP service. Owns its credential and
 *  optionally a base URL; tools created under it inherit both. */
export interface CustomIntegration {
  /** Stable id assigned at creation time, prefixed with `custom-int.`. */
  id: string;
  name: string;
  /** Short nickname surfaced in lists when the team has multiple
   *  connections to the same brand (e.g. "Gourmet · Prod"). */
  alias?: string;
  /** Optional API root. When set, tools can use relative URLs. */
  baseUrl?: string;
  auth: CustomAuthType;
  /** Cosmetic mask of the saved credential — the prototype never stores
   *  the real token. Backend will encrypt + decrypt server-side. */
  tokenMasked?: string;
  /** Material Symbol name used as the integration's avatar in lists. */
  icon: string;
  /** Epoch ms. */
  addedAt: number;
}

export interface CustomTool {
  /** Stable id assigned at creation time. Custom ids are prefixed with
   *  `custom-tool.` so they never collide with the catalog ids. */
  id: string;
  /** Parent custom integration. Tools always belong to one. */
  customIntegrationId: string;
  name: string;
  /** Slug used as the immutable action key. Renaming the tool does not
   *  change this — it's how the agent references the action. */
  actionKey: string;
  description: string;
  method: CustomToolMethod;
  /** Endpoint path (relative to parent.baseUrl) or full URL. */
  url: string;
  kind: ToolKind;
  icon: string;
  /** JSON snippet shown in the test pane. */
  testInput?: string;
  /** Tool stays inactive (a "rascunho") until a successful test run.
   *  The prototype flips this client-side; backend will enforce. */
  active: boolean;
  /** Epoch ms. */
  addedAt: number;
}

const DISABLED_KEY = "awsales:tools:disabled";
const CUSTOM_KEY = "awsales:tools:custom";
const CUSTOM_INTEGRATIONS_KEY = "awsales:tools:custom-integrations";

export function loadDisabled(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DISABLED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function saveDisabled(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DISABLED_KEY, JSON.stringify(ids));
}

export function loadCustom(): CustomTool[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    /* Legacy migration: tools written before custom integrations existed
     * had no `customIntegrationId`. Re-home them under a synthesized
     * "Minhas tools" parent so they keep showing up in the list. */
    return (parsed as CustomTool[]).map((t) => ({
      ...t,
      customIntegrationId: t.customIntegrationId ?? "custom-int.legacy",
      actionKey: t.actionKey ?? slugify(t.name ?? t.id),
      active: t.active ?? true,
    }));
  } catch {
    return [];
  }
}

export function saveCustom(list: CustomTool[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
}

export function loadCustomIntegrations(): CustomIntegration[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_INTEGRATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CustomIntegration[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomIntegrations(list: CustomIntegration[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOM_INTEGRATIONS_KEY, JSON.stringify(list));
}

/** Synthesizes the legacy bucket on demand so any pre-migration tools
 *  still have a parent to render under. Callers merge this with
 *  `loadCustomIntegrations()` only when there are tools that need it. */
export function legacyCustomIntegration(): CustomIntegration {
  return {
    id: "custom-int.legacy",
    name: "Minhas tools",
    auth: "none",
    icon: "bolt",
    addedAt: 0,
  };
}

/** Lowercase, hyphenated, stripped of accents — matches the action key
 *  the prototype derives from a tool's display name. */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Hash an id into a stable "last run" label, mirroring the trick used
 *  on /integrations so the prototype feels alive across reloads. */
export function lastRunLabel(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  }
  const mins = (Math.abs(h) % 10080) + 1;
  if (mins < 60) return `${mins} min atrás`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h atrás`;
  return `${Math.round(mins / (60 * 24))} d atrás`;
}

/** Same hash trick to fake "agents using this tool" counts in the
 *  prototype. Bound to 0–4 so totals stay believable. */
export function agentsUsingCount(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 5;
}
