import { fileURLToPath } from "node:url";
import "./sites-env.mjs";

const cli = new URL("../node_modules/@opennextjs/cloudflare/dist/cli/index.js", import.meta.url);
process.argv = [process.execPath, fileURLToPath(cli), ...process.argv.slice(2)];
await import(cli.href);
