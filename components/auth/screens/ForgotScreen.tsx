"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations";
import { AwInput, AwField } from "@/components/ui/AwInput";
import { AwButton } from "@/components/ui/AwButton";
import type { Locale, AuthScreen } from "../_types";
import { COPY } from "../_copy";
import { BackButton } from "../_atoms";

export function ForgotScreen({
  locale,
  goTo,
  defaultEmail,
}: {
  locale: Locale;
  goTo: (s: AuthScreen) => void;
  defaultEmail?: string;
}) {
  const c = COPY.forgot[locale];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: defaultEmail ?? "" },
  });

  // Reset por link: envia para a confirmação de envio (resposta neutra,
  // sem confirmar se a conta existe). O usuário define a nova senha pelo
  // link recebido, não por código aqui.
  const onSubmit = async (data: ForgotPasswordFormData) => {
    console.log("Forgot:", data);
    goTo("resetLinkSent");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[380px] animate-fadeInUp">
      <BackButton onClick={() => goTo("email")} label={c.back} />

      <h3 className="text-aw-gray-1200 mb-2.5">{c.title}</h3>
      <p className="body-sm text-aw-gray-800 mb-6">{c.sub}</p>

      <div className="mb-4">
        <AwField label={c.email} htmlFor="forgotEmail" error={errors.email?.message}>
          <AwInput
            id="forgotEmail"
            type="email"
            placeholder={c.emailPh}
            autoComplete="email"
            invalid={!!errors.email}
            {...register("email")}
          />
        </AwField>
      </div>

      <AwButton variant="primary" size="md" block type="submit">
        {c.cta}
      </AwButton>
    </form>
  );
}
