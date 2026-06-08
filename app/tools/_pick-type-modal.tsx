"use client";

/* ----------------------------------------------------------------
 * PickTypeModal — first step of the create flow.
 *
 * Splits the choice "where does this skill live?" into a single
 * binary up front (native vs custom) so the second screen — the
 * actual list of integrations — has room to breathe instead of
 * stacking native instances, custom integrations and a creation
 * affordance in the same scroll.
 *
 * The cards only carry intent: native = "reuse an OAuth/API key I
 * already authorized", custom = "point at my own HTTP service".
 * Whatever the user picks gates the next modal.
 * ---------------------------------------------------------------- */

import { AwButton } from "@/components/ui/AwButton";
import { AwModal } from "@/components/ui/AwModal";
import { Icon } from "@/components/ui/Icon";

export type CreateSkillType = "native" | "custom";

export function PickTypeModal({
  open,
  onClose,
  onPickType,
}: {
  open: boolean;
  onClose: () => void;
  onPickType: (type: CreateSkillType) => void;
}) {
  return (
    <AwModal
      open={open}
      onClose={onClose}
      title="Como você quer criar essa habilidade?"
      footer={
        <AwButton variant="secondary" size="md" onClick={onClose}>
          Cancelar
        </AwButton>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="m-0 body-xs text-(--fg-secondary)">
          Toda habilidade pertence a uma integração — ela herda a
          credencial. Comece escolhendo o tipo da integração pai.
        </p>

        <div className="flex flex-col gap-3">
          <TypeCard
            leading={
              <div
                className="flex items-center justify-center rounded-lg border border-(--border-subtle) bg-(--bg-canvas) text-(--fg-primary)"
                style={{ width: 56, height: 56 }}
              >
                <Icon name="extension" size={26} />
              </div>
            }
            title="Integração nativa"
            description="Reusa a credencial de uma integração que você já conectou — Hotmart, Stripe, Google Calendar, etc."
            footnote="Sem precisar configurar OAuth de novo."
            onClick={() => onPickType("native")}
          />

          <TypeCard
            leading={
              <div
                className="flex items-center justify-center rounded-lg bg-linear-to-br from-aw-blue-500 via-aw-purple-500 to-aw-teal-500 text-white"
                style={{ width: 56, height: 56 }}
              >
                <Icon name="bolt" size={28} />
              </div>
            }
            title="Integração personalizada"
            description="Aponta pra uma API HTTP sua que ainda não está no catálogo. Você escolhe o tipo de auth e cola o token."
            footnote="Ideal pra serviços internos ou APIs de nicho."
            onClick={() => onPickType("custom")}
          />
        </div>
      </div>
    </AwModal>
  );
}

function TypeCard({
  leading,
  title,
  description,
  footnote,
  onClick,
}: {
  leading: React.ReactNode;
  title: string;
  description: string;
  footnote: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-4 rounded-2xl border border-(--border-subtle) bg-(--bg-canvas) p-5 text-left transition-colors hover:bg-(--bg-hover) focus:outline-hidden focus-visible:bg-(--bg-hover)"
    >
      <div
        className="flex shrink-0 items-center justify-center"
        style={{ width: 56, height: 56 }}
      >
        {leading}
      </div>
      <div className="min-w-0 flex-1">
        <span className="block body-sm font-medium text-(--fg-primary)">
          {title}
        </span>
        <p className="m-0 mt-1 body-xs text-(--fg-secondary)">
          {description}
        </p>
        <span className="mt-2 block body-xs text-(--fg-tertiary)">
          {footnote}
        </span>
      </div>
      <Icon
        name="arrow_forward"
        size={20}
        className="shrink-0 self-center text-(--fg-tertiary)"
      />
    </button>
  );
}
