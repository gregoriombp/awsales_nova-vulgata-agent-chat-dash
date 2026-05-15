"use client";

import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export type BreadcrumbsItems = (string | BreadcrumbItem)[];

function renderItem(
  item: string | BreadcrumbItem,
  index: number,
  array: BreadcrumbsItems,
) {
  const isLast = index === array.length - 1;
  const data = typeof item === "string" ? { label: item } : item;
  const hasLink = !isLast && data.href;

  const content = (
    <span className="inline-flex items-center gap-2">
      {data.icon && (
        <span className="flex-shrink-0 text-[#0a0a0a]">{data.icon}</span>
      )}
      <span className={isLast ? "text-[#737373]" : "text-[#0a0a0a]"}>
        {data.label}
      </span>
    </span>
  );

  return (
    <div key={index} className="flex items-center gap-1.5">
      <div className="flex items-center gap-2.5">
        {hasLink ? (
          <Link
            href={data.href!}
            className="body-sm leading-5 hover:underline hover:text-[#0a0a0a] focus:outline-none focus:underline"
          >
            {content}
          </Link>
        ) : (
          <span className="body-sm leading-5">{content}</span>
        )}
      </div>
      {!isLast && (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-400 flex-shrink-0"
          aria-hidden="true"
        >
          <path
            d="M9 6L15 12L9 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: BreadcrumbsItems }) {
  if (!items || items.length === 0) return null;
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5"
    >
      {items.map((item, index) => renderItem(item, index, items))}
    </nav>
  );
}

export function BreadcrumbsBar({
  items,
  innerClassName,
}: {
  items: BreadcrumbsItems;
  /** Wraps the nav; default preserves legacy full-width padding (`px-8`). */
  innerClassName?: string;
}) {
  // Breadcrumbs only make sense as a navigation trail. With a single item the
  // label just duplicates the page header, so we hide the bar entirely.
  if (!items || items.length <= 1) return null;
  return (
    <div className="flex h-11 shrink-0 items-center bg-white">
      <div className={innerClassName ?? "w-full px-8"}>
        <Breadcrumbs items={items} />
      </div>
    </div>
  );
}
