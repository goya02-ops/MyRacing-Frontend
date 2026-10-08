import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Caracterización del gate de CI (FE-3, issue #4): el CI debe correr tests
// reales (`pnpm test` y `pnpm test:e2e`, sin `--if-present`) y los scripts
// `test` / `test:e2e` deben ejecutar vitest / playwright reales (no `echo`).
// Se aserta sobre los fuentes porque son config de CI/build, no testeables
// importando el módulo (espejo del `ci-gate` del backend, ver BE-3).
// Nota: se resuelve por `process.cwd()` (raíz del repo) en vez de
// `new URL(..., import.meta.url)` porque el entorno happy-dom no expone
// `import.meta.url` con esquema `file:` y `readFileSync` lo exige.
const ciYml = readFileSync(
  join(process.cwd(), '.github/workflows/ci.yml'),
  'utf-8',
);
const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf-8'),
) as { scripts?: Record<string, string> };

describe('CI gate (FE-3)', () => {
  it('ci.yml corre `pnpm test` sin `--if-present`', () => {
    expect(ciYml).toMatch(/run:\s*pnpm test\s*$/m);
    expect(ciYml).not.toContain('--if-present');
  });

  it('ci.yml corre `pnpm test:e2e` sin `--if-present`', () => {
    expect(ciYml).toMatch(/run:\s*pnpm test:e2e\s*$/m);
    expect(ciYml).not.toContain('--if-present');
  });

  it('el script `test` ejecuta vitest real, no un placeholder `echo`', () => {
    expect(packageJson.scripts?.test ?? '').toContain('vitest');
    expect(packageJson.scripts?.test ?? '').not.toContain('echo');
  });

  it('el script `test:e2e` ejecuta playwright real, no un placeholder `echo`', () => {
    expect(packageJson.scripts?.['test:e2e'] ?? '').toContain('playwright');
    expect(packageJson.scripts?.['test:e2e'] ?? '').not.toContain('echo');
  });
});
