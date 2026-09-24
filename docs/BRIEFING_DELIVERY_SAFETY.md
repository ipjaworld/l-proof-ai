# Briefing delivery safety rules

Subscriber delivery is intentionally one-to-one. These rules are product invariants, not optional optimizations.

- Publish the approved article on L-Proof-AI before any subscriber delivery starts.
- Require `publication_status = published`, a non-null `published_at`, and a canonical slug before sending.
- If the approved content hash differs from the current content hash, hold both publication and delivery.
- HETRICH may read the public article index, but it must never receive D1, admin API, subscriber, or approval-token access.

- Create one `briefing_deliveries` row per edition and subscriber.
- Make one Resend API request per delivery row.
- Put exactly one address in `to`.
- Never use `cc`, `bcc`, a comma-separated address, or a multi-address `to` array.
- Give every subscriber delivery its own idempotency key and Resend email ID.
- A failure for one subscriber must not expose, merge, or alter another subscriber's delivery.

`sendWithResend` accepts a single string address, rejects address separators and newlines at runtime, and serializes it as a one-item `to` array. `sendEdition` invokes it inside the subscriber loop only after creating that subscriber's delivery record.

The operator review copy is also sent as a separate one-recipient request to `OPERATOR_NOTIFICATION_EMAIL`.
