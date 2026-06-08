"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AwCard } from "@/components/ui/AwCard";
import { AwButton } from "@/components/ui/AwButton";
import { AwInput } from "@/components/ui/AwInput";

export default function BombardierLogin() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => setIsDark(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/bombardier"), 350);
  };

  return (
    <main
      className={`bombardier-login-page${isDark ? " dark" : ""}`}
      data-theme={isDark ? "dark" : "light"}
    >
      <div
        className="bombardier-login-wordmark"
        role="img"
        aria-label="Bombardier"
      />

      <div className="bombardier-login-content">
        <header className="bombardier-login-header">
          <p className="aw-eyebrow">Product Builder Platform</p>
          <h1 className="bombardier-login-title">Entre na plataforma</h1>
          <p className="bombardier-login-subtitle">
            Acesse seus projetos, page builder e design system.
          </p>
        </header>

        <AwCard className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-xs font-medium text-(--fg-secondary)"
              >
                E-mail
              </label>
              <AwInput
                id="email"
                type="email"
                placeholder="voce@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                iconLeft="mail"
                autoComplete="email"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-(--fg-secondary)"
                >
                  Senha
                </label>
                <Link
                  href="#"
                  className="text-xs text-(--fg-secondary) hover:text-(--fg-primary) no-underline"
                >
                  Esqueci a senha
                </Link>
              </div>
              <AwInput
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                iconLeft="lock"
                autoComplete="current-password"
                required
              />
            </div>

            <AwButton
              type="submit"
              variant="primary"
              iconRight={loading ? undefined : "arrow_forward"}
              disabled={loading}
              className="mt-2"
            >
              {loading ? "Entrando…" : "Entrar"}
            </AwButton>
          </form>
        </AwCard>

        <p className="bombardier-login-foot">
          Não tem acesso?{" "}
          <Link href="/primeiro-acesso" className="bombardier-login-foot-link">
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}
