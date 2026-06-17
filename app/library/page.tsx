"use client";

import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import ComingSoon from "@/components/ComingSoon";
import { Icon } from "@/components/ui/Icon";

export default function LibraryPage() {
  const breadcrumbs = [
    {
      label: "Biblioteca",
      icon: <Icon name="book" size={20} />,
    },
  ];

  return (
    <AwDashboardLayout breadcrumbs={breadcrumbs}>
      <ComingSoon />
    </AwDashboardLayout>
  );
}
