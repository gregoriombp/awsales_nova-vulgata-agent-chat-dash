"use client";

import { useSyncExternalStore } from "react";
import { AwCortexSynthesis } from "@/components/ui/AwCortexSynthesis";

// Painel direito do fluxo de auth. Antes era um banco de fotos em escala de
// cinza (uma por etapa); agora é o shader Synthesis (@react-three/fiber). Uma
// única instância persiste entre as telas do fluxo, então o fundo flui de
// forma contínua conforme o usuário avança (login → e-mail → MFA → …) em vez
// de trocar de imagem a cada passo. Preset claro espelhando os controles do
// Synthesis (color1/2/3, animation speed, complexity, zoom scale, distortion,
// glow, flow frequency).
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
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-aw-gray-200">
        {mounted && (
          <AwCortexSynthesis
            backgroundColor="#ffffff"
            color1="#ffffff"
            color2="#f5fcff"
            color3="#cfd9dd"
            speed={0.2}
            complexity={6}
            scale={0.8}
            distortion={0}
            glowIntensity={0.7}
            flowFrequency={0.5}
          />
        )}
      </div>
    </section>
  );
}
