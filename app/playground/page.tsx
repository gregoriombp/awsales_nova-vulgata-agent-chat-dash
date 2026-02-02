"use client";

import DashboardLayout from "@/components/DashboardLayout";
import ComingSoon from "@/components/ComingSoon";

export default function PlaygroundPage() {
  const breadcrumbs = [
    {
      label: "Playground",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="8.125" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M5.625 7.5C5.625 7.5 7.5 9.375 10 9.375C12.5 9.375 14.375 7.5 14.375 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M5.625 12.5C5.625 12.5 7.5 10.625 10 10.625C12.5 10.625 14.375 12.5 14.375 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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
