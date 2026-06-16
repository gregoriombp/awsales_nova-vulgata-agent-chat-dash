"use client";

import { AwMessengerPanel } from "@/components/integrations/AwMessengerPanel";
import { ApiTable, PageHero, PropRow, Section, Stage } from "../../_primitives";

export default function MessengerPanelPage() {
  return (
    <>
      <PageHero title="Messenger panel">
        Painel completo de configuração da integração Messenger — organizado em
        torno de Páginas do Facebook, cada uma com seu Page Access Token,
        assinaturas de webhook, saudação, ice breakers, menu persistente e a
        janela de 24h com o cliente. Espelha a estrutura do{" "}
        <code className="mono">AwWhatsAppPanel</code>, com abas para Visão geral
        / Páginas / Início da conversa / Conta &amp; permissões / API &amp;
        webhooks. Composto com AwTabs, AwAlert, AwCard, AwBrandLogo, AwPill,
        AwStatusDot, AwToggle, AwProgress e AwInput. Renderiza dentro do shell de{" "}
        <code className="mono">/canais/messenger</code>.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="default"
            title="Default"
            lead="Estado completo: duas Páginas conectadas, uma com pendência de token — abre na visão consolidada de todas as páginas."
          >
            <Stage label="Full panel" gridClassName="block">
              <div
                className="rounded-xl border border-(--border-subtle) bg-(--bg-canvas) overflow-hidden"
                style={{ height: 720 }}
              >
                <AwMessengerPanel />
              </div>
            </Stage>
          </Section>

          <Section id="api" title="API">
            <ApiTable>
              <PropRow
                prop="onAddPage"
                type="() => void"
                doc="Disparado pelo CTA de “Conectar nova Página” no seletor, no header e no empty-state."
              />
              <PropRow
                prop="onSave"
                type="() => void"
                doc="Footer · ação primária. Persistência fica a cargo do consumidor."
              />
              <PropRow
                prop="onCancel"
                type="() => void"
                doc="Footer · descarta alterações pendentes."
              />
            </ApiTable>
          </Section>
        </div>
      </div>
    </>
  );
}
