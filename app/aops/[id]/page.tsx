"use client";

import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import ComingSoon from "@/components/ComingSoon";
import { Icon } from "@/components/ui/Icon";

export default function AOPDetailPage() {
  const breadcrumbs = [
    {
      label: "AOPs",
      href: "/aops",
      icon: <Icon name="description" size={20} />,
    },
    "Detalhes",
  ];

  return (
    <AwDashboardLayout breadcrumbs={breadcrumbs}>
      <ComingSoon />
    </AwDashboardLayout>
  );
}
