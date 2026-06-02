import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const jsDir = path.join(root, 'src', 'js');

const violations = [];

walk(jsDir, (file) => {
  if (!file.endsWith('.js')) return;
  const text = fs.readFileSync(file, 'utf8');

  if (/\.innerHTML\s*=/.test(text) && !file.includes('template')) {
    violations.push(`${file}: innerHTML assignment outside approved template module.`);
  }

  if (/document\.createElement\(/.test(text) && !file.includes('template')) {
    violations.push(`${file}: createElement outside approved template module.`);
  }
});

if (violations.length) {
  console.error('FRONTEND CONTRACT VIOLATIONS:');
  for (const v of violations) console.error('- ' + v);
  process.exit(1);
}

console.log('frontend-contract-guard passed.');

function walk(dir, cb) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, cb);
    else cb(full);
  }
}
