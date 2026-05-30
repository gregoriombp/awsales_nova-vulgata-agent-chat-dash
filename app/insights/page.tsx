"use client";

import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import ComingSoon from "@/components/ComingSoon";

export default function InsightsPage() {
  const breadcrumbs = [
    {
      label: "Insights",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.875 3.125L18.75 1.875L16.875 18.75L14.375 16.25L11.875 18.75L10 13.75L5 11.875L7.5 9.375L5 6.875L1.875 3.125Z" fill="currentColor"/>
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
