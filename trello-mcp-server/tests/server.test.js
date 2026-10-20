import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { TrelloClient } from "../lib/trelloClient.js";
import { loadConfig } from "../lib/env.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("TrelloClient List Auto-Detection", () => {
  test("autoDetectLists correctly matches semantic column names", async () => {
    const client = new TrelloClient({ apiKey: "mock-key", token: "mock-token" });

    // Mock getBoardLists
    client.getBoardLists = async () => [
      { id: "list-1", name: "Backlog / To Do", closed: false },
      { id: "list-2", name: "In Progress (Active)", closed: false },
      { id: "list-3", name: "QA & Code Review", closed: false },
      { id: "list-4", name: "Done / Shipped", closed: false },
      { id: "list-5", name: "Old Archive", closed: true },
    ];

    const detected = await client.autoDetectLists("mock-board-id");

    assert.strictEqual(detected.todo?.id, "list-1");
    assert.strictEqual(detected.inProgress?.id, "list-2");
    assert.strictEqual(detected.review?.id, "list-3");
    assert.strictEqual(detected.done?.id, "list-4");
    assert.strictEqual(detected.all.length, 4); // Only open lists
  });

  test("resolveListForStatus uses explicit config when provided", async () => {
    const client = new TrelloClient({ apiKey: "mock-key", token: "mock-token" });
    const config = {
      listInProgress: "explicit-in-progress-id",
      listDone: "explicit-done-id",
    };

    const resProg = await client.resolveListForStatus("mock-card", "in_progress", config);
    assert.strictEqual(resProg.id, "explicit-in-progress-id");

    const resDone = await client.resolveListForStatus("mock-card", "done", config);
    assert.strictEqual(resDone.id, "explicit-done-id");
  });

  test("resolveListForStatus falls back to board auto-detection", async () => {
    const client = new TrelloClient({ apiKey: "mock-key", token: "mock-token" });

    client.getCardRaw = async () => ({
      id: "card-123",
      idBoard: "board-456",
    });

    client.getBoardLists = async () => [
      { id: "prog-id", name: "Doing", closed: false },
      { id: "done-id", name: "Finished", closed: false },
    ];

    const res = await client.resolveListForStatus("card-123", "in_progress", {});
    assert.strictEqual(res.id, "prog-id");

    const resDone = await client.resolveListForStatus("card-123", "done", {});
    assert.strictEqual(resDone.id, "done-id");
  });
});

describe("Config & Env Loading", () => {
  const originalEnv = { ...process.env };
  const originalArgv = [...process.argv];

  beforeEach(() => {
    delete process.env.TRELLO_API_KEY;
    delete process.env.TRELLO_TOKEN;
    delete process.env.TRELLO_BOARD_ID;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    process.argv = [...originalArgv];
  });

  test("throws informative error when credentials missing", () => {
    assert.throws(
      () => loadConfig(),
      /Missing TRELLO_API_KEY or TRELLO_TOKEN/
    );
  });

  test("loads from process.env when present", () => {
    process.env.TRELLO_API_KEY = "env-api-key";
    process.env.TRELLO_TOKEN = "env-token";
    process.env.TRELLO_BOARD_ID = "env-board";

    const cfg = loadConfig();
    assert.strictEqual(cfg.apiKey, "env-api-key");
    assert.strictEqual(cfg.token, "env-token");
    assert.strictEqual(cfg.boardId, "env-board");
  });

  test("parses CLI flags", () => {
    process.argv = [
      "node",
      "server.js",
      "--api-key",
      "cli-api-key",
      "--token",
      "cli-token",
      "--board-id",
      "cli-board",
    ];

    const cfg = loadConfig();
    assert.strictEqual(cfg.apiKey, "cli-api-key");
    assert.strictEqual(cfg.token, "cli-token");
    assert.strictEqual(cfg.boardId, "cli-board");
  });
});

describe("Standalone Bundle Verification", () => {
  test("dist/trello-mcp.cjs exists and is valid bundle", () => {
    const bundlePath = resolve(__dirname, "..", "dist", "trello-mcp.cjs");
    assert.strictEqual(existsSync(bundlePath), true, "dist/trello-mcp.cjs must exist");

    const content = readFileSync(bundlePath, "utf8");
    assert.ok(content.length > 50000, "Bundle must have compiled SDK contents");
    assert.ok(content.includes("auto_detect_lists"), "Bundle must contain new tools");
    assert.ok(content.includes("create_github_pr"), "Bundle must contain PR tool");
    assert.ok(content.includes("run_pre_commit_tests"), "Bundle must contain test runner tool");
  });
});
