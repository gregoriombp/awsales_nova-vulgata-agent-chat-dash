"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { AwField } from "@/components/ui/AwInput";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { AwButton } from "@/components/ui/AwButton";
import { Icon } from "@/components/ui/Icon";
import type { Locale, AuthScreen } from "../_types";
import { COPY } from "../_copy";
import { PasswordInput, BackButton } from "../_atoms";

export function EmailLoginScreen({
  locale,
  goTo,
  defaultEmail,
  initialError,
}: {
  locale: Locale;
  goTo: (s: AuthScreen) => void;
  defaultEmail?: string;
  /** Pré-acende o erro inline de credencial (deep-link `?error=1` no hi-fi). */
  initialError?: boolean;
}) {
  const c = COPY.email[locale];
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(!!initialError);
  const [keepSigned, setKeepSigned] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: defaultEmail ?? "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(false);
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsLoading(false);
    // Hi-fi: a senha "errada" representa credencial inválida — leva ao erro
    // inline (genérico). Qualquer outra senha segue pro fluxo normal. Assim o
    // botão NÃO vai sempre pra verify e o estado de erro é alcançável.
    if (data.password.trim().toLowerCase() === "errada") {
      setServerError(true);
      return;
    }
    goTo("verify");
  };

  const pwError = errors.password?.message ?? (serverError ? c.errPw : undefined);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[380px] animate-fadeInUp">
      <BackButton onClick={() => goTo("login")} label={c.back} />

      <h3 className="text-aw-gray-1200 mb-2.5 text-center">{c.title}</h3>
      <p className="body-sm text-aw-gray-800 mb-6 text-center">{c.sub}</p>

      <input type="hidden" autoComplete="email" {...register("email")} />

      <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-aw-gray-300 bg-aw-gray-150 px-3 py-2">
        <span className="min-w-0 truncate body-sm text-aw-gray-1200">
          {defaultEmail || "—"}
        </span>
        <button
          type="button"
          onClick={() => goTo("login")}
          className="shrink-0 body-xs font-medium text-aw-gray-1200 hover:underline hover:underline-offset-[3px] hover:decoration-[1.5px]"
        >
          {c.changeEmail}
        </button>
      </div>

      <div className="mb-4">
        <AwField label={c.password} htmlFor="loginPw" error={pwError}>
          <PasswordInput
            id="loginPw"
            placeholder={c.passwordPh}
            invalid={!!errors.password || serverError}
            register={register("password")}
          />
        </AwField>
      </div>

      <div className="flex items-center justify-between -mt-1 mb-5">
        <label className="inline-flex items-center gap-2 body-xs text-aw-gray-900 cursor-pointer select-none">
          <AwCheckbox checked={keepSigned} onChange={setKeepSigned} />
          {c.keep}
        </label>
        <button
          type="button"
          onClick={() => goTo("forgot")}
          className="body-xs font-medium text-aw-gray-1200 hover:underline hover:underline-offset-[3px] hover:decoration-[1.5px]"
        >
          {c.forgot}
        </button>
      </div>

      <AwButton variant="primary" size="md" block type="submit" loading={isLoading}>
        {isLoading ? c.loadingCta : c.cta}
      </AwButton>

      <div className="mt-5 flex items-center gap-3" aria-hidden="true">
        <span className="flex-1 h-px bg-aw-gray-200" />
        <span className="body-xs text-aw-gray-700">{c.or}</span>
        <span className="flex-1 h-px bg-aw-gray-200" />
      </div>

      <p className="mt-4 text-center">
        <button
          type="button"
          onClick={() => goTo("magicSent")}
          className="inline-flex items-center gap-1.5 body-xs font-medium text-aw-gray-1200 hover:underline hover:underline-offset-[3px] hover:decoration-[1.5px]"
        >
          <Icon name="mail" size={14} />
          {c.magicLink}
        </button>
      </p>
    </form>
  );
}
