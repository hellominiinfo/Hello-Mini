import { handle } from "./app";
/** Bundled to netlify/functions/sitraya/server.mjs. `ip` is the client IP given by the platform. */
export default { fetch: (req: Request, ip?: string) => handle(req, ip) };
