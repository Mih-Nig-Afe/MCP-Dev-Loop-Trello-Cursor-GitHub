# MCP Dev Loop: Trello → Multi-Agent (Cursor, Claude Code, Windsurf, Copilot) → GitHub

**Human-in-the-loop AI development** — Trello tickets drive structured analysis, implementation, automated tests, commits, and GitHub Pull Requests across any AI coding agent.

> ❌ **Not autonomous AI** — the agent suggests, plans, and tests; you approve; the agent executes.  
> ✅ **Human-in-the-loop** — no surprise commits, pushes, or unverified Trello updates.

Connect Trello via MCP and run a repeatable, safe dev loop across **Claude Code, Cursor, Windsurf, VS Code Copilot, and Claude Desktop**.

---

## Architecture

```
┌──────────────┐     ┌───────────────────────┐     ┌────────────────────────────┐
│   Trello     │ ──► │   Trello MCP Server   │ ──► │ AI Coding Agent (Human Ctrl)│
│  (Tickets)   │     │ (Standalone / Node)   │     │ Claude Code / Cursor / etc.│
└──────────────┘     └───────────────────────┘     └─────────────┬──────────────┘
                                                                 │
                                ┌────────────────────────────────┼────────────────────────────────┐
                                ▼                                ▼                                ▼
                         ┌─────────────┐                  ┌─────────────┐                  ┌─────────────┐
                         │  Codebase   │ ───────────────► │   GitHub    │ ───────────────► │   Trello    │
                         │ Edits/Tests │   automated PR   │ PRs/Commits │   update/sync    │  comments   │
                         └─────────────┘                  └─────────────┘                  └─────────────┘
```

---

## Supported AI Coding Agents

- **Cursor**: Full support via `.cursor/mcp.json` + rule guardrails
- **Claude Code**: Terminal agent support via `claude mcp add`
- **Claude Desktop**: Native macOS & Windows support via `claude_desktop_config.json`
- **Windsurf**: Native Cascade support via `~/.codeium/windsurf/mcp_config.json`
- **VS Code / GitHub Copilot**: Integrated MCP via `.vscode/mcp.json`
- **Antigravity / Gemini CLI**: Multi-agent orchestration support

---

## Repository Structure

| Path | Purpose |
|------|---------|
| [`SKILL.md`](./SKILL.md) | Universal agent skill definition (Agensi.io compliant) |
| [`trello-mcp-server/`](./trello-mcp-server/) | Core engine — Trello API, list auto-detection, PR & test tools |
| [`configs/`](./configs/) | Ready-to-use MCP configuration templates for all major agents |
| [`bin/setup.sh`](./bin/setup.sh) | 1-Click interactive multi-agent installer (macOS / Linux) |
| [`bin/setup.ps1`](./bin/setup.ps1) | 1-Click interactive multi-agent installer (Windows PowerShell) |
| [`scripts/package-agensi.js`](./scripts/package-agensi.js) | Agensi.io commercial packager (<50 MB verified release) |
| [`docs/agensi-listing.md`](./docs/agensi-listing.md) | Marketplace copy, pricing ($14), and seller checklist |
| [`cursor-rules/`](./cursor-rules/) | Cursor agent rules, skills, and approval hooks |
| [`workflows/`](./workflows/) | Command workflows (`analyze ticket`, `implement ticket`, …) |
| [`examples/`](./examples/) | End-to-end session walkthroughs |

---

## Quick Start (1 Minute)

### Option A: Interactive 1-Click Setup (Recommended)

```bash
# macOS / Linux
./bin/setup.sh

# Windows (PowerShell)
.\bin\setup.ps1
```

The setup script prompts for your Trello API credentials and automatically configures your selected AI agent.

### Option B: Manual Setup

1. Copy `.env.example` to `.env` and fill in:
   ```env
   TRELLO_API_KEY=your_trello_api_key
   TRELLO_TOKEN=your_trello_token
   TRELLO_BOARD_ID=optional_board_id
   ```
   *(Get free credentials at [trello.com/power-ups/admin](https://trello.com/power-ups/admin))*
2. Build standalone runner & test:
   ```bash
   npm run build
   npm test
   ```
3. Copy the appropriate configuration from [`configs/`](./configs/) to your agent's config directory.

---

## Daily Workflow

| Step | You say | Agent does |
|------|---------|------------|
| 1. Pull | `analyze my assigned tasks` | Lists your assigned Trello queue |
| 2. Plan | `analyze ticket <id>` | Full card extraction → **PLAN** (read-only, no code edits) |
| 3. Approve | `proceed` | Gives approval to start implementation |
| 4. Build | `implement ticket <id>` | Modifies codebase according to approved plan |
| 5. Test | `run tests for ticket <id>` | Runs project test suite (`run_pre_commit_tests`) |
| 6. Commit | `prepare commit for ticket <id>` | Shows diff + drafts ticket-linked commit message |
| 7. PR | `create pr for ticket <id>` | Creates GitHub PR (`create_github_pr`) & links to Trello |
| 8. Sync | `update trello ticket <id>` | Posts comment + moves card to Done / Review |

---

## MCP Tools Reference

- **`get_my_cards`**: Assigned cards with description, labels, checklists, and badges.
- **`get_card`**: Complete extraction (description, comments, attachments, checklists, custom fields, member activity).
- **`auto_detect_lists`**: Semantically matches board columns (To Do, In Progress, Review, Done) — no manual list ID setup needed.
- **`run_pre_commit_tests`**: Runs local test suite (`npm test`, `pytest`, `cargo test`, `go test`) prior to commit.
- **`create_github_pr`**: Creates a GitHub branch, pushes, opens a PR, and attaches the URL to the Trello card.
- **`mark_in_progress`**: Moves ticket to In Progress (with auto-list matching).
- **`mark_done`**: Moves ticket to Done (with auto-list matching).
- **`attach_commit`**: Attaches commit or PR URL to card.
- **`add_comment`**: Posts review or implementation comment.
- **`get_boards`** / **`get_board_cards`** / **`get_board_lists`**: Full board navigation.

---

## Agensi.io Marketplace Release

To package this project for [Agensi.io](https://www.agensi.io/sell):

```bash
npm run package:agensi
```

This compiles a standalone single-file bundle via `esbuild`, validates the root `SKILL.md` frontmatter, verifies package size (<50 MB, typically ~110 KB), and produces:
```
dist/mcp-dev-loop-agensi.zip
```
Complete seller copy, pricing ($14.00), and upload guide: [docs/agensi-listing.md](./docs/agensi-listing.md).

---

## Safety & Human Oversight

- **Strict Approval Gates**: AI never commits, pushes, or moves Trello cards without explicit user commands.
- **Pre-commit Test Guard**: Verifies project test status before staging files.
- **Zero Secret Leaks**: Automated scans skim diffs to ensure `.env` and API credentials are never committed.

---

## License

MIT License — Copyright (c) 2026 Mihretab Afework (Mih-Nig-Afe). See [LICENSE](./LICENSE).  
Commercial Agensi Distribution: See [LICENSE-COMMERCIAL.md](./LICENSE-COMMERCIAL.md).
