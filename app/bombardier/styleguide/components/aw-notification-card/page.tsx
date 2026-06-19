"use client";

import { AwNotificationCard } from "@/components/ui/AwNotificationCard";
import type { AppNotification } from "@/lib/notifications";
import {
  ApiTable,
  CodeExample,
  PageHero,
  PropRow,
  Section,
  Spec,
  Stage,
  Tldr,
} from "../../_primitives";

const noop = () => {};

const FRESH: AppNotification = {
  id: "demo-fresh",
  kind: "team",
  title: "Marina Alves entrou no workspace",
  description: "O convite foi aceito e ela já faz parte do grupo Atendimento.",
  timeLabel: "há 6 horas",
  read: false,
  critical: false,
};

const CRITICAL: AppNotification = {
  id: "demo-critical",
  kind: "billing",
  title: "Falha na cobrança da fatura INV-2026-03-0987",
  description:
    "O boleto de R$ 5.268,49 venceu sem pagamento. Regularize para não suspender os serviços.",
  timeLabel: "há 1 hora",
  read: false,
  critical: true,
};

const READ: AppNotification = {
  id: "demo-read",
  kind: "agent",
  title: "Aria fechou 12 conversas no plantão de ontem",
  description:
    "Resumo do turno: 12 fechamentos, 3 reagendamentos, 1 escalada para humano.",
  timeLabel: "ontem",
  read: true,
  critical: false,
};

export default function AwNotificationCardPage() {
  return (
    <>
      <PageHero title="Notification card">
        Card individual do feed da página <strong>/notifications</strong>.
        Cada item é um botão clicável (o card inteiro) — sem chevron, sem
        ação secundária. O tom da superfície codifica o estado:{" "}
        <strong>crítica não lida</strong> em vermelho,{" "}
        <strong>não lida</strong> em azul claro e <strong>lida</strong> em
        superfície neutra.
      </PageHero>

      <div className="mx-auto max-w-[1200px] px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Tldr
            use={[
              <>Feed da página /notifications (uma linha por item).</>,
              <>Listas verticais onde cada item abre um detalhe.</>,
            ]}
            dontUse={[
              <>
                Painel do sino (use <code className="mono">AwNotificationsPanel</code> +{" "}
                <code className="mono">NotificationRow</code>, que são mais
                densos).
              </>,
              <>Toasts ou banners (são outro padrão; use AwAlert/AwToast).</>,
            ]}
          />

          <Section
            id="states"
            title="Estados"
            lead="Três tons que comunicam urgência e leitura. Crítica não lida é a única que ganha vermelho — quando lida, volta pra superfície neutra."
          >
            <Stage label="Os três tons, lado a lado">
              <div className="flex w-full max-w-[720px] flex-col gap-2.5">
                <AwNotificationCard notification={CRITICAL} onActivate={noop} />
                <AwNotificationCard notification={FRESH} onActivate={noop} />
                <AwNotificationCard notification={READ} onActivate={noop} />
              </div>
            </Stage>
            <CodeExample>
              {`<AwNotificationCard notification={critical} onActivate={open} />
<AwNotificationCard notification={fresh} onActivate={open} />
<AwNotificationCard notification={read} onActivate={open} />`}
            </CodeExample>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="Ícone da categoria à esquerda (com dot de não lida quando aplicável), título + pill 'Crítica' opcional + timestamp à direita, descrição na linha de baixo (line-clamp 2)."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Spec
                k="Categoria"
                v="billing | agent | team | security | system"
                d="Define o ícone (Material Symbols) sobre fundo neutro."
              />
              <Spec
                k="Dot de não lida"
                v="canto superior direito do ícone"
                d="Aparece quando !notification.read; vermelho em crítica, azul senão."
              />
              <Spec
                k="Pill 'Crítica'"
                v="ao lado do título"
                d="Aparece quando notification.critical=true, mesmo se já foi lida."
              />
            </div>
          </Section>

          <Section
            id="api"
            title="API"
            lead="Props mínimas — uma AppNotification e o handler de ativação."
          >
            <ApiTable>
              <PropRow
                prop="notification"
                type="AppNotification"
                doc="O item a renderizar. Define ícone, título, descrição, timestamp, read e critical."
              />
              <PropRow
                prop="onActivate"
                type="(n: AppNotification) => void"
                doc="Callback ao clicar — normalmente abre o modal de detalhe e marca como lida."
              />
              <PropRow
                prop="index"
                type="number"
                def="0"
                doc="Posição no feed — usado pra escalonar a animação de entrada (40ms × index, máx 8)."
              />
              <PropRow
                prop="className"
                type="string"
                doc="Classes extras aplicadas ao botão raiz."
              />
            </ApiTable>
          </Section>
        </div>
      </div>
    </>
  );
}
