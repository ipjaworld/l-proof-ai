const origin = "https://l-proof-ai.xyz";
const checks = [
  { path: "/", type: "html" },
  { path: "/articles", type: "html" },
  { path: "/api/public/v1/articles?limit=1", type: "articles" },
];

async function fetchWithRetry(url, attempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "user-agent": "l-proof-ai-production-smoke/1.0" },
        signal: AbortSignal.timeout(15_000),
      });

      if (response.ok) {
        return response;
      }

      lastError = new Error(`${url} returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, 3_000));
    }
  }

  throw lastError;
}

const results = [];

for (const check of checks) {
  const url = new URL(check.path, origin).toString();
  const response = await fetchWithRetry(url);

  if (check.type === "articles") {
    const payload = await response.json();
    if (payload.version !== 1 || !Array.isArray(payload.items) || payload.items.length === 0) {
      throw new Error(`${url} did not return the expected public article feed`);
    }
  }

  results.push({ path: check.path, status: response.status });
}

console.log(JSON.stringify({ ok: true, origin, checks: results }, null, 2));
