"use client";

import { FaCcAmex, FaCcMastercard, FaCcVisa } from "react-icons/fa6";
import type { CardBrand } from "./data";

const BRAND_COLOR: Record<CardBrand, string> = {
  Visa: "#1A1F71",
  Mastercard: "#EB001B",
  Amex: "#2E77BC",
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
