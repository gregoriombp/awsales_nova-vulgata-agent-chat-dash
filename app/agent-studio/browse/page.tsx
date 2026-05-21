"use client";

import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { AwButton } from "@/components/ui/AwButton";
import { AwPageHeader } from "@/components/ui/AwPageHeader";
import { Icon } from "@/components/ui/Icon";
import { AgentTile, type AgentTileTone } from "@/components/playground/AgentTile";

type Agent = {
  id: string;
  icon: string;
  tone: AgentTileTone;
  title: string;
  description: string;
  authorName: string;
  count: number;
};

const MY_AGENTS: Agent[] = [
  {
    id: "sales",
    icon: "show_chart",
    tone: "lime",
    title: "Sales agent",
    description:
      "Designed to help manage sales processes and maximize customer engagement.",
    authorName: "Alex Smith",
    count: 1,
  },
  {
    id: "customer-support",
    icon: "support_agent",
    tone: "amber",
    title: "Customer support agent",
    description:
      "Designed to resolve sensitive issues efficiently while ensuring a positive customer experience.",
    authorName: "Alex Smith",
    count: 0,
  },
  {
    id: "hr",
    icon: "badge",
    tone: "emerald",
    title: "HR agent",
    description:
      "Designed to provide guidance on HR policies, employee relations, and recruitment.",
    authorName: "Alex Smith",
    count: 0,
  },
  {
    id: "it-support",
    icon: "verified_user",
    tone: "emerald",
    title: "IT support agent",
    description:
      "Designed to help troubleshoot and resolve technical issues efficiently.",
    authorName: "Alex Smith",
    count: 0,
  },
  {
    id: "legal",
    icon: "work",
    tone: "neutral",
    title: "Legal agent",
    description: "Designed to support drafting and analyzing legal documents.",
    authorName: "Alex Smith",
    count: 0,
  },
  {
    id: "marketing",
    icon: "forum",
    tone: "neutral",
    title: "Marketing agent",
    description:
      "Designed to support content creation, marketing campaign management, and data analysis.",
    authorName: "Alex Smith",
    count: 0,
  },
  {
    id: "product-info",
    icon: "search",
    tone: "neutral",
    title: "Product information agent",
    description:
      "Designed to provide accurate product information and support more informed decisions.",
    authorName: "Alex Smith",
    count: 0,
  },
  {
    id: "as-mobbin",
    icon: "verified",
    tone: "neutral",
    title: "AS Mobbin Strategist",
    description:
      "Expert agent for Project AS Mobbin. Connects technical architecture (Serverless/NoSQL) with user data to drive 20% DAU growth and proactive UX solutions.",
    authorName: "Alex Smith",
    count: 0,
  },
];

const ALL_AGENTS: Agent[] = [
  {
    id: "research",
    icon: "menu_book",
    tone: "purple",
    title: "Research agent",
    description:
      "Synthesizes market briefs, competitor landscapes and customer signals into shareable summaries.",
    authorName: "Bea Costa",
    count: 12,
  },
  {
    id: "qa",
    icon: "rule",
    tone: "blue",
    title: "QA agent",
    description:
      "Reviews release notes, checks for regressions and flags risky merges before they ship.",
    authorName: "Carlos Sun",
    count: 8,
  },
  {
    id: "onboarding",
    icon: "celebration",
    tone: "pink",
    title: "Onboarding agent",
    description:
      "Guides new teammates through workspace setup, integrations and the first 90-day playbook.",
    authorName: "Dani Rocha",
    count: 5,
  },
  {
    id: "data",
    icon: "insights",
    tone: "neutral",
    title: "Data analyst agent",
    description:
      "Runs ad-hoc queries, drafts dashboards and writes up insights with sources attached.",
    authorName: "Eva Lima",
    count: 3,
  },
];

export default function BrowseAgentsPage() {
  const breadcrumbs = [
    { label: "Início", href: "/inicio" },
    {
      label: "Agent Studio",
      href: "/agent-studio",
      icon: <Icon name="agent_studio" size={20} />,
    },
    { label: "Browse" },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-16 pt-8 sm:px-10">
        <AwPageHeader
          size="hero"
          title="Browse agents"
          description="Discover and create custom agents that combine instructions, extra knowledge, and any combination of tasks."
          actions={
            <AwButton asChild variant="secondary" size="md" iconLeft="add">
              <Link href="/agent-studio/new">Create</Link>
            </AwButton>
          }
          divider={false}
        />

        <Section title="My agents">
          <AgentGrid agents={MY_AGENTS} />
        </Section>

        <div className="mt-14 border-t border-[var(--border-subtle)]" />

        <Section title="All agents">
          <AgentGrid agents={ALL_AGENTS} />
        </Section>
      </div>
    </DashboardLayout>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="mb-6 text-[20px] font-medium leading-tight tracking-[-0.01em] text-[var(--fg-primary)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function AgentGrid({ agents }: { agents: Agent[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-2">
      {agents.map((agent) => (
        <AgentTile
          key={agent.id}
          icon={agent.icon}
          tone={agent.tone}
          title={agent.title}
          description={agent.description}
          authorName={agent.authorName}
          count={agent.count}
          href={`/agent-studio/${agent.id}`}
        />
      ))}
    </div>
  );
}
