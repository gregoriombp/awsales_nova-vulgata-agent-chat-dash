"use client";

import DashboardLayout from "@/components/DashboardLayout";
import ComingSoon from "@/components/ComingSoon";
import { Icon } from "@/components/ui/Icon";

export default function AgentDetailPage() {
  const breadcrumbs = [
    {
      label: "Agent Studio",
      href: "/agent-studio",
      icon: <Icon name="agent_studio" size={20} />,
    },
    "Detalhes",
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <ComingSoon />
    </DashboardLayout>
  );
}
