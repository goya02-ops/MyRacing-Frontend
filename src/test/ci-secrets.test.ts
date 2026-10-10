import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// FE-19 (issue #20, SonarCloud BLOCKER): el ci.yml no debe contener passwords
// MySQL hardcodeadas. GitHub rechaza `${{ secrets.* }}` dentro de
// `jobs.e2e.services` ("Unrecognized named-value: 'secrets'"), por lo que el
// contrato es: SIN bloque `services:` en el job E2E y MySQL levantado en un
// step con `docker run -d` (en steps los secrets sí funcionan).
// Alcance SOLO passwords MySQL: los `ci_*` (JWT/MercadoPago) son placeholders
// de test y no se tocan.
// Nota: se resuelve por `process.cwd()` (raíz del repo) en vez de
// `new URL(..., import.meta.url)` porque el entorno happy-dom no expone
// `import.meta.url` con esquema `file:` y `readFileSync` lo exige
// (mismo patrón que `ci-gate.test.ts` de FE-3).
const ciYml = readFileSync(
  join(process.cwd(), '.github/workflows/ci.yml'),
  'utf-8',
);

describe('CI secrets (FE-19)', () => {
  it('el job E2E no usa bloque `services:` (MySQL va en un step con docker run)', () => {
    expect(ciYml).not.toMatch(/services:\s*\n\s*mysql:/);
  });

  it('MySQL se levanta vía `docker run` usando los secrets MySQL', () => {
    expect(ciYml).toMatch(
      /docker run[\s\S]*\$\{\{\s*secrets\.MYSQL_ROOT_PASSWORD\s*\}\}/,
    );
    expect(ciYml).toMatch(
      /docker run[\s\S]*\$\{\{\s*secrets\.DB_PASSWORD\s*\}\}/,
    );
  });

  it('DB_PASSWORD se alimenta de GitHub Secrets en todas sus ocurrencias', () => {
    const dbPasswordLines = ciYml
      .split('\n')
      .filter((line) => line.includes('DB_PASSWORD:'));
    expect(dbPasswordLines.length).toBeGreaterThan(0);
    for (const line of dbPasswordLines) {
      expect(line).toMatch(/\$\{\{\s*secrets\.DB_PASSWORD\s*\}\}/);
    }
  });

  it('ci.yml no contiene la password MySQL hardcodeada', () => {
    expect(ciYml).not.toContain('MiR@cing_2025!');
  });

  it('ci.yml no contiene la password root hardcodeada', () => {
    expect(ciYml).not.toContain('root_password_segura');
  });
});
