import {
  PageHero,
  Section,
  DoDont,
} from "../../_primitives"

type Rewrite = {
  context: string
  before: string
  after: string
  note: string
}

const rewrites: Rewrite[] = [
  {
    context: "erro de sistema",
    before:
      "No momento, devido a uma instabilidade em nosso sistema, não foi possível concluir o seu pedido. Pedimos desculpas pelo inconveniente e agradecemos a sua paciência.",
    after:
      "O pedido ficou em espera. Processamos assim que o serviço voltar — em até 10 minutos. Você recebe um e-mail.",
    note: "Três parágrafos viram três frases. Fato, compromisso, próximo passo. A desculpa cabe só se a situação for grave — aqui não é.",
  },
  {
    context: "onboarding · sucesso",
    before:
      "Parabéns! 🎉 Você criou com sucesso o seu primeiro agente de atendimento. Agora é só configurar e começar a usar!",
    after:
      "Seu primeiro agente existe. Falta ensinar o que responder e onde aparecer.",
    note: "Nada de confete. O usuário já sabe que criou — ele apertou o botão. O valor do texto aqui é apontar o próximo passo com uma metáfora precisa.",
  },
  {
    context: "confirmação destrutiva",
    before:
      "Atenção! Esta ação é irreversível e irá excluir permanentemente todos os dados associados a este agente, incluindo histórico de conversas, configurações e integrações. Tem certeza de que deseja continuar?",
    after:
      "Arquivar apaga o histórico, as integrações e o agente. Não há como desfazer depois de 30 dias.",
    note: "O risco é contado como fato. “Atenção”, “tem certeza”, emoji de alerta — todos redundantes diante de um botão vermelho.",
  },
]

const axes = [
  {
    n: "01",
    name: "precisão",
    rule: "Direto, nunca seco.",
    avoid:
      "“Esta ação pode resultar em consequências irreversíveis para os seus dados.”",
  },
  {
    n: "02",
    name: "respeito",
    rule: "Trata o leitor como par.",
    avoid: "“Não se preocupe — é super simples, você consegue!”",
  },
  {
    n: "03",
    name: "vivacidade",
    rule: "Tem cadência, verbos no presente.",
    avoid: "Linguagem passiva e rodeios institucionais.",
  },
  {
    n: "04",
    name: "honestidade",
    rule: "Não esconde o custo.",
    avoid: "“Essa funcionalidade está sendo otimizada.”",
  },
]

type Mech = {
  k: string
  rule: string
  example: React.ReactNode
}

const mechanics: Mech[] = [
  {
    k: "Pessoa",
    rule: "Segunda do singular. “Você” no corpo, implícito em botão.",
    example: (
      <>
        “Publicar agente”, não “Publicar o meu agente”.
      </>
    ),
  },
  {
    k: "Número",
    rule: "Algarismos sempre — inclusive de 0 a 10 em UI.",
    example: (
      <span className="mono">3 fontes, v12.4, 2 min.</span>
    ),
  },
  {
    k: "Data e hora",
    rule: "Relativa até 48 h. Absoluta depois disso, em pt-BR.",
    example: (
      <>
        <span className="mono">há 14 min</span> ·{" "}
        <span className="mono">ontem, 18:42</span> ·{" "}
        <span className="mono">24 mar, 18:42</span>
      </>
    ),
  },
  {
    k: "Reticências",
    rule: "Só em texto truncado — nunca para criar suspense.",
    example: (
      <>
        Pensando… sim. “Publicando…” →{" "}
        <span style={{ color: "var(--aw-red-700)" }}>
          não, use “Publicando”.
        </span>
      </>
    ),
  },
  {
    k: "Aspas",
    rule: "Curvas em copy (“ ”). Retas só em código e mono.",
    example: <>“Atendimento FAQ” está ao vivo.</>,
  },
  {
    k: "Verbo de ação",
    rule: "Infinitivo em botão. Presente no feedback.",
    example: (
      <>
        Botão: <strong>Publicar</strong>. Toast:{" "}
        <strong>Agente publicado.</strong>
      </>
    ),
  },
  {
    k: "Ponto final",
    rule: "Fora de rótulos, tags e títulos. Dentro de frases completas.",
    example: (
      <>
        Pill: <strong>Live</strong> — sem ponto. Descrição: “O agente está ao
        vivo em 2 canais.”
      </>
    ),
  },
  {
    k: "Maiúsculas",
    rule: "Sentence case sempre. Title Case só em nomes próprios e marcas.",
    example: (
      <>
        “Novo agente”, não <span style={{ color: "var(--aw-red-700)" }}>“Novo Agente”</span>.
      </>
    ),
  },
]

type LexiconItem = { term: string; gloss: string }

const weSay: LexiconItem[] = [
  { term: "Agente", gloss: "O sujeito. Tem papel, conhecimento e permissões." },
  { term: "Fonte", gloss: "Dado que o agente consulta — doc, site, banco." },
  { term: "Rastro", gloss: "O caminho lógico da resposta. Auditável." },
  { term: "Publicar", gloss: "Tornar uma versão ativa em um canal." },
  { term: "Confiança", gloss: "Quanto o agente endossa a própria resposta." },
  { term: "Escalar", gloss: "Passar a conversa para um humano." },
]

