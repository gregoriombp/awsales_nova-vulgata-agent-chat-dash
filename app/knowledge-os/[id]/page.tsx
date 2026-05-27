"use client";

import DashboardLayout from "@/components/DashboardLayout";
import ComingSoon from "@/components/ComingSoon";

const breadcrumbs = [{ label: "Knowledge OS" }];

export default function KnowledgeOsDetailPage() {
  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <ComingSoon />
    </DashboardLayout>
  );
}
