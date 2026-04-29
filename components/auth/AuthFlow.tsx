"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginFormData,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
} from "@/lib/validations";
import BrandPane from "./BrandPane";

export type AuthScreen =
  | "login"
  | "forgot"
  | "reset"
  | "verify"
  | "workspace"
  | "success";

type Locale = "pt" | "en";

/* ═══════════════════════════════════════════
   Bilingual copy dictionary
   ═══════════════════════════════════════════ */
const COPY = {
  login: {
    pt: {
      kicker: "// acesso",
      title: "Bem-vindo de volta",
      sub: "Entre na sua conta para continuar.",
      email: "Email",
      emailPh: "voce@empresa.com",
      password: "Senha",
      passwordPh: "Digite sua senha",
      keep: "Manter conectado",
      forgot: "Esqueci minha senha",
      cta: "Entrar",
      loadingCta: "Entrando\u2026",
      footer: "Ainda n\u00e3o tem conta?",
      footerLink: "Criar conta",
      errPw: "Senha incorreta. Tente novamente ou recupere sua senha.",
    },
    en: {
      kicker: "// access",
      title: "Welcome back",
      sub: "Sign in to your account to continue.",
      email: "Email",
      emailPh: "you@company.com",
      password: "Password",
      passwordPh: "Your password",
      keep: "Keep me signed in",
      forgot: "Forgot password",
      cta: "Sign in",
      loadingCta: "Signing in\u2026",
      footer: "Don\u2019t have an account?",
      footerLink: "Sign up",
      errPw: "Wrong password. Try again or recover your password.",
    },
  },
  forgot: {
    pt: {
      title: "Esqueceu sua senha?",
      sub: "Informe o email da sua conta. Enviaremos um link seguro para redefinir.",
      email: "Email",
      emailPh: "voce@empresa.com",
      cta: "Enviar link de redefini\u00e7\u00e3o",
      back: "Voltar ao login",
      kicker: "// recupera\u00e7\u00e3o",
    },
    en: {
      title: "Forgot your password?",
      sub: "Enter your account email. We\u2019ll send you a secure reset link.",
      email: "Email",
      emailPh: "you@company.com",
      cta: "Send reset link",
      back: "Back to sign in",
      kicker: "// recovery",
    },
  },
  reset: {
    pt: {
      kicker: "// nova senha",
      title: "Defina uma nova senha",
      sub: "Escolha uma senha forte. Ela deve conter ao menos 8 caracteres, uma letra mai\u00fascula e um n\u00famero.",
      newPw: "Nova senha",
      confirmPw: "Confirmar nova senha",
      pwPh: "Digite sua nova senha",
      confirmPh: "Digite novamente",
      cta: "Salvar nova senha",
      rule1: "8 caracteres ou mais",
      rule2: "Uma letra mai\u00fascula",
      rule3: "Um n\u00famero",
    },
    en: {
      kicker: "// new password",
      title: "Set a new password",
      sub: "Pick a strong password. It must have at least 8 characters, one capital letter and one number.",
      newPw: "New password",
      confirmPw: "Confirm new password",
      pwPh: "Type your new password",
      confirmPh: "Type it again",
      cta: "Save new password",
      rule1: "8 characters or more",
      rule2: "One capital letter",
      rule3: "One number",
    },
  },
  verify: {
    pt: {
      kicker: "// verifica\u00e7\u00e3o",
      title: "Verifique seu email",
      sub: "Enviamos um c\u00f3digo de 6 d\u00edgitos para",
      code: "C\u00f3digo de verifica\u00e7\u00e3o",
      cta: "Verificar e continuar",
      resend: "Reenviar em",
      resendReady: "Reenviar c\u00f3digo",
      change: "Usar outro email",
      back: "Voltar ao login",
    },
    en: {
      kicker: "// verify",
      title: "Verify your email",
      sub: "We sent a 6-digit code to",
      code: "Verification code",
      cta: "Verify and continue",
      resend: "Resend in",
      resendReady: "Resend code",
      change: "Use another email",
      back: "Back to sign in",
    },
  },
  workspace: {
    pt: {
      kicker: "// workspace",
      title: "Selecione um workspace",
      sub: "Voc\u00ea faz parte de 3 workspaces. Escolha onde quer trabalhar agora.",
      cta: "Continuar",
      create: "Criar novo workspace",
      change: "Trocar de conta",
    },
    en: {
      kicker: "// workspace",
      title: "Select a workspace",
      sub: "You belong to 3 workspaces. Pick where you want to work now.",
      cta: "Continue",
      create: "Create new workspace",
      change: "Switch account",
    },
  },
  success: {
    pt: {
      title: "Tudo certo!",
      sub: "Redirecionando voc\u00ea para a plataforma\u2026",
      cta: "Entrar agora",
    },
    en: {
      title: "You\u2019re all set!",
      sub: "Redirecting you to the platform\u2026",
      cta: "Enter now",
    },
  },
};

