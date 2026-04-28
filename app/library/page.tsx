"use client";

import DashboardLayout from "@/components/DashboardLayout";
import ComponentLibrary from "@/components/ComponentLibrary";

export default function LibraryPage() {
  const breadcrumbs = [
    {
      label: "Biblioteca",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.375 2.5L10 5L15.625 2.5V16.25L10 18.75L4.375 16.25V2.5Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
    },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <ComponentLibrary />
    </DashboardLayout>
  );
}
