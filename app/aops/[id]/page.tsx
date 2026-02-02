"use client";

import DashboardLayout from "@/components/DashboardLayout";
import ComingSoon from "@/components/ComingSoon";

export default function AOPDetailPage() {
  const breadcrumbs = [
    {
      label: "AOPs",
      href: "/aops",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.125 1.875H16.875V15.625H3.125V1.875Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M6.25 5H13.75M6.25 8.125H13.75M6.25 11.25H13.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    "Detalhes",
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <ComingSoon />
    </DashboardLayout>
  );
}
