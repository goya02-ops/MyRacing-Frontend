import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// FE-19 (issue #20, SonarCloud BLOCKER): el ci.yml no debe contener passwords
// MySQL hardcodeadas; las keys MYSQL_ROOT_PASSWORD / MYSQL_PASSWORD /
// DB_PASSWORD deben alimentarse de GitHub Secrets (`${{ secrets.… }}`).
// Alcance SOLO passwords MySQL: los `ci_*_for_tests` (JWT/MercadoPago) son
// placeholders de test y no se tocan.
// Nota: se resuelve por `process.cwd()` (raíz del repo) en vez de
// `new URL(..., import.meta.url)` porque el entorno happy-dom no expone
// `import.meta.url` con esquema `file:` y `readFileSync` lo exige
// (mismo patrón que `ci-gate.test.ts` de FE-3).
const ciYml = readFileSync(
  join(process.cwd(), '.github/workflows/ci.yml'),
  'utf-8',
);

describe('CI secrets (FE-19)', () => {
  it('ci.yml no contiene la password MySQL hardcodeada', () => {
    expect(ciYml).not.toContain('MiR@cing_2025!');
  });

  it('ci.yml no contiene la password root hardcodeada', () => {
    expect(ciYml).not.toContain('root_password_segura');
  });

  it('MYSQL_ROOT_PASSWORD se alimenta de GitHub Secrets', () => {
    expect(ciYml).toMatch(/MYSQL_ROOT_PASSWORD:\s*\$\{\{\s*secrets\.[A-Za-z0-9_]+\s*\}\}/);
  });

  it('MYSQL_PASSWORD se alimenta de GitHub Secrets', () => {
    expect(ciYml).toMatch(/MYSQL_PASSWORD:\s*\$\{\{\s*secrets\.[A-Za-z0-9_]+\s*\}\}/);
  });

  it('DB_PASSWORD se alimenta de GitHub Secrets en todas sus ocurrencias', () => {
    const dbPasswordLines = ciYml
      .split('\n')
      .filter((line) => line.includes('DB_PASSWORD:'));
    expect(dbPasswordLines.length).toBeGreaterThan(0);
    for (const line of dbPasswordLines) {
      expect(line).toMatch(/\$\{\{\s*secrets\.[A-Za-z0-9_]+\s*\}\}/);
    }
  });
});
