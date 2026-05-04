"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { ChannelComingSoonPanel } from "../_components/ChannelComingSoonPanel";
import { Icon } from "@/components/ui/Icon";

export default function InstagramConfigPage() {
  const breadcrumbs = [
    { label: "Canais", href: "/canais", icon: <Icon name="forum" size={20} /> },
    { label: "Instagram" },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="-m-8 h-full min-h-full bg-[var(--bg-canvas)]">
        <ChannelComingSoonPanel
          brand="instagram"
          name="Instagram"
          description="Responda DMs do Instagram automaticamente com agentes."
        />
      </div>
    </DashboardLayout>
  );
}
