import { ensureSchema } from "./db";
import { route, securityHeaders } from "./routes";
import { errorResponse, json, setClientIp } from "./util";

/** One function serves every dynamic route (pages, API, images, feed). */
export async function handle(req: Request, ip?: string): Promise<Response> {
  setClientIp(req, ip);
  const url = new URL(req.url);
  let path = url.pathname;
  if (!path.startsWith("/") || path.includes("..") || path.length > 300) path = "/404";
  let res: Response;
  try {
    await ensureSchema();
    res = (await route(req, path)) ?? (path.startsWith("/api/") ? json({ error: "Not found", code: "not_found" }, 404) : new Response("Page not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } }));
  } catch (e) {
    res = errorResponse(e);
  }
  const h = new Headers(res.headers);
  for (const [k, v] of Object.entries(securityHeaders(req))) if (!h.has(k)) h.set(k, v);
  return new Response(res.body, { status: res.status, headers: h });
}
