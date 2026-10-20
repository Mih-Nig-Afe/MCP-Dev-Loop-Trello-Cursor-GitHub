# MCP Dev Loop: Trello → Multi-Agent (Cursor, Claude Code, Windsurf, Copilot) → GitHub

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-blue.svg" alt="Version 2.0.0" />
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License MIT" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg" alt="Node >= 18" />
  <img src="https://img.shields.io/badge/protocol-MCP%20v1-orange.svg" alt="Model Context Protocol" />
  <img src="https://img.shields.io/badge/marketplace-Agensi.io-blueviolet.svg" alt="Agensi.io Verified" />
  <img src="https://img.shields.io/badge/PRs-welcome-success.svg" alt="PRs Welcome" />
</p>

**Human-in-the-loop AI development** — Trello tickets drive structured analysis, implementation, automated tests, commits, and GitHub Pull Requests across any AI coding agent.

> ❌ **Not autonomous AI** — the agent suggests, plans, and tests; you approve; the agent executes.  
> ✅ **Human-in-the-loop** — no surprise commits, pushes, or unverified Trello updates.

Connect Trello via MCP and run a repeatable, safe dev loop across **Claude Code, Cursor, Windsurf, VS Code Copilot, Claude Desktop, and Antigravity**.

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

## What's New in v2.0.0

- 🌐 **Universal Cross-Agent Support**: Native configuration templates for Claude Code, Cursor, Windsurf, VS Code Copilot, Claude Desktop, and Antigravity.
- ⚡ **Standalone Source-Protected Runner**: Packaged with `esbuild` into a single standalone minified bundle (`dist/trello-mcp.cjs`, ~349 KB) requiring zero `node_modules` installation.
- 🔍 **Semantic List Auto-Detection (`auto_detect_lists`)**: Automatically maps "To Do", "In Progress", "Review", and "Done" columns on any board — no manual list ID setup.
- 🧪 **Pre-Commit Test Runner (`run_pre_commit_tests`)**: Runs local test suites (`npm test`, `pytest`, `cargo test`, `go test`) with timeout guards before code is staged.
- 🚀 **Automated GitHub Pull Requests (`create_github_pr`)**: Creates branches, opens GitHub PRs, and attaches links directly to Trello cards.
- 📦 **Agensi.io Commercial Release Package**: 1-command release packager (`npm run package:agensi`) producing a verified `<50 MB` distribution zip with root `SKILL.md`.

---

## Supported AI Coding Agents

| Agent | Scope | Setup Config | Command / Method |
|---|---|---|---|
| **Cursor** | Local / Global | `configs/cursor/mcp.json` | Settings → MCP → Add `trello` |
| **Claude Code** | Terminal CLI | `configs/claude-code/` | `claude mcp add trello node ./dist/trello-mcp.cjs` |
| **Claude Desktop** | macOS / Windows | `configs/claude-desktop/` | `%APPDATA%\Claude` or `~/Library/...` |
| **Windsurf** | Native Cascade | `configs/windsurf/mcp_config.json` | `~/.codeium/windsurf/mcp_config.json` |
| **VS Code Copilot** | Workspace | `configs/vscode-copilot/mcp.json` | `.vscode/mcp.json` |
| **Antigravity** | Agent SDK | `configs/antigravity/` | Native MCP stdio registration |

---

## Repository Structure

```
├── SKILL.md                          # Universal agent skill definition (Agensi.io compliant)
├── dist/
│   ├── trello-mcp.cjs                # Standalone compiled runner (349 KB)
│   └── mcp-dev-loop-agensi.zip       # Commercial release bundle (<110 KB)
├── configs/                          # Multi-agent config templates
│   ├── cursor/mcp.json
│   ├── claude-code/claude_code_config.json
│   ├── claude-desktop/claude_desktop_config.json
│   ├── windsurf/mcp_config.json
│   ├── vscode-copilot/mcp.json
│   └── antigravity/mcp_config.json
├── bin/
│   ├── setup.sh                      # 1-Click interactive setup (macOS / Linux)
│   └── setup.ps1                     # 1-Click interactive setup (Windows PowerShell)
├── docs/
│   ├── agensi-listing.md             # Commercial marketplace listing dossier & copy
│   ├── setup.md                      # Detailed manual setup guide
│   ├── safety-model.md               # Human-in-the-loop protection details
│   └── example-prompts.md            # Daily prompt patterns
├── scripts/
│   └── package-agensi.js             # Release packaging script
├── trello-mcp-server/                # Core engine source code
│   ├── server.js                     # Tool & prompt definitions
│   ├── lib/
│   │   ├── trelloClient.js           # Trello API + list auto-matcher
│   │   └── env.js                    # Multi-location credential loader
│   └── tests/                        # Automated unit tests
├── LICENSE                           # Open source MIT license (Copyright 2026 Mihretab Afework)
└── LICENSE-COMMERCIAL.md             # Commercial single-user license for Agensi buyers
```

---

## Quick Start (1 Minute)

### Option A: Interactive 1-Click Setup (Recommended)

```bash
# macOS / Linux
./bin/setup.sh

# Windows (PowerShell)
.\bin\setup.ps1
```

The setup script prompts for your Trello API credentials, tests the connection, and auto-configures your selected AI agent.

### Option B: Manual Setup

1. Copy `.env.example` to `.env` and fill in:
   ```env
   TRELLO_API_KEY=your_trello_api_key
   TRELLO_TOKEN=your_trello_token
   TRELLO_BOARD_ID=optional_board_id
   ```
   *(Get credentials at [trello.com/power-ups/admin](https://trello.com/power-ups/admin))*
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

| Tool | Description |
|---|---|
| `get_my_cards` | List cards assigned to the authenticated user. |
| `get_card` | **Complete extraction**: description, comments, checklists, custom fields, attachments, activity. |
| `auto_detect_lists` | Semantically detects board columns (*To Do*, *In Progress*, *Review*, *Done*). |
| `run_pre_commit_tests` | Automatically detects and runs project tests before staging commits. |
| `create_github_pr` | Creates a git branch, opens a GitHub PR, and attaches the link to the card. |
| `mark_in_progress` | Moves card to In Progress (with semantic list resolution). |
| `mark_done` | Moves card to Done (with semantic list resolution). |
| `attach_commit` | Attaches commit or PR URL to card. |
| `add_comment` | Posts update comments to Trello. |
| `get_boards` / `get_board_cards` / `get_board_lists` | Board navigation tools. |

---

## Commercial Distribution on Agensi.io

To package this project for listing on [Agensi.io](https://www.agensi.io/sell):

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

## Author & License

- **Author**: Mihretab Afework ([@Mih-Nig-Afe](https://github.com/Mih-Nig-Afe))
- **Open Source License**: MIT License — Copyright (c) 2026 Mihretab Afework. See [LICENSE](./LICENSE).
- **Commercial Marketplace License**: See [LICENSE-COMMERCIAL.md](./LICENSE-COMMERCIAL.md).
