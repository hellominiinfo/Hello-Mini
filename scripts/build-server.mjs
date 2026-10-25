// Bundles the server (TypeScript + postgres + zod) into one file: netlify/functions/sitraya/server.mjs
import { build } from "esbuild";
await build({
  entryPoints: ["server/entry.ts"],
  outfile: "netlify/functions/sitraya/server.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  sourcemap: false,
  legalComments: "none",
  banner: { js: "// Built by scripts/build-server.mjs from server/*.ts. Do not edit by hand.\nimport { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
});
console.log("netlify/functions/sitraya/server.mjs built");
