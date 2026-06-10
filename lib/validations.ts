import { z } from "zod";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  isLeakedPassword,
} from "./password-policy";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe seu e-mail")
    .email("Digite um e-mail válido"),
  password: z
    .string()
    .min(1, "Informe sua senha"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Informe seu e-mail")
    .email("Digite um e-mail válido"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Use no mínimo ${PASSWORD_MIN_LENGTH} caracteres`)
    // Limite máximo: decisão de produto Aswork, não exigência da NIST. Ver
    // lib/password-policy.ts.
    .max(PASSWORD_MAX_LENGTH, `Use no máximo ${PASSWORD_MAX_LENGTH} caracteres`)
    // Blocklist de senhas vazadas (mock do HIBP). Cumpre a promessa da copy
    // "bloqueamos senhas que já vazaram".
    .refine((pw) => !isLeakedPassword(pw), {
      message: "Essa senha apareceu em vazamentos. Escolha outra.",
    }),
  confirmPassword: z.string().min(1, "Confirme sua senha"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const otpSchema = z.object({
  code: z.string().length(6, "O código tem 6 dígitos"),
});

export type OtpFormData = z.infer<typeof otpSchema>;
