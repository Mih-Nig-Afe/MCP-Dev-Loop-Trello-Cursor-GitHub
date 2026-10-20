#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadConfig } from "./lib/env.js";
import { TrelloClient } from "./lib/trelloClient.js";

const execAsync = promisify(exec);

function textResult(data) {
  const payload = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return { content: [{ type: "text", text: payload }] };
}

async function main() {
  const config = loadConfig();
  const trello = new TrelloClient(config);

  const server = new McpServer({
    name: "trello",
    version: "2.0.0",
    description: "MCP Dev Loop — Trello ticket integration for Claude Code, Cursor, Copilot, Windsurf, Antigravity",
  });

  server.tool(
    "get_my_cards",
    "List Trello cards assigned to the authenticated member (includes description, labels, checklists, badges).",
    {},
    async () => {
      const cards = await trello.getMyCards();
      return textResult(cards.map((card) => trello.formatCardBrief(card)));
    }
  );

  server.tool(
    "get_card",
    "Get complete Trello card extraction: description, all comments, attachments, checklists, custom fields, stickers, activity, list/board context.",
    { cardId: z.string().describe("Trello card ID or short link ID") },
    async ({ cardId }) => {
      const full = await trello.getCardFull(cardId);
      return textResult(full);
    }
  );

  server.tool(
    "get_card_comments",
    "Get all comments on a Trello card (up to 1000).",
    { cardId: z.string().describe("Trello card ID") },
    async ({ cardId }) => {
      const comments = await trello.getCardComments(cardId);
      return textResult(comments);
    }
  );

  server.tool(
    "add_comment",
    "Add a comment to a Trello card. Requires explicit user approval in the dev workflow.",
    {
      cardId: z.string().describe("Trello card ID"),
      text: z.string().describe("Comment body"),
    },
    async ({ cardId, text }) => {
      const result = await trello.addComment(cardId, text);
      return textResult({ ok: true, actionId: result.id, date: result.date });
    }
  );

  server.tool(
    "update_card",
    "Update Trello card fields (name, desc, due). Does not move lists.",
    {
      cardId: z.string().describe("Trello card ID"),
      name: z.string().optional().describe("New card title"),
      desc: z.string().optional().describe("New card description"),
      due: z.string().optional().describe("ISO due date or null to clear"),
    },
    async ({ cardId, name, desc, due }) => {
      const data = {};
      if (name !== undefined) data.name = name;
      if (desc !== undefined) data.desc = desc;
      if (due !== undefined) data.due = due;
      const card = await trello.updateCard(cardId, data);
      return textResult({ ok: true, id: card.id, name: card.name });
    }
  );

  server.tool(
    "move_card",
    "Move a card to another list. Requires explicit user approval (e.g. 'mark in progress', 'mark done').",
    {
      cardId: z.string().describe("Trello card ID"),
      listId: z.string().describe("Target list ID"),
    },
    async ({ cardId, listId }) => {
      const card = await trello.moveCard(cardId, listId);
      return textResult({ ok: true, id: card.id, listId: card.idList });
    }
  );

  server.tool(
    "attach_commit",
    "Attach a commit or PR URL to a Trello card.",
    {
      cardId: z.string().describe("Trello card ID"),
      url: z.string().url().describe("Commit or PR URL"),
      name: z.string().optional().describe("Attachment label"),
    },
    async ({ cardId, url, name }) => {
      const attachment = await trello.attachUrl(cardId, url, name || "Commit");
      return textResult({ ok: true, attachmentId: attachment.id, url: attachment.url });
    }
  );

  server.tool(
    "get_boards",
    "List open Trello boards for the authenticated member.",
    {},
    async () => {
      const boards = await trello.getBoards();
      return textResult(
        boards.map((b) => ({ id: b.id, name: b.name, url: b.shortUrl }))
      );
    }
  );

  server.tool(
    "get_board_lists",
    "List columns (lists) on a board. Use to resolve list IDs for move_card.",
    { boardId: z.string().describe("Trello board ID") },
    async ({ boardId }) => {
      const lists = await trello.getBoardLists(boardId);
      return textResult(
        lists.map((l) => ({ id: l.id, name: l.name, closed: l.closed }))
      );
    }
  );

  server.tool(
    "get_board_cards",
    "List all cards on a board grouped by list. Uses TRELLO_BOARD_ID from .env if boardId omitted.",
    {
      boardId: z
        .string()
        .optional()
        .describe("Board ID (defaults to TRELLO_BOARD_ID in .env)"),
    },
    async ({ boardId }) => {
      const id = boardId || config.boardId;
      if (!id) {
        return textResult({
          error: "Provide boardId or set TRELLO_BOARD_ID in .env",
        });
      }
      const cards = await trello.getBoardCards(id);
      return textResult(cards);
    }
  );

  server.tool(
    "auto_detect_lists",
    "Automatically detect semantic list IDs (todo, inProgress, review, done) on a Trello board.",
    {
      boardId: z
        .string()
        .optional()
        .describe("Board ID (defaults to TRELLO_BOARD_ID in .env)"),
    },
    async ({ boardId }) => {
      const id = boardId || config.boardId;
      if (!id) {
        return textResult({
          error: "Provide boardId or set TRELLO_BOARD_ID in .env",
        });
      }
      const detected = await trello.autoDetectLists(id);
      return textResult(detected);
    }
  );

  server.tool(
    "mark_in_progress",
    "Move card to In Progress. Automatically resolves the target list if TRELLO_LIST_IN_PROGRESS is not set.",
    { cardId: z.string().describe("Trello card ID") },
    async ({ cardId }) => {
      try {
        const targetList = await trello.resolveListForStatus(cardId, "in_progress", config);
        const card = await trello.moveCard(cardId, targetList.id);
        return textResult({
          ok: true,
          id: card.id,
          listId: card.idList,
          listName: targetList.name,
          status: "in_progress",
        });
      } catch (err) {
        return textResult({ error: err.message });
      }
    }
  );

  server.tool(
    "mark_done",
    "Move card to Done. Automatically resolves the target list if TRELLO_LIST_DONE is not set.",
    { cardId: z.string().describe("Trello card ID") },
    async ({ cardId }) => {
      try {
        const targetList = await trello.resolveListForStatus(cardId, "done", config);
        const card = await trello.moveCard(cardId, targetList.id);
        return textResult({
          ok: true,
          id: card.id,
          listId: card.idList,
          listName: targetList.name,
          status: "done",
        });
      } catch (err) {
        return textResult({ error: err.message });
      }
    }
  );

  server.tool(
    "run_pre_commit_tests",
    "Run automated project tests before preparing or committing code. Verifies your changes do not break tests.",
    {
      command: z
        .string()
        .optional()
        .describe("Custom test command to execute. Defaults to project test script (e.g. npm test, pytest, go test)."),
      cwd: z
        .string()
        .optional()
        .describe("Working directory for test execution (defaults to current process directory)."),
    },
    async ({ command, cwd }) => {
      const testDir = cwd || process.cwd();
      let cmd = command;

      if (!cmd) {
        const pkgPath = resolve(testDir, "package.json");
        if (existsSync(pkgPath)) {
          try {
            const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
            if (pkg.scripts && pkg.scripts.test) {
              cmd = "npm test";
            }
          } catch {}
        }
        if (!cmd && existsSync(resolve(testDir, "pytest.ini"))) {
          cmd = "pytest";
        }
        if (!cmd && existsSync(resolve(testDir, "go.mod"))) {
          cmd = "go test ./...";
        }
        if (!cmd && existsSync(resolve(testDir, "Cargo.toml"))) {
          cmd = "cargo test";
        }
        if (!cmd) {
          cmd = "npm test";
        }
      }

      try {
        const { stdout, stderr } = await execAsync(cmd, {
          cwd: testDir,
          timeout: 60000,
          env: { ...process.env, CI: "true" },
        });
        return textResult({
          ok: true,
          command: cmd,
          passed: true,
          output: (stdout + "\n" + stderr).trim(),
        });
      } catch (err) {
        return textResult({
          ok: false,
          command: cmd,
          passed: false,
          exitCode: err.code || 1,
          output: ((err.stdout || "") + "\n" + (err.stderr || "") + "\n" + err.message).trim(),
        });
      }
    }
  );

  server.tool(
    "create_github_pr",
    "Create a GitHub Pull Request from the current branch and attach it to the Trello card.",
    {
      cardId: z.string().describe("Trello card ID to link with this Pull Request"),
      title: z.string().optional().describe("Pull Request title (defaults to ticket name)"),
      body: z.string().optional().describe("Pull Request description"),
      base: z.string().optional().describe("Target base branch (default: develop or main)"),
      draft: z.boolean().optional().describe("Create as draft PR"),
    },
    async ({ cardId, title, body, base = "develop", draft = false }) => {
      let card;
      try {
        card = await trello.getCardFull(cardId);
      } catch {
        card = { id: cardId, name: `Card ${cardId}`, url: `https://trello.com/c/${cardId}` };
      }

      const prTitle = title || `[Trello-${card.idShort || card.id.slice(-4)}] ${card.name}`;
      const prBody =
        body ||
        `## Trello Ticket\n- [${card.name}](${card.shortUrl || card.url})\n\n## Summary\nImplemented changes according to ticket requirements.\n\n---\n*Created via MCP Dev Loop*`;

      let currentBranch = "develop";
      try {
        const { stdout } = await execAsync("git rev-parse --abbrev-ref HEAD");
        currentBranch = stdout.trim();
      } catch {}

      let prUrl = null;
      let method = "none";

      // 1. Try GitHub CLI (gh)
      try {
        const draftFlag = draft ? " --draft" : "";
        const ghCmd = `gh pr create --title "${prTitle.replace(/"/g, '\\"')}" --body "${prBody.replace(/"/g, '\\"')}" --base "${base}" --head "${currentBranch}"${draftFlag}`;
        const { stdout } = await execAsync(ghCmd);
        const match = stdout.match(/https:\/\/github\.com\/[^\s]+/);
        if (match) {
          prUrl = match[0];
          method = "gh-cli";
        }
      } catch (ghErr) {
        // 2. Try GitHub REST API if GITHUB_TOKEN is available
        const token = config.githubToken;
        const repo = config.githubRepo;
        if (token && repo) {
          try {
            const apiRes = await fetch(`https://api.github.com/repos/${repo}/pulls`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                title: prTitle,
                body: prBody,
                head: currentBranch,
                base,
                draft,
              }),
            });
            const data = await apiRes.json();
            if (data.html_url) {
              prUrl = data.html_url;
              method = "github-api";
            }
          } catch {}
        }
      }

      // 3. Fallback: generate web compare URL
      if (!prUrl) {
        let repoSlug = config.githubRepo;
        if (!repoSlug) {
          try {
            const { stdout: remoteUrl } = await execAsync("git remote get-url origin");
            const match = remoteUrl.match(/github\.com[:/]([^/.]+\/[^/.]+)/);
            if (match) repoSlug = match[1].replace(/\.git$/, "");
          } catch {}
        }
        if (repoSlug) {
          prUrl = `https://github.com/${repoSlug}/compare/${base}...${currentBranch}?expand=1&title=${encodeURIComponent(prTitle)}&body=${encodeURIComponent(prBody)}`;
          method = "compare-url";
        }
      }

      let trelloAttached = false;
      if (prUrl) {
        try {
          await trello.attachUrl(cardId, prUrl, "Pull Request");
          await trello.addComment(cardId, `Pull Request linked: ${prUrl}`);
          trelloAttached = true;
        } catch {}
      }

      return textResult({
        ok: true,
        method,
        prUrl,
        branch: currentBranch,
        baseBranch: base,
        trelloAttached,
      });
    }
  );

  server.prompt(
    "analyze_ticket",
    "Structured ticket analysis — read-only planning mode, no code changes.",
    { cardId: z.string().describe("Trello card ID to analyze") },
    async ({ cardId }) => {
      const full = await trello.getCardFull(cardId);
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Analyze Trello ticket ${cardId} fully.

TICKET DATA (complete extraction — description, comments, attachments, checklists, custom fields, activity):
${JSON.stringify(full, null, 2)}

Produce a structured plan ONLY — do NOT edit code yet.

Output format:
## Summary
## Requirements
## Open questions / missing info
## Implementation plan (numbered steps)
## Suggested files to touch
## Risks

Wait for explicit user approval before implementing.`,
            },
          },
        ],
      };
    }
  );

  server.prompt(
    "implement_ticket",
    "Implementation mode — execute an approved plan for a ticket.",
    {
      cardId: z.string().describe("Trello card ID"),
      plan: z.string().optional().describe("Approved implementation plan"),
    },
    async ({ cardId, plan }) => {
      const full = await trello.getCardFull(cardId);
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Implement Trello ticket ${cardId} based on the approved plan.

TICKET (complete extraction):
${JSON.stringify(full, null, 2)}

APPROVED PLAN:
${plan || "(use the plan from the prior analyze step)"}

Rules:
- Edit the codebase to fulfill the plan
- Run relevant tests if appropriate
- Do NOT git commit unless the user explicitly says to commit
- Do NOT update Trello unless the user explicitly asks`,
            },
          },
        ],
      };
    }
  );

  server.prompt(
    "sync_ticket_after_commit",
    "After a user-approved commit, sync Trello with commit info.",
    {
      cardId: z.string().describe("Trello card ID"),
      commitHash: z.string().describe("Short or full commit hash"),
      commitUrl: z.string().optional().describe("GitHub commit URL"),
      moveToDone: z
        .boolean()
        .optional()
        .describe("Whether to move card to Done list"),
    },
    async ({ cardId, commitHash, commitUrl, moveToDone }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `User approved Trello sync for ticket ${cardId}.

1. Add comment: "Implemented in commit ${commitHash}"
${commitUrl ? `2. Attach commit URL: ${commitUrl}` : ""}
${moveToDone ? "3. Move card to Done (mark_done)" : "3. Do NOT move the card unless user asked"}

Use the trello MCP tools to perform these updates.`,
            },
          },
        ],
      };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
