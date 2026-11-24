export async function readJsonObject(request: Request, limit = 12000) {
  const mime = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (mime !== 'application/json') return { status: 415 } as const;
  const reader = request.body?.getReader();
  if (!reader) return { status: 400 } as const;
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > limit) {
        await reader.cancel().catch(() => {});
        return { status: 413 } as const;
      }
      chunks.push(value);
    }
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) return { status: 400 } as const;
    return { status: 200, value: value as Record<string, unknown> } as const;
  } catch {
    return { status: 400 } as const;
  }
}
