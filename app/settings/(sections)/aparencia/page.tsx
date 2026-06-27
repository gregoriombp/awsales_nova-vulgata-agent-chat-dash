"use client";

import { useState } from "react";
import { AwField } from "@/components/ui/AwInput";
import { AwToggleRow } from "@/components/ui/AwToggle";
import { Icon } from "@/components/ui/Icon";
import { useAwTheme, type ThemePreference } from "@/components/ui/AwThemeProvider";
import { SettingsPageHeader } from "../_components/shared";

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useAwTheme();
  const [reduceMotion, setReduceMotion] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Aparência"
        description="Preferências visuais que valem só neste navegador."
      />
      {/* Sem caixa externa: conteúdo flat, seções separadas só por divisória. */}
      <div className="flex flex-col divide-y divide-(--border-subtle)">
        <section className="py-6 first:pt-0">
          <p className="m-0 mb-3 body-sm font-medium text-(--fg-primary)">
            Tema
          </p>
          <div className="flex flex-wrap gap-3">
            {(
              [
                { id: "system", label: "Sistema", icon: "computer" },
                { id: "light", label: "Claro", icon: "light_mode" },
                { id: "dark", label: "Escuro", icon: "dark_mode" },
              ] as { id: ThemePreference; label: string; icon: string }[]
            ).map((t) => {
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  aria-pressed={isActive}
                  className={
                    "flex min-w-[120px] flex-col items-start gap-2 rounded-lg border p-3 text-left transition-all duration-aw-fast " +
                    (isActive
                      ? "border-(--fg-primary) bg-(--bg-raised) shadow-xs"
                      : "border-(--border-default) bg-(--bg-raised) hover:border-(--border-strong)")
                  }
                >
                  <Icon name={t.icon} size={18} />
                  <span className="body-xs font-medium text-(--fg-primary)">
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="py-6">
          {/* PT-BR é o único idioma realmente disponível por ora. Em vez de um
              seletor que só troca o rótulo sem traduzir nada (lê como bug),
              mostramos a linha como leitura, com um aviso de "em breve". */}
          <AwField label="Idioma da interface">
            <div className="flex items-center justify-between gap-3 rounded-md border border-(--border-subtle) bg-(--bg-muted) px-3 py-2.5">
              <span className="inline-flex items-center gap-2 body-sm text-(--fg-primary)">
                <Icon name="language" size={16} className="text-(--fg-tertiary)" />
                Português (Brasil)
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-(--bg-raised) px-2 py-0.5 body-xs text-(--fg-tertiary)">
                Mais idiomas em breve
              </span>
            </div>
          </AwField>
        </section>

        <section className="py-4">
          <AwToggleRow
            title="Reduzir movimento"
            description="Reduz transições e movimentos de fundo."
            checked={reduceMotion}
            onChange={setReduceMotion}
          />
        </section>
      </div>
    </div>
  );
}
