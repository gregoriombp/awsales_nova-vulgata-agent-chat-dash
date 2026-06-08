"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import { AwWhatsAppPanel } from "@/components/integrations/AwWhatsAppPanel";
import { Icon } from "@/components/ui/Icon";

export default function WhatsAppConfigPage() {
  return (
    <Suspense fallback={null}>
      <WhatsAppConfigContent />
    </Suspense>
  );
}

function WhatsAppConfigContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openNewTemplate = searchParams.get("new-template") === "1";

  const breadcrumbs = [
    { label: "Canais", href: "/canais", icon: <Icon name="forum" size={20} /> },
    { label: "WhatsApp" },
  ];

  return (
    <AwDashboardLayout breadcrumbs={breadcrumbs}>
      <div className="-m-8 h-full min-h-full bg-(--bg-canvas)">
        <AwWhatsAppPanel
          onAddWaba={() => router.push("/setup/whatsapp")}
          onCancel={() => router.push("/canais")}
          onSave={() => router.push("/canais")}
          initialOpenTemplateBuilder={openNewTemplate}
        />
      </div>
    </AwDashboardLayout>
  );
}
