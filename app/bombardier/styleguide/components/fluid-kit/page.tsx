import { PageHero } from "../../_primitives";
import { FormControlsSection } from "./sections/FormControlsSection";
import { ContainersSection } from "./sections/ContainersSection";

export default function Page() {
  return (
    <div className="flex flex-col gap-14">
      <PageHero title="Fluid kit" trailing={<span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-fg-muted">preview · leva 1</span>}>
        Motores de interação trazidos do Fluid Functionalism (spring physics) e adaptados
        aos tokens AwSales — Neue Haas Grotesk Display no lugar de Inter, Material Symbols no lugar de Lucide e
        as 10 famílias de cor do sistema. Esta página valida o visual antes de os wrappers
        Aw existentes (AwToggle, AwCheckbox, AwModal, AwDropdownMenu, AwSlider e os demais)
        migrarem para estes motores na leva 2. Os componentes novos do kit já têm página
        própria: Ask user questions, Input message e Thinking steps.
      </PageHero>
      <FormControlsSection />
      <ContainersSection />
    </div>
  );
}
