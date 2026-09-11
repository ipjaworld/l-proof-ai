import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const subscribers = sqliteTable(
  "subscribers",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    normalizedEmail: text("normalized_email").notNull(),
    name: text("name"),
    interests: text("interests").notNull().default("[]"),
    status: text("status").notNull().default("pending"),
    consentVersion: text("consent_version").notNull(),
    consentedAt: text("consented_at").notNull(),
    emailVerifiedAt: text("email_verified_at"),
    createdAt: text("created_at").notNull(),
    approvedAt: text("approved_at"),
    rejectedAt: text("rejected_at"),
    unsubscribedAt: text("unsubscribed_at"),
    source: text("source").notNull().default("landing"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    note: text("note"),
    lastSentAt: text("last_sent_at"),
    notificationStatus: text("notification_status").notNull().default("pending"),
    notificationError: text("notification_error"),
    lastAppliedAt: text("last_applied_at").notNull(),
  },
  (table) => [
    uniqueIndex("idx_subscribers_normalized_email").on(table.normalizedEmail),
    index("idx_subscribers_status").on(table.status),
  ],
);

export const requestLimits = sqliteTable("request_limits", {
  key: text("key").primaryKey(),
  windowStart: integer("window_start").notNull(),
  count: integer("count").notNull().default(1),
  updatedAt: integer("updated_at").notNull(),
});
