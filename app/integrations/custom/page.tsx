"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { AwAlert } from "@/components/ui/AwAlert";
import { AwButton } from "@/components/ui/AwButton";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwPill } from "@/components/ui/AwPill";
import { AwTabs } from "@/components/ui/AwTabs";
import { Icon } from "@/components/ui/Icon";

/* ----------------------------------------------------------------
 * Custom checkout integration — webhook contract reference page.
 *
 * Mirrors the schema documentation from
 * app.awsales.io/integrations/credentials/checkout/personalized/create
 * but rebuilt on Bombardier components and semantic tokens. Two-column
 * layout: identification + body schema on the left, live test command
 * (cURL / JavaScript / Python) on the right.
 * ---------------------------------------------------------------- */

const ENDPOINT_BASE = "https://app.awsales.io/api/webhooks";
const ORG_ID_PLACEHOLDER = "{sua-organization-id}";

type FieldType =
  | "string"
  | "datetime"
  | "enum"
  | "number"
  | "array"
  | "object";

interface SchemaField {
  /** Dot-path of the property as sent in the JSON body. */
  name: string;
  required?: boolean;
  type: FieldType;
  description: string;
  /** Enum values rendered as inline chips. */
  values?: string[];
  /** Optional rule callout — rendered as a soft inline alert. */
  warning?: string;
}

interface SchemaGroup {
  title: string;
  fields: SchemaField[];
}

