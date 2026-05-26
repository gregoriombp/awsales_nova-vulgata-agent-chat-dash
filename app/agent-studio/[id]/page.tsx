"use client";

import DashboardLayout from "@/components/DashboardLayout";
import ComingSoon from "@/components/ComingSoon";

export default function AgentDetailPage() {
  const breadcrumbs = [
    { label: "Agent Studio", href: "/agent-studio" },
    "Detalhes",
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <ComingSoon />
    </DashboardLayout>
  );
}
