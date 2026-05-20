"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations";
import { AwField } from "@/components/ui/AwInput";
import { AwButton } from "@/components/ui/AwButton";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { Locale, AuthScreen } from "../_types";
import { COPY } from "../_copy";
import { PasswordInput } from "../_atoms";

export function ResetScreen({
  locale,
  goTo,
}: {
  locale: Locale;
  goTo: (s: AuthScreen) => void;
}) {
  const c = COPY.reset[locale];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({ resolver: zodResolver(resetPasswordSchema) });

  const pw = watch("password", "");
  const has8 = pw.length >= 8;
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const strength = [has8, hasUpper, hasNumber].filter(Boolean).length;

  const onSubmit = async (data: ResetPasswordFormData) => {
    console.log("Reset:", data);
    goTo("success");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[340px] animate-fadeInUp">
      <h3 className="text-aw-gray-1200 mb-2.5">{c.title}</h3>
      <p className="body-sm text-aw-gray-800 mb-6">{c.sub}</p>

      <div className="mb-4">
        <AwField label={c.newPw} htmlFor="newPw" error={errors.password?.message}>
          <PasswordInput
            id="newPw"
            placeholder={c.pwPh}
            invalid={!!errors.password}
            register={register("password")}
          />
        </AwField>
        <div className="flex gap-1 mt-2">
          {[0, 1, 2, 3].map((i) => (
            <i
              key={i}
              className={cn(
                "flex-1 h-1 rounded-full not-italic",
                i < strength ? "bg-aw-emerald-500" : "bg-aw-gray-300"
              )}
            />
          ))}
        </div>
      </div>

      <div className="mb-4">
        <AwField label={c.confirmPw} htmlFor="confirmPw" error={errors.confirmPassword?.message}>
          <PasswordInput
            id="confirmPw"
            placeholder={c.confirmPh}
            invalid={!!errors.confirmPassword}
            register={register("confirmPassword")}
          />
        </AwField>
      </div>

      <div className="flex flex-col gap-1.5 body-xs mb-4">
        <span className={cn("flex items-center gap-2", has8 ? "text-aw-emerald-700" : "text-aw-gray-800")}>
          <Icon name="check" size={14} /> {c.rule1}
        </span>
        <span className={cn("flex items-center gap-2", hasUpper ? "text-aw-emerald-700" : "text-aw-gray-800")}>
          <Icon name="check" size={14} /> {c.rule2}
        </span>
        <span className={cn("flex items-center gap-2", hasNumber ? "text-aw-emerald-700" : "text-aw-gray-800")}>
          <Icon name="check" size={14} /> {c.rule3}
        </span>
      </div>

      <div className="h-4" />
      <AwButton variant="primary" size="md" block type="submit">
        {c.cta}
      </AwButton>
    </form>
  );
}
