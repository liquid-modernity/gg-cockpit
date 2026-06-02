import fs from 'node:fs';
import path from 'node:path';

const violations = [];
const forbiddenClaims = [
  /dashboard\s+is\s+the\s+source\s+of\s+truth/i,
  /discord\s+is\s+the\s+source\s+of\s+truth/i,
  /html\s+export\s+is\s+the\s+source\s+of\s+truth/i
];

walk(process.cwd(), (file) => {
  const relative = path.relative(process.cwd(), file);
  if (relative.includes('node_modules') || relative.includes('.git')) return;
  if (!/\.(md|js|html|json|css|gs|yml|yaml)$/.test(file)) return;

  const text = fs.readFileSync(file, 'utf8');
  for (const pattern of forbiddenClaims) {
    if (pattern.test(text)) violations.push(relative);
  }
});

if (violations.length) {
  console.error('SOURCE OF TRUTH VIOLATIONS:');
  for (const v of [...new Set(violations)]) console.error('- ' + v);
  process.exit(1);
}

console.log('source-of-truth-guard passed.');

function walk(dir, cb) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, cb);
    else cb(full);
  }
}
