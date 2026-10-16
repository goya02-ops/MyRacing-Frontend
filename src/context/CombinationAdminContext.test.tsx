import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

import {
  CombinationAdminProvider,
  useCombinationAdminContext,
} from './CombinationAdminContext';
import { makeCombinationAdminContextValue } from '../test/fixtures/combinationAdmin';

function Probe() {
  const ctx = useCombinationAdminContext();
  return (
    <div data-testid="probe">
      {`crear=${String(ctx.isCreating)}|rows=${ctx.filteredList.length}`}
    </div>
  );
}

describe('CombinationAdminContext (BE #66)', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('lanza si se usa fuera de un CombinationAdminProvider', () => {
    expect(() => render(<Probe />)).toThrow(
      'useCombinationAdminContext debe ser usado dentro de un CombinationAdminProvider'
    );
  });

  it('entrega el value completo (estado de edición y handlers incluidos)', () => {
    const value = makeCombinationAdminContextValue({ isCreating: true });

    render(
      <CombinationAdminProvider value={value}>
        <Probe />
      </CombinationAdminProvider>
    );

    expect(screen.getByTestId('probe').textContent).toBe('crear=true|rows=1');
    expect(typeof value.handleSave).toBe('function');
    expect(typeof value.handleCancel).toBe('function');
    expect(typeof value.handleEditCombination).toBe('function');
  });
});
