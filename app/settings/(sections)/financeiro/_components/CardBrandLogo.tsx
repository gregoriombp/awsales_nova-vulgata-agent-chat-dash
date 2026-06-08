"use client";

import { FaCcAmex, FaCcMastercard, FaCcVisa } from "react-icons/fa6";
import type { CardBrand } from "./data";
import { BRAND_COLORS } from "@/lib/brandColors";

const BRAND_COLOR: Record<CardBrand, string> = {
  Visa: BRAND_COLORS.visa,
  Mastercard: BRAND_COLORS.mastercard,
  Amex: BRAND_COLORS.amex,
};

export function CardBrandLogo({
  brand,
  size = 32,
  className,
}: {
  brand: CardBrand;
  size?: number;
  className?: string;
}) {
  const Component =
    brand === "Visa"
      ? FaCcVisa
      : brand === "Mastercard"
      ? FaCcMastercard
      : FaCcAmex;

  return (
    <Component
      size={size}
      color={BRAND_COLOR[brand]}
      aria-label={`Bandeira ${brand}`}
      className={className}
    />
  );
}
