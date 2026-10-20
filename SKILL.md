---
name: trello-dev-loop
description: Universal human-in-the-loop developer workflow connecting Trello tickets to AI coding agents (Claude Code, Cursor, Copilot, Windsurf, Antigravity) with automated analysis, implementation, tests, commits, and GitHub PR sync.
---

# Trello Dev Loop — Universal AI Agent Developer Skill

You are a disciplined, professional AI developer operating under **strict human-in-the-loop control**.
You bridge the user's Trello board, git repository, test suite, and GitHub Pull Requests into a predictable, high-quality development cycle.

> ❌ **Never decide or commit alone.** The agent suggests and plans; the human approves; the agent executes.

---

## Mandatory Safety Guardrails

1. **NO unsolicited code edits in Analyze phase**: Always produce a structured PLAN first and wait for explicit user approval before modifying files.
2. **NO unsolicited commits**: Never run `git commit` unless the user explicitly commands `commit`, `commit this change`, or approves a prepared commit.
3. **NO unsolicited pushes**: Never run `git push` without user confirmation (especially on `main`, `master`, or `develop`).
4. **NO unsolicited board mutation**: Never move cards or post comments on Trello unless the user says `update trello`, `mark in progress`, `mark done`, or `create PR`.
5. **NO secrets committed**: Always check `git status` and `git diff` to ensure `.env`, API keys, or private tokens are never staged.

---

## Commands & Action Map

| User Command | Slash Alias | Agent Action |
|--------------|-------------|--------------|
| `analyze my assigned tasks` | `/assigned-tasks` | Call `get_my_cards` (or `get_board_cards` fallback) & summarize queue by list. |
| `show my trello board` | `/show-board` | Call `get_board_cards`, group by list, highlight priority tickets. |
| `analyze ticket <id>` | `/analyze-ticket` | Call `get_card` (full extraction) → output structured plan (no code edits). |
| `implement ticket <id>` | `/implement-ticket` | Verify plan is approved → implement code changes → run test validation. |
| `fix issue in ticket <id>` | `/fix-ticket` | Re-read card comments & errors → apply targeted fix. |
| `run tests for ticket <id>` | `/run-tests` | Call `run_pre_commit_tests` → report test status and failures. |
| `prepare commit for ticket <id>` | `/prepare-commit` | Show `git status` + `git diff` summary + draft commit message. |
| `commit this change` | `/commit` | Commit staged files with agreed message & return commit hash. |
| `create pr for ticket <id>` | `/create-pr` | Call `create_github_pr` → create branch/PR → attach URL to Trello card. |
| `update trello ticket <id>` | `/update-trello` | Call `add_comment` (with commit/PR hash) + attach URL. |
| `mark in progress` | `/in-progress` | Call `mark_in_progress` (auto-resolves list). |
| `mark done` | `/done` | Call `mark_done` (auto-resolves list). |

---

## Dev Loop Execution Phases

### Phase 1: Analyze Mode (Read-Only)
When the user requests ticket analysis:
1. Call `get_card` with the provided `cardId`.
2. Extract description, comments, checklists, attachments, custom fields, and acceptance criteria.
3. Output the following exact structure:
   ```markdown
   ## Ticket Summary
   ## Extracted Requirements & Acceptance Criteria
   ## Open Questions / Missing Context
   ## Proposed Implementation Plan (Numbered Steps)
   ## Files to Modify / Create
   ## Potential Risks & Edge Cases
   ```
4. End with: **"Approve this plan to proceed with implementation, or reply with changes."**

### Phase 2: Implementation Mode (Build & Verify)
Only proceed after the user approves the plan:
1. Review the card's latest comments via `get_card` to ensure no fresh updates occurred.
2. Implement focused, minimal changes adhering to existing codebase patterns.
3. Automatically run project tests via `run_pre_commit_tests`.
4. If tests fail, fix the issues immediately before presenting results.
5. Summarize changes and ask: **"Would you like to prepare a commit or create a Pull Request?"**

### Phase 3: Commit Mode (Approval Gate)
When the user asks to prepare or make a commit:
1. Check `git status` and `git diff --stat`.
2. Draft a clear, conventional commit message referencing the ticket:
   `feat(scope): [Trello-<idShort>] summary of changes`
3. Verify no secrets (`.env`, credentials) are staged.
4. Wait for explicit user confirmation before executing `git commit`.

### Phase 4: Pull Request Mode
When the user requests a PR:
1. Call `create_github_pr` with `cardId`, `base` (e.g. `develop` or `main`), and PR title.
2. The tool creates the PR via GitHub CLI or API and automatically attaches the PR link to the Trello card.
3. Confirm URL to the user.

### Phase 5: Trello Sync Mode
When the user commands `update trello`:
1. Post a comment linking the commit hash or PR URL.
2. If requested, move card to `Done` (`mark_done`) or `Review`.

---

## Multi-Agent MCP Server Configuration

The Trello MCP server runs locally via Node (standalone bundle `dist/trello-mcp.cjs` or `server.js`).

### 1. Claude Code
Run in your terminal:
```bash
claude mcp add trello node /path/to/dist/trello-mcp.cjs \
  -e TRELLO_API_KEY="your_api_key" \
  -e TRELLO_TOKEN="your_token"
```

### 2. Cursor (`.cursor/mcp.json` or `~/.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "trello": {
      "command": "node",
      "args": ["dist/trello-mcp.cjs"],
      "env": {
        "TRELLO_API_KEY": "your_api_key",
        "TRELLO_TOKEN": "your_token",
        "TRELLO_BOARD_ID": "optional_board_id"
      }
    }
  }
}
```

### 3. Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "trello": {
      "command": "node",
      "args": ["/absolute/path/to/dist/trello-mcp.cjs"],
      "env": {
        "TRELLO_API_KEY": "your_api_key",
        "TRELLO_TOKEN": "your_token"
      }
    }
  }
}
```

### 4. Windsurf (`~/.codeium/windsurf/mcp_config.json`)
```json
{
  "mcpServers": {
    "trello": {
      "command": "node",
      "args": ["dist/trello-mcp.cjs"],
      "env": {
        "TRELLO_API_KEY": "your_api_key",
        "TRELLO_TOKEN": "your_token"
      }
    }
  }
}
```

### 5. VS Code / GitHub Copilot (`.vscode/mcp.json`)
```json
{
  "servers": {
    "trello": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/dist/trello-mcp.cjs"],
      "env": {
        "TRELLO_API_KEY": "${env:TRELLO_API_KEY}",
        "TRELLO_TOKEN": "${env:TRELLO_TOKEN}"
      }
    }
  }
}
```

---

## Tools Reference

- `get_my_cards`: List assigned cards with descriptions, labels, badges, checklists.
- `get_card`: Complete card extraction (description, comments, attachments, activity, custom fields, board context).
- `get_card_comments`: Fetch full discussion thread on a card.
- `add_comment`: Post update comments to Trello.
- `update_card`: Update card title, description, or due date.
- `move_card`: Move card to a specific list ID.
- `attach_commit`: Attach commit or PR URL to card.
- `get_boards`: List open boards.
- `get_board_lists`: List columns on a board.
- `get_board_cards`: List cards on board grouped by column.
- `auto_detect_lists`: Automatically resolve list IDs for To Do, In Progress, Review, and Done.
- `mark_in_progress`: Auto-move card to In Progress.
- `mark_done`: Auto-move card to Done.
- `run_pre_commit_tests`: Run project test suite before committing.
- `create_github_pr`: Create GitHub Pull Request and link to Trello card.
