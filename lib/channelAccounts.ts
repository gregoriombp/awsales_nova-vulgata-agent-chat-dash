/** Per-channel sub-account data shown as children on /canais.
 *
 *  Each row on the /canais accordion is one of these — a WABA in
 *  WhatsApp's case, an Instagram business account, a Messenger page,
 *  etc. The /canais page reads from here so the children mirror what
 *  the user actually sees inside each channel's detail surface (e.g.
 *  the WABA rail in the WhatsApp panel).
 *
 *  Prototype only: this is hardcoded sample data, mirroring
 *  components/integrations/AwWhatsAppPanel.tsx → SAMPLE_WABAS. When the
 *  backend lands, replace with a fetch hook keyed by channelId. */

export type ChannelAccountStatus = "active" | "disabled" | "attention";

export interface ChannelAccount {
  id: string;
  channelId: string;
  name: string;
  subtitle?: string;
  status: ChannelAccountStatus;
  /** Override the default status pill text — e.g. "Pagamento pendente"
   *  for an attention account that has a more specific reason to flag. */
  statusLabel?: string;
}

const ACCOUNTS: ChannelAccount[] = [
  // WhatsApp WABAs — must stay in sync with AwWhatsAppPanel SAMPLE_WABAS.
  {
    id: "waba-marina",
    channelId: "whatsapp",
    name: "Marina Cosméticos",
    subtitle: "Marina Costa · 2 números",
    status: "active",
  },
  {
    id: "waba-eng",
    channelId: "whatsapp",
    name: "AwSales-Tech-Test",
    subtitle: "Time Eng · 1 número",
    status: "attention",
    statusLabel: "Pagamento pendente",
  },
  // Instagram
  {
    id: "ig-marina",
    channelId: "instagram",
    name: "@marinacosmeticos",
    subtitle: "12,4 mil seguidores · DM ativa",
    status: "active",
  },
  // Messenger
  {
    id: "msgr-marina",
    channelId: "messenger",
    name: "Marina Cosméticos",
    subtitle: "Página oficial · 8,2 mil curtidas",
    status: "disabled",
  },
];

export function getChannelAccounts(channelId: string): ChannelAccount[] {
  return ACCOUNTS.filter((a) => a.channelId === channelId);
}
