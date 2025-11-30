#!/usr/bin/env tsx
/**
 * Build Examples Script
 * 
 * This script builds custom index.html files for different example configurations.
 * It takes a directory from examples/, loads the default config, merges it with
 * example-specific overrides, and builds a standalone index.html file.
 * 
 * Usage:
 *   pnpm run build:examples <example-name>
 *   
 * Example:
 *   pnpm run build:examples one-column
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const EXAMPLES_DIR = path.join(ROOT_DIR, 'examples');
const DEFAULT_DIR = path.join(EXAMPLES_DIR, 'default');
const PUBLIC_CONFIG_DIR = path.join(ROOT_DIR, 'public', 'config');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

// Config file names to process
const CONFIG_FILES = [
  'attributes.json',
  'character-info.json',
  'combat-stats.json',
  'enums.json',
  'inventory.json',
  'layout.json',
  'level-class.json',
];

interface BuildOptions {
  exampleName: string;
  clean?: boolean;
}

/**
 * Read a JSON file and parse it
 */
async function readJsonFile(filePath: string): Promise<any> {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Write JSON to a file
 */
async function writeJsonFile(filePath: string, data: any): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Merge two configuration objects
 * For simple override: example config takes precedence over default
 */
function mergeConfigs(defaultConfig: any, overrideConfig: any): any {
  if (!overrideConfig) return defaultConfig;
  
  // Deep merge for objects
  if (typeof defaultConfig === 'object' && typeof overrideConfig === 'object' && !Array.isArray(defaultConfig)) {
    const result = { ...defaultConfig };
    for (const key in overrideConfig) {
      result[key] = mergeConfigs(defaultConfig[key], overrideConfig[key]);
    }
    return result;
  }
  
  // Override takes precedence
  return overrideConfig;
}

/**
 * Backup current public/config directory
 */
async function backupConfig(): Promise<string> {
  const backupDir = path.join(ROOT_DIR, '.config-backup');
  
  // Remove old backup if exists
  if (await fileExists(backupDir)) {
    await fs.rm(backupDir, { recursive: true, force: true });
  }
  
  // Copy current config to backup
  await fs.cp(PUBLIC_CONFIG_DIR, backupDir, { recursive: true });
  console.log('✓ Backed up current config to .config-backup');
  
  return backupDir;
}

/**
 * Restore config from backup
 */
async function restoreConfig(backupDir: string): Promise<void> {
  // Remove current config
  await fs.rm(PUBLIC_CONFIG_DIR, { recursive: true, force: true });
  
  // Restore from backup
  await fs.cp(backupDir, PUBLIC_CONFIG_DIR, { recursive: true });
  
  // Clean up backup
  await fs.rm(backupDir, { recursive: true, force: true });
  
  console.log('✓ Restored config from backup');
}

/**
 * Load and merge configs for an example
 */
async function prepareConfig(exampleName: string): Promise<void> {
  const exampleDir = path.join(EXAMPLES_DIR, exampleName);
  
  // Verify example directory exists
  if (!await fileExists(exampleDir)) {
    throw new Error(`Example directory not found: ${exampleDir}`);
  }
  
  console.log(`\nProcessing example: ${exampleName}`);
  console.log('─'.repeat(60));
  
  // Process each config file
  for (const configFile of CONFIG_FILES) {
    const defaultPath = path.join(DEFAULT_DIR, configFile);
    const examplePath = path.join(exampleDir, configFile);
    const outputPath = path.join(PUBLIC_CONFIG_DIR, configFile);
    
    // Load default config
    let defaultConfig = null;
    if (await fileExists(defaultPath)) {
      defaultConfig = await readJsonFile(defaultPath);
    }
    
    // Load example override if exists
    let finalConfig = defaultConfig;
    if (await fileExists(examplePath)) {
      const exampleConfig = await readJsonFile(examplePath);
      finalConfig = mergeConfigs(defaultConfig, exampleConfig);
      console.log(`  ✓ ${configFile} (merged with override)`);
    } else {
      console.log(`  ✓ ${configFile} (using default)`);
    }
    
    // Write merged config
    if (finalConfig) {
      await writeJsonFile(outputPath, finalConfig);
    }
  }
  
  console.log('─'.repeat(60));
}

/**
 * Build the Vite project
 */
async function buildVite(): Promise<void> {
  console.log('\nBuilding with Vite...');
  console.log('─'.repeat(60));
  
  try {
    const { stdout, stderr } = await execAsync('pnpm run build', {
      cwd: ROOT_DIR,
    });
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    console.log('─'.repeat(60));
    console.log('✓ Build completed successfully');
  } catch (error: any) {
    console.error('Build failed:', error.message);
    throw error;
  }
}

/**
 * Move built index.html to example directory
 */
async function moveIndexHtml(exampleName: string): Promise<void> {
  const sourceFile = path.join(DIST_DIR, 'index.html');
  const exampleDir = path.join(EXAMPLES_DIR, exampleName);
  const destFile = path.join(exampleDir, 'index.html');
  
  // Verify build output exists
  if (!await fileExists(sourceFile)) {
    throw new Error(`Build output not found: ${sourceFile}`);
  }
  
  // Copy to example directory
  await fs.copyFile(sourceFile, destFile);
  console.log(`\n✓ Moved index.html to examples/${exampleName}/index.html`);
}

/**
 * Main build function
 */
async function buildExample(options: BuildOptions): Promise<void> {
  const { exampleName, clean = true } = options;
  
  let backupDir: string | null = null;
  
  try {
    console.log('\n' + '='.repeat(60));
    console.log('Building Example Configuration');
    console.log('='.repeat(60));
    
    // Backup current config
    backupDir = await backupConfig();
    
    // Prepare merged config
    await prepareConfig(exampleName);
    
    // Build with Vite
    await buildVite();
    
    // Move built file to example directory
    await moveIndexHtml(exampleName);
    
    // Restore original config
    if (backupDir) {
      await restoreConfig(backupDir);
    }
    
    // Clean up dist directory if requested
    if (clean && await fileExists(DIST_DIR)) {
      await fs.rm(DIST_DIR, { recursive: true, force: true });
      console.log('✓ Cleaned up dist directory');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✨ Build completed successfully!');
    console.log('='.repeat(60));
    console.log(`\nYou can now open: examples/${exampleName}/index.html\n`);
    
  } catch (error: any) {
    console.error('\n❌ Build failed:', error.message);
    
    // Attempt to restore config on error
    if (backupDir) {
      try {
        await restoreConfig(backupDir);
      } catch (restoreError: any) {
        console.error('Failed to restore config:', restoreError.message);
      }
    }
    
    process.exit(1);
  }
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: pnpm run build:examples <example-name>');
    console.error('\nAvailable examples:');
    
    try {
      const examples = await fs.readdir(EXAMPLES_DIR);
      for (const example of examples) {
        const stat = await fs.stat(path.join(EXAMPLES_DIR, example));
        if (stat.isDirectory() && example !== 'default') {
          console.error(`  - ${example}`);
        }
      }
    } catch (error) {
      console.error('  (Unable to list examples)');
    }
    
    process.exit(1);
  }
  
  const exampleName = args[0];
  await buildExample({ exampleName });
}

// Run the script
main().catch(console.error);
