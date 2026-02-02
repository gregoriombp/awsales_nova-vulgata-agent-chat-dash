"use client";

import DashboardLayout from "@/components/DashboardLayout";
import ComingSoon from "@/components/ComingSoon";

export default function ToolsPage() {
  const breadcrumbs = [
    {
      label: "Tools",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.625 1.875L11.875 5.625L8.125 1.875M8.125 1.875L4.375 5.625L1.875 3.125V18.125H18.125V3.125L15.625 5.625" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
    },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <ComingSoon />
    </DashboardLayout>
  );
}
