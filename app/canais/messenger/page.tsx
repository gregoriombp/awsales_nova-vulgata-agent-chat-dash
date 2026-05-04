"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { ChannelComingSoonPanel } from "../_components/ChannelComingSoonPanel";
import { Icon } from "@/components/ui/Icon";

export default function MessengerConfigPage() {
  const breadcrumbs = [
    { label: "Canais", href: "/canais", icon: <Icon name="forum" size={20} /> },
    { label: "Messenger" },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="-m-8 h-full min-h-full bg-[var(--bg-canvas)]">
        <ChannelComingSoonPanel
          brand="messenger"
          name="Messenger"
          description="Atendimento automatizado pelo Messenger do Facebook."
        />
      </div>
    </DashboardLayout>
  );
}
