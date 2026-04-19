import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: "Bombardier",
    template: "%s · Bombardier",
  },
  description:
    "Product Builder — design system, page builder e UX flow builder em um só lugar.",
}

export default function BombardierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
