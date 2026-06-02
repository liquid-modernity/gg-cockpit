import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const workerSrcDir = path.join(root, 'workers/src');
const wranglerPath = path.join(root, 'workers/wrangler.toml');
const violations = [];

walk(workerSrcDir, (file) => {
  if (!file.endsWith('.js')) return;
  const relative = path.relative(root, file);
  const text = fs.readFileSync(file, 'utf8');

  if (/https:\/\/script\.google\.com/i.test(text)) {
    violations.push(`${relative} hardcodes an Apps Script deployment URL.`);
  }

  for (const match of text.matchAll(/APPS_SCRIPT_DEPLOYMENT_URL/g)) {
    if (!isEnvReference(text, match.index, 'APPS_SCRIPT_DEPLOYMENT_URL')) {
      violations.push(`${relative} references APPS_SCRIPT_DEPLOYMENT_URL outside env.`);
    }
  }

  for (const match of text.matchAll(/APPS_SCRIPT_READ_TOKEN/g)) {
    if (!isEnvReference(text, match.index, 'APPS_SCRIPT_READ_TOKEN')) {
      violations.push(`${relative} references APPS_SCRIPT_READ_TOKEN outside env.`);
    }
  }
});

if (fs.existsSync(wranglerPath)) {
  const text = fs.readFileSync(wranglerPath, 'utf8');
  if (/https:\/\/script\.google\.com/i.test(text)) {
    violations.push('workers/wrangler.toml hardcodes an Apps Script deployment URL.');
  }
  if (/^\s*APPS_SCRIPT_(DEPLOYMENT_URL|READ_TOKEN)\s*=/m.test(text)) {
    violations.push('workers/wrangler.toml must not store Apps Script runtime secrets.');
  }
}

if (violations.length) {
  console.error('WORKER SECRET GUARD VIOLATIONS:');
  for (const violation of violations) console.error('- ' + violation);
  process.exit(1);
}

console.log('worker-secret-guard passed.');

function isEnvReference(text, index, name) {
  const before = text.slice(Math.max(0, index - 4), index);
  const after = text.slice(index, index + name.length);
  return before === 'env.' && after === name;
}

function walk(dir, cb) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, cb);
    else cb(full);
  }
}
