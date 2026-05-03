"use client";

import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { AwWhatsAppPanel } from "@/components/integrations/AwWhatsAppPanel";
import { Icon } from "@/components/ui/Icon";

export default function WhatsAppConfigPage() {
  const router = useRouter();

  const breadcrumbs = [
    { label: "Integrações", href: "/integrations", icon: <Icon name="extension" size={20} /> },
    { label: "WhatsApp" },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="-m-8 h-full min-h-full bg-[var(--bg-canvas)]">
        <AwWhatsAppPanel
          onAddWaba={() => router.push("/setup/whatsapp/1")}
          onCancel={() => router.push("/integrations")}
          onSave={() => router.push("/integrations")}
        />
      </div>
    </DashboardLayout>
  );
}
