/** Uploaded images are kept in Postgres and served with long-lived cache headers (Netlify's CDN caches them). */
import { sql } from "./db";
import { HttpError, randomId } from "./util";

const MAX_BYTES = 2_500_000;

function sniff(b: Buffer): string | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (b.length > 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (b.length > 6 && (b.toString("ascii", 0, 6) === "GIF87a" || b.toString("ascii", 0, 6) === "GIF89a")) return "image/gif";
  return null; // SVG and everything else is refused (SVG can carry scripts)
}

export async function saveImage(dataUrl: unknown, by: string): Promise<string> {
  const m = /^data:image\/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ""));
  if (!m) throw new HttpError(400, "Upload a JPG, PNG, WebP or GIF image.", "bad_image");
  const bytes = Buffer.from(m[2], "base64");
  if (bytes.length > MAX_BYTES) throw new HttpError(413, "Image is too large (max 2.5 MB after resizing).", "too_large");
  const mime = sniff(bytes);
  if (!mime) throw new HttpError(400, "That file is not a real image.", "bad_image");
  const id = randomId("", 15).slice(0, 20);
  await sql()`insert into media (id, mime, bytes, size, created_by) values (${id}, ${mime}, ${bytes}, ${bytes.length}, ${by})`;
  return `/m/${id}`;
}

export async function serveImage(id: string): Promise<Response> {
  if (!/^[A-Za-z0-9]{8,40}$/.test(id)) return new Response("Not found", { status: 404 });
  const rows = await sql()<{ mime: string; bytes: Buffer }[]>`select mime, bytes from media where id = ${id}`;
  if (!rows.length) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(rows[0].bytes), {
    headers: {
      "content-type": rows[0].mime,
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'; sandbox",
    },
  });
}
