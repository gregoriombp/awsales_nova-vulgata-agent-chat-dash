"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useShape } from "@/components/ui/fluid/lib/shape-context";
import { AwFileIcon } from "@/components/ui/AwFileIcon";

// ─── File thumbnail ───────────────────────────────────────────────────────
// Read-only square preview of a File. Images use object-cover via
// `URL.createObjectURL`; any other type (PDF, planilha, doc...) shows the
// AwFileIcon tile for the format. Self-contained (border + surface + sizing)
// so it can be reused both inside the composer's preview row and to render
// already-sent attachments in a chat transcript.
//
// Upstream renders the first page of PDFs via pdfjs-dist; this repo is a UI
// preview and does not ship that dependency, so non-image files fall back to
// the format tile instead.
interface FileThumbnailProps {
  file: File;
  /** Side length of the square thumbnail in pixels. */
  size: number;
  className?: string;
}

function FileThumbnail({ file, size, className }: FileThumbnailProps) {
  const shape = useShape();
  const isImage = file.type.startsWith("image/");

  // Create blob URL inside an effect (NOT useMemo) so the cleanup-revoke
  // and the URL-creation stay in sync. In React 18 StrictMode dev, a
  // useMemo-created URL gets revoked by the simulated effect-cleanup but
  // useMemo doesn't re-run on the simulated re-mount (no re-render happens),
  // leaving the DOM with a stale, revoked `blob:` URL — broken image.
  // Putting both in the same effect means the simulated re-mount creates a
  // fresh URL and updates state. The one-frame "before URL" state is
  // covered by the bg-bg-muted (no fallback icon shown for images), so the
  // transition is visually clean.
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!isImage) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [isImage, file]);

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-bg-muted border border-border",
        shape.bg,
        className
      )}
      style={{ width: size, height: size }}
    >
      {isImage ? (
        imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={file.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          // Circular spinner for the brief URL-creation gap. The thin ring is
          // mostly subtle (border-border) with one quadrant accented
          // (border-t-fg-muted) so the `animate-spin` rotation reads as a
          // moving arc.
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-6 h-6 rounded-full border-2 border-border border-t-fg-muted animate-spin"
              aria-label="Loading preview"
              role="status"
            />
          </div>
        )
      ) : (
        // Non-image attachment: format tile (PDF, doc, planilha...) centered
        // on the muted surface, scaled down with the thumbnail.
        <div className="absolute inset-0 flex items-center justify-center">
          <AwFileIcon
            ext={file.name}
            bare
            size={size >= 72 ? "md" : "sm"}
            alt={file.name}
          />
        </div>
      )}
    </div>
  );
}

export { FileThumbnail };
export type { FileThumbnailProps };
