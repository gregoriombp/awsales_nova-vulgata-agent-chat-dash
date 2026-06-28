"use client";

import { useState } from "react";
import { AwField } from "@/components/ui/AwInput";
import { AwToggleRow } from "@/components/ui/AwToggle";
import { Icon } from "@/components/ui/Icon";
import { useAwTheme, type ThemePreference } from "@/components/ui/AwThemeProvider";
import { SettingsPageHeader } from "../_components/shared";

type DensityPreference = "comfortable" | "compact";
type WeekStartPreference = "monday" | "sunday";

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useAwTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [density, setDensity] = useState<DensityPreference>("comfortable");
  const [weekStart, setWeekStart] = useState<WeekStartPreference>("monday");
  const [focusHints, setFocusHints] = useState(true);
  const [openInNewTab, setOpenInNewTab] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Preferências"
        description="Ajuste como a interface se comporta para você neste navegador."
      />
      <div className="flex flex-col divide-y divide-(--border-subtle)">
        <section className="py-6 first:pt-0">
          <PreferenceSectionTitle
            icon="palette"
            title="Aparência"
            description="Tema, densidade e movimento da interface."
          />

          <div className="mt-4 flex flex-wrap gap-3">
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

          <div className="mt-5 grid grid-cols-2 gap-3">
            <PreferenceChoice
              icon="view_agenda"
              title="Confortável"
              description="Mais respiro entre linhas e controles."
              active={density === "comfortable"}
              onClick={() => setDensity("comfortable")}
            />
            <PreferenceChoice
              icon="density_medium"
              title="Compacta"
              description="Mais informação visível na mesma tela."
              active={density === "compact"}
              onClick={() => setDensity("compact")}
            />
          </div>
        </section>

        <section className="py-6">
          <PreferenceSectionTitle
            icon="language"
            title="Região"
            description="Idioma, calendário e formatos usados em listas e relatórios."
          />

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

          <div className="mt-4 grid grid-cols-2 gap-3">
            <PreferenceChoice
              icon="calendar_view_week"
              title="Semana começa na segunda"
              description="Calendários e relatórios seguem o padrão comercial."
              active={weekStart === "monday"}
              onClick={() => setWeekStart("monday")}
            />
            <PreferenceChoice
              icon="event"
              title="Semana começa no domingo"
              description="Use quando sua operação acompanha esse calendário."
              active={weekStart === "sunday"}
              onClick={() => setWeekStart("sunday")}
            />
          </div>
        </section>

        <section className="py-6">
          <PreferenceSectionTitle
            icon="tune"
            title="Comportamento"
            description="Pequenos ajustes que deixam o produto mais previsível no uso diário."
          />

          <div className="mt-2 flex flex-col divide-y divide-(--border-subtle)">
            <AwToggleRow
              title="Realçar foco do teclado"
              description="Mostra estados de foco mais visíveis ao navegar com Tab."
              checked={focusHints}
              onChange={setFocusHints}
            />
            <AwToggleRow
              title="Abrir atalhos em nova aba"
              description="Mantém a página atual quando você abre relatórios, conversas e detalhes."
              checked={openInNewTab}
              onChange={setOpenInNewTab}
            />
          </div>
        </section>

        <section className="py-6">
          <PreferenceSectionTitle
            icon="accessibility_new"
            title="Acessibilidade"
            description="Preferências para reduzir movimento e tornar interações mais calmas."
          />
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

function PreferenceSectionTitle({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)">
        <Icon name={icon} size={18} />
      </span>
      <div className="min-w-0">
        <p className="m-0 body-sm font-medium text-(--fg-primary)">{title}</p>
        <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
          {description}
        </p>
      </div>
    </div>
  );
}

function PreferenceChoice({
  icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        "flex items-start gap-3 rounded-lg border p-4 text-left " +
        (active
          ? "border-(--fg-primary) bg-(--bg-raised) shadow-xs"
          : "border-(--border-default) bg-(--bg-raised) hover:border-(--border-strong)")
      }
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-(--bg-muted) text-(--fg-secondary)">
        <Icon name={icon} size={17} fill={active ? 1 : 0} />
      </span>
      <span className="min-w-0">
        <span className="block body-sm font-medium text-(--fg-primary)">
          {title}
        </span>
        <span className="mt-0.5 block body-xs text-(--fg-secondary)">
          {description}
        </span>
      </span>
    </button>
  );
}