const SCHEMA: SchemaGroup[] = [
  {
    title: "Dados do evento",
    fields: [
      {
        name: "created_at",
        required: true,
        type: "datetime",
        description:
          'Data e hora em que o evento foi criado. Envie no formato ISO 8601 em UTC 0, não no horário local. Exemplo correto: "2025-07-17T14:30:00Z" (o Z indica UTC zero).',
        warning:
          "Não utilize offsets de fuso horário como -03:00. Sempre envie em UTC 0 para garantir consistência no processamento.",
      },
      {
        name: "event",
        required: true,
        type: "enum",
        description:
          "Evento que disparou o webhook. Identifica a situação da transação.",
        values: [
          "PIX_GENERATED",
          "PIX_EXPIRED",
          "BANK_SLIP_GENERATED",
          "REFUNDED_PURCHASE",
          "REFUSED_PURCHASE",
          "CHARGED_BACK",
          "APPROVED_PURCHASE",
          "COMPLETED_PURCHASE",
        ],
      },
    ],
  },
  {
    title: "Usuário",
    fields: [
      {
        name: "user.name",
        required: true,
        type: "string",
        description: "Nome completo do comprador.",
      },
      {
        name: "user.email",
        required: true,
        type: "string",
        description: "E-mail de contato do comprador.",
      },
      {
        name: "user.phone",
        required: true,
        type: "string",
        description: "Telefone com DDI e DDD. Ex.: +5511999999999.",
      },
    ],
  },
  {
    title: "Produtor",
    fields: [
      {
        name: "producer.name",
        type: "string",
        description: "Nome do produtor responsável pela oferta.",
      },
    ],
  },
  {
    title: "Transação",
    fields: [
      {
        name: "transaction.id",
        required: true,
        type: "string",
        description: "Identificador único da transação no sistema de origem.",
      },
      {
        name: "transaction.type",
        required: true,
        type: "enum",
        description:
          "Tipo da transação. Ex: one_time (compra única) ou subscription (recorrência).",
        values: ["one_time", "subscription"],
      },
      {
        name: "transaction.status",
        required: true,
        type: "enum",
        description: "Status atual da transação.",
        values: [
          "WAITING_PAYMENT",
          "REFUSED",
          "REFUND_REQUESTED",
          "CANCELED",
          "CHARGEBACK",
          "COMPLETED",
          "APPROVED",
          "EXPIRED",
        ],
      },
      {
        name: "transaction.payment_method",
        required: true,
        type: "enum",
        description: "Meio de pagamento utilizado.",
        values: ["PIX", "BOLETO", "CREDIT_CARD"],
      },
      {
        name: "transaction.total_value",
        required: true,
        type: "number",
        description:
          "Valor bruto total da transação (soma dos itens). Decimal em unidade da moeda, ponto como separador, sempre duas casas. Ex.: 994.00.",
        warning:
          "Não use símbolos (R$), vírgula decimal (994,00) ou separador de milhar (1,000.00). Não envie em centavos (99400).",
      },
      {
        name: "transaction.fee",
        type: "number",
        description: "Total de taxas aplicadas. Se ausente, considera 0.00.",
      },
      {
        name: "transaction.net_value",
        type: "number",
        description:
          "Valor líquido após taxas. Se ausente, calculamos como total_value − fee.",
      },
      {
        name: "transaction.installments",
        type: "number",
        description:
          "Número de parcelas. Obrigatório quando payment_method = CREDIT_CARD.",
      },
      {
        name: "transaction.cycle",
        type: "number",
        description:
          "Ciclo da compra (1 = primeira cobrança, 2 = renovação). Padrão 1 se ausente.",
      },
      {
        name: "transaction.currency",
        type: "enum",
        description: "Moeda da transação. Padrão BRL se ausente.",
        values: ["BRL", "USD", "EUR"],
      },
    ],
  },
  {
    title: "Itens da transação",
    fields: [
      {
        name: "transaction.items[]",
        required: true,
        type: "array",
        description:
          "Lista de itens comprados. Deve manter consistência com os totais da transação.",
      },
      {
        name: "items[].product.id",
        required: true,
        type: "string",
        description: "ID único do produto.",
      },
      {
        name: "items[].product.name",
        required: true,
        type: "string",
        description: "Nome do produto.",
      },
      {
        name: "items[].product.price",
        required: true,
        type: "number",
        description:
          "Preço unitário bruto. Decimal, duas casas (ex.: 497.00).",
      },
      {
        name: "items[].product.offer.id",
        required: true,
        type: "string",
        description:
          "ID da oferta vinculada. Se não houver, mantenha um ID fixo para esse produto.",
      },
      {
        name: "items[].product.offer.name",
        required: true,
        type: "string",
        description:
          'Nome da oferta vinculada. Se não houver, recomendamos usar "Geral".',
      },
      {
        name: "items[].quantity",
        type: "number",
        description: "Quantidade do item. Se ausente, considera 1.",
      },
      {
        name: "items[].total_value",
        required: true,
        type: "number",
        description: "Valor bruto do item.",
      },
      {
        name: "items[].fee",
        type: "number",
        description: "Taxa aplicada ao item. Se ausente, consideramos 0.00.",
      },
      {
        name: "items[].net_value",
        type: "number",
        description:
          "Valor líquido do item. Se ausente, calculamos como total_value − fee.",
      },
    ],
  },
  {
    title: "Links de pagamento",
    fields: [
      {
        name: "payment_links.pix_url",
        type: "string",
        description: "Link para pagamento via Pix.",
      },
      {
        name: "payment_links.boleto_url",
        type: "string",
        description: "Link para boleto.",
      },
    ],
  },
  {
    title: "UTM (rastreamento de campanha)",
    fields: [
      {
        name: "utm.source",
        type: "string",
        description:
          'Para que a conversão apareça no dashboard, envie utm.source = "awsales".',
      },
      {
        name: "utm.campaign",
        type: "string",
        description: "ID ou nome da campanha.",
      },
      {
        name: "utm.medium",
        type: "string",
        description: "Meio da campanha (ex.: cpc, instagram).",
      },
      {
        name: "utm.content",
        type: "string",
        description: "Criativo ou variação do anúncio.",
      },
      {
        name: "utm.term",
        type: "string",
        description: "Palavra-chave (quando aplicável).",
      },
    ],
  },
  {
    title: "Metadados adicionais",
    fields: [
      {
        name: "metadata",
        type: "object",
        description:
          "Informações complementares no formato chave:valor. Use para IDs externos, dados de afiliados, notas internas — qualquer atributo relevante para o seu contexto de negócio.",
      },
    ],
  },
];

interface StatusCode {
  code: number;
  variant: "success" | "warning" | "danger";
  description: string;
}

const STATUS_CODES: StatusCode[] = [
  {
    code: 201,
    variant: "success",
    description: "Evento recebido e processado com sucesso.",
  },
  {
    code: 400,
    variant: "warning",
    description: "Requisição inválida — campos incorretos ou ausentes.",
  },
  {
    code: 500,
    variant: "danger",
    description: "Erro interno do servidor. Tente novamente.",
  },
];

