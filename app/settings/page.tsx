"use client";

import DashboardLayout from "@/components/DashboardLayout";
import ComingSoon from "@/components/ComingSoon";

export default function SettingsPage() {
  const breadcrumbs = [
    {
      label: "Configurações",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 3.125C10.6875 3.125 11.375 3.4375 11.875 3.9375L12.5 4.5625C12.8125 4.875 13.1875 5 13.625 5H14.0625C15.3125 5 16.25 5.9375 16.25 7.1875V7.625C16.25 8.0625 16.375 8.4375 16.6875 8.75L17.3125 9.375C18.3125 10.375 18.3125 11.9375 17.3125 12.9375L16.6875 13.5625C16.375 13.875 16.25 14.25 16.25 14.6875V15.125C16.25 16.375 15.3125 17.3125 14.0625 17.3125H13.625C13.1875 17.3125 12.8125 17.4375 12.5 17.75L11.875 18.375C10.875 19.375 9.3125 19.375 8.3125 18.375L7.6875 17.75C7.375 17.4375 7 17.3125 6.5625 17.3125H6.125C4.875 17.3125 3.9375 16.375 3.9375 15.125V14.6875C3.9375 14.25 3.8125 13.875 3.5 13.5625L2.875 12.9375C1.875 11.9375 1.875 10.375 2.875 9.375L3.5 8.75C3.8125 8.4375 3.9375 8.0625 3.9375 7.625V7.1875C3.9375 5.9375 4.875 5 6.125 5H6.5625C7 5 7.375 4.875 7.6875 4.5625L8.3125 3.9375C8.8125 3.4375 9.5 3.125 10 3.125Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <circle cx="10" cy="11.25" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
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
