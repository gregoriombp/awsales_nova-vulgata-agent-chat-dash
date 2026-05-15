"use client";

import { AwWhatsAppPanel } from "@/components/integrations/AwWhatsAppPanel";
import { ApiTable, PageHero, PropRow, Section, Stage } from "../../_primitives";

export default function WhatsAppPanelPage() {
  return (
    <>
      <PageHero title="WhatsApp panel">
        Painel completo de configuração da integração WhatsApp Business —
        assume múltiplas WABAs por conta, abas para Visão geral / Números /
        Templates / Variáveis / Conta & permissões / API. Composto com
        AwTabs, AwAlert, AwCard, AwBrandLogo, AwPill, AwStatusDot, AwToggle,
        AwProgress, AwInput e AwTable. Renderiza dentro do shell de{" "}
        <code className="mono">/integrations</code> quando a integração ativa é
        WhatsApp.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="default"
            title="Default"
            lead="Estado completo: WABA verificada, pagamento ativo, números conectados, templates aprovados — abre na aba Visão geral."
          >
            <Stage label="Full panel" gridClassName="block">
              <div
                className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] overflow-hidden"
                style={{ height: 720 }}
              >
                <AwWhatsAppPanel />
              </div>
            </Stage>
          </Section>

          <Section
            id="empty"
            title="Sem WABAs conectadas"
            lead="Antes da primeira conexão — o painel cai num empty-state com CTA para iniciar o wizard."
          >
            <Stage label="Empty state" gridClassName="block">
              <div
                className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] overflow-hidden"
                style={{ height: 480 }}
              >
                <AwWhatsAppPanel wabas={[]} />
              </div>
            </Stage>
          </Section>

          <Section id="api" title="API">
            <ApiTable>
              <PropRow
                prop="wabas"
                type="Waba[]"
                def="SAMPLE_WABAS"
                doc="Lista de WABAs conectadas. Vazia mostra empty-state com CTA de conexão."
              />
              <PropRow
                prop="onAddWaba"
                type="() => void"
                doc="Disparado pelo CTA de “Conectar nova WABA” no seletor e no empty-state."
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