/* ----------------------------------------------------------------
 * Code samples — keep the cURL example identical to the canonical
 * payload so the user can copy-paste against a real endpoint.
 * ---------------------------------------------------------------- */

const SAMPLE_PAYLOAD = `{
  "event": "APPROVED_PURCHASE",
  "created_at": "2025-07-17T14:30:00Z",
  "user": {
    "name": "João Silva",
    "email": "joao.silva@email.com",
    "phone": "+5511999999999"
  },
  "producer": { "name": "Agência Digital XYZ" },
  "transaction": {
    "id": "txn_00123456789",
    "type": "one_time",
    "status": "APPROVED",
    "payment_method": "CREDIT_CARD",
    "total_value": 497.00,
    "fee": 24.85,
    "net_value": 472.15,
    "installments": 1,
    "cycle": 1,
    "currency": "BRL",
    "items": [
      {
        "product": {
          "id": "prod_456",
          "name": "Curso de Marketing Digital",
          "price": 497.00,
          "offer": { "id": "offer_123", "name": "Lançamento Julho" }
        },
        "quantity": 1,
        "total_value": 497.00,
        "fee": 24.85,
        "net_value": 472.15
      }
    ]
  },
  "payment_links": { "pix_url": null, "boleto_url": null },
  "utm": {
    "source": "facebook",
    "campaign": "campanha-julho",
    "medium": "paid_social",
    "content": "anuncio_1",
    "term": "marketing"
  },
  "metadata": {
    "affiliate_id": "AFF_789",
    "campaign_internal_id": "CAMP_2025_001",
    "notes": "Cliente indicado por parceiro premium"
  }
}`;

function buildCurlSample(endpoint: string): string {
  return `curl --request POST \\
  --url '${endpoint}' \\
  --header 'Accept: application/json' \\
  --header 'Content-Type: application/json' \\
  --data '${SAMPLE_PAYLOAD}'`;
}

function buildJsSample(endpoint: string): string {
  return `await fetch("${endpoint}", {
  method: "POST",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
  body: JSON.stringify(${SAMPLE_PAYLOAD}),
});`;
}

function buildPythonSample(endpoint: string): string {
  return `import requests

requests.post(
    "${endpoint}",
    headers={
        "Accept": "application/json",
        "Content-Type": "application/json",
    },
    json=${SAMPLE_PAYLOAD},
)`;
}

/* ----------------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------------- */

/** URL-friendly slug of the integration name. Falls back to a token
 *  so the user always sees the real shape of the generated endpoint
 *  even before typing anything. */
function slugify(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "{nome-da-integracao}";
  return trimmed
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

function typeColor(t: FieldType): string {
  switch (t) {
    case "datetime":
      return "text-[var(--accent-brand)]";
    case "number":
      return "text-[var(--accent-success)]";
    case "enum":
      return "text-[var(--accent-warning)]";
    case "array":
    case "object":
      return "text-[var(--fg-secondary)]";
    case "string":
    default:
      return "text-[var(--fg-tertiary)]";
  }
}

/* ----------------------------------------------------------------
 * Subcomponents
 * ---------------------------------------------------------------- */

function CopyButton({ value, label = "Copiar" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard may be unavailable */
    }
  };
  return (
    <AwButton
      variant="secondary"
      size="sm"
      iconLeft={copied ? "check" : "content_copy"}
      onClick={handle}
    >
      {copied ? "Copiado" : label}
    </AwButton>
  );
}

function FieldRow({ field }: { field: SchemaField }) {
  return (
    <li className="flex flex-col gap-1.5 border-t border-[var(--border-subtle)] py-3.5 first:border-t-0">
      <div className="flex flex-wrap items-center gap-2">
        <code className="font-mono text-[13px] font-medium text-[var(--fg-primary)]">
          {field.name}
        </code>
        {field.required ? (
          <AwPill variant="error" dot={false}>
            obrigatório
          </AwPill>
        ) : (
          <AwPill variant="neutral" dot={false}>
            opcional
          </AwPill>
        )}
        <span
          className={
            "font-mono text-[11px] uppercase tracking-[0.04em] " +
            typeColor(field.type)
          }
        >
          {field.type}
        </span>
      </div>
      <p className="m-0 text-[13px] leading-[1.55] text-[var(--fg-secondary)]">
        {field.description}
      </p>
      {field.values && (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {field.values.map((v) => (
            <code
              key={v}
              className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--fg-secondary)]"
            >
              {v}
            </code>
          ))}
        </div>
      )}
      {field.warning && (
        <AwAlert variant="warning" className="mt-1.5">
          {field.warning}
        </AwAlert>
      )}
    </li>
  );
}

