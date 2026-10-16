import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FormUserTypeSelect } from './FormUserTypeSelect';

describe('FormUserTypeSelect (BE #66: objeto form único)', () => {
  afterEach(() => cleanup());

  it('lee userType del objeto form', () => {
    render(
      <FormUserTypeSelect
        form={{ userType: 'Premium' }}
        onSelectChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Tipo de Usuario')).toHaveTextContent(
      'Premium',
    );
  });

  it('notifica el cambio con name y value', async () => {
    const onSelectChange = vi.fn();
    render(
      <FormUserTypeSelect
        form={{ userType: 'Común' }}
        onSelectChange={onSelectChange}
      />,
    );

    await userEvent.click(screen.getByLabelText('Tipo de Usuario'));
    await userEvent.click(screen.getByRole('option', { name: 'Premium' }));

    expect(onSelectChange).toHaveBeenCalledWith('userType', 'Premium');
  });
});
