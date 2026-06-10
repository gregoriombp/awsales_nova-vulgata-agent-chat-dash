/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { Icon } from "@/components/ui/Icon"
import { PageHero, Section, DoDont } from "../../_primitives"

/**
 * Imageria — as texturas fotográficas da marca. Whitefield: o campo neutro
 * onde os agentes operam, fora da Terra. Sempre grayscale; a cor vem da
 * interface e do contexto do cliente, nunca da foto.
 */

const GALLERY = [
  ...Array.from({ length: 12 }, (_, i) => ({
    src: `/assets/group-backgrounds/group-bg-${String(i + 1).padStart(2, "0")}.jpg`,
    label: `group-bg-${String(i + 1).padStart(2, "0")}`,
    tall: i % 5 === 1 || i % 5 === 3,
  })),
  {
    src: "/assets/background-images/background-image@2x.jpg",
    label: "background-image (login)",
    tall: true,
  },
]

const PRINCIPIOS = [
  {
    icon: "invert_colors_off",
    t: "Sempre grayscale",
    d: "Nenhuma foto da marca carrega cor. O azul e os accents pertencem à interface.",
  },
  {
    icon: "texture",
    t: "Textura, não cena",
    d: "Rochas, dunas, montanhas, relevo. Nada de escritórios, telas ou pessoas de banco de imagem.",
  },
  {
    icon: "landscape",
    t: "O whitefield",
    d: "O ambiente neutro onde os agentes operam. Pode ser claro (montanha) ou escuro (duna noturna) — nunca literal.",
  },
  {
    icon: "contrast",
    t: "Contraste para texto",
    d: "Toda imagem usada atrás de texto recebe overlay (gradiente preto translúcido) até passar contraste AA.",
  },
  {
    icon: "filter_1",
    t: "Uma por composição",
    d: "Imageria é momento, não papel de parede. Uma textura forte por tela ou slide.",
  },
]

export default function ImageriaPage() {
  return (
    <>
      <PageHero title="Imageria">
        O ambiente onde os agentes operam é um campo neutro — um{" "}
        <strong>whitefield</strong>. Texturas lunares, rochas e montanhas em
        grayscale: é lá, fora da Terra, que a empresa do cliente também opera.
        A textura é neutra de propósito — o contexto de cada cliente é quem
        colore.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        {/* ── Galeria ─────────────────────────────────────────────────── */}
        <Section
          id="galeria"
          title="Biblioteca atual"
          lead="As texturas oficiais já versionadas no repositório — prontas para login, heros, slides e fundos de seção."
        >
          <div className="columns-2 gap-4 lg:columns-3 [&>*]:mb-4">
            {GALLERY.map((img) => (
              <figure
                key={img.src}
                className="group relative m-0 overflow-hidden rounded-xl border border-(--border-subtle) bg-(--bg-muted)"
              >
                <img
                  src={img.src}
                  alt={`Textura da marca — ${img.label}`}
                  loading="lazy"
                  className={`w-full object-cover transition-transform duration-(--dur-slow) group-hover:scale-[1.025] ${
                    img.tall ? "aspect-[3/4]" : "aspect-[4/3]"
                  }`}
                />
                <figcaption className="absolute bottom-2 left-2 rounded-md bg-aw-gray-1200/70 px-2 py-0.5 text-[11px] text-aw-gray-200 opacity-0 transition-opacity group-hover:opacity-100">
                  {img.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

        {/* ── Princípios ──────────────────────────────────────────────── */}
        <Section
          id="principios"
          title="Princípios de uso"
          lead="Cinco regras que mantêm a imageria reconhecível em qualquer canal."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {PRINCIPIOS.map((p) => (
              <div
                key={p.t}
                className="flex flex-col gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{
                    background: "color-mix(in srgb, var(--aw-slate-500) 12%, transparent)",
                    color: "var(--aw-slate-600)",
                  }}
                >
                  <Icon name={p.icon} size={20} weight={300} />
                </span>
                <div>
                  <h3 className="m-0 text-[15px] font-semibold">{p.t}</h3>
                  <p className="mb-0 mt-1.5 text-sm leading-relaxed text-(--fg-secondary)">
                    {p.d}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Padrão de legibilidade ──────────────────────────────────── */}
        <Section
          id="legibilidade"
          title="Texto sobre imagem"
          lead="O padrão: overlay em gradiente preto translúcido subindo do rodapé. Sem ele, nenhum texto encosta em foto."
        >
          <div className="relative min-h-[300px] overflow-hidden rounded-2xl">
            <img
              src="/assets/group-backgrounds/group-bg-07.jpg"
              alt="Exemplo de textura com overlay de legibilidade"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, transparent 28%, rgba(13,13,13,0.85) 100%)",
              }}
            />
            <div className="absolute bottom-0 left-0 p-9">
              <div className="aw-eyebrow text-aw-gray-400">o padrão</div>
              <p className="m-0 mt-2 max-w-[480px] font-heading text-[22px] font-medium leading-snug text-aw-gray-25">
                Overlay de 0% a ~85% de preto, começando no terço superior.
              </p>
            </div>
          </div>
        </Section>

        {/* ── Onde usar ───────────────────────────────────────────────── */}
        <Section id="onde-usar" title="Onde usar">
          <DoDont
            dos={[
              "Login, welcome e momentos de chegada",
              "Heros de página e aberturas de slide",
              "Fundos de seção em apresentações e site",
              "Capas de grupo e espaços vazios de marca",
            ]}
            donts={[
              "Tabelas, formulários e telas de trabalho denso",
              "Atrás de gráficos ou números pequenos",
              "Duas texturas competindo na mesma tela",
              "Fotos com cor, pessoas ou objetos literais",
            ]}
          />
        </Section>

        {/* ── Continue ────────────────────────────────────────────────── */}
        <Link
          href="/bombardier/styleguide/marca/ilustracoes"
          className="group flex items-center justify-between rounded-2xl border border-(--border-subtle) bg-(--bg-raised) px-8 py-7 no-underline transition-colors hover:border-(--border-strong)"
        >
          <div>
            <div className="aw-eyebrow">continue</div>
            <div className="mt-1 font-heading text-xl font-medium text-(--fg-primary)">
              Ilustrações line-art
            </div>
          </div>
          <Icon name="arrow_forward" size={22} className="text-(--fg-tertiary) transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </>
  )
}