const weDont: LexiconItem[] = [
  { term: "Bot, chatbot", gloss: "Reduz o papel a um bate-papo." },
  {
    term: "Base de conhecimento",
    gloss: "Vago e burocrático. É “fonte”.",
  },
  {
    term: "Caixa-preta, mágica",
    gloss: "Desconstrói confiança. Tudo tem rastro.",
  },
  { term: "Deployar, subir", gloss: "Anglicismo. “Publicar”." },
  { term: "Treinar", gloss: "Soa como ML. Em UI diga “atualizar fontes”." },
  { term: "Humano no loop", gloss: "Jargão. “Escalar para atendente”." },
]

const checklist = [
  {
    q: "Sobra alguma palavra?",
    a: "Corte até doer. Reescreva em metade das palavras — e veja se melhorou.",
  },
  {
    q: "O botão começa com verbo?",
    a: "“Publicar”, “Arquivar”, “Criar” — não “OK”, “Enviar formulário”.",
  },
  {
    q: "O título diz o quê ou diz o que é importante?",
    a: "“Novo agente” vs. “Crie seu próximo agente com apenas um clique” — o primeiro basta.",
  },
  {
    q: "Evitou “simplesmente”, “apenas”, “basta”?",
    a: "Essas palavras adiantam o julgamento do leitor. Deixe-o julgar.",
  },
  {
    q: "Evitou emoji e exclamação?",
    a: "Use só quando a frase perderia o sentido sem eles. Quase nunca.",
  },
  {
    q: "O leitor consegue agir depois de ler?",
    a: "Se a resposta é “agora ele sabe, mas não sabe o que fazer”, falta uma linha.",
  },
]

