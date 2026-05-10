"use client";

import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { AwInstagramPanel } from "@/components/integrations/AwInstagramPanel";
import { Icon } from "@/components/ui/Icon";

export default function InstagramConfigPage() {
  const router = useRouter();

  const breadcrumbs = [
    { label: "Canais", href: "/canais", icon: <Icon name="forum" size={20} /> },
    { label: "Instagram" },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="-m-8 h-full min-h-full bg-[var(--bg-canvas)]">
        <AwInstagramPanel
          onAddAccount={() => router.push("/canais")}
          onCancel={() => router.push("/canais")}
          onSave={() => router.push("/canais")}
        />
      </div>
    </DashboardLayout>
  );
}
