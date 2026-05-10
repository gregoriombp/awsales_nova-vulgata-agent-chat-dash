"use client";

/**
 * AwOptionList — wrapper around the @tool-ui/option-list primitive.
 *
 * The Tool UI primitive lives at `@/components/tool-ui/option-list/` and is a
 * Tool-UI surface designed for assistant tool calls (multi/single-select with
 * action footer + receipt mode). The internal classes were retokenised in
 * place to use AwSales semantic tokens (`--bg-raised`, `--fg-primary`,
 * `--border-subtle`, etc.) — see `components/tool-ui/option-list/option-list.tsx`.
 *
 * Pages and features should always import the `Aw*` re-export below — never
 * the underlying tool-ui module directly. This keeps the design-system surface
 * consistent and allows future tweaks (defaults, theming, telemetry) to land
 * in one place without touching every consumer.
 */

export { OptionList as AwOptionList } from "@/components/tool-ui/option-list";
export type {
  OptionListOption as AwOptionListOption,
  OptionListProps as AwOptionListProps,
  OptionListSelection as AwOptionListSelection,
  SerializableOptionList as AwSerializableOptionList,
} from "@/components/tool-ui/option-list";
