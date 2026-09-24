import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getCloudflareEnv() {
  return getCloudflareContext().env as Cloudflare.Env;
}
