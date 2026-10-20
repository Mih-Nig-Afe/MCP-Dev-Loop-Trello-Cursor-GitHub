# Setup

Get **MCP Dev Loop: Trello → Cursor → GitHub** running in under 10 minutes.

## Prerequisites

- [Cursor](https://cursor.com) (with MCP support)
- Node.js 18+
- Trello account
- `jq` (for approval hooks): `brew install jq`

## 1. Clone

```bash
git clone https://github.com/Mih-Nig-Afe/trello-dev-loop.git
cd trello-dev-loop
```

> The repo may redirect from the old `trello-cursor-dev-loop` URL — both work.

## 2. One-shot install

```bash
./bin/install.sh
```

This installs MCP server dependencies, creates `.env` from `.env.example`, and sets script permissions.

Or manually:

```bash
npm run install:mcp
cp .env.example .env
```

## 3. Trello credentials

1. Open [Trello Power-Ups Admin](https://trello.com/power-ups/admin)
2. Create or select a Power-Up → **API Key**
3. Generate a **Token** (read + write scope for your boards)
4. Edit `.env`:

```env
TRELLO_API_KEY=your_trello_api_key
TRELLO_TOKEN=your_trello_token
```

## 4. Verify API connection

```bash
npm run test-api
```

Expected output:

- Your Trello username
- Assigned cards count
- Open boards list
- **Full extraction test** — description, comments, attachments, checklists, activity, list, and board for a sample card

## 5. Register MCP in Cursor

### Project-local (open this repo as workspace)

`.cursor/mcp.json` is preconfigured with a relative path to `trello-mcp-server/bin/start-mcp.sh`. No edits needed.

### Global (Trello in every project — recommended)

```bash
./bin/sync-global-cursor.sh
```

This updates `~/.cursor/mcp.json` with:

- Absolute path to `trello-mcp-server/bin/start-mcp.sh`
- `cwd` set to this repo (so `.env` credentials load correctly)
- Latest workflow skill copied to `~/.cursor/skills/trello-dev-loop/`

Re-run after every `git pull` that changes the MCP server or skill.

Manual `~/.cursor/mcp.json` entry:

```json
{
  "mcpServers": {
    "trello": {
      "command": "bash",
      "args": ["/absolute/path/to/trello-dev-loop/trello-mcp-server/bin/start-mcp.sh"],
      "cwd": "/absolute/path/to/trello-dev-loop",
      "env": {}
    }
  }
}
```

Keep `.env` in the **repo root** — the MCP server loads credentials from there.

## 6. Optional list shortcuts

In Cursor chat, ask the agent to run `get_board_lists` for your board, then add to `.env`:

```env
TRELLO_BOARD_ID=...
TRELLO_LIST_IN_PROGRESS=...
TRELLO_LIST_REVIEW=...
TRELLO_LIST_DONE=...
```

Enables `mark in progress` and `mark done` shortcuts.

## 7. Verify in Cursor

1. Cursor Settings → **MCP** → `trello` should show connected (green)
2. If you just updated the server or ran `sync-global-cursor.sh`, click **Refresh** on `trello`
3. In chat: `analyze my assigned tasks`
4. For a single ticket: `analyze ticket <cardId>` — agent receives **full card extraction** (description, all comments, attachments, checklists, custom fields, activity, list/board context)

## Use in another codebase

1. Run `./bin/sync-global-cursor.sh` (step 5)
2. Copy [cursor-rules](../cursor-rules/) into your app's `.cursor/` — see [cursor-rules/README.md](../cursor-rules/README.md)
3. Open your app repo in Cursor
4. Run the same workflow commands against your Trello cards

Your app code lives in your repo; Trello MCP + `.env` live in this toolkit repo.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| MCP shows red / disconnected | Settings → MCP → Refresh `trello`; check `npm run test-api` |
| `get_card` returns slim data | MCP process is stale — Refresh in Cursor Settings |
| Missing credentials error | Ensure `.env` exists in repo root and `cwd` in global mcp.json points here |
| Hooks not firing | Copy `cursor-rules/hooks/` into your workspace `.cursor/` |