export default function ContentPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-10 py-14">
      <PageHero title="Escrita">
        Uma frase da AwSales termina antes do esperado. Não explica demais,
        não decora, não bajula. O produto conversa com quem sabe o que está
        fazendo — e com quem acabou de chegar. Para ambos, vale a mesma
        regra: <strong>diga o que é, diga o que muda, pare.</strong>
      </PageHero>

      <div className="flex flex-col gap-16">
        <Section
          id="axes"
          title="Quatro eixos da voz"
          lead="Cada eixo tem um oposto que desejamos evitar mais do que a regra em si."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {axes.map((a) => (
              <div
                key={a.n}
                className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5"
              >
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="mono text-xs text-[var(--fg-tertiary)]">
                    {a.n}
                  </span>
                  <h4 className="m-0">{a.name}</h4>
                </div>
                <p className="body-sm m-0 text-[var(--fg-primary)]">{a.rule}</p>
                <p className="body-sm m-0 mt-2 text-[var(--fg-tertiary)]">
                  <em>Evitar</em> — {a.avoid}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="rewrites"
          title="Reescritas"
          lead="Três frases reais do produto — antes e depois."
        >
          <div className="flex flex-col gap-6">
            {rewrites.map((r, i) => (
              <div
                key={i}
                className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden"
              >
                <div className="px-5 py-3 border-b border-[var(--border-subtle)]">
                  <span className="aw-eyebrow">{r.context}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-5 border-b md:border-b-0 md:border-r border-[var(--border-subtle)]">
                    <div className="aw-eyebrow mb-2 text-[var(--aw-red-800)]">
                      antes
                    </div>
                    <p className="body-sm m-0 text-[var(--fg-secondary)] leading-relaxed">
                      {r.before}
                    </p>
                  </div>
                  <div className="p-5">
                    <div className="aw-eyebrow mb-2 text-[var(--aw-emerald-800)]">
                      depois
                    </div>
                    <p className="body-sm m-0 text-[var(--fg-primary)] leading-relaxed">
                      {r.after}
                    </p>
                  </div>
                </div>
                <div className="px-5 py-3 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)]">
                  <p className="caption m-0 italic">{r.note}</p>
                </div>
              </div>
            ))}
          </div>
          <blockquote
            className="mt-6 pl-5 italic text-[var(--fg-secondary)]"
            style={{ borderLeft: "3px solid var(--border-default)" }}
          >
            A cortesia do bom texto é poupar o tempo de quem lê — não o ego de
            quem escreve.
            <footer className="caption not-italic mt-1">
              — princípio editorial, AwSales
            </footer>
          </blockquote>
        </Section>

        <Section
          id="mechanics"
          title="Mecânica"
          lead="Decisões que pulam no produto todo dia."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3 aw-eyebrow border-b border-[var(--border-subtle)] w-[150px]">
                    Decisão
                  </th>
                  <th className="text-left px-4 py-3 aw-eyebrow border-b border-[var(--border-subtle)]">
                    Regra
                  </th>
                  <th className="text-left px-4 py-3 aw-eyebrow border-b border-[var(--border-subtle)]">
                    Exemplo
                  </th>
                </tr>
              </thead>
              <tbody>
                {mechanics.map((m) => (
                  <tr
                    key={m.k}
                    className="border-b border-[var(--border-subtle)] last:border-b-0 align-top"
                  >
                    <td className="px-4 py-3 font-medium">{m.k}</td>
                    <td className="px-4 py-3 text-[var(--fg-secondary)]">
                      {m.rule}
                    </td>
                    <td className="px-4 py-3 text-[var(--fg-primary)]">
                      {m.example}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          id="ui-text"
          title="Texto dentro da UI"
          lead="Como título, descrição e rótulo convivem no mesmo bloco."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">empty state</div>
              <h5 className="m-0 mb-2">Nenhum rastro ainda</h5>
              <p className="body-sm m-0 text-[var(--fg-secondary)] mb-3">
                Rastros aparecem quando o agente escolhe um caminho de
                resposta. Mande uma conversa teste para começar.
              </p>
              <button className="aw-btn aw-btn--primary aw-btn--sm">
                Conversa teste
              </button>
              <p className="caption mt-3 italic">
                A frase curta nomeia a ausência. A longa diz o que faz
                aparecer. O botão é o caminho mais curto.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">modal destrutiva</div>
              <h5 className="m-0 mb-2">
                Arquivar &ldquo;Pré-venda B2B&rdquo;?
              </h5>
              <p className="body-sm m-0 text-[var(--fg-secondary)]">
                Conversas em andamento terminam. O histórico fica disponível
                por 30 dias antes de ser apagado.
              </p>
              <p className="caption mt-3 italic">
                Título é pergunta fechada com o nome afetado. Descrição
                separa o que acontece agora do que acontece depois.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">erro recuperável</div>
              <h5 className="m-0 mb-2">
                Webhook do Salesforce parou de responder
              </h5>
              <p className="body-sm m-0 text-[var(--fg-secondary)]">
                O agente segue usando a última resposta em cache, de 14 min
                atrás. Revise a integração para voltar ao tempo real.
              </p>
              <p className="caption mt-3 italic">
                Nomeia o sistema que falhou, descreve a consequência
                presente, oferece um caminho.
              </p>
            </div>
          </div>
        </Section>

        <Section
          id="lexicon"
          title="Léxico"
          lead="Palavras que usamos e as que trocamos."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--aw-emerald-300)] bg-[var(--aw-emerald-100)] p-5">
              <div className="aw-eyebrow mb-3 text-[var(--aw-emerald-800)]">
                dizemos
              </div>
              <dl className="flex flex-col gap-3 m-0">
                {weSay.map((w) => (
                  <div key={w.term}>
                    <dt className="font-medium text-[var(--aw-emerald-900)]">
                      {w.term}
                    </dt>
                    <dd className="body-sm text-[var(--aw-emerald-900)] opacity-80 m-0">
                      {w.gloss}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--aw-red-300)] bg-[var(--aw-red-100)] p-5">
              <div className="aw-eyebrow mb-3 text-[var(--aw-red-800)]">
                não dizemos
              </div>
              <dl className="flex flex-col gap-3 m-0">
                {weDont.map((w) => (
                  <div key={w.term}>
                    <dt className="font-medium text-[var(--aw-red-900)]">
                      {w.term}
                    </dt>
                    <dd className="body-sm text-[var(--aw-red-900)] opacity-80 m-0">
                      {w.gloss}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Section>

        <Section
          id="checklist"
          title="Antes de colar no Figma"
          lead="Seis perguntas rápidas."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden">
            <ol className="list-none m-0 p-0 flex flex-col">
              {checklist.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 px-5 py-4 border-b border-[var(--border-subtle)] last:border-b-0"
                >
                  <span className="mono text-xs text-[var(--fg-tertiary)] pt-0.5 w-6 shrink-0">
                    0{i + 1}
                  </span>
                  <div>
                    <div className="font-medium text-[var(--fg-primary)] mb-1">
                      {item.q}
                    </div>
                    <div className="body-sm text-[var(--fg-secondary)]">
                      {item.a}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Section>

        <Section id="summary" title="Tensões principais">
          <DoDont
            dos={[
              <>Fato, compromisso, próximo passo — nessa ordem.</>,
              <>Verbo no infinitivo em botão. Presente em feedback.</>,
              <>Sentence case. Algarismos sempre. Ponto só em frase completa.</>,
              <>“Agente”, “fonte”, “rastro”, “publicar”, “escalar” — léxico fixo.</>,
            ]}
            donts={[
              <>Emoji, exclamação, “simplesmente”, “apenas”, “basta”.</>,
              <>Desculpa quando o erro não é grave.</>,
              <>“Tem certeza?” no botão destrutivo — o botão já é a certeza.</>,
              <>Jargão de ML/dev em UI: “treinar”, “deployar”, “humano no loop”.</>,
            ]}
          />
        </Section>
      </div>
    </div>
  )
}
