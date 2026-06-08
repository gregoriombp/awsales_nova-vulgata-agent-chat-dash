/**
 * Projetos — flows importados do Figma como projetos navegáveis tela-a-tela.
 *
 * Cada Project é um flow do Figma importado pelo skill `bombardier-import-figma-flow`.
 * Os screenshots ficam em /public/projects/<slug>/<id>.png (ou .webp) e o manifest
 * abaixo é gerado/atualizado pelo skill — propositalmente um módulo TS estático
 * (igual `ux-flow/_data/flow-meta.ts`) pra galeria e viewer continuarem bundles leves
 * e suportarem `generateStaticParams`.
 *
 * As ações por tela ("Atualizar pro design system" e "Construir no repo") gravam
 * pedidos em /api/project-builds; quando um pedido é APLICADO, o skill de fulfillment
 * (`bombardier-project-build-solve`) atualiza `status`/`builtRoute` aqui.
 *
 * NÃO editar PROJECTS à mão pra registrar build/restyle — o store JSON é a fila de
 * pedidos; este manifest é o estado durável, escrito só pelo skill ao aplicar.
 */

export type ScreenStatus = "imported" | "restyled" | "built"

export type ProjectScreen = {
  /** node id do Figma com ":" -> "-" — chave estável (URL, nome do PNG, store). */
  id: string
  /** Rótulo limpo da tela, ex. "Homepage 01". */
  name: string
  /** Passo lógico parseado do nome do frame, ex. "Tela 01". */
  step: string
  /** Nome da seção no Figma, ex. "Página inicial" — agrupa as telas no viewer. */
  section: string
  /** Ordem global (passo + ordem dentro da seção). */
  order: number
  /** node id do Figma na forma ":" original — pro re-fetch (get_design_context). */
  figmaNodeId: string
  /** Caminho público do screenshot, ex. "/projects/memory-base/<id>.png". */
  thumbnail: string
  /** Dimensões intrínsecas do screenshot (evita CLS / informa aspect). */
  w: number
  h: number
  status: ScreenStatus
  /** Rota da página real, setada quando "Construir no repo" é aplicado. */
  builtRoute?: string
}

export type ProjectEdge = {
  /** screen id de origem. */
  source: string
  /** screen id de destino. */
  target: string
  /** true = branch dentro da mesma etapa (ex. "Novo" vs "Existente") — âmbar. */
  branch?: boolean
}

export type Project = {
  slug: string
  title: string
  description: string
  /** fileKey do arquivo Figma de origem. */
  figmaFileKey: string
  /** node id (forma ":") do flow/página de origem. */
  figmaNodeId: string
  /** URL de share do Figma (deep-link de volta). */
  figmaUrl: string
  /** ISO date do import inicial. */
  importedAt: string
  /** ISO date da última regeneração / build aplicado. */
  updatedAt: string
  screens: ProjectScreen[]
  /** Conexões do fluxo, inferidas dos conectores do Figma (setas + branches). */
  edges?: ProjectEdge[]
}

