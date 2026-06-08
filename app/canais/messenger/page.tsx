"use client";

import { useRouter } from "next/navigation";
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import { AwMessengerPanel } from "@/components/integrations/AwMessengerPanel";
import { Icon } from "@/components/ui/Icon";

export default function MessengerConfigPage() {
  const router = useRouter();

  const breadcrumbs = [
    { label: "Canais", href: "/canais", icon: <Icon name="forum" size={20} /> },
    { label: "Messenger" },
  ];

  return (
    <AwDashboardLayout breadcrumbs={breadcrumbs}>
      <div className="-m-8 h-full min-h-full bg-(--bg-canvas)">
        <AwMessengerPanel
          onAddPage={() => router.push("/canais")}
          onCancel={() => router.push("/canais")}
          onSave={() => router.push("/canais")}
        />
      </div>
    </AwDashboardLayout>
  );
}
