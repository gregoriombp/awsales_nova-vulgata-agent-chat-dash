"use client";

import { useRouter } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import DashboardLayout from "@/components/DashboardLayout";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import { useToast } from "@/components/ui/AwToast";
import { Icon } from "@/components/ui/Icon";
import { addInstance, loadInstances } from "@/lib/integrationsStore";

const PREREQUISITES = [
  {
    id: "business",
    title: "Conta Business no Facebook (Meta)",
    description:
      "Você precisa ter uma conta empresarial no Facebook. Se ainda não tiver, criamos junto durante a conexão.",
    helpLabel: "O que é uma conta Business?",
  },
  {
    id: "phone",
    title: "Número de telefone disponível",
    description:
      "Um número que possa receber SMS ou ligação para verificação. Não pode estar em uso em outro WhatsApp Business.",
    helpLabel: "Que tipos de número são aceitos?",
  },
  {
    id: "admin",
    title: "Acesso de administrador da empresa",
    description:
      "Você precisa ser admin do Business Manager da Meta. Outros usuários da AwSales podem assumir depois.",
    helpLabel: "Como verifico minhas permissões?",
  },
  {
    id: "popups",
    title: "Pop-ups habilitados neste navegador",
    description:
      "A Meta abre uma janela de login. Se o navegador bloquear pop-ups, vamos te avisar antes.",
    helpLabel: "Como permitir pop-ups?",
  },
] as const;

const META_LOGIN_STEPS: { num: number; head: string; tail: string }[] = [
  { num: 1, head: "Entrar com seu Facebook", tail: " ligado ao Business Manager" },
  { num: 2, head: "Selecionar ou criar a Conta WhatsApp Business", tail: " (WABA)" },
  { num: 3, head: "Verificar o número", tail: " por SMS ou ligação" },
  { num: 4, head: "Autorizar a AwSales", tail: " a enviar mensagens em seu nome" },
];

function PrereqRow({
  title,
  description,
  helpLabel,
}: {
  title: string;
  description: string;
  helpLabel: string;
}) {
  return (
    <div className="flex items-start gap-3.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-4 py-3.5">
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--bg-surface)] text-[var(--fg-secondary)]"
      >
        <Icon name="check" size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="body-sm font-medium text-[var(--fg-primary)]">
          {title}
        </div>
        <p className="m-0 mt-1 body-xs text-[var(--fg-secondary)]">
          {description}
        </p>
      </div>
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="mt-0.5 inline-flex flex-shrink-0 items-center gap-1 body-xs font-medium text-[var(--accent-fg)] hover:underline"
      >
        {helpLabel}
        <Icon name="north_east" size={14} />
      </a>
    </div>
  );
}

function NumberedItem({
  num,
  head,
  tail,
}: {
  num: number;
  head: string;
  tail: string;
}) {
  return (
    <li className="flex items-start gap-3.5">
      <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--fg-primary)] body-xs font-medium text-white">
        {num}
      </span>
      <p className="m-0 body-sm text-[var(--fg-primary)]">
        <strong className="font-medium">{head}</strong>
        <span className="font-normal text-[var(--fg-secondary)]">{tail}</span>
      </p>
    </li>
  );
}

