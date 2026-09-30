import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";

const internalHeading = /^#{1,6}\s+(?:편집자\s*메모|팩트체크|중복\s*제거\s*기록|내부\s*검수)/m;
const escape = (s) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function inline(s) {
  return escape(s)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" style="color:#b33a2b">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

export function readerText(source) {
  const text = source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
    .replace(/^---\n[\s\S]*?\n---\n/, '');
  const index = text.search(internalHeading);
  return (index < 0 ? text : text.slice(0, index)).trim();
}

export function render(markdown) {
  const lines = markdown.split('\n');
  const blocks = [];
  let paragraph = [], list = [];
  const flush = () => {
    if (paragraph.length) blocks.push(`<p style="line-height:1.85;margin:0 0 18px">${inline(paragraph.join(' '))}</p>`);
    if (list.length) blocks.push(`<ul style="line-height:1.8">${list.map(x => `<li>${inline(x)}</li>`).join('')}</ul>`);
    paragraph = []; list = [];
  };
  let skippedTitle = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) { flush(); continue; }
    if (line.startsWith('|')) {
      flush();
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(lines[i++].trim().replace(/^\||\|$/g, '').split('|').map(x => x.trim()));
      }
      i--;
      if (rows.length < 2 || !rows[1].every(x => /^:?-{3,}:?$/.test(x))) throw new Error('Invalid Markdown table');
      blocks.push(`<table style="border-collapse:collapse;width:100%;font-size:14px"><thead><tr>${rows[0].map(x => `<th style="border:1px solid #ccc;padding:8px;text-align:left">${inline(x)}</th>`).join('')}</tr></thead><tbody>${rows.slice(2).map(row => `<tr>${row.map(x => `<td style="border:1px solid #ccc;padding:8px">${inline(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flush();
      if (heading[1] === '#' && !skippedTitle) { skippedTitle = true; continue; }
      const level = Math.max(2, heading[1].length);
      blocks.push(`<h${level} style="line-height:1.5;margin:28px 0 12px">${inline(heading[2])}</h${level}>`);
    } else if (/^---+$/.test(line)) { flush(); blocks.push('<hr style="border:0;border-top:1px solid #ccc;margin:30px 0">'); }
    else if (/^-\s/.test(line)) { if (paragraph.length) flush(); list.push(line.slice(2)); }
    else { if (list.length) flush(); paragraph.push(line); }
  }
  flush();
  return blocks.join('\n');
}

export function prepare(manifest, source) {
  const contentText = readerText(source);
  const subject = contentText.match(/^# (.+)$/m)?.[1];
  if (!subject || internalHeading.test(contentText)) throw new Error('Invalid reader content');
  const times = ['reviewDueAt', 'scheduledPublishAt', 'scheduledSendAt'].map(k => Date.parse(manifest[k]));
  if (!times.every(Number.isFinite) || !(times[0] < times[1] && times[1] < times[2])) throw new Error('Invalid schedule');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.slug) || !Number.isInteger(manifest.editionNumber) || manifest.editionNumber < 1) throw new Error('Invalid edition identity');
  const { source: sourcePath, ...metadata } = manifest;
  void sourcePath;
  const contentHtml = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body style="margin:0;background:#f4f1ea;color:#172033;font-family:Arial,sans-serif"><main style="max-width:700px;margin:auto;padding:32px 20px"><p>L-PROOF-AI · ISSUE ${String(manifest.editionNumber).padStart(2, '0')}</p><h1>${escape(subject)}</h1>${render(contentText)}</main></body></html>`;
  const payload = { ...metadata, subject, contentText, contentHtml };
  for (const k of ['reviewDueAt', 'scheduledPublishAt', 'scheduledSendAt']) payload[k] = new Date(payload[k]).toISOString();
  return payload;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [manifestPath, output] = process.argv.slice(2);
  if (!manifestPath || !output) throw new Error('Usage: node scripts/prepare-briefing.mjs <manifest.json> <output-directory>');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const payload = prepare(manifest, readFileSync(manifest.source, 'utf8'));
  mkdirSync(output, { recursive: true });
  writeFileSync(join(output, 'reader.md'), payload.contentText + '\n');
  writeFileSync(join(output, 'reader.html'), payload.contentHtml);
  const serialized = JSON.stringify(payload, null, 2) + '\n';
  writeFileSync(join(output, 'payload.json'), serialized);
  console.log(JSON.stringify({ id: payload.id, subject: payload.subject, scheduledPublishAt: payload.scheduledPublishAt, scheduledSendAt: payload.scheduledSendAt, payloadSha256: createHash('sha256').update(serialized).digest('hex'), output: resolve(output) }));
}
