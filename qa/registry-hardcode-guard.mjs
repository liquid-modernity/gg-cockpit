import fs from 'node:fs';
import path from 'node:path';

const srcDirs = ['src/js', 'workers/src'];
const forbiddenStatus = [
  'DRAFT_IN_PROGRESS',
  'READY_FOR_TRANSLATION',
  'READY_FOR_LAYOUT',
  'ACCORD',
  'REVISION_REQUIRED',
  'FREELANCE_DRAFT'
];

const violations = [];

for (const dir of srcDirs) {
  walk(path.join(process.cwd(), dir), (file) => {
    if (!file.endsWith('.js')) return;
    const text = fs.readFileSync(file, 'utf8');

    for (const status of forbiddenStatus) {
      if (text.includes(status)) {
        violations.push(`${path.relative(process.cwd(), file)} hardcodes workflow status ${status}`);
      }
    }
  });
}

if (violations.length) {
  console.error('REGISTRY HARDCODE VIOLATIONS:');
  for (const v of violations) console.error('- ' + v);
  process.exit(1);
}

console.log('registry-hardcode-guard passed.');

function walk(dir, cb) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, cb);
    else cb(full);
  }
}
