import fs from 'node:fs';
import path from 'node:path';

const forbiddenNamePatterns = [
  /\bfinal\b/i,
  /\bfix\d*\b/i,
  /\boverride\b/i,
  /\btemp\b/i,
  /\btemporary\b/i,
  /\bbackup\b/i,
  /new[-_]?dashboard/i
];

const allowlistPatterns = [
  /\.template\.(js|mjs|ts|html)$/i
];

const violations = [];

walk(process.cwd(), (file) => {
  const relative = path.relative(process.cwd(), file);

  if (relative.includes('node_modules')) return;
  if (relative.includes('.git')) return;

  const baseName = path.basename(file);

  if (allowlistPatterns.some((pattern) => pattern.test(baseName))) {
    return;
  }

  for (const pattern of forbiddenNamePatterns) {
    if (pattern.test(baseName)) {
      violations.push(relative);
    }
  }
});

if (violations.length) {
  console.error('NAMING VIOLATIONS:');
  for (const v of violations) console.error('- ' + v);
  process.exit(1);
}

console.log('naming-guard passed.');

function walk(dir, cb) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, cb);
    else cb(full);
  }
}