const STEPS: Record<AuthScreen, number> = {
  login: 1,
  forgot: 2,
  reset: 3,
  verify: 4,
  workspace: 5,
  success: 5,
};

const WORKSPACES_PT = [
  { ini: "A", name: "Aurora Infoprodutos", meta: "12 membros \u00b7 admin", tone: "blue" as const },
  { ini: "B", name: "Barbosa & Filhos", meta: "4 membros \u00b7 operador", tone: "ink" as const },
  { ini: "C", name: "Claudia Coach", meta: "1 membro \u00b7 dono", tone: "soft" as const },
];
const WORKSPACES_EN = [
  { ini: "A", name: "Aurora Infoproducts", meta: "12 members \u00b7 admin", tone: "blue" as const },
  { ini: "B", name: "Barbosa & Sons", meta: "4 members \u00b7 operator", tone: "ink" as const },
  { ini: "C", name: "Claudia Coach", meta: "1 member \u00b7 owner", tone: "soft" as const },
];

/* ═══════════════════════════════════════════
   Shared UI atoms
   ═══════════════════════════════════════════ */

function StepDots({ active, total = 5 }: { active: number; total?: number }) {
  return (
    <span className="inline-flex gap-[3px]">
      {Array.from({ length: total }).map((_, i) => (
        <i
          key={i}
          className={`block w-3.5 h-0.5 rounded-full ${
            i < active ? "bg-aw-gray-1200" : "bg-aw-gray-300"
          }`}
        />
      ))}
    </span>
  );
}

