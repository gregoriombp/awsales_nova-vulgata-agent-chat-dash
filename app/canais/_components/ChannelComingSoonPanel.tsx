"use client";

import { useRouter } from "next/navigation";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import { Icon } from "@/components/ui/Icon";

export function ChannelComingSoonPanel({
  brand,
  name,
  description,
}: {
  brand: string;
  name: string;
  description: string;
}) {
  const router = useRouter();
  return (
    <div className="flex min-h-full items-center justify-center px-10 py-16">
      <section className="flex w-full max-w-[520px] flex-col items-center text-center">
        <AwBrandLogo brand={brand} size="lg" />
        <h4 className="m-0 mt-6 text-(--fg-primary)">
          {name}
        </h4>
        <p className="m-0 mt-2 body-sm text-(--fg-secondary)">
          {description}
        </p>

        <div className="mt-8 flex w-full items-start gap-3 rounded-xl border border-(--border-subtle) bg-(--bg-surface) p-4 text-left">
          <Icon
            name="construction"
            size={20}
            className="mt-0.5 text-(--fg-secondary)"
          />
          <div>
            <p className="m-0 body-xs font-medium text-(--fg-primary)">
              Painel de configuração em construção
            </p>
            <p className="m-0 mt-1 body-xs text-(--fg-secondary)">
              Em breve você vai gerenciar contas, permissões e respostas
              automáticas do {name} direto por aqui.
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          <AwButton
            variant="secondary"
            size="md"
            iconLeft="arrow_back"
            onClick={() => router.push("/canais")}
          >
            Voltar para Canais
          </AwButton>
        </div>
      </section>
    </div>
  );
}
