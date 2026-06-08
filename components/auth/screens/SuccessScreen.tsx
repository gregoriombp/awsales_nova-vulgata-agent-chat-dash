"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AwButton } from "@/components/ui/AwButton";
import { Icon } from "@/components/ui/Icon";
import type { Locale } from "../_types";
import { COPY } from "../_copy";

export function SuccessScreen({ locale }: { locale: Locale }) {
  const c = COPY.success[locale];
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/inicio"), 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="w-full max-w-[380px] animate-fadeInUp">
      <div className="w-14 h-14 rounded-full bg-aw-emerald-500 flex items-center justify-center mb-5 text-white ring-8 ring-aw-emerald-500/15">
        <Icon name="check" size={28} />
      </div>
      <h3 className="text-aw-gray-1200 mb-2.5">{c.title}</h3>
      <p className="body-sm text-aw-gray-800 mb-6">{c.sub}</p>
      <AwButton variant="primary" size="md" block onClick={() => router.push("/inicio")} iconRight="arrow_outward">
        {c.cta}
      </AwButton>
    </div>
  );
}
