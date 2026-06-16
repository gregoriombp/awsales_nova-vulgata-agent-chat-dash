"use client";

import { AwInstagramPanel } from "@/components/integrations/AwInstagramPanel";
import { ApiTable, PageHero, PropRow, Section, Stage } from "../../_primitives";

export default function InstagramPanelPage() {
  return (
    <>
      <PageHero title="Instagram panel">
        Painel completo de configuração da integração Instagram — organizado em
        torno de contas Comerciais e de Criador vinculadas a uma Página do
        Facebook. Mesma janela de 24h do Messenger, com superfícies extras: DMs,
        respostas e menções em stories, comentários em posts e reels. Abas para
        Visão geral / Contas / DMs / Stories &amp; comentários / Conta &amp;
        permissões / API &amp; webhooks. Composto com AwTabs, AwAlert, AwCard,
        AwBrandLogo, AwPill, AwStatusDot, AwToggle, AwProgress e AwInput.
        Renderiza dentro do shell de{" "}
        <code className="mono">/canais/instagram</code>.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="default"
            title="Default"
            lead="Estado completo: uma conta Comercial e uma de Criador, com diferenças de capacidade da API (a de Criador tem acesso limitado a comentários) — abre na visão consolidada."
          >
            <Stage label="Full panel" gridClassName="block">
              <div
                className="rounded-xl border border-(--border-subtle) bg-(--bg-canvas) overflow-hidden"
                style={{ height: 720 }}
              >
                <AwInstagramPanel />
              </div>
            </Stage>
          </Section>

          <Section id="api" title="API">
            <ApiTable>
              <PropRow
                prop="onAddAccount"
                type="() => void"
                doc="Disparado pelo CTA de “Conectar nova conta” no seletor, no header e no empty-state."
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
