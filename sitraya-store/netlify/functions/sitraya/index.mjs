// Netlify Function: serves every dynamic route (pages, API, uploaded images, Meta feed).
// The server itself is in server.mjs, built from server/*.ts by scripts/build-server.mjs.
import app from "./server.mjs";

export default (req, context) => app.fetch(req, context && context.ip);

export const config = {
  path: ["/", "/admin", "/admin.webmanifest", "/brand/*", "/p/*", "/c/*", "/m/*", "/feeds/meta-catalog.xml", "/api/*"],
};
