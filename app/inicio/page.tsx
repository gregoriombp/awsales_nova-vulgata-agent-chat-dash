"use client";

import DashboardLayout from "@/components/DashboardLayout";
import ComingSoon from "@/components/ComingSoon";

export default function Inicio() {
  const breadcrumbs = ["Início"];

  return (
    <DashboardLayout title="Início" breadcrumbs={breadcrumbs}>
      <ComingSoon />
    </DashboardLayout>
  );
}

