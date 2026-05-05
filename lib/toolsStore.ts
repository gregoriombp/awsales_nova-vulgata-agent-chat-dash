/** Prototype-only persistence for the tools page. Mirrors the shape of
 *  integrationsStore. Holds two pieces of state:
 *    1. Native tools the user has explicitly disabled (default = all on).
 *    2. Custom (user-defined) tools — HTTP webhook style.
 *  Replace with the backend store when the real API lands. */

import type { ToolKind } from "./toolsCatalog";

export type CustomToolMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface CustomTool {
  /** Stable id assigned at creation time. Custom ids are prefixed with
   *  `custom.` so they never collide with the catalog ids. */
  id: string;
  name: string;
  description: string;
  method: CustomToolMethod;
  url: string;
  kind: ToolKind;
  icon: string;
  /** Bearer/Basic/None — purely cosmetic in the prototype. */
  auth: "none" | "bearer" | "basic" | "apiKey";
  /** Epoch ms. */
  addedAt: number;
}

const DISABLED_KEY = "awsales:tools:disabled";
const CUSTOM_KEY = "awsales:tools:custom";

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
    return Array.isArray(parsed) ? (parsed as CustomTool[]) : [];
  } catch {
    return [];
  }
}

export function saveCustom(list: CustomTool[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
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
