// Anexos do Review Mode são gravados em disco (content-addressed) pelo bridge
// serverless e referenciados por URL no JSON — ver app/api/review-bridge/_images.ts.
// Aqui só preparamos o upload: cap no maior lado + reencode JPEG pra um screenshot
// de UI não viajar como PNG/4K gigante. 1600px @ 0.82 mantém texto legível com
// uma fração do peso (vs. os 2400px/0.92 antigos, que estouravam o JSON).
const MAX_DIM = 1600
const JPEG_QUALITY = 0.82

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Normaliza o anexo pra um JPEG enxuto: reduz se o maior lado passar de MAX_DIM
 * e SEMPRE reencoda em JPEG (até imagens dentro do teto), pra um PNG de screenshot
 * não viajar 3-5x maior que o necessário. Em qualquer falha devolve o original.
 */
export async function fileToHighResDataUrl(file: File): Promise<string> {
  const original = await fileToDataUrl(file)
  if (typeof document === "undefined") return original
  let img: HTMLImageElement
  try {
    img = await loadImage(original)
  } catch {
    return original
  }
  const longest = Math.max(img.naturalWidth, img.naturalHeight)
  const scale = longest > MAX_DIM ? MAX_DIM / longest : 1
  const w = Math.round(img.naturalWidth * scale)
  const h = Math.round(img.naturalHeight * scale)
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) return original
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(img, 0, 0, w, h)
  const encoded = canvas.toDataURL("image/jpeg", JPEG_QUALITY)
  // Se por algum motivo o JPEG ficar maior que o original (raro, imagens já
  // minúsculas), fica com o menor dos dois.
  return encoded.length < original.length ? encoded : original
}