function StepIndicator({ kicker, active }: { kicker: string; active: number }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] uppercase text-aw-gray-600 mb-4">
      <span>{kicker}</span>
      <StepDots active={active} />
    </div>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-aw-gray-900 mb-1.5 tracking-[0.01em]">
      {children}
    </label>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
      <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7S2.5 12 2.5 12z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
      <path d="M3 3l18 18M10.5 6.2a9.5 9.5 0 011.5-.2c6 0 9.5 7 9.5 7a18.5 18.5 0 01-2.4 3.3M6.5 6.5C4 8.3 2.5 12 2.5 12s3.5 7 9.5 7c1.6 0 3-.4 4.2-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9.9 9.9a3 3 0 004.2 4.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7v6M12 17h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
      <path d="M5 12l5 5 9-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
      <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowOutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
      <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Checkbox({ label, defaultChecked = false }: { label: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <label className="inline-flex items-center gap-2 text-[13px] text-aw-gray-900 cursor-pointer select-none" onClick={() => setChecked(!checked)}>
      <span className={`flex items-center justify-center w-4 h-4 border-[1.5px] rounded transition-all ${
        checked ? "bg-aw-gray-1200 border-aw-gray-1200" : "border-aw-gray-500"
      }`}>
        {checked && (
          <svg viewBox="0 0 12 12" fill="none" width="10" height="10" className="text-white">
            <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </label>
  );
}

function PrimaryButton({
  children,
  onClick,
  loading,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex items-center justify-center gap-2 w-full h-11 px-4 text-sm font-medium tracking-[-0.1px] rounded-lg border border-transparent cursor-pointer bg-black text-white hover:bg-aw-gray-1000 hover:shadow-md active:translate-y-px disabled:bg-aw-gray-300 disabled:text-aw-gray-600 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-150"
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 w-full h-11 px-4 text-sm font-medium rounded-lg border border-aw-gray-300 bg-transparent text-aw-gray-1200 hover:bg-aw-gray-200 cursor-pointer transition-all duration-150"
    >
      {children}
    </button>
  );
}

function PasswordInput({
  id,
  placeholder,
  error,
  register,
}: {
  id: string;
  placeholder: string;
  error?: string;
  register: UseFormRegisterReturn;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className={`w-full h-11 px-3.5 pr-11 border rounded-lg bg-white text-sm text-aw-gray-1200 placeholder:text-aw-gray-600 outline-none transition-all duration-150 hover:border-aw-gray-400 focus:border-aw-blue-600 focus:shadow-[0_0_0_3px_rgba(47,118,230,0.28)] ${
          error ? "border-aw-red-500 shadow-[0_0_0_3px_rgba(223,91,91,0.18)]" : "border-aw-gray-300"
        }`}
        {...register}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-md text-aw-gray-700 hover:bg-aw-gray-200 hover:text-aw-gray-1200 transition-colors"
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Screens
   ═══════════════════════════════════════════ */

function LoginScreen({
  locale,
  goTo,
}: {
  locale: Locale;
  goTo: (s: AuthScreen) => void;
}) {
  const c = COPY.login[locale];
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(false);
    setIsLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 1500));
      console.log("Login:", data);
      goTo("verify");
    } catch {
      setServerError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[340px] animate-fadeInUp">
      <StepIndicator kicker={c.kicker} active={STEPS.login} />
      <h2 className="font-heading font-medium text-[30px] leading-[1.1] tracking-tight text-aw-gray-1200 mb-2.5">
        {c.title}
      </h2>
      <p className="text-sm text-aw-gray-800 leading-[1.45] mb-6">{c.sub}</p>

      {/* Email */}
      <div className="mb-4">
        <FieldLabel htmlFor="loginEmail">{c.email}</FieldLabel>
        <input
          id="loginEmail"
          type="email"
          placeholder={c.emailPh}
          autoComplete="email"
          className={`w-full h-11 px-3.5 border rounded-lg bg-white text-sm text-aw-gray-1200 placeholder:text-aw-gray-600 outline-none transition-all duration-150 hover:border-aw-gray-400 focus:border-aw-blue-600 focus:shadow-[0_0_0_3px_rgba(47,118,230,0.28)] ${
            errors.email ? "border-aw-red-500" : "border-aw-gray-300"
          }`}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-aw-red-700 mt-1.5 flex items-center gap-1.5">
            <AlertIcon />
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="mb-4">
        <FieldLabel htmlFor="loginPw">{c.password}</FieldLabel>
        <PasswordInput
          id="loginPw"
          placeholder={c.passwordPh}
          error={errors.password?.message || (serverError ? c.errPw : undefined)}
          register={register("password")}
        />
        {errors.password && (
          <p className="text-xs text-aw-red-700 mt-1.5 flex items-center gap-1.5">
            <AlertIcon />
            {errors.password.message}
          </p>
        )}
        {serverError && !errors.password && (
          <p className="text-xs text-aw-red-700 mt-1.5 flex items-center gap-1.5">
            <AlertIcon />
            {c.errPw}
          </p>
        )}
      </div>

      {/* Keep me signed in + Forgot */}
      <div className="flex items-center justify-between -mt-1 mb-5">
        <Checkbox label={c.keep} defaultChecked />
        <button
          type="button"
          onClick={() => goTo("forgot")}
          className="text-[13px] font-medium text-aw-gray-1200 hover:underline hover:underline-offset-[3px] hover:decoration-[1.5px]"
        >
          {c.forgot}
        </button>
      </div>

      <PrimaryButton type="submit" loading={isLoading}>
        {isLoading ? c.loadingCta : c.cta}
      </PrimaryButton>

      <div className="h-px bg-aw-gray-200 my-6" />
      <p className="text-[13px] text-aw-gray-800 text-center">
        {c.footer}{" "}
        <button type="button" className="font-medium text-aw-gray-1200 hover:underline hover:underline-offset-[3px] hover:decoration-[1.5px]">
          {c.footerLink}
        </button>
      </p>
    </form>
  );
}

function ForgotScreen({ locale, goTo }: { locale: Locale; goTo: (s: AuthScreen) => void }) {
  const c = COPY.forgot[locale];
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    console.log("Forgot:", data);
    goTo("verify");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[340px] animate-fadeInUp">
      <button type="button" onClick={() => goTo("login")} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-aw-gray-800 hover:text-aw-gray-1200 mb-6">
        <ChevLeftIcon /> {c.back}
      </button>

      <StepIndicator kicker={c.kicker} active={STEPS.forgot} />
      <h2 className="font-heading font-medium text-[30px] leading-[1.1] tracking-tight text-aw-gray-1200 mb-2.5">
        {c.title}
      </h2>
      <p className="text-sm text-aw-gray-800 leading-[1.45] mb-6">{c.sub}</p>

      <div className="mb-4">
        <FieldLabel htmlFor="forgotEmail">{c.email}</FieldLabel>
        <input
          id="forgotEmail"
          type="email"
          placeholder={c.emailPh}
          autoComplete="email"
          className={`w-full h-11 px-3.5 border rounded-lg bg-white text-sm text-aw-gray-1200 placeholder:text-aw-gray-600 outline-none transition-all duration-150 hover:border-aw-gray-400 focus:border-aw-blue-600 focus:shadow-[0_0_0_3px_rgba(47,118,230,0.28)] ${
            errors.email ? "border-aw-red-500" : "border-aw-gray-300"
          }`}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-aw-red-700 mt-1.5 flex items-center gap-1.5">
            <AlertIcon /> {errors.email.message}
          </p>
        )}
      </div>

      <PrimaryButton type="submit">{c.cta}</PrimaryButton>
    </form>
  );
}

