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
    notificationLastAttemptAt: text("notification_last_attempt_at"),
    notificationAttempts: integer("notification_attempts").notNull().default(0),
    notificationEmailId: text("notification_email_id"),
    notificationDeliveryStatus: text("notification_delivery_status"),
    notificationDeliveredAt: text("notification_delivered_at"),
    notificationBouncedAt: text("notification_bounced_at"),
    notificationComplainedAt: text("notification_complained_at"),
    notificationEventUpdatedAt: text("notification_event_updated_at"),
    lastAppliedAt: text("last_applied_at").notNull(),
  },
  (table) => [
    uniqueIndex("idx_subscribers_normalized_email").on(table.normalizedEmail),
    index("idx_subscribers_status").on(table.status),
  ],
);

export const emailDeliveryEvents = sqliteTable(
  "email_delivery_events",
  {
    id: text("id").primaryKey(),
    emailId: text("email_id").notNull(),
    type: text("type").notNull(),
    recipient: text("recipient"),
    eventCreatedAt: text("event_created_at").notNull(),
    receivedAt: text("received_at").notNull(),
    payload: text("payload").notNull(),
  },
  (table) => [
    index("idx_email_delivery_events_email_id").on(table.emailId),
    index("idx_email_delivery_events_type").on(table.type),
  ],
);

export const requestLimits = sqliteTable("request_limits", {
  key: text("key").primaryKey(),
  windowStart: integer("window_start").notNull(),
  count: integer("count").notNull().default(1),
  updatedAt: integer("updated_at").notNull(),
});

export const briefingEditions = sqliteTable(
  "briefing_editions",
  {
    id: text("id").primaryKey(),
    editionNumber: integer("edition_number"),
    slug: text("slug"),
    subject: text("subject").notNull(),
    previewText: text("preview_text").notNull(),
    contentText: text("content_text").notNull(),
    contentHtml: text("content_html").notNull(),
    proofLevel: integer("proof_level").notNull().default(3),
    tags: text("tags").notNull().default("[]"),
    heroImageUrl: text("hero_image_url"),
    contentHash: text("content_hash").notNull(),
    status: text("status").notNull().default("draft"),
    publicationStatus: text("publication_status").notNull().default("unpublished"),
    reviewDueAt: text("review_due_at").notNull(),
    scheduledPublishAt: text("scheduled_publish_at"),
    publishedAt: text("published_at"),
    publicationError: text("publication_error"),
    scheduledSendAt: text("scheduled_send_at").notNull(),
    approvalTokenHash: text("approval_token_hash").notNull(),
    reviewEmailId: text("review_email_id"),
    reviewSentAt: text("review_sent_at"),
    approvedAt: text("approved_at"),
    approvedContentHash: text("approved_content_hash"),
    heldAt: text("held_at"),
    sendStartedAt: text("send_started_at"),
    sentAt: text("sent_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("idx_briefing_editions_slug").on(table.slug),
    uniqueIndex("idx_briefing_editions_number").on(table.editionNumber),
    index("idx_briefing_editions_status_schedule").on(table.status, table.scheduledSendAt),
    index("idx_briefing_editions_publication_schedule").on(
      table.publicationStatus,
      table.scheduledPublishAt,
    ),
  ],
);

export const briefingDeliveries = sqliteTable(
  "briefing_deliveries",
  {
    id: text("id").primaryKey(),
    editionId: text("edition_id").notNull().references(() => briefingEditions.id),
    subscriberId: text("subscriber_id").notNull().references(() => subscribers.id),
    recipient: text("recipient").notNull(),
    emailId: text("email_id"),
    status: text("status").notNull().default("pending"),
    error: text("error"),
    sentAt: text("sent_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("idx_briefing_deliveries_edition_subscriber").on(table.editionId, table.subscriberId),
    index("idx_briefing_deliveries_email_id").on(table.emailId),
  ],
);
