"use client"

import * as React from "react"
import { AwButton } from "@/components/ui/AwButton"
import { AwWelcomeModal } from "@/components/ui/AwWelcomeModal"

type DemoKey = "default" | "compact" | "non-dismissible"

const IMAGE = "/assets/group-backgrounds/group-bg-17.jpg"
const IMAGE_ALT_LIGHT = "/assets/group-backgrounds/group-bg-04.jpg"

export function WelcomeModalDemo() {
  const [openKey, setOpenKey] = React.useState<DemoKey | null>(null)
  const close = () => setOpenKey(null)

  return (
    <div className="flex flex-wrap gap-3">
      <AwButton variant="primary" onClick={() => setOpenKey("default")}>
        Boas-vindas (3 ações)
      </AwButton>
      <AwButton variant="secondary" onClick={() => setOpenKey("compact")}>
        2 ações + footnote
      </AwButton>
      <AwButton variant="ghost" onClick={() => setOpenKey("non-dismissible")}>
        Não-dismissible
      </AwButton>

      <AwWelcomeModal
        open={openKey === "default"}
        onClose={close}
        imageSrc={IMAGE}
        imageAlt="Capa da Artificial Concord"
        eyebrow="Bem-vindo à AwSales"
        title={
          <>
            Tudo certo, Greg.
            <br />A Artificial Concord está no ar.
          </>
        }
        description="Por onde quer começar? Você pode pular e explorar a plataforma à vontade — esses passos continuam aqui pra quando quiser voltar."
        actions={[
          {
            id: "invite",
            label: "Convidar minha equipe",
            description: "Comece pelo passo nº 1 da ativação.",
            icon: "person_add",
            primary: true,
            onClick: close,
          },
          {
            id: "tour",
            label: "Fazer um tour de 60s",
            description: "Veja a plataforma rodando em menos de um minuto.",
            icon: "play_arrow",
            comingSoon: true,
            onClick: close,
          },
          {
            id: "explore",
            label: "Explorar por conta própria",
            description: "Vou direto pra plataforma — sem pressa.",
            icon: "arrow_forward",
            onClick: close,
          },
        ]}
      />

      <AwWelcomeModal
        open={openKey === "compact"}
        onClose={close}
        imageSrc={IMAGE_ALT_LIGHT}
        imageAlt="Capa clara"
        title="Sua Memory Base está pronta"
        description="Subimos automaticamente os documentos do seu site. Você pode revisar agora ou deixar pra depois."
        actions={[
          {
            id: "review",
            label: "Revisar Memory Base",
            description: "Veja o que foi indexado.",
            icon: "library_books",
            primary: true,
            onClick: close,
          },
          {
            id: "later",
            label: "Faço depois",
            icon: "arrow_forward",
            onClick: close,
          },
        ]}
        footnote="Você pode reabrir esse painel em qualquer momento pelo menu Ajuda."
      />

      <AwWelcomeModal
        open={openKey === "non-dismissible"}
        onClose={close}
        dismissible={false}
        imageSrc={IMAGE}
        imageAlt="Capa"
        title="Antes de continuar, escolha uma opção"
        description="O modal não fecha com Esc ou clique fora — força uma decisão consciente."
        actions={[
          {
            id: "ok",
            label: "Entendi, seguir",
            icon: "check",
            primary: true,
            onClick: close,
          },
        ]}
      />
    </div>
  )
}