function ResetScreen({ locale, goTo }: { locale: Locale; goTo: (s: AuthScreen) => void }) {
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
      <StepIndicator kicker={c.kicker} active={STEPS.reset} />
      <h2 className="font-heading font-medium text-[30px] leading-[1.1] tracking-tight text-aw-gray-1200 mb-2.5">
        {c.title}
      </h2>
      <p className="text-sm text-aw-gray-800 leading-[1.45] mb-6">{c.sub}</p>

      {/* New password */}
      <div className="mb-4">
        <FieldLabel htmlFor="newPw">{c.newPw}</FieldLabel>
        <PasswordInput id="newPw" placeholder={c.pwPh} error={errors.password?.message} register={register("password")} />
        {/* Strength meter */}
        <div className="flex gap-1 mt-2">
          {[0, 1, 2, 3].map((i) => (
            <i
              key={i}
              className={`flex-1 h-1 rounded-full ${
                i < strength ? "bg-aw-emerald-500" : "bg-aw-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Confirm password */}
      <div className="mb-4">
        <FieldLabel htmlFor="confirmPw">{c.confirmPw}</FieldLabel>
        <PasswordInput id="confirmPw" placeholder={c.confirmPh} error={errors.confirmPassword?.message} register={register("confirmPassword")} />
        {errors.confirmPassword && (
          <p className="text-xs text-aw-red-700 mt-1.5 flex items-center gap-1.5">
            <AlertIcon /> {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Rules */}
      <div className="flex flex-col gap-1.5 text-xs mb-4">
        <span className={`flex items-center gap-2 ${has8 ? "text-aw-emerald-700" : "text-aw-gray-800"}`}>
          <CheckIcon /> {c.rule1}
        </span>
        <span className={`flex items-center gap-2 ${hasUpper ? "text-aw-emerald-700" : "text-aw-gray-800"}`}>
          <CheckIcon /> {c.rule2}
        </span>
        <span className={`flex items-center gap-2 ${hasNumber ? "text-aw-emerald-700" : "text-aw-gray-800"}`}>
          <CheckIcon /> {c.rule3}
        </span>
      </div>

      <div className="h-4" />
      <PrimaryButton type="submit">{c.cta}</PrimaryButton>
    </form>
  );
}

function VerifyScreen({ locale, goTo, email }: { locale: Locale; goTo: (s: AuthScreen) => void; email: string }) {
  const c = COPY.verify[locale];
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(28);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((p) => p - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const handleChange = (idx: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
    if (value && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = [...otp];
    text.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    const focusIdx = Math.min(text.length, 5);
    inputsRef.current[focusIdx]?.focus();
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <div className="w-full max-w-[340px] animate-fadeInUp">
      <button type="button" onClick={() => goTo("login")} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-aw-gray-800 hover:text-aw-gray-1200 mb-6">
        <ChevLeftIcon /> {c.back}
      </button>

      <StepIndicator kicker={c.kicker} active={STEPS.verify} />
      <h2 className="font-heading font-medium text-[30px] leading-[1.1] tracking-tight text-aw-gray-1200 mb-2.5">
        {c.title}
      </h2>
      <p className="text-sm text-aw-gray-800 leading-[1.45] mb-6">
        {c.sub} <b className="font-semibold text-aw-gray-1200">{email}</b>.
        {locale === "pt" ? " Cole abaixo para continuar." : " Paste it below to continue."}
      </p>

      <div className="mb-4">
        <FieldLabel>{c.code}</FieldLabel>
        <div className="flex gap-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputsRef.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              className={`w-12 h-[54px] border rounded-lg bg-white text-center font-mono text-[22px] font-medium text-aw-gray-1200 outline-none transition-all duration-150 focus:border-aw-blue-600 focus:shadow-[0_0_0_3px_rgba(47,118,230,0.28)] ${
                digit ? "bg-aw-gray-150 border-aw-gray-300" : "border-aw-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      <PrimaryButton onClick={() => goTo("workspace")} disabled={!isComplete}>
        {c.cta}
      </PrimaryButton>

      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-aw-gray-700">
          {countdown > 0 ? `${c.resend} 00:${String(countdown).padStart(2, "0")}` : (
            <button type="button" onClick={() => setCountdown(28)} className="font-medium text-aw-gray-1200 hover:underline">
              {c.resendReady}
            </button>
          )}
        </span>
        <button type="button" onClick={() => goTo("forgot")} className="text-[13px] font-medium text-aw-gray-1200 hover:underline hover:underline-offset-[3px] hover:decoration-[1.5px]">
          {c.change}
        </button>
      </div>
    </div>
  );
}

function WorkspaceScreen({ locale, goTo }: { locale: Locale; goTo: (s: AuthScreen) => void }) {
  const c = COPY.workspace[locale];
  const workspaces = locale === "pt" ? WORKSPACES_PT : WORKSPACES_EN;
  const [selected, setSelected] = useState(0);

  const toneBg: Record<string, string> = {
    blue: "bg-[#1B76F2] text-white",
    ink: "bg-aw-gray-1200 text-white",
    soft: "bg-aw-gray-150 text-aw-gray-1200 border border-aw-gray-300",
  };

  return (
    <div className="w-full max-w-[340px] animate-fadeInUp">
      <StepIndicator kicker={c.kicker} active={STEPS.workspace} />
      <h2 className="font-heading font-medium text-[30px] leading-[1.1] tracking-tight text-aw-gray-1200 mb-2.5">
        {c.title}
      </h2>
      <p className="text-sm text-aw-gray-800 leading-[1.45] mb-6">{c.sub}</p>

      <div className="flex flex-col gap-2 mb-5">
        {workspaces.map((ws, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected(i)}
            className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-150 cursor-pointer ${
              selected === i
                ? "border-aw-gray-1200 bg-white shadow-[0_0_0_1px_#0d0d0d]"
                : "border-aw-gray-300 bg-white hover:border-aw-gray-400 hover:bg-aw-gray-150"
            }`}
          >
            <span className={`w-9 h-9 rounded-lg flex items-center justify-center font-heading font-medium text-[15px] shrink-0 ${toneBg[ws.tone]}`}>
              {ws.ini}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium text-aw-gray-1200">{ws.name}</span>
              <span className="block text-xs text-aw-gray-700 mt-0.5">{ws.meta}</span>
            </span>
            <span className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${
              selected === i ? "border-aw-gray-1200" : "border-aw-gray-400"
            }`}>
              {selected === i && <span className="w-2 h-2 rounded-full bg-aw-gray-1200" />}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        className="flex items-center gap-2 w-full p-3 rounded-lg border border-dashed border-aw-gray-400 text-[13px] text-aw-gray-900 hover:border-aw-gray-1200 hover:text-aw-gray-1200 hover:bg-aw-gray-150 transition-all cursor-pointer"
      >
        <PlusIcon /> {c.create}
      </button>

      <div className="h-4" />
      <PrimaryButton onClick={() => goTo("success")}>{c.cta}</PrimaryButton>

      <div className="h-px bg-aw-gray-200 my-6" />
      <p className="text-[13px] text-center">
        <button type="button" onClick={() => goTo("login")} className="font-medium text-aw-gray-1200 hover:underline hover:underline-offset-[3px] hover:decoration-[1.5px]">
          {c.change}
        </button>
      </p>
    </div>
  );
}

function SuccessScreen({ locale, goTo }: { locale: Locale; goTo: (s: AuthScreen) => void }) {
  const c = COPY.success[locale];
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/dashboard"), 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="w-full max-w-[340px] animate-fadeInUp">
      <div className="w-14 h-14 rounded-full bg-aw-emerald-500 flex items-center justify-center mb-5 text-white" style={{ boxShadow: "0 0 0 8px rgba(91,223,158,0.15)" }}>
        <CheckIcon size={28} />
      </div>
      <h2 className="font-heading font-medium text-[30px] leading-[1.1] tracking-tight text-aw-gray-1200 mb-2.5">
        {c.title}
      </h2>
      <p className="text-sm text-aw-gray-800 leading-[1.45] mb-6">{c.sub}</p>
      <PrimaryButton onClick={() => router.push("/dashboard")}>
        {c.cta} <ArrowOutIcon />
      </PrimaryButton>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main AuthFlow Component
   ═══════════════════════════════════════════ */

export default function AuthFlow() {
  const [screen, setScreen] = useState<AuthScreen>("login");
  const [locale, setLocale] = useState<Locale>("pt");
  const [email, setEmail] = useState("ana@awsales.com");

  const goTo = useCallback((s: AuthScreen) => setScreen(s), []);

  const renderScreen = () => {
    switch (screen) {
      case "login":
        return <LoginScreen locale={locale} goTo={goTo} />;
      case "forgot":
        return <ForgotScreen locale={locale} goTo={goTo} />;
      case "reset":
        return <ResetScreen locale={locale} goTo={goTo} />;
      case "verify":
        return <VerifyScreen locale={locale} goTo={goTo} email={email} />;
      case "workspace":
        return <WorkspaceScreen locale={locale} goTo={goTo} />;
      case "success":
        return <SuccessScreen locale={locale} goTo={goTo} />;
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[440px_1fr] xl:grid-cols-[520px_1fr]">
      {/* Left rail */}
      <aside className="flex flex-col bg-white border-r border-aw-gray-300 px-8 py-8 xl:px-12 min-h-screen">
        {/* Brand + locale toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="w-7 h-7 rounded-[7px] flex items-center justify-center text-white font-heading font-medium text-[15px] tracking-tight" style={{ background: "linear-gradient(180deg, #1B76F2 0%, #0071C2 100%)" }}>
              A
            </span>
            <span className="font-heading font-medium text-sm text-aw-gray-1200 ml-2.5 tracking-[-0.01em]">
              AW sales
            </span>
          </div>
          <div className="flex items-center border border-aw-gray-300 rounded-[7px] overflow-hidden h-7">
            {(["pt", "en"] as Locale[]).map((l) => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                className={`px-2.5 h-full text-xs font-medium tracking-[0.02em] transition-colors cursor-pointer ${
                  locale === l
                    ? "bg-aw-gray-1200 text-white"
                    : "bg-transparent text-aw-gray-800 hover:text-aw-gray-1200"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Form host */}
        <div className="flex-1 flex items-center min-h-0">
          {renderScreen()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 text-xs text-aw-gray-700">
          <span>
            {locale === "pt" ? "tela" : "screen"}{" "}
            {STEPS[screen]}
          </span>
          <div className="flex gap-1">
            <a href="#" className="text-aw-gray-800 hover:text-aw-gray-1200 hover:underline">
              {locale === "pt" ? "Termos" : "Terms"}
            </a>
            <span>\u00b7</span>
            <a href="#" className="text-aw-gray-800 hover:text-aw-gray-1200 hover:underline">
              {locale === "pt" ? "Privacidade" : "Privacy"}
            </a>
          </div>
        </div>
      </aside>

      {/* Right pane */}
      <BrandPane screen={screen} locale={locale} />
    </div>
  );
}
