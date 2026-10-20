# Trello MCP Server

Core engine for **MCP Dev Loop**. Exposes Trello as MCP tools for Cursor.

## API surface

Client methods in `lib/trelloClient.js`:

| Method | MCP tool |
|--------|----------|
| `getMyCards()` | `get_my_cards` |
| `getCardFull(cardId)` | `get_card` |
| `getCardComments(cardId)` | `get_card_comments` |
| `addComment(cardId, text)` | `add_comment` |
| `updateCard(cardId, data)` | `update_card` |
| `moveCard(cardId, listId)` | `move_card` |
| `attachUrl(cardId, url)` | `attach_commit` |

Plus board helpers: `get_boards`, `get_board_lists`, `get_board_cards`, `mark_in_progress`, `mark_done`.

### `getCardFull` pulls everything

One request fetches the card, then in parallel: all comments (up to 1000), attachments, activity, list, board, and custom field definitions. Returned shape includes description, checklists, labels, members, stickers, dates, badges, and full comment/attachment history.

## Run locally

From repo root (`.env` must exist at repo root):

```bash
npm run install:mcp
npm run test-api
```

`test-api` runs a full extraction smoke test on a board card.

## Cursor registration

**Recommended** — from repo root:

```bash
./bin/sync-global-cursor.sh
```

Manual `~/.cursor/mcp.json`:

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

`cwd` must point to the repo root so `lib/env.js` finds `.env`.

## Environment

Loaded from **repo root** `.env`:

- `TRELLO_API_KEY` (required)
- `TRELLO_TOKEN` (required)
- `TRELLO_BOARD_ID` (optional)
- `TRELLO_LIST_IN_PROGRESS` (optional)
- `TRELLO_LIST_REVIEW` (optional)
- `TRELLO_LIST_DONE` (optional)

## Dependencies

- `@modelcontextprotocol/sdk` ^1.29.0
- `zod` ^3.25.0
- Node.js >= 18