export default function WhatsAppSetupPage() {
  const router = useRouter();
  const { push: pushToast } = useToast();

  const exitSetup = () => router.push("/canais");

  /** Persist the new WhatsApp WABA, fire a success toast with a "Criar
   *  template" action that deep-links into the panel's template builder,
   *  and land the user on the channel page. We name the WABA "WhatsApp N"
   *  where N is the next sequence so multiple WABAs don't collide. */
  const finishSetup = () => {
    const existing = loadInstances().filter(
      (i) => i.integrationId === "whatsapp",
    );
    const name = existing.length === 0 ? "WhatsApp" : `WhatsApp ${existing.length + 1}`;
    addInstance("whatsapp", name);
    pushToast({
      variant: "success",
      title: "WhatsApp conectado",
      description:
        "Seu canal está pronto. Crie seu primeiro template pra começar a conversar.",
      action: {
        label: "Criar template",
        onClick: () => router.push("/canais/whatsapp?new-template=1"),
      },
      duration: 10000,
    });
    router.push("/canais/whatsapp");
  };

  const breadcrumbs = [
    { label: "Canais", href: "/canais", icon: <Icon name="forum" size={20} /> },
    { label: "WhatsApp", href: "/canais/whatsapp" },
    { label: "Conectar nova conta" },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="-m-8 flex min-h-full flex-col bg-[var(--bg-canvas)]">
        <header className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-10 py-6">
          <div className="flex items-center gap-3.5">
            <AwBrandLogo brand="whatsapp" size="lg" />
            <div>
              <h5 className="m-0 text-[var(--fg-primary)]">
                Conectar WhatsApp
              </h5>
              <p className="m-0 mt-0.5 body-xs text-[var(--fg-secondary)]">
                Configure seu canal oficial em até 5 minutos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={exitSetup}
            className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1.5 body-xs text-[var(--fg-secondary)] transition-colors hover:bg-[var(--bg-surface)] hover:text-[var(--fg-primary)]"
          >
            <Icon name="close" size={16} />
            Sair do setup
          </button>
        </header>

        <main className="flex-1 px-10 py-10 pb-32">
          <section className="mx-auto w-full max-w-[640px] rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-10 py-12">
            <div className="flex justify-center">
              <div
                aria-hidden="true"
                className="flex h-[112px] w-[112px] items-center justify-center rounded-full bg-aw-blue-150"
              >
                <Icon
                  name="hub"
                  size={52}
                  className="text-aw-blue-700"
                  fill={1}
                />
              </div>
            </div>

            <h4 className="m-0 mt-6 text-center text-[var(--fg-primary)]">
              Conectar com a Meta Business
            </h4>
            <p className="m-0 mx-auto mt-2 max-w-[460px] text-center body-sm text-[var(--fg-secondary)]">
              Vamos abrir o login oficial da Meta em uma nova janela. Lá
              você vai:
            </p>

            <ol className="m-0 mt-7 flex list-none flex-col gap-4 p-0">
              {META_LOGIN_STEPS.map((s) => (
                <NumberedItem
                  key={s.num}
                  num={s.num}
                  head={s.head}
                  tail={s.tail}
                />
              ))}
            </ol>

            <Collapsible className="group mt-7 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
              <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-md)] px-4 py-3 text-left body-xs font-medium text-[var(--fg-primary)] transition-colors hover:bg-[var(--bg-surface)]">
                <span className="flex items-center gap-2">
                  <Icon
                    name="checklist"
                    size={16}
                    className="text-[var(--fg-secondary)]"
                  />
                  Antes de continuar — 4 itens rápidos
                </span>
                <Icon
                  name="expand_more"
                  size={18}
                  className="text-[var(--fg-tertiary)] transition-transform group-data-[state=open]:rotate-180"
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="border-t border-[var(--border-subtle)] px-4 py-4">
                <div className="flex flex-col gap-3">
                  {PREREQUISITES.map((p) => (
                    <PrereqRow
                      key={p.id}
                      title={p.title}
                      description={p.description}
                      helpLabel={p.helpLabel}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-2 border-t border-[var(--border-subtle)] pt-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--aw-emerald-50,#E6F9EE)] px-2.5 py-1 body-xs font-medium text-[var(--aw-emerald-700)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--aw-emerald-700)]" />
                Conexão criptografada · OAuth 2.0
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-2.5 py-1 body-xs font-medium text-[var(--fg-secondary)]">
                <Icon name="lock" size={12} />
                Token guardado em cofre
              </span>
            </div>
          </section>
        </main>

        <footer className="sticky bottom-0 flex items-center justify-between gap-4 border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-10 py-4">
          <div className="body-xs text-[var(--fg-secondary)]">
            Precisa de ajuda?{" "}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="font-medium text-[var(--accent-fg)] hover:underline"
            >
              Falar com suporte
            </a>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <AwButton
              variant="primary"
              size="md"
              iconRight="open_in_new"
              onClick={finishSetup}
            >
              Conectar com a Meta
            </AwButton>
          </div>
        </footer>
      </div>
    </DashboardLayout>
  );
}
