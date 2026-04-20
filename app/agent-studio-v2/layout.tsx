import type { Metadata } from "next"
import "./styles.css"

export const metadata: Metadata = {
  title: "Agent Studio V2 — AwSales",
}

export default function AgentStudioV2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400..700,0..1,-50..200&display=block"
      />
      {children}
    </>
  )
}
