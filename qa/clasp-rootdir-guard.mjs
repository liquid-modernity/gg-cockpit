import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const claspPath = path.join(root, '.clasp.json');
const appsScriptDir = path.join(root, 'apps-script');
const requiredFiles = [
  'appsscript.json',
  'Code.js',
  'config.js',
  'bootstrap.js',
  'registry.js',
  'sync.js',
  'discord.js'
];

const violations = [];

if (!fs.existsSync(claspPath)) {
  violations.push('.clasp.json is missing.');
} else {
  const config = JSON.parse(fs.readFileSync(claspPath, 'utf8'));
  if (config.rootDir !== 'apps-script') {
    violations.push('.clasp.json rootDir must be exactly "apps-script".');
  }
}

if (!fs.existsSync(appsScriptDir)) {
  violations.push('apps-script directory is missing.');
} else {
  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(appsScriptDir, file))) {
      violations.push(`apps-script/${file} is missing.`);
    }
  }

  for (const file of fs.readdirSync(appsScriptDir)) {
    if (file.endsWith('.gs')) {
      violations.push(`apps-script/${file} must be removed; Apps Script source uses .js only.`);
    }
  }
}

if (violations.length) {
  console.error('CLASP ROOTDIR GUARD VIOLATIONS:');
  for (const violation of violations) console.error('- ' + violation);
  process.exit(1);
}

console.log('clasp-rootdir-guard passed.');