function SchemaGroupBlock({ group }: { group: SchemaGroup }) {
  return (
    <section aria-label={group.title} className="mt-7 first:mt-0">
      <h4 className="m-0 mb-2 text-[14px] font-semibold tracking-[-0.005em] text-[var(--fg-primary)]">
        {group.title}
      </h4>
      <ul className="m-0 list-none p-0">
        {group.fields.map((f) => (
          <FieldRow key={f.name} field={f} />
        ))}
      </ul>
    </section>
  );
}

function StatusCodeRow({ entry }: { entry: StatusCode }) {
  const tone =
    entry.variant === "success"
      ? "var(--accent-success)"
      : entry.variant === "warning"
        ? "var(--accent-warning)"
        : "var(--accent-danger)";
  return (
    <li className="flex items-start gap-3 border-t border-[var(--border-subtle)] py-3 first:border-t-0">
      <span
        className="mt-0.5 inline-flex min-w-[44px] justify-center rounded-md px-1.5 py-0.5 font-mono text-[12px] font-semibold"
        style={{
          color: tone,
          background: "color-mix(in oklab, " + tone + " 12%, transparent)",
        }}
      >
        {entry.code}
      </span>
      <span className="text-[13px] leading-[1.55] text-[var(--fg-secondary)]">
        {entry.description}
      </span>
    </li>
  );
}

function CodeBlock({ value }: { value: string }) {
  return (
    <div className="relative">
      <pre className="m-0 max-h-[520px] overflow-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 font-mono text-[12px] leading-[1.6] text-[var(--fg-secondary)]">
        <code>{value}</code>
      </pre>
      <div className="absolute right-3 top-3">
        <CopyButton value={value} />
      </div>
    </div>
  );
}

/* ================================================================
 * Page
 * ================================================================ */

