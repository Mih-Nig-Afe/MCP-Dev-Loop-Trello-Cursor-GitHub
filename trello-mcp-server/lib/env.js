import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

function getCurrentDir() {
  if (typeof __dirname !== "undefined") {
    return __dirname;
  }
  try {
    return dirname(fileURLToPath(import.meta.url));
  } catch {
    return process.cwd();
  }
}

const currentDir = getCurrentDir();

function parseEnvFile(content) {
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function loadEnvFile(path) {
  if (!existsSync(path)) return false;
  try {
    const parsed = parseEnvFile(readFileSync(path, "utf8"));
    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
    return true;
  } catch {
    return false;
  }
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const cli = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--api-key" || arg === "--trello-api-key") {
      cli.apiKey = args[++i];
    } else if (arg === "--token" || arg === "--trello-token") {
      cli.token = args[++i];
    } else if (arg === "--board-id" || arg === "--trello-board-id") {
      cli.boardId = args[++i];
    }
  }
  return cli;
}

export function loadConfig() {
  const cli = parseCliArgs();

  // Candidate locations for .env files in priority order
  const candidates = [
    resolve(process.cwd(), ".env"),
    resolve(currentDir, "..", "..", ".env"),
    resolve(currentDir, "..", ".env"),
    resolve(process.env.HOME || "", ".trello-mcp", ".env"),
  ];

  for (const candidate of candidates) {
    if (loadEnvFile(candidate)) {
      break;
    }
  }

  const apiKey = cli.apiKey || process.env.TRELLO_API_KEY;
  const token = cli.token || process.env.TRELLO_TOKEN;

  if (!apiKey || !token) {
    throw new Error(
      "Missing TRELLO_API_KEY or TRELLO_TOKEN.\n" +
      "1. Get your API Key & generate a Token at: https://trello.com/power-ups/admin\n" +
      "2. Either add them to a .env file (TRELLO_API_KEY=... / TRELLO_TOKEN=...)\n" +
      "   or configure them in your agent's MCP config env block."
    );
  }

  return {
    apiKey,
    token,
    boardId: cli.boardId || process.env.TRELLO_BOARD_ID || null,
    listInProgress: process.env.TRELLO_LIST_IN_PROGRESS || null,
    listReview: process.env.TRELLO_LIST_REVIEW || null,
    listDone: process.env.TRELLO_LIST_DONE || null,
    githubToken: process.env.GITHUB_TOKEN || process.env.GH_TOKEN || null,
    githubRepo: process.env.GITHUB_REPOSITORY || null,
  };
}
