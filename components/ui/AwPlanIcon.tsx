"use client";

import { useId } from "react";

export type PlanKey = "starter" | "pro" | "enterprise";

interface AwPlanIconProps {
  plan: PlanKey;
  /**
   * "dark" = strokes/fills brancos — para uso em superfície escura.
   * "light" = strokes/fills escuros (--fg-primary) — para fundo branco.
   * Default: "dark".
   */
  variant?: "dark" | "light";
  size?: number;
  className?: string;
}

export function AwPlanIcon({
  plan,
  variant = "dark",
  size = 100,
  className,
}: AwPlanIconProps) {
  const uid = useId().replace(/:/g, "");
  const c = variant === "dark" ? "white" : "var(--fg-primary)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {plan === "starter" && <StarterPaths id={uid} c={c} />}
      {plan === "pro" && <ProPaths id={uid} c={c} />}
      {plan === "enterprise" && <EnterprisePaths id={uid} c={c} />}
    </svg>
  );
}

/* ---- Starter: 3 squares overlapping, stroke gradient ---- */

function StarterPaths({ id, c }: { id: string; c: string }) {
  return (
    <>
      <rect x="20.5" y="19.5" width="47" height="47" stroke={`url(#${id}0)`} />
      <rect
        x="-0.5"
        y="0.5"
        width="47"
        height="47"
        transform="matrix(-1 0 0 1 73 26)"
        stroke={`url(#${id}1)`}
      />
      <rect x="32.5" y="33.5" width="47" height="47" stroke={`url(#${id}2)`} />
      <defs>
        <linearGradient
          id={`${id}0`}
          x1="44"
          y1="19"
          x2="44"
          y2="67"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={c} stopOpacity={0.96} />
          <stop offset="1" stopColor={c} stopOpacity={0.35} />
        </linearGradient>
        <linearGradient
          id={`${id}1`}
          x1="24"
          y1="0"
          x2="24"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={c} stopOpacity={0.96} />
          <stop offset="1" stopColor={c} stopOpacity={0.35} />
        </linearGradient>
        <linearGradient
          id={`${id}2`}
          x1="56"
          y1="33"
          x2="56"
          y2="81"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={c} stopOpacity={0.96} />
          <stop offset="1" stopColor={c} stopOpacity={0.35} />
        </linearGradient>
      </defs>
    </>
  );
}

/* ---- Pro: 4 orbits (ellipse + diagonal), stroke gradient ---- */

function ProPaths({ id, c }: { id: string; c: string }) {
  return (
    <>
      <path
        d="M50 18.5C51.4625 18.5 52.9157 19.2889 54.2969 20.8467C55.6774 22.4039 56.9441 24.6854 58.0176 27.5479C60.1632 33.2694 61.5 41.2075 61.5 50C61.5 58.7925 60.1632 66.7306 58.0176 72.4521C56.9441 75.3146 55.6774 77.5961 54.2969 79.1533C52.9157 80.7111 51.4625 81.5 50 81.5C48.5375 81.5 47.0843 80.7111 45.7031 79.1533C44.3226 77.5961 43.0559 75.3146 41.9824 72.4521C39.8368 66.7306 38.5 58.7925 38.5 50C38.5 41.2075 39.8368 33.2694 41.9824 27.5479C43.0559 24.6854 44.3226 22.4039 45.7031 20.8467C47.0843 19.2889 48.5375 18.5 50 18.5Z"
        stroke={`url(#${id}0)`}
      />
      <path
        d="M50 38.5C58.7925 38.5 66.7306 39.8368 72.4521 41.9824C75.3146 43.0559 77.5961 44.3226 79.1533 45.7031C80.7111 47.0843 81.5 48.5375 81.5 50C81.5 51.4625 80.7111 52.9157 79.1533 54.2969C77.5961 55.6774 75.3146 56.9441 72.4521 58.0176C66.7306 60.1632 58.7925 61.5 50 61.5C41.2075 61.5 33.2694 60.1632 27.5479 58.0176C24.6854 56.9441 22.4039 55.6774 20.8467 54.2969C19.2889 52.9157 18.5 51.4625 18.5 50C18.5 48.5375 19.2889 47.0843 20.8467 45.7031C22.4039 44.3226 24.6854 43.0559 27.5479 41.9824C33.2694 39.8368 41.2075 38.5 50 38.5Z"
        stroke={`url(#${id}1)`}
      />
      <path
        d="M27.7266 27.7266C28.7607 26.6924 30.3466 26.2227 32.4248 26.3477C34.5021 26.4726 37.0109 27.191 39.7939 28.4561C45.3568 30.9847 51.9156 35.652 58.1328 41.8691C64.3499 48.0863 69.0173 54.6452 71.5459 60.208C72.8109 62.9911 73.5285 65.4999 73.6533 67.5771C73.7782 69.6553 73.3086 71.2403 72.2744 72.2744C71.2403 73.3086 69.6553 73.7782 67.5771 73.6533C65.4999 73.5285 62.9911 72.8109 60.208 71.5459C54.6452 69.0173 48.0863 64.3499 41.8691 58.1328C35.652 51.9156 30.9847 45.3568 28.4561 39.7939C27.191 37.0109 26.4726 34.5021 26.3477 32.4248C26.2227 30.3466 26.6924 28.7607 27.7266 27.7266Z"
        stroke={`url(#${id}2)`}
      />
      <path
        d="M67.5771 26.3477C69.6551 26.2228 71.2403 26.6926 72.2744 27.7266C73.3086 28.7607 73.7782 30.3466 73.6533 32.4248C73.5284 34.5021 72.8109 37.0109 71.5459 39.7939C69.0173 45.3569 64.35 51.9156 58.1328 58.1328C51.9156 64.35 45.3569 69.0173 39.7939 71.5459C37.0109 72.8109 34.5021 73.5284 32.4248 73.6533C30.3466 73.7782 28.7607 73.3086 27.7266 72.2744C26.6926 71.2403 26.2228 69.6551 26.3477 67.5771C26.4725 65.4998 27.191 62.9912 28.4561 60.208C30.9847 54.6451 35.6519 48.0864 41.8691 41.8691C48.0864 35.6519 54.6451 30.9847 60.208 28.4561C62.9912 27.191 65.4998 26.4725 67.5771 26.3477Z"
        stroke={`url(#${id}3)`}
      />
      <defs>
        <linearGradient
          id={`${id}0`}
          x1="50"
          y1="18"
          x2="50"
          y2="82"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={c} />
          <stop offset="1" stopColor={c} stopOpacity={0} />
        </linearGradient>
        <linearGradient
          id={`${id}1`}
          x1="18"
          y1="50"
          x2="82"
          y2="50"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={c} />
          <stop offset="1" stopColor={c} stopOpacity={0} />
        </linearGradient>
        <linearGradient
          id={`${id}2`}
          x1="27.3733"
          y1="27.3734"
          x2="72.6282"
          y2="72.6282"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={c} />
          <stop offset="1" stopColor={c} stopOpacity={0} />
        </linearGradient>
        <linearGradient
          id={`${id}3`}
          x1="72.6282"
          y1="27.3734"
          x2="27.3734"
          y2="72.6282"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={c} />
          <stop offset="1" stopColor={c} stopOpacity={0} />
        </linearGradient>
      </defs>
    </>
  );
}

