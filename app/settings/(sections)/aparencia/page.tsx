"use client";

import { useState } from "react";
import { AwCard } from "@/components/ui/AwCard";
import { AwField } from "@/components/ui/AwInput";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwToggleRow } from "@/components/ui/AwToggle";
import { Icon } from "@/components/ui/Icon";
import { SettingsPageHeader } from "../_components/shared";

type Theme = "system" | "light" | "dark";
type Density = "comfortable" | "compact";

export default function AppearanceSettingsPage() {
  const [theme, setTheme] = useState<Theme>("light");
  const [density] = useState<Density>("comfortable");
  const [reduceMotion, setReduceMotion] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[760px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Aparência"
        description="Aplica somente para sua conta, neste navegador."
      />
      <AwCard className="!p-0">
        <div className="border-b border-[var(--border-subtle)] px-6 py-5">
          <p className="m-0 mb-3 body-xs font-medium text-[var(--fg-primary)]">
            Tema
          </p>
          <div className="flex flex-wrap gap-3">
            {(
              [
                { id: "system", label: "Sistema", icon: "computer" },
                { id: "light", label: "Claro", icon: "light_mode" },
                { id: "dark", label: "Escuro", icon: "dark_mode" },
              ] as { id: Theme; label: string; icon: string }[]
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
                      ? "border-[var(--fg-primary)] bg-[var(--bg-raised)] shadow-xs"
                      : "border-[var(--border-default)] bg-[var(--bg-raised)] hover:border-[var(--border-strong)]")
                  }
                >
                  <Icon name={t.icon} size={18} />
                  <span className="body-xs font-medium text-[var(--fg-primary)]">
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-2">
          <AwField
            label="Densidade"
            helper="Compacta reduz o espaçamento de listas e tabelas."
          >
            <AwSelect>
              {density === "comfortable" ? "Confortável" : "Compacta"}
            </AwSelect>
          </AwField>
          <AwField label="Idioma da interface">
            <AwSelect>Português (Brasil)</AwSelect>
          </AwField>
        </div>
        <div className="border-t border-[var(--border-subtle)] px-6 py-2">
          <AwToggleRow
            title="Reduzir movimento"
            description="Suaviza ou desativa transições e parallax."
            checked={reduceMotion}
            onChange={setReduceMotion}
          />
        </div>
      </AwCard>
    </div>
  );
}
