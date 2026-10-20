# ==============================================================================
# Trello Dev Loop — Universal Multi-Agent Quick Setup (PowerShell)
# Supports: Cursor, Claude Code, Claude Desktop, Windsurf, VS Code Copilot
# ==============================================================================

$RootDir = Split-Path -Parent $PSScriptRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  🚀 Trello Dev Loop — Multi-Agent MCP Setup (Windows)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verify Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Node.js (version 18+) is required but not found." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org and re-run."
    Exit 1
}

$BundlePath = Join-Path $RootDir "dist\trello-mcp.cjs"
if (-not (Test-Path $BundlePath)) {
    $ServerBundle = Join-Path $RootDir "trello-mcp-server\dist\trello-mcp.cjs"
    if (Test-Path $ServerBundle) {
        $BundlePath = $ServerBundle
    } else {
        Write-Host "→ Building standalone bundle..." -ForegroundColor Yellow
        Push-Location (Join-Path $RootDir "trello-mcp-server")
        npm run build
        Pop-Location
        $BundlePath = Join-Path $RootDir "trello-mcp-server\dist\trello-mcp.cjs"
    }
}

# 2. Setup .env credentials
$EnvFile = Join-Path $RootDir ".env"
if (-not (Test-Path $EnvFile)) {
    Write-Host "🔑 Setting up Trello API credentials..." -ForegroundColor Green
    Write-Host "   (Get your Key & Token at: https://trello.com/power-ups/admin)"
    Write-Host ""

    $ApiKey = Read-Host "Enter your Trello API Key"
    $Token = Read-Host "Enter your Trello Token"
    $BoardId = Read-Host "Enter default Board ID (optional, press Enter to skip)"

    @"
TRELLO_API_KEY=$ApiKey
TRELLO_TOKEN=$Token
TRELLO_BOARD_ID=$BoardId
"@ | Out-File -FilePath $EnvFile -Encoding utf8

    Write-Host "✅ Created .env with your credentials." -ForegroundColor Green
} else {
    Write-Host "✅ Found existing .env file." -ForegroundColor Green
}

Write-Host ""
Write-Host "Select your primary AI Coding Agent to configure:"
Write-Host "  1) Cursor (local .cursor\mcp.json)"
Write-Host "  2) Claude Desktop (Windows %APPDATA%)"
Write-Host "  3) VS Code / GitHub Copilot"
Write-Host "  4) Print config snippets"
Write-Host "  5) Done (Skip agent config)"

$Choice = Read-Host "Enter choice [1-5] (default 1)"
if (-not $Choice) { $Choice = "1" }

switch ($Choice) {
    "1" {
        $CursorDir = Join-Path $RootDir ".cursor"
        if (-not (Test-Path $CursorDir)) { New-Item -ItemType Directory -Path $CursorDir | Out-Null }
        $EscapedBundle = $BundlePath.Replace("\", "\\")
        $EscapedRoot = $RootDir.Replace("\", "\\")
        @"
{
  "mcpServers": {
    "trello": {
      "command": "node",
      "args": ["$EscapedBundle"],
      "cwd": "$EscapedRoot",
      "env": {}
    }
  }
}
"@ | Out-File -FilePath (Join-Path $CursorDir "mcp.json") -Encoding utf8
        Write-Host "✅ Configured .cursor\mcp.json" -ForegroundColor Green
    }
    "2" {
        $ClaudeConfig = Join-Path $env:APPDATA "Claude\claude_desktop_config.json"
        $ClaudeDir = Split-Path -Parent $ClaudeConfig
        if (-not (Test-Path $ClaudeDir)) { New-Item -ItemType Directory -Path $ClaudeDir | Out-Null }
        $EscapedBundle = $BundlePath.Replace("\", "\\")
        @"
{
  "mcpServers": {
    "trello": {
      "command": "node",
      "args": ["$EscapedBundle"]
    }
  }
}
"@ | Out-File -FilePath $ClaudeConfig -Encoding utf8
        Write-Host "✅ Configured Claude Desktop at $ClaudeConfig" -ForegroundColor Green
    }
    "3" {
        $VscodeDir = Join-Path $RootDir ".vscode"
        if (-not (Test-Path $VscodeDir)) { New-Item -ItemType Directory -Path $VscodeDir | Out-Null }
        $EscapedBundle = $BundlePath.Replace("\", "\\")
        @"
{
  "servers": {
    "trello": {
      "type": "stdio",
      "command": "node",
      "args": ["$EscapedBundle"]
    }
  }
}
"@ | Out-File -FilePath (Join-Path $VscodeDir "mcp.json") -Encoding utf8
        Write-Host "✅ Configured .vscode\mcp.json" -ForegroundColor Green
    }
    "4" {
        Write-Host ""
        Write-Host "Config snippet for MCP clients:"
        Write-Host "node $BundlePath"
    }
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  🎉 Setup Complete!" -ForegroundColor Cyan
Write-Host "  Start your agent and try: 'analyze my assigned tasks'" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
