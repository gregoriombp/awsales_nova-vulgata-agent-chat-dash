import { brl } from "./data";

type MoneyHeadingSize = "md" | "sm";

export function MoneyHeading({
  value,
  size = "md",
  as = "h1",
}: {
  value: number;
  size?: MoneyHeadingSize;
  as?: "h1" | "h6" | "p";
}) {
  const Tag = as;
  const cls = size === "md" ? "display-md" : "display-sm";
  return (
    <Tag className={`m-0 ${cls} tabular-nums text-[var(--fg-primary)]`}>
      <span className="mr-1 text-[0.45em] font-normal text-[var(--fg-tertiary)]">
        R$
      </span>
      {brl(value).replace(/^R\$\s*/, "")}
    </Tag>
  );
}
