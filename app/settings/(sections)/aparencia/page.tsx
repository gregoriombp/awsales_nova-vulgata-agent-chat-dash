"use client";

import { useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwField } from "@/components/ui/AwInput";
import { AwSelect } from "@/components/ui/AwSelect";
import { Icon } from "@/components/ui/Icon";
import { useAwTheme, type ThemePreference } from "@/components/ui/AwThemeProvider";
import { SettingsPageHeader } from "../_components/shared";

type DensityPreference = "comfortable" | "compact";

const LANGUAGES = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "en-US", label: "English (US)" },
  { value: "es-ES", label: "Español (España)" },
  { value: "es-419", label: "Español (Latinoamérica)" },
];

const TIMEZONES = [
  { value: "America/Sao_Paulo", label: "(GMT−3) Brasília — São Paulo" },
  { value: "America/Fortaleza", label: "(GMT−3) Fortaleza" },
  { value: "America/Manaus", label: "(GMT−4) Manaus" },
  { value: "America/Rio_Branco", label: "(GMT−5) Rio Branco" },
  { value: "America/Noronha", label: "(GMT−2) Fernando de Noronha" },
  { value: "UTC", label: "(GMT+0) UTC" },
];

function labelOf(list: { value: string; label: string }[], value: string) {
  return list.find((o) => o.value === value)?.label ?? value;
}

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useAwTheme();
  const [density, setDensity] = useState<DensityPreference>("comfortable");
  const [language, setLanguage] = useState("pt-BR");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");
  const [savedRegion, setSavedRegion] = useState({
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
  });
  const regionDirty =
    language !== savedRegion.language || timezone !== savedRegion.timezone;

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
            description="Idioma da plataforma e fuso horário."
          />

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AwField label="Idioma da plataforma">
              <AwDropdownMenu
                trigger={
                  <AwSelect className="w-full">
                    {labelOf(LANGUAGES, language)}
                  </AwSelect>
                }
                items={LANGUAGES.map((l) => ({
                  id: l.value,
                  label: l.label,
                  onSelect: () => setLanguage(l.value),
                }))}
              />
            </AwField>
            <AwField label="Fuso horário">
              <AwDropdownMenu
                trigger={
                  <AwSelect className="w-full">
                    {labelOf(TIMEZONES, timezone)}
                  </AwSelect>
                }
                items={TIMEZONES.map((t) => ({
                  id: t.value,
                  label: t.label,
                  onSelect: () => setTimezone(t.value),
                }))}
              />
            </AwField>
          </div>

          {regionDirty && (
            <div className="mt-4 flex justify-end">
              <AwButton
                size="sm"
                variant="primary"
                onClick={() => setSavedRegion({ language, timezone })}
              >
                Salvar
              </AwButton>
            </div>
          )}
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
