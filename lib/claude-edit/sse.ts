export function parseSseStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onEvent: (event: string, data: unknown) => void
): Promise<void> {
  const decoder = new TextDecoder()
  let buffer = ""
  return (async () => {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let idx: number
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const raw = buffer.slice(0, idx)
        buffer = buffer.slice(idx + 2)
        let ev = "message"
        const lines = raw.split("\n")
        const dataLines: string[] = []
        for (const line of lines) {
          if (line.startsWith("event:")) ev = line.slice(6).trim()
          else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim())
        }
        if (dataLines.length === 0) continue
        let parsed: unknown = dataLines.join("\n")
        try {
          parsed = JSON.parse(dataLines.join("\n"))
        } catch {
          /* keep raw */
        }
        onEvent(ev, parsed)
      }
    }
  })()
}
