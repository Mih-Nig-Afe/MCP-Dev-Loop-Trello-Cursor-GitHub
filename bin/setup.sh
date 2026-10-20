#!/usr/bin/env bash
# ==============================================================================
# Trello Dev Loop — Universal Multi-Agent Quick Setup
# Supports: Cursor, Claude Code, Claude Desktop, Windsurf, VS Code Copilot
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "=========================================================="
echo "  🚀 Trello Dev Loop — Multi-Agent MCP Setup"
echo "=========================================================="
echo ""

# 1. Verify Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Error: Node.js (version 18+) is required but not found."
  echo "Please install Node.js from https://nodejs.org and re-run."
  exit 1
fi

NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo "⚠️  Warning: Node.js version 18+ is recommended (found $(node -v))."
fi

# 2. Check standalone bundle
BUNDLE_PATH="$ROOT_DIR/dist/trello-mcp.cjs"
if [ ! -f "$BUNDLE_PATH" ]; then
  if [ -f "$ROOT_DIR/trello-mcp-server/dist/trello-mcp.cjs" ]; then
    BUNDLE_PATH="$ROOT_DIR/trello-mcp-server/dist/trello-mcp.cjs"
  else
    echo "→ Standalone bundle not found. Building now..."
    if [ -d "$ROOT_DIR/trello-mcp-server" ]; then
      npm run build --prefix trello-mcp-server
      BUNDLE_PATH="$ROOT_DIR/trello-mcp-server/dist/trello-mcp.cjs"
    fi
  fi
fi

# 3. Setup .env credentials
ENV_FILE="$ROOT_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "🔑 Setting up Trello API credentials..."
  echo "   (Get your Key & Token at: https://trello.com/power-ups/admin)"
  echo ""
  
  read -r -p "Enter your Trello API Key: " INPUT_API_KEY
  read -r -p "Enter your Trello Token: " INPUT_TOKEN
  read -r -p "Enter default Board ID (optional, press Enter to skip): " INPUT_BOARD_ID

  cat > "$ENV_FILE" <<EOF
TRELLO_API_KEY=${INPUT_API_KEY}
TRELLO_TOKEN=${INPUT_TOKEN}
TRELLO_BOARD_ID=${INPUT_BOARD_ID}
EOF
  echo "✅ Created .env with your credentials."
else
  echo "✅ Found existing .env file."
fi

# 4. Optional: Agent Configuration Helper
echo ""
echo "Select your primary AI Coding Agent to configure:"
echo "  1) Cursor (local .cursor/mcp.json)"
echo "  2) Cursor (global ~/.cursor/mcp.json)"
echo "  3) Claude Desktop"
echo "  4) Windsurf"
echo "  5) VS Code / GitHub Copilot"
echo "  6) Print config snippets for all agents"
echo "  7) Done (Skip agent config)"
echo ""
read -r -p "Enter choice [1-7] (default 1): " AGENT_CHOICE
AGENT_CHOICE=${AGENT_CHOICE:-1}

case "$AGENT_CHOICE" in
  1)
    mkdir -p "$ROOT_DIR/.cursor"
    cat > "$ROOT_DIR/.cursor/mcp.json" <<EOF
{
  "mcpServers": {
    "trello": {
      "command": "node",
      "args": ["${BUNDLE_PATH}"],
      "cwd": "${ROOT_DIR}",
      "env": {}
    }
  }
}
EOF
    echo "✅ Configured .cursor/mcp.json"
    ;;
  2)
    GLOBAL_CURSOR_DIR="$HOME/.cursor"
    mkdir -p "$GLOBAL_CURSOR_DIR"
    node -e "
const fs = require('fs');
const p = process.argv[1];
const bundle = process.argv[2];
const root = process.argv[3];
let cfg = { mcpServers: {} };
if (fs.existsSync(p)) {
  try { cfg = JSON.parse(fs.readFileSync(p, 'utf8')); } catch {}
}
cfg.mcpServers = cfg.mcpServers || {};
cfg.mcpServers.trello = {
  command: 'node',
  args: [bundle],
  cwd: root,
  env: {}
};
fs.writeFileSync(p, JSON.stringify(cfg, null, 2) + '\n');
" "$GLOBAL_CURSOR_DIR/mcp.json" "$BUNDLE_PATH" "$ROOT_DIR"
    echo "✅ Configured ~/.cursor/mcp.json"
    ;;
  3)
    if [[ "$OSTYPE" == "darwin"* ]]; then
      CLAUDE_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
    else
      CLAUDE_PATH="$HOME/.config/Claude/claude_desktop_config.json"
    fi
    mkdir -p "$(dirname "$CLAUDE_PATH")"
    node -e "
const fs = require('fs');
const p = process.argv[1];
const bundle = process.argv[2];
let cfg = { mcpServers: {} };
if (fs.existsSync(p)) {
  try { cfg = JSON.parse(fs.readFileSync(p, 'utf8')); } catch {}
}
cfg.mcpServers = cfg.mcpServers || {};
cfg.mcpServers.trello = {
  command: 'node',
  args: [bundle]
};
fs.writeFileSync(p, JSON.stringify(cfg, null, 2) + '\n');
" "$CLAUDE_PATH" "$BUNDLE_PATH"
    echo "✅ Configured Claude Desktop config at: $CLAUDE_PATH"
    ;;
  4)
    WINDSURF_PATH="$HOME/.codeium/windsurf/mcp_config.json"
    mkdir -p "$(dirname "$WINDSURF_PATH")"
    node -e "
const fs = require('fs');
const p = process.argv[1];
const bundle = process.argv[2];
let cfg = { mcpServers: {} };
if (fs.existsSync(p)) {
  try { cfg = JSON.parse(fs.readFileSync(p, 'utf8')); } catch {}
}
cfg.mcpServers = cfg.mcpServers || {};
cfg.mcpServers.trello = {
  command: 'node',
  args: [bundle]
};
fs.writeFileSync(p, JSON.stringify(cfg, null, 2) + '\n');
" "$WINDSURF_PATH" "$BUNDLE_PATH"
    echo "✅ Configured Windsurf config at: $WINDSURF_PATH"
    ;;
  5)
    mkdir -p "$ROOT_DIR/.vscode"
    cat > "$ROOT_DIR/.vscode/mcp.json" <<EOF
{
  "servers": {
    "trello": {
      "type": "stdio",
      "command": "node",
      "args": ["${BUNDLE_PATH}"]
    }
  }
}
EOF
    echo "✅ Configured .vscode/mcp.json"
    ;;
  6)
    echo ""
    echo "--- Config Snippet for Claude Desktop / Windsurf / Cursor ---"
    echo '{'
    echo '  "mcpServers": {'
    echo '    "trello": {'
    echo '      "command": "node",'
    echo "      \"args\": [\"${BUNDLE_PATH}\"]"
    echo '    }'
    echo '  }'
    echo '}'
    echo ""
    echo "--- Claude Code CLI Command ---"
    echo "claude mcp add trello node \"${BUNDLE_PATH}\""
    ;;
  *)
    echo "Done."
    ;;
esac

echo ""
echo "=========================================================="
echo "  🎉 Setup Complete!"
echo "  Start your agent and try: 'analyze my assigned tasks'"
echo "=========================================================="
