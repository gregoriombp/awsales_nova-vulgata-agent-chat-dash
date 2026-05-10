"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Icon } from "@/components/ui/Icon";
import {
  SETTINGS_NAV_ITEMS,
  SettingsNav,
  isSettingsNavItemActive,
} from "./_components/SettingsNav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";

  const breadcrumbs = useMemo(() => {
    const root = {
      label: "Configurações",
      icon: <Icon name="tune" size={16} />,
      href: "/settings",
    };
    const match = SETTINGS_NAV_ITEMS.find((item) =>
      isSettingsNavItemActive(pathname, item),
    );
    return match ? [root, { label: match.label }] : [root];
  }, [pathname]);

  return (
    <DashboardLayout
      breadcrumbs={breadcrumbs}
      mainClassName="!p-0 !overflow-hidden"
    >
      <div className="flex h-full min-h-0 bg-[var(--bg-canvas)]">
        <SettingsNav />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </DashboardLayout>
  );
}
