import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import "./sites-env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
const rawArgs = process.argv.slice(2);
const local = rawArgs.includes("--local");
const args = rawArgs.filter((arg) => arg !== "--local");
const command = args[0] ?? "status";

function usage(message) {
  if (message) console.error(`오류: ${message}\n`);
  console.error(`사용법:
  npm run subscribers -- status
  npm run subscribers -- pending
  npm run subscribers -- approved
  npm run subscribers -- rejected
  npm run subscribers -- recipients
  npm run subscribers -- approve person@example.com
  npm run subscribers -- reject person@example.com

기본 대상은 production D1입니다. 로컬 DB는 명령 끝에 --local을 붙이세요.`);
  process.exitCode = 1;
}

function emailLiteral(value) {
  const normalized = value?.trim().toLowerCase();
  if (!normalized || normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    usage("정확한 이메일 주소를 입력해주세요.");
    return null;
  }
  return `'${normalized.replaceAll("'", "''")}'`;
}

function execute(sql) {
  if (!existsSync(wrangler)) {
    throw new Error("의존성이 없습니다. 먼저 npm install을 실행해주세요.");
  }

  const result = spawnSync(
    process.execPath,
    [
      wrangler,
      "d1",
      "execute",
      "DB",
      local ? "--local" : "--remote",
      "--config",
      path.join(root, "wrangler.jsonc"),
      "--command",
      sql,
      "--json",
    ],
    { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || result.stdout.trim() || "D1 명령 실행에 실패했습니다.");
  }

  const payload = JSON.parse(result.stdout);
  return payload.flatMap((entry) => entry.results ?? []);
}

function printRows(rows) {
  if (rows.length === 0) {
    console.log("해당 구독자가 없습니다.");
    return;
  }
  console.table(rows);
}

try {
  if (command === "status") {
    printRows(execute("SELECT status, COUNT(*) AS count FROM subscribers GROUP BY status ORDER BY status"));
  } else if (["pending", "approved", "rejected"].includes(command)) {
    printRows(
      execute(
        `SELECT email, COALESCE(name, '-') AS name, interests, notification_status,
                notification_attempts, notification_error, created_at, last_applied_at
         FROM subscribers WHERE status = '${command}' ORDER BY last_applied_at DESC`,
      ),
    );
  } else if (command === "recipients") {
    printRows(
      execute(
        `SELECT email, COALESCE(name, '-') AS name, interests, last_sent_at
         FROM subscribers WHERE status = 'approved' ORDER BY created_at ASC`,
      ),
    );
  } else if (command === "approve" || command === "reject") {
    const email = emailLiteral(args[1]);
    if (!email) process.exit();
    const now = new Date().toISOString();
    const approving = command === "approve";
    const nextStatus = approving ? "approved" : "rejected";
    const timestampColumn = approving ? "approved_at" : "rejected_at";
    const otherColumn = approving ? "rejected_at" : "approved_at";
    const rows = execute(
      `UPDATE subscribers
       SET status = '${nextStatus}', ${timestampColumn} = '${now}', ${otherColumn} = NULL
       WHERE normalized_email = ${email} AND status IN ('pending', 'approved', 'rejected')
       RETURNING email, COALESCE(name, '-') AS name, status, ${timestampColumn} AS changed_at`,
    );
    printRows(rows);
    if (rows.length > 0) console.log(`${rows[0].email}: ${nextStatus} 처리 완료`);
  } else {
    usage(`알 수 없는 명령: ${command}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
