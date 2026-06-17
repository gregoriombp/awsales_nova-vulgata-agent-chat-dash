"use client";

import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import ComingSoon from "@/components/ComingSoon";
import { Icon } from "@/components/ui/Icon";

export default function ApprovalsPage() {
  const breadcrumbs = [
    {
      label: "Aprovações",
      icon: <Icon name="done_all" size={20} />,
    },
  ];

  return (
    <AwDashboardLayout breadcrumbs={breadcrumbs}>
      <ComingSoon />
    </AwDashboardLayout>
  );
}
