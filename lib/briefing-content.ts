const emailOnlyStart = "<!-- email-only:start -->";
const emailOnlyEnd = "<!-- email-only:end -->";

export function splitEmailOnlyText(contentText: string) {
  if (!contentText.startsWith(emailOnlyStart)) {
    return { intro: "", article: contentText };
  }
  const match = /^<!-- email-only:start -->\n([\s\S]*?)\n<!-- email-only:end -->\n\n([\s\S]+)$/.exec(contentText);
  if (!match) throw new Error("Invalid email-only briefing content");
  return { intro: match[1], article: match[2] };
}

export function insertWebLinkAfterEmailIntro(html: string, notice: string) {
  if (!html.includes(emailOnlyStart)) return html.replace(/(<body[^>]*>)/i, `$1${notice}`);
  if (!html.includes(emailOnlyEnd)) throw new Error("Invalid email-only briefing HTML");
  return html.replace(emailOnlyEnd, `${emailOnlyEnd}${notice}`);
}
