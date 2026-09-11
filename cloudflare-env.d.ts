declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    BUCKET?: R2Bucket;
    RESEND_API_KEY?: string;
    OPERATOR_NOTIFICATION_EMAIL?: string;
    EMAIL_FROM?: string;
    RATE_LIMIT_SALT?: string;
  }
}
