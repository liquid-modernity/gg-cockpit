import fs from 'node:fs';
import path from 'node:path';

const requiredDocs = [
  'AGENTS.md',
  'docs/ARCHITECTURE.md',
  'docs/SOURCE_OF_TRUTH.md',
  'docs/FRONTEND_CONTRACT.md',
  'docs/NAMING_CONVENTIONS.md',
  'docs/SHEET_CONTRACT.md',
  'docs/PRD.md',
  'docs/REQUIREMENTS_TRACEABILITY_MATRIX.md',
  'docs/ACCEPTANCE_CRITERIA.md',
  'docs/CODEX_HANDOFF.md',
  'docs/COCKPIT_PHILOSOPHY.md',
  'docs/PRODUCTION_READINESS_CHECKLIST.md',
  'docs/SECURITY_MODEL.md',
  'docs/DEPLOYMENT_RUNBOOK.md',
  'docs/BACKUP_RECOVERY.md',
  'docs/OBSERVABILITY.md',
  'docs/GOOGLE_QUOTA_STRATEGY.md',
  'docs/INCIDENT_RESPONSE.md',
  'docs/MIGRATION_FROM_V081.md'
];

const missing = requiredDocs.filter((file) => !fs.existsSync(path.join(process.cwd(), file)));

if (missing.length) {
  console.error('Missing required architecture docs:');
  for (const file of missing) console.error('- ' + file);
  process.exit(1);
}

console.log('architecture-guard passed.');
