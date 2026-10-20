# Cursor Rules

Agent behavior for **MCP Dev Loop**. Copy into your project or use this repo as your Cursor workspace.

## Install

**Option A — use this repo as workspace**  
`.cursor/` is already configured. Open the repo in Cursor.

**Option B — add to another project**

```bash
# From your app repo root
cp -R /path/to/trello-dev-loop/cursor-rules/ai-dev-agent.mdc .cursor/rules/
cp -R /path/to/trello-dev-loop/cursor-rules/skills .cursor/
cp -R /path/to/trello-dev-loop/cursor-rules/hooks .cursor/
cp /path/to/trello-dev-loop/cursor-rules/hooks.json .cursor/
chmod +x .cursor/hooks/*.sh
```

**Option C — global MCP + skill** (works in any project)

From this repo:

```bash
./bin/sync-global-cursor.sh
```

Updates `~/.cursor/mcp.json` and `~/.cursor/skills/trello-dev-loop/SKILL.md`. Re-run after `git pull`.

## Contents

| File | Purpose |
|------|---------|
| `ai-dev-agent.mdc` | Always-on safety: human approval before commit, push, Trello writes |
| `skills/trello-dev-loop/SKILL.md` | Full workflow: analyze → implement → commit → sync |
| `hooks.json` + `hooks/` | Cursor hooks that gate git and Trello MCP calls |

## Philosophy

- AI **suggests**
- Human **approves**
- AI **executes**

Not autonomous. See [docs/safety-model.md](../docs/safety-model.md).
