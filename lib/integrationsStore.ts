/** Prototype-only persistence for the integrations screen. Lives in
 *  localStorage so a connect flow that ends on a different route (the
 *  WhatsApp wizard, for example) can still mutate the list the
 *  integrations page renders. Replace with the backend store when the
 *  real API lands. */

export interface IntegrationInstance {
  instanceId: string;
  integrationId: string;
  name: string;
  active: boolean;
  /** Set when the connection is broken/expired/etc. and the user
   *  needs to re-authorize or fix the binding. UI surfaces this as a
   *  warning state separate from "disabled". */
  needsAttention?: boolean;
  /** Short error description shown as a tooltip on the attention pill
   *  (e.g. "Token expirou", "Webhook retornou 401"). */
  attentionReason?: string;
  /** Epoch ms the instance was created. Optional so legacy instances
   *  written before this field landed still parse; the list view falls
   *  back to deriving the timestamp from `instanceId` for those. */
  addedAt?: number;
}

const INSTANCES_KEY = "awsales:integrations:instances";
const EVER_KEY = "awsales:integrations:hasEverConnected";

export function loadInstances(): IntegrationInstance[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(INSTANCES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as IntegrationInstance[]) : [];
  } catch {
    return [];
  }
}

export function saveInstances(list: IntegrationInstance[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INSTANCES_KEY, JSON.stringify(list));
}

export function loadHasEverConnected(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(EVER_KEY) === "1";
}

export function saveHasEverConnected(value: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(EVER_KEY, value ? "1" : "0");
}

/** Append an instance and flip the ever-connected flag. Returns the
 *  created instance so the caller can navigate or toast against it. */
export function addInstance(
  integrationId: string,
  name: string,
): IntegrationInstance {
  const now = Date.now();
  const instance: IntegrationInstance = {
    instanceId: `${integrationId}-${now}`,
    integrationId,
    name,
    active: true,
    addedAt: now,
  };
  const next = [...loadInstances(), instance];
  saveInstances(next);
  saveHasEverConnected(true);
  return instance;
}
