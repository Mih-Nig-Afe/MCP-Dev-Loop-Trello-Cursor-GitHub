# Agensi.io Marketplace Listing Kit — Trello Dev Loop

Use this document to list **Trello Dev Loop** on [Agensi.io](https://www.agensi.io/sell). Everything below is formatted and ready for copy-pasting.

---

## 1. Product Metadata

| Field | Value |
|---|---|
| **Product Title** | Trello Dev Loop — Human-in-the-Loop AI Coding & GitHub PR Sync |
| **Subtitle / One-Liner** | Connect Trello tickets to Claude Code, Cursor, Copilot, and Windsurf with automated ticket analysis, pre-commit tests, and GitHub PR creation. |
| **Category** | Developer Tools & Productivity |
| **Listing Price** | **$14.00** *(Net Payout: $9.80 / 70% creator share. Agensi covers Stripe fees).* |
| **Upload Package** | `dist/mcp-dev-loop-agensi.zip` *(Generated via `npm run package:agensi`, size ~110 KB)* |
| **Repository Link** | https://github.com/Mih-Nig-Afe/trello-dev-loop |
| **Author** | Mihretab Afework (`Mih-Nig-Afe`) |
| **Tags** | `trello`, `mcp`, `cursor`, `claude-code`, `windsurf`, `github`, `git-workflow`, `developer-tools` |

---

## 2. Short Marketplace Summary (Search & Card View)

> Turn Trello into your AI agent's mission control. Bridges Trello cards directly to your codebase, git commits, and GitHub Pull Requests across Claude Code, Cursor, Windsurf, Copilot, and Antigravity. Features strict human-in-the-loop safety guardrails, pre-commit test execution, and zero-config semantic list matching. Includes 1-click cross-platform setup.

---

## 3. Product Description (Paste into Agensi Product Page)

```markdown
# Trello Dev Loop: AI Agent Workflow from Tickets to GitHub PRs

Stop manually copy-pasting ticket requirements, switching back and forth between browser tabs, and writing manual commit summaries.

**Trello Dev Loop** provides a complete, battle-tested MCP server and universal AI agent skill that turns Trello tickets into structured analysis plans, atomic code implementations, verified pre-commit test runs, and linked GitHub Pull Requests.

---

### 🛡️ Human-in-the-Loop Safety by Design
AI should never push surprise commits or close tickets without your sign-off.
- **Analyze Mode**: Produces a structured implementation plan and list of affected files — **zero unsolicited code edits**.
- **Commit Guard**: Shows diffs and drafts ticket-linked commit messages — **requires explicit user approval**.
- **Board Sync**: Never posts comments or moves cards until you give the word.

---

### ⚡ Supported AI Coding Agents
Compatible out-of-the-box with:
- **Claude Code** (CLI)
- **Cursor**
- **Claude Desktop**
- **Windsurf**
- **VS Code / GitHub Copilot**
- **Antigravity / Gemini CLI**

---

### 🚀 Key Capabilities
- **Complete Ticket Extraction**: Retrieves ticket descriptions, comment history, checklists, attachments, custom fields, and member activity in a single call.
- **Semantic List Auto-Detection**: No need to configure obscure Trello list IDs. The engine automatically matches your board's "To Do", "In Progress", "Review", and "Done" columns.
- **Automated Pre-Commit Tests**: Automatically detects and runs your project's test suite (`npm test`, `pytest`, `cargo test`, `go test`) before code is staged.
- **One-Click GitHub Pull Requests**: Creates a git branch, opens a GitHub PR (via `gh` CLI or GitHub API), and automatically attaches the PR link directly back to the Trello card.

---

### 📦 What's Included in this Download
1. **`SKILL.md`**: Universal agent instruction system specifying trigger commands, phase workflows, and safety gates.
2. **Pre-compiled MCP Engine (`dist/trello-mcp.cjs`)**: Self-contained, minified single-file runner. No complex node_modules installation required.
3. **Ready-to-Use Agent Configs (`configs/`)**: Pre-configured JSON templates for Cursor, Claude Desktop, Claude Code, Windsurf, and VS Code Copilot.
4. **1-Click Setup Scripts (`bin/setup.sh` & `bin/setup.ps1`)**: Cross-platform interactive scripts that validate your credentials and configure your agent in 60 seconds.
5. **Commercial Single-User License**: Full rights for personal and commercial client repositories.

---

### 🛠️ Quick Start (1 Minute)

1. Unzip the package.
2. Run the interactive installer:
   - **macOS / Linux**: `./bin/setup.sh`
   - **Windows (PowerShell)**: `.\bin\setup.ps1`
3. Enter your Trello API Key and Token (free from [trello.com/power-ups/admin](https://trello.com/power-ups/admin)).
4. Open your agent and chat:
   \`\`\`
   analyze my assigned tasks
   analyze ticket <card-id>
   implement ticket <card-id>
   create pr for ticket <card-id>
   mark done
   \`\`\`
```

---

## 4. Agensi Automated Security Scan & Review Notes

Agensi scans uploaded packages before manual review. This release is optimized to pass cleanly:
- **Local Stdio Transport**: No background HTTP daemon, open listening ports, or reverse tunnels. The server runs strictly over local stdin/stdout child process transport.
- **Zero Remote Tracking**: Zero analytics, telemetry, or third-party webhooks.
- **Safe Child Processes**: Git and test commands run with scoped timeouts and sanitize shell arguments.
- **No Bundled Secrets**: The ZIP bundle contains no `.env` files, API keys, or embedded tokens. Credentials are supplied by the end-user locally.
- **Single-File Standalone Bundle**: Packaged with `esbuild` (<350 KB uncompressed, ~110 KB zipped), well below the 50 MB ceiling.

---

## 5. Creator Upload Checklist for Mihretab

1. Sign up / Log in to [agensi.io](https://www.agensi.io) using Google (`mnay.mtab@gmail.com`).
2. Go to **Account Settings** and toggle on **Creator Mode**.
3. Click the **Upload Skill** / **Sell** button or visit [https://www.agensi.io/sell](https://www.agensi.io/sell).
4. Upload `dist/mcp-dev-loop-agensi.zip`.
5. Paste the Product Title, Subtitle, and Description from Sections 1, 2, and 3 above.
6. Set the price to **$14.00**.
7. Submit for review! (Typically reviewed and live within 24 hours).
