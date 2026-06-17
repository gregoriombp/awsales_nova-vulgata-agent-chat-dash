"use client";

import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import ComingSoon from "@/components/ComingSoon";
import { Icon } from "@/components/ui/Icon";

export default function ConversationDetailPage() {
  const breadcrumbs = [
    {
      label: "Conversas",
      href: "/conversations",
      icon: <Icon name="chat" size={20} />,
    },
    "Detalhes",
  ];

  return (
    <AwDashboardLayout breadcrumbs={breadcrumbs}>
      <ComingSoon />
    </AwDashboardLayout>
  );
}