export default function CustomCheckoutIntegrationPage() {
  const router = useRouter();
  const [name, setName] = useState("");

  const slug = slugify(name);
  const endpoint = `${ENDPOINT_BASE}/${ORG_ID_PLACEHOLDER}/credentials/${slug}`;

  const breadcrumbs = [
    {
      label: "Integrações",
      icon: <Icon name="extension" size={20} />,
      href: "/integrations",
    },
    { label: "Personalizada" },
  ];

  const [codeTab, setCodeTab] = useState("curl");

  const sample = useMemo(() => {
    if (codeTab === "javascript") return buildJsSample(endpoint);
    if (codeTab === "python") return buildPythonSample(endpoint);
    return buildCurlSample(endpoint);
  }, [codeTab, endpoint]);

  const charCount = name.length;
  const charLimit = 50;

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="-m-8 min-h-full bg-[var(--bg-canvas)]">
        <div className="w-full px-10 pt-10 pb-32">
          {/* Header */}
          <header className="mb-8 flex items-end justify-between gap-6 border-b border-[var(--border-subtle)] pb-6">
            <div>
              <h1 className="m-0 mb-1.5 flex items-center gap-2.5 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[var(--fg-primary)]">
                <Icon name="webhook" size={26} />
                Integração personalizada
              </h1>
              <p className="m-0 max-w-[640px] text-sm leading-[1.55] text-[var(--fg-secondary)]">
                Conecte qualquer checkout via webhook. Defina um nome único, gere
                o endpoint e envie eventos de transação no formato esperado pelo
                AwSales.
              </p>
            </div>
            <AwPill variant="beta" dot>
              Webhook
            </AwPill>
          </header>

          {/* Two-column layout: contract on the left, live test on the right.
              Right column is sticky on wide screens so the test command stays
              visible while the user scrolls through the schema reference. */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,440px)]">
            {/* ───── Left: identification + body schema + status codes ───── */}
            <div className="flex flex-col gap-6">
              {/* Identification card */}
              <section className="aw-card" aria-label="Identificação da integração">
                <header className="aw-card__header">
                  <div>
                    <h2 className="aw-card__title text-[16px]">
                      Identificação da integração
                    </h2>
                    <p className="aw-card__description">
                      Preencha o nome da sua integração para gerar um endpoint
                      personalizado. O nome deve ser único — não pode haver
                      outra integração com o mesmo nome no sistema.
                    </p>
                  </div>
                </header>
                <div className="aw-card__content flex flex-col gap-5">
                  <AwField
                    label="Nome da integração"
                    htmlFor="custom-integration-name"
                    helper={`${charCount}/${charLimit}`}
                  >
                    <AwInput
                      id="custom-integration-name"
                      placeholder="Digite o nome da integração"
                      maxLength={charLimit}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </AwField>

                  <AwField label="Endpoint" htmlFor="custom-integration-endpoint">
                    <div className="flex items-center gap-2">
                      <AwInput
                        id="custom-integration-endpoint"
                        readOnly
                        value={endpoint}
                        iconLeft="link"
                        aria-label="URL do endpoint"
                      />
                      <CopyButton value={endpoint} label="Copiar URL" />
                    </div>
                  </AwField>
                </div>
              </section>

              {/* Body schema */}
              <section
                className="aw-card"
                aria-label="Corpo da requisição"
              >
                <header className="aw-card__header">
                  <div>
                    <h2 className="aw-card__title text-[16px]">
                      Corpo da requisição
                    </h2>
                    <p className="aw-card__description">
                      Campos esperados no envio de transações. Os campos marcados
                      como obrigatórios precisam estar presentes em todo evento.
                    </p>
                  </div>
                </header>
                <div className="aw-card__content">
                  {SCHEMA.map((g) => (
                    <SchemaGroupBlock key={g.title} group={g} />
                  ))}
                </div>
              </section>

              {/* Status codes */}
              <section className="aw-card" aria-label="Status de resposta">
                <header className="aw-card__header">
                  <div>
                    <h2 className="aw-card__title text-[16px]">
                      Status de resposta
                    </h2>
                    <p className="aw-card__description">
                      Códigos retornados pelo AwSales no recebimento e
                      processamento de cada transação.
                    </p>
                  </div>
                </header>
                <div className="aw-card__content">
                  <ul className="m-0 list-none p-0">
                    {STATUS_CODES.map((s) => (
                      <StatusCodeRow key={s.code} entry={s} />
                    ))}
                  </ul>
                </div>
              </section>
            </div>

            {/* ───── Right: test command (sticky on lg+) ───── */}
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <section
                className="aw-card"
                aria-label="Exemplo de comando de teste"
              >
                <header className="aw-card__header">
                  <div>
                    <h2 className="aw-card__title text-[16px]">
                      Exemplo de comando de teste
                    </h2>
                    <p className="aw-card__description">
                      Inclui campos opcionais — recomendado para relatórios
                      detalhados. Substitua{" "}
                      <code className="font-mono text-[12px] text-[var(--fg-primary)]">
                        {ORG_ID_PLACEHOLDER}
                      </code>{" "}
                      pela ID da sua organização antes de testar.
                    </p>
                  </div>
                </header>
                <div className="aw-card__content">
                  <AwTabs
                    aria-label="Linguagem do exemplo"
                    items={[
                      { value: "curl", label: "cURL" },
                      { value: "javascript", label: "JavaScript" },
                      { value: "python", label: "Python" },
                    ]}
                    value={codeTab}
                    onChange={setCodeTab}
                  />
                  <div className="mt-4">
                    <CodeBlock value={sample} />
                  </div>
                </div>
              </section>
            </aside>
          </div>

          {/* Footer actions */}
          <footer className="mt-10 flex items-center justify-end gap-2 border-t border-[var(--border-subtle)] pt-6">
            <AwButton
              variant="secondary"
              size="md"
              onClick={() => router.push("/integrations")}
            >
              Cancelar
            </AwButton>
            <AwButton
              variant="primary"
              size="md"
              iconRight="arrow_forward"
              disabled={!name.trim()}
              onClick={() => router.push("/integrations")}
            >
              Concluir configuração
            </AwButton>
          </footer>
        </div>
      </div>
    </DashboardLayout>
  );
}
