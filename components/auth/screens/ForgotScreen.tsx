"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations";
import { AwInput, AwField } from "@/components/ui/AwInput";
import { AwButton } from "@/components/ui/AwButton";
import type { Locale, AuthScreen, VerifyMode } from "../_types";
import { COPY } from "../_copy";
import { BackButton } from "../_atoms";

export function ForgotScreen({
  locale,
  goTo,
  defaultEmail,
  setVerifyMode,
}: {
  locale: Locale;
  goTo: (s: AuthScreen) => void;
  defaultEmail?: string;
  setVerifyMode: (m: VerifyMode) => void;
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

  const onSubmit = async (data: ForgotPasswordFormData) => {
    console.log("Forgot:", data);
    setVerifyMode("reset");
    goTo("verify");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[340px] animate-fadeInUp">
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
