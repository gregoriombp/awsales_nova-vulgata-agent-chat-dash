"use client";

import Button from "@/components/Button";
import Input from "@/components/Input";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-heading font-bold text-white tracking-[-0.2px]">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-[#999999] mt-1 tracking-[0.18px]">
            {description}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-end gap-4">{children}</div>
    </section>
  );
}

export default function ComponentLibrary() {
  return (
    <div className="rounded-2xl bg-[#1a1a1a] border border-[#242424] p-8 flex flex-col gap-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-heading font-bold text-white tracking-[-0.2px]">
          Component library — AW
        </h1>
        <p className="text-sm text-[#999999] tracking-[0.18px]">
          AwSales design system components
        </p>
      </header>

      <Section
        title="Buttons"
        description="Primary, secondary, tertiary and danger variants in sm, md, lg."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="sm">
            Primary sm
          </Button>
          <Button variant="primary" size="md">
            Primary md
          </Button>
          <Button variant="primary" size="lg">
            Primary lg
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="md">
            Secondary
          </Button>
          <Button variant="tertiary" size="md">
            Tertiary
          </Button>
          <Button variant="danger" size="md">
            Danger
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="md" disabled>
            Disabled
          </Button>
          <Button variant="primary" size="md" isLoading>
            Loading
          </Button>
        </div>
      </Section>

      <Section
        title="Form inputs"
        description="Text input with label and optional error state."
      >
        <div className="flex flex-wrap gap-6 rounded-xl bg-[#f5f5f5] p-6 border border-[#e5e5e5]">
          <div className="w-full min-w-[200px] max-w-[320px]">
            <Input
              label="Label"
              placeholder="Placeholder"
              type="text"
            />
          </div>
          <div className="w-full min-w-[200px] max-w-[320px]">
            <Input
              label="With error"
              placeholder="Placeholder"
              error="Campo obrigatório"
            />
          </div>
        </div>
      </Section>
    </div>
  );
}
