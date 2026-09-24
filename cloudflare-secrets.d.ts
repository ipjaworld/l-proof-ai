declare interface CloudflareEnv {
  RESEND_API_KEY?: string;
  RESEND_WEBHOOK_SECRET?: string;
  BRIEFING_ADMIN_SECRET?: string;
  RATE_LIMIT_SALT?: string;
}

declare namespace Cloudflare {
  interface Env {
    RESEND_API_KEY?: string;
    RESEND_WEBHOOK_SECRET?: string;
    BRIEFING_ADMIN_SECRET?: string;
    RATE_LIMIT_SALT?: string;
  }
}
