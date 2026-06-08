"use client";

import { useSyncExternalStore } from "react";
import { AwBeams } from "@/components/ui/AwBeams";

// Painel direito do fluxo de auth. Antes era um banco de fotos em escala de
// cinza (uma por etapa); agora é o fundo Beams — feixes de luz volumétricos
// (WebGL, portado do reactbits.dev). Uma única instância persiste entre as
// telas do fluxo, então o fundo flui contínuo conforme o usuário avança
// (login → e-mail → MFA → …). Presets vindos dos controles do reactbits.
export default function BrandPane() {
  // O Canvas WebGL é client-only; `mounted` fica false no SSR e true no
  // cliente (mesmo padrão da welcome do memory-base), evitando divergência de
  // hidratação na rota de login.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <section className="relative hidden lg:flex items-center justify-center min-h-screen bg-white p-2 xl:p-3">
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-(--bg-inverse)">
        {mounted && (
          <AwBeams
            backgroundColor="#00000000"
            beamWidth={5.5}
            beamHeight={30}
            beamNumber={29}
            lightColor="#ffffff"
            speed={2}
            noiseIntensity={1.75}
            scale={0.2}
            rotation={0}
          />
        )}
      </div>
    </section>
  );
}
