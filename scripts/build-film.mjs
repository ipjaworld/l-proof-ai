import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

// Builds the home film from design/rebuild-cinematic into public/film.
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "design", "rebuild-cinematic");
const target = join(root, "public", "film");

mkdirSync(join(target, "assets"), { recursive: true });
await build({
  entryPoints: [join(source, "scene.js")],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2020",
  minify: true,
  outfile: join(target, "scene.js"),
});
for (const name of readdirSync(join(source, "assets"))) {
  if (name === "slab-pool.jpg") continue;
  copyFileSync(join(source, "assets", name), join(target, "assets", name));
}
