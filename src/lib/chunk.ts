import { v4 as uuid } from 'uuid';

/**
 * Splits page text into overlapping chunks (~1200–1600 chars).
 * Keeps paragraph boundaries when possible.
 */
export function chunkPageText(
  pageText: string,
  page: number,
  target = 1400,
  overlap = 200
) {
  const paras = pageText
    .split(/\n{2,}/g)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: { id: string; page: number; content: string }[] = [];

  let buf = '';
  for (const p of paras) {
    if ((buf + '\n\n' + p).length > target && buf.length > 0) {
      chunks.push({ id: uuid(), page, content: buf.trim() });
      const tail = buf.slice(Math.max(0, buf.length - overlap));
      buf = tail + '\n\n' + p;
    } else {
      buf += (buf ? '\n\n' : '') + p;
    }
  }
  if (buf.trim()) {
    chunks.push({ id: uuid(), page, content: buf.trim() });
  }
  return chunks;
}