/* ---- Enterprise: layered triangle fan, fill gradient ---- */

function EnterprisePaths({ id, c }: { id: string; c: string }) {
  return (
    <>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M50 18L94 82H6L50 18ZM12.9153 81.3H87.0847L50 73.7145L12.9153 81.3ZM88.5766 80.8907L50 73L11.4234 80.8907L50 67.7396L88.5766 80.8907ZM50 61.7756L88.312 80.0609L50 67L11.688 80.0609L50 61.7756ZM87.9772 79.1255L50 61L12.0228 79.1255L50 55.8213L87.9772 79.1255ZM50 49.875L87.5833 78.0625L50 55L12.4167 78.0625L50 49.875ZM87.1404 76.8553L50 49L12.8596 76.8553L50 43.9354L87.1404 76.8553ZM50 38.0013L86.6574 75.4918L50 43L13.3426 75.4918L50 38.0013ZM86.1417 73.9631L50 37L13.8584 73.9631L50 32.0716L86.1417 73.9631ZM50 25.1582L86.7199 73.5617L50 31L13.2801 73.5617L50 25.1582ZM84.939 70.056L50 24L15.061 70.0559L50 19.2356L84.939 70.056Z"
        fill={`url(#${id}0)`}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M50 18L6.00001 82H94L50 18ZM87.0847 81.3H12.9153L50 73.7145L87.0847 81.3ZM11.4234 80.8907L50 73L88.5766 80.8907L50 67.7396L11.4234 80.8907ZM50 61.7756L11.688 80.0609L50 67L88.312 80.0609L50 61.7756ZM12.0228 79.1255L50 61L87.9772 79.1255L50 55.8213L12.0228 79.1255ZM50 49.875L12.4167 78.0625L50 55L87.5833 78.0625L50 49.875ZM12.8596 76.8553L50 49L87.1404 76.8553L50 43.9354L12.8596 76.8553ZM50 38.0013L13.3426 75.4918L50 43L86.6574 75.4918L50 38.0013ZM13.8583 73.9631L50 37L86.1416 73.9631L50 32.0716L13.8583 73.9631ZM50 25.1582L13.2801 73.5617L50 31L86.7199 73.5617L50 25.1582ZM15.061 70.056L50 24L84.939 70.0559L50 19.2356L15.061 70.056Z"
        fill={`url(#${id}1)`}
      />
      <defs>
        <linearGradient
          id={`${id}0`}
          x1="8.5"
          y1="82"
          x2="73"
          y2="51.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={c} />
          <stop offset="1" stopColor={c} stopOpacity={0} />
        </linearGradient>
        <linearGradient
          id={`${id}1`}
          x1="91.5"
          y1="82"
          x2="29.5"
          y2="46"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={c} />
          <stop offset="1" stopColor={c} stopOpacity={0} />
        </linearGradient>
      </defs>
    </>
  );
}
