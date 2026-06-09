"use client";

import * as React from "react";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { AwSelect } from "@/components/ui/AwSelect";
import { Icon } from "@/components/ui/Icon";
import type {
  AgentEditorData,
  HistoryDay,
  HistoryEntry,
} from "@/lib/agentStudio";

/**
 * Histórico de alterações — seção do editor de agente.
 *
 * Timeline agrupada por dia (colapsável, primeiro dia aberto) com busca e
 * filtros locais por usuário e categoria. "Comparar versões" abre uma
 * comparação mock Antes/Depois; "Desfazer" confirma e remove a entrada do
 * estado local.
 */

function categoriaDe(acao: string): string {
  const a = acao.toLowerCase();
  if (a.includes("checkpoint")) return "Checkpoints";
  if (a.includes("base de conhecimento")) return "Base de conhecimento";
  if (a.includes("prompt")) return "Prompt";
  if (a.includes("aop")) return "AOPs";
  if (a.includes("integração")) return "Integrações";
  return "Geral";
}

export function HistoricoTab({ data }: { data: AgentEditorData }) {
  const [dias, setDias] = React.useState<HistoryDay[]>(data.historico);
  const [busca, setBusca] = React.useState("");
  const [usuario, setUsuario] = React.useState<string | null>(null);
  const [categoria, setCategoria] = React.useState<string | null>(null);
  const [diasAbertos, setDiasAbertos] = React.useState<Set<string>>(
    () => new Set(data.historico.slice(0, 1).map((d) => d.data)),
  );
  const [comparando, setComparando] = React.useState<HistoryEntry | null>(null);
  const [desfazendo, setDesfazendo] = React.useState<HistoryEntry | null>(null);

  const usuarios = Array.from(
    new Set(dias.flatMap((d) => d.entradas.map((e) => e.autor.name))),
  );
  const categorias = Array.from(
    new Set(dias.flatMap((d) => d.entradas.map((e) => categoriaDe(e.acao)))),
  );

  const filtrando = busca.trim() !== "" || usuario !== null || categoria !== null;
  const termo = busca.trim().toLowerCase();

  const correspondem = (entrada: HistoryEntry) => {
    if (
      termo &&
      !entrada.autor.name.toLowerCase().includes(termo) &&
      !entrada.acao.toLowerCase().includes(termo) &&
      !categoriaDe(entrada.acao).toLowerCase().includes(termo)
    ) {
      return false;
    }
    if (usuario && entrada.autor.name !== usuario) return false;
    if (categoria && categoriaDe(entrada.acao) !== categoria) return false;
    return true;
  };

  const diasFiltrados = dias
    .map((dia) => ({ ...dia, entradas: dia.entradas.filter(correspondem) }))
    .filter((dia) => dia.entradas.length > 0);

  const toggleDia = (dataDia: string) => {
    setDiasAbertos((prev) => {
      const next = new Set(prev);
      if (next.has(dataDia)) next.delete(dataDia);
      else next.add(dataDia);
      return next;
    });
  };

  const confirmarDesfazer = () => {
    if (!desfazendo) return;
    setDias((prev) =>
      prev
        .map((dia) => ({
          ...dia,
          entradas: dia.entradas.filter((e) => e.id !== desfazendo.id),
        }))
        .filter((dia) => dia.entradas.length > 0),
    );
    setDesfazendo(null);
  };

  return (
    <div>
      {/* ── Toolbar: busca + filtros ───────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <AwInput
          iconLeft="search"
          dense
          placeholder="Pesquisar por usuário, categoria ou palavras-chave"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full max-w-[380px]"
          aria-label="Pesquisar no histórico"
        />

        <div className="flex shrink-0 items-center gap-2">
          <AwDropdownMenu
            align="end"
            trigger={
              <AwSelect aria-label="Filtrar por usuário">
                {usuario ?? "Usuário"}
              </AwSelect>
            }
            items={[
              {
                id: "todos",
                label: "Todos os usuários",
                checked: usuario === null,
                onSelect: () => setUsuario(null),
              },
              { id: "sep", separator: true },
              ...usuarios.map((nome) => ({
                id: nome,
                label: nome,
                checked: usuario === nome,
                onSelect: () => setUsuario(nome),
              })),
            ]}
          />
          <AwDropdownMenu
            align="end"
            trigger={
              <AwSelect aria-label="Filtrar por categoria">
                {categoria ?? "Categoria"}
              </AwSelect>
            }
            items={[
              {
                id: "todas",
                label: "Todas as categorias",
                checked: categoria === null,
                onSelect: () => setCategoria(null),
              },
              { id: "sep", separator: true },
              ...categorias.map((cat) => ({
                id: cat,
                label: cat,
                checked: categoria === cat,
                onSelect: () => setCategoria(cat),
              })),
            ]}
          />
        </div>
      </div>

      {/* ── Timeline ───────────────────────────────────────────────── */}
      {diasFiltrados.length === 0 ? (
        <p className="mt-16 text-center text-sm text-(--fg-tertiary)">
          {filtrando
            ? "Nenhuma alteração encontrada para essa busca."
            : "Nenhuma alteração registrada neste agente."}
        </p>
      ) : (
        <div className="mt-8 space-y-6">
          {diasFiltrados.map((dia) => {
            const aberto = filtrando || diasAbertos.has(dia.data);
            return (
              <section key={dia.data}>
                <button
                  type="button"
                  onClick={() => toggleDia(dia.data)}
                  aria-expanded={aberto}
                  className="group flex w-full items-center gap-4 py-1 text-left"
                >
                  <span className="shrink-0 text-xs font-medium text-(--fg-secondary)">
                    {dia.data}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-(--border-subtle)"
                  />
                  <Icon
                    name="expand_more"
                    size={18}
                    className={`shrink-0 text-(--fg-tertiary) transition-transform duration-aw-fast group-hover:text-(--fg-primary) ${
                      aberto ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {aberto && (
                  <ul className="mt-4 space-y-5 pl-1">
                    {dia.entradas.map((entrada) => (
                      <li
                        key={entrada.id}
                        className="flex items-start justify-between gap-6"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <AwAvatar
                            size="md"
                            initials={entrada.autor.initials}
                            alt={entrada.autor.name}
                          />
                          <div className="min-w-0">
                            <p className="flex items-baseline gap-2">
                              <span className="truncate text-sm font-medium text-(--fg-primary)">
                                {entrada.autor.name}
                              </span>
                              <span className="shrink-0 text-xs text-(--fg-tertiary)">
                                {entrada.quando}
                              </span>
                            </p>
                            <p className="mt-0.5 text-sm text-(--fg-secondary)">
                              {entrada.acao}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <AwButton
                            variant="secondary"
                            size="sm"
                            onClick={() => setComparando(entrada)}
                          >
                            Comparar versões
                          </AwButton>
                          <AwButton
                            variant="ghost"
                            size="sm"
                            iconLeft="undo"
                            className="text-(--accent-danger) hover:text-(--accent-danger)"
                            onClick={() => setDesfazendo(entrada)}
                          >
                            Desfazer
                          </AwButton>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* ── Modal: comparar versões ────────────────────────────────── */}
      <AwModal
        open={comparando !== null}
        onClose={() => setComparando(null)}
        title="Comparar versões"
        footer={
          <AwButton variant="secondary" onClick={() => setComparando(null)}>
            Fechar
          </AwButton>
        }
      >
        {comparando && (
          <div>
            <p className="text-sm text-(--fg-secondary)">
              {comparando.acao}{" "}
              <span className="text-(--fg-tertiary)">
                — por {comparando.autor.name}, {comparando.quando}.
              </span>
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-4">
                <AwPill variant="neutral" dot={false}>
                  Antes
                </AwPill>
                <p className="mt-3 text-sm leading-relaxed text-(--fg-secondary)">
                  Versão anterior do item alterado, registrada automaticamente
                  pelo histórico antes da modificação.
                </p>
              </div>
              <div className="rounded-lg border border-(--border-subtle) bg-(--bg-canvas) p-4">
                <AwPill variant="live">Depois</AwPill>
                <p className="mt-3 text-sm leading-relaxed text-(--fg-secondary)">
                  Versão atual em vigor, aplicada por {comparando.autor.name}.{" "}
                  {comparando.acao}
                </p>
              </div>
            </div>
          </div>
        )}
      </AwModal>

      {/* ── Modal: desfazer alteração ──────────────────────────────── */}
      <AwModal
        open={desfazendo !== null}
        onClose={() => setDesfazendo(null)}
        title="Desfazer alteração"
        footer={
          <>
            <AwButton variant="secondary" onClick={() => setDesfazendo(null)}>
              Cancelar
            </AwButton>
            <AwButton variant="danger" onClick={confirmarDesfazer}>
              Desfazer alteração
            </AwButton>
          </>
        }
      >
        {desfazendo && (
          <p className="text-sm leading-relaxed text-(--fg-secondary)">
            O agente volta para a versão anterior a esta alteração de{" "}
            <span className="font-medium text-(--fg-primary)">
              {desfazendo.autor.name}
            </span>
            : {desfazendo.acao}
          </p>
        )}
      </AwModal>
    </div>
  );
}
