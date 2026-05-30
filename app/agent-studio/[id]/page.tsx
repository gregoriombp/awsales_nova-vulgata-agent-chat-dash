"use client";

import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import ComingSoon from "@/components/ComingSoon";

export default function AgentDetailPage() {
  const breadcrumbs = [
    { label: "Agent Studio", href: "/agent-studio" },
    "Detalhes",
  ];

  return (
    <AwDashboardLayout breadcrumbs={breadcrumbs}>
      <ComingSoon />
    </AwDashboardLayout>
  );
}
