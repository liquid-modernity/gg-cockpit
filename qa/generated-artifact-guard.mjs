import fs from 'node:fs';
import path from 'node:path';

const forbiddenDirs = [
  'dist/final',
  'dist/backup',
  'generated/final',
  'generated/backup'
];

const violations = forbiddenDirs.filter((dir) => fs.existsSync(path.join(process.cwd(), dir)));

if (violations.length) {
  console.error('GENERATED ARTIFACT VIOLATIONS:');
  for (const v of violations) console.error('- ' + v);
  process.exit(1);
}

console.log('generated-artifact-guard passed.');
