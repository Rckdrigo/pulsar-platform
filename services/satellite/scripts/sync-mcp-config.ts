#!/usr/bin/env tsx

/**
 * MCP Configuration Sync Agent
 *
 * Keeps Claude Desktop and Claude Code MCP configurations synchronized.
 * This ensures both applications have the same server configuration.
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MCPServerConfig {
  command?: string;
  type?: string;
  args: string[];
  env: {
    DEBUG?: string;
    TRANSPORT_MODE?: string;
    PULSAR_SOCKET_URL?: string;
    PULSAR_API_KEY?: string;
    FILE_MANAGER_BASE_PATH?: string;
  };
}

interface MCPConfig {
  mcpServers: {
    [key: string]: MCPServerConfig;
  };
}

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message: string, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function getClaudeDesktopConfigPath(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
}

function getClaudeCodeConfigPath(): string {
  return path.join(__dirname, '..', '.mcp.json');
}

function getSatelliteServerPath(): string {
  return path.join(__dirname, '..', 'src', 'server.ts');
}

/**
 * Create the canonical MCP server configuration
 */
function createCanonicalConfig(serverPath: string): MCPConfig {
  return {
    mcpServers: {
      satellite: {
        command: 'npx',
        args: ['-y', 'tsx', serverPath],
        env: {
          DEBUG: 'mcp:*',
          TRANSPORT_MODE: 'stdio',
          PULSAR_SOCKET_URL: '${PULSAR_SOCKET_URL:-http://localhost:3000}',
          PULSAR_API_KEY: '${PULSAR_API_KEY:-dev-pulsar-interactive-key-2024}',
          FILE_MANAGER_BASE_PATH: '${FILE_MANAGER_BASE_PATH:-/Users/rckdrigo/Projects/pulsar-interactive}',
        },
      },
    },
  };
}

/**
 * Create Claude Desktop specific config (slightly different format)
 */
function createClaudeDesktopConfig(serverPath: string): MCPConfig {
  const config = createCanonicalConfig(serverPath);
  // Claude Desktop doesn't use the 'type' field
  return config;
}

/**
 * Create Claude Code specific config
 */
function createClaudeCodeConfig(serverPath: string): MCPConfig {
  const config = createCanonicalConfig(serverPath);
  // Claude Code uses 'type' field
  config.mcpServers.satellite.type = 'stdio';
  return config;
}

async function ensureDirectoryExists(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
    log(`✓ Created directory: ${dir}`, COLORS.green);
  }
}

async function readConfig(filePath: string): Promise<MCPConfig | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function writeConfig(filePath: string, config: MCPConfig): Promise<void> {
  await ensureDirectoryExists(filePath);
  await fs.writeFile(filePath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}

async function backupConfig(filePath: string): Promise<string | null> {
  try {
    await fs.access(filePath);
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const backupPath = `${filePath}.backup-${timestamp}`;
    await fs.copyFile(filePath, backupPath);
    return backupPath;
  } catch {
    return null;
  }
}

function configsAreEqual(config1: MCPConfig, config2: MCPConfig): boolean {
  // Compare without 'type' field since Claude Desktop doesn't use it
  const normalize = (config: MCPConfig) => {
    const normalized = JSON.parse(JSON.stringify(config));
    if (normalized.mcpServers?.satellite) {
      delete normalized.mcpServers.satellite.type;
    }
    return normalized;
  };

  return JSON.stringify(normalize(config1)) === JSON.stringify(normalize(config2));
}

async function syncConfigs(dryRun = false): Promise<void> {
  log('\n🛰️  Satellite MCP Configuration Sync Agent\n', COLORS.blue);

  const serverPath = getSatelliteServerPath();
  const desktopConfigPath = getClaudeDesktopConfigPath();
  const codeConfigPath = getClaudeCodeConfigPath();

  log(`Server Path: ${serverPath}`, COLORS.yellow);
  log(`Claude Desktop Config: ${desktopConfigPath}`, COLORS.yellow);
  log(`Claude Code Config: ${codeConfigPath}\n`, COLORS.yellow);

  // Read existing configs
  const existingDesktopConfig = await readConfig(desktopConfigPath);
  const existingCodeConfig = await readConfig(codeConfigPath);

  // Create canonical configs
  const desktopConfig = createClaudeDesktopConfig(serverPath);
  const codeConfig = createClaudeCodeConfig(serverPath);

  // Check if updates are needed
  const desktopNeedsUpdate = !existingDesktopConfig || !configsAreEqual(existingDesktopConfig, desktopConfig);
  const codeNeedsUpdate = !existingCodeConfig || !configsAreEqual(existingCodeConfig, codeConfig);

  if (!desktopNeedsUpdate && !codeNeedsUpdate) {
    log('✓ All configurations are already in sync!', COLORS.green);
    return;
  }

  if (dryRun) {
    log('🔍 DRY RUN MODE - No files will be modified\n', COLORS.yellow);
  }

  // Update Claude Desktop config
  if (desktopNeedsUpdate) {
    log('📝 Claude Desktop configuration needs update', COLORS.yellow);

    if (existingDesktopConfig) {
      log('   Current config exists - will create backup', COLORS.blue);
    } else {
      log('   No existing config - will create new', COLORS.blue);
    }

    if (!dryRun) {
      const backupPath = await backupConfig(desktopConfigPath);
      if (backupPath) {
        log(`   ✓ Backup created: ${backupPath}`, COLORS.green);
      }
      await writeConfig(desktopConfigPath, desktopConfig);
      log('   ✓ Updated Claude Desktop config', COLORS.green);
    }
  } else {
    log('✓ Claude Desktop config is up to date', COLORS.green);
  }

  // Update Claude Code config
  if (codeNeedsUpdate) {
    log('📝 Claude Code configuration needs update', COLORS.yellow);

    if (existingCodeConfig) {
      log('   Current config exists - will create backup', COLORS.blue);
    } else {
      log('   No existing config - will create new', COLORS.blue);
    }

    if (!dryRun) {
      const backupPath = await backupConfig(codeConfigPath);
      if (backupPath) {
        log(`   ✓ Backup created: ${backupPath}`, COLORS.green);
      }
      await writeConfig(codeConfigPath, codeConfig);
      log('   ✓ Updated Claude Code config', COLORS.green);
    }
  } else {
    log('✓ Claude Code config is up to date', COLORS.green);
  }

  if (dryRun) {
    log('\n⚠️  This was a dry run. Use --apply to make changes.', COLORS.yellow);
  } else {
    log('\n✅ Configuration sync complete!', COLORS.green);
    log('\n📌 Next steps:', COLORS.blue);
    log('   1. Restart Claude Desktop to pick up changes');
    log('   2. Run "claude mcp list" to verify Claude Code config');
  }
}

// CLI
const args = process.argv.slice(2);
const dryRun = !args.includes('--apply');

syncConfigs(dryRun).catch((error) => {
  log(`\n❌ Error: ${error.message}`, COLORS.red);
  process.exit(1);
});
