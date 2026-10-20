#!/usr/bin/env node
/**
 * Agensi.io Packaging Script for Trello Dev Loop
 * 
 * Verifies and builds the standalone release ZIP matching Agensi.io requirements:
 * - SKILL.md at root with valid YAML frontmatter (name, description)
 * - Standalone compiled MCP binary (<50 MB)
 * - Cross-agent configuration templates (Cursor, Claude Code, Windsurf, Copilot, Antigravity)
 * - 1-click interactive setup scripts
 */

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, cpSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const STAGE = resolve(ROOT, "build", "agensi-stage");
const DIST = resolve(ROOT, "dist");
const OUTPUT_ZIP = resolve(DIST, "mcp-dev-loop-agensi.zip");

console.log("==================================================");
console.log("📦 Packaging Trello Dev Loop for Agensi.io");
console.log("==================================================");

// 1. Build MCP server bundle
console.log("→ 1. Building standalone MCP server bundle...");
execSync("npm run build --prefix trello-mcp-server", { cwd: ROOT, stdio: "inherit" });

const bundleSource = resolve(ROOT, "trello-mcp-server", "dist", "trello-mcp.cjs");
if (!existsSync(bundleSource)) {
  console.error("❌ Error: Compiled bundle not found at:", bundleSource);
  process.exit(1);
}

// 2. Validate root SKILL.md
console.log("→ 2. Validating SKILL.md frontmatter...");
const skillPath = resolve(ROOT, "SKILL.md");
if (!existsSync(skillPath)) {
  console.error("❌ Error: Root SKILL.md is missing!");
  process.exit(1);
}

const skillContent = readFileSync(skillPath, "utf8");
if (!skillContent.startsWith("---")) {
  console.error("❌ Error: SKILL.md missing opening YAML frontmatter '---'");
  process.exit(1);
}
if (!/name:\s*[a-zA-Z0-9_-]+/.test(skillContent)) {
  console.error("❌ Error: SKILL.md missing 'name:' in frontmatter");
  process.exit(1);
}
if (!/description:\s*.+/.test(skillContent)) {
  console.error("❌ Error: SKILL.md missing 'description:' in frontmatter");
  process.exit(1);
}
console.log("   ✓ Frontmatter valid (name & description detected)");

// 3. Prepare staging directory
console.log("→ 3. Assembling release files in staging directory...");
if (existsSync(STAGE)) {
  rmSync(STAGE, { recursive: true, force: true });
}
mkdirSync(STAGE, { recursive: true });
mkdirSync(DIST, { recursive: true });

// Copy root SKILL.md to root of stage
cpSync(skillPath, resolve(STAGE, "SKILL.md"));

// Copy compiled binary
mkdirSync(resolve(STAGE, "dist"), { recursive: true });
cpSync(bundleSource, resolve(STAGE, "dist", "trello-mcp.cjs"));
// Also copy into root dist folder for local usage
cpSync(bundleSource, resolve(DIST, "trello-mcp.cjs"));

// Copy configs
if (existsSync(resolve(ROOT, "configs"))) {
  cpSync(resolve(ROOT, "configs"), resolve(STAGE, "configs"), { recursive: true });
}

// Copy setup scripts
mkdirSync(resolve(STAGE, "bin"), { recursive: true });
if (existsSync(resolve(ROOT, "bin", "setup.sh"))) {
  cpSync(resolve(ROOT, "bin", "setup.sh"), resolve(STAGE, "bin", "setup.sh"));
}
if (existsSync(resolve(ROOT, "bin", "setup.ps1"))) {
  cpSync(resolve(ROOT, "bin", "setup.ps1"), resolve(STAGE, "bin", "setup.ps1"));
}

// Copy license files
if (existsSync(resolve(ROOT, "LICENSE-COMMERCIAL.md"))) {
  cpSync(resolve(ROOT, "LICENSE-COMMERCIAL.md"), resolve(STAGE, "LICENSE-COMMERCIAL.md"));
}
if (existsSync(resolve(ROOT, "LICENSE"))) {
  cpSync(resolve(ROOT, "LICENSE"), resolve(STAGE, "LICENSE"));
}

// Create buyer README.md inside the bundle
const buyerReadme = `# Trello Dev Loop — Skill Package

Thank you for purchasing **Trello Dev Loop** on Agensi.io!

## Quick Setup (1 Minute)

### macOS / Linux:
\`\`\`bash
./bin/setup.sh
\`\`\`

### Windows (PowerShell):
\`\`\`powershell
.\\bin\\setup.ps1
\`\`\`

The setup script will prompt for your Trello API credentials and automatically configure your primary agent (Cursor, Claude Desktop, Claude Code, Windsurf, or VS Code Copilot).

## Manual Configuration

If you prefer manual setup, inspect the \`configs/\` directory for your agent:
- **Cursor**: \`configs/cursor/mcp.json\`
- **Claude Desktop**: \`configs/claude-desktop/claude_desktop_config.json\`
- **Claude Code**: \`claude mcp add trello node "\${PWD}/dist/trello-mcp.cjs"\`
- **Windsurf**: \`configs/windsurf/mcp_config.json\`
- **VS Code Copilot**: \`configs/vscode-copilot/mcp.json\`

## First Commands in Agent Chat

\`\`\`
analyze my assigned tasks
analyze ticket <ticket-id>
implement ticket <ticket-id>
create pr for ticket <ticket-id>
mark done
\`\`\`

Read \`SKILL.md\` for the full command reference and safety guidelines.
`;
writeFileSync(resolve(STAGE, "README.md"), buyerReadme, "utf8");

// 4. Create ZIP archive
console.log("→ 4. Creating ZIP archive...");
if (existsSync(OUTPUT_ZIP)) {
  rmSync(OUTPUT_ZIP, { force: true });
}

try {
  execSync(`cd "${STAGE}" && zip -r "${OUTPUT_ZIP}" . -x ".*"`, { stdio: "inherit" });
} catch (err) {
  console.log("zip command failed, falling back to powershell compress if on Windows...");
  execSync(`powershell Compress-Archive -Path "${STAGE}\\*" -DestinationPath "${OUTPUT_ZIP}"`, { stdio: "inherit" });
}

// 5. Verify ZIP size and integrity
console.log("→ 5. Verifying package size and integrity...");
const stats = statSync(OUTPUT_ZIP);
const sizeMB = stats.size / (1024 * 1024);
const sizeKB = stats.size / 1024;

console.log(`   ✓ Archive created: ${OUTPUT_ZIP}`);
console.log(`   ✓ File size: ${sizeKB.toFixed(1)} KB (${sizeMB.toFixed(3)} MB)`);

if (sizeMB > 50) {
  console.error(`❌ Error: Archive exceeds Agensi 50MB limit (${sizeMB.toFixed(2)} MB)!`);
  process.exit(1);
}

console.log("==================================================");
console.log("🎉 SUCCESS: Agensi release package is ready!");
console.log(`   Upload at: https://www.agensi.io/sell`);
console.log(`   File: ${OUTPUT_ZIP}`);
console.log("==================================================");
