import fs from 'node:fs';
import path from 'node:path';

const allowedPrefixes = [
  'gg-',
  'project-',
  'cockpit-',
  'landing-',
  'store-'
];

const violations = [];

walk(path.join(process.cwd(), 'src', 'styles'), (file) => {
  if (!file.endsWith('.css')) return;
  const text = fs.readFileSync(file, 'utf8');
  const classMatches = text.matchAll(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g);

  for (const match of classMatches) {
    const className = match[1];

    // Ignore pseudo-ish accidental matches and known external/native fragments.
    if (className.startsWith('is-')) continue;

    const ok = allowedPrefixes.some((prefix) => className.startsWith(prefix));
    if (!ok) {
      violations.push(`${path.relative(process.cwd(), file)} uses non-namespaced class .${className}`);
    }
  }
});

if (violations.length) {
  console.error('CSS NAMESPACE VIOLATIONS:');
  for (const v of violations) console.error('- ' + v);
  process.exit(1);
}

console.log('css-namespace-guard passed.');

function walk(dir, cb) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, cb);
    else cb(full);
  }
}
