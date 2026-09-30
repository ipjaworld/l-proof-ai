import { readFileSync } from 'node:fs';

const secret = process.env.BRIEFING_ADMIN_SECRET;
if (!secret) throw new Error('BRIEFING_ADMIN_SECRET is required in the execution environment. No request was sent.');
const payload = JSON.parse(readFileSync(process.argv[2], 'utf8'));
if (Date.parse(payload.reviewDueAt) <= Date.now()) throw new Error('Review deadline has passed. No request was sent.');
if (/편집자\s*메모|팩트체크|중복\s*제거\s*기록/.test(payload.contentText + payload.contentHtml)) throw new Error('Internal notes found. No request was sent.');
// Deliberately no automatic retries: POST replaces the review and approval token.
try {
  const response = await fetch('https://l-proof-ai.xyz/api/briefings', {
    method: 'POST', redirect: 'error',
    headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/json' },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Registration returned HTTP ${response.status}; inspect existing state before retrying.`);
  const result = await response.json();
  if (!result.ok || !result.contentHash || !result.emailId) throw new Error('Unexpected response; reconcile registration before retrying.');
  console.log(JSON.stringify({ id: payload.id, status: 'review', contentHash: result.contentHash, reviewEmailId: result.emailId }));
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Registration failed; reconcile before retrying.');
  process.exitCode = 1;
}
