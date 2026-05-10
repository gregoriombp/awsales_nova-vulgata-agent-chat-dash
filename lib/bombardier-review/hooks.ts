"use client"

import * as React from "react"
import type { ReviewComment } from "@/components/bombardier-review/types"
import { useReviewStore } from "./store"

export function useCurrentUrl(): string {
  const [url, setUrl] = React.useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : window.location.pathname + window.location.search
  )

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const update = () =>
      setUrl(window.location.pathname + window.location.search)
    update()
    window.addEventListener("popstate", update)

    const origPush = window.history.pushState
    const origReplace = window.history.replaceState
    window.history.pushState = function (...args) {
      const ret = origPush.apply(this, args)
      window.dispatchEvent(new Event("popstate"))
      return ret
    }
    window.history.replaceState = function (...args) {
      const ret = origReplace.apply(this, args)
      window.dispatchEvent(new Event("popstate"))
      return ret
    }
    return () => {
      window.removeEventListener("popstate", update)
      window.history.pushState = origPush
      window.history.replaceState = origReplace
    }
  }, [])

  return url
}

export function useCommentsForUrl(url: string): ReviewComment[] {
  const all = useReviewStore((s) => s.comments)
  return React.useMemo(
    () => all.filter((c) => c.url === url),
    [all, url]
  )
}
