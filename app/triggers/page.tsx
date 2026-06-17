"use client";

import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import ComingSoon from "@/components/ComingSoon";
import { Icon } from "@/components/ui/Icon";

export default function TriggersPage() {
  const breadcrumbs = [
    {
      label: "Disparos",
      icon: <Icon name="send" size={20} fill={1} />,
    },
  ];

  return (
    <AwDashboardLayout breadcrumbs={breadcrumbs}>
      <ComingSoon />
    </AwDashboardLayout>
  );
}
