export type BuilderNode = {
  id: string
  type: string
  props: Record<string, unknown>
  children?: BuilderNode[]
}

export type PageFrame = {
  id: string
  name: string
  rootNodes: BuilderNode[]
  position: { x: number; y: number }
  size: { width: number; height: number }
  createdAt: string
  updatedAt: string
}

export type Viewport = {
  x: number
  y: number
  zoom: number
}

export type BuilderProject = {
  id: string
  name: string
  pages: PageFrame[]
  viewport: Viewport
}

export type FramePreset = "desktop" | "tablet" | "mobile" | "square"

export const FRAME_PRESETS: Record<
  FramePreset,
  { width: number; height: number; label: string; icon: string }
> = {
  desktop: { width: 1440, height: 900, label: "Desktop", icon: "desktop_mac" },
  tablet: { width: 768, height: 1024, label: "Tablet", icon: "tablet_mac" },
  mobile: { width: 375, height: 812, label: "Mobile", icon: "smartphone" },
  square: { width: 800, height: 800, label: "Quadrada", icon: "crop_square" },
}

export const MIN_FRAME_SIZE = { width: 240, height: 240 }
export const MAX_FRAME_SIZE = { width: 4000, height: 6000 }
export const MIN_ZOOM = 0.1
export const MAX_ZOOM = 4
