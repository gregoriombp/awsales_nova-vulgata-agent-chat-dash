"use client";

import DashboardLayout from "@/components/DashboardLayout";
import ComingSoon from "@/components/ComingSoon";

export default function ConversationDetailPage() {
  const breadcrumbs = [
    {
      label: "Conversas",
      href: "/conversations",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.25 3.75C17.1875 3.75 17.9375 4.5 17.9375 5.4375V11.5625C17.9375 12.5 17.1875 13.25 16.25 13.25H11.875L8.125 16.25V13.25H3.75C2.8125 13.25 2.0625 12.5 2.0625 11.5625V5.4375C2.0625 4.5 2.8125 3.75 3.75 3.75H16.25Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
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
