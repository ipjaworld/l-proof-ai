import { z } from "zod";

const interest = z.enum(["coding-agents", "llm", "agi"]);
const optionalShortText = z.string().trim().max(120).optional().or(z.literal(""));

export const subscribeSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  name: optionalShortText,
  interests: z.array(interest).max(3).default([]),
  consent: z.literal(true),
  website: z.string().max(0).optional().or(z.literal("")),
  source: z.string().trim().max(60).default("landing"),
  utmSource: optionalShortText,
  utmMedium: optionalShortText,
  utmCampaign: optionalShortText,
  turnstileToken: z.string().trim().min(1).max(2048),
});

export const unsubscribeSchema = z.object({
  subscriber: z.string().trim().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/),
  token: z.string().trim().regex(/^[a-f0-9]{64}$/),
  website: z.string().max(0).optional().or(z.literal("")),
});

export const approvalSchema = z.object({
  edition: z.string().trim().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/),
  token: z.string().trim().min(32).max(256).regex(/^[A-Za-z0-9_-]+$/),
});
