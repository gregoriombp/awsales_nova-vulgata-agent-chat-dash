"use client";

import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import ComingSoon from "@/components/ComingSoon";

export default function TriggersPage() {
  const breadcrumbs = [
    {
      label: "Disparos",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.875 1.875L17.5 10L1.875 18.125L3.125 10L1.875 1.875Z" fill="currentColor"/>
        </svg>
      ),
    },
  ];

  return (
    <AwDashboardLayout breadcrumbs={breadcrumbs}>
      <ComingSoon />
    </AwDashboardLayout>
  );
}
