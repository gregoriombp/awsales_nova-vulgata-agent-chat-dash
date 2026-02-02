"use client";

import DashboardLayout from "@/components/DashboardLayout";
import ComingSoon from "@/components/ComingSoon";

export default function HistoryPage() {
  const breadcrumbs = [
    {
      label: "Histórico de alterações",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 18.125C14.1421 18.125 17.5 14.7671 17.5 10.625C17.5 6.48286 14.1421 3.125 10 3.125C5.85786 3.125 2.5 6.48286 2.5 10.625" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M10 6.25V10.625L13.125 13.125" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M1.875 8.125L2.5 10.625L5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