export const PROJECTS: Project[] = [
  {
    slug: "memory-base",
    title: "Memory Base",
    description:
      "Flow completo de criação e gestão de bases de conhecimento: wizard em 6 etapas (nome, objetivo, segmento, envio de dados, produtos/catálogos, playbooks) e as camadas de conhecimento. Importado do Figma — telas no design system antigo, prontas pra reconstruir no atual.",
    figmaFileKey: "QLLHzby4I8pGk83wFDY1hz",
    figmaNodeId: "929:29942",
    figmaUrl:
      "https://www.figma.com/design/QLLHzby4I8pGk83wFDY1hz/Flow-library--AW-Ready---Upload?node-id=929-29942",
    importedAt: "2026-06-08",
    updatedAt: "2026-06-08",
    edges: [
      // 15 conexões inferidas geometricamente dos conectores do Figma (FigJam).
      { source: "1026-34291", target: "1026-34479" },
      { source: "1026-34541", target: "931-83259" },
      { source: "969-70038", target: "942-84465" },
      { source: "969-70637", target: "944-66595" },
      { source: "969-71109", target: "930-82625" },
      { source: "969-71646", target: "947-23007" },
      { source: "930-82625", target: "1480-32124", branch: true },
      { source: "947-23007", target: "947-24120", branch: true },
      { source: "1059-144857", target: "947-33831" },
      { source: "947-33831", target: "961-36375", branch: true },
      { source: "1063-29803", target: "961-76779" },
      { source: "961-76779", target: "961-96943" },
      { source: "1063-37656", target: "1193-163311", branch: true },
      { source: "1063-37656", target: "1065-39942", branch: true },
      { source: "1065-40815", target: "969-7822" },
    ],
    screens: [
    { id: "1026-34291", name: "Homepage 01", step: "Tela 01", section: "Página inicial", order: 1, figmaNodeId: "1026:34291", thumbnail: "/projects/memory-base/1026-34291.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/homepage-01" },
    { id: "1241-83688", name: "Homepage 02", step: "Tela 01", section: "Página inicial", order: 2, figmaNodeId: "1241:83688", thumbnail: "/projects/memory-base/1241-83688.webp", w: 1920, h: 1080, status: "imported" },
    { id: "1241-83987", name: "Homepage 03", step: "Tela 01", section: "Página inicial", order: 3, figmaNodeId: "1241:83987", thumbnail: "/projects/memory-base/1241-83987.webp", w: 1920, h: 1080, status: "imported" },
    { id: "2121-19937", name: "Homepage 04", step: "Tela 01", section: "Página inicial", order: 4, figmaNodeId: "2121:19937", thumbnail: "/projects/memory-base/2121-19937.webp", w: 1920, h: 1080, status: "imported" },
    { id: "1026-34479", name: "Intro 01", step: "Tela 02", section: "Nome (Etapa 1 de criação)", order: 5, figmaNodeId: "1026:34479", thumbnail: "/projects/memory-base/1026-34479.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/wizard" },
    { id: "1026-34541", name: "Intro 02", step: "Tela 02", section: "Nome (Etapa 1 de criação)", order: 6, figmaNodeId: "1026:34541", thumbnail: "/projects/memory-base/1026-34541.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/wizard" },
    { id: "931-83259", name: "Objetivo 01", step: "Tela 03", section: "Objetivo (Etapa 2 de criação)", order: 7, figmaNodeId: "931:83259", thumbnail: "/projects/memory-base/931-83259.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/wizard" },
    { id: "969-70038", name: "Objetivo 02", step: "Tela 03", section: "Objetivo (Etapa 2 de criação)", order: 8, figmaNodeId: "969:70038", thumbnail: "/projects/memory-base/969-70038.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/wizard" },
    { id: "942-84465", name: "Tipo 01", step: "Tela 04", section: "Tipo de segmento (Etapa 3 de criação)", order: 9, figmaNodeId: "942:84465", thumbnail: "/projects/memory-base/942-84465.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/wizard" },
    { id: "969-70637", name: "Tipo 02", step: "Tela 04", section: "Tipo de segmento (Etapa 3 de criação)", order: 10, figmaNodeId: "969:70637", thumbnail: "/projects/memory-base/969-70637.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/wizard" },
    { id: "944-66595", name: "Envio de dados 01", step: "Tela 05", section: "Tipo de envio de dados (Etapa 4 de criação)", order: 11, figmaNodeId: "944:66595", thumbnail: "/projects/memory-base/944-66595.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/wizard" },
    { id: "969-71109", name: "Envio de dados 02", step: "Tela 05", section: "Tipo de envio de dados (Etapa 4 de criação)", order: 12, figmaNodeId: "969:71109", thumbnail: "/projects/memory-base/969-71109.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/wizard" },
    { id: "969-71646", name: "Envio de dados 03", step: "Tela 05", section: "Tipo de envio de dados (Etapa 4 de criação)", order: 13, figmaNodeId: "969:71646", thumbnail: "/projects/memory-base/969-71646.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/wizard" },
    { id: "930-82625", name: "Produtos 01", step: "Tela 06", section: "Novo produto (Etapa 5 de criação)", order: 14, figmaNodeId: "930:82625", thumbnail: "/projects/memory-base/930-82625.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/produtos" },
    { id: "1059-117101", name: "Produtos 02", step: "Tela 06", section: "Novo produto (Etapa 5 de criação)", order: 15, figmaNodeId: "1059:117101", thumbnail: "/projects/memory-base/1059-117101.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/produtos" },
    { id: "1059-117636", name: "Produtos 03", step: "Tela 06", section: "Novo produto (Etapa 5 de criação)", order: 16, figmaNodeId: "1059:117636", thumbnail: "/projects/memory-base/1059-117636.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/produtos" },
    { id: "1059-118741", name: "Produtos 04", step: "Tela 06", section: "Novo produto (Etapa 5 de criação)", order: 17, figmaNodeId: "1059:118741", thumbnail: "/projects/memory-base/1059-118741.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/produtos" },
    { id: "1061-27094", name: "Produtos 05", step: "Tela 06", section: "Novo produto (Etapa 5 de criação)", order: 18, figmaNodeId: "1061:27094", thumbnail: "/projects/memory-base/1061-27094.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/produtos" },
    { id: "1059-119290", name: "Produtos 06", step: "Tela 06", section: "Novo produto (Etapa 5 de criação)", order: 19, figmaNodeId: "1059:119290", thumbnail: "/projects/memory-base/1059-119290.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/produtos" },
    { id: "1059-119725", name: "Produtos 07", step: "Tela 06", section: "Novo produto (Etapa 5 de criação)", order: 20, figmaNodeId: "1059:119725", thumbnail: "/projects/memory-base/1059-119725.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/produtos" },
    { id: "1059-136312", name: "Produtos 08", step: "Tela 06", section: "Novo produto (Etapa 5 de criação)", order: 21, figmaNodeId: "1059:136312", thumbnail: "/projects/memory-base/1059-136312.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/produtos" },
    { id: "1059-144857", name: "Produtos 09", step: "Tela 06", section: "Novo produto (Etapa 5 de criação)", order: 22, figmaNodeId: "1059:144857", thumbnail: "/projects/memory-base/1059-144857.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/produtos" },
    { id: "1159-62609", name: "Produtos 10", step: "Tela 06", section: "Novo produto (Etapa 5 de criação)", order: 23, figmaNodeId: "1159:62609", thumbnail: "/projects/memory-base/1159-62609.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/produtos" },
    { id: "1164-63666", name: "Produtos 11", step: "Tela 06", section: "Novo produto (Etapa 5 de criação)", order: 24, figmaNodeId: "1164:63666", thumbnail: "/projects/memory-base/1164-63666.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/produtos" },
    { id: "1164-64045", name: "Produtos 12", step: "Tela 06", section: "Novo produto (Etapa 5 de criação)", order: 25, figmaNodeId: "1164:64045", thumbnail: "/projects/memory-base/1164-64045.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/produtos" },
    { id: "1170-16503", name: "Produtos 13", step: "Tela 06", section: "Novo produto (Etapa 5 de criação)", order: 26, figmaNodeId: "1170:16503", thumbnail: "/projects/memory-base/1170-16503.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/produtos" },
    { id: "1170-55647", name: "Produtos 14", step: "Tela 06", section: "Novo produto (Etapa 5 de criação)", order: 27, figmaNodeId: "1170:55647", thumbnail: "/projects/memory-base/1170-55647.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/produtos" },
    { id: "1170-56034", name: "Produtos 15", step: "Tela 06", section: "Novo produto (Etapa 5 de criação)", order: 28, figmaNodeId: "1170:56034", thumbnail: "/projects/memory-base/1170-56034.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/produtos" },
    { id: "1534-19623", name: "Produtos 16", step: "Tela 06", section: "Novo produto (Etapa 5 de criação)", order: 29, figmaNodeId: "1534:19623", thumbnail: "/projects/memory-base/1534-19623.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/produtos" },
    { id: "1480-32124", name: "Produtos 17", step: "Tela 06", section: "Produto existente (Etapa 5 de criação)", order: 30, figmaNodeId: "1480:32124", thumbnail: "/projects/memory-base/1480-32124.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/produtos" },
    { id: "1480-32077", name: "Produtos 18", step: "Tela 06", section: "Produto existente (Etapa 5 de criação)", order: 31, figmaNodeId: "1480:32077", thumbnail: "/projects/memory-base/1480-32077.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/produtos" },
    { id: "1480-32062", name: "Produtos 19", step: "Tela 06", section: "Produto existente (Etapa 5 de criação)", order: 32, figmaNodeId: "1480:32062", thumbnail: "/projects/memory-base/1480-32062.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/produtos" },
    { id: "1480-32015", name: "Produtos 20", step: "Tela 06", section: "Produto existente (Etapa 5 de criação)", order: 33, figmaNodeId: "1480:32015", thumbnail: "/projects/memory-base/1480-32015.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/produtos" },
    { id: "947-23007", name: "Catálogo 01", step: "Tela 07", section: "Novo catálogo (Etapa 5 de criação)", order: 34, figmaNodeId: "947:23007", thumbnail: "/projects/memory-base/947-23007.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/catalogo" },
    { id: "947-23268", name: "Catálogo 02", step: "Tela 07", section: "Novo catálogo (Etapa 5 de criação)", order: 35, figmaNodeId: "947:23268", thumbnail: "/projects/memory-base/947-23268.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/catalogo" },
    { id: "1061-31999", name: "Catálogo 03", step: "Tela 07", section: "Novo catálogo (Etapa 5 de criação)", order: 36, figmaNodeId: "1061:31999", thumbnail: "/projects/memory-base/1061-31999.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/catalogo" },
    { id: "1061-32396", name: "Catálogo 04", step: "Tela 07", section: "Novo catálogo (Etapa 5 de criação)", order: 37, figmaNodeId: "1061:32396", thumbnail: "/projects/memory-base/1061-32396.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/catalogo" },
    { id: "1061-26479", name: "Catálogo 05", step: "Tela 07", section: "Novo catálogo (Etapa 5 de criação)", order: 38, figmaNodeId: "1061:26479", thumbnail: "/projects/memory-base/1061-26479.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/catalogo" },
    { id: "1189-121999", name: "Catálogo 06", step: "Tela 07", section: "Novo catálogo (Etapa 5 de criação)", order: 39, figmaNodeId: "1189:121999", thumbnail: "/projects/memory-base/1189-121999.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/catalogo" },
    { id: "1062-19245", name: "Catálogo 07", step: "Tela 07", section: "Novo catálogo (Etapa 5 de criação)", order: 40, figmaNodeId: "1062:19245", thumbnail: "/projects/memory-base/1062-19245.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/catalogo" },
    { id: "1189-63495", name: "Catálogo 08", step: "Tela 07", section: "Novo catálogo (Etapa 5 de criação)", order: 41, figmaNodeId: "1189:63495", thumbnail: "/projects/memory-base/1189-63495.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/catalogo" },
    { id: "1061-32735", name: "Catálogo 09", step: "Tela 07", section: "Novo catálogo (Etapa 5 de criação)", order: 42, figmaNodeId: "1061:32735", thumbnail: "/projects/memory-base/1061-32735.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/catalogo" },
    { id: "1534-32085", name: "Catálogo 10", step: "Tela 07", section: "Novo catálogo (Etapa 5 de criação)", order: 43, figmaNodeId: "1534:32085", thumbnail: "/projects/memory-base/1534-32085.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/catalogo" },
    { id: "947-24120", name: "Catálogo 11", step: "Tela 07", section: "Catálogo existente (Etapa 5 de criação)", order: 44, figmaNodeId: "947:24120", thumbnail: "/projects/memory-base/947-24120.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/catalogo" },
    { id: "1062-13304", name: "Catálogo 12", step: "Tela 07", section: "Catálogo existente (Etapa 5 de criação)", order: 45, figmaNodeId: "1062:13304", thumbnail: "/projects/memory-base/1062-13304.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/catalogo" },
    { id: "969-75219", name: "Catálogo 13", step: "Tela 07", section: "Catálogo existente (Etapa 5 de criação)", order: 46, figmaNodeId: "969:75219", thumbnail: "/projects/memory-base/969-75219.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/catalogo" },
    { id: "1030-187732", name: "Catálogo 14", step: "Tela 07", section: "Catálogo existente (Etapa 5 de criação)", order: 47, figmaNodeId: "1030:187732", thumbnail: "/projects/memory-base/1030-187732.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/catalogo" },
    { id: "947-33831", name: "Playbook 01", step: "Tela 08", section: "Novo playbook (Etapa 6 de criação)", order: 48, figmaNodeId: "947:33831", thumbnail: "/projects/memory-base/947-33831.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/playbook" },
    { id: "961-4167", name: "Playbook 02", step: "Tela 08", section: "Novo playbook (Etapa 6 de criação)", order: 49, figmaNodeId: "961:4167", thumbnail: "/projects/memory-base/961-4167.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/playbook" },
    { id: "1063-29319", name: "Playbook 03", step: "Tela 08", section: "Novo playbook (Etapa 6 de criação)", order: 50, figmaNodeId: "1063:29319", thumbnail: "/projects/memory-base/1063-29319.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/playbook" },
    { id: "961-22214", name: "Playbook 04", step: "Tela 08", section: "Novo playbook (Etapa 6 de criação)", order: 51, figmaNodeId: "961:22214", thumbnail: "/projects/memory-base/961-22214.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/playbook" },
    { id: "1063-29803", name: "Playbook 05", step: "Tela 08", section: "Novo playbook (Etapa 6 de criação)", order: 52, figmaNodeId: "1063:29803", thumbnail: "/projects/memory-base/1063-29803.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/playbook" },
    { id: "961-36375", name: "Playbook 06", step: "Tela 08", section: "Playbook existente (Etapa 6 de criação)", order: 53, figmaNodeId: "961:36375", thumbnail: "/projects/memory-base/961-36375.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/playbook" },
    { id: "1063-36099", name: "Playbook 07", step: "Tela 08", section: "Playbook existente (Etapa 6 de criação)", order: 54, figmaNodeId: "1063:36099", thumbnail: "/projects/memory-base/1063-36099.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/playbook" },
    { id: "1063-36768", name: "Playbook 08", step: "Tela 08", section: "Playbook existente (Etapa 6 de criação)", order: 55, figmaNodeId: "1063:36768", thumbnail: "/projects/memory-base/1063-36768.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/playbook" },
    { id: "961-37167", name: "Playbook 09", step: "Tela 08", section: "Playbook existente (Etapa 6 de criação)", order: 56, figmaNodeId: "961:37167", thumbnail: "/projects/memory-base/961-37167.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/playbook" },
    { id: "1063-37103", name: "Playbook 10", step: "Tela 08", section: "Playbook existente (Etapa 6 de criação)", order: 57, figmaNodeId: "1063:37103", thumbnail: "/projects/memory-base/1063-37103.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/playbook" },
    { id: "961-76779", name: "Loading", step: "Tela 09", section: "Web scraping", order: 58, figmaNodeId: "961:76779", thumbnail: "/projects/memory-base/961-76779.webp", w: 1920, h: 1080, status: "imported" },
    { id: "961-96943", name: "Base de conhecimento 01", step: "Tela 10", section: "Base de conhecimento", order: 59, figmaNodeId: "961:96943", thumbnail: "/projects/memory-base/961-96943.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/base-conhecimento" },
    { id: "1063-37656", name: "Base de conhecimento 02", step: "Tela 10", section: "Base de conhecimento", order: 60, figmaNodeId: "1063:37656", thumbnail: "/projects/memory-base/1063-37656.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/base-conhecimento" },
    { id: "961-100556", name: "Base de conhecimento 03", step: "Tela 10", section: "Base de conhecimento", order: 61, figmaNodeId: "961:100556", thumbnail: "/projects/memory-base/961-100556.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/base-conhecimento" },
    { id: "1065-40815", name: "Base de conhecimento 04", step: "Tela 10", section: "Base de conhecimento", order: 62, figmaNodeId: "1065:40815", thumbnail: "/projects/memory-base/1065-40815.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/base-conhecimento" },
    { id: "2121-83213", name: "Base de conhecimento 05", step: "Tela 10", section: "Base de conhecimento", order: 63, figmaNodeId: "2121:83213", thumbnail: "/projects/memory-base/2121-83213.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/base-conhecimento" },
    { id: "2121-84657", name: "Base de conhecimento 06", step: "Tela 10", section: "Base de conhecimento", order: 64, figmaNodeId: "2121:84657", thumbnail: "/projects/memory-base/2121-84657.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/base-conhecimento" },
    { id: "2130-86689", name: "Base de conhecimento 12", step: "Tela 10", section: "Base de conhecimento", order: 65, figmaNodeId: "2130:86689", thumbnail: "/projects/memory-base/2130-86689.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/base-conhecimento" },
    { id: "1193-163311", name: "Base de conhecimento 06", step: "Tela 10", section: "Editar Knowledge Layer", order: 66, figmaNodeId: "1193:163311", thumbnail: "/projects/memory-base/1193-163311.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/base-conhecimento/editar" },
    { id: "1193-164919", name: "Base de conhecimento 07", step: "Tela 10", section: "Editar Knowledge Layer", order: 67, figmaNodeId: "1193:164919", thumbnail: "/projects/memory-base/1193-164919.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/base-conhecimento/editar" },
    { id: "1197-166578", name: "Base de conhecimento 08", step: "Tela 10", section: "Editar Knowledge Layer", order: 68, figmaNodeId: "1197:166578", thumbnail: "/projects/memory-base/1197-166578.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/base-conhecimento/editar" },
    { id: "1197-167386", name: "Base de conhecimento 09", step: "Tela 10", section: "Editar Knowledge Layer", order: 69, figmaNodeId: "1197:167386", thumbnail: "/projects/memory-base/1197-167386.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/base-conhecimento/editar" },
    { id: "1197-167798", name: "Base de conhecimento 10", step: "Tela 10", section: "Editar Knowledge Layer", order: 70, figmaNodeId: "1197:167798", thumbnail: "/projects/memory-base/1197-167798.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/base-conhecimento/editar" },
    { id: "1198-168208", name: "Base de conhecimento 11", step: "Tela 10", section: "Editar Knowledge Layer", order: 71, figmaNodeId: "1198:168208", thumbnail: "/projects/memory-base/1198-168208.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/base-conhecimento/editar" },
    { id: "1065-39942", name: "Base de conhecimento 04", step: "Tela 10", section: "Visualizar Knowledge Layer", order: 72, figmaNodeId: "1065:39942", thumbnail: "/projects/memory-base/1065-39942.webp", w: 1920, h: 1080, status: "built", builtRoute: "/bombardier/projects/built/memory-base/base-conhecimento" },
    { id: "969-7822", name: "Fontes de conhecimento", step: "Tela 11", section: "Fontes de conhecimento", order: 73, figmaNodeId: "969:7822", thumbnail: "/projects/memory-base/969-7822.webp", w: 1920, h: 1080, status: "imported" },
    ],
  },
]

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug)
}

export function getScreen(
  slug: string,
  screenId: string,
): ProjectScreen | undefined {
  return getProject(slug)?.screens.find((s) => s.id === screenId)
}

export type ProjectSection = { section: string; screens: ProjectScreen[] }

/** Agrupa as telas por seção, preservando a ordem (`order`) de primeira aparição. */
export function getProjectSections(project: Project): ProjectSection[] {
  const order: string[] = []
  const map = new Map<string, ProjectScreen[]>()
  for (const s of [...project.screens].sort((a, b) => a.order - b.order)) {
    if (!map.has(s.section)) {
      map.set(s.section, [])
      order.push(s.section)
    }
    map.get(s.section)!.push(s)
  }
  return order.map((section) => ({ section, screens: map.get(section)! }))
}
