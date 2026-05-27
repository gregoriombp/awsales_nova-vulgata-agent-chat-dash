import { AwPill } from "@/components/ui/AwPill"
import { Icon } from "@/components/ui/Icon"
import { PageHero, Section } from "../../_primitives"

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] border border-[var(--border-subtle)] text-[var(--fg-primary)] text-[11px] mx-0.5">
      {children}
    </kbd>
  )
}

function Step({
  number,
  title,
  children,
}: {
  number: number
  title: string
  children: React.ReactNode
}) {
  return (
    <li className="flex gap-4">
      <span className="shrink-0 h-7 w-7 rounded-full bg-[var(--bg-inverse)] text-[var(--fg-on-inverse)] text-xs font-semibold inline-flex items-center justify-center">
        {number}
      </span>
      <div className="flex-1">
        <h3 className="m-0 text-base font-semibold text-[var(--fg-primary)]">
          {title}
        </h3>
        <p className="mt-1 mb-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
          {children}
        </p>
      </div>
    </li>
  )
}

export default function ReviewModeFoundationPage() {
  return (
    <div className="flex flex-col gap-12">
      <PageHero title="Review Mode">
        Ferramenta interna do Bombardier pra anotar telas durante reviews ao
        vivo. Marcação livre e pinos com comentário, salvos local (browser)
        ou num bridge LAN com sync entre revisores em tempo real.
      </PageHero>

      <Section
        id="ativar"
        title="Como ativar"
        lead="O overlay é gated por env flag. Sem a flag, nada aparece — zero risco de vazar pra produção."
      >
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <Icon
              name="terminal"
              size={20}
              className="text-[var(--fg-tertiary)] mt-0.5"
            />
            <div>
              <p className="m-0 text-sm text-[var(--fg-primary)] font-medium">
                Adicione no <code className="font-mono text-xs">.env.local</code>:
              </p>
              <pre className="mt-2 mb-0 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] border border-[var(--border-subtle)] p-3 text-[12px] font-mono">
                NEXT_PUBLIC_BOMBARDIER_REVIEW_ENABLED=true
              </pre>
            </div>
          </div>
          <p className="m-0 text-sm text-[var(--fg-secondary)]">
            Reinicie <code className="font-mono text-xs">npm run dev</code>.
            O botão <strong>Review</strong> aparece no rodapé central. Clique
            (ou aperte <Kbd>⌘</Kbd>+<Kbd>⇧</Kbd>+<Kbd>Y</Kbd>) pra abrir.
          </p>
        </div>
      </Section>

      <Section
        id="usar"
        title="Como usar"
        lead="Marcação livre pra circular regiões; pino pra pontuar um local exato."
      >
        <ol className="list-none p-0 m-0 flex flex-col gap-5">
          <Step number={1} title="Identifique-se">
            Na primeira ativação, escolha um nome e uma cor. Tudo fica salvo
            no seu navegador. Cada revisor com cor diferente facilita ler a
            tela cheia de marcações.
          </Step>
          <Step number={2} title="Escolha o modo">
            Na barra inferior: <Kbd>cursor</Kbd> não captura,{" "}
            <Kbd>marcação livre</Kbd> deixa você desenhar com o mouse,{" "}
            <Kbd>pino</Kbd> cola um marcador num clique. <Kbd>⌘</Kbd>+
            <Kbd>⇧</Kbd>+<Kbd>K</Kbd> alterna entre os modos.
          </Step>
          <Step number={3} title="Anote">
            Solte o mouse (ou clique no pino) e o popover aparece. Escreva o
            feedback e <Kbd>⌘</Kbd>+<Kbd>↵</Kbd> pra salvar. <Kbd>Esc</Kbd>{" "}
            cancela.
          </Step>
          <Step number={4} title="Revise no painel lateral">
            O ícone <Icon name="forum" size={14} /> abre a lista. Filtre por
            abertos / resolvidos, pula entre telas, marca como resolvido,
            deleta. Click num cartão dá scroll suave até o anchor na própria
            tela.
          </Step>
          <Step number={5} title="Exporte">
            <Icon name="ios_share" size={14} /> abre um modal com o JSON
            completo. Útil pra arquivar uma sessão de review ou pra
            compartilhar quando você ainda está rodando local-only.
          </Step>
        </ol>
      </Section>

      <Section
        id="bridge"
        title="Bridge LAN (sync entre revisores)"
        lead="Quando o time inteiro está no escritório, suba o review-bridge na sua máquina e os comentários aparecem em tempo real no navegador de cada um. Sem internet, sem cloud."
      >
        <div className="flex flex-col gap-5">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <AwPill variant="ai" dot={false}>
                Servidor
              </AwPill>
              <span className="text-xs text-[var(--fg-tertiary)]">
                review-bridge/
              </span>
            </div>
            <ol className="list-decimal pl-5 m-0 text-sm text-[var(--fg-secondary)] space-y-1.5 leading-relaxed">
              <li>
                <code className="font-mono text-xs">npm run review-bridge:install</code>{" "}
                (uma vez).
              </li>
              <li>
                Gere um token aleatório:{" "}
                <code className="font-mono text-xs">openssl rand -hex 32</code>.
              </li>
              <li>
                Copie{" "}
                <code className="font-mono text-xs">
                  review-bridge/.env.example
                </code>{" "}
                pra <code className="font-mono text-xs">.env</code> e cole o
                token em{" "}
                <code className="font-mono text-xs">
                  BOMBARDIER_REVIEW_TOKEN
                </code>
                .
              </li>
              <li>
                <code className="font-mono text-xs">npm run review-bridge:dev</code>.
                Sobe em <code className="font-mono text-xs">0.0.0.0:9878</code>{" "}
                (escutando a LAN).
              </li>
              <li>
                Pegue seu hostname mDNS (ex.:{" "}
                <code className="font-mono text-xs">
                  echo "$(hostname -s).local"
                </code>{" "}
                no macOS) e compartilhe com o time — sobrevive a troca de
                WiFi sem reconfigurar.
              </li>
            </ol>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <AwPill variant="beta" dot={false}>
                Frontend
              </AwPill>
              <span className="text-xs text-[var(--fg-tertiary)]">
                .env.local
              </span>
            </div>
            <p className="m-0 text-sm text-[var(--fg-secondary)]">
              Seta as duas vars abaixo e o overlay troca automaticamente do
              localStorage pro bridge. Apague pra voltar pro modo local.
            </p>
            <pre className="m-0 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] border border-[var(--border-subtle)] p-3 text-[12px] font-mono whitespace-pre-wrap">
              {`NEXT_PUBLIC_BOMBARDIER_REVIEW_BRIDGE_URL=http://<hostname>.local:9878
NEXT_PUBLIC_BOMBARDIER_REVIEW_TOKEN=<mesmo-token-do-servidor>`}
            </pre>
            <p className="m-0 text-xs text-[var(--fg-tertiary)] flex items-start gap-1.5">
              <Icon name="info" size={13} className="mt-0.5" />
              <span>
                Se você já tinha comentários no localStorage, o overlay
                detecta na primeira abertura e oferece um toast{" "}
                <strong>Importar</strong> pra subir tudo pro bridge.
              </span>
            </p>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <AwPill variant="error" dot={false}>
                Segurança
              </AwPill>
              <span className="text-xs text-[var(--fg-tertiary)]">
                LAN-only, não exponha pra internet
              </span>
            </div>
            <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
              Auth é só um token compartilhado em header (
              <code className="font-mono text-xs">X-Review-Token</code>). É
              uma barreira de bom senso pra LAN do escritório, não segurança
              real. Não abra a porta 9878 pro mundo, não use HTTPS público
              sem proxy reverso adequado, e não coloque dados sensíveis
              nesses comentários.
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="atalhos"
        title="Atalhos"
        lead="Tudo pelo teclado pra não atrapalhar a navegação no produto."
      >
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden">
          <ul className="divide-y divide-[var(--border-subtle)] m-0 p-0 list-none">
            {[
              {
                keys: (
                  <>
                    <Kbd>⌘</Kbd>+<Kbd>⇧</Kbd>+<Kbd>Y</Kbd>
                  </>
                ),
                desc: "Liga/desliga o overlay",
              },
              {
                keys: (
                  <>
                    <Kbd>⌘</Kbd>+<Kbd>⇧</Kbd>+<Kbd>K</Kbd>
                  </>
                ),
                desc: "Alterna cursor → marcação → pino",
              },
              {
                keys: (
                  <>
                    <Kbd>⌘</Kbd>+<Kbd>↵</Kbd>
                  </>
                ),
                desc: "Salva o comentário no popover aberto",
              },
              {
                keys: <Kbd>Esc</Kbd>,
                desc: "Cancela o popover; volta pra cursor; fecha o painel",
              },
            ].map((row, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-4 px-5 py-3"
              >
                <span className="text-sm text-[var(--fg-secondary)]">
                  {row.desc}
                </span>
                <span className="flex items-center text-[11px]">
                  {row.keys}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section
        id="limitacoes"
        title="Limitações conhecidas"
        lead="A v1 prioriza simplicidade — alguns trade-offs documentados pra você decidir quando confiar nela."
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
            <div className="flex items-center gap-2 mb-2">
              <AwPill variant="draft" dot={false}>
                Stale
              </AwPill>
              <span className="text-xs text-[var(--fg-tertiary)]">
                Anchor pode dessincar
              </span>
            </div>
            <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
              Coords são salvas em % do viewport + scrollY. Se o conteúdo
              da tela mudou (lista cresceu, dado novo carregou), o anchor
              pode ficar fora do lugar. Marcamos como <strong>stale</strong>{" "}
              quando a altura do documento mudou +20%.
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
            <div className="flex items-center gap-2 mb-2">
              <AwPill variant="neutral" dot={false}>
                Local-only
              </AwPill>
              <span className="text-xs text-[var(--fg-tertiary)]">
                Sem sync entre máquinas
              </span>
            </div>
            <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
              Tudo no localStorage do seu navegador. Pra compartilhar:
              exporte o JSON. A v2 sobe um servidor local em LAN com sync
              entre revisores via SSE.
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
            <div className="flex items-center gap-2 mb-2">
              <AwPill variant="neutral" dot={false}>
                Sem auth
              </AwPill>
              <span className="text-xs text-[var(--fg-tertiary)]">
                Identidade é só nome
              </span>
            </div>
            <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
              Você digita o nome uma vez. Não há login real. Aceitável
              porque a v1 só roda quando você liga a flag manualmente em
              dev.
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
            <div className="flex items-center gap-2 mb-2">
              <AwPill variant="neutral" dot={false}>
                Coexistência
              </AwPill>
              <span className="text-xs text-[var(--fg-tertiary)]">
                Convive com Claude Edit
              </span>
            </div>
            <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
              Todas as camadas do Review carregam{" "}
              <code className="font-mono text-xs">
                data-bombardier-review
              </code>{" "}
              pra que o picker do Claude Edit (<Kbd>⌘</Kbd>+<Kbd>⇧</Kbd>+
              <Kbd>L</Kbd>) ignore o canvas, e vice-versa.
            </p>
          </div>
        </div>
      </Section>
    </div>
  )
}
