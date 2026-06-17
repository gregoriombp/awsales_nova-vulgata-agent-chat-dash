"use client";

import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import ComingSoon from "@/components/ComingSoon";
import { Icon } from "@/components/ui/Icon";

export default function InsightsPage() {
  const breadcrumbs = [
    {
      label: "Insights",
      icon: <Icon name="insights" size={20} fill={1} />,
    },
  ];

  return (
    <AwDashboardLayout breadcrumbs={breadcrumbs}>
      <ComingSoon />
    </AwDashboardLayout>
  );
}
